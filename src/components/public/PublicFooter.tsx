'use client'

import Link from 'next/link'
import { usePublicOffice } from './PublicOfficeContext'
import { useDirection } from '@/components/shared/DirectionProvider'
import { Phone, Mail, MapPin } from 'lucide-react'

export interface FooterConfig {
  showLogo?: boolean
  showNavLinks?: boolean
  showContactInfo?: boolean
  showSocialLinks?: boolean
  copyrightText?: string
  copyrightTextAr?: string
}

interface PublicFooterProps {
  footerConfig?: FooterConfig
}

export function PublicFooter({ footerConfig }: PublicFooterProps) {
  const { office, dict } = usePublicOffice()
  const { locale } = useDirection()

  const officeName = locale === 'ar' && office.nameAr ? office.nameAr : office.name
  const base = `/o/${office.slug}`
  const year = new Date().getFullYear()
  const address = locale === 'ar' && office.addressAr ? office.addressAr : office.address
  const city = locale === 'ar' && office.cityAr ? office.cityAr : office.city

  // Defaults: show everything
  const showLogo = footerConfig?.showLogo !== false
  const showNavLinks = footerConfig?.showNavLinks !== false
  const showContactInfo = footerConfig?.showContactInfo !== false
  const showSocialLinks = footerConfig?.showSocialLinks !== false

  const navLinks = [
    { href: base, label: dict.nav.home },
    { href: `${base}/properties`, label: dict.nav.properties },
    { href: `${base}/about`, label: dict.nav.about },
    { href: `${base}/contact`, label: dict.nav.contact },
  ]

  const socialLinks = office.socialLinks || {}

  const socialIcons: Record<string, string> = {
    twitter: 'X',
    instagram: 'IG',
    snapchat: 'SC',
    linkedin: 'LI',
    tiktok: 'TT',
  }

  const copyrightLabel = footerConfig?.copyrightText
    ? (locale === 'ar' && footerConfig.copyrightTextAr ? footerConfig.copyrightTextAr : footerConfig.copyrightText)
    : undefined

  return (
    <footer style={{ backgroundColor: 'var(--theme-footer-bg, var(--theme-primary))' }}>
      {/* Accent line at top */}
      <div className="h-1 w-full" style={{ backgroundColor: 'var(--theme-accent)' }} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Office Info */}
          {showLogo && (
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                {office.logo ? (
                  <img
                    src={office.logo}
                    alt={officeName}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: 'var(--theme-accent)' }}
                  >
                    {officeName.charAt(0)}
                  </div>
                )}
                <span className="text-lg font-semibold text-white">
                  {officeName}
                </span>
              </div>
              {office.falLicenseNo && (
                <p className="text-sm mb-3 text-white/60">
                  {dict.office.falLicenseNo}: {office.falLicenseNo}
                </p>
              )}
              {(address || city) && (
                <p className="text-sm flex items-start gap-2 text-white/60">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{[address, city].filter(Boolean).join(', ')}</span>
                </p>
              )}
            </div>
          )}

          {/* Navigation */}
          {showNavLinks && (
            <div>
              <h3
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: 'var(--theme-accent)' }}
              >
                {dict.nav.home}
              </h3>
              <ul className="space-y-2.5">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:underline text-white/70 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact */}
          {showContactInfo && (
            <div>
              <h3
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: 'var(--theme-accent)' }}
              >
                {dict.nav.contact}
              </h3>
              <ul className="space-y-3">
                {office.phone && (
                  <li>
                    <a
                      href={`tel:${office.phone}`}
                      className="text-sm flex items-center gap-2 transition-colors hover:underline text-white/70 hover:text-white"
                      dir="ltr"
                    >
                      <Phone className="h-4 w-4 shrink-0" />
                      {office.phone}
                    </a>
                  </li>
                )}
                {office.email && (
                  <li>
                    <a
                      href={`mailto:${office.email}`}
                      className="text-sm flex items-center gap-2 transition-colors hover:underline text-white/70 hover:text-white"
                    >
                      <Mail className="h-4 w-4 shrink-0" />
                      {office.email}
                    </a>
                  </li>
                )}
                {office.whatsapp && (
                  <li>
                    <a
                      href={`https://wa.me/${office.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm flex items-center gap-2 transition-colors hover:underline text-white/70 hover:text-white"
                    >
                      <svg className="h-4 w-4 shrink-0 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      واتساب
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Social Links */}
          {showSocialLinks && (
            <div>
              <h3
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: 'var(--theme-accent)' }}
              >
                {dict.office.socialLinks}
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(socialLinks).map(([platform, url]) => {
                  if (!url) return null
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 w-9 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors bg-white/10 text-white/60 hover:bg-white/20 hover:text-white border border-white/10"
                      title={platform}
                    >
                      {socialIcons[platform] || platform.charAt(0).toUpperCase()}
                    </a>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50">
            &copy; {year} {copyrightLabel || officeName}.{' '}
            {locale === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
          </p>
          <a
            href="https://falz.sa"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full transition-colors bg-white/10 text-white/50 hover:text-white border border-white/10"
          >
            Powered by
            <FalzLogo className="h-4 w-4" style={{ color: 'var(--theme-accent)' }} />
            <span style={{ color: 'var(--theme-accent)' }} className="font-semibold">FALZ</span>
          </a>
        </div>
      </div>
    </footer>
  )
}

function FalzLogo({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 80 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* Top-left vertical bar */}
      <rect x="0" y="0" width="16" height="38" />
      {/* Top horizontal bar */}
      <rect x="24" y="0" width="56" height="14" />
      {/* Middle horizontal bar */}
      <rect x="24" y="32" width="38" height="14" />
      {/* Bottom L-shape */}
      <polygon points="0,56 16,56 16,84 60,84 60,100 0,100" />
    </svg>
  )
}
