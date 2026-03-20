'use client'

import Link from 'next/link'
import { usePublicOffice } from '@/components/public/PublicOfficeContext'
import { useDirection } from '@/components/shared/DirectionProvider'
import { PropertyCard, type PropertyCardData } from '@/components/public/PropertyCard'
import { Phone, Mail, ChevronLeft, ChevronRight, Globe } from 'lucide-react'
import { WhatsAppIcon } from '@/components/public/WhatsAppIcon'

interface AgentData {
  id: string
  name: string
  photo: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  bio: string | null
  specialties: string[] | null
  languages: string[] | null
}

interface AgentProfileClientProps {
  officeSlug: string
  agent: AgentData
  properties: PropertyCardData[]
}

export function AgentProfileClient({
  officeSlug,
  agent,
  properties,
}: AgentProfileClientProps) {
  const { dict } = usePublicOffice()
  const { isRtl } = useDirection()

  const BackArrow = isRtl ? ChevronRight : ChevronLeft

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
      {/* Back */}
      <Link
        href={`/${officeSlug}/agents`}
        className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors hover:underline text-[#718096] hover:text-[#1E3A5F]"
      >
        <BackArrow className="h-4 w-4" />
        {dict.nav.agents}
      </Link>

      {/* Agent Profile Card */}
      <div className="rounded-2xl p-8 lg:p-12 mb-12 bg-white border border-[#E2E8F0] shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
          {/* Photo */}
          {agent.photo ? (
            <img
              src={agent.photo}
              alt={agent.name}
              className="h-32 w-32 rounded-2xl object-cover shrink-0"
            />
          ) : (
            <div className="h-32 w-32 rounded-2xl flex items-center justify-center text-4xl font-bold shrink-0 bg-[#C8A96E] text-white">
              {agent.name.charAt(0)}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 text-center sm:text-start">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1E3A5F]">
              {agent.name}
            </h1>

            {/* Specialties */}
            {agent.specialties && agent.specialties.length > 0 && (
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                {agent.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-[#FAF5EB] text-[#C8A96E]"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            )}

            {/* Languages */}
            {agent.languages && agent.languages.length > 0 && (
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
                <Globe className="h-4 w-4 text-[#A0AEC0]" />
                <span className="text-sm text-[#718096]">
                  {agent.languages.join(', ')}
                </span>
              </div>
            )}

            {/* Bio */}
            {agent.bio && (
              <p className="text-sm leading-relaxed mb-6 whitespace-pre-wrap text-[#2D3748]">
                {agent.bio}
              </p>
            )}

            {/* Contact Buttons */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              {agent.whatsapp && (
                <a
                  href={`https://wa.me/${agent.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 bg-[#25D366] text-white hover:bg-[#1EBE5A]"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  واتساب
                </a>
              )}
              {agent.phone && (
                <a
                  href={`tel:${agent.phone}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 bg-[#C8A96E] text-white hover:bg-[#B8963E]"
                >
                  <Phone className="h-4 w-4" />
                  {dict.common.call}
                </a>
              )}
              {agent.email && (
                <a
                  href={`mailto:${agent.email}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 bg-white text-[#1E3A5F] border border-[#E2E8F0] hover:border-[#1E3A5F]"
                >
                  <Mail className="h-4 w-4" />
                  {dict.common.email}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Agent's Properties */}
      {properties.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-8 text-[#1E3A5F]">
            {dict.nav.properties}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} officeSlug={officeSlug} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
