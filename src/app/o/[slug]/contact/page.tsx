import { notFound } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import prisma from '@/lib/db'
import { resolveLocale, getDictionary } from '@/i18n'
import { ContactPageClient } from './ContactPageClient'
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
  return { title: `Contact | ${office.name}` }
}

export default async function ContactPage({ params }: PageProps) {
  const { slug } = await params

  const office = await prisma.office.findUnique({
    where: { slug },
    select: {
      id: true, name: true, nameAr: true,
      phone: true, email: true, whatsapp: true,
      address: true, addressAr: true,
      city: true, cityAr: true,
      lat: true, lng: true,
      socialLinks: true, defaultLanguage: true,
      pageVisibility: true,
    },
  })
  if (!office) return null

  // Check page visibility
  const visibility = office.pageVisibility as Record<string, boolean> | null
  if (visibility && visibility.contact === false) {
    notFound()
  }

  const cookieStore = await cookies()
  const headerStore = await headers()
  const cookieLocale = cookieStore.get('locale')?.value
  const acceptLang = headerStore.get('accept-language')
  const browserLocale = acceptLang?.startsWith('ar') ? 'ar' : acceptLang?.startsWith('en') ? 'en' : undefined
  const locale = resolveLocale(cookieLocale || browserLocale || office.defaultLanguage)

  return (
    <ContactPageClient
      officeId={office.id}
      officeName={locale === 'ar' && office.nameAr ? office.nameAr : office.name}
      phone={office.phone}
      email={office.email}
      whatsapp={office.whatsapp}
      address={locale === 'ar' && office.addressAr ? office.addressAr : office.address}
      city={locale === 'ar' && office.cityAr ? office.cityAr : office.city}
      lat={office.lat}
      lng={office.lng}
      socialLinks={office.socialLinks as Record<string, string> | null}
    />
  )
}
