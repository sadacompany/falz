'use client'

import { useState, useEffect } from 'react'
import {
  Eye,
  Users,
  MessageSquare,
  Phone,
  Target,
  Heart,
  UserCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { getAnalyticsData, getVisitorMetrics } from '@/lib/actions/analytics'
import { cn } from '@/lib/utils'

const COLORS = ['#956D00', '#3B82F6', '#10B981', '#F59E0B', '#EF4444']

const RANGE_OPTIONS = [
  { label: 'آخر 7 أيام', value: 7 },
  { label: 'آخر 30 يوم', value: 30 },
  { label: 'آخر 90 يوم', value: 90 },
]

const REQUEST_TYPE_LABELS: Record<string, string> = {
  INTEREST: 'اهتمام',
  VIEWING: 'معاينة',
  INFO: 'معلومات',
}

const SOURCE_LABELS: Record<string, string> = {
  direct: 'مباشر',
  social: 'تواصل اجتماعي',
  search: 'محركات البحث',
  referral: 'إحالة',
  Direct: 'مباشر',
  Social: 'تواصل اجتماعي',
  Search: 'محركات البحث',
  Referral: 'إحالة',
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[#E5DCC6] bg-white px-3 py-2 text-sm shadow-xl">
      <p className="text-[#7A6C4F]">{label}</p>
      <p className="font-semibold text-[#956D00]">{payload[0].value}</p>
    </div>
  )
}

export default function AnalyticsClient() {
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Awaited<ReturnType<typeof getAnalyticsData>> | null>(null)
  const [visitorData, setVisitorData] = useState<Awaited<ReturnType<typeof getVisitorMetrics>> | null>(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getAnalyticsData(days),
      getVisitorMetrics(),
    ])
      .then(([analyticsResult, visitorResult]) => {
        setData(analyticsResult)
        setVisitorData(visitorResult)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [days])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#956D00] border-t-transparent" />
      </div>
    )
  }

  const safeData = data || {
    totalVisits: 0,
    totalLeads: 0,
    whatsappClicks: 0,
    phoneClicks: 0,
    conversionRate: '0.0',
    visitsByDate: [],
    leadsByDate: [],
    trafficSourceData: [],
    topProperties: [],
    cityDistribution: [],
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2E2506]">التحليلات</h1>
          <p className="mt-1 text-sm text-[#7A6C4F]">تتبع أداء موقعك ومعلومات الزوار</p>
        </div>
        <div className="flex gap-2">
          {/* Date Range Picker */}
          <div className="flex rounded-lg border border-[#E5DCC6] bg-white p-1">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  days === opt.value
                    ? 'bg-[#956D00] text-[#3B2F08]'
                    : 'text-[#7A6C4F] hover:text-[#3B2F08]'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'إجمالي الزيارات', value: safeData.totalVisits, icon: Eye },
          { label: 'إجمالي العملاء', value: safeData.totalLeads, icon: Users },
          { label: 'نقرات واتساب', value: safeData.whatsappClicks, icon: MessageSquare },
          { label: 'نقرات الهاتف', value: safeData.phoneClicks, icon: Phone },
          { label: 'معدل التحويل', value: `${safeData.conversionRate}%`, icon: Target },
        ].map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#7A6C4F]">{metric.label}</p>
                    <p className="mt-1 text-2xl font-bold text-[#2E2506]">{metric.value}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#956D00]/10">
                    <Icon className="h-5 w-5 text-[#956D00]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Visits Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">الزيارات عبر الوقت</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {safeData.visitsByDate.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={safeData.visitsByDate}>
                    <defs>
                      <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#956D00" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#956D00" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5DCC6" vertical={false} />
                    <XAxis dataKey="date" stroke="#7A6C4F" fontSize={11} tickFormatter={(v) => { const d = new Date(v); return d.toLocaleDateString('ar-SA-u-nu-latn', { month: 'numeric', day: 'numeric' }) }} interval="preserveStartEnd" />
                    <YAxis stroke="#7A6C4F" fontSize={11} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="count" stroke="#956D00" fill="url(#visitGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#7A6C4F]">لا توجد بيانات</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Leads Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">العملاء عبر الوقت</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {safeData.leadsByDate.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={safeData.leadsByDate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5DCC6" vertical={false} />
                    <XAxis dataKey="date" stroke="#7A6C4F" fontSize={11} tickFormatter={(v) => { const d = new Date(v); return d.toLocaleDateString('ar-SA-u-nu-latn', { month: 'numeric', day: 'numeric' }) }} interval="preserveStartEnd" />
                    <YAxis stroke="#7A6C4F" fontSize={11} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" fill="#956D00" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#7A6C4F]">لا توجد بيانات</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">مصادر الزيارات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {safeData.trafficSourceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={safeData.trafficSourceData}
                      dataKey="count"
                      nameKey="source"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={((props: any) =>
                        `${SOURCE_LABELS[props.source] || props.source || ''} (${((props.percent as number) * 100).toFixed(0)}%)`
                      ) as any}
                      labelLine={false}
                    >
                      {safeData.trafficSourceData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#7A6C4F]">لا توجد بيانات</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Properties */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">أفضل العقارات</CardTitle>
          </CardHeader>
          <CardContent>
            {safeData.topProperties.length > 0 ? (
              <div className="space-y-3">
                {safeData.topProperties.map((prop, idx) => (
                  <div key={prop.propertyId || idx} className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#2E2506]">
                        {prop.titleAr || prop.title || 'بدون عنوان'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-[#956D00]">
                      <Eye className="h-3.5 w-3.5" />
                      {prop.views} مشاهدات
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-[#7A6C4F]">لا توجد بيانات</div>
            )}
          </CardContent>
        </Card>

        {/* City Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">مدن الزوار</CardTitle>
          </CardHeader>
          <CardContent>
            {safeData.cityDistribution.length > 0 ? (
              <div className="space-y-3">
                {safeData.cityDistribution.map((city, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-[#2E2506]">{city.city}</span>
                    <span className="text-sm text-[#7A6C4F]">{city.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-[#7A6C4F]">لا توجد بيانات</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Visitor Metrics Section ─────────────────────────── */}
      {visitorData && (
        <>
          <div>
            <h2 className="text-xl font-bold text-[#2E2506]">مقاييس الزوار</h2>
            <p className="mt-1 text-sm text-[#7A6C4F]">إحصائيات الزوار المسجلين والتفاعل</p>
          </div>

          {/* Visitor Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'الزوار المسجلين', value: visitorData.totalVisitors, icon: Users, color: '#956D00' },
              { label: 'نشطين (30 يوم)', value: visitorData.activeVisitors, icon: UserCheck, color: '#10B981' },
              { label: 'المفضلات', value: visitorData.totalFavorites, icon: Heart, color: '#EF4444' },
              { label: 'الطلبات', value: visitorData.totalRequests, icon: MessageSquare, color: '#3B82F6' },
            ].map((metric) => {
              const Icon = metric.icon
              return (
                <Card key={metric.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#7A6C4F]">{metric.label}</p>
                        <p className="mt-1 text-2xl font-bold text-[#2E2506]">{metric.value}</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${metric.color}15` }}>
                        <Icon className="h-5 w-5" style={{ color: metric.color }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Requests by Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">الطلبات حسب النوع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {visitorData.requestsByType.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={visitorData.requestsByType.map((r) => ({
                            ...r,
                            name: REQUEST_TYPE_LABELS[r.type] || r.type,
                          }))}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={((props: any) =>
                            `${props.name} (${props.count})`
                          ) as any}
                          labelLine={false}
                        >
                          {visitorData.requestsByType.map((_, idx) => (
                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[#7A6C4F]">لا توجد بيانات</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Favorited Properties */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">أكثر العقارات تفضيلاً</CardTitle>
              </CardHeader>
              <CardContent>
                {visitorData.topFavoritedProperties.length > 0 ? (
                  <div className="space-y-3">
                    {visitorData.topFavoritedProperties.map((prop, idx) => (
                      <div key={prop.propertyId || idx} className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#2E2506]">
                            {prop.titleAr || prop.title || 'بدون عنوان'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-red-400">
                          <Heart className="h-3.5 w-3.5" />
                          {prop.favorites}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-48 items-center justify-center text-sm text-[#7A6C4F]">لا توجد بيانات</div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
