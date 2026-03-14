import { notFound } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import prisma from '@/lib/db'
import { resolveLocale } from '@/i18n'
import { AgentProfileClient } from './AgentProfileClient'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string; agentSlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, agentSlug } = await params
  const office = await prisma.office.findUnique({
    where: { slug },
    select: { id: true, name: true },
  })
  if (!office) return { title: 'Not Found' }

  const agent = await prisma.agentProfile.findFirst({
    where: { officeId: office.id, slug: agentSlug, isPublic: true },
    include: { user: { select: { name: true } } },
  })
  if (!agent) return { title: 'Not Found' }

  return {
    title: `${agent.user.name} | ${office.name}`,
  }
}

export default async function AgentProfilePage({ params }: PageProps) {
  const { slug, agentSlug } = await params

  const office = await prisma.office.findUnique({
    where: { slug },
    select: { id: true, name: true, nameAr: true, whatsapp: true, defaultLanguage: true },
  })
  if (!office) notFound()

  const agent = await prisma.agentProfile.findFirst({
    where: { officeId: office.id, slug: agentSlug, isPublic: true },
    include: {
      user: { select: { name: true, nameAr: true, avatar: true, phone: true, email: true } },
    },
  })
  if (!agent) notFound()

  const cookieStore = await cookies()
  const headerStore = await headers()
  const cookieLocale = cookieStore.get('locale')?.value
  const acceptLang = headerStore.get('accept-language')
  const browserLocale = acceptLang?.startsWith('ar') ? 'ar' : acceptLang?.startsWith('en') ? 'en' : undefined
  const locale = resolveLocale(cookieLocale || browserLocale || office.defaultLanguage)

  // Agent's properties
  const properties = await prisma.property.findMany({
    where: {
      officeId: office.id,
      agentId: agent.userId,
      status: 'PUBLISHED',
      isPrivate: false,
    },
    include: {
      media: {
        where: { type: 'IMAGE' },
        orderBy: { sortOrder: 'asc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 12,
  })

  const serializedAgent = {
    id: agent.id,
    name: locale === 'ar' && agent.user.nameAr ? agent.user.nameAr : agent.user.name,
    photo: agent.photo || agent.user.avatar,
    phone: agent.phone || agent.user.phone,
    whatsapp: agent.whatsapp,
    email: agent.email || agent.user.email,
    bio: locale === 'ar' && agent.bioAr ? agent.bioAr : agent.bio,
    specialties: agent.specialties as string[] | null,
    languages: agent.languages as string[] | null,
  }

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

  return (
    <AgentProfileClient
      officeSlug={slug}
      agent={serializedAgent}
      properties={serializedProperties}
    />
  )
}
