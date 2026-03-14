'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Eye, Info, Search, ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, Send, X } from 'lucide-react'
import { getPropertyRequests, updateRequestStatus, respondToRequest, getRequestStats } from '@/lib/actions/requests'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'قيد الانتظار', color: 'text-amber-600', bg: 'bg-amber-50' },
  RESPONDED: { label: 'تم الرد', color: 'text-blue-600', bg: 'bg-blue-50' },
  CLOSED: { label: 'مغلق', color: 'text-gray-600', bg: 'bg-gray-50' },
}

const TYPE_LABELS: Record<string, { label: string; icon: typeof Info }> = {
  INTEREST: { label: 'اهتمام', icon: MessageSquare },
  VIEWING: { label: 'معاينة', icon: Eye },
  INFO: { label: 'معلومات', icon: Info },
}

type RequestData = Awaited<ReturnType<typeof getPropertyRequests>>

export default function RequestsPage() {
  const [data, setData] = useState<RequestData | null>(null)
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getRequestStats>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [replyModal, setReplyModal] = useState<{ id: string; visitorName: string } | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)

  useEffect(() => {
    loadData()
    getRequestStats().then(setStats).catch(() => {})
  }, [])

  useEffect(() => {
    loadData()
  }, [page, statusFilter, typeFilter, search])

  async function loadData() {
    setLoading(true)
    try {
      const result = await getPropertyRequests({
        page,
        status: statusFilter,
        type: typeFilter,
        search: search || undefined,
      })
      setData(result)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(requestId: string, newStatus: 'PENDING' | 'RESPONDED' | 'CLOSED') {
    try {
      await updateRequestStatus(requestId, newStatus)
      loadData()
      getRequestStats().then(setStats).catch(() => {})
    } catch {
      // ignore
    }
  }

  async function handleReplySubmit() {
    if (!replyModal || !replyText.trim()) return
    setSubmittingReply(true)
    try {
      await respondToRequest(replyModal.id, replyText.trim())
      setReplyModal(null)
      setReplyText('')
      loadData()
      getRequestStats().then(setStats).catch(() => {})
    } catch {
      // ignore
    } finally {
      setSubmittingReply(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#2D3748]">الطلبات</h1>
        <p className="mt-1 text-sm text-[#718096]">إدارة طلبات الزوار على العقارات</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'الإجمالي', value: stats.total, icon: MessageSquare, color: 'text-[#C8A96E]', bg: 'bg-[#C8A96E]/10' },
            { label: 'قيد الانتظار', value: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
            { label: 'تم الرد', value: stats.responded, icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'مغلق', value: stats.closed, icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-xl border border-[#E2E8F0] bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#718096]">{label}</p>
                  <p className="mt-1 text-2xl font-bold text-[#2D3748]">{value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2">
          <Search className="h-4 w-4 text-[#A0AEC0]" />
          <input
            type="text"
            placeholder="بحث..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-48 bg-transparent text-sm text-[#2D3748] placeholder:text-[#A0AEC0] focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex rounded-lg border border-[#E2E8F0] bg-white p-1">
          {['ALL', 'PENDING', 'RESPONDED', 'CLOSED'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1) }}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                statusFilter === s ? 'bg-[#C8A96E] text-white' : 'text-[#718096] hover:text-[#2D3748]'
              )}
            >
              {s === 'ALL' ? 'الكل' : STATUS_LABELS[s]?.label}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex rounded-lg border border-[#E2E8F0] bg-white p-1">
          {['ALL', 'INTEREST', 'VIEWING', 'INFO'].map((t) => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setPage(1) }}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                typeFilter === t ? 'bg-[#C8A96E] text-white' : 'text-[#718096] hover:text-[#2D3748]'
              )}
            >
              {t === 'ALL' ? 'الكل' : TYPE_LABELS[t]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#FAFAF7]">
              <th className="px-4 py-3 text-start text-xs font-medium text-[#718096]">الزائر</th>
              <th className="px-4 py-3 text-start text-xs font-medium text-[#718096]">العقار</th>
              <th className="px-4 py-3 text-start text-xs font-medium text-[#718096]">النوع</th>
              <th className="px-4 py-3 text-start text-xs font-medium text-[#718096]">الرسالة</th>
              <th className="px-4 py-3 text-start text-xs font-medium text-[#718096]">الرد</th>
              <th className="px-4 py-3 text-start text-xs font-medium text-[#718096]">الحالة</th>
              <th className="px-4 py-3 text-start text-xs font-medium text-[#718096]">التاريخ</th>
              <th className="px-4 py-3 text-start text-xs font-medium text-[#718096]">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-sm text-[#718096]">
                  جاري التحميل...
                </td>
              </tr>
            ) : !data?.requests.length ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-sm text-[#718096]">
                  لا توجد طلبات
                </td>
              </tr>
            ) : (
              data.requests.map((req) => {
                const typeInfo = TYPE_LABELS[req.type] || TYPE_LABELS.INFO
                const statusInfo = STATUS_LABELS[req.status] || STATUS_LABELS.PENDING
                const TypeIcon = typeInfo.icon

                return (
                  <tr key={req.id} className="border-b border-[#E2E8F0] last:border-0 hover:bg-[#FAFAF7]">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-[#2D3748]">{req.visitor.name}</p>
                      <p className="text-xs text-[#718096]">{req.visitor.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-[#2D3748] line-clamp-1 max-w-[200px]">
                        {req.property.titleAr || req.property.title}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs text-[#718096]">
                        <TypeIcon className="h-3.5 w-3.5" />
                        {typeInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-[#718096] line-clamp-2 max-w-[200px]">
                        {req.message || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {req.response ? (
                        <p className="text-xs text-blue-600 line-clamp-2 max-w-[200px]">
                          {req.response}
                        </p>
                      ) : (
                        <span className="text-xs text-[#A0AEC0]">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${statusInfo.color} ${statusInfo.bg}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#718096]">
                      {new Date(req.createdAt).toLocaleDateString('ar-SA-u-nu-latn')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {!req.response && (
                          <button
                            onClick={() => { setReplyModal({ id: req.id, visitorName: req.visitor.name }); setReplyText('') }}
                            className="rounded-lg bg-[#C8A96E]/10 px-2.5 py-1 text-xs font-medium text-[#C8A96E] transition-colors hover:bg-[#C8A96E]/20"
                          >
                            رد
                          </button>
                        )}
                        <select
                          value={req.status}
                          onChange={(e) => handleStatusChange(req.id, e.target.value as any)}
                          className="rounded-lg border border-[#E2E8F0] px-2 py-1 text-xs text-[#2D3748] focus:outline-none"
                        >
                          <option value="PENDING">قيد الانتظار</option>
                          <option value="RESPONDED">تم الرد</option>
                          <option value="CLOSED">مغلق</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-[#E2E8F0] p-2 text-[#718096] transition-colors hover:bg-[#F7F7F2] disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="text-sm text-[#718096]">
            {page} / {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages}
            className="rounded-lg border border-[#E2E8F0] p-2 text-[#718096] transition-colors hover:bg-[#F7F7F2] disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Reply Modal */}
      {replyModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setReplyModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#2D3748]">الرد على طلب {replyModal.visitorName}</h3>
                <button onClick={() => setReplyModal(null)} className="rounded-lg p-1 text-[#718096] hover:bg-[#F7F7F2]">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="اكتب الرد هنا..."
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748] placeholder:text-[#A0AEC0] focus:outline-none focus:ring-1 focus:ring-[#C8A96E]"
                rows={4}
                autoFocus
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setReplyModal(null)}
                  className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm text-[#718096] transition-colors hover:bg-[#F7F7F2]"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleReplySubmit}
                  disabled={!replyText.trim() || submittingReply}
                  className="flex items-center gap-2 rounded-lg bg-[#C8A96E] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#B8994E] disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {submittingReply ? 'جاري الإرسال...' : 'إرسال الرد'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
