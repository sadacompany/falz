'use client'

import { usePublicOffice } from '@/components/public/PublicOfficeContext'
import { ContactForm } from '@/components/public/ContactForm'
import { GoogleMapEmbed } from '@/components/shared/GoogleMapEmbed'
import { Phone, Mail, MapPin } from 'lucide-react'
import { WhatsAppIcon } from '@/components/public/WhatsAppIcon'

interface ContactPageClientProps {
  officeId: string
  officeName: string
  phone: string | null
  email: string | null
  whatsapp: string | null
  address: string | null
  city: string | null
  lat: number | null
  lng: number | null
  socialLinks: Record<string, string> | null
}

function SocialIcon({ platform }: { platform: string }) {
  const icons: Record<string, React.ReactNode> = {
    instagram: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
    twitter: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    snapchat: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M21.93 16.56c-2.07-.49-3-1.93-3.04-2a.86.86 0 01-.1-.18c-.16-.38-.05-.7.36-1.02.1-.08.22-.15.34-.22.27-.15.53-.3.74-.5.56-.53.76-1.17.54-1.73a1.62 1.62 0 00-1.54-.93c-.2 0-.38.03-.54.08a3.07 3.07 0 01-.42.07l.03-.52c.1-1.32.24-3.13-.5-4.53C16.4 2.7 13.54 2.5 12.17 2.5h-.33c-1.38 0-4.24.2-5.73 2.58-.74 1.4-.6 3.2-.5 4.53l.03.55a2.48 2.48 0 01-.47-.08 1.64 1.64 0 00-.52-.08c-.64 0-1.2.34-1.5.93-.22.55-.03 1.2.53 1.73.2.2.47.35.74.5.12.07.24.14.35.22.4.32.51.64.35 1.02a.86.86 0 01-.1.18c-.04.07-.97 1.51-3.04 2a.5.5 0 00-.39.53c.02.24.12.57.6.89.5.34 1.2.56 2.09.68.1.01.2.04.28.2.09.18.14.4.2.63.06.28.14.58.3.87.18.32.44.48.76.48.22 0 .46-.06.74-.14.38-.1.86-.23 1.5-.23.4 0 .8.05 1.22.15.88.22 1.6.83 2.3 1.43.84.72 1.7 1.46 3.1 1.46h.1c1.4 0 2.26-.74 3.1-1.46.7-.6 1.42-1.21 2.3-1.43.41-.1.82-.15 1.22-.15.64 0 1.12.13 1.5.23.28.08.52.14.74.14.32 0 .58-.16.75-.48.17-.29.25-.59.31-.87.06-.24.11-.45.2-.63.08-.16.18-.19.28-.2.89-.12 1.6-.34 2.1-.68.47-.32.57-.65.6-.89a.5.5 0 00-.4-.53z"/></svg>,
    linkedin: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
    tiktok: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
  }
  return <>{icons[platform] || <span className="text-xs font-bold uppercase">{platform.charAt(0)}</span>}</>
}

export function ContactPageClient({
  officeId,
  officeName,
  phone,
  email,
  whatsapp,
  address,
  city,
  lat,
  lng,
  socialLinks,
}: ContactPageClientProps) {
  const { dict } = usePublicOffice()

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <div className="text-center mb-16">
        <div className="h-1 w-12 rounded-full mx-auto mb-6" style={{ backgroundColor: 'var(--theme-accent)' }} />
        <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--theme-primary)' }}>
          تواصل معنا
        </h1>
        <p className="text-lg" style={{ color: 'var(--theme-muted)' }}>
          {officeName}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--theme-text)' }}>
            أرسل رسالة
          </h2>
          <ContactForm source="CONTACT_FORM" />
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--theme-text)' }}>
              معلومات التواصل
            </h2>
            <div className="space-y-4">
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-3 rounded-xl p-3 text-sm transition-colors hover:opacity-80"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 6%, transparent)', color: 'var(--theme-text)' }}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 15%, transparent)' }}
                  >
                    <Phone className="h-4 w-4" style={{ color: 'var(--theme-accent)' }} />
                  </div>
                  <span dir="ltr">{phone}</span>
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 rounded-xl p-3 text-sm transition-colors hover:opacity-80"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 6%, transparent)', color: 'var(--theme-text)' }}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 15%, transparent)' }}
                  >
                    <Mail className="h-4 w-4" style={{ color: 'var(--theme-accent)' }} />
                  </div>
                  {email}
                </a>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl p-3 text-sm transition-colors hover:opacity-80 bg-[#25D366]/5"
                  style={{ color: 'var(--theme-text)' }}
                >
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-[#25D366]/15">
                    <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                  </div>
                  تواصل عبر واتساب
                </a>
              )}
              {(address || city) && (
                <div
                  className="flex items-center gap-3 rounded-xl p-3 text-sm"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 6%, transparent)', color: 'var(--theme-text)' }}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 15%, transparent)' }}
                  >
                    <MapPin className="h-4 w-4" style={{ color: 'var(--theme-accent)' }} />
                  </div>
                  {[address, city].filter(Boolean).join(', ')}
                </div>
              )}
            </div>
          </div>

          {socialLinks && Object.values(socialLinks).some(Boolean) && (
            <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
              <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--theme-text)' }}>
                تابعنا
              </h2>
              <div className="flex flex-wrap gap-3">
                {Object.entries(socialLinks).map(([platform, url]) => {
                  if (!url) return null
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--theme-text) 6%, transparent)',
                        color: 'var(--theme-muted)',
                      }}
                      title={platform}
                    >
                      <SocialIcon platform={platform} />
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          {lat && lng && (
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--theme-border)' }}>
              <GoogleMapEmbed lat={lat} lng={lng} markerTitle={officeName} className="aspect-video" />
              <div className="p-4 flex items-center justify-between" style={{ backgroundColor: 'var(--theme-surface)' }}>
                <p className="text-xs" style={{ color: 'var(--theme-muted)' }}>
                  {[address, city].filter(Boolean).join(', ')}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs hover:underline"
                  style={{ color: 'var(--theme-accent)' }}
                >
                  فتح في الخريطة
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
