'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { usePublicOffice } from '@/components/public/PublicOfficeContext'
import { useDirection } from '@/components/shared/DirectionProvider'
import { Search, ChevronDown } from 'lucide-react'
import { WhatsAppIcon } from '@/components/public/WhatsAppIcon'
import type { PageSectionConfig } from '@/types/sections'

interface Props {
  config: PageSectionConfig
  officeSlug: string
  officeName: string
  description: string | null
  whatsapp: string | null
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const childVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function HeroSection({ config, officeSlug, officeName, description, whatsapp }: Props) {
  const { dict } = usePublicOffice()
  const { isRtl } = useDirection()
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const title = config.content.titleAr || config.content.title || officeName
  const subtitle = config.content.subtitleAr || config.content.subtitle || description
  const buttonText = config.content.buttonTextAr || config.content.buttonText || dict.nav.properties
  const buttonUrl = config.content.buttonUrl || `/${officeSlug}/properties`
  const bgImage = config.content.backgroundImage
  const layout = config.content.layout || 'centered'

  const hasImage = !!bgImage

  return (
    <section
      ref={ref}
      className="relative overflow-hidden min-h-[85vh] flex items-center justify-center"
    >
      {hasImage ? (
        <div className="absolute inset-0">
          <img src={bgImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>
      ) : (
        <>
          <div className="absolute inset-0" style={{ backgroundColor: 'var(--theme-background)' }} />
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 70% 50% at 50% 30%, color-mix(in srgb, var(--theme-primary) 5%, transparent), transparent)',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, var(--theme-muted) 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-[80px] rotate-[-6deg] opacity-[0.04]"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          />
          <div
            className="absolute top-[20%] right-[10%] w-[200px] h-[200px] rounded-full opacity-[0.06]"
            style={{ backgroundColor: 'var(--theme-accent)' }}
          />
        </>
      )}

      <div className={`relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-24 ${layout === 'centered' ? 'text-center' : 'text-start'}`}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className={`flex flex-col ${layout === 'centered' ? 'items-center' : 'items-start'}`}
        >
          <motion.div
            variants={childVariants}
            className="h-1 w-16 rounded-full mb-8"
            style={{ backgroundColor: 'var(--theme-accent)' }}
          />

          <motion.h1
            variants={childVariants}
            className="font-bold tracking-tight mb-6"
            style={{
              fontSize: 'clamp(2.25rem, 5vw + 0.5rem, 4rem)',
              lineHeight: 1.1,
              color: hasImage ? 'white' : 'var(--theme-primary)',
            }}
          >
            {title}
          </motion.h1>

          {subtitle && (
            <motion.p
              variants={childVariants}
              className={`${layout === 'centered' ? 'mx-auto' : ''} max-w-2xl text-lg sm:text-xl mb-12 leading-relaxed`}
              style={{ color: hasImage ? 'rgba(255,255,255,0.75)' : 'var(--theme-muted)' }}
            >
              {subtitle}
            </motion.p>
          )}

          <motion.div
            variants={childVariants}
            className={`flex flex-col sm:flex-row items-center gap-4 ${layout === 'centered' ? 'justify-center' : 'justify-start'}`}
          >
            <Link
              href={buttonUrl}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300 hover:scale-[1.03] shadow-lg text-white"
              style={{ backgroundColor: 'var(--theme-accent)' }}
            >
              <Search className="h-5 w-5" />
              {buttonText}
            </Link>

            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300 hover:scale-[1.03] bg-[#25D366] text-white shadow-md hover:bg-[#1DA851]"
              >
                <WhatsAppIcon className="h-5 w-5" />
                تواصل واتساب
              </a>
            )}
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="h-6 w-6" style={{ color: hasImage ? 'rgba(255,255,255,0.4)' : 'var(--theme-muted)' }} />
      </motion.div>
    </section>
  )
}
