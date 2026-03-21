'use client'

import Link from 'next/link'
import { usePublicOffice } from '@/components/public/PublicOfficeContext'
import { useDirection } from '@/components/shared/DirectionProvider'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { WhatsAppIcon } from '@/components/public/WhatsAppIcon'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import type { PageSectionConfig } from '@/types/sections'

interface Props {
  config: PageSectionConfig
  officeSlug: string
  whatsapp: string | null
}

export function CtaSection({ config, officeSlug, whatsapp }: Props) {
  const { dict } = usePublicOffice()
  const { isRtl } = useDirection()
  const ref = useScrollAnimation<HTMLElement>()
  const Arrow = isRtl ? ArrowLeft : ArrowRight

  const title = config.content.titleAr || config.content.title || dict.nav.contact
  const subtitle = config.content.subtitleAr || config.content.subtitle || dict.property.interestedIn
  const buttonText = config.content.buttonTextAr || config.content.buttonText || dict.nav.contact
  const bgImage = config.content.backgroundImage

  return (
    <section
      ref={ref}
      className="animate-on-scroll relative py-20 sm:py-28 overflow-hidden"
      style={{ backgroundColor: 'var(--theme-accent)' }}
    >
      {/* Background image with overlay */}
      {bgImage && (
        <div className="absolute inset-0">
          <img src={bgImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      {/* Decorative elements */}
      {!bgImage && (
        <>
          <div className="absolute inset-0 opacity-[0.08]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }} />
          <div
            className="absolute -top-32 -end-32 w-96 h-96 rounded-full opacity-20 blur-3xl bg-white"
          />
          <div
            className="absolute -bottom-32 -start-32 w-96 h-96 rounded-full opacity-10 blur-3xl bg-white"
          />
        </>
      )}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Accent line */}
        <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-white/40" />
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white">
          {title}
        </h2>
        <p className="text-base sm:text-lg mb-10 max-w-lg mx-auto text-white/75">
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/${officeSlug}/contact`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
            style={{
              backgroundColor: 'var(--theme-primary)',
              color: 'white',
            }}
          >
            {buttonText}
            <Arrow className="h-4 w-4" />
          </Link>
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300 hover:scale-105 bg-[#25D366] text-white hover:bg-[#1EBE5A] shadow-lg"
            >
              <WhatsAppIcon className="h-5 w-5" />
              واتساب
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
