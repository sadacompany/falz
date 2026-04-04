'use client'

import dynamic from 'next/dynamic'

const AnalyticsClient = dynamic(
  () => import('@/components/dashboard/AnalyticsClient'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#956D00] border-t-transparent" />
      </div>
    ),
  }
)

export default function AnalyticsPage() {
  return <AnalyticsClient />
}
