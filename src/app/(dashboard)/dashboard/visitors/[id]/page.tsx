'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, User, Phone, Mail, Clock, MessageSquare, Eye, Info,
  Heart, Building2, Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getVisitor } from '@/lib/actions/visitors'
import { respondToRequest } from '@/lib/actions/requests'

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' }> = {
  PENDING: { label: 'قيد الانتظار', variant: 'warning' },
  RESPONDED: { label: 'تم الرد', variant: 'default' },
  CLOSED: { label: 'مغلق', variant: 'secondary' },
}

const TYPE_LABELS: Record<string, { label: string; icon: typeof Info }> = {
  INTEREST: { label: 'اهتمام', icon: MessageSquare },
  VIEWING: { label: 'معاينة', icon: Eye },
  INFO: { label: 'معلومات', icon: Info },
}

export default function VisitorDetailPage() {
  const params = useParams()
  const visitorId = params.id as string
  const [visitor, setVisitor] = useState<Awaited<ReturnType<typeof getVisitor>>>(null)
  const [loading, setLoading] = useState(true)
  const [responseText, setResponseText] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const data = await getVisitor(visitorId)
      setVisitor(data)
    } catch (error) {
      console.error('Failed to load visitor:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [visitorId])

  const handleRespond = async (requestId: string) => {
    const text = responseText[requestId]?.trim()
    if (!text) return
    setSubmitting(requestId)
    try {
      await respondToRequest(requestId, text)
      setResponseText((prev) => ({ ...prev, [requestId]: '' }))
      loadData()
    } catch (error) {
      console.error('Failed to respond:', error)
    } finally {
      setSubmitting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8A96E] border-t-transparent" />
      </div>
    )
  }

  if (!visitor) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-medium text-[#2D3748]">الزائر غير موجود</p>
        <Link href="/dashboard/visitors" className="mt-2 text-sm text-[#C8A96E] hover:underline">
          العودة للزوار
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/visitors">
          <button className="rounded-lg p-2 text-[#718096] transition-colors hover:bg-[#F7F7F2] hover:text-[#1E3A5F]">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#2D3748]">{visitor.name}</h1>
          <p className="text-sm text-[#718096]">زائر مسجل</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4" />
                الطلبات ({visitor.requests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {visitor.requests.length === 0 ? (
                <p className="py-4 text-center text-sm text-[#718096]">لا توجد طلبات</p>
              ) : (
                <div className="space-y-4">
                  {visitor.requests.map((req) => {
                    const typeInfo = TYPE_LABELS[req.type] || TYPE_LABELS.INFO
                    const statusInfo = STATUS_LABELS[req.status] || STATUS_LABELS.PENDING
                    const TypeIcon = typeInfo.icon

                    return (
                      <div key={req.id} className="rounded-lg border border-[#E2E8F0] p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/dashboard/properties/${req.property.id}`}
                            className="text-sm font-medium text-[#2D3748] hover:text-[#C8A96E]"
                          >
                            {req.property.titleAr || req.property.title}
                          </Link>
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#FAFAF7] px-2 py-0.5 text-xs text-[#718096]">
                            <TypeIcon className="h-3 w-3" />
                            {typeInfo.label}
                          </span>
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </div>

                        {req.message && (
                          <p className="mt-2 text-sm text-[#718096]">{req.message}</p>
                        )}

                        <p className="mt-1 text-xs text-[#A0AEC0]">
                          {new Date(req.createdAt).toLocaleString('ar-SA-u-nu-latn')}
                        </p>

                        {/* Response section */}
                        {req.response ? (
                          <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
                            <p className="text-xs font-medium text-blue-600">الرد</p>
                            <p className="mt-1 text-sm text-[#2D3748]">{req.response}</p>
                            {req.respondedAt && (
                              <p className="mt-1 text-xs text-blue-400">
                                {new Date(req.respondedAt).toLocaleString('ar-SA-u-nu-latn')}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="mt-3 flex gap-2">
                            <textarea
                              value={responseText[req.id] || ''}
                              onChange={(e) => setResponseText((prev) => ({ ...prev, [req.id]: e.target.value }))}
                              placeholder="اكتب الرد..."
                              className="flex-1 rounded-lg border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748] placeholder:text-[#A0AEC0] focus:outline-none focus:ring-1 focus:ring-[#C8A96E]"
                              rows={2}
                            />
                            <Button
                              onClick={() => handleRespond(req.id)}
                              isLoading={submitting === req.id}
                              size="icon"
                              className="self-end"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Favorites */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="h-4 w-4" />
                المفضلة ({visitor.favorites.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {visitor.favorites.length === 0 ? (
                <p className="py-4 text-center text-sm text-[#718096]">لا توجد عقارات مفضلة</p>
              ) : (
                <div className="space-y-2">
                  {visitor.favorites.map((fav) => (
                    <Link
                      key={fav.id}
                      href={`/dashboard/properties/${fav.property.id}`}
                      className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] p-3 transition-colors hover:border-[#C8A96E]/30"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EBF0F7]">
                        <Building2 className="h-5 w-5 text-[#C8A96E]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#2D3748] truncate">
                          {fav.property.titleAr || fav.property.title}
                        </p>
                        <p className="text-xs text-[#718096]">
                          {BigInt(fav.property.price).toLocaleString()} {fav.property.currency}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Visitor Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">معلومات الزائر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-[#718096]" />
                <span className="text-[#2D3748]">{visitor.name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-[#718096]" />
                <a href={`tel:${visitor.phone}`} className="text-[#C8A96E] hover:underline">{visitor.phone}</a>
              </div>
              {visitor.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-[#718096]" />
                  <a href={`mailto:${visitor.email}`} className="text-[#C8A96E] hover:underline">{visitor.email}</a>
                </div>
              )}
              <div className="border-t border-[#E2E8F0] pt-3">
                <div className="flex items-center gap-2 text-xs text-[#718096]">
                  <Clock className="h-3.5 w-3.5" />
                  تاريخ التسجيل: {new Date(visitor.createdAt).toLocaleDateString('ar-SA-u-nu-latn')}
                </div>
                {visitor.lastLoginAt && (
                  <div className="mt-1 flex items-center gap-2 text-xs text-[#718096]">
                    <Clock className="h-3.5 w-3.5" />
                    آخر دخول: {new Date(visitor.lastLoginAt).toLocaleDateString('ar-SA-u-nu-latn')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">الإحصائيات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#718096]">الطلبات</span>
                <span className="font-medium text-[#2D3748]">{visitor.requests.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#718096]">المفضلة</span>
                <span className="font-medium text-[#2D3748]">{visitor.favorites.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#718096]">طلبات بانتظار الرد</span>
                <span className="font-medium text-amber-500">
                  {visitor.requests.filter((r) => r.status === 'PENDING').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
