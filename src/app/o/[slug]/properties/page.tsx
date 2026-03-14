import { cookies, headers } from 'next/headers'
import prisma from '@/lib/db'
import { resolveLocale, getDictionary } from '@/i18n'
import { PropertiesPageClient } from './PropertiesPageClient'
import type { Metadata } from 'next'
import type { Prisma } from '@prisma/client'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const office = await prisma.office.findUnique({
    where: { slug },
    select: { name: true, nameAr: true },
  })
  if (!office) return { title: 'Not Found' }

  return {
    title: `Properties | ${office.name}`,
  }
}

export default async function PropertiesPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sp = await searchParams

  const office = await prisma.office.findUnique({
    where: { slug },
    select: { id: true, name: true, nameAr: true, defaultLanguage: true },
  })
  if (!office) return null

  // Resolve locale
  const cookieStore = await cookies()
  const headerStore = await headers()
  const cookieLocale = cookieStore.get('locale')?.value
  const acceptLang = headerStore.get('accept-language')
  const browserLocale = acceptLang?.startsWith('ar') ? 'ar' : acceptLang?.startsWith('en') ? 'en' : undefined
  const locale = resolveLocale(cookieLocale || browserLocale || office.defaultLanguage)

  // Parse search params
  const dealType = (sp.dealType as string) || undefined
  const propertyType = (sp.propertyType as string) || undefined
  const city = (sp.city as string) || undefined
  const district = (sp.district as string) || undefined
  const minPrice = sp.minPrice ? parseInt(sp.minPrice as string) : undefined
  const maxPrice = sp.maxPrice ? parseInt(sp.maxPrice as string) : undefined
  const bedrooms = sp.bedrooms ? parseInt(sp.bedrooms as string) : undefined
  const sort = (sp.sort as string) || 'newest'
  const page = Math.max(1, parseInt((sp.page as string) || '1'))
  const pageSize = 12

  // Build where clause - always filter by officeId
  const where: Prisma.PropertyWhereInput = {
    officeId: office.id,
    status: 'PUBLISHED',
    isPrivate: false,
  }

  if (dealType && ['SALE', 'RENT'].includes(dealType)) {
    where.dealType = dealType as 'SALE' | 'RENT'
  }
  if (propertyType) {
    where.propertyType = propertyType as any
  }
  if (city) {
    where.city = city
  }
  if (district) {
    where.district = district
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {}
    if (minPrice !== undefined) (where.price as any).gte = BigInt(minPrice)
    if (maxPrice !== undefined) (where.price as any).lte = BigInt(maxPrice)
  }
  if (bedrooms !== undefined) {
    where.bedrooms = { gte: bedrooms }
  }

  // Sort
  let orderBy: Prisma.PropertyOrderByWithRelationInput = { createdAt: 'desc' }
  if (sort === 'price_asc') orderBy = { price: 'asc' }
  else if (sort === 'price_desc') orderBy = { price: 'desc' }
  else if (sort === 'area') orderBy = { area: 'desc' }

  // Query
  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        media: {
          where: { type: 'IMAGE' },
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.property.count({ where }),
  ])

  // Get filter options
  const [citiesRaw, districtsRaw] = await Promise.all([
    prisma.property.findMany({
      where: { officeId: office.id, status: 'PUBLISHED', city: { not: null } },
      select: { city: true, cityAr: true },
      distinct: ['city'],
      take: 50,
    }),
    prisma.property.findMany({
      where: {
        officeId: office.id,
        status: 'PUBLISHED',
        district: { not: null },
        ...(city ? { city } : {}),
      },
      select: { district: true, districtAr: true },
      distinct: ['district'],
      take: 50,
    }),
  ])

  const serializedProperties = properties.map((p) => ({
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
    media: p.media.map((m) => ({ url: m.url, alt: m.alt, altAr: m.altAr })),
  }))

  const cities = citiesRaw.map((c) => ({
    value: c.city!,
    label: locale === 'ar' && c.cityAr ? c.cityAr : c.city!,
  }))
  const districts = districtsRaw.map((d) => ({
    value: d.district!,
    label: locale === 'ar' && d.districtAr ? d.districtAr : d.district!,
  }))

  return (
    <PropertiesPageClient
      officeId={office.id}
      officeSlug={slug}
      properties={serializedProperties}
      total={total}
      page={page}
      pageSize={pageSize}
      cities={cities}
      districts={districts}
      currentFilters={{
        dealType: dealType || '',
        propertyType: propertyType || '',
        city: city || '',
        district: district || '',
        minPrice: sp.minPrice as string || '',
        maxPrice: sp.maxPrice as string || '',
        bedrooms: sp.bedrooms as string || '',
        sort,
      }}
    />
  )
}
