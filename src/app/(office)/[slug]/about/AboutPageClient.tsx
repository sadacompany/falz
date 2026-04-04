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

              {socialLinks && Object.values(socialLinks).some(Boolean) && (
                <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--theme-border)' }}>
                  <p className="text-sm font-semibold mb-4 text-center" style={{ color: 'var(--theme-primary)' }}>
                    تابعنا على
                  </p>
                  <div className="flex justify-center gap-3">
                    {Object.entries(socialLinks).map(([platform, url]) => {
                      if (!url) return null
                      const icons: Record<string, { icon: React.ReactNode; label: string }> = {
                        instagram: {
                          label: 'انستغرام',
                          icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
                        },
                        twitter: {
                          label: 'إكس',
                          icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
                        },
                        snapchat: {
                          label: 'سناب شات',
                          icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.166 1c.59 0 3.249.052 4.605 2.593.682 1.277.548 3.058.455 4.279l-.013.173c-.024.334-.048.668-.048.894a.458.458 0 00.2.078c.357-.067.584-.196.762-.303.148-.09.269-.164.418-.164a.726.726 0 01.289.06c.524.222.524.56.524.672 0 .27-.193.507-.598.738-.123.07-.284.14-.464.218-.396.17-.946.407-1.078.742-.088.226-.025.523.187.892l.012.022c.03.054 2.993 5.325-1.733 6.514a.573.573 0 00-.402.454c-.034.2.03.4.15.543.204.24.467.39.67.5.117.065.218.12.289.17.518.358.629.68.583.895-.078.367-.512.604-1.287.704-.254.033-.523.047-.817.063-.36.02-.773.044-1.254.113-.31.045-.6.2-.927.372-.522.274-1.17.615-2.158.615h-.036c-.986 0-1.634-.34-2.155-.614-.327-.172-.618-.328-.929-.373-.48-.069-.893-.092-1.254-.113-.293-.016-.563-.03-.816-.063-.778-.1-1.21-.337-1.29-.706-.045-.214.066-.536.585-.895.07-.05.171-.104.288-.17.204-.11.466-.26.67-.5.12-.143.184-.343.15-.543a.573.573 0 00-.402-.454c-4.666-1.172-1.774-6.42-1.737-6.49l.023-.046c.21-.367.274-.664.186-.89-.132-.335-.682-.572-1.078-.742a4.295 4.295 0 01-.464-.218c-.362-.21-.597-.439-.597-.702 0-.192.1-.467.469-.656a.778.778 0 01.345-.076c.149 0 .27.074.418.164.178.107.405.236.762.303a.462.462 0 00.2-.078c0-.226-.024-.56-.048-.894l-.013-.173c-.093-1.221-.227-3.002.455-4.28C8.725 1.052 11.382 1 11.97 1h.196z"/></svg>,
                        },
                        linkedin: {
                          label: 'لينكدإن',
                          icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
                        },
                        tiktok: {
                          label: 'تيك توك',
                          icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
                        },
                      }
                      const info = icons[platform]
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                          style={{
                            backgroundColor: 'color-mix(in srgb, var(--theme-primary) 8%, transparent)',
                            color: 'var(--theme-primary)',
                          }}
                          title={info?.label || platform}
                        >
                          {info?.icon || <span className="text-xs font-bold">{platform.charAt(0).toUpperCase()}</span>}
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
