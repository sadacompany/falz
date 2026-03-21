'use client'

import { useRef, useState } from 'react'
import { useDirection } from '@/components/shared/DirectionProvider'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import type { PageSectionConfig } from '@/types/sections'

interface Props {
  config: PageSectionConfig
}

const defaultTestimonials = [
  {
    nameAr: 'أحمد المحمد', nameEn: 'Ahmed Al-Mohammed',
    roleAr: 'مشتري عقار', roleEn: 'Property Buyer',
    textAr: 'تجربة ممتازة في شراء منزل أحلامي. فريق محترف وخدمة متميزة من البداية حتى النهاية.',
    textEn: 'Excellent experience buying my dream home. Professional team and outstanding service from start to finish.',
    rating: 5,
  },
  {
    nameAr: 'سارة العلي', nameEn: 'Sara Al-Ali',
    roleAr: 'مستأجرة', roleEn: 'Tenant',
    textAr: 'ساعدوني في إيجاد الشقة المثالية بسرعة. أنصح بهم بشدة.',
    textEn: 'They helped me find the perfect apartment quickly. Highly recommended.',
    rating: 5,
  },
  {
    nameAr: 'خالد الرشيدي', nameEn: 'Khaled Al-Rashidi',
    roleAr: 'مستثمر عقاري', roleEn: 'Real Estate Investor',
    textAr: 'شريك موثوق في الاستثمار العقاري. خبرة واسعة ونصائح قيّمة.',
    textEn: 'A trusted partner in real estate investment. Extensive experience and valuable advice.',
    rating: 4,
  },
]

export function TestimonialsSection({ config }: Props) {
  const { isRtl } = useDirection()
  const sectionRef = useScrollAnimation<HTMLElement>()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)

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
        name: t.nameAr || t.nameEn,
        role: t.roleAr || t.roleEn,
        text: t.textAr || t.textEn,
        photo: undefined as string | undefined,
        rating: t.rating,
      }))

  const scroll = (dir: 'prev' | 'next') => {
    const container = scrollRef.current
    if (!container) return
    const cardWidth = container.firstElementChild?.clientWidth || 320
    const gap = 24
    const scrollAmount = cardWidth + gap
    const newIdx = dir === 'next'
      ? Math.min(activeIdx + 1, items.length - 1)
      : Math.max(activeIdx - 1, 0)
    setActiveIdx(newIdx)
    container.scrollTo({
      left: isRtl ? -(newIdx * scrollAmount) : newIdx * scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    <section
      ref={sectionRef}
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

        {/* Carousel */}
        <div className="relative">
          {/* Arrow buttons (desktop) */}
          {items.length > 1 && (
            <>
              <button
                onClick={() => scroll('prev')}
                className="hidden lg:flex absolute -start-5 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full items-center justify-center shadow-lg transition-transform hover:scale-110"
                style={{ backgroundColor: 'var(--theme-surface)', color: 'var(--theme-primary)' }}
                aria-label="Previous"
              >
                {isRtl ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </button>
              <button
                onClick={() => scroll('next')}
                className="hidden lg:flex absolute -end-5 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full items-center justify-center shadow-lg transition-transform hover:scale-110"
                style={{ backgroundColor: 'var(--theme-surface)', color: 'var(--theme-primary)' }}
                aria-label="Next"
              >
                {isRtl ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
            </>
          )}

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x scrollbar-none pb-4"
            style={{ scrollbarWidth: 'none' }}
          >
            {items.map((item, i) => (
              <div
                key={i}
                className="snap-center shrink-0 w-[320px] sm:w-[380px] rounded-2xl p-8 relative"
                style={{ backgroundColor: 'var(--theme-surface)' }}
              >
                {/* Quote mark */}
                <Quote
                  className="h-8 w-8 mb-4 opacity-20"
                  style={{ color: 'var(--theme-accent)' }}
                />

                {/* Text */}
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--theme-muted)' }}>
                  {item.text}
                </p>

                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${s < item.rating ? 'fill-current' : ''}`}
                      style={{ color: s < item.rating ? '#F59E0B' : 'var(--theme-border)' }}
                    />
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3">
                  {item.photo ? (
                    <img src={item.photo} alt={item.name} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ backgroundColor: 'var(--theme-accent)' }}
                    >
                      {item.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--theme-primary)' }}>{item.name}</p>
                    <p className="text-xs" style={{ color: 'var(--theme-muted)' }}>{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
          {items.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveIdx(i)
                    const container = scrollRef.current
                    if (!container) return
                    const cardWidth = container.firstElementChild?.clientWidth || 320
                    container.scrollTo({
                      left: isRtl ? -(i * (cardWidth + 24)) : i * (cardWidth + 24),
                      behavior: 'smooth',
                    })
                  }}
                  className={`h-2 rounded-full transition-all ${i === activeIdx ? 'w-6' : 'w-2'}`}
                  style={{
                    backgroundColor: i === activeIdx ? 'var(--theme-accent)' : 'var(--theme-border)',
                  }}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
