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
  const title = config.content.titleAr || config.content.title || 'مستعد لإيجاد منزلك؟'
  const subtitle = config.content.subtitleAr || config.content.subtitle || 'تواصل معنا اليوم ودعنا نساعدك في العثور على العقار المثالي'
  const buttonText = config.content.buttonTextAr || config.content.buttonText || 'تواصل معنا'
  const bgImage = config.content.backgroundImage

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      {bgImage ? (
        <div className="absolute inset-0">
          <img src={bgImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
      ) : (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary) 5%, var(--theme-background))' }}
        />
      )}

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="h-1 w-12 rounded-full mx-auto mb-8"
            style={{ backgroundColor: 'var(--theme-accent)' }}
          />
          <h2
            className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl"
            style={{ color: bgImage ? 'white' : 'var(--theme-primary)' }}
          >
            {title}
          </h2>
          <p
            className="mx-auto mb-10 max-w-lg text-base sm:text-lg"
            style={{ color: bgImage ? 'rgba(255,255,255,0.75)' : 'var(--theme-muted)' }}
          >
            {subtitle}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/${officeSlug}/contact`}
              className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold shadow-md transition-all duration-300 hover:scale-[1.03] text-white"
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
                className="inline-flex items-center gap-2.5 rounded-xl border px-8 py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.03]"
                style={{
                  borderColor: bgImage ? 'rgba(255,255,255,0.3)' : 'var(--theme-border)',
                  color: bgImage ? 'white' : 'var(--theme-primary)',
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
