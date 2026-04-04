'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  User,
  Building2,
  Phone,
  Globe,
  Upload,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  ImageIcon,
  Mail,
} from 'lucide-react'

import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

// ─── i18n ──────────────────────────────────────────────────────

const t = {
  ar: {
    title: 'إنشاء حساب جديد',
    subtitle: 'ابدأ رحلتك مع منصة فالز',
    step1: 'معلومات الحساب',
    step2: 'معلومات المكتب',
    step3: 'شعار المكتب',
    fullName: 'الاسم الكامل',
    fullNamePlaceholder: 'أدخل اسمك الكامل',
    phone: 'رقم الجوال',
    phonePlaceholder: '05XXXXXXXX',
    email: 'البريد الإلكتروني (اختياري)',
    emailPlaceholder: 'أدخل بريدك الإلكتروني',
    sendOtp: 'إرسال رمز التحقق',
    sendingOtp: 'جاري الإرسال...',
    otpCode: 'رمز التحقق',
    otpPlaceholder: 'أدخل الرمز المكون من 6 أرقام',
    verifyPhone: 'تحقق من الرقم',
    verifyingPhone: 'جاري التحقق...',
    phoneVerified: 'تم التحقق من الرقم',
    resendOtp: 'إعادة إرسال الرمز',
    resendIn: 'إعادة الإرسال بعد',
    seconds: 'ثانية',
    officeNameAr: 'اسم المكتب (عربي)',
    officeNameArPlaceholder: 'مثال: مكتب الفالز العقاري',
    officeNameEn: 'اسم المكتب (إنجليزي)',
    officeNameEnPlaceholder: 'e.g. FALZ Real Estate',
    slug: 'الرابط المختصر',
    slugPlaceholder: 'falz-real-estate',
    slugHelp: 'سيكون رابط مكتبك: falz.sa/',
    falLicense: 'رقم رخصة فال',
    falLicensePlaceholder: 'أدخل رقم الرخصة',
    officePhone: 'رقم هاتف المكتب',
    officePhonePlaceholder: '+966 5XX XXX XXXX',
    whatsapp: 'رقم الواتساب',
    whatsappPlaceholder: '+966 5XX XXX XXXX',
    officeEmail: 'البريد الإلكتروني للمكتب',
    officeEmailPlaceholder: 'info@office.com',
    uploadLogo: 'رفع شعار المكتب',
    dragDrop: 'اسحب وأفلت الشعار هنا',
    orClickUpload: 'أو انقر للرفع',
    maxSize: 'الحجم الأقصى: 5 ميجابايت',
    formats: 'JPG, PNG, WebP',
    skipLogo: 'تخطي - يمكنك رفع الشعار لاحقاً',
    next: 'التالي',
    previous: 'السابق',
    createAccount: 'إنشاء الحساب',
    creating: 'جاري الإنشاء...',
    haveAccount: 'لديك حساب بالفعل؟',
    signIn: 'تسجيل الدخول',
    nameRequired: 'الاسم مطلوب',
    phoneRequired: 'رقم الجوال مطلوب',
    officeNameArRequired: 'اسم المكتب بالعربية مطلوب',
    slugRequired: 'الرابط المختصر مطلوب',
    slugInvalid: 'يجب أن يحتوي على أحرف لاتينية صغيرة وأرقام وشرطات فقط',
    registrationFailed: 'فشل في إنشاء الحساب. يرجى المحاولة مرة أخرى.',
    phoneExists: 'رقم الجوال مسجل بالفعل',
    slugExists: 'الرابط المختصر مستخدم بالفعل',
    verifyPhoneFirst: 'يرجى التحقق من رقم الجوال أولاً',
    invalidOtp: 'رمز التحقق غير صحيح أو منتهي الصلاحية',
    genericError: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
  },
  en: {
    title: 'Create New Account',
    subtitle: 'Start your journey with FALZ platform',
    step1: 'Account Info',
    step2: 'Office Info',
    step3: 'Office Logo',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Enter your full name',
    phone: 'Phone Number',
    phonePlaceholder: '05XXXXXXXX',
    email: 'Email (optional)',
    emailPlaceholder: 'Enter your email',
    sendOtp: 'Send OTP',
    sendingOtp: 'Sending...',
    otpCode: 'Verification Code',
    otpPlaceholder: 'Enter 6-digit code',
    verifyPhone: 'Verify Phone',
    verifyingPhone: 'Verifying...',
    phoneVerified: 'Phone verified',
    resendOtp: 'Resend Code',
    resendIn: 'Resend in',
    seconds: 's',
    officeNameAr: 'Office Name (Arabic)',
    officeNameArPlaceholder: 'e.g. مكتب الفالز العقاري',
    officeNameEn: 'Office Name (English)',
    officeNameEnPlaceholder: 'e.g. FALZ Real Estate',
    slug: 'URL Slug',
    slugPlaceholder: 'falz-real-estate',
    slugHelp: 'Your office URL: falz.sa/',
    falLicense: 'FAL License Number',
    falLicensePlaceholder: 'Enter license number',
    officePhone: 'Office Phone',
    officePhonePlaceholder: '+966 5XX XXX XXXX',
    whatsapp: 'WhatsApp Number',
    whatsappPlaceholder: '+966 5XX XXX XXXX',
    officeEmail: 'Office Email',
    officeEmailPlaceholder: 'info@office.com',
    uploadLogo: 'Upload Office Logo',
    dragDrop: 'Drag and drop your logo here',
    orClickUpload: 'or click to upload',
    maxSize: 'Max size: 5MB',
    formats: 'JPG, PNG, WebP',
    skipLogo: 'Skip - you can upload a logo later',
    next: 'Next',
    previous: 'Previous',
    createAccount: 'Create Account',
    creating: 'Creating...',
    haveAccount: 'Already have an account?',
    signIn: 'Sign In',
    nameRequired: 'Name is required',
    phoneRequired: 'Phone number is required',
    officeNameArRequired: 'Arabic office name is required',
    slugRequired: 'URL slug is required',
    slugInvalid: 'Only lowercase letters, numbers, and hyphens allowed',
    registrationFailed: 'Registration failed. Please try again.',
    phoneExists: 'Phone number is already registered',
    slugExists: 'This slug is already in use',
    verifyPhoneFirst: 'Please verify your phone number first',
    invalidOtp: 'Invalid or expired verification code',
    genericError: 'An error occurred. Please try again.',
  },
} as const

type Locale = 'ar' | 'en'

// ─── Gulf Countries ──────────────────────────────────────────────

const gulfCountries = [
  { code: '966', flag: '🇸🇦', nameAr: 'السعودية', nameEn: 'Saudi Arabia', placeholder: '5XXXXXXXX' },
  { code: '971', flag: '🇦🇪', nameAr: 'الإمارات', nameEn: 'UAE', placeholder: '5XXXXXXXX' },
  { code: '973', flag: '🇧🇭', nameAr: 'البحرين', nameEn: 'Bahrain', placeholder: '3XXXXXXX' },
  { code: '965', flag: '🇰🇼', nameAr: 'الكويت', nameEn: 'Kuwait', placeholder: '5XXXXXXX' },
  { code: '968', flag: '🇴🇲', nameAr: 'عُمان', nameEn: 'Oman', placeholder: '9XXXXXXX' },
  { code: '974', flag: '🇶🇦', nameAr: 'قطر', nameEn: 'Qatar', placeholder: '5XXXXXXX' },
] as const

/** Map API error codes to i18n keys */
const errorCodeMap: Record<string, keyof typeof t['ar']> = {
  INVALID_OTP: 'invalidOtp',
  SEND_FAILED: 'genericError',
  MISSING_FIELDS: 'phoneRequired',
  MISSING_PHONE: 'phoneRequired',
  SERVER_ERROR: 'genericError',
  PHONE_EXISTS: 'phoneExists',
  SLUG_EXISTS: 'slugExists',
  VALIDATION_ERROR: 'registrationFailed',
  INTERNAL_ERROR: 'registrationFailed',
}

const TOTAL_STEPS = 3

// ─── Component ─────────────────────────────────────────────────

export default function SignUpPage() {
  const router = useRouter()
  const [locale, setLocale] = useState<Locale>('ar')
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // OTP state
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [countryCode, setCountryCode] = useState('966')
  const [countryOpen, setCountryOpen] = useState(false)
  const countryRef = useRef<HTMLDivElement>(null)

  const strings = t[locale]
  const isRtl = locale === 'ar'
  const selectedCountry = gulfCountries.find(c => c.code === countryCode) || gulfCountries[0]

  // Build full international phone from country code + local number
  const buildFullPhone = (localPhone: string) => {
    const local = localPhone.replace(/\D/g, '').replace(/^0+/, '')
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

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  // Step 1 schema
  const step1Schema = z.object({
    name: z.string().min(1, strings.nameRequired),
    phone: z.string().min(1, strings.phoneRequired),
    email: z.string().email().optional().or(z.literal('')),
  })

  // Step 2 schema
  const step2Schema = z.object({
    officeNameAr: z.string().min(1, strings.officeNameArRequired),
    officeNameEn: z.string().optional(),
    slug: z
      .string()
      .min(1, strings.slugRequired)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, strings.slugInvalid),
    falLicenseNo: z.string().optional(),
    officePhone: z.string().optional(),
    whatsapp: z.string().optional(),
    officeEmail: z.string().optional(),
  })

  type Step1Data = z.infer<typeof step1Schema>
  type Step2Data = z.infer<typeof step2Schema>

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { name: '', phone: '', email: '' },
  })

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      officeNameAr: '',
      officeNameEn: '',
      slug: '',
      falLicenseNo: '',
      officePhone: '',
      whatsapp: '',
      officeEmail: '',
    },
  })

  const handleOfficeNameEnChange = (value: string) => {
    step2Form.setValue('officeNameEn', value)
    if (!step2Form.getValues('slug') || step2Form.getValues('slug') === '') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      step2Form.setValue('slug', slug)
    }
  }

  // ─── OTP Handlers ──────────────────────────────────────────────

  const handleSendOtp = async () => {
    const phone = step1Form.getValues('phone')
    if (!phone.trim()) {
      step1Form.setError('phone', { message: strings.phoneRequired })
      return
    }
    setError(null)
    setSendingOtp(true)

    try {
      const fullPhone = buildFullPhone(phone)
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
      setOtpSent(true)
      setCountdown(60)
    } catch {
      setError(strings.genericError)
    } finally {
      setSendingOtp(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) return
    setError(null)
    setVerifyingOtp(true)

    try {
      const phone = step1Form.getValues('phone')
      const fullPhone = buildFullPhone(phone)
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, code: otpCode, mode: 'verify-only' }),
      })
      const data = await res.json()

      if (!res.ok) {
        const key = errorCodeMap[data.error]
        setError(key ? strings[key] : strings.genericError)
        return
      }
      setPhoneVerified(true)
    } catch {
      setError(strings.genericError)
    } finally {
      setVerifyingOtp(false)
    }
  }

  // ─── File Upload Handling ─────────────────────────────────────

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) return

    setLogoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  // ─── Step Navigation ──────────────────────────────────────────

  const goNext = async () => {
    if (step === 1) {
      const valid = await step1Form.trigger()
      if (!valid) return
      if (!phoneVerified) {
        setError(strings.verifyPhoneFirst)
        return
      }
    }
    if (step === 2) {
      const valid = await step2Form.trigger()
      if (!valid) return
    }
    setError(null)
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  const goPrev = () => {
    setStep((s) => Math.max(s - 1, 1))
  }

  // ─── Final Submit ─────────────────────────────────────────────

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFinalSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const step1Data = step1Form.getValues()
      const step2Data = step2Form.getValues()

      const fullPhone = buildFullPhone(step1Data.phone)

      const formData = new FormData()
      formData.append('name', step1Data.name)
      formData.append('phone', fullPhone)
      if (step1Data.email) formData.append('email', step1Data.email)
      formData.append('officeNameAr', step2Data.officeNameAr)
      formData.append('officeNameEn', step2Data.officeNameEn || '')
      formData.append('slug', step2Data.slug)
      formData.append('falLicenseNo', step2Data.falLicenseNo || '')
      formData.append('officePhone', step2Data.officePhone || '')
      formData.append('whatsapp', step2Data.whatsapp || '')
      formData.append('officeEmail', step2Data.officeEmail || '')
      formData.append('themePreset', 'navy-gold')

      if (logoFile) {
        formData.append('logo', logoFile)
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        const key = errorCodeMap[data.error]
        if (data.error === 'PHONE_EXISTS') {
          setError(strings.phoneExists)
          setStep(1)
        } else if (data.error === 'SLUG_EXISTS') {
          setError(strings.slugExists)
          setStep(2)
        } else {
          setError(key ? strings[key] : strings.registrationFailed)
        }
        return
      }

      router.push('/auth/signin?registered=true')
    } catch {
      setError(strings.registrationFailed)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── Step Labels ──────────────────────────────────────────────

  const stepLabels = [strings.step1, strings.step2, strings.step3]
  const stepIcons = [User, Building2, ImageIcon]

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Language Toggle */}
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-2 rounded-lg border border-[#E5DCC6] bg-white px-3 py-1.5 text-xs text-[#7A6C4F] transition-colors hover:border-[#956D00]/40 hover:text-[#956D00] shadow-sm"
        >
          <Globe className="h-3.5 w-3.5" />
          {locale === 'ar' ? 'English' : 'العربية'}
        </button>
      </div>

      <Card className="border-[#E5DCC6] bg-white shadow-lg rounded-2xl">
        <CardContent className="p-8">
          {/* Logo + Header */}
          <div className="mb-6 flex flex-col items-center">
            <Logo size="md" variant="light" />
            <h1 className="mt-3 text-xl font-bold text-[#3B2F08]">
              {strings.title}
            </h1>
            <p className="mt-1 text-sm text-[#7A6C4F]">{strings.subtitle}</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {stepLabels.map((label, i) => {
                const stepNum = i + 1
                const Icon = stepIcons[i]
                const isActive = step === stepNum
                const isCompleted = step > stepNum
                return (
                  <div key={stepNum} className="flex flex-1 flex-col items-center">
                    <div className="flex items-center">
                      {i > 0 && (
                        <div
                          className={`h-0.5 w-8 sm:w-12 transition-colors ${
                            isCompleted ? 'bg-[#956D00]' : 'bg-[#E5DCC6]'
                          }`}
                        />
                      )}
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${
                          isActive
                            ? 'border-[#956D00] bg-[#956D00] text-white'
                            : isCompleted
                              ? 'border-[#956D00] bg-[#F7F1E0] text-[#956D00]'
                              : 'border-[#E5DCC6] bg-[#F7F1E0] text-[#887B60]'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      {i < stepLabels.length - 1 && (
                        <div
                          className={`h-0.5 w-8 sm:w-12 transition-colors ${
                            isCompleted ? 'bg-[#956D00]' : 'bg-[#E5DCC6]'
                          }`}
                        />
                      )}
                    </div>
                    <span
                      className={`mt-1.5 text-[10px] sm:text-xs font-medium ${
                        isActive
                          ? 'text-[#956D00]'
                          : isCompleted
                            ? 'text-[#7A5A00]'
                            : 'text-[#887B60]'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ─── Step 1: Account Info ──────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{strings.fullName}</Label>
                <div className="relative">
                  <User className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-[#887B60]" />
                  <Input
                    id="name"
                    placeholder={strings.fullNamePlaceholder}
                    className="ps-10"
                    autoComplete="name"
                    {...step1Form.register('name')}
                  />
                </div>
                {step1Form.formState.errors.name && (
                  <p className="text-xs text-red-600">
                    {step1Form.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">{strings.phone}</Label>
                <div className="flex gap-2" dir="ltr">
                  {/* Country Code Selector */}
                  <div className="relative" ref={countryRef}>
                    <button
                      type="button"
                      onClick={() => !phoneVerified && setCountryOpen(!countryOpen)}
                      disabled={phoneVerified}
                      className="flex items-center gap-1.5 h-10 px-3 rounded-md border border-[#E5DCC6] bg-white text-sm font-medium text-[#2E2506] hover:border-[#956D00]/50 transition-colors whitespace-nowrap disabled:opacity-50"
                    >
                      <span className="text-lg leading-none">{selectedCountry.flag}</span>
                      <span className="tabular-nums">+{selectedCountry.code}</span>
                      <ChevronDown className="h-3.5 w-3.5 text-[#887B60]" />
                    </button>
                    {countryOpen && (
                      <div className="absolute top-full left-0 mt-1 w-56 rounded-xl border border-[#E5DCC6] bg-white shadow-xl z-50 py-1 overflow-hidden">
                        {gulfCountries.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => { setCountryCode(country.code); setCountryOpen(false) }}
                            className={`flex items-center gap-3 w-full px-3.5 py-2.5 text-sm transition-colors hover:bg-[#F7F1E0] ${
                              country.code === countryCode ? 'bg-[#F7F1E0] text-[#956D00] font-semibold' : 'text-[#2E2506]'
                            }`}
                          >
                            <span className="text-lg leading-none">{country.flag}</span>
                            <span className="flex-1 text-left">{locale === 'ar' ? country.nameAr : country.nameEn}</span>
                            <span className="tabular-nums text-[#7A6C4F]">+{country.code}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Phone Input */}
                  <div className="relative flex-1">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={selectedCountry.placeholder}
                      dir="ltr"
                      disabled={phoneVerified}
                      {...step1Form.register('phone', {
                        onChange: (e) => {
                          e.target.value = e.target.value.replace(/[^\d]/g, '')
                        },
                      })}
                    />
                    {phoneVerified && (
                      <CheckCircle2 className="absolute top-1/2 -translate-y-1/2 right-3 h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                </div>
                {step1Form.formState.errors.phone && (
                  <p className="text-xs text-red-600">
                    {step1Form.formState.errors.phone.message}
                  </p>
                )}
              </div>

              {/* OTP Flow */}
              {!phoneVerified && !otpSent && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  isLoading={sendingOtp}
                  onClick={handleSendOtp}
                >
                  {sendingOtp ? strings.sendingOtp : strings.sendOtp}
                </Button>
              )}

              {!phoneVerified && otpSent && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="otp">{strings.otpCode}</Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder={strings.otpPlaceholder}
                      className="text-center text-lg tracking-[0.5em]"
                      dir="ltr"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                      autoFocus
                    />
                  </div>
                  <Button
                    type="button"
                    className="w-full"
                    isLoading={verifyingOtp}
                    onClick={handleVerifyOtp}
                    disabled={otpCode.length < 6}
                  >
                    {verifyingOtp ? strings.verifyingPhone : strings.verifyPhone}
                  </Button>
                  <div className="text-center">
                    {countdown > 0 ? (
                      <span className="text-xs text-[#887B60]">
                        {strings.resendIn} {countdown}{strings.seconds}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-xs text-[#956D00] hover:underline"
                      >
                        {strings.resendOtp}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {phoneVerified && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {strings.phoneVerified}
                </div>
              )}

              {/* Email (optional) */}
              <div className="space-y-2">
                <Label htmlFor="email">{strings.email}</Label>
                <div className="relative" dir="ltr">
                  <Mail className="absolute top-1/2 -translate-y-1/2 left-3 h-4 w-4 text-[#887B60] pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={strings.emailPlaceholder}
                    className="pl-10"
                    autoComplete="email"
                    dir="ltr"
                    {...step1Form.register('email')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 2: Office Info ───────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="officeNameAr">{strings.officeNameAr}</Label>
                <div className="relative" dir="rtl">
                  <Building2 className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-[#887B60] pointer-events-none" />
                  <Input
                    id="officeNameAr"
                    placeholder={strings.officeNameArPlaceholder}
                    className="ps-10"
                    dir="rtl"
                    {...step2Form.register('officeNameAr')}
                  />
                </div>
                {step2Form.formState.errors.officeNameAr && (
                  <p className="text-xs text-red-600">
                    {step2Form.formState.errors.officeNameAr.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="officeNameEn">{strings.officeNameEn}</Label>
                <div className="relative" dir="ltr">
                  <Building2 className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-[#887B60] pointer-events-none" />
                  <Input
                    id="officeNameEn"
                    placeholder={strings.officeNameEnPlaceholder}
                    className="ps-10"
                    dir="ltr"
                    onChange={(e) => handleOfficeNameEnChange(e.target.value)}
                    value={step2Form.watch('officeNameEn') || ''}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">{strings.slug}</Label>
                <div className="relative" dir="ltr">
                  <Globe className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-[#887B60] pointer-events-none" />
                  <Input
                    id="slug"
                    placeholder={strings.slugPlaceholder}
                    className="ps-10"
                    dir="ltr"
                    {...step2Form.register('slug')}
                  />
                </div>
                <p className="text-xs text-[#7A6C4F]">
                  {strings.slugHelp}
                  <span className="font-mono text-[#956D00]">
                    {step2Form.watch('slug') || '...'}
                  </span>
                </p>
                {step2Form.formState.errors.slug && (
                  <p className="text-xs text-red-600">
                    {step2Form.formState.errors.slug.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="falLicenseNo">{strings.falLicense}</Label>
                <div className="relative" dir="ltr">
                  <FileText className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-[#887B60] pointer-events-none" />
                  <Input
                    id="falLicenseNo"
                    placeholder={strings.falLicensePlaceholder}
                    className="ps-10"
                    dir="ltr"
                    {...step2Form.register('falLicenseNo')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="officePhone">{strings.officePhone}</Label>
                  <div className="relative" dir="ltr">
                    <Phone className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-[#887B60] pointer-events-none" />
                    <Input
                      id="officePhone"
                      placeholder={strings.officePhonePlaceholder}
                      className="ps-10"
                      dir="ltr"
                      {...step2Form.register('officePhone')}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">{strings.whatsapp}</Label>
                  <div className="relative" dir="ltr">
                    <Phone className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-[#887B60] pointer-events-none" />
                    <Input
                      id="whatsapp"
                      placeholder={strings.whatsappPlaceholder}
                      className="ps-10"
                      dir="ltr"
                      {...step2Form.register('whatsapp')}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="officeEmail">{strings.officeEmail}</Label>
                <div className="relative" dir="ltr">
                  <Mail className="absolute top-1/2 -translate-y-1/2 left-3 h-4 w-4 text-[#887B60] pointer-events-none" />
                  <Input
                    id="officeEmail"
                    type="email"
                    placeholder={strings.officeEmailPlaceholder}
                    className="pl-10"
                    dir="ltr"
                    {...step2Form.register('officeEmail')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 3: Logo Upload ───────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-[#3B2F08]">
                  {strings.uploadLogo}
                </h3>
              </div>

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all ${
                  isDragging
                    ? 'border-[#956D00] bg-[#F7F1E0]'
                    : 'border-[#E5DCC6] bg-[#F7F1E0] hover:border-[#956D00]/40 hover:bg-[#F7F1E0]/50'
                }`}
              >
                {logoPreview ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative h-32 w-32 overflow-hidden rounded-xl border-2 border-[#956D00]/30 shadow-sm">
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm text-[#7A6C4F]">{logoFile?.name}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setLogoFile(null)
                        setLogoPreview(null)
                      }}
                    >
                      {locale === 'ar' ? 'تغيير' : 'Change'}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#F7F1E0]">
                      <Upload className="h-6 w-6 text-[#7A6C4F]" />
                    </div>
                    <p className="text-sm font-medium text-[#2E2506]">
                      {strings.dragDrop}
                    </p>
                    <p className="mt-1 text-xs text-[#7A6C4F]">
                      {strings.orClickUpload}
                    </p>
                    <p className="mt-2 text-xs text-[#887B60]">
                      {strings.maxSize} &middot; {strings.formats}
                    </p>
                  </>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                  }}
                />
              </div>

              <button
                type="button"
                onClick={goNext}
                className="w-full text-center text-sm text-[#7A6C4F] hover:text-[#956D00] hover:underline"
              >
                {strings.skipLogo}
              </button>
            </div>
          )}

          {/* ─── Navigation Buttons ────────────────────────── */}
          <div className="mt-8 flex items-center gap-3">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={goPrev}
                type="button"
                className="flex-1"
              >
                {isRtl ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
                {strings.previous}
              </Button>
            )}

            {step < TOTAL_STEPS ? (
              <Button onClick={goNext} type="button" className="flex-1">
                {strings.next}
                {isRtl ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <Button
                onClick={handleFinalSubmit}
                type="button"
                className="flex-1"
                size="lg"
                isLoading={isSubmitting}
              >
                {isSubmitting ? strings.creating : strings.createAccount}
              </Button>
            )}
          </div>

          {/* Divider */}
          <div className="my-8 border-t border-[#E5DCC6]" />

          {/* Sign In Link */}
          <p className="text-center text-sm text-[#7A6C4F]">
            {strings.haveAccount}
            {' '}
            <Link
              href="/auth/signin"
              className="font-semibold text-[#956D00] hover:text-[#7A5A00] hover:underline me-1"
            >
              {strings.signIn}
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="mt-6 text-center text-xs text-[#887B60]">
        FALZ Platform &copy; {new Date().getFullYear()}
      </p>
    </div>
  )
}
