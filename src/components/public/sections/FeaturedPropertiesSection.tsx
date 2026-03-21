'use client'

import Link from 'next/link'
import { usePublicOffice } from '@/components/public/PublicOfficeContext'
import { useDirection } from '@/components/shared/DirectionProvider'
import { PropertyCard, type PropertyCardData } from '@/components/public/PropertyCard'
import { ArrowRight, ArrowLeft, Building2 } from 'lucide-react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import type { PageSectionConfig } from '@/types/sections'

interface Props {
  config: PageSectionConfig
  officeSlug: string
  properties: PropertyCardData[]
  stats: { totalProperties: number }
}

export function FeaturedPropertiesSection({ config, officeSlug, properties, stats }: Props) {
  const { dict } = usePublicOffice()
  const { isRtl } = useDirection()
  const ref = useScrollAnimation<HTMLElement>()
  const Arrow = isRtl ? ArrowLeft : ArrowRight

  if (!properties.length) return null

  const title = config.content.titleAr || config.content.title || `${dict.common.featured} ${dict.nav.properties}`

  return (
    <section
      ref={ref}
      className="animate-on-scroll py-20 sm:py-28"
      style={{ backgroundColor: 'var(--theme-surface)' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 12%, transparent)', color: 'var(--theme-accent)' }}
          >
            <Building2 className="h-3.5 w-3.5" />
            {stats.totalProperties} {dict.property.resultsFound}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--theme-primary)' }}>
            {title}
          </h2>
          <div
            className="mx-auto h-1 w-16 rounded-full"
            style={{ backgroundColor: 'var(--theme-accent)' }}
          />
        </div>

        {/* Mobile: horizontal scroll, Desktop: grid */}
        <div className="hidden lg:grid grid-cols-4 gap-6 mb-10">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} officeSlug={officeSlug} />
          ))}
        </div>
        <div className="lg:hidden flex gap-4 overflow-x-auto snap-x pb-4 -mx-4 px-4">
          {properties.map((property) => (
            <div key={property.id} className="snap-center shrink-0 w-[280px] sm:w-[320px]">
              <PropertyCard property={property} officeSlug={officeSlug} />
            </div>
          ))}
        </div>

        {/* Show More Button */}
        <div className="text-center mt-10">
          <Link
            href={`/${officeSlug}/properties`}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 border-2"
            style={{
              borderColor: 'var(--theme-accent)',
              color: 'var(--theme-accent)',
            }}
          >
            {dict.nav.viewAll} {dict.nav.properties}
            <Arrow className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
