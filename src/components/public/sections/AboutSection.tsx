'use client'

import Link from 'next/link'
import { useDirection } from '@/components/shared/DirectionProvider'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import type { PageSectionConfig } from '@/types/sections'

interface Props {
  config: PageSectionConfig
  officeSlug: string
  description: string | null
}

export function AboutSection({ config, officeSlug, description }: Props) {
  const { locale, isRtl } = useDirection()
  const ref = useScrollAnimation<HTMLElement>()
  const Arrow = isRtl ? ArrowLeft : ArrowRight

  const title = config.content.titleAr || config.content.title || 'من نحن'
  const body = config.content.bodyAr || config.content.body || description
  const imageUrl = config.content.imageUrl

  if (!body) return null

  return (
    <section
      ref={ref}
      className="animate-on-scroll py-20 sm:py-28"
      style={{ backgroundColor: 'var(--theme-surface)' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 ${imageUrl ? 'lg:grid-cols-2' : ''} gap-12 lg:gap-16 items-center`}>
          {/* Text Column */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--theme-primary)' }}>
              {title}
            </h2>
            {/* Accent underline bar */}
            <div
              className="h-1 w-16 rounded-full mb-6"
              style={{ backgroundColor: 'var(--theme-accent)' }}
            />
            <p className="text-base leading-relaxed mb-6 whitespace-pre-line" style={{ color: 'var(--theme-muted)' }}>
              {body}
            </p>
            <Link
              href={`/${officeSlug}/about`}
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-80"
              style={{ color: 'var(--theme-accent)' }}
            >
              اقرأ المزيد
              <Arrow className="h-4 w-4" />
            </Link>
          </div>

          {/* Image Column */}
          {imageUrl && (
            <div className="relative">
              <img
                src={imageUrl}
                alt={title}
                className="w-full rounded-2xl object-cover aspect-[4/3] shadow-lg"
              />
              {/* Decorative accent corner */}
              <div
                className="absolute -bottom-3 -end-3 w-24 h-24 rounded-2xl -z-10"
                style={{ backgroundColor: 'var(--theme-accent)', opacity: 0.2 }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
