'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Landmark, Key, HandshakeIcon, Lightbulb, Building2, FileText, Shield, TrendingUp } from 'lucide-react'
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

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
      delay: i * 0.1,
    },
  }),
}

export function ServicesSection({ config }: Props) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })

  const title = config.content.titleAr || config.content.title || 'خدماتنا'
  const subtitle = config.content.subtitleAr || config.content.subtitle || 'نقدم مجموعة شاملة من الخدمات العقارية'

  const hasCustomItems = config.content.items && config.content.items.length > 0
  const customItems = config.content.items || []

  return (
    <section
      ref={ref}
      className="py-20 md:py-28"
      style={{ backgroundColor: 'var(--theme-background)' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{ color: 'var(--theme-text)' }}
          >
            {title}
          </h2>
          <div
            className="mx-auto h-[3px] w-10 rounded-full mb-4"
            style={{ backgroundColor: 'var(--theme-accent)' }}
          />
          <p
            className="text-sm max-w-md mx-auto"
            style={{ color: 'var(--theme-muted)' }}
          >
            {subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {hasCustomItems
            ? customItems.map((item, i) => {
                const fallback = defaultServices[i % defaultServices.length]
                return (
                  <ServiceCard
                    key={i}
                    index={i}
                    isInView={isInView}
                    icon={ICON_MAP[item.icon || ''] || fallback?.icon || Landmark}
                    title={item.titleAr || fallback?.titleAr || item.title || fallback?.titleEn || ''}
                    description={item.descriptionAr || fallback?.descAr || item.description || fallback?.descEn || ''}
                  />
                )
              })
            : defaultServices.map((service, i) => (
                <ServiceCard
                  key={i}
                  index={i}
                  isInView={isInView}
                  icon={service.icon}
                  title={service.titleAr || service.titleEn}
                  description={service.descAr || service.descEn}
                />
              ))
          }
        </div>
      </div>
    </section>
  )
}

function ServiceCard({
  icon: Icon,
  title,
  description,
  index,
  isInView,
}: {
  icon: LucideIcon
  title: string
  description: string
  index: number
  isInView: boolean
}) {
  return (
    <motion.div
      className="group relative rounded-2xl p-7 text-center transition-shadow duration-300 hover:shadow-xl overflow-hidden"
      style={{
        backgroundColor: 'var(--theme-surface)',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'var(--theme-border)',
      }}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      custom={index}
      whileHover={{ y: -4 }}
    >
      <div
        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 12%, var(--theme-surface))' }}
      >
        <Icon className="h-7 w-7" style={{ color: 'var(--theme-accent)' }} />
      </div>
      <h3
        className="text-base font-bold mb-2"
        style={{ color: 'var(--theme-text)' }}
      >
        {title}
      </h3>
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--theme-muted)' }}
      >
        {description}
      </p>
      <div
        className="absolute bottom-0 inset-x-0 h-[3px] origin-center scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
        style={{ backgroundColor: 'var(--theme-accent)' }}
      />
    </motion.div>
  )
}
