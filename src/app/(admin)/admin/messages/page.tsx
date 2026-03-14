'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Mail,
  MailOpen,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquare,
  Clock,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  message: string
  isRead: boolean
  notes: string | null
  createdAt: string
}

interface MessagesResponse {
  messages: ContactMessage[]
  total: number
  page: number
  totalPages: number
}

export default function AdminMessagesPage() {
  const [data, setData] = useState<MessagesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [search, setSearch] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), filter })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/messages?${params}`)
      if (res.ok) {
        setData(await res.json())
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, filter, search])

  useEffect(() => { fetchMessages() }, [fetchMessages])

  async function toggleRead(msg: ContactMessage) {
    try {
      await fetch(`/api/admin/messages/${msg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !msg.isRead }),
      })
      fetchMessages()
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage({ ...msg, isRead: !msg.isRead })
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function markAsRead(msg: ContactMessage) {
    if (msg.isRead) return
    try {
      await fetch(`/api/admin/messages/${msg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      })
      fetchMessages()
    } catch (err) {
      console.error(err)
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('ar-SA-u-nu-latn', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3748]">الرسائل</h1>
          <p className="mt-1 text-sm text-[#718096]">
            رسائل التواصل من صفحة &quot;تواصل معنا&quot;
          </p>
        </div>
        {data && (
          <div className="flex items-center gap-2 text-sm text-[#718096]">
            <MessageSquare className="h-4 w-4" />
            {data.total} رسالة
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0AEC0]" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="بحث بالاسم أو البريد أو الرسالة..."
            className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2.5 pe-4 ps-10 text-sm placeholder:text-[#A0AEC0] focus:border-[#C8A96E] focus:outline-none focus:ring-1 focus:ring-[#C8A96E]"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex rounded-lg border border-[#E2E8F0] bg-white p-1">
          {([['all', 'الكل'], ['unread', 'غير مقروء'], ['read', 'مقروء']] as const).map(
            ([val, label]) => (
              <button
                key={val}
                onClick={() => { setFilter(val); setPage(1) }}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  filter === val
                    ? 'bg-[#C8A96E] text-white'
                    : 'text-[#718096] hover:text-[#2D3748]'
                )}
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#C8A96E]" />
        </div>
      ) : !data?.messages.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Mail className="h-12 w-12 text-[#E2E8F0]" />
          <p className="mt-4 text-sm text-[#718096]">لا توجد رسائل</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.messages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => { setSelectedMessage(msg); markAsRead(msg) }}
              className={cn(
                'flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all hover:shadow-md',
                msg.isRead
                  ? 'border-[#E2E8F0] bg-white'
                  : 'border-[#C8A96E]/20 bg-[#FAF5EB]'
              )}
            >
              <div className={cn(
                'mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                msg.isRead ? 'bg-[#F7F7F2]' : 'bg-[#C8A96E]/20'
              )}>
                {msg.isRead ? (
                  <MailOpen className="h-4 w-4 text-[#A0AEC0]" />
                ) : (
                  <Mail className="h-4 w-4 text-[#C8A96E]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-sm',
                    msg.isRead ? 'text-[#2D3748]' : 'font-semibold text-[#2D3748]'
                  )}>
                    {msg.name}
                  </span>
                  {msg.company && (
                    <span className="text-xs text-[#A0AEC0]">— {msg.company}</span>
                  )}
                </div>
                <p className="text-xs text-[#718096]">{msg.email}</p>
                <p className="mt-1 line-clamp-1 text-sm text-[#718096]">{msg.message}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1 text-xs text-[#A0AEC0]">
                <Clock className="h-3 w-3" />
                {formatDate(msg.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-[#E2E8F0] p-2 text-[#718096] transition-colors hover:bg-[#F7F7F2] disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="text-sm text-[#718096]">
            {page} / {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages}
            className="rounded-lg border border-[#E2E8F0] p-2 text-[#718096] transition-colors hover:bg-[#F7F7F2] disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setSelectedMessage(null)}>
          <div className="mx-4 w-full max-w-lg rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#2D3748]">تفاصيل الرسالة</h3>
              <button onClick={() => setSelectedMessage(null)} className="rounded-lg p-1 text-[#718096] hover:bg-[#F7F7F2]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#2D3748]">{selectedMessage.name}</p>
                  <p className="text-sm text-[#718096]">{selectedMessage.email}</p>
                </div>
                <button
                  onClick={() => toggleRead(selectedMessage)}
                  className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs text-[#718096] transition-colors hover:bg-[#F7F7F2]"
                >
                  {selectedMessage.isRead ? 'تحديد كغير مقروء' : 'تحديد كمقروء'}
                </button>
              </div>
              {selectedMessage.phone && (
                <p className="text-sm text-[#718096]">الجوال: <span dir="ltr">{selectedMessage.phone}</span></p>
              )}
              {selectedMessage.company && (
                <p className="text-sm text-[#718096]">الشركة: {selectedMessage.company}</p>
              )}
              <div className="rounded-lg bg-[#FAFAF7] p-4">
                <p className="text-sm leading-relaxed text-[#2D3748] whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              <p className="text-xs text-[#A0AEC0]">{formatDate(selectedMessage.createdAt)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
