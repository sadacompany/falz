import { getCurrentUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
import { getDashboardStats, getLeadsOverTime, getViewsByPropertyType } from '@/lib/actions/analytics'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')

  let stats = null
  let leadsOverTime = null
  let viewsByType = null

  try {
    ;[stats, leadsOverTime, viewsByType] = await Promise.all([
      getDashboardStats(),
      getLeadsOverTime(30),
      getViewsByPropertyType(),
    ])
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }

  return (
    <DashboardOverview
      userName={user.name}
      stats={stats}
      leadsOverTime={leadsOverTime}
      viewsByType={viewsByType}
      officeSlug={user.memberships[0]?.office.slug || ''}
    />
  )
}
