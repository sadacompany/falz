'use client'

import { useDirection } from '@/components/shared/DirectionProvider'
import { Landmark, Key, HandshakeIcon, Lightbulb, Building2, FileText, Shield, TrendingUp } from 'lucide-react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import type { PageSectionConfig, SectionItem } from '@/types/sections'
import type { LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  landmark: Landmark,
  key: Key,
  handshake: HandshakeIcon,
  lightbulb: Lightbulb,
  building: Building2,
  document: FileText,
  shield: Shield,
  trending: TrendingUp,
}

const defaultServices: { icon: LucideIcon; titleAr: string; titleEn: string; descAr: string; descEn: string }[] = [
  { icon: Landmark, titleAr: 'بيع العقارات', titleEn: 'Property Sales', descAr: 'نساعدك في بيع عقارك بأفضل سعر وأسرع وقت ممكن مع فريق من الخبراء المتخصصين', descEn: 'We help you sell your property at the best price in the shortest time with expert agents' },
  { icon: Key, titleAr: 'شراء العقارات', titleEn: 'Property Purchase', descAr: 'نجد لك العقار المثالي الذي يناسب احتياجاتك وميزانيتك في أفضل المواقع', descEn: 'We find the perfect property that suits your needs and budget in prime locations' },
  { icon: HandshakeIcon, titleAr: 'تأجير العقارات', titleEn: 'Property Rental', descAr: 'خيارات تأجير متنوعة سكنية وتجارية بأسعار تنافسية وشروط مرنة', descEn: 'Diverse residential and commercial rental options at competitive prices' },
  { icon: Lightbulb, titleAr: 'استشارات عقارية', titleEn: 'Real Estate Consulting', descAr: 'استشارات متخصصة لاتخاذ أفضل القرارات العقارية الاستثمارية والسكنية', descEn: 'Expert consulting for the best investment and residential real estate decisions' },
]

interface Props {
  config: PageSectionConfig
}

export function ServicesSection({ config }: Props) {
  const { locale } = useDirection()
  const sectionRef = useScrollAnimation<HTMLElement>()
  const gridRef = useScrollAnimation<HTMLDivElement>()

  const title = (locale === 'ar' ? config.content.titleAr : config.content.title) || (locale === 'ar' ? 'خدماتنا' : 'Our Services')
  const subtitle = (locale === 'ar' ? config.content.subtitleAr : config.content.subtitle) || (locale === 'ar' ? 'نقدم مجموعة شاملة من الخدمات العقارية' : 'Comprehensive real estate services')

  // Use custom items if provided, otherwise fall back to defaults
  const hasCustomItems = config.content.items && config.content.items.length > 0
  const customItems = config.content.items || []

  return (
    <section
      ref={sectionRef}
      className="animate-on-scroll py-20 sm:py-28"
      style={{ backgroundColor: 'var(--theme-background)' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--theme-primary)' }}>
            {title}
          </h2>
          <div
            className="mx-auto h-1 w-16 rounded-full mb-4"
            style={{ backgroundColor: 'var(--theme-accent)' }}
          />
          <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--theme-muted)' }}>
            {subtitle}
          </p>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-on-scroll-children"
        >
          {hasCustomItems
            ? customItems.map((item, i) => {
                const fallback = defaultServices[i % defaultServices.length]
                return (
                  <ServiceCard
                    key={i}
                    icon={ICON_MAP[item.icon || ''] || fallback?.icon || Landmark}
                    title={(locale === 'ar' ? (item.titleAr || fallback?.titleAr) : (item.title || fallback?.titleEn)) || ''}
                    description={(locale === 'ar' ? (item.descriptionAr || fallback?.descAr) : (item.description || fallback?.descEn)) || ''}
                  />
                )
              })
            : defaultServices.map((service, i) => (
                <ServiceCard
                  key={i}
                  icon={service.icon}
                  title={locale === 'ar' ? service.titleAr : service.titleEn}
                  description={locale === 'ar' ? service.descAr : service.descEn}
                />
              ))
          }
        </div>
      </div>
    </section>
  )
}

function ServiceCard({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div
      className="group relative rounded-2xl p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ backgroundColor: 'var(--theme-surface)' }}
    >
      <div
        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110"
        style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 15%, var(--theme-surface))' }}
      >
        <Icon className="h-8 w-8" style={{ color: 'var(--theme-accent)' }} />
      </div>
      <h3 className="text-base font-bold mb-2" style={{ color: 'var(--theme-primary)' }}>
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--theme-muted)' }}>
        {description}
      </p>
      <div
        className="absolute bottom-0 inset-x-4 h-0.5 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ backgroundColor: 'var(--theme-accent)' }}
      />
    </div>
  )
}
