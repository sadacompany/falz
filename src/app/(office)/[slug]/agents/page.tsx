import { notFound } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import prisma from '@/lib/db'
import { resolveLocale, getDictionary } from '@/i18n'
import { AgentsPageClient } from './AgentsPageClient'
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
  return { title: `Agents | ${office.name}` }
}

export default async function AgentsPage({ params }: PageProps) {
  const { slug } = await params

  const office = await prisma.office.findUnique({
    where: { slug },
    select: { id: true, name: true, nameAr: true, defaultLanguage: true, pageVisibility: true },
  })
  if (!office) return null

  // Check page visibility
  const visibility = office.pageVisibility as Record<string, boolean> | null
  if (visibility && visibility.agents === false) {
    notFound()
  }

  const cookieStore = await cookies()
  const headerStore = await headers()
  const cookieLocale = cookieStore.get('locale')?.value
  const acceptLang = headerStore.get('accept-language')
  const browserLocale = acceptLang?.startsWith('ar') ? 'ar' : acceptLang?.startsWith('en') ? 'en' : undefined
  const locale = resolveLocale(cookieLocale || browserLocale || office.defaultLanguage)

  const agents = await prisma.agentProfile.findMany({
    where: { officeId: office.id, isPublic: true },
    include: {
      user: { select: { name: true, nameAr: true, avatar: true, phone: true, email: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  const serializedAgents = agents.map((a) => ({
    id: a.id,
    name: locale === 'ar' && a.user.nameAr ? a.user.nameAr : a.user.name,
    photo: a.photo || a.user.avatar,
    phone: a.phone || a.user.phone,
    whatsapp: a.whatsapp,
    email: a.email || a.user.email,
    bio: locale === 'ar' && a.bioAr ? a.bioAr : a.bio,
    slug: a.slug,
    specialties: a.specialties as string[] | null,
    languages: a.languages as string[] | null,
  }))

  return (
    <AgentsPageClient
      officeSlug={slug}
      agents={serializedAgents}
    />
  )
}
