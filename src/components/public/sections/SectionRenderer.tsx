'use client'

import type { PageSectionConfig } from '@/types/sections'
import type { PropertyCardData } from '@/components/public/PropertyCard'
import { HeroSection } from './HeroSection'
import { AboutSection } from './AboutSection'
import { ServicesSection } from './ServicesSection'
import { FeaturedPropertiesSection } from './FeaturedPropertiesSection'
import { StatsSection } from './StatsSection'
import { CtaSection } from './CtaSection'
import { TestimonialsSection } from './TestimonialsSection'
import { TeamSection } from './TeamSection'
import { PartnersSection } from './PartnersSection'
import { ContactFormSection } from './ContactFormSection'
import { GallerySection } from './GallerySection'

interface SectionRendererProps {
  sections: PageSectionConfig[]
  officeSlug: string
  officeName: string
  description: string | null
  whatsapp: string | null
  properties: PropertyCardData[]
  stats: { totalProperties: number; totalForSale: number; totalForRent: number }
  cities: { value: string; label: string }[]
}

const sectionComponents: Record<string, React.ComponentType<any>> = {
  hero: HeroSection,
  about: AboutSection,
  services: ServicesSection,
  featured_properties: FeaturedPropertiesSection,
  featured: FeaturedPropertiesSection,
  stats: StatsSection,
  cta: CtaSection,
  testimonials: TestimonialsSection,
  team: TeamSection,
  partners: PartnersSection,
  contact: ContactFormSection,
  gallery: GallerySection,
}

// Sections that provide their own full-width backgrounds
const SELF_BACKGROUND_SECTIONS = new Set(['hero', 'stats', 'cta'])

export function SectionRenderer({
  sections,
  officeSlug,
  officeName,
  description,
  whatsapp,
  properties,
  stats,
  cities,
}: SectionRendererProps) {
  // Deduplicate by type and normalize legacy types
  const seenTypes = new Set<string>()
  const enabledSections = sections
    .filter((s) => s.enabled && s.type !== 'footer')
    .sort((a, b) => a.order - b.order)
    .filter((s) => {
      const normalType = (s.type as string) === 'featured' ? 'featured_properties' : s.type
      if (seenTypes.has(normalType)) return false
      seenTypes.add(normalType)
      return true
    })

  // Track alternation index for sections without built-in backgrounds
  let altIndex = 0

  return (
    <>
      {enabledSections.map((section, index) => {
        const Component = sectionComponents[section.type]
        if (!Component) return null

        const hasSelfBg = SELF_BACKGROUND_SECTIONS.has(section.type)
        const currentAltIndex = hasSelfBg ? -1 : altIndex++

        return (
          <Component
            key={section.id || `section-${section.type}-${index}`}
            config={section}
            officeSlug={officeSlug}
            officeName={officeName}
            description={description}
            whatsapp={whatsapp}
            properties={properties}
            stats={stats}
            cities={cities}
          />
        )
      })}
    </>
  )
}
