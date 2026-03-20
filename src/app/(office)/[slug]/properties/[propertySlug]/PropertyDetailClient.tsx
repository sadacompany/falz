'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePublicOffice } from '@/components/public/PublicOfficeContext'
import { useDirection } from '@/components/shared/DirectionProvider'
import { PropertyGallery } from '@/components/public/PropertyGallery'
import { PropertyCard, type PropertyCardData } from '@/components/public/PropertyCard'
import { ContactForm } from '@/components/public/ContactForm'
import { formatPrice, formatDate } from '@/lib/utils'
import { GoogleMapEmbed } from '@/components/shared/GoogleMapEmbed'
import { FavoriteButton } from '@/components/public/FavoriteButton'
import { RequestButtons } from '@/components/public/RequestButtons'
import {
  MapPin, BedDouble, Bath, Maximize, Calendar, Hash,
  Phone, Mail, ChevronLeft, ChevronRight,
  Play, View, Check,
} from 'lucide-react'
import { WhatsAppIcon } from '@/components/public/WhatsAppIcon'

interface PropertyData {
  id: string
  slug: string
  title: string
  titleAr: string | null
  description: string | null
  descriptionAr: string | null
  price: string
  currency: string
  dealType: string
  propertyType: string
  city: string | null
  cityAr: string | null
  district: string | null
  districtAr: string | null
  street: string | null
  streetAr: string | null
  bedrooms: number | null
  bathrooms: number | null
  area: number | null
  amenities: string[] | null
  isFeatured: boolean
  availability: string
  status: string
  videoUrl: string | null
  tour360Url: string | null
  lat: number | null
  lng: number | null
  publishedAt: string | null
  updatedAt: string
  media: { url: string; alt: string | null; altAr: string | null; type: string }[]
}

interface AgentData {
  name: string
  nameAr: string | null
  photo: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  slug: string | null
}

interface PropertyDetailClientProps {
  officeId: string
  officeSlug: string
  officeWhatsapp: string | null
  officePhone: string | null
  property: PropertyData
  agent: AgentData | null
  similarProperties: PropertyCardData[]
}

export function PropertyDetailClient({
  officeId,
  officeSlug,
  officeWhatsapp,
  officePhone,
  property,
  agent,
  similarProperties,
}: PropertyDetailClientProps) {
  const { dict } = usePublicOffice()
  const { locale, isRtl } = useDirection()

  const BackArrow = isRtl ? ChevronRight : ChevronLeft

  const title = locale === 'ar' && property.titleAr ? property.titleAr : property.title
  const description = locale === 'ar' && property.descriptionAr ? property.descriptionAr : property.description
  const city = locale === 'ar' && property.cityAr ? property.cityAr : property.city
  const district = locale === 'ar' && property.districtAr ? property.districtAr : property.district
  const street = locale === 'ar' && property.streetAr ? property.streetAr : property.street
  const location = [street, district, city].filter(Boolean).join(', ')

  const agentName = agent ? (locale === 'ar' && agent.nameAr ? agent.nameAr : agent.name) : null

  const price = formatPrice(parseInt(property.price), property.currency)
  const dealTypeLabel = property.dealType === 'SALE' ? dict.property.forSale : dict.property.forRent
  const propertyTypeLabel = dict.property.types[property.propertyType as keyof typeof dict.property.types] || property.propertyType
  const isSoldOrRented = property.availability === 'SOLD' || property.availability === 'RENTED'

  const galleryImages = property.media
    .filter((m) => m.type === 'IMAGE')
    .map((m) => ({
      url: m.url,
      alt: (locale === 'ar' && m.altAr ? m.altAr : m.alt) || title,
    }))

  const amenityList = property.amenities || []

  const contactWhatsapp = agent?.whatsapp || officeWhatsapp
  const contactPhone = agent?.phone || officePhone

  // Track property_view
  useEffect(() => {
    fetch('/api/public/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        officeId,
        eventType: 'property_view',
        propertyId: property.id,
        page: `/${officeSlug}/properties/${property.slug}`,
        referrer: document.referrer || null,
        visitorId: getVisitorId(),
      }),
    }).catch(() => {})
  }, [officeId, officeSlug, property.id, property.slug])

  return (
    <div>
      {/* ─── Back Navigation ──────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <Link
          href={`/${officeSlug}/properties`}
          className="inline-flex items-center gap-1.5 text-sm transition-colors hover:underline text-[#718096] hover:text-[#1E3A5F]"
        >
          <BackArrow className="h-4 w-4" />
          {dict.nav.backToProperties}
        </Link>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        {/* ─── Sold/Rented Banner ──────────────────────── */}
        {isSoldOrRented && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-center">
            <p className="text-lg font-bold text-red-600">
              {dict.property.availabilities[property.availability as keyof typeof dict.property.availabilities]}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ─── Main Column ──────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <PropertyGallery images={galleryImages} />

            {/* Title + Price + Badges */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    property.dealType === 'SALE'
                      ? 'bg-[#1E3A5F] text-white'
                      : 'bg-[#C8A96E] text-white'
                  }`}
                >
                  {dealTypeLabel}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F7F8FA] text-[#718096] border border-[#E2E8F0]">
                  {propertyTypeLabel}
                </span>
                {property.isFeatured && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF5EB] text-[#C8A96E] border border-[#C8A96E]/30">
                    {dict.common.featured}
                  </span>
                )}
              </div>

              <div className="flex items-start gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold flex-1 text-[#1E3A5F]">
                  {title}
                </h1>
                <FavoriteButton propertyId={property.id} size="md" />
              </div>

              {location && (
                <p className="flex items-center gap-2 text-sm mb-4 text-[#718096]">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {location}
                </p>
              )}

              <p className="text-3xl font-bold text-[#1E3A5F]">
                {price}
                {property.dealType === 'RENT' && (
                  <span className="text-base font-normal text-[#718096]">
                    {' '}{dict.common.perMonth}
                  </span>
                )}
              </p>
            </div>

            {/* Key Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-xl bg-[#EBF0F7] border border-[#E2E8F0]">
              {property.bedrooms != null && (
                <SpecItem icon={<BedDouble className="h-5 w-5" />} value={property.bedrooms.toString()} label={dict.property.bedrooms} />
              )}
              {property.bathrooms != null && (
                <SpecItem icon={<Bath className="h-5 w-5" />} value={property.bathrooms.toString()} label={dict.property.bathrooms} />
              )}
              {property.area != null && (
                <SpecItem icon={<Maximize className="h-5 w-5" />} value={`${property.area} ${dict.common.sqm}`} label={dict.property.area} />
              )}
              {property.publishedAt && (
                <SpecItem icon={<Calendar className="h-5 w-5" />} value={formatDate(property.publishedAt, locale === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US')} label={dict.property.publishedAt} />
              )}
            </div>

            {/* Description */}
            {description && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-[#1E3A5F]">
                  {dict.property.description}
                </h2>
                <div className="prose max-w-none text-sm leading-relaxed whitespace-pre-wrap text-[#2D3748]">
                  {description}
                </div>
              </div>
            )}

            {/* Amenities */}
            {amenityList.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-[#1E3A5F]">
                  {dict.property.amenities}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenityList.map((amenity) => {
                    const label = dict.property.amenityList[amenity as keyof typeof dict.property.amenityList] || amenity
                    return (
                      <div
                        key={amenity}
                        className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm bg-white border border-[#E2E8F0] text-[#2D3748]"
                      >
                        <Check className="h-4 w-4 shrink-0 text-[#C8A96E]" />
                        {label}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Video Section */}
            {property.videoUrl && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-[#1E3A5F]">
                  <Play className="h-5 w-5 inline me-2" />
                  {dict.common.video}
                </h2>
                <div className="aspect-video rounded-xl overflow-hidden border border-[#E2E8F0]">
                  {property.videoUrl.includes('youtube') || property.videoUrl.includes('youtu.be') ? (
                    <iframe
                      src={property.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                      className="h-full w-full"
                      allowFullScreen
                      title={title}
                    />
                  ) : (
                    <video src={property.videoUrl} controls className="h-full w-full" />
                  )}
                </div>
              </div>
            )}

            {/* 360 Tour */}
            {property.tour360Url && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-[#1E3A5F]">
                  <View className="h-5 w-5 inline me-2" />
                  {dict.common.virtualTour}
                </h2>
                <div className="aspect-video rounded-xl overflow-hidden border border-[#E2E8F0]">
                  <iframe
                    src={property.tour360Url}
                    className="h-full w-full"
                    allowFullScreen
                    title={`${title} - ${dict.common.virtualTour}`}
                  />
                </div>
              </div>
            )}

            {/* Map */}
            {property.lat && property.lng && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-[#1E3A5F]">
                  {dict.property.locationOnMap}
                </h2>
                <GoogleMapEmbed
                  lat={property.lat}
                  lng={property.lng}
                  markerTitle={title}
                  className="aspect-[2/1] rounded-xl overflow-hidden border border-[#E2E8F0]"
                />
                <div className="mt-2 text-end">
                  <a
                    href={`https://www.google.com/maps?q=${property.lat},${property.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#C8A96E] hover:text-[#B8963E] hover:underline"
                  >
                    <MapPin className="h-3 w-3" />
                    {dict.common.map}
                  </a>
                </div>
              </div>
            )}

            {/* Reference Info */}
            <div className="flex flex-wrap gap-6 p-4 rounded-xl text-xs bg-[#F7F8FA] border border-[#E2E8F0] text-[#718096]">
              <div className="flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" />
                {dict.property.referenceNumber}: {property.id.slice(-8).toUpperCase()}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {dict.property.lastUpdated}: {formatDate(property.updatedAt, locale === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US')}
              </div>
            </div>
          </div>

          {/* ─── Sidebar ──────────────────────────────── */}
          <div className="space-y-6">
            {/* Agent Card */}
            {agent && (
              <div className="rounded-xl p-6 bg-white border border-[#E2E8F0] shadow-sm">
                <div className="flex items-center gap-4 mb-5">
                  {agent.photo ? (
                    <img
                      src={agent.photo}
                      alt={agentName || ''}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold bg-[#C8A96E] text-white">
                      {agentName?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-[#1E3A5F]">
                      {agentName}
                    </p>
                    <p className="text-xs text-[#718096]">
                      {dict.property.agent}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {contactWhatsapp && (
                    <a
                      href={`https://wa.me/${contactWhatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] bg-[#25D366] text-white hover:bg-[#1EBE5A]"
                      onClick={() => trackWhatsApp(officeId, property.id)}
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                      واتساب
                    </a>
                  )}
                  {contactPhone && (
                    <a
                      href={`tel:${contactPhone}`}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] bg-[#C8A96E] text-white hover:bg-[#B8963E]"
                      onClick={() => trackPhone(officeId, property.id)}
                    >
                      <Phone className="h-4 w-4" />
                      {dict.common.call}
                    </a>
                  )}
                  {agent.email && (
                    <a
                      href={`mailto:${agent.email}?subject=${encodeURIComponent(title)}`}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] bg-white text-[#1E3A5F] border border-[#E2E8F0] hover:border-[#1E3A5F]"
                    >
                      <Mail className="h-4 w-4" />
                      {dict.common.email}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Request Buttons */}
            <div className="rounded-xl p-6 bg-white border border-[#E2E8F0] shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-[#1E3A5F]">
                طلبات
              </h3>
              <RequestButtons propertyId={property.id} />
            </div>

            {/* Contact Form */}
            <div className="rounded-xl p-6 bg-white border border-[#E2E8F0] shadow-sm">
              <h3 className="text-lg font-semibold mb-5 text-[#1E3A5F]">
                {dict.property.contactForm}
              </h3>
              <ContactForm source="PROPERTY_INQUIRY" propertyId={property.id} />
            </div>
          </div>
        </div>

        {/* ─── Similar Properties ──────────────────────── */}
        {similarProperties.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8 text-[#1E3A5F]">
              {dict.property.similarProperties}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.map((p) => (
                <PropertyCard key={p.id} property={p} officeSlug={officeSlug} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Sticky Mobile CTA ─────────────────────────── */}
      {contactWhatsapp && (
        <div className="fixed bottom-0 inset-x-0 z-40 p-3 lg:hidden bg-white border-t border-[#E2E8F0] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex gap-2">
            <a
              href={`https://wa.me/${contactWhatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-[#25D366] text-white"
            >
              <WhatsAppIcon className="h-4 w-4" />
              واتساب
            </a>
            {contactPhone && (
              <a
                href={`tel:${contactPhone}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-[#C8A96E] text-white"
              >
                <Phone className="h-4 w-4" />
                {dict.common.call}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Helper Components ────────────────────────────────────────

function SpecItem({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-2 text-[#1E3A5F]">
        {icon}
      </div>
      <p className="text-base font-semibold mb-0.5 text-[#1E3A5F]">
        {value}
      </p>
      <p className="text-xs text-[#718096]">{label}</p>
    </div>
  )
}

// ─── Analytics Helpers ────────────────────────────────────────

function trackWhatsApp(officeId: string, propertyId: string) {
  fetch('/api/public/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      officeId,
      eventType: 'whatsapp_click',
      propertyId,
      page: window.location.pathname,
      visitorId: getVisitorId(),
    }),
  }).catch(() => {})
}

function trackPhone(officeId: string, propertyId: string) {
  fetch('/api/public/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      officeId,
      eventType: 'phone_click',
      propertyId,
      page: window.location.pathname,
      visitorId: getVisitorId(),
    }),
  }).catch(() => {})
}

function getVisitorId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('falz_visitor_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('falz_visitor_id', id)
  }
  return id
}
