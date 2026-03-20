import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'
import { getThemeForOffice } from '@/lib/theme'
import { resolveLocale, getDictionary, type Locale } from '@/i18n'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { DirectionProvider } from '@/components/shared/DirectionProvider'
import { PublicOfficeProvider } from '@/components/public/PublicOfficeContext'
import { PublicHeader } from '@/components/public/PublicHeader'
import { PublicFooter, type FooterConfig } from '@/components/public/PublicFooter'
import { getDefaultSections } from '@/lib/default-sections'
import type { PageSectionConfig } from '@/types/sections'
import { WhatsAppButton } from '@/components/public/WhatsAppButton'
import { VisitorAuthProvider } from '@/components/public/VisitorAuthContext'
import { VisitorAuthModal } from '@/components/public/VisitorAuthModal'
import type { Metadata } from 'next'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

async function getOffice(slug: string) {
  const office = await prisma.office.findUnique({
    where: { slug },
    include: { themeSettings: true },
  })
  return office
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const office = await getOffice(slug)

  if (!office || !office.isActive || !office.isApproved) {
    return { title: 'Not Found' }
  }

  return {
    title: {
      default: office.seoTitle || office.name,
      template: `%s | ${office.name}`,
    },
    description: office.seoDescription || office.description || undefined,
    openGraph: {
      title: office.seoTitle || office.name,
      description: office.seoDescription || office.description || undefined,
      images: office.ogImage ? [office.ogImage] : undefined,
    },
  }
}

export default async function PublicOfficeLayout({ children, params }: LayoutProps) {
  const { slug } = await params
  const office = await getOffice(slug)

  if (!office || !office.isActive || !office.isApproved) {
    notFound()
  }

  const theme = getThemeForOffice(office.themeSettings)

  // Force Arabic locale for all office websites
  const locale: Locale = 'ar'

  const dict = await getDictionary(locale)

  // Extract footer config from pageSections
  const pageSections: PageSectionConfig[] =
    office.pageSections && Array.isArray(office.pageSections) && (office.pageSections as any[]).length > 0
      ? (office.pageSections as unknown as PageSectionConfig[])
      : getDefaultSections()
  const footerSection = pageSections.find((s) => s.type === 'footer')
  const footerContent = footerSection?.content as Record<string, any> | undefined
  const footerConfig: FooterConfig | undefined = footerSection
    ? {
        showLogo: footerContent?.showLogo as boolean | undefined,
        showNavLinks: footerContent?.showNavLinks as boolean | undefined,
        showContactInfo: footerContent?.showContactInfo as boolean | undefined,
        showSocialLinks: footerContent?.showSocialLinks as boolean | undefined,
        copyrightText: footerContent?.title,
        copyrightTextAr: footerContent?.titleAr,
      }
    : undefined

  // Extract public-safe office data
  const publicOffice = {
    id: office.id,
    name: office.name,
    nameAr: office.nameAr,
    slug: office.slug,
    logo: office.logo,
    description: office.description,
    descriptionAr: office.descriptionAr,
    falLicenseNo: office.falLicenseNo,
    phone: office.phone,
    email: office.email,
    whatsapp: office.whatsapp,
    website: office.website,
    address: office.address,
    addressAr: office.addressAr,
    city: office.city,
    cityAr: office.cityAr,
    district: office.district,
    districtAr: office.districtAr,
    lat: office.lat,
    lng: office.lng,
    socialLinks: office.socialLinks as Record<string, string> | null,
    defaultLanguage: office.defaultLanguage,
    pageVisibility: office.pageVisibility as { about?: boolean; contact?: boolean; agents?: boolean; blog?: boolean } | null,
  }

  return (
    <ThemeProvider theme={theme}>
      <DirectionProvider locale={locale}>
        <PublicOfficeProvider office={publicOffice} dict={dict}>
          <VisitorAuthProvider>
            <div
              className="min-h-screen flex flex-col"
              style={{
                backgroundColor: 'var(--theme-background, #FAFAF7)',
                color: 'var(--theme-text, #2D3748)',
                fontFamily: locale === 'ar'
                  ? 'var(--theme-font-family-ar, Noto Sans Arabic, sans-serif)'
                  : 'var(--theme-font-family, Inter, sans-serif)',
              }}
            >
              <PublicHeader />
              <main className="flex-1">{children}</main>
              {(!footerSection || footerSection.enabled) && (
                <PublicFooter footerConfig={footerConfig} />
              )}
              {office.whatsapp && <WhatsAppButton />}
              <VisitorAuthModal />
            </div>
          </VisitorAuthProvider>
        </PublicOfficeProvider>
      </DirectionProvider>
    </ThemeProvider>
  )
}
