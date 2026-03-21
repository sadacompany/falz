'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePublicOffice } from './PublicOfficeContext'
import { useDirection } from '@/components/shared/DirectionProvider'
import { Menu, X, User } from 'lucide-react'
import { useVisitorAuth } from './VisitorAuthContext'
import { VisitorAvatar } from './VisitorAvatar'

export function PublicHeader() {
  const { office, dict } = usePublicOffice()
  const { isRtl } = useDirection()
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { visitor, loading: visitorLoading, setShowAuthModal } = useVisitorAuth()

  const officeName = office.nameAr || office.name
  const base = `/${office.slug}`

  const navLinks = [
    { href: base, label: dict.nav.home },
    { href: `${base}/properties`, label: dict.nav.properties },
    { href: `${base}/about`, label: dict.nav.about },
    { href: `${base}/contact`, label: dict.nav.contact },
  ]

  function isActive(href: string) {
    if (href === base) return pathname === base || pathname === base + '/'
    return pathname.startsWith(href)
  }

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-sm shadow-sm"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--theme-surface) 95%, transparent)',
        borderBottom: '1px solid var(--theme-border)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo + Office Name */}
          <Link href={base} className="flex items-center gap-3 shrink-0">
            {office.logo ? (
              <img
                src={office.logo}
                alt={officeName}
                className="h-9 w-9 rounded-lg object-cover"
              />
            ) : (
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: 'var(--theme-accent)' }}
              >
                {officeName.charAt(0)}
              </div>
            )}
            <span className="text-lg font-semibold" style={{ color: 'var(--theme-primary)' }}>
              {officeName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm rounded-lg transition-colors"
                style={{
                  color: isActive(link.href) ? 'var(--theme-primary)' : 'var(--theme-muted)',
                  fontWeight: isActive(link.href) ? 600 : 500,
                  backgroundColor: isActive(link.href) ? 'color-mix(in srgb, var(--theme-primary) 8%, transparent)' : undefined,
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Visitor Auth */}
            {!visitorLoading && (
              visitor ? (
                <VisitorAvatar />
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors"
                  style={{ color: 'var(--theme-muted)' }}
                >
                  <User className="h-4 w-4" />
                  تسجيل الدخول
                </button>
              )
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg transition-colors"
              style={{ color: 'var(--theme-primary)' }}
              aria-label={mobileOpen ? dict.nav.menuClose : dict.nav.menuOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div
          className="lg:hidden"
          style={{
            borderTop: '1px solid var(--theme-border)',
            backgroundColor: 'var(--theme-surface)',
          }}
        >
          <nav className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm rounded-lg transition-colors"
                style={{
                  color: isActive(link.href) ? 'var(--theme-primary)' : 'var(--theme-muted)',
                  fontWeight: isActive(link.href) ? 600 : 500,
                  backgroundColor: isActive(link.href) ? 'color-mix(in srgb, var(--theme-primary) 8%, transparent)' : undefined,
                }}
              >
                {link.label}
              </Link>
            ))}
            {!visitorLoading && (
              visitor ? (
                <div className="mt-2 px-4">
                  <VisitorAvatar />
                </div>
              ) : (
                <button
                  onClick={() => { setShowAuthModal(true); setMobileOpen(false) }}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium mt-2 w-full transition-colors"
                  style={{ color: 'var(--theme-muted)' }}
                >
                  <User className="h-4 w-4" />
                  تسجيل الدخول
                </button>
              )
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
