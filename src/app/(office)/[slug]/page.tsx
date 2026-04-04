import { cookies, headers } from 'next/headers'
import Link from 'next/link'
import prisma from '@/lib/db'
import { resolveLocale, getDictionary } from '@/i18n'
import { formatPrice } from '@/lib/utils'
import { HomePageClient } from './HomePageClient'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getOfficeData(slug: string) {
  const office = await prisma.office.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      nameAr: true,
      slug: true,
      description: true,
      descriptionAr: true,
      seoTitle: true,
      seoTitleAr: true,
      seoDescription: true,
      seoDescriptionAr: true,
      ogImage: true,
      whatsapp: true,
      defaultLanguage: true,
      pageSections: true,
    },
  })
  return office
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const office = await getOfficeData(slug)
  if (!office) return { title: 'Not Found' }

  return {
    title: office.seoTitle || office.name,
    description: office.seoDescription || office.description || undefined,
  }
}

export default async function HomePage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const isPreview = resolvedSearchParams?.preview === '1'

  let office
  try {
    office = await getOfficeData(slug)
  } catch (err) {
    console.error(`[HomePage] Failed to fetch office "${slug}":`, err)
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8 text-center">
        <div>
          <h1 className="text-2xl font-bold text-[#3B2F08]">حدث خطأ</h1>
          <p className="mt-2 text-[#7A6C4F]">تعذر تحميل بيانات الموقع. يرجى المحاولة لاحقاً.</p>
        </div>
      </div>
    )
  }
  if (!office) return null

  // Resolve locale
  const cookieStore = await cookies()
  const headerStore = await headers()
  const cookieLocale = cookieStore.get('locale')?.value
  const acceptLang = headerStore.get('accept-language')
  const browserLocale = acceptLang?.startsWith('ar') ? 'ar' : acceptLang?.startsWith('en') ? 'en' : undefined
  const locale = resolveLocale(cookieLocale || browserLocale || office.defaultLanguage)
  const dict = await getDictionary(locale)

  const officeName = locale === 'ar' && office.nameAr ? office.nameAr : office.name
  const description = locale === 'ar' && office.descriptionAr ? office.descriptionAr : office.description

  // Fetch featured properties
  let displayProperties: any[] = []
  let totalProperties = 0
  let totalForSale = 0
  let totalForRent = 0
  let citiesRaw: { city: string | null; cityAr: string | null }[] = []

  try {
    const featuredProperties = await prisma.property.findMany({
      where: {
        officeId: office.id,
        status: 'PUBLISHED',
        isFeatured: true,
      },
      include: {
        media: {
          where: { type: 'IMAGE' },
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
    })

    displayProperties = featuredProperties
    if (displayProperties.length < 4) {
      const moreProperties = await prisma.property.findMany({
        where: {
          officeId: office.id,
          status: 'PUBLISHED',
          id: { notIn: displayProperties.map((p) => p.id) },
        },
        include: {
          media: {
            where: { type: 'IMAGE' },
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 4 - displayProperties.length,
      })
      displayProperties = [...displayProperties, ...moreProperties]
    }

    ;[totalProperties, totalForSale, totalForRent] = await Promise.all([
      prisma.property.count({ where: { officeId: office.id, status: 'PUBLISHED' } }),
      prisma.property.count({ where: { officeId: office.id, status: 'PUBLISHED', dealType: 'SALE' } }),
      prisma.property.count({ where: { officeId: office.id, status: 'PUBLISHED', dealType: 'RENT' } }),
    ])

    citiesRaw = await prisma.property.findMany({
      where: { officeId: office.id, status: 'PUBLISHED', city: { not: null } },
      select: { city: true, cityAr: true },
      distinct: ['city'],
      take: 20,
    })
  } catch (err) {
    console.error(`[HomePage] Failed to fetch properties for "${slug}":`, err)
  }

  // Serialize properties for client component
  const serializedProperties = displayProperties.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    titleAr: p.titleAr,
    price: p.price.toString(),
    currency: p.currency,
    dealType: p.dealType,
    propertyType: p.propertyType,
    city: p.city,
    cityAr: p.cityAr,
    district: p.district,
    districtAr: p.districtAr,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area: p.area,
    isFeatured: p.isFeatured,
    availability: p.availability,
    media: (p.media || []).map((m: any) => ({ url: m.url, alt: m.alt, altAr: m.altAr })),
  }))

  const cities = citiesRaw.map((c) => ({
    value: c.city!,
    label: locale === 'ar' && c.cityAr ? c.cityAr : c.city!,
  }))

  return (
    <HomePageClient
      officeId={office.id}
      officeSlug={slug}
      officeName={officeName}
      description={description}
      whatsapp={office.whatsapp}
      properties={serializedProperties}
      stats={{ totalProperties, totalForSale, totalForRent }}
      cities={cities}
      pageSections={office.pageSections as any[] | null}
      isPreview={isPreview}
    />
  )
}
