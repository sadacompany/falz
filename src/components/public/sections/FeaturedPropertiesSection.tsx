'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Building2, MapPin, BedDouble, Bath, Maximize, ArrowLeft } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { PageSectionConfig } from '@/types/sections'
import type { PropertyCardData } from '@/components/public/PropertyCard'

interface Props {
  config: PageSectionConfig
  officeSlug: string
  properties: PropertyCardData[]
  stats: { totalProperties: number }
}

export function FeaturedPropertiesSection({ config, officeSlug, properties, stats }: Props) {
  const title = config.content.titleAr || config.content.title || 'العقارات المميزة'

  if (!properties.length) {
    return (
      <section
        className="py-20 md:py-28"
        style={{ backgroundColor: 'var(--theme-surface)' }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
              style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)' }}
            >
              <Building2
                className="h-10 w-10"
                style={{ color: 'var(--theme-primary)' }}
              />
            </div>
            <p
              className="text-lg font-medium"
              style={{ color: 'var(--theme-muted)' }}
            >
              لا توجد عقارات حالياً
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className="py-20 md:py-28"
      style={{ backgroundColor: 'var(--theme-surface)' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <h2
            className="text-3xl font-bold sm:text-4xl"
            style={{ color: 'var(--theme-text)' }}
          >
            {title}
          </h2>
          <div
            className="mx-auto mt-3 h-1 w-14 rounded-full"
            style={{ backgroundColor: 'var(--theme-accent)' }}
          />
          <div
            className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--theme-accent) 12%, transparent)',
              color: 'var(--theme-accent)',
            }}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>{stats.totalProperties} عقار</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {properties.map((property, i) => (
            <PropertyCard
              key={property.id}
              property={property}
              officeSlug={officeSlug}
              index={i}
            />
          ))}
        </div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Link
            href={`/${officeSlug}/properties`}
            className="inline-flex items-center gap-2.5 rounded-xl border-2 px-8 py-3.5 text-sm font-semibold transition-all duration-300 hover:scale-105"
            style={{
              borderColor: 'var(--theme-accent)',
              color: 'var(--theme-accent)',
            }}
          >
            عرض جميع العقارات
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function PropertyCard({
  property,
  officeSlug,
  index,
}: {
  property: PropertyCardData
  officeSlug: string
  index: number
}) {
  const title = property.titleAr || property.title
  const city = property.cityAr || property.city
  const district = property.districtAr || property.district
  const location = [district, city].filter(Boolean).join('، ')
  const imageUrl = property.media[0]?.url || '/placeholder-property.jpg'
  const imageAlt = property.media[0]?.altAr || property.media[0]?.alt || title

  const price = formatPrice(
    typeof property.price === 'string' ? parseInt(property.price) : property.price,
    property.currency
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        href={`/${officeSlug}/properties/${property.slug}`}
        className="group block overflow-hidden rounded-2xl transition-shadow duration-300 hover:shadow-xl"
        style={{
          backgroundColor: 'var(--theme-background)',
          border: '1px solid var(--theme-border)',
        }}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-3 start-3">
            <span
              className="inline-block rounded-lg px-3 py-1.5 text-sm font-bold text-white shadow-lg"
              style={{ backgroundColor: 'var(--theme-accent)' }}
            >
              {price}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3
            className="mb-2 line-clamp-1 text-base font-semibold"
            style={{ color: 'var(--theme-text)' }}
          >
            {title}
          </h3>

          {location && (
            <p
              className="mb-3 flex items-center gap-1.5 text-sm"
              style={{ color: 'var(--theme-muted)' }}
            >
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{location}</span>
            </p>
          )}

          <div
            className="flex items-center gap-4 border-t pt-3"
            style={{ borderColor: 'var(--theme-border)' }}
          >
            {property.bedrooms != null && (
              <div
                className="flex items-center gap-1.5 text-sm"
                style={{ color: 'var(--theme-text)' }}
              >
                <BedDouble className="h-4 w-4" style={{ color: 'var(--theme-muted)' }} />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms != null && (
              <div
                className="flex items-center gap-1.5 text-sm"
                style={{ color: 'var(--theme-text)' }}
              >
                <Bath className="h-4 w-4" style={{ color: 'var(--theme-muted)' }} />
                <span>{property.bathrooms}</span>
              </div>
            )}
            {property.area != null && (
              <div
                className="flex items-center gap-1.5 text-sm"
                style={{ color: 'var(--theme-text)' }}
              >
                <Maximize className="h-4 w-4" style={{ color: 'var(--theme-muted)' }} />
                <span>{property.area} م²</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
