'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-bold text-[#2D3748]">حدث خطأ غير متوقع</h2>
      <p className="text-sm text-[#718096]">يرجى المحاولة مرة أخرى أو تسجيل الدخول</p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline">
          إعادة المحاولة
        </Button>
        <Button onClick={() => (window.location.href = '/auth/signin')}>
          تسجيل الدخول
        </Button>
      </div>
    </div>
  )
}
