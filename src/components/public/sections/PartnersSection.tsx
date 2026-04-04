'use client'

import type { PageSectionConfig } from '@/types/sections'

interface Props {
  config: PageSectionConfig
}

export function PartnersSection({ config }: Props) {
  const title = config.content.titleAr || config.content.title || 'شركاؤنا'
  const items = config.content.items || []

  if (!items.length) return null

  const logos = [...items, ...items]

  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: 'var(--theme-background)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{ color: 'var(--theme-primary)' }}
          >
            {title}
          </h2>
          <div
            className="mx-auto h-1 w-16 rounded-full"
            style={{ backgroundColor: 'var(--theme-accent)' }}
          />
        </div>
      </div>

      <div className="overflow-hidden group">
        <div
          className="animate-marquee flex items-center gap-16"
          style={{ width: 'max-content' }}
        >
          {logos.map((partner, i) => {
            const name = partner.nameAr || partner.name || ''
            const logo = partner.logoUrl
            const url = partner.url

            const content = logo ? (
              <img
                src={logo}
                alt={name}
                className="h-12 w-auto object-contain transition-all duration-300"
                style={{ filter: 'grayscale(100%)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'grayscale(0%)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'grayscale(100%)'
                }}
              />
            ) : (
              <div
                className="h-12 px-8 flex items-center justify-center rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-300"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  color: 'var(--theme-muted)',
                  borderWidth: '1px',
                  borderColor: 'var(--theme-border)',
                }}
              >
                {name}
              </div>
            )

            if (url) {
              return (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex items-center justify-center px-4"
                >
                  {content}
                </a>
              )
            }

            return (
              <div key={i} className="shrink-0 flex items-center justify-center px-4">
                {content}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
