'use client'

import { motion } from 'framer-motion'
import type { PageSectionConfig } from '@/types/sections'

interface Props {
  config: PageSectionConfig
}

export function TeamSection({ config }: Props) {
  const title = config.content.titleAr || config.content.title || 'فريقنا'
  const items = config.content.items || []

  if (!items.length) return null

  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: 'var(--theme-surface)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{ color: 'var(--theme-primary)' }}
          >
            {title}
          </h2>
          <div
            className="mx-auto h-1 w-16 rounded-full"
            style={{ backgroundColor: 'var(--theme-accent)' }}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((member, i) => {
            const name = member.nameAr || member.name || ''
            const role = member.roleAr || member.role || ''
            const bio = member.descriptionAr || member.description || ''

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group text-center"
              >
                <div className="relative overflow-hidden rounded-xl aspect-square mb-4">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="h-full w-full flex items-center justify-center text-5xl font-bold text-white"
                      style={{ backgroundColor: 'var(--theme-accent)' }}
                    >
                      {name.charAt(0)}
                    </div>
                  )}
                  {bio && (
                    <div
                      className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}
                    >
                      <p className="text-xs text-white leading-relaxed line-clamp-3">{bio}</p>
                    </div>
                  )}
                </div>

                <h3
                  className="text-sm sm:text-base font-bold"
                  style={{ color: 'var(--theme-primary)' }}
                >
                  {name}
                </h3>
                <p className="text-xs sm:text-sm" style={{ color: 'var(--theme-muted)' }}>
                  {role}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
