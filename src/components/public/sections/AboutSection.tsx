'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useDirection } from '@/components/shared/DirectionProvider'
import { ArrowLeft } from 'lucide-react'
import type { PageSectionConfig } from '@/types/sections'

interface Props {
  config: PageSectionConfig
  officeSlug: string
  description: string | null
}

export function AboutSection({ config, officeSlug, description }: Props) {
  const { isRtl } = useDirection()
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const title = config.content.titleAr || config.content.title || 'من نحن'
  const body = config.content.bodyAr || config.content.body || description
  const imageUrl = config.content.imageUrl

  if (!body) return null

  return (
    <section
      ref={ref}
      className="py-20 md:py-28"
      style={{ backgroundColor: 'var(--theme-surface)' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {imageUrl ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: isRtl ? 40 : -40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2
                className="text-3xl sm:text-4xl font-bold mb-3"
                style={{ color: 'var(--theme-text)' }}
              >
                {title}
              </h2>
              <div
                className="h-[3px] w-10 rounded-full mb-6"
                style={{ backgroundColor: 'var(--theme-accent)' }}
              />
              <p
                className="text-base leading-[1.9] mb-8 whitespace-pre-line"
                style={{ color: 'var(--theme-muted)' }}
              >
                {body}
              </p>
              <Link
                href={`/${officeSlug}/about`}
                className="group inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-300 hover:opacity-80"
                style={{ color: 'var(--theme-accent)' }}
              >
                اقرأ المزيد
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              </Link>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: isRtl ? -40 : 40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            >
              <div
                className="absolute inset-0 rounded-2xl translate-x-2 translate-y-2"
                style={{ backgroundColor: 'var(--theme-accent)', opacity: 0.15 }}
              />
              <img
                src={imageUrl}
                alt={title}
                className="relative w-full rounded-2xl object-cover aspect-[4/3]"
              />
            </motion.div>
          </div>
        ) : (
          <motion.div
            className="max-w-3xl mx-auto border-r-4 pr-8"
            style={{ borderColor: 'var(--theme-accent)' }}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2
              className="text-3xl sm:text-4xl font-bold mb-3"
              style={{ color: 'var(--theme-text)' }}
            >
              {title}
            </h2>
            <div
              className="h-[3px] w-10 rounded-full mb-6"
              style={{ backgroundColor: 'var(--theme-accent)' }}
            />
            <p
              className="text-base leading-[1.9] mb-8 whitespace-pre-line"
              style={{ color: 'var(--theme-muted)' }}
            >
              {body}
            </p>
            <Link
              href={`/${officeSlug}/about`}
              className="group inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-300 hover:opacity-80"
              style={{ color: 'var(--theme-accent)' }}
            >
              اقرأ المزيد
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}
