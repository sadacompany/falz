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

const socialIcons: Record<string, string> = {
  twitter: 'X',
  instagram: 'IG',
  snapchat: 'SC',
  linkedin: 'LI',
  tiktok: 'TT',
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
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-[#1E3A5F]">
          {dict.nav.contact}
        </h1>
        <p className="text-lg text-[#718096]">
          {officeName}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="rounded-2xl p-8 bg-white border border-[#E2E8F0] shadow-sm">
          <h2 className="text-xl font-bold mb-6 text-[#1E3A5F]">
            {dict.property.contactForm}
          </h2>
          <ContactForm source="CONTACT_FORM" />
        </div>

        {/* Contact Details */}
        <div className="space-y-6">
          {/* Contact Info Card */}
          <div className="rounded-2xl p-8 bg-white border border-[#E2E8F0] shadow-sm">
            <h2 className="text-xl font-bold mb-6 text-[#1E3A5F]">
              {dict.common.details}
            </h2>
            <div className="space-y-5">
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-4 text-sm hover:underline transition-colors text-[#2D3748]"
                >
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-[#FAF5EB]">
                    <Phone className="h-5 w-5 text-[#C8A96E]" />
                  </div>
                  <span dir="ltr">{phone}</span>
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-4 text-sm hover:underline transition-colors text-[#2D3748]"
                >
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-[#FAF5EB]">
                    <Mail className="h-5 w-5 text-[#C8A96E]" />
                  </div>
                  {email}
                </a>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-sm hover:underline transition-colors text-[#2D3748]"
                >
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-[#25D366]/10">
                    <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
                  </div>
                  واتساب
                </a>
              )}
              {(address || city) && (
                <div className="flex items-start gap-4 text-sm text-[#2D3748]">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-[#FAF5EB]">
                    <MapPin className="h-5 w-5 text-[#C8A96E]" />
                  </div>
                  <span className="pt-2">{[address, city].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Social Links */}
          {socialLinks && Object.keys(socialLinks).length > 0 && (
            <div className="rounded-2xl p-8 bg-white border border-[#E2E8F0] shadow-sm">
              <h2 className="text-xl font-bold mb-6 text-[#1E3A5F]">
                {dict.office.socialLinks}
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
                      className="h-12 w-12 rounded-xl flex items-center justify-center text-sm font-semibold transition-all hover:scale-110 bg-[#FAFAF7] text-[#1E3A5F] border border-[#E2E8F0] hover:border-[#C8A96E] hover:text-[#C8A96E]"
                      title={platform}
                    >
                      {socialIcons[platform] || platform.charAt(0).toUpperCase()}
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          {/* Map */}
          {lat && lng && (
            <div className="rounded-2xl overflow-hidden bg-white border border-[#E2E8F0] shadow-sm">
              <GoogleMapEmbed
                lat={lat}
                lng={lng}
                markerTitle={officeName}
                className="aspect-video"
              />
              <div className="p-4 flex items-center justify-between">
                <p className="text-xs text-[#718096]">
                  {[address, city].filter(Boolean).join(', ')}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#C8A96E] hover:underline"
                >
                  {dict.common.map}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
