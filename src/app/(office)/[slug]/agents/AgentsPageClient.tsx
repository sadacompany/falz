'use client'

import Link from 'next/link'
import { usePublicOffice } from '@/components/public/PublicOfficeContext'
import { Phone, Mail } from 'lucide-react'
import { WhatsAppIcon } from '@/components/public/WhatsAppIcon'

interface AgentData {
  id: string
  name: string
  photo: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  bio: string | null
  slug: string | null
  specialties: string[] | null
  languages: string[] | null
}

interface AgentsPageClientProps {
  officeSlug: string
  agents: AgentData[]
}

export function AgentsPageClient({ officeSlug, agents }: AgentsPageClientProps) {
  const { dict } = usePublicOffice()

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-[#1E3A5F]">
          {dict.nav.agents}
        </h1>
      </div>

      {/* Agents Grid */}
      {agents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-white border border-[#E2E8F0]"
            >
              {/* Photo */}
              <div className="p-6 pb-0 text-center">
                {agent.photo ? (
                  <img
                    src={agent.photo}
                    alt={agent.name}
                    className="h-24 w-24 rounded-full object-cover mx-auto mb-4"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 bg-[#C8A96E] text-white">
                    {agent.name.charAt(0)}
                  </div>
                )}

                {/* Name */}
                <h3 className="text-lg font-semibold mb-1 text-[#1E3A5F]">
                  {agent.slug ? (
                    <Link
                      href={`/${officeSlug}/agents/${agent.slug}`}
                      className="hover:underline hover:text-[#C8A96E] transition-colors"
                    >
                      {agent.name}
                    </Link>
                  ) : (
                    agent.name
                  )}
                </h3>

                {/* Specialties */}
                {agent.specialties && agent.specialties.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 mb-3">
                    {agent.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="px-2 py-0.5 rounded text-xs bg-[#FAF5EB] text-[#C8A96E]"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bio snippet */}
                {agent.bio && (
                  <p className="text-sm line-clamp-2 mb-4 text-[#718096]">
                    {agent.bio}
                  </p>
                )}
              </div>

              {/* Contact Buttons */}
              <div className="p-4 flex gap-2 border-t border-[#E2E8F0]">
                {agent.whatsapp && (
                  <a
                    href={`https://wa.me/${agent.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-colors hover:opacity-90 bg-[#25D366] text-white"
                  >
                    <WhatsAppIcon className="h-3.5 w-3.5" />
                    واتساب
                  </a>
                )}
                {agent.phone && (
                  <a
                    href={`tel:${agent.phone}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-colors hover:opacity-90 bg-[#C8A96E] text-white"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {dict.common.call}
                  </a>
                )}
                {agent.email && (
                  <a
                    href={`mailto:${agent.email}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-colors hover:opacity-90 bg-white text-[#1E3A5F] border border-[#E2E8F0] hover:border-[#1E3A5F]"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {dict.common.email}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl p-16 text-center bg-white border border-[#E2E8F0]">
          <p className="text-lg font-semibold text-[#2D3748]">
            {dict.common.noData}
          </p>
        </div>
      )}
    </div>
  )
}
