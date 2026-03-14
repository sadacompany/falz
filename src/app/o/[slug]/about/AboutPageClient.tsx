'use client'

import Link from 'next/link'
import { usePublicOffice } from '@/components/public/PublicOfficeContext'
import { useDirection } from '@/components/shared/DirectionProvider'
import { Building2, Users, Phone, Mail, MapPin, Globe } from 'lucide-react'
import { WhatsAppIcon } from '@/components/public/WhatsAppIcon'

interface AboutPageClientProps {
  officeSlug: string
  officeName: string
  description: string | null
  phone: string | null
  email: string | null
  whatsapp: string | null
  address: string | null
  city: string | null
  falLicenseNo: string | null
  website: string | null
  socialLinks: Record<string, string> | null
  stats: { totalProperties: number; totalAgents: number }
  agents: {
    id: string
    name: string
    nameAr: string | null
    photo: string | null
    slug: string | null
    specialties: string[] | null
  }[]
}

export function AboutPageClient({
  officeSlug,
  officeName,
  description,
  phone,
  email,
  whatsapp,
  address,
  city,
  falLicenseNo,
  website,
  socialLinks,
  stats,
  agents,
}: AboutPageClientProps) {
  const { dict } = usePublicOffice()
  const { locale } = useDirection()

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      {/* ─── Header ──────────────────────────────────── */}
      <div className="text-center mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-[#1E3A5F]">
          {dict.nav.about}
        </h1>
        <p className="text-lg max-w-2xl mx-auto text-[#718096]">
          {officeName}
        </p>
      </div>

      {/* ─── Description ─────────────────────────────── */}
      {description && (
        <div className="rounded-2xl p-8 lg:p-12 mb-12 bg-white border border-[#E2E8F0] shadow-sm">
          <div className="prose max-w-none text-base leading-relaxed whitespace-pre-wrap text-[#2D3748]">
            {description}
          </div>
        </div>
      )}

      {/* ─── Stats ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-6 mb-16">
        <div className="rounded-xl p-8 text-center bg-white border border-[#E2E8F0] shadow-sm">
          <Building2 className="h-8 w-8 mx-auto mb-3 text-[#C8A96E]" />
          <p className="text-3xl font-bold mb-1 text-[#1E3A5F]">
            {stats.totalProperties}
          </p>
          <p className="text-sm text-[#718096]">
            {dict.dashboard.totalProperties}
          </p>
        </div>
        <div className="rounded-xl p-8 text-center bg-white border border-[#E2E8F0] shadow-sm">
          <Users className="h-8 w-8 mx-auto mb-3 text-[#C8A96E]" />
          <p className="text-3xl font-bold mb-1 text-[#1E3A5F]">
            {stats.totalAgents}
          </p>
          <p className="text-sm text-[#718096]">
            {dict.dashboard.totalAgents}
          </p>
        </div>
      </div>

      {/* ─── Team / Agents ──────────────────────────── */}
      {agents.length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center text-[#1E3A5F]">
            {dict.office.team}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {agents.map((agent) => {
              const agentName = locale === 'ar' && agent.nameAr ? agent.nameAr : agent.name
              return (
                <Link
                  key={agent.id}
                  href={agent.slug ? `/o/${officeSlug}/agents/${agent.slug}` : `/o/${officeSlug}/agents`}
                  className="group text-center rounded-xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg bg-white border border-[#E2E8F0]"
                >
                  {agent.photo ? (
                    <img
                      src={agent.photo}
                      alt={agentName}
                      className="h-20 w-20 rounded-full object-cover mx-auto mb-4"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 bg-[#C8A96E] text-white">
                      {agentName.charAt(0)}
                    </div>
                  )}
                  <p className="font-semibold text-sm text-[#1E3A5F]">
                    {agentName}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── Contact Info ────────────────────────────── */}
      <div className="rounded-2xl p-8 lg:p-12 bg-white border border-[#E2E8F0] shadow-sm">
        <h2 className="text-2xl font-bold mb-8 text-[#1E3A5F]">
          {dict.nav.contact}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {phone && (
            <a href={`tel:${phone}`} className="flex items-center gap-3 text-sm hover:underline text-[#2D3748]">
              <Phone className="h-5 w-5 shrink-0 text-[#C8A96E]" />
              <span dir="ltr">{phone}</span>
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className="flex items-center gap-3 text-sm hover:underline text-[#2D3748]">
              <Mail className="h-5 w-5 shrink-0 text-[#C8A96E]" />
              {email}
            </a>
          )}
          {whatsapp && (
            <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:underline text-[#2D3748]">
              <WhatsAppIcon className="h-5 w-5 shrink-0 text-[#25D366]" />
              واتساب
            </a>
          )}
          {website && (
            <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:underline text-[#2D3748]">
              <Globe className="h-5 w-5 shrink-0 text-[#C8A96E]" />
              {website}
            </a>
          )}
          {(address || city) && (
            <div className="flex items-start gap-3 text-sm text-[#2D3748]">
              <MapPin className="h-5 w-5 shrink-0 mt-0.5 text-[#C8A96E]" />
              <span>{[address, city].filter(Boolean).join(', ')}</span>
            </div>
          )}
          {falLicenseNo && (
            <div className="flex items-center gap-3 text-sm text-[#2D3748]">
              <Building2 className="h-5 w-5 shrink-0 text-[#C8A96E]" />
              {dict.office.falLicenseNo}: {falLicenseNo}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
