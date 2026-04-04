'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import type { PageSectionConfig } from '@/types/sections'

interface Props {
  config: PageSectionConfig
}

export function GallerySection({ config }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  const title = config.content.titleAr || config.content.title || 'معرض الصور'
  const items = config.content.items || []

  if (!items.length) return null

  const openLightbox = (i: number) => setLightboxIdx(i)
  const closeLightbox = () => setLightboxIdx(null)
  const goPrev = () =>
    setLightboxIdx((p) => (p !== null && p > 0 ? p - 1 : items.length - 1))
  const goNext = () =>
    setLightboxIdx((p) => (p !== null && p < items.length - 1 ? p + 1 : 0))

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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item, i) => {
            const caption = item.titleAr || item.title || ''
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
                onClick={() => openLightbox(i)}
              >
                <img
                  src={item.imageUrl || ''}
                  alt={caption}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                >
                  <ZoomIn className="h-8 w-8 text-white" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {lightboxIdx !== null && (
          <LightboxOverlay
            items={items}
            currentIdx={lightboxIdx}
            onClose={closeLightbox}
            onPrev={goPrev}
            onNext={goNext}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

function LightboxOverlay({
  items,
  currentIdx,
  onClose,
  onPrev,
  onNext,
}: {
  items: { imageUrl?: string; titleAr?: string; title?: string }[]
  currentIdx: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onNext()
      if (e.key === 'ArrowRight') onPrev()
    },
    [onClose, onPrev, onNext],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  const current = items[currentIdx]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 end-4 text-white/70 hover:text-white transition-colors z-10 h-10 w-10 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm"
        aria-label="إغلاق"
      >
        <X className="h-6 w-6" />
      </button>

      <div
        className="absolute top-5 start-1/2 -translate-x-1/2 text-white/60 text-sm font-medium bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full"
        dir="ltr"
      >
        {currentIdx + 1} / {items.length}
      </div>

      {items.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPrev()
            }}
            className="absolute start-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10 h-12 w-12 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm"
            aria-label="السابق"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="absolute end-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10 h-12 w-12 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm"
            aria-label="التالي"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        </>
      )}

      <motion.img
        key={currentIdx}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        src={current?.imageUrl || ''}
        alt={current?.titleAr || current?.title || ''}
        className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </motion.div>
  )
}
