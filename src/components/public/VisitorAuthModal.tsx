'use client'

import { useState, useEffect } from 'react'
import { usePublicOffice } from './PublicOfficeContext'
import { useVisitorAuth } from './VisitorAuthContext'
import { X, Loader2, User, Phone, CheckCircle2 } from 'lucide-react'

export function VisitorAuthModal() {
  const { office } = usePublicOffice()
  const { showAuthModal, setShowAuthModal, refresh } = useVisitorAuth()
  const [step, setStep] = useState<'info' | 'otp'>('info')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form fields
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [countdown, setCountdown] = useState(0)

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  if (!showAuthModal) return null

  async function handleSendOtp() {
    if (!phone.trim()) {
      setError('رقم الجوال مطلوب')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/public/visitors/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل إرسال الرمز')

      setStep('otp')
      setCountdown(60)
    } catch (err: any) {
      setError(err.message || 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp() {
    if (!otpCode.trim() || otpCode.length < 6) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/public/visitors/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          code: otpCode,
          officeId: office.id,
          name: name.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'رمز التحقق غير صحيح')

      await refresh()
      setShowAuthModal(false)
      resetForm()
    } catch (err: any) {
      setError(err.message || 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setName('')
    setPhone('')
    setOtpCode('')
    setError('')
    setStep('info')
    setCountdown(0)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowAuthModal(false)}>
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: 'var(--theme-primary)' }}>
            تسجيل الدخول
          </h2>
          <button onClick={() => { setShowAuthModal(false); resetForm() }} className="rounded-lg p-1 text-[#718096] hover:bg-[#F7F7F2]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step 1: Phone + Name */}
        {step === 'info' && (
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0AEC0]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الاسم (للتسجيل الجديد)"
                className="w-full rounded-lg border py-2.5 pe-4 ps-10 text-sm focus:outline-none focus:ring-1"
                style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
              />
            </div>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0AEC0]" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                dir="ltr"
                className="w-full rounded-lg border py-2.5 pe-4 ps-10 text-sm focus:outline-none focus:ring-1"
                style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="button"
              disabled={loading}
              onClick={handleSendOtp}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: 'var(--theme-accent)' }}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              إرسال رمز التحقق
            </button>
          </div>
        )}

        {/* Step 2: OTP */}
        {step === 'otp' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-[#718096]">
              <span dir="ltr">{phone}</span>
              <button
                type="button"
                onClick={() => { setStep('info'); setOtpCode(''); setError('') }}
                className="text-sm hover:underline"
                style={{ color: 'var(--theme-accent)' }}
              >
                تغيير الرقم
              </button>
            </div>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="أدخل الرمز المكون من 6 أرقام"
              dir="ltr"
              className="w-full rounded-lg border py-3 text-center text-lg tracking-[0.5em] focus:outline-none focus:ring-1"
              style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
              autoFocus
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="button"
              disabled={loading || otpCode.length < 6}
              onClick={handleVerifyOtp}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: 'var(--theme-accent)' }}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              تحقق وسجل الدخول
            </button>

            <div className="text-center">
              {countdown > 0 ? (
                <span className="text-sm text-[#A0AEC0]">
                  إعادة الإرسال بعد {countdown} ثانية
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-sm hover:underline"
                  style={{ color: 'var(--theme-accent)' }}
                >
                  إعادة إرسال الرمز
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
