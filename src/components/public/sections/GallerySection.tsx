'use client'

import { useState } from 'react'
import { useDirection } from '@/components/shared/DirectionProvider'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import type { PageSectionConfig } from '@/types/sections'

interface Props {
  config: PageSectionConfig
}

export function GallerySection({ config }: Props) {
  const { locale, isRtl } = useDirection()
  const ref = useScrollAnimation<HTMLElement>()
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  const title = (locale === 'ar' ? config.content.titleAr : config.content.title) || (locale === 'ar' ? 'معرض الصور' : 'Gallery')
  const items = config.content.items || []

  if (!items.length) return null

  const openLightbox = (i: number) => setLightboxIdx(i)
  const closeLightbox = () => setLightboxIdx(null)
  const goPrev = () => setLightboxIdx((p) => (p !== null && p > 0 ? p - 1 : items.length - 1))
  const goNext = () => setLightboxIdx((p) => (p !== null && p < items.length - 1 ? p + 1 : 0))

  return (
    <section
      ref={ref}
      className="animate-on-scroll py-20 sm:py-28"
      style={{ backgroundColor: 'var(--theme-background)' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--theme-primary)' }}>
            {title}
          </h2>
          <div
            className="mx-auto h-1 w-16 rounded-full"
            style={{ backgroundColor: 'var(--theme-accent)' }}
          />
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {items.map((item, i) => {
            const caption = (locale === 'ar' ? item.titleAr : item.title) || ''
            return (
              <div
                key={i}
                className="group relative break-inside-avoid rounded-xl overflow-hidden cursor-pointer"
                onClick={() => openLightbox(i)}
              >
                <img
                  src={item.imageUrl || ''}
                  alt={caption}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Caption overlay on hover */}
                {caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-sm font-medium text-white">{caption}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 end-4 text-white/80 hover:text-white transition-colors z-10"
            aria-label="Close"
          >
            <X className="h-8 w-8" />
          </button>

          {items.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev() }}
                className="absolute start-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors z-10"
                aria-label="Previous"
              >
                {isRtl ? <ChevronRight className="h-8 w-8" /> : <ChevronLeft className="h-8 w-8" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext() }}
                className="absolute end-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors z-10"
                aria-label="Next"
              >
                {isRtl ? <ChevronLeft className="h-8 w-8" /> : <ChevronRight className="h-8 w-8" />}
              </button>
            </>
          )}

          <img
            src={items[lightboxIdx]?.imageUrl || ''}
            alt={(locale === 'ar' ? items[lightboxIdx]?.titleAr : items[lightboxIdx]?.title) || ''}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  )
}
