'use client'

import { useEffect, useState, useCallback } from 'react'
import { SectionRenderer } from '@/components/public/sections/SectionRenderer'
import { PreviewModeListener } from '@/components/public/PreviewModeListener'
import { getDefaultSections } from '@/lib/default-sections'
import { themeToCSS, type ThemeConfig } from '@/lib/theme'
import type { PageSectionConfig } from '@/types/sections'
import type { PropertyCardData } from '@/components/public/PropertyCard'

interface HomePageClientProps {
  officeId: string
  officeSlug: string
  officeName: string
  description: string | null
  whatsapp: string | null
  properties: PropertyCardData[]
  stats: { totalProperties: number; totalForSale: number; totalForRent: number }
  cities: { value: string; label: string }[]
  pageSections?: PageSectionConfig[] | null
  isPreview?: boolean
}

export function HomePageClient({
  officeId,
  officeSlug,
  officeName,
  description,
  whatsapp,
  properties,
  stats,
  cities,
  pageSections,
  isPreview = false,
}: HomePageClientProps) {
  // Preview mode: maintain live section state from editor postMessage
  const [previewSections, setPreviewSections] = useState<PageSectionConfig[] | null>(null)
  const [previewTheme, setPreviewTheme] = useState<ThemeConfig | null>(null)

  const handlePreviewUpdate = useCallback((sections: PageSectionConfig[]) => {
    setPreviewSections(sections)
  }, [])

  const handleThemeUpdate = useCallback((theme: ThemeConfig) => {
    setPreviewTheme(theme)
  }, [])

  // Track page_view (skip in preview mode)
  useEffect(() => {
    if (isPreview) return
    fetch('/api/public/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        officeId,
        eventType: 'page_view',
        page: `/${officeSlug}`,
        referrer: document.referrer || null,
        visitorId: getVisitorId(),
      }),
    }).catch(() => {})
  }, [officeId, officeSlug, isPreview])

  // Always use SectionRenderer — fall back to getDefaultSections()
  const activeSections = previewSections
    || (pageSections && pageSections.length > 0 ? pageSections : null)
    || getDefaultSections()

  return (
    <div>
      {isPreview && (
        <>
          <PreviewModeListener onSectionsUpdate={handlePreviewUpdate} onThemeUpdate={handleThemeUpdate} />
          {previewTheme && (
            <style dangerouslySetInnerHTML={{ __html: `:root { ${themeToCSS(previewTheme)} }` }} />
          )}
        </>
      )}
      <SectionRenderer
        sections={activeSections}
        officeSlug={officeSlug}
        officeName={officeName}
        description={description}
        whatsapp={whatsapp}
        properties={properties}
        stats={stats}
        cities={cities}
      />
    </div>
  )
}

function getVisitorId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('falz_visitor_id')
  if (!id) {
    id = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem('falz_visitor_id', id)
  }
  return id
}
