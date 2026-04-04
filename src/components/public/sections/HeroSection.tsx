'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { usePublicOffice } from '@/components/public/PublicOfficeContext'
import { useDirection } from '@/components/shared/DirectionProvider'
import { Search, ArrowLeft, ChevronDown, MessageCircle } from 'lucide-react'
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
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
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

  return (
    <section
      ref={ref}
      className="relative overflow-hidden min-h-[80vh] flex items-center justify-center"
    >
      {bgImage ? (
        <div className="absolute inset-0">
          <img src={bgImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80" />
        </div>
      ) : (
        <>
          <div className="absolute inset-0" style={{ backgroundColor: 'var(--theme-primary)' }} />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 80% 60% at 50% 40%, color-mix(in srgb, var(--theme-accent) 12%, transparent), transparent)`,
            }}
          />
          <motion.div
            className="absolute rounded-full blur-[120px]"
            style={{
              backgroundColor: 'var(--theme-accent)',
              opacity: 0.18,
              width: 420,
              height: 420,
              top: '10%',
              right: '10%',
            }}
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -20, 15, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute rounded-full blur-[100px]"
            style={{
              backgroundColor: 'var(--theme-accent)',
              opacity: 0.12,
              width: 350,
              height: 350,
              bottom: '5%',
              left: '5%',
            }}
            animate={{
              x: [0, -25, 20, 0],
              y: [0, 20, -15, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute rounded-full blur-[90px]"
            style={{
              backgroundColor: 'var(--theme-accent)',
              opacity: 0.08,
              width: 250,
              height: 250,
              top: '50%',
              left: '40%',
            }}
            animate={{
              x: [0, 15, -10, 0],
              y: [0, -10, 20, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
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
            className="font-bold tracking-tight mb-6 text-white"
            style={{ fontSize: 'clamp(2rem, 5vw + 0.5rem, 3.5rem)', lineHeight: 1.15 }}
          >
            {title}
          </motion.h1>

          {subtitle && (
            <motion.p
              variants={childVariants}
              className={`${layout === 'centered' ? 'mx-auto' : ''} max-w-2xl text-lg sm:text-xl mb-12 leading-relaxed text-white/70`}
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
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-white"
              style={{ backgroundColor: 'var(--theme-accent)' }}
            >
              <Search className="h-5 w-5" />
              {buttonText}
            </Link>

            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300 hover:scale-105 border-2 bg-transparent"
                style={{
                  borderColor: 'var(--theme-accent)',
                  color: 'var(--theme-accent)',
                }}
              >
                <MessageCircle className="h-5 w-5" />
                تواصل واتساب
              </a>
            )}
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="h-6 w-6 text-white/50" />
      </motion.div>
    </section>
  )
}
