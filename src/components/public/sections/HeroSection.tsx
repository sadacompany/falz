'use client'

import Link from 'next/link'
import { usePublicOffice } from '@/components/public/PublicOfficeContext'
import { useDirection } from '@/components/shared/DirectionProvider'
import { Search, ArrowRight, ArrowLeft } from 'lucide-react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import type { PageSectionConfig } from '@/types/sections'

interface Props {
  config: PageSectionConfig
  officeSlug: string
  officeName: string
  description: string | null
  whatsapp: string | null
}

export function HeroSection({ config, officeSlug, officeName, description, whatsapp }: Props) {
  const { dict } = usePublicOffice()
  const { locale, isRtl } = useDirection()
  const ref = useScrollAnimation<HTMLElement>()
  const Arrow = isRtl ? ArrowLeft : ArrowRight

  const title = (locale === 'ar' ? config.content.titleAr : config.content.title) || officeName
  const subtitle = (locale === 'ar' ? config.content.subtitleAr : config.content.subtitle) || description
  const buttonText = (locale === 'ar' ? config.content.buttonTextAr : config.content.buttonText) || dict.nav.properties
  const buttonUrl = config.content.buttonUrl || `/o/${officeSlug}/properties`
  const bgImage = config.content.backgroundImage
  const layout = config.content.layout || 'centered'

  return (
    <section
      ref={ref}
      className="animate-on-scroll relative overflow-hidden py-32 sm:py-40 lg:py-48"
    >
      {/* Multi-layer background — gradient mesh instead of one flat color */}
      <div className="absolute inset-0" style={{ backgroundColor: 'var(--theme-primary)' }} />
      {/* Diagonal gradient overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, transparent 0%, color-mix(in srgb, var(--theme-accent) 18%, transparent) 50%, transparent 100%)`,
        }}
      />
      {/* Bottom-left warm glow */}
      <div
        className="absolute -bottom-24 -start-24 w-[500px] h-[500px] rounded-full blur-[120px]"
        style={{ backgroundColor: 'var(--theme-accent)', opacity: 0.15 }}
      />
      {/* Top-right cool highlight */}
      <div
        className="absolute -top-24 -end-24 w-[600px] h-[600px] rounded-full blur-[120px]"
        style={{ backgroundColor: 'var(--theme-accent)', opacity: 0.1 }}
      />
      {/* Center-right medium glow */}
      <div
        className="absolute top-1/3 end-1/4 w-[300px] h-[300px] rounded-full blur-[100px]"
        style={{ backgroundColor: 'white', opacity: 0.04 }}
      />

      {/* Background image with overlay */}
      {bgImage && (
        <div className="absolute inset-0">
          <img src={bgImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>
      )}

      {/* Decorative dot pattern */}
      {!bgImage && (
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--theme-accent) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      )}

      {/* Geometric accent shapes */}
      {!bgImage && (
        <>
          {/* Thin horizontal accent line across the hero */}
          <div
            className="absolute top-[30%] start-0 w-full h-px"
            style={{ backgroundColor: 'var(--theme-accent)', opacity: 0.08 }}
          />
          {/* Vertical accent stripe */}
          <div
            className="absolute top-0 end-[15%] w-px h-full"
            style={{ backgroundColor: 'var(--theme-accent)', opacity: 0.06 }}
          />
        </>
      )}

      {/* Content */}
      <div className={`relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${layout === 'centered' ? 'text-center' : 'text-start'}`}>
        {/* Accent line */}
        <div
          className={`mb-8 h-1 w-16 rounded-full animate-fade-in-up stagger-1 ${layout === 'centered' ? 'mx-auto' : ''}`}
          style={{ backgroundColor: 'var(--theme-accent)' }}
        />
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white animate-fade-in-up stagger-2">
          {title}
        </h1>
        {subtitle && (
          <p className={`${layout === 'centered' ? 'mx-auto' : ''} max-w-2xl text-lg sm:text-xl mb-12 leading-relaxed text-white/70 animate-fade-in-up stagger-3`}>
            {subtitle}
          </p>
        )}
        <div className={`flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up stagger-4 ${layout === 'centered' ? 'justify-center' : 'justify-start'}`}>
          <Link
            href={buttonUrl}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-white"
            style={{ backgroundColor: 'var(--theme-accent)' }}
          >
            <Search className="h-5 w-5" />
            {buttonText}
            <Arrow className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Bottom wave divider */}
      <div className="absolute bottom-0 inset-x-0">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto block"
          preserveAspectRatio="none"
        >
          <path
            d="M0 40C240 70 480 80 720 60C960 40 1200 10 1440 30V80H0V40Z"
            style={{ fill: 'var(--theme-surface)' }}
          />
        </svg>
      </div>
    </section>
  )
}
