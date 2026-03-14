'use client'

import { useState, useRef, useEffect } from 'react'
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from 'framer-motion'

/* ================================================================== */
/*  DATA                                                               */
/* ================================================================== */

const products = [
  {
    id: 'enjad',
    name: 'Enjad',
    nameAr: 'إنجاد',
    tagline: 'Save lives, together.',
    description:
      'A humanitarian volunteering platform that helps people report missing persons and coordinate rescue efforts in real-time across the region.',
    color: '#ef4444',
    gradient: 'from-red-500/20 to-red-900/5',
    icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/1e/3f/33/1e3f33ed-6984-b45e-4f74-1c7e8c751b28/AppIcon-0-0-1x_U007emarketing-0-11-0-0-85-220.png/512x512bb.jpg',
    screenshot: '/sada/enjad.jpg',
    phoneScreenshot:
      'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/1d/38/62/1d386248-d507-e976-0f7c-0d348f8d9973/f3375f16-58fc-41c2-914a-221136dee309_21.jpg/392x696bb.jpg',
    features: [
      'Real-time missing person alerts',
      'Volunteer coordination system',
      'Live rescue tracking',
      'Community-driven safety network',
    ],
    link: 'https://apps.apple.com/sa/app/enjad/id6469982621',
    linkLabel: 'Download on App Store',
  },
  {
    id: 'mofassal',
    name: 'Mofassal',
    nameAr: 'مُفصّل',
    tagline: 'Your Quran journey, planned.',
    description:
      'A Quran memorization planning and tracking app used to build structured memorization plans, track daily progress, and stay consistent.',
    color: '#14b8a6',
    gradient: 'from-teal-500/20 to-teal-900/5',
    icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple112/v4/a9/32/cc/a932cc86-9727-ed00-305c-0cd52d379e55/AppIcon-0-0-1x_U007emarketing-0-10-0-85-220.png/512x512bb.jpg',
    screenshot: '/sada/mofasal.png',
    phoneScreenshot:
      'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource115/v4/c0/ff/eb/c0ffeb3a-9c91-71c9-18ff-3ec80185e384/fd1e775b-0b5a-4edb-9602-dd0bdda88577_1.png/392x696bb.png',
    features: [
      'Smart memorization planning',
      'Daily progress tracking',
      'Printable memorization schedules',
      'Intelligent revision reminders',
    ],
    link: 'https://mofassal.com',
    linkLabel: 'Visit Website',
  },
  {
    id: 'sakann',
    name: 'Sakann',
    nameAr: 'سكن',
    tagline: 'Building stronger families.',
    description:
      'A relationship and marriage preparation platform that helps couples build strong, healthy families through guided programs and expert supervision.',
    color: '#84cc16',
    gradient: 'from-lime-500/20 to-lime-900/5',
    icon: 'https://sakann.net/assets/logo.png',
    screenshot: '/sada/sakinah.png',
    phoneScreenshot: '/sada/sakinah.png',
    features: [
      'Guided marriage preparation',
      'AI-powered compatibility matching',
      'Supervised communication',
      'Privacy-first approach',
    ],
    link: 'https://sakann.net',
    linkLabel: 'Visit Website',
  },
]

const carouselScreenshots = [
  {
    src: 'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/1d/38/62/1d386248-d507-e976-0f7c-0d348f8d9973/f3375f16-58fc-41c2-914a-221136dee309_21.jpg/392x696bb.jpg',
    color: '#ef4444',
    label: 'Enjad',
  },
  {
    src: 'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource115/v4/c0/ff/eb/c0ffeb3a-9c91-71c9-18ff-3ec80185e384/fd1e775b-0b5a-4edb-9602-dd0bdda88577_1.png/392x696bb.png',
    color: '#14b8a6',
    label: 'Mofassal',
  },
  {
    src: 'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/97/c5/b0/97c5b061-3148-b138-25b8-1abf61249148/e92e3a63-0cb8-4ef0-a48f-3c6a6e2c517c_22.jpg/392x696bb.jpg',
    color: '#ef4444',
    label: 'Enjad',
  },
  {
    src: 'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource125/v4/0e/e4/13/0ee41326-259f-77a8-4858-7c7031f2be93/027015f0-e81a-4138-8d9a-ae835dec571c_2.png/392x696bb.png',
    color: '#14b8a6',
    label: 'Mofassal',
  },
  {
    src: 'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/63/7f/24/637f2429-9a5a-9180-e2e1-97f640cb6055/714cf81c-dfa2-4699-b043-c183fbd71030_23.jpg/392x696bb.jpg',
    color: '#ef4444',
    label: 'Enjad',
  },
  {
    src: 'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource125/v4/d0/b6/d2/d0b6d276-ef6f-8c23-4231-5fd211ba5d70/54cd115c-1652-4e89-be18-fff7d1fb236f_3.png/392x696bb.png',
    color: '#14b8a6',
    label: 'Mofassal',
  },
]

const navLinks = [
  { label: 'Products', href: '#products' },
  { label: 'Mission', href: '#philosophy' },
  { label: 'Contact', href: '#contact' },
]

/* ================================================================== */
/*  ANIMATION HELPERS                                                  */
/* ================================================================== */

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

/* ================================================================== */
/*  COMPONENTS                                                         */
/* ================================================================== */

function PhoneMockup({
  src,
  color,
  className = '',
}: {
  src: string
  color: string
  className?: string
}) {
  return (
    <div className={`relative mx-auto w-[260px] sm:w-[280px] ${className}`}>
      <div
        className="absolute -inset-8 rounded-full blur-[80px] opacity-20"
        style={{ background: color }}
      />
      <div className="relative rounded-[2.8rem] border-[5px] border-neutral-800 bg-black shadow-2xl">
        <div className="relative overflow-hidden rounded-[2.4rem]">
          <div className="absolute top-0 left-1/2 z-10 h-[26px] w-[100px] -translate-x-1/2 rounded-b-2xl bg-black" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="block w-full"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  NAVBAR                                                             */
/* ================================================================== */

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-black/70 backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sada/white_logo.svg" alt="Sada" className="h-8" />
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a
          href="#contact"
          className="hidden rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white backdrop-blur-sm transition-all hover:bg-white/10 md:inline-flex"
        >
          Get in touch
        </a>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="relative z-50 flex h-8 w-8 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-label="Menu"
        >
          <motion.span
            animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            className="block h-[2px] w-5 bg-white"
          />
          <motion.span
            animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block h-[2px] w-5 bg-white"
          />
          <motion.span
            animate={
              mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }
            }
            className="block h-[2px] w-5 bg-white"
          />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-white/5 bg-black/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-6">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-lg text-neutral-300 transition-colors hover:text-white"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white"
              >
                Get in touch
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

/* ================================================================== */
/*  HERO                                                               */
/* ================================================================== */

function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, 150])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505]"
    >
      {/* Grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(120,119,198,0.12), transparent)',
        }}
      />

      {/* Animated gradient orb */}
      <motion.div
        className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.07] blur-[120px]"
        style={{
          background:
            'linear-gradient(135deg, #ef4444, #14b8a6, #84cc16)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />

      {/* Content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 mx-auto max-w-5xl px-6 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-neutral-400 backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Digital Product Studio
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
          className="text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
          style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
        >
          Building meaningful
          <br />
          <span className="bg-gradient-to-r from-red-400 via-teal-400 to-lime-400 bg-clip-text text-transparent">
            digital products
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease }}
          className="mx-auto mt-6 max-w-2xl text-lg text-neutral-400 sm:text-xl"
        >
          We design and build technology that improves lives across the Arab
          world — focused on education, community, and family.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href="#products"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition-all hover:bg-neutral-200"
          >
            View Our Products
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-y-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </a>
          <a
            href="#philosophy"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-7 py-3.5 text-sm text-neutral-300 transition-all hover:bg-white/5"
          >
            Our Mission
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-10 w-6 rounded-full border-2 border-white/20 p-1"
        >
          <div className="h-2 w-full rounded-full bg-white/40" />
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ================================================================== */
/*  PRODUCTS SHOWCASE                                                  */
/* ================================================================== */

function ProductsShowcase() {
  return (
    <section id="products" className="relative bg-[#050505] py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-neutral-500">
            Our Products
          </p>
          <h2
            className="text-4xl font-bold tracking-tight sm:text-5xl"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            Three products.
            <br />
            <span className="text-neutral-500">One mission.</span>
          </h2>
        </motion.div>

        {/* Cards grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {products.map((product, i) => (
            <motion.a
              key={product.id}
              href={`#${product.id}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm transition-colors hover:border-white/10"
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(500px circle at 50% 0%, ${product.color}10, transparent)`,
                }}
              />

              <div className="relative z-10">
                {/* Icon */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.icon}
                  alt={product.name}
                  className="mb-6 h-16 w-16 rounded-2xl shadow-lg"
                  loading="lazy"
                />

                {/* Name */}
                <h3
                  className="mb-1 text-xl font-bold"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                >
                  {product.name}
                </h3>
                <p className="text-sm text-neutral-500">{product.nameAr}</p>

                {/* Tagline */}
                <p className="mt-4 text-neutral-400">{product.tagline}</p>

                {/* Arrow */}
                <div
                  className="mt-6 flex items-center gap-1 text-sm font-medium transition-all group-hover:gap-2"
                  style={{ color: product.color }}
                >
                  Learn more
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================================================================== */
/*  PRODUCT DETAIL SECTION                                             */
/* ================================================================== */

function ProductSection({
  product,
  reverse,
}: {
  product: (typeof products)[number]
  reverse: boolean
}) {
  return (
    <section
      id={product.id}
      className="relative overflow-hidden bg-[#050505] py-32"
    >
      {/* Background accent gradient */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          background: `radial-gradient(ellipse 60% 40% at ${reverse ? '80%' : '20%'} 50%, ${product.color}, transparent)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div
          className={`flex flex-col items-center gap-16 lg:flex-row ${
            reverse ? 'lg:flex-row-reverse' : ''
          }`}
        >
          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: reverse ? 60 : -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease }}
            className="flex-shrink-0"
          >
            <PhoneMockup
              src={product.phoneScreenshot}
              color={product.color}
            />
          </motion.div>

          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
            className="flex-1"
          >
            {/* Product badge */}
            <div className="mb-4 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.icon}
                alt=""
                className="h-10 w-10 rounded-xl"
                loading="lazy"
              />
              <div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: product.color }}
                >
                  {product.name}
                </span>
                <span className="ml-2 text-sm text-neutral-600">
                  {product.nameAr}
                </span>
              </div>
            </div>

            {/* Tagline */}
            <h2
              className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              {product.tagline}
            </h2>

            {/* Description */}
            <p className="mb-8 max-w-lg text-lg leading-relaxed text-neutral-400">
              {product.description}
            </p>

            {/* Features */}
            <ul className="mb-10 space-y-3">
              {product.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-neutral-300">
                  <span
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: product.color + '20' }}
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke={product.color}
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <a
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all"
              style={{ backgroundColor: product.color }}
            >
              {product.linkLabel}
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ================================================================== */
/*  PHILOSOPHY                                                         */
/* ================================================================== */

function Philosophy() {
  return (
    <section id="philosophy" className="relative bg-[#050505] py-32">
      {/* Subtle divider gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-4xl px-6 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="mb-4 text-sm font-medium uppercase tracking-widest text-neutral-500"
        >
          Our Philosophy
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
          className="mb-8 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
        >
          Technology with{' '}
          <span className="bg-gradient-to-r from-neutral-400 to-neutral-600 bg-clip-text text-transparent">
            purpose.
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease }}
          className="mx-auto max-w-2xl text-lg leading-relaxed text-neutral-400"
        >
          We believe technology should solve meaningful problems. Not every app
          needs to go viral — some need to save a life, strengthen a family, or
          bring someone closer to their faith. Our products focus on{' '}
          <span className="text-white">education</span>,{' '}
          <span className="text-white">community</span>, and{' '}
          <span className="text-white">family</span>.
        </motion.p>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3, ease }}
          className="mt-16 grid gap-8 sm:grid-cols-3"
        >
          {[
            {
              title: 'Impact-driven',
              desc: 'Every product addresses a real need in the community.',
              color: '#ef4444',
            },
            {
              title: 'Crafted with care',
              desc: 'Premium design and engineering, because people deserve the best tools.',
              color: '#14b8a6',
            },
            {
              title: 'Rooted in values',
              desc: 'Built with integrity, guided by principles that matter.',
              color: '#84cc16',
            },
          ].map((v) => (
            <div
              key={v.title}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-left"
            >
              <div
                className="mb-3 h-1 w-8 rounded-full"
                style={{ backgroundColor: v.color }}
              />
              <h3 className="mb-2 font-semibold">{v.title}</h3>
              <p className="text-sm leading-relaxed text-neutral-500">
                {v.desc}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ================================================================== */
/*  SCREENSHOTS GALLERY                                                */
/* ================================================================== */

function ScreenshotsGallery() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let frame: number
    const scroll = () => {
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
        el.scrollLeft = 0
      } else {
        el.scrollLeft += 0.5
      }
      frame = requestAnimationFrame(scroll)
    }
    frame = requestAnimationFrame(scroll)
    const pause = () => cancelAnimationFrame(frame)
    const resume = () => {
      frame = requestAnimationFrame(scroll)
    }
    el.addEventListener('mouseenter', pause)
    el.addEventListener('mouseleave', resume)
    el.addEventListener('touchstart', pause, { passive: true })
    el.addEventListener('touchend', resume)
    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener('mouseenter', pause)
      el.removeEventListener('mouseleave', resume)
      el.removeEventListener('touchstart', pause)
      el.removeEventListener('touchend', resume)
    }
  }, [])

  return (
    <section className="relative bg-[#050505] py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-neutral-500">
            App Screens
          </p>
          <h2
            className="text-4xl font-bold tracking-tight sm:text-5xl"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            Crafted with care
          </h2>
        </motion.div>
      </div>

      {/* Scrollable gallery */}
      <div
        ref={scrollRef}
        className="flex gap-10 overflow-x-auto px-8 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>
        {[...carouselScreenshots, ...carouselScreenshots].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: (i % 6) * 0.05, ease }}
            className="flex-shrink-0"
          >
            <PhoneMockup src={s.src} color={s.color} className="w-[220px] sm:w-[240px]" />
            <p className="mt-4 text-center text-xs text-neutral-600">
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* ================================================================== */
/*  CTA                                                                */
/* ================================================================== */

function CallToAction() {
  return (
    <section id="contact" className="relative bg-[#050505] py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          background:
            'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(120,119,198,0.5), transparent)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
          className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
        >
          Explore our products.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
          className="mb-12 text-lg text-neutral-400"
        >
          Each one built with purpose. Explore what we&apos;re working on.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          {products.map((p) => (
            <a
              key={p.id}
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-full border px-6 py-3 text-sm font-medium transition-all hover:scale-[1.03]"
              style={{
                borderColor: p.color + '30',
                color: p.color,
                backgroundColor: p.color + '08',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.icon}
                alt=""
                className="h-6 w-6 rounded-lg"
                loading="lazy"
              />
              {p.name}
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ================================================================== */
/*  FOOTER                                                             */
/* ================================================================== */

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#050505] py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/sada/white_logo.svg" alt="Sada" className="mb-4 h-7" />
            <p className="text-sm leading-relaxed text-neutral-500">
              Sada builds modern digital products that solve real problems in
              the Arab world. Focused on impact, not hype.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16">
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Products
              </h4>
              <ul className="space-y-3">
                {products.map((p) => (
                  <li key={p.id}>
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-neutral-400 transition-colors hover:text-white"
                    >
                      {p.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Company
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#philosophy"
                    className="text-sm text-neutral-400 transition-colors hover:text-white"
                  >
                    Mission
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:sadaorg.company@gmail.com"
                    className="text-sm text-neutral-400 transition-colors hover:text-white"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-neutral-600">
            &copy; {new Date().getFullYear()} Sada. All rights reserved.
          </p>
          <a
            href="mailto:sadaorg.company@gmail.com"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            sadaorg.company@gmail.com
          </a>
        </div>
      </div>
    </footer>
  )
}

/* ================================================================== */
/*  PAGE                                                               */
/* ================================================================== */

export default function SadaPage() {
  return (
    <main
      className="bg-[#050505] text-white"
      style={{ scrollBehavior: 'smooth' }}
    >
      <Navbar />
      <Hero />
      <ProductsShowcase />
      {products.map((p, i) => (
        <ProductSection key={p.id} product={p} reverse={i % 2 === 1} />
      ))}
      <Philosophy />
      <ScreenshotsGallery />
      <CallToAction />
      <Footer />
    </main>
  )
}
