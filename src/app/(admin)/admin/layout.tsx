import { getCurrentUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/admin/AdminShell'

export const metadata = {
  title: 'FALZ - Admin Panel',
  description: 'FALZ Platform Administration',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin')
  }

  if (!user.isSuperAdmin) {
    redirect('/dashboard')
  }

  return (
    <AdminShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
      }}
    >
      {children}
    </AdminShell>
  )
}
