'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

const errorMessages: Record<string, { ar: string; en: string }> = {
  Configuration: {
    ar: 'خطأ في إعداد المصادقة. يرجى المحاولة مرة أخرى.',
    en: 'Authentication configuration error. Please try again.',
  },
  AccessDenied: {
    ar: 'تم رفض الوصول. ليس لديك صلاحية.',
    en: 'Access denied. You do not have permission.',
  },
  Verification: {
    ar: 'رابط التحقق منتهي أو تم استخدامه.',
    en: 'The verification link has expired or been used.',
  },
  Default: {
    ar: 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.',
    en: 'An error occurred during sign in. Please try again.',
  },
}

function ErrorContent() {
  const searchParams = useSearchParams()
  const errorType = searchParams.get('error') || 'Default'
  const messages = errorMessages[errorType] || errorMessages.Default

  return (
    <div dir="rtl">
      <Card className="border-edge bg-elevated shadow-lg rounded-2xl">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center">
            <Logo size="md" variant="light" />
            <div className="mt-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
              <AlertTriangle className="h-7 w-7 text-red-500" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-heading">
              خطأ في المصادقة
            </h1>
            <p className="mt-2 text-sm text-body">{messages.ar}</p>
            <div className="mt-6 flex gap-3 w-full">
              <Link href="/auth/signin" className="flex-1">
                <Button className="w-full">تسجيل الدخول</Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">الرئيسية</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <Card className="border-edge bg-elevated shadow-lg rounded-2xl">
          <CardContent className="p-8 text-center text-body">
            جاري التحميل...
          </CardContent>
        </Card>
      }
    >
      <ErrorContent />
    </Suspense>
  )
}
