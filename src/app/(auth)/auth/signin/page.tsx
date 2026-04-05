'use client'

import { Suspense, useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { ShieldCheck, ArrowRight, ChevronDown } from 'lucide-react'

import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

// ─── i18n ────────────────────────────────────────────────────────

const t = {
  ar: {
    title: 'مرحباً بعودتك',
    subtitle: 'قم بتسجيل الدخول للوصول إلى لوحة التحكم',
    phone: 'رقم الجوال',
    phonePlaceholder: '05XXXXXXXX',
    sendOtp: 'إرسال رمز التحقق',
    sendingOtp: 'جاري الإرسال...',
    otpCode: 'رمز التحقق',
    otpSentTo: 'تم إرسال الرمز إلى',
    verify: 'تحقق وسجل الدخول',
    verifying: 'جاري التحقق...',
    resendOtp: 'إعادة إرسال الرمز',
    resendIn: 'إعادة الإرسال بعد',
    seconds: 'ث',
    changeNumber: 'تغيير الرقم',
    noAccount: 'ليس لديك حساب؟',
    register: 'إنشاء حساب',
    invalidOtp: 'رمز التحقق غير صحيح أو منتهي الصلاحية',
    userNotFound: 'هذا الرقم غير مسجل في النظام',
    sendFailed: 'فشل إرسال رمز التحقق. يرجى المحاولة مرة أخرى.',
    missingFields: 'يرجى إدخال جميع الحقول المطلوبة',
    genericError: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    phoneRequired: 'رقم الجوال مطلوب',
  },
  en: {
    title: 'Welcome Back',
    subtitle: 'Sign in to access your dashboard',
    phone: 'Phone Number',
    phonePlaceholder: '05XXXXXXXX',
    sendOtp: 'Send OTP',
    sendingOtp: 'Sending...',
    otpCode: 'Verification Code',
    otpSentTo: 'Code sent to',
    verify: 'Verify & Sign In',
    verifying: 'Verifying...',
    resendOtp: 'Resend Code',
    resendIn: 'Resend in',
    seconds: 's',
    changeNumber: 'Change number',
    noAccount: "Don't have an account?",
    register: 'Register',
    invalidOtp: 'Invalid or expired verification code',
    userNotFound: 'This number is not registered',
    sendFailed: 'Failed to send verification code. Please try again.',
    missingFields: 'Please fill in all required fields',
    genericError: 'An error occurred. Please try again.',
    phoneRequired: 'Phone number is required',
  },
} as const

type Locale = 'ar' | 'en'

/** Map API error codes to i18n keys */
const errorCodeMap: Record<string, keyof typeof t['ar']> = {
  INVALID_OTP: 'invalidOtp',
  USER_NOT_FOUND: 'userNotFound',
  SEND_FAILED: 'sendFailed',
  MISSING_FIELDS: 'missingFields',
  MISSING_PHONE: 'phoneRequired',
  SERVER_ERROR: 'genericError',
}

// ─── Gulf Countries ──────────────────────────────────────────────

const gulfCountries = [
  { code: '966', flag: '🇸🇦', nameAr: 'السعودية', nameEn: 'Saudi Arabia', placeholder: '5XXXXXXXX' },
  { code: '971', flag: '🇦🇪', nameAr: 'الإمارات', nameEn: 'UAE', placeholder: '5XXXXXXXX' },
  { code: '973', flag: '🇧🇭', nameAr: 'البحرين', nameEn: 'Bahrain', placeholder: '3XXXXXXX' },
  { code: '965', flag: '🇰🇼', nameAr: 'الكويت', nameEn: 'Kuwait', placeholder: '5XXXXXXX' },
  { code: '968', flag: '🇴🇲', nameAr: 'عُمان', nameEn: 'Oman', placeholder: '9XXXXXXX' },
  { code: '974', flag: '🇶🇦', nameAr: 'قطر', nameEn: 'Qatar', placeholder: '5XXXXXXX' },
] as const

// ─── 6-Digit OTP Input ──────────────────────────────────────────

function OtpInput({
  value,
  onChange,
  onComplete,
  hasError,
  locale,
  errorId,
}: {
  value: string
  onChange: (val: string) => void
  onComplete: (code: string) => void
  hasError?: boolean
  locale: Locale
  errorId?: string
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '')

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus()
  }

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return
    const arr = digits.slice()
    arr[index] = char
    const next = arr.join('').replace(/[^\d]/g, '')
    onChange(next)
    if (char && index < 5) {
      focusInput(index + 1)
    }
    if (next.length === 6) {
      setTimeout(() => onComplete(next), 50)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (digits[index]) {
        handleChange(index, '')
      } else if (index > 0) {
        focusInput(index - 1)
        handleChange(index - 1, '')
      }
    } else if (e.key === 'ArrowLeft') {
      if (index > 0) focusInput(index - 1)
    } else if (e.key === 'ArrowRight') {
      if (index < 5) focusInput(index + 1)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted) {
      onChange(pasted)
      focusInput(Math.min(pasted.length, 5))
      if (pasted.length === 6) {
        setTimeout(() => onComplete(pasted), 50)
      }
    }
  }

  const borderColor = hasError
    ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
    : 'border-edge focus:border-primary focus:ring-primary/20'

  return (
    <div className="flex gap-1.5 sm:gap-2.5 justify-center" dir="ltr">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit || ''}
          aria-label={`${locale === 'ar' ? 'الرقم' : 'Digit'} ${i + 1} ${locale === 'ar' ? 'من' : 'of'} 6`}
          aria-describedby={hasError && errorId ? errorId : undefined}
          onChange={(e) => handleChange(i, e.target.value.slice(-1))}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`
            w-10 h-12 sm:w-14 sm:h-16
            rounded-lg sm:rounded-xl border-2 bg-elevated
            text-center text-xl sm:text-3xl font-bold text-heading
            outline-none transition-all duration-200
            focus:ring-4 focus:scale-105
            placeholder:text-dim
            ${borderColor}
          `}
          placeholder="·"
          autoFocus={i === 0}
        />
      ))}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[400px] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <SignInForm />
    </Suspense>
  )
}

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const locale: Locale = 'ar'
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [countryCode, setCountryCode] = useState('966')
  const [phoneValue, setPhoneValue] = useState('')
  const [countryOpen, setCountryOpen] = useState(false)
  const [focusedCountryIndex, setFocusedCountryIndex] = useState(
    gulfCountries.findIndex(c => c.code === countryCode)
  )
  const countryRef = useRef<HTMLDivElement>(null)
  const [otpCode, setOtpCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const strings = t[locale]
  const isRtl = locale === 'ar'
  const selectedCountry = gulfCountries.find(c => c.code === countryCode) || gulfCountries[0]

  // Build full international phone: strip leading 0 from local number, prepend +code
  const buildFullPhone = () => {
    const local = phoneValue.replace(/\D/g, '').replace(/^0+/, '')
    return `+${countryCode}${local}`
  }

  // Close country dropdown on outside click
  useEffect(() => {
    if (!countryOpen) return
    const handleClick = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [countryOpen])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleSendOtp = useCallback(async () => {
    if (!phoneValue.trim()) {
      setError(strings.phoneRequired)
      return
    }
    setError(null)
    setSending(true)
    try {
      const fullPhone = buildFullPhone()
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      })
      const data = await res.json()
      if (!res.ok) {
        const key = errorCodeMap[data.error]
        setError(key ? strings[key] : strings.genericError)
        return
      }
      setStep('otp')
      setCountdown(60)
    } catch {
      setError(strings.genericError)
    } finally {
      setSending(false)
    }
  }, [phoneValue, countryCode, strings])

  const handleVerify = useCallback(async (codeOverride?: string) => {
    const code = codeOverride || otpCode
    if (code.length < 6) return
    setError(null)
    setVerifying(true)
    try {
      const fullPhone = buildFullPhone()
      const verifyRes = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, code }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) {
        const key = errorCodeMap[verifyData.error]
        setError(key ? strings[key] : strings.invalidOtp)
        return
      }
      const result = await signIn('credentials', {
        phone: fullPhone,
        verified: 'true',
        redirect: false,
        callbackUrl,
      })
      if (result?.error) {
        setError(strings.userNotFound)
        return
      }
      router.push(callbackUrl)
      router.refresh()
    } catch {
      setError(strings.genericError)
    } finally {
      setVerifying(false)
    }
  }, [phoneValue, countryCode, otpCode, callbackUrl, router, strings])

  return (
    <div dir="rtl" className="w-full max-w-md mx-auto">
      <Card className="border-edge bg-elevated shadow-xl rounded-2xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-heading via-primary to-heading" />

        <CardContent className="px-7 py-9 sm:px-10 sm:py-10">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <Logo size="lg" variant="light" />
            <h1 className="mt-5 text-2xl font-bold text-heading">{strings.title}</h1>
            <p className="mt-2 text-sm text-body">{strings.subtitle}</p>
          </div>

          {/* Error */}
          {error && (
            <div id="signin-error" role="alert" aria-live="polite" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ── Step 1: Phone ── */}
          {step === 'phone' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-heading">
                  {strings.phone}
                </Label>
                <div className="flex gap-2" dir="ltr">
                  {/* Country Code Selector */}
                  <div className="relative" ref={countryRef}>
                    <button
                      type="button"
                      onClick={() => {
                        const opening = !countryOpen
                        setCountryOpen(opening)
                        if (opening) {
                          setFocusedCountryIndex(gulfCountries.findIndex(c => c.code === countryCode))
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault()
                          if (!countryOpen) {
                            setCountryOpen(true)
                            setFocusedCountryIndex(gulfCountries.findIndex(c => c.code === countryCode))
                          } else {
                            setFocusedCountryIndex(prev => Math.min(prev + 1, gulfCountries.length - 1))
                          }
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault()
                          setFocusedCountryIndex(prev => Math.max(prev - 1, 0))
                        } else if (e.key === 'Escape') {
                          setCountryOpen(false)
                        } else if ((e.key === 'Enter' || e.key === ' ') && countryOpen) {
                          e.preventDefault()
                          setCountryCode(gulfCountries[focusedCountryIndex].code)
                          setCountryOpen(false)
                        }
                      }}
                      aria-expanded={countryOpen}
                      aria-haspopup="listbox"
                      aria-label={locale === 'ar' ? 'اختر رمز الدولة' : 'Select country code'}
                      className="flex items-center gap-1.5 h-13 px-3 rounded-xl border-2 border-edge bg-elevated text-sm font-medium text-heading hover:border-primary/50 transition-colors whitespace-nowrap"
                    >
                      <span className="text-lg leading-none">{selectedCountry.flag}</span>
                      <span className="tabular-nums">+{selectedCountry.code}</span>
                      <ChevronDown className="h-3.5 w-3.5 text-dim" />
                    </button>
                    {countryOpen && (
                      <div role="listbox" aria-label={locale === 'ar' ? 'رموز الدول' : 'Country codes'} className="absolute top-full left-0 mt-1 w-56 rounded-xl border border-edge bg-elevated shadow-xl z-50 py-1 overflow-hidden">
                        {gulfCountries.map((country, idx) => (
                          <button
                            key={country.code}
                            type="button"
                            role="option"
                            aria-selected={country.code === countryCode}
                            onClick={() => { setCountryCode(country.code); setCountryOpen(false) }}
                            onMouseEnter={() => setFocusedCountryIndex(idx)}
                            className={`flex items-center gap-3 w-full px-3.5 py-2.5 text-sm transition-colors hover:bg-card-hover ${
                              country.code === countryCode ? 'bg-card-hover text-primary font-semibold' : 'text-heading'
                            } ${idx === focusedCountryIndex ? 'ring-2 ring-inset ring-primary' : ''}`}
                          >
                            <span className="text-lg leading-none">{country.flag}</span>
                            <span className="flex-1 text-left">{locale === 'ar' ? country.nameAr : country.nameEn}</span>
                            <span className="tabular-nums text-body">+{country.code}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Phone Input */}
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={selectedCountry.placeholder}
                    aria-describedby={error ? 'signin-error' : undefined}
                    className="flex-1 h-13 text-base rounded-xl border-2 border-edge focus:border-primary focus:ring-4 focus:ring-primary/20"
                    value={phoneValue}
                    onChange={(e) => setPhoneValue(e.target.value.replace(/[^\d]/g, ''))}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                  />
                </div>
              </div>

              <Button
                type="button"
                className="w-full h-13 text-base rounded-xl font-semibold shadow-md"
                isLoading={sending}
                onClick={handleSendOtp}
              >
                {sending ? strings.sendingOtp : strings.sendOtp}
              </Button>
            </div>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 'otp' && (
            <div className="space-y-6">
              {/* Info banner */}
              <div className="flex items-center justify-between rounded-xl bg-card-hover px-4 py-3 border border-edge">
                <div className="flex items-center gap-2 text-sm text-body">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                  <span>{strings.otpSentTo}</span>
                </div>
                <span className="text-sm font-bold text-heading tabular-nums" dir="ltr">{buildFullPhone()}</span>
              </div>

              {/* 6 digit fields */}
              <div className="space-y-3">
                <Label className="block text-center text-sm font-medium text-heading">
                  {strings.otpCode}
                </Label>
                <OtpInput
                  value={otpCode}
                  onChange={(val) => { setOtpCode(val); setError(null) }}
                  onComplete={handleVerify}
                  hasError={!!error}
                  locale={locale}
                  errorId={error ? 'signin-error' : undefined}
                />
              </div>

              <Button
                type="button"
                className="w-full h-13 text-base rounded-xl font-semibold shadow-md"
                isLoading={verifying}
                onClick={() => handleVerify()}
                disabled={otpCode.length < 6}
              >
                {verifying ? strings.verifying : strings.verify}
              </Button>

              {/* Actions row */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => { setStep('phone'); setOtpCode(''); setError(null) }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-body hover:text-heading transition-colors"
                >
                  <ArrowRight className="h-3 w-3 ltr:rotate-180" />
                  {strings.changeNumber}
                </button>
                {countdown > 0 ? (
                  <span className="text-xs tabular-nums text-dim">
                    {strings.resendIn} {countdown}{strings.seconds}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {strings.resendOtp}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="my-7 border-t border-edge" />

          {/* Register link */}
          <p className="text-center text-sm text-body">
            {strings.noAccount}{' '}
            <Link
              href="/auth/signup"
              className="font-semibold text-primary hover:text-primary/90 hover:underline"
            >
              {strings.register}
            </Link>
          </p>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-dim">
        FALZ Platform &copy; {new Date().getFullYear()}
      </p>
    </div>
  )
}
