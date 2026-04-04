'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import type { PageSectionConfig } from '@/types/sections'

interface Props {
  config: PageSectionConfig
  officeSlug: string
  whatsapp: string | null
}

export function CtaSection({ config, officeSlug, whatsapp }: Props) {
  const title = config.content.titleAr || config.content.title || 'تواصل معنا'
  const subtitle = config.content.subtitleAr || config.content.subtitle || 'نحن هنا لمساعدتك في العثور على العقار المثالي'
  const buttonText = config.content.buttonTextAr || config.content.buttonText || 'تواصل معنا'
  const bgImage = config.content.backgroundImage

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      {bgImage ? (
        <>
          <div className="absolute inset-0">
            <img
              src={bgImage}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
        </>
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, var(--theme-primary) 0%, color-mix(in srgb, var(--theme-primary) 70%, black) 100%)',
            }}
          />
          <div
            className="absolute -top-40 -end-40 h-[500px] w-[500px] rounded-full opacity-[0.08] blur-3xl"
            style={{ backgroundColor: 'white' }}
          />
          <div
            className="absolute -bottom-40 -start-40 h-[400px] w-[400px] rounded-full opacity-[0.06] blur-3xl"
            style={{ backgroundColor: 'white' }}
          />
          <div
            className="absolute top-1/2 start-1/3 h-64 w-64 -translate-y-1/2 rounded-full opacity-[0.04] blur-2xl"
            style={{ backgroundColor: 'white' }}
          />
        </>
      )}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          <p className="mx-auto mb-10 max-w-lg text-base text-white/70 sm:text-lg">
            {subtitle}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/${officeSlug}/contact`}
              className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: 'var(--theme-accent)' }}
            >
              {buttonText}
              <ArrowLeft className="h-4 w-4" />
            </Link>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-xl border px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:scale-105"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }}
              >
                <MessageCircle className="h-5 w-5" />
                واتساب
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
