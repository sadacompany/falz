import { notFound } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import prisma from '@/lib/db'
import { resolveLocale, getDictionary } from '@/i18n'
import { PropertyDetailClient } from './PropertyDetailClient'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string; propertySlug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, propertySlug } = await params

  const office = await prisma.office.findUnique({
    where: { slug },
    select: { id: true, name: true },
  })
  if (!office) return { title: 'Not Found' }

  const property = await prisma.property.findFirst({
    where: { officeId: office.id, slug: propertySlug },
    select: { title: true, titleAr: true, seoTitle: true, seoDescription: true, ogImage: true, description: true },
  })
  if (!property) return { title: 'Not Found' }

  return {
    title: property.seoTitle || property.title,
    description: property.seoDescription || property.description?.slice(0, 160) || undefined,
    openGraph: {
      title: property.seoTitle || property.title,
      description: property.seoDescription || property.description?.slice(0, 160) || undefined,
      images: property.ogImage ? [property.ogImage] : undefined,
    },
  }
}

export default async function PropertyDetailPage({ params, searchParams }: PageProps) {
  const { slug, propertySlug } = await params
  const sp = await searchParams

  const office = await prisma.office.findUnique({
    where: { slug },
    select: {
      id: true, name: true, nameAr: true, slug: true,
      whatsapp: true, phone: true, defaultLanguage: true,
    },
  })
  if (!office) notFound()

  const property = await prisma.property.findFirst({
    where: { officeId: office.id, slug: propertySlug },
    include: {
      media: { orderBy: { sortOrder: 'asc' } },
    },
  })
  if (!property) notFound()

  // Check visibility
  if (property.isPrivate) {
    const previewToken = sp.previewToken as string
    if (!previewToken || previewToken !== property.previewToken) {
      notFound()
    }
  }

  if (property.status !== 'PUBLISHED' && !property.isPrivate) {
    notFound()
  }

  // Resolve locale
  const cookieStore = await cookies()
  const headerStore = await headers()
  const cookieLocale = cookieStore.get('locale')?.value
  const acceptLang = headerStore.get('accept-language')
  const browserLocale = acceptLang?.startsWith('ar') ? 'ar' : acceptLang?.startsWith('en') ? 'en' : undefined
  const locale = resolveLocale(cookieLocale || browserLocale || office.defaultLanguage)

  // Fetch agent profile if assigned
  let agent = null
  if (property.agentId) {
    const agentProfile = await prisma.agentProfile.findFirst({
      where: { userId: property.agentId, officeId: office.id },
      include: { user: { select: { name: true, nameAr: true, email: true, phone: true, avatar: true } } },
    })
    if (agentProfile) {
      agent = {
        name: agentProfile.user.name,
        nameAr: agentProfile.user.nameAr,
        photo: agentProfile.photo || agentProfile.user.avatar,
        phone: agentProfile.phone || agentProfile.user.phone,
        whatsapp: agentProfile.whatsapp,
        email: agentProfile.email || agentProfile.user.email,
        slug: agentProfile.slug,
      }
    }
  }

  // Similar properties
  const similarProperties = await prisma.property.findMany({
    where: {
      officeId: office.id,
      status: 'PUBLISHED',
      isPrivate: false,
      id: { not: property.id },
      OR: [
        { propertyType: property.propertyType },
        { dealType: property.dealType },
        { city: property.city },
      ],
    },
    include: {
      media: {
        where: { type: 'IMAGE' },
        orderBy: { sortOrder: 'asc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
  })

  // Serialize
  const serializedProperty = {
    id: property.id,
    slug: property.slug,
    title: property.title,
    titleAr: property.titleAr,
    description: property.description,
    descriptionAr: property.descriptionAr,
    price: property.price.toString(),
    currency: property.currency,
    dealType: property.dealType,
    propertyType: property.propertyType,
    city: property.city,
    cityAr: property.cityAr,
    district: property.district,
    districtAr: property.districtAr,
    street: property.street,
    streetAr: property.streetAr,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.area,
    amenities: property.amenities as string[] | null,
    isFeatured: property.isFeatured,
    availability: property.availability,
    status: property.status,
    videoUrl: property.videoUrl,
    tour360Url: property.tour360Url,
    lat: property.lat,
    lng: property.lng,
    publishedAt: property.publishedAt?.toISOString() || null,
    updatedAt: property.updatedAt.toISOString(),
    media: property.media.map((m) => ({
      url: m.url,
      alt: m.alt,
      altAr: m.altAr,
      type: m.type,
    })),
  }

  const serializedSimilar = similarProperties.map((p) => ({
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

  return (
    <PropertyDetailClient
      officeId={office.id}
      officeSlug={slug}
      officeWhatsapp={office.whatsapp}
      officePhone={office.phone}
      property={serializedProperty}
      agent={agent}
      similarProperties={serializedSimilar}
    />
  )
}
