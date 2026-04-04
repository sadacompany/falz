'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import type { PageSectionConfig } from '@/types/sections'

interface Props {
  config: PageSectionConfig
}

const defaultTestimonials = [
  {
    nameAr: 'أحمد المحمد',
    roleAr: 'مشتري عقار',
    textAr: 'تجربة ممتازة في شراء منزل أحلامي. فريق محترف وخدمة متميزة من البداية حتى النهاية.',
    rating: 5,
  },
  {
    nameAr: 'سارة العلي',
    roleAr: 'مستأجرة',
    textAr: 'ساعدوني في إيجاد الشقة المثالية بسرعة. أنصح بهم بشدة لكل من يبحث عن سكن مناسب.',
    rating: 5,
  },
  {
    nameAr: 'خالد الرشيدي',
    roleAr: 'مستثمر عقاري',
    textAr: 'شريك موثوق في الاستثمار العقاري. خبرة واسعة ونصائح قيّمة ساعدتني في اتخاذ القرار.',
    rating: 4,
  },
]

export function TestimonialsSection({ config }: Props) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const title = config.content.titleAr || config.content.title || 'آراء عملائنا'

  const items = config.content.items?.length
    ? config.content.items.map((item) => ({
        name: item.nameAr || item.name || '',
        role: item.roleAr || item.role || '',
        text: item.descriptionAr || item.description || '',
        photo: item.photoUrl,
        rating: item.rating || 5,
      }))
    : defaultTestimonials.map((t) => ({
        name: t.nameAr,
        role: t.roleAr,
        text: t.textAr,
        photo: undefined as string | undefined,
        rating: t.rating,
      }))

  const goTo = useCallback(
    (idx: number) => {
      setDirection(idx > activeIdx ? 1 : -1)
      setActiveIdx(idx)
    },
    [activeIdx],
  )

  const goNext = useCallback(() => {
    setDirection(1)
    setActiveIdx((prev) => (prev + 1) % items.length)
  }, [items.length])

  const goPrev = useCallback(() => {
    setDirection(-1)
    setActiveIdx((prev) => (prev - 1 + items.length) % items.length)
  }, [items.length])

  useEffect(() => {
    if (isPaused || items.length <= 1) return
    intervalRef.current = setInterval(goNext, 5000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPaused, goNext, items.length])

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  }

  const current = items[activeIdx]

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

        <div
          className="relative max-w-2xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {items.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute -start-4 lg:-start-16 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  color: 'var(--theme-primary)',
                  borderWidth: '1px',
                  borderColor: 'var(--theme-border)',
                }}
                aria-label="السابق"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                onClick={goNext}
                className="absolute -end-4 lg:-end-16 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  color: 'var(--theme-primary)',
                  borderWidth: '1px',
                  borderColor: 'var(--theme-border)',
                }}
                aria-label="التالي"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </>
          )}

          <div className="overflow-hidden min-h-[280px] flex items-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeIdx}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="w-full rounded-2xl p-8 sm:p-10 shadow-sm"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  borderWidth: '1px',
                  borderColor: 'var(--theme-border)',
                }}
              >
                <span
                  className="block text-5xl leading-none mb-5 select-none"
                  style={{ color: 'var(--theme-accent)' }}
                >
                  ❝
                </span>

                <p
                  className="text-base sm:text-lg leading-relaxed mb-6"
                  style={{ color: 'var(--theme-text)' }}
                >
                  {current.text}
                </p>

                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${s < current.rating ? 'fill-current' : ''}`}
                      style={{ color: s < current.rating ? '#F59E0B' : 'var(--theme-border)' }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  {current.photo ? (
                    <img
                      src={current.photo}
                      alt={current.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ backgroundColor: 'var(--theme-accent)' }}
                    >
                      {current.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--theme-primary)' }}
                    >
                      {current.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--theme-muted)' }}>
                      {current.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {items.length > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === activeIdx ? '28px' : '10px',
                    backgroundColor:
                      i === activeIdx ? 'var(--theme-accent)' : 'var(--theme-border)',
                  }}
                  aria-label={`الانتقال إلى التقييم ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
