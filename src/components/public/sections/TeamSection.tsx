'use client'

import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import type { PageSectionConfig } from '@/types/sections'

interface Props {
  config: PageSectionConfig
}

export function TeamSection({ config }: Props) {
  const ref = useScrollAnimation<HTMLElement>()

  const title = config.content.titleAr || config.content.title || 'فريقنا'
  const items = config.content.items || []

  if (!items.length) return null

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
            className="mx-auto h-1 w-16 rounded-full"
            style={{ backgroundColor: 'var(--theme-accent)' }}
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-on-scroll-children">
          {items.map((member, i) => {
            const name = member.nameAr || member.name || ''
            const role = member.roleAr || member.role || ''
            const bio = member.descriptionAr || member.description || ''

            return (
              <div key={i} className="group text-center">
                {/* Photo */}
                <div className="relative overflow-hidden rounded-2xl mb-4 aspect-[3/4]">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="h-full w-full flex items-center justify-center text-4xl font-bold text-white"
                      style={{ backgroundColor: 'var(--theme-primary)' }}
                    >
                      {name.charAt(0)}
                    </div>
                  )}
                  {/* Hover shadow */}
                  <div className="absolute inset-0 shadow-inner opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Info */}
                <h3 className="text-base font-bold" style={{ color: 'var(--theme-primary)' }}>
                  {name}
                </h3>
                <p className="text-sm mb-1" style={{ color: 'var(--theme-accent)' }}>
                  {role}
                </p>
                {bio && (
                  <p className="text-xs line-clamp-2" style={{ color: 'var(--theme-muted)' }}>
                    {bio}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
