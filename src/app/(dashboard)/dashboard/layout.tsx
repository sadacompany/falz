import { getCurrentUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

export const metadata = {
  title: 'FALZ - Dashboard',
  description: 'FALZ Real Estate Dashboard',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin')
  }

  const membership = user.memberships[0]
  if (!membership) {
    redirect('/auth/signup')
  }

  return (
    <DashboardShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin,
      }}
      office={{
        id: membership.office.id,
        name: membership.office.name,
        nameAr: membership.office.nameAr,
        slug: membership.office.slug,
        logo: membership.office.logo,
      }}
      role={membership.role}
    >
      {children}
    </DashboardShell>
  )
}
