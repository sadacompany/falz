'use client'

import { useState } from 'react'
import { Info, Eye, MessageSquare, X, Loader2 } from 'lucide-react'
import { useVisitorAuth } from './VisitorAuthContext'

interface RequestButtonsProps {
  propertyId: string
}

type RequestType = 'INTEREST' | 'VIEWING' | 'INFO'

const REQUEST_TYPES: { type: RequestType; label: string; icon: typeof Info }[] = [
  { type: 'INTEREST', label: 'أبدي اهتمامي', icon: MessageSquare },
  { type: 'VIEWING', label: 'حجز معاينة', icon: Eye },
  { type: 'INFO', label: 'طلب معلومات', icon: Info },
]

export function RequestButtons({ propertyId }: RequestButtonsProps) {
  const { visitor, setShowAuthModal } = useVisitorAuth()
  const [modalType, setModalType] = useState<RequestType | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function handleClick(type: RequestType) {
    if (!visitor) {
      setShowAuthModal(true)
      return
    }
    setModalType(type)
    setMessage('')
    setSuccess(false)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!modalType) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/public/visitors/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, type: modalType, message: message || undefined }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'حدث خطأ')
      }

      setSuccess(true)
      setTimeout(() => {
        setModalType(null)
        setSuccess(false)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  const typeLabels: Record<RequestType, string> = {
    INTEREST: 'إبداء اهتمام',
    VIEWING: 'حجز معاينة',
    INFO: 'طلب معلومات',
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {REQUEST_TYPES.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => handleClick(type)}
            className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[#F7F8FA]"
            style={{ borderColor: 'var(--theme-border, #E2E8F0)', color: 'var(--theme-text, #2D3748)' }}
          >
            <Icon className="h-4 w-4" style={{ color: 'var(--theme-accent, #C8A96E)' }} />
            {label}
          </button>
        ))}
      </div>

      {/* Request Modal */}
      {modalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setModalType(null)}>
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--theme-primary, #1E3A5F)' }}>
                {typeLabels[modalType]}
              </h3>
              <button onClick={() => setModalType(null)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {success ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-green-600">تم إرسال طلبك بنجاح!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--theme-text, #2D3748)' }}>
                    رسالة (اختياري)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="اكتب رسالتك هنا..."
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                    style={{ borderColor: 'var(--theme-border, #E2E8F0)' }}
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60"
                  style={{ backgroundColor: 'var(--theme-accent, #C8A96E)' }}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  إرسال الطلب
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
