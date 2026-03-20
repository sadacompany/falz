'use client'

import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import {
  Building2,
  Users,
  Home,
  CreditCard,
  ArrowLeft,
  Shield,
  Loader2,
  AlertTriangle,
  UserCog,
  ExternalLink,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// ─── Types ────────────────────────────────────────────────────

interface OfficeDetail {
  id: string
  name: string
  nameAr: string | null
  slug: string
  logo: string | null
  email: string | null
  phone: string | null
  city: string | null
  falLicenseNo: string | null
  isApproved: boolean
  isActive: boolean
  createdAt: string
  subscription: {
    planName: string
    planSlug: string
    status: string
    currentPeriodEnd: string | null
  } | null
  users: {
    id: string
    name: string
    email: string
    role: string
    isActive: boolean
    lastLoginAt: string | null
  }[]
  propertiesCount: number
  leadsCount: number
}

const roleNameMap: Record<string, string> = {
  OWNER: 'مالك',
  MANAGER: 'مدير',
  AGENT: 'وكيل',
  VIEWER: 'مشاهد',
}

const planNameMap: Record<string, string> = {
  Basic: 'أساسي',
  Pro: 'احترافي',
  Enterprise: 'مؤسسي',
}

const subscriptionStatusMap: Record<string, string> = {
  ACTIVE: 'نشط',
  PAST_DUE: 'متأخر',
  CANCELLED: 'ملغي',
  TRIALING: 'تجريبي',
}

// ─── Component ────────────────────────────────────────────────

export default function AdminOfficeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [office, setOffice] = useState<OfficeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchOffice = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/offices/${id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setOffice(data.data)
        }
      }
    } catch {
      setError('فشل في تحميل تفاصيل المكتب')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchOffice()
  }, [fetchOffice])

  const handleToggleApproval = async () => {
    if (!office) return
    setActionLoading('toggle')

    try {
      const res = await fetch(`/api/admin/offices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: office.isApproved ? 'disable' : 'approve',
        }),
      })

      if (res.ok) {
        setOffice((prev) =>
          prev
            ? {
                ...prev,
                isApproved: !prev.isApproved,
                isActive: !prev.isApproved ? true : false,
              }
            : prev
        )
      }
    } catch {
      setError('فشل في تحديث حالة المكتب')
    } finally {
      setActionLoading(null)
    }
  }

  const handleImpersonate = async () => {
    setActionLoading('impersonate')

    try {
      const res = await fetch(`/api/admin/offices/${id}/impersonate`, {
        method: 'POST',
      })

      if (res.ok) {
        // Redirect to the office dashboard
        window.location.href = '/dashboard'
      } else {
        setError('فشل في الدخول كمكتب')
      }
    } catch {
      setError('فشل في الدخول كمكتب')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C8A96E]" />
      </div>
    )
  }

  if (!office) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-10 w-10 text-red-400" />
        <p className="text-sm text-[#718096]">المكتب غير موجود</p>
        <Link href="/admin/offices">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
            العودة للمكاتب
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button + Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/offices">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#2D3748]">{office.name}</h1>
          <p className="text-sm text-[#718096]">{office.slug}.falz.sa</p>
        </div>
        <Badge
          variant={
            office.isApproved && office.isActive
              ? 'success'
              : !office.isApproved
                ? 'warning'
                : 'destructive'
          }
        >
          {office.isApproved && office.isActive
            ? 'معتمد'
            : !office.isApproved
              ? 'معلق'
              : 'معطل'}
        </Badge>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-600/50 bg-red-600/10 px-4 py-3 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Office Info + Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Office Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#C8A96E]" />
              معلومات المكتب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase text-[#718096]">الاسم</p>
                <p className="mt-1 text-sm text-[#2D3748]">{office.name}</p>
              </div>
              {office.nameAr && (
                <div>
                  <p className="text-xs font-medium uppercase text-[#718096]">الاسم (عربي)</p>
                  <p className="mt-1 text-sm text-[#2D3748]" dir="rtl">
                    {office.nameAr}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium uppercase text-[#718096]">البريد</p>
                <p className="mt-1 text-sm text-[#2D3748]">{office.email || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-[#718096]">الهاتف</p>
                <p className="mt-1 text-sm text-[#2D3748]">{office.phone || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-[#718096]">المدينة</p>
                <p className="mt-1 text-sm text-[#2D3748]">{office.city || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-[#718096]">رخصة فال</p>
                <p className="mt-1 text-sm text-[#2D3748]">
                  {office.falLicenseNo || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-[#718096]">تاريخ الإنشاء</p>
                <p className="mt-1 text-sm text-[#2D3748]">
                  {new Date(office.createdAt).toLocaleDateString('ar-SA-u-nu-latn', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">الإجراءات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant={office.isApproved ? 'destructive' : 'default'}
              className="w-full"
              onClick={handleToggleApproval}
              isLoading={actionLoading === 'toggle'}
            >
              <Shield className="h-4 w-4" />
              {office.isApproved ? 'تعطيل المكتب' : 'اعتماد المكتب'}
            </Button>

            <Button
              variant="secondary"
              className="w-full"
              onClick={handleImpersonate}
              isLoading={actionLoading === 'impersonate'}
            >
              <UserCog className="h-4 w-4" />
              الدخول كمكتب
            </Button>

            <Link href={`/${office.slug}`} target="_blank" className="block">
              <Button variant="outline" className="w-full">
                <ExternalLink className="h-4 w-4" />
                عرض الموقع العام
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                <Home className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-[#718096]">العقارات</p>
                <p className="text-xl font-bold text-[#2D3748]">{office.propertiesCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10">
                <Users className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-[#718096]">المستخدمين</p>
                <p className="text-xl font-bold text-[#2D3748]">{office.users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                <CreditCard className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-[#718096]">الخطة</p>
                <p className="text-xl font-bold text-[#C8A96E]">
                  {planNameMap[office.subscription?.planName || 'Basic'] || office.subscription?.planName || 'أساسي'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Info */}
      {office.subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-[#C8A96E]" />
              تفاصيل الاشتراك
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase text-[#718096]">الخطة</p>
                <p className="mt-1 text-sm text-[#2D3748]">
                  {planNameMap[office.subscription.planName] || office.subscription.planName}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-[#718096]">الحالة</p>
                <div className="mt-1">
                  <Badge
                    variant={
                      office.subscription.status === 'ACTIVE'
                        ? 'success'
                        : office.subscription.status === 'PAST_DUE'
                          ? 'destructive'
                          : 'warning'
                    }
                  >
                    {subscriptionStatusMap[office.subscription.status] || office.subscription.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-[#718096]">نهاية الفترة</p>
                <p className="mt-1 text-sm text-[#2D3748]">
                  {office.subscription.currentPeriodEnd
                    ? new Date(office.subscription.currentPeriodEnd).toLocaleDateString(
                        'ar-SA-u-nu-latn',
                        { month: 'long', day: 'numeric', year: 'numeric' }
                      )
                    : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-[#C8A96E]" />
            أعضاء الفريق
          </CardTitle>
          <CardDescription>المستخدمون المرتبطون بهذا المكتب</CardDescription>
        </CardHeader>
        <CardContent>
          {office.users.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#718096]">
              لا يوجد مستخدمين
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#718096]">
                      الاسم
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#718096]">
                      البريد
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#718096]">
                      الدور
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#718096]">
                      الحالة
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#718096]">
                      آخر دخول
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {office.users.map((u) => (
                    <tr
                      key={u.id}
                      className="transition-colors hover:bg-[#F7F7F2]/30"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-[#2D3748]">
                        {u.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#718096]">{u.email}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            u.role === 'OWNER'
                              ? 'default'
                              : u.role === 'MANAGER'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {roleNameMap[u.role] || u.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={u.isActive ? 'success' : 'destructive'}>
                          {u.isActive ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#718096]">
                        {u.lastLoginAt
                          ? new Date(u.lastLoginAt).toLocaleDateString('ar-SA-u-nu-latn', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'لم يسجل دخول'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
