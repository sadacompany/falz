'use client'

import { useEffect, useRef, useState } from 'react'
import { usePublicOffice } from '@/components/public/PublicOfficeContext'
import { Building2, TrendingUp, Home, MapPin } from 'lucide-react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import type { PageSectionConfig } from '@/types/sections'

interface Props {
  config: PageSectionConfig
  stats: { totalProperties: number; totalForSale: number; totalForRent: number }
  cities: { value: string }[]
}

function AnimatedNumber({ target }: { target: number }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const duration = 1500
          const start = performance.now()

          function tick(now: number) {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setValue(Math.round(eased * target))
            if (progress < 1) requestAnimationFrame(tick)
          }

          requestAnimationFrame(tick)
          observer.unobserve(el)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{value.toLocaleString('en')}</span>
}

export function StatsSection({ config, stats, cities }: Props) {
  const { dict } = usePublicOffice()
  const ref = useScrollAnimation<HTMLElement>()

  const defaultStats = [
    { icon: Building2, value: stats.totalProperties, label: dict.dashboard.totalProperties },
    { icon: TrendingUp, value: stats.totalForSale, label: dict.property.forSale },
    { icon: Home, value: stats.totalForRent, label: dict.property.forRent },
    { icon: MapPin, value: cities.length, label: dict.common.city },
  ]

  // Support custom stats via content.items
  const displayStats = config.content.items?.length
    ? config.content.items.map((item, i) => ({
        icon: defaultStats[i]?.icon || Building2,
        value: parseInt(item.description || '0') || defaultStats[i]?.value || 0,
        label: item.title || defaultStats[i]?.label || '',
      }))
    : defaultStats

  return (
    <section
      ref={ref}
      className="animate-on-scroll relative py-20 sm:py-28 overflow-hidden"
      style={{ backgroundColor: 'var(--theme-primary)' }}
    >
      {/* Decorative dot pattern */}
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: '24px 24px',
      }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {displayStats.map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="text-center">
                <div className="flex justify-center mb-4">
                  <div
                    className="h-14 w-14 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <Icon className="h-7 w-7 text-white/80" />
                  </div>
                </div>
                <p className="text-4xl sm:text-5xl font-bold mb-2 text-white">
                  <AnimatedNumber target={item.value} />
                </p>
                <p className="text-sm text-white/60">{item.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
