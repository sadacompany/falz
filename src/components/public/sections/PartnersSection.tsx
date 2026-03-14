'use client'

import { useDirection } from '@/components/shared/DirectionProvider'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import type { PageSectionConfig } from '@/types/sections'

interface Props {
  config: PageSectionConfig
}

export function PartnersSection({ config }: Props) {
  const { locale } = useDirection()
  const ref = useScrollAnimation<HTMLElement>()

  const title = (locale === 'ar' ? config.content.titleAr : config.content.title) || (locale === 'ar' ? 'شركاؤنا' : 'Our Partners')
  const items = config.content.items || []

  if (!items.length) return null

  const useMarquee = items.length >= 5

  return (
    <section
      ref={ref}
      className="animate-on-scroll py-20 sm:py-28"
      style={{ backgroundColor: 'var(--theme-background)' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--theme-primary)' }}>
            {title}
          </h2>
          <div
            className="mx-auto h-1 w-16 rounded-full"
            style={{ backgroundColor: 'var(--theme-accent)' }}
          />
        </div>

        {/* Logo Strip */}
        {useMarquee ? (
          <div className="overflow-hidden">
            <div className="animate-marquee flex items-center gap-12" style={{ width: 'max-content' }}>
              {/* Duplicate for seamless loop */}
              {[...items, ...items].map((partner, i) => (
                <PartnerLogo key={i} partner={partner} locale={locale} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {items.map((partner, i) => (
              <PartnerLogo key={i} partner={partner} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function PartnerLogo({ partner, locale }: { partner: any; locale: string }) {
  const name = (locale === 'ar' ? partner.nameAr : partner.name) || ''
  const logo = partner.logoUrl
  const url = partner.url

  const content = logo ? (
    <img
      src={logo}
      alt={name}
      className="h-12 sm:h-16 max-w-[140px] object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
    />
  ) : (
    <div
      className="h-12 sm:h-16 px-6 flex items-center justify-center rounded-xl text-sm font-semibold grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
      style={{ backgroundColor: 'var(--theme-surface)', color: 'var(--theme-muted)' }}
    >
      {name}
    </div>
  )

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="shrink-0">
        {content}
      </a>
    )
  }

  return <div className="shrink-0">{content}</div>
}
