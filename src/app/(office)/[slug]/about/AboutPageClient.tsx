'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
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
  return (
    <div>
      <section
        className="py-16 md:py-24"
        style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary) 4%, var(--theme-background))' }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-1 w-12 rounded-full mx-auto mb-6" style={{ backgroundColor: 'var(--theme-accent)' }} />
            <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--theme-primary)' }}>
              من نحن
            </h1>
            <p className="text-lg" style={{ color: 'var(--theme-muted)' }}>
              {officeName}
            </p>
          </motion.div>

          {description && (
            <motion.div
              className="max-w-3xl mx-auto rounded-2xl p-8 lg:p-10"
              style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <p
                className="text-base leading-[1.9] whitespace-pre-wrap text-center"
                style={{ color: 'var(--theme-text)' }}
              >
                {description}
              </p>
            </motion.div>
          )}
        </div>
      </section>

      <section className="py-16" style={{ backgroundColor: 'var(--theme-background)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {[
              { icon: Building2, value: stats.totalProperties, label: 'إجمالي العقارات' },
              { icon: Users, value: stats.totalAgents, label: 'عدد الوكلاء' },
              { icon: MapPin, value: city || '—', label: 'الموقع' },
              { icon: Globe, value: falLicenseNo || '—', label: 'رخصة فال' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div
                  key={i}
                  className="rounded-xl p-6 text-center"
                  style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}
                >
                  <div
                    className="h-11 w-11 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 12%, transparent)' }}
                  >
                    <Icon className="h-5 w-5" style={{ color: 'var(--theme-accent)' }} />
                  </div>
                  <p className="text-2xl font-bold mb-1" style={{ color: 'var(--theme-primary)' }}>
                    {typeof item.value === 'number' ? item.value : item.value}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--theme-muted)' }}>
                    {item.label}
                  </p>
                </div>
              )
            })}
          </motion.div>

          {agents.length > 0 && (
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-10">
                <div className="h-1 w-12 rounded-full mx-auto mb-6" style={{ backgroundColor: 'var(--theme-accent)' }} />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--theme-primary)' }}>
                  فريق العمل
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {agents.map((agent, i) => {
                  const agentName = agent.nameAr || agent.name
                  return (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                    >
                      <Link
                        href={agent.slug ? `/${officeSlug}/agents/${agent.slug}` : `/${officeSlug}/agents`}
                        className="group block text-center rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                        style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}
                      >
                        {agent.photo ? (
                          <img
                            src={agent.photo}
                            alt={agentName}
                            className="h-20 w-20 rounded-full object-cover mx-auto mb-4 transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div
                            className="h-20 w-20 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 text-white"
                            style={{ backgroundColor: 'var(--theme-accent)' }}
                          >
                            {agentName.charAt(0)}
                          </div>
                        )}
                        <p className="font-semibold text-sm" style={{ color: 'var(--theme-primary)' }}>
                          {agentName}
                        </p>
                        {agent.specialties && agent.specialties.length > 0 && (
                          <p className="text-xs mt-1" style={{ color: 'var(--theme-muted)' }}>
                            {agent.specialties.slice(0, 2).join(' · ')}
                          </p>
                        )}
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          <motion.div
            className="rounded-2xl p-8 lg:p-10"
            style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <div className="h-1 w-12 rounded-full mx-auto mb-6" style={{ backgroundColor: 'var(--theme-accent)' }} />
              <h2 className="text-2xl font-bold" style={{ color: 'var(--theme-primary)' }}>
                تواصل معنا
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-3 rounded-xl p-4 text-sm transition-colors hover:opacity-80"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 6%, transparent)', color: 'var(--theme-text)' }}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 15%, transparent)' }}
                  >
                    <Phone className="h-4 w-4" style={{ color: 'var(--theme-accent)' }} />
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--theme-muted)' }}>هاتف</p>
                    <p className="font-medium" dir="ltr">{phone}</p>
                  </div>
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 rounded-xl p-4 text-sm transition-colors hover:opacity-80"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 6%, transparent)', color: 'var(--theme-text)' }}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 15%, transparent)' }}
                  >
                    <Mail className="h-4 w-4" style={{ color: 'var(--theme-accent)' }} />
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--theme-muted)' }}>بريد إلكتروني</p>
                    <p className="font-medium">{email}</p>
                  </div>
                </a>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl p-4 text-sm transition-colors hover:opacity-80 bg-[#25D366]/5"
                  style={{ color: 'var(--theme-text)' }}
                >
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-[#25D366]/15">
                    <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--theme-muted)' }}>واتساب</p>
                    <p className="font-medium">تواصل عبر واتساب</p>
                  </div>
                </a>
              )}
              {(address || city) && (
                <div
                  className="flex items-center gap-3 rounded-xl p-4 text-sm"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 6%, transparent)', color: 'var(--theme-text)' }}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 15%, transparent)' }}
                  >
                    <MapPin className="h-4 w-4" style={{ color: 'var(--theme-accent)' }} />
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--theme-muted)' }}>العنوان</p>
                    <p className="font-medium">{[address, city].filter(Boolean).join(', ')}</p>
                  </div>
                </div>
              )}
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl p-4 text-sm transition-colors hover:opacity-80"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 6%, transparent)', color: 'var(--theme-text)' }}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 15%, transparent)' }}
                  >
                    <Globe className="h-4 w-4" style={{ color: 'var(--theme-accent)' }} />
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--theme-muted)' }}>الموقع الإلكتروني</p>
                    <p className="font-medium">{website}</p>
                  </div>
                </a>
              )}
              {falLicenseNo && (
                <div
                  className="flex items-center gap-3 rounded-xl p-4 text-sm"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 6%, transparent)', color: 'var(--theme-text)' }}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--theme-accent) 15%, transparent)' }}
                  >
                    <Building2 className="h-4 w-4" style={{ color: 'var(--theme-accent)' }} />
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--theme-muted)' }}>رخصة فال</p>
                    <p className="font-medium">{falLicenseNo}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
