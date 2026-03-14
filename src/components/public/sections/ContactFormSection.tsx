'use client'

import { useState } from 'react'
import { usePublicOffice } from '@/components/public/PublicOfficeContext'
import { useDirection } from '@/components/shared/DirectionProvider'
import { Phone, Mail, MapPin, Send, Loader2, CheckCircle } from 'lucide-react'
import { WhatsAppIcon } from '@/components/public/WhatsAppIcon'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import type { PageSectionConfig } from '@/types/sections'

interface Props {
  config: PageSectionConfig
  officeSlug: string
}

export function ContactFormSection({ config, officeSlug }: Props) {
  const { office, dict } = usePublicOffice()
  const { locale } = useDirection()
  const ref = useScrollAnimation<HTMLElement>()

  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' })

  const title = (locale === 'ar' ? config.content.titleAr : config.content.title) || (locale === 'ar' ? 'تواصل معنا' : 'Contact Us')
  const subtitle = (locale === 'ar' ? config.content.subtitleAr : config.content.subtitle) || (locale === 'ar' ? 'نسعد بتواصلكم' : 'We\'d love to hear from you')
  const mapEmbed = config.content.mapEmbed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('sending')

    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          officeId: office.id,
        }),
      })

      if (!res.ok) throw new Error('Failed')
      setFormState('sent')
      setFormData({ name: '', phone: '', email: '', message: '' })
      setTimeout(() => setFormState('idle'), 4000)
    } catch {
      setFormState('error')
      setTimeout(() => setFormState('idle'), 3000)
    }
  }

  const address = locale === 'ar' && office.addressAr ? office.addressAr : office.address
  const city = locale === 'ar' && office.cityAr ? office.cityAr : office.city
  const fullAddress = [address, city].filter(Boolean).join(', ')

  return (
    <section
      ref={ref}
      className="animate-on-scroll py-20 sm:py-28"
      style={{ backgroundColor: 'var(--theme-surface)' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--theme-primary)' }}>
            {title}
          </h2>
          <div
            className="mx-auto h-1 w-16 rounded-full mb-4"
            style={{ backgroundColor: 'var(--theme-accent)' }}
          />
          <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--theme-muted)' }}>
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--theme-primary)' }}>
                  {locale === 'ar' ? 'الاسم' : 'Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full h-12 rounded-xl px-4 text-sm border transition-colors focus:outline-none"
                  style={{
                    backgroundColor: 'var(--theme-background)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--theme-primary)' }}>
                  {locale === 'ar' ? 'رقم الهاتف' : 'Phone'} *
                </label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full h-12 rounded-xl px-4 text-sm border transition-colors focus:outline-none"
                  style={{
                    backgroundColor: 'var(--theme-background)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--theme-primary)' }}>
                {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                className="w-full h-12 rounded-xl px-4 text-sm border transition-colors focus:outline-none"
                style={{
                  backgroundColor: 'var(--theme-background)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text)',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--theme-primary)' }}>
                {locale === 'ar' ? 'الرسالة' : 'Message'} *
              </label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                className="w-full rounded-xl px-4 py-3 text-sm border transition-colors focus:outline-none resize-none"
                style={{
                  backgroundColor: 'var(--theme-background)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text)',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={formState === 'sending'}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-105 disabled:opacity-60"
              style={{ backgroundColor: 'var(--theme-accent)' }}
            >
              {formState === 'sending' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : formState === 'sent' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {formState === 'sent'
                ? (locale === 'ar' ? 'تم الإرسال!' : 'Sent!')
                : formState === 'error'
                  ? (locale === 'ar' ? 'حدث خطأ' : 'Error')
                  : (locale === 'ar' ? 'إرسال' : 'Send')}
            </button>
          </form>

          {/* Contact Info + Map */}
          <div className="space-y-6">
            {/* Map embed */}
            {mapEmbed && (
              <div className="rounded-2xl overflow-hidden aspect-video">
                <iframe
                  src={mapEmbed}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Map"
                />
              </div>
            )}

            {/* Contact details */}
            <div className="space-y-4">
              {office.phone && (
                <a
                  href={`tel:${office.phone}`}
                  className="flex items-center gap-3 text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--theme-muted)' }}
                  dir="ltr"
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 12%, var(--theme-surface))' }}
                  >
                    <Phone className="h-4 w-4" style={{ color: 'var(--theme-accent)' }} />
                  </div>
                  {office.phone}
                </a>
              )}
              {office.email && (
                <a
                  href={`mailto:${office.email}`}
                  className="flex items-center gap-3 text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--theme-muted)' }}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 12%, var(--theme-surface))' }}
                  >
                    <Mail className="h-4 w-4" style={{ color: 'var(--theme-accent)' }} />
                  </div>
                  {office.email}
                </a>
              )}
              {office.whatsapp && (
                <a
                  href={`https://wa.me/${office.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--theme-muted)' }}
                >
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-[#25D366]/10">
                    <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                  </div>
                  واتساب
                </a>
              )}
              {fullAddress && (
                <div
                  className="flex items-center gap-3 text-sm"
                  style={{ color: 'var(--theme-muted)' }}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 12%, var(--theme-surface))' }}
                  >
                    <MapPin className="h-4 w-4" style={{ color: 'var(--theme-accent)' }} />
                  </div>
                  {fullAddress}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
