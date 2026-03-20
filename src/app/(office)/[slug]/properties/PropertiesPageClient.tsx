'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { usePublicOffice } from '@/components/public/PublicOfficeContext'
import { useDirection } from '@/components/shared/DirectionProvider'
import { PropertyCard, type PropertyCardData } from '@/components/public/PropertyCard'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react'

interface PropertiesPageClientProps {
  officeId: string
  officeSlug: string
  properties: PropertyCardData[]
  total: number
  page: number
  pageSize: number
  cities: { value: string; label: string }[]
  districts: { value: string; label: string }[]
  currentFilters: {
    dealType: string
    propertyType: string
    city: string
    district: string
    minPrice: string
    maxPrice: string
    bedrooms: string
    sort: string
  }
}

export function PropertiesPageClient({
  officeId,
  officeSlug,
  properties,
  total,
  page,
  pageSize,
  cities,
  districts,
  currentFilters,
}: PropertiesPageClientProps) {
  const { dict } = usePublicOffice()
  const { locale, isRtl } = useDirection()
  const router = useRouter()

  const totalPages = Math.ceil(total / pageSize)

  const updateFilters = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams()
    const merged = { ...currentFilters, ...updates }

    // Reset page when filters change (unless page is explicitly set)
    if (!updates.page) merged.sort // keep sort

    Object.entries(merged).forEach(([key, value]) => {
      if (value && key !== 'page') params.set(key, value)
    })

    if (updates.page) params.set('page', updates.page)

    router.push(`/${officeSlug}/properties?${params.toString()}`)
  }, [currentFilters, officeSlug, router])

  const clearFilters = useCallback(() => {
    router.push(`/${officeSlug}/properties`)
  }, [officeSlug, router])

  const hasActiveFilters = currentFilters.dealType || currentFilters.propertyType ||
    currentFilters.city || currentFilters.district ||
    currentFilters.minPrice || currentFilters.maxPrice || currentFilters.bedrooms

  const selectClasses = "h-10 rounded-lg px-3 text-sm bg-white border border-[#E2E8F0] text-[#2D3748]"

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* ─── Page Header ─────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-[#1E3A5F]">
          {dict.nav.properties}
        </h1>
        <p className="text-sm text-[#718096]">
          {total} {dict.property.resultsFound}
        </p>
      </div>

      {/* ─── Filters ─────────────────────────────────── */}
      <div className="rounded-xl p-5 mb-8 bg-white border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="h-4 w-4 text-[#C8A96E]" />
          <span className="text-sm font-semibold text-[#1E3A5F]">
            {dict.property.filterProperties}
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ms-auto flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-colors hover:opacity-80 bg-[#FAFAF7] text-[#718096] border border-[#E2E8F0]"
            >
              <X className="h-3 w-3" />
              {dict.property.clearFilters}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* Deal Type */}
          <select
            value={currentFilters.dealType}
            onChange={(e) => updateFilters({ dealType: e.target.value })}
            className={selectClasses}
          >
            <option value="">{dict.property.dealType}</option>
            <option value="SALE">{dict.property.forSale}</option>
            <option value="RENT">{dict.property.forRent}</option>
          </select>

          {/* Property Type */}
          <select
            value={currentFilters.propertyType}
            onChange={(e) => updateFilters({ propertyType: e.target.value })}
            className={selectClasses}
          >
            <option value="">{dict.property.allTypes}</option>
            {Object.entries(dict.property.types).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {/* City */}
          <select
            value={currentFilters.city}
            onChange={(e) => updateFilters({ city: e.target.value, district: '' })}
            className={selectClasses}
          >
            <option value="">{dict.property.allCities}</option>
            {cities.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          {/* District */}
          <select
            value={currentFilters.district}
            onChange={(e) => updateFilters({ district: e.target.value })}
            className={selectClasses}
          >
            <option value="">{dict.property.allDistricts}</option>
            {districts.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>

          {/* Min Price */}
          <Input
            type="number"
            placeholder={dict.property.minPrice}
            value={currentFilters.minPrice}
            onChange={(e) => updateFilters({ minPrice: e.target.value })}
            className="h-10 text-sm bg-white border-[#E2E8F0] text-[#2D3748] placeholder:text-[#A0AEC0]"
          />

          {/* Max Price */}
          <Input
            type="number"
            placeholder={dict.property.maxPrice}
            value={currentFilters.maxPrice}
            onChange={(e) => updateFilters({ maxPrice: e.target.value })}
            className="h-10 text-sm bg-white border-[#E2E8F0] text-[#2D3748] placeholder:text-[#A0AEC0]"
          />

          {/* Bedrooms */}
          <select
            value={currentFilters.bedrooms}
            onChange={(e) => updateFilters({ bedrooms: e.target.value })}
            className={selectClasses}
          >
            <option value="">{dict.property.bedrooms}</option>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n.toString()}>{n}+</option>
            ))}
          </select>
        </div>

        {/* Sort Row */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#E2E8F0]">
          <span className="text-xs font-medium text-[#718096]">
            {dict.common.sortBy}:
          </span>
          {[
            { value: 'newest', label: dict.common.newest },
            { value: 'price_asc', label: dict.common.priceLowToHigh },
            { value: 'price_desc', label: dict.common.priceHighToLow },
            { value: 'area', label: dict.common.areaHighToLow },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateFilters({ sort: opt.value })}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors border ${
                currentFilters.sort === opt.value
                  ? 'bg-[#C8A96E] text-white border-[#C8A96E] font-semibold'
                  : 'bg-[#FAFAF7] text-[#718096] border-[#E2E8F0] hover:border-[#C8A96E] hover:text-[#C8A96E]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Properties Grid ─────────────────────────── */}
      {properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} officeSlug={officeSlug} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl p-16 text-center bg-white border border-[#E2E8F0]">
          <p className="text-lg font-semibold mb-2 text-[#2D3748]">
            {dict.property.noPropertiesFound}
          </p>
          <p className="text-sm mb-6 text-[#718096]">
            {dict.property.noPropertiesMessage}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-[#C8A96E] text-white hover:bg-[#B8963E]"
            >
              {dict.property.clearFilters}
            </button>
          )}
        </div>
      )}

      {/* ─── Pagination ──────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => updateFilters({ page: (page - 1).toString() })}
            disabled={page <= 1}
            className="h-10 w-10 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 bg-white text-[#2D3748] border border-[#E2E8F0] hover:border-[#C8A96E]"
          >
            {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let pageNum: number
            if (totalPages <= 7) {
              pageNum = i + 1
            } else if (page <= 4) {
              pageNum = i + 1
            } else if (page >= totalPages - 3) {
              pageNum = totalPages - 6 + i
            } else {
              pageNum = page - 3 + i
            }
            return (
              <button
                key={pageNum}
                onClick={() => updateFilters({ page: pageNum.toString() })}
                className={`h-10 w-10 rounded-lg text-sm font-medium transition-colors border ${
                  page === pageNum
                    ? 'bg-[#C8A96E] text-white border-[#C8A96E]'
                    : 'bg-white text-[#2D3748] border-[#E2E8F0] hover:border-[#C8A96E]'
                }`}
              >
                {pageNum}
              </button>
            )
          })}

          <button
            onClick={() => updateFilters({ page: (page + 1).toString() })}
            disabled={page >= totalPages}
            className="h-10 w-10 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 bg-white text-[#2D3748] border border-[#E2E8F0] hover:border-[#C8A96E]"
          >
            {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  )
}
