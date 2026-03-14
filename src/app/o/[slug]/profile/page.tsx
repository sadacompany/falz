'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePublicOffice } from '@/components/public/PublicOfficeContext'
import { useDirection } from '@/components/shared/DirectionProvider'
import { useVisitorAuth } from '@/components/public/VisitorAuthContext'
import { FileText, Heart, Loader2, MessageSquare, Eye, Info, Trash2, MapPin, Clock } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'قيد الانتظار', color: 'text-amber-600', bg: 'bg-amber-50' },
  RESPONDED: { label: 'تم الرد', color: 'text-blue-600', bg: 'bg-blue-50' },
  CLOSED: { label: 'مغلق', color: 'text-gray-600', bg: 'bg-gray-100' },
}

const TYPE_LABELS: Record<string, { label: string; icon: typeof Info }> = {
  INTEREST: { label: 'اهتمام', icon: MessageSquare },
  VIEWING: { label: 'معاينة', icon: Eye },
  INFO: { label: 'معلومات', icon: Info },
}

interface RequestItem {
  id: string
  propertyId: string
  type: string
  message: string | null
  response: string | null
  respondedAt: string | null
  status: string
  createdAt: string
  property: {
    id: string
    slug: string
    title: string
    titleAr: string | null
    price: string
    currency: string
    dealType: string
    media: { url: string }[]
  }
}

interface FavoriteItem {
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

export default function ProfilePage() {
  const { office } = usePublicOffice()
  const { locale } = useDirection()
  const { visitor, loading: authLoading, setShowAuthModal } = useVisitorAuth()
  const [tab, setTab] = useState<'requests' | 'favorites'>('requests')
  const [requests, setRequests] = useState<RequestItem[]>([])
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (!visitor) {
      setLoading(false)
      return
    }
    Promise.all([
      fetch('/api/public/visitors/requests').then((r) => r.json()),
      fetch('/api/public/visitors/favorites').then((r) => r.json()),
    ])
      .then(([reqData, favData]) => {
        setRequests(reqData.requests || [])
        setFavorites(favData.favorites || [])
      })
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
        <FileText className="mx-auto h-16 w-16 mb-4" style={{ color: 'var(--theme-muted)' }} />
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--theme-primary)' }}>
          حسابي
        </h1>
        <p className="mb-6" style={{ color: 'var(--theme-muted)' }}>
          سجل الدخول لعرض طلباتك ومفضلتك
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--theme-primary)' }}>
          حسابي
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--theme-muted)' }}>
          مرحبا {visitor.name}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border p-1" style={{ borderColor: 'var(--theme-border)' }}>
        <button
          onClick={() => setTab('requests')}
          className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
          style={{
            backgroundColor: tab === 'requests' ? 'var(--theme-accent)' : 'transparent',
            color: tab === 'requests' ? 'white' : 'var(--theme-muted)',
          }}
        >
          <FileText className="h-4 w-4" />
          طلباتي ({requests.length})
        </button>
        <button
          onClick={() => setTab('favorites')}
          className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
          style={{
            backgroundColor: tab === 'favorites' ? 'var(--theme-accent)' : 'transparent',
            color: tab === 'favorites' ? 'white' : 'var(--theme-muted)',
          }}
        >
          <Heart className="h-4 w-4" />
          المفضلة ({favorites.length})
        </button>
      </div>

      {/* Requests Tab */}
      {tab === 'requests' && (
        <div>
          {requests.length === 0 ? (
            <div className="rounded-2xl border p-12 text-center" style={{ borderColor: 'var(--theme-border)' }}>
              <FileText className="mx-auto h-12 w-12 mb-4" style={{ color: 'var(--theme-muted)' }} />
              <p className="text-lg font-medium mb-2" style={{ color: 'var(--theme-text)' }}>
                لا توجد طلبات
              </p>
              <p className="text-sm mb-6" style={{ color: 'var(--theme-muted)' }}>
                تصفح العقارات وقدم طلبك
              </p>
              <Link
                href={`/o/${office.slug}/properties`}
                className="inline-block rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: 'var(--theme-accent)' }}
              >
                تصفح العقارات
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => {
                const typeInfo = TYPE_LABELS[req.type] || TYPE_LABELS.INFO
                const statusInfo = STATUS_LABELS[req.status] || STATUS_LABELS.PENDING
                const TypeIcon = typeInfo.icon
                const title = locale === 'ar' && req.property.titleAr ? req.property.titleAr : req.property.title
                const imageUrl = req.property.media[0]?.url || '/placeholder-property.jpg'

                return (
                  <div
                    key={req.id}
                    className="rounded-2xl border bg-white overflow-hidden"
                    style={{ borderColor: 'var(--theme-border)' }}
                  >
                    <div className="flex gap-4 p-4">
                      {/* Property image */}
                      <Link href={`/o/${office.slug}/properties/${req.property.slug}`} className="shrink-0">
                        <img
                          src={imageUrl}
                          alt={title}
                          className="h-20 w-28 rounded-lg object-cover"
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        {/* Property title + badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/o/${office.slug}/properties/${req.property.slug}`}
                            className="text-sm font-semibold hover:underline"
                            style={{ color: 'var(--theme-text)' }}
                          >
                            {title}
                          </Link>
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                            style={{ backgroundColor: 'var(--theme-accent)', color: 'white', opacity: 0.9 }}
                          >
                            <TypeIcon className="h-3 w-3" />
                            {typeInfo.label}
                          </span>
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color} ${statusInfo.bg}`}>
                            {statusInfo.label}
                          </span>
                        </div>

                        {/* Original message */}
                        {req.message && (
                          <p className="mt-1.5 text-sm" style={{ color: 'var(--theme-muted)' }}>
                            {req.message}
                          </p>
                        )}

                        {/* Timestamp */}
                        <div className="mt-1 flex items-center gap-1 text-xs" style={{ color: 'var(--theme-muted)' }}>
                          <Clock className="h-3 w-3" />
                          {new Date(req.createdAt).toLocaleString('ar-SA-u-nu-latn')}
                        </div>

                        {/* Office response */}
                        {req.response && (
                          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                            <p className="text-xs font-medium text-blue-600">رد المكتب</p>
                            <p className="mt-1 text-sm" style={{ color: 'var(--theme-text)' }}>{req.response}</p>
                            {req.respondedAt && (
                              <p className="mt-1 text-xs text-blue-400">
                                {new Date(req.respondedAt).toLocaleString('ar-SA-u-nu-latn')}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Favorites Tab */}
      {tab === 'favorites' && (
        <div>
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
                href={`/o/${office.slug}/properties`}
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
                    <Link href={`/o/${office.slug}/properties/${p.slug}`}>
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
      )}
    </div>
  )
}
