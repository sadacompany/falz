'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePublicOffice } from '@/components/public/PublicOfficeContext'
import { useDirection } from '@/components/shared/DirectionProvider'
import { useVisitorAuth } from '@/components/public/VisitorAuthContext'
import { Heart, Trash2, Loader2, MapPin } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface FavoriteProperty {
  id: string
  propertyId: string
  createdAt: string
  property: {
    id: string
    slug: string
    title: string
    titleAr: string | null
    price: string
    currency: string
    dealType: string
    propertyType: string
    city: string | null
    cityAr: string | null
    district: string | null
    districtAr: string | null
    bedrooms: number | null
    bathrooms: number | null
    area: number | null
    media: { url: string; alt: string | null; altAr: string | null }[]
  }
}

export default function FavoritesPage() {
  const { office, dict } = usePublicOffice()
  const { locale } = useDirection()
  const { visitor, loading: authLoading, setShowAuthModal } = useVisitorAuth()
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (!visitor) {
      setLoading(false)
      return
    }
    fetch('/api/public/visitors/favorites')
      .then((r) => r.json())
      .then((data) => setFavorites(data.favorites || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [visitor])

  async function removeFavorite(propertyId: string) {
    setRemovingId(propertyId)
    try {
      await fetch(`/api/public/visitors/favorites/${propertyId}`, { method: 'DELETE' })
      setFavorites((prev) => prev.filter((f) => f.propertyId !== propertyId))
    } catch {
      // ignore
    } finally {
      setRemovingId(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--theme-accent)' }} />
      </div>
    )
  }

  if (!visitor) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Heart className="mx-auto h-16 w-16 mb-4" style={{ color: 'var(--theme-muted)' }} />
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--theme-primary)' }}>
          المفضلة
        </h1>
        <p className="mb-6" style={{ color: 'var(--theme-muted)' }}>
          سجل الدخول لعرض عقاراتك المفضلة
        </p>
        <button
          onClick={() => setShowAuthModal(true)}
          className="rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: 'var(--theme-accent)' }}
        >
          تسجيل الدخول
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--theme-primary)' }}>
          المفضلة
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--theme-muted)' }}>
          {favorites.length} عقار في المفضلة
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ borderColor: 'var(--theme-border)' }}>
          <Heart className="mx-auto h-12 w-12 mb-4" style={{ color: 'var(--theme-muted)' }} />
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--theme-text)' }}>
            لا توجد عقارات مفضلة
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--theme-muted)' }}>
            تصفح العقارات وأضف المفضلة لديك
          </p>
          <Link
            href={`/${office.slug}/properties`}
            className="inline-block rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: 'var(--theme-accent)' }}
          >
            تصفح العقارات
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => {
            const p = fav.property
            const title = locale === 'ar' && p.titleAr ? p.titleAr : p.title
            const city = locale === 'ar' && p.cityAr ? p.cityAr : p.city
            const district = locale === 'ar' && p.districtAr ? p.districtAr : p.district
            const location = [district, city].filter(Boolean).join(', ')
            const imageUrl = p.media[0]?.url || '/placeholder-property.jpg'
            const price = formatPrice(parseInt(p.price), p.currency)

            return (
              <div
                key={fav.id}
                className="group relative rounded-2xl overflow-hidden border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{ borderColor: 'var(--theme-border)' }}
              >
                <Link href={`/${office.slug}/properties/${p.slug}`}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-3 start-3">
                      <p className="text-lg font-bold text-white drop-shadow-lg">{price}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-semibold mb-1 line-clamp-1" style={{ color: 'var(--theme-text)' }}>
                      {title}
                    </h3>
                    {location && (
                      <p className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--theme-muted)' }}>
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-1">{location}</span>
                      </p>
                    )}
                  </div>
                </Link>

                {/* Remove button */}
                <button
                  onClick={() => removeFavorite(fav.propertyId)}
                  disabled={removingId === fav.propertyId}
                  className="absolute top-3 end-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-sm transition-colors hover:bg-red-50 disabled:opacity-50"
                  title="إزالة من المفضلة"
                >
                  {removingId === fav.propertyId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
