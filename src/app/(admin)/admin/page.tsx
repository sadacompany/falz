import {
  Building2,
  Users,
  Home,
  MessageSquare,
  TrendingUp,
  DollarSign,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAdminStats } from '@/lib/actions/admin'

const planNameMap: Record<string, string> = {
  Basic: 'أساسي',
  Pro: 'احترافي',
  Enterprise: 'مؤسسي',
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-heading">لوحة تحكم المنصة</h1>
        <p className="mt-1 text-sm text-dim">
          نظرة عامة على المنصة والإحصائيات.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Building2 className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-dim">إجمالي المكاتب</p>
                <p className="text-2xl font-bold text-heading">{stats.totalOffices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-dim">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold text-heading">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <Home className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-dim">إجمالي العقارات</p>
                <p className="text-2xl font-bold text-heading">{stats.totalProperties}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <MessageSquare className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-dim">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-heading">{stats.totalLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue + Subscriptions Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              توزيع الاشتراكات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.subscriptionDistribution.map((item) => {
                const total = stats.subscriptionDistribution.reduce(
                  (acc, i) => acc + i.count,
                  0
                )
                const percentage = total > 0 ? (item.count / total) * 100 : 0

                return (
                  <div key={item.plan} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-heading">
                          {planNameMap[item.plan] || item.plan}
                        </span>
                        <Badge variant="secondary">{item.count}</Badge>
                      </div>
                      <span className="text-sm text-dim">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-alt">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.plan === 'Enterprise'
                            ? 'bg-primary'
                            : item.plan === 'Pro'
                              ? 'bg-blue-500'
                              : 'bg-dim'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}

              {stats.subscriptionDistribution.length === 0 && (
                <p className="py-8 text-center text-sm text-dim">
                  لا توجد اشتراكات بعد
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-primary" />
              إحصائيات الإيرادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-edge bg-page p-4">
                <p className="text-sm text-dim">إجمالي الإيرادات</p>
                <p className="mt-1 text-xl font-bold text-primary">
                  {(stats.totalRevenue / 100).toLocaleString('ar-SA-u-nu-latn', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  ر.س
                </p>
              </div>
              <div className="rounded-lg border border-edge bg-page p-4">
                <p className="text-sm text-dim">هذا الشهر</p>
                <p className="mt-1 text-xl font-bold text-emerald-400">
                  {(stats.monthlyRevenue / 100).toLocaleString('ar-SA-u-nu-latn', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  ر.س
                </p>
              </div>
              <div className="rounded-lg border border-edge bg-page p-4">
                <p className="text-sm text-dim">الفواتير المدفوعة</p>
                <p className="mt-1 text-xl font-bold text-heading">
                  {stats.paidInvoices}
                </p>
              </div>
              <div className="rounded-lg border border-edge bg-page p-4">
                <p className="text-sm text-dim">الفواتير المعلقة</p>
                <p className="mt-1 text-xl font-bold text-amber-400">
                  {stats.pendingInvoices}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Signups */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">التسجيلات الأخيرة</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentSignups.length === 0 ? (
            <p className="py-8 text-center text-sm text-dim">
              لا توجد تسجيلات حديثة
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-edge">
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-dim">
                      المكتب
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-dim">
                      المالك
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-dim">
                      الحالة
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-dim">
                      التاريخ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-edge">
                  {stats.recentSignups.map((signup) => (
                    <tr key={signup.id} className="transition-colors hover:bg-card-hover/30">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-heading">
                            {signup.name}
                          </p>
                          <p className="text-xs text-dim">{signup.slug}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-dim">
                        {signup.ownerEmail || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={signup.isApproved ? 'success' : 'warning'}
                        >
                          {signup.isApproved ? 'معتمد' : 'معلق'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-dim">
                        {new Date(signup.createdAt).toLocaleDateString('ar-SA-u-nu-latn', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
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
