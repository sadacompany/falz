import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-utils'

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin')
  }

  if (!user.memberships || user.memberships.length === 0) {
    redirect('/auth/signup')
  }

  return <>{children}</>
}
