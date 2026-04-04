'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { usePublicOffice } from '@/components/public/PublicOfficeContext'
import { Phone, Mail, MapPin, Send, Loader2, CheckCircle } from 'lucide-react'
import { WhatsAppIcon } from '@/components/public/WhatsAppIcon'
import type { PageSectionConfig } from '@/types/sections'

interface Props {
  config: PageSectionConfig
  officeSlug: string
}

export function ContactFormSection({ config, officeSlug }: Props) {
  const { office } = usePublicOffice()

  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' })

  const title = config.content.titleAr || config.content.title || 'تواصل معنا'
  const subtitle = config.content.subtitleAr || config.content.subtitle || 'نسعد بتواصلكم'
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

  const address = office.addressAr || office.address
  const city = office.cityAr || office.city
  const fullAddress = [address, city].filter(Boolean).join(', ')

  const inputStyle = {
    backgroundColor: 'var(--theme-background)',
    borderColor: 'var(--theme-border)',
    color: 'var(--theme-text)',
  }

  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: 'var(--theme-surface)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{ color: 'var(--theme-primary)' }}
          >
            {title}
          </h2>
          <div
            className="mx-auto h-1 w-16 rounded-full mb-4"
            style={{ backgroundColor: 'var(--theme-accent)' }}
          />
          <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--theme-muted)' }}>
            {subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {formState === 'sent' ? (
              <div
                className="flex flex-col items-center justify-center text-center py-16 rounded-2xl"
                style={{
                  backgroundColor: 'var(--theme-background)',
                  borderWidth: '1px',
                  borderColor: 'var(--theme-border)',
                }}
              >
                <div
                  className="h-16 w-16 rounded-full flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--theme-accent) 15%, transparent)',
                  }}
                >
                  <CheckCircle className="h-8 w-8" style={{ color: 'var(--theme-accent)' }} />
                </div>
                <p
                  className="text-lg font-semibold mb-1"
                  style={{ color: 'var(--theme-primary)' }}
                >
                  تم إرسال رسالتك بنجاح
                </p>
                <p className="text-sm" style={{ color: 'var(--theme-muted)' }}>
                  سنتواصل معك في أقرب وقت
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: 'var(--theme-primary)' }}
                    >
                      الاسم *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      className="w-full h-12 rounded-xl px-4 text-sm border transition-colors focus:outline-none focus:ring-2"
                      style={{
                        ...inputStyle,
                        '--tw-ring-color': 'var(--theme-accent)',
                      } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: 'var(--theme-primary)' }}
                    >
                      رقم الهاتف *
                    </label>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={formData.phone}
                      onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full h-12 rounded-xl px-4 text-sm border transition-colors focus:outline-none focus:ring-2"
                      style={{
                        ...inputStyle,
                        '--tw-ring-color': 'var(--theme-accent)',
                      } as React.CSSProperties}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: 'var(--theme-primary)' }}
                  >
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    className="w-full h-12 rounded-xl px-4 text-sm border transition-colors focus:outline-none focus:ring-2"
                    style={{
                      ...inputStyle,
                      '--tw-ring-color': 'var(--theme-accent)',
                    } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: 'var(--theme-primary)' }}
                  >
                    الرسالة
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                    className="w-full rounded-xl px-4 py-3 text-sm border transition-colors focus:outline-none focus:ring-2 resize-none"
                    style={{
                      ...inputStyle,
                      '--tw-ring-color': 'var(--theme-accent)',
                    } as React.CSSProperties}
                  />
                </div>
                <button
                  type="submit"
                  disabled={formState === 'sending'}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: 'var(--theme-accent)' }}
                >
                  {formState === 'sending' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {formState === 'error' ? 'حدث خطأ، حاول مرة أخرى' : 'إرسال'}
                </button>
              </form>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {mapEmbed && (
              <div
                className="rounded-2xl overflow-hidden aspect-video"
                style={{ borderWidth: '1px', borderColor: 'var(--theme-border)' }}
              >
                <iframe
                  src={mapEmbed}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="خريطة الموقع"
                />
              </div>
            )}

            <div
              className="rounded-2xl p-6 space-y-4"
              style={{
                backgroundColor: 'var(--theme-background)',
                borderWidth: '1px',
                borderColor: 'var(--theme-border)',
              }}
            >
              {office.phone && (
                <a
                  href={`tel:${office.phone}`}
                  className="flex items-center gap-3 text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--theme-text)' }}
                  dir="ltr"
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor:
                        'color-mix(in srgb, var(--theme-accent) 12%, var(--theme-surface))',
                    }}
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
                  style={{ color: 'var(--theme-text)' }}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor:
                        'color-mix(in srgb, var(--theme-accent) 12%, var(--theme-surface))',
                    }}
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
                  style={{ color: 'var(--theme-text)' }}
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
                  style={{ color: 'var(--theme-text)' }}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor:
                        'color-mix(in srgb, var(--theme-accent) 12%, var(--theme-surface))',
                    }}
                  >
                    <MapPin className="h-4 w-4" style={{ color: 'var(--theme-accent)' }} />
                  </div>
                  {fullAddress}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
