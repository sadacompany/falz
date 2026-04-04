'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, TrendingUp, Home, MapPin } from 'lucide-react'
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
          const duration = 1800
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
  const defaultStats = [
    { icon: Building2, value: stats.totalProperties, label: 'إجمالي العقارات' },
    { icon: TrendingUp, value: stats.totalForSale, label: 'عقارات للبيع' },
    { icon: Home, value: stats.totalForRent, label: 'عقارات للإيجار' },
    { icon: MapPin, value: cities.length, label: 'المدن' },
  ]

  const displayStats = config.content.items?.length
    ? config.content.items.map((item, i) => ({
        icon: defaultStats[i]?.icon || Building2,
        value: parseInt(item.description || '0') || defaultStats[i]?.value || 0,
        label: item.title || defaultStats[i]?.label || '',
      }))
    : defaultStats

  return (
    <section
      className="relative overflow-hidden py-20 md:py-28"
      style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary) 6%, var(--theme-background))' }}
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, var(--theme-primary) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {displayStats.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="mb-4 flex justify-center">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 12%, transparent)' }}
                  >
                    <Icon className="h-6 w-6" style={{ color: 'var(--theme-accent)' }} />
                  </div>
                </div>
                <p className="mb-1 text-3xl font-bold sm:text-4xl" style={{ color: 'var(--theme-primary)' }}>
                  <AnimatedNumber target={item.value} />
                </p>
                <p className="text-sm" style={{ color: 'var(--theme-muted)' }}>{item.label}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
