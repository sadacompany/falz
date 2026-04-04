'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePublicOffice } from './PublicOfficeContext'
import { useDirection } from '@/components/shared/DirectionProvider'
import { formatPrice } from '@/lib/utils'
import { MapPin, BedDouble, Bath, Maximize, Star } from 'lucide-react'
import { FavoriteButton } from './FavoriteButton'

export interface PropertyCardData {
  id: string
  slug: string
  title: string
  titleAr: string | null
  price: string | number
  currency: string
  dealType: 'SALE' | 'RENT'
  propertyType: string
  city: string | null
  cityAr: string | null
  district: string | null
  districtAr: string | null
  bedrooms: number | null
  bathrooms: number | null
  area: number | null
  isFeatured: boolean
  availability: 'AVAILABLE' | 'SOLD' | 'RENTED'
  media: { url: string; alt: string | null; altAr: string | null }[]
}

interface PropertyCardProps {
  property: PropertyCardData
  officeSlug: string
  showFavorite?: boolean
}

export function PropertyCard({ property, officeSlug, showFavorite = true }: PropertyCardProps) {
  const { dict } = usePublicOffice()
  const { locale } = useDirection()

  const title = locale === 'ar' && property.titleAr ? property.titleAr : property.title
  const city = locale === 'ar' && property.cityAr ? property.cityAr : property.city
  const district = locale === 'ar' && property.districtAr ? property.districtAr : property.district
  const location = [district, city].filter(Boolean).join(', ')

  const imageUrl = property.media[0]?.url || '/placeholder-property.jpg'
  const imageAlt = locale === 'ar' && property.media[0]?.altAr
    ? property.media[0].altAr
    : property.media[0]?.alt || title

  const price = formatPrice(
    typeof property.price === 'string' ? parseInt(property.price) : property.price,
    property.currency
  )

  const isSoldOrRented = property.availability === 'SOLD' || property.availability === 'RENTED'

  const dealTypeLabel = property.dealType === 'SALE' ? dict.property.forSale : dict.property.forRent
  const propertyTypeLabel = dict.property.types[property.propertyType as keyof typeof dict.property.types] || property.propertyType

  return (
    <Link
      href={`/${officeSlug}/properties/${property.slug}`}
      className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-lg"
      style={{
        backgroundColor: 'var(--theme-surface)',
        borderColor: 'var(--theme-border)',
        border: '1px solid var(--theme-border)',
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Deal Type Badge */}
        <div
          className="absolute top-3 start-3 px-3 py-1 rounded-full text-xs font-semibold text-white"
          style={{
            backgroundColor: property.dealType === 'SALE' ? 'var(--theme-primary)' : 'var(--theme-accent)',
          }}
        >
          {dealTypeLabel}
        </div>

        {/* Featured Badge */}
        {property.isFeatured && (
          <div
            className="absolute top-3 end-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: 'var(--theme-background)',
              color: 'var(--theme-accent)',
              border: '1px solid color-mix(in srgb, var(--theme-accent) 30%, transparent)',
            }}
          >
            <Star className="h-3 w-3" />
            {dict.common.featured}
          </div>
        )}

        {/* Favorite Button */}
        {showFavorite && (
          <div className={`absolute end-3 z-10 ${property.isFeatured ? 'top-12' : 'top-3'}`}>
            <FavoriteButton propertyId={property.id} />
          </div>
        )}

        {/* Sold/Rented Overlay */}
        {isSoldOrRented && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-red-500/90 text-white px-6 py-2 rounded-lg text-lg font-bold -rotate-12 shadow-lg">
              {dict.property.availabilities[property.availability]}
            </div>
          </div>
        )}

        {/* Price on image */}
        <div className="absolute bottom-3 start-3">
          <p className="text-lg font-bold text-white drop-shadow-lg">
            {price}
            {property.dealType === 'RENT' && (
              <span className="text-sm font-normal opacity-80"> {dict.common.perMonth}</span>
            )}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Property Type */}
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--theme-muted)' }}>
          {propertyTypeLabel}
        </p>

        {/* Title */}
        <h3
          className="text-base font-semibold mb-2 line-clamp-1 transition-colors"
          style={{ color: 'var(--theme-text)' }}
        >
          {title}
        </h3>

        {/* Location */}
        {location && (
          <p className="text-sm flex items-center gap-1.5 mb-3" style={{ color: 'var(--theme-muted)' }}>
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </p>
        )}

        {/* Key Stats */}
        <div className="flex items-center gap-4 pt-3" style={{ borderTop: '1px solid var(--theme-border)' }}>
          {property.bedrooms != null && (
            <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--theme-text)' }}>
              <BedDouble className="h-4 w-4" style={{ color: 'var(--theme-muted)' }} />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms != null && (
            <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--theme-text)' }}>
              <Bath className="h-4 w-4" style={{ color: 'var(--theme-muted)' }} />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.area != null && (
            <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--theme-text)' }}>
              <Maximize className="h-4 w-4" style={{ color: 'var(--theme-muted)' }} />
              <span>{property.area} {dict.common.sqm}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
