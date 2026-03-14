import { notFound } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import prisma from '@/lib/db'
import { resolveLocale, getDictionary } from '@/i18n'
import { AboutPageClient } from './AboutPageClient'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const office = await prisma.office.findUnique({
    where: { slug },
    select: { name: true },
  })
  if (!office) return { title: 'Not Found' }
  return { title: `About | ${office.name}` }
}

export default async function AboutPage({ params }: PageProps) {
  const { slug } = await params

  const office = await prisma.office.findUnique({
    where: { slug },
    select: {
      id: true, name: true, nameAr: true, slug: true,
      description: true, descriptionAr: true,
      phone: true, email: true, whatsapp: true,
      address: true, addressAr: true,
      city: true, cityAr: true,
      district: true, districtAr: true,
      falLicenseNo: true, website: true,
      socialLinks: true, defaultLanguage: true,
      pageVisibility: true,
    },
  })
  if (!office) return null

  // Check page visibility
  const visibility = office.pageVisibility as Record<string, boolean> | null
  if (visibility && visibility.about === false) {
    notFound()
  }

  // Resolve locale
  const cookieStore = await cookies()
  const headerStore = await headers()
  const cookieLocale = cookieStore.get('locale')?.value
  const acceptLang = headerStore.get('accept-language')
  const browserLocale = acceptLang?.startsWith('ar') ? 'ar' : acceptLang?.startsWith('en') ? 'en' : undefined
  const locale = resolveLocale(cookieLocale || browserLocale || office.defaultLanguage)

  // Stats
  const [totalProperties, totalAgents] = await Promise.all([
    prisma.property.count({ where: { officeId: office.id, status: 'PUBLISHED' } }),
    prisma.membership.count({ where: { officeId: office.id, isActive: true } }),
  ])

  // Agents
  const agents = await prisma.agentProfile.findMany({
    where: { officeId: office.id, isPublic: true },
    include: {
      user: { select: { name: true, nameAr: true, avatar: true } },
    },
    take: 12,
  })

  const serializedAgents = agents.map((a) => ({
    id: a.id,
    name: a.user.name,
    nameAr: a.user.nameAr,
    photo: a.photo || a.user.avatar,
    slug: a.slug,
    specialties: a.specialties as string[] | null,
  }))

  return (
    <AboutPageClient
      officeSlug={slug}
      officeName={locale === 'ar' && office.nameAr ? office.nameAr : office.name}
      description={locale === 'ar' && office.descriptionAr ? office.descriptionAr : office.description}
      phone={office.phone}
      email={office.email}
      whatsapp={office.whatsapp}
      address={locale === 'ar' && office.addressAr ? office.addressAr : office.address}
      city={locale === 'ar' && office.cityAr ? office.cityAr : office.city}
      falLicenseNo={office.falLicenseNo}
      website={office.website}
      socialLinks={office.socialLinks as Record<string, string> | null}
      stats={{ totalProperties, totalAgents }}
      agents={serializedAgents}
    />
  )
}
