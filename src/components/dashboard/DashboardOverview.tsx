'use client'

import Link from 'next/link'
import {
  Building2,
  Users,
  Eye,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Plus,
  ExternalLink,
  Target,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// ─── Types ──────────────────────────────────────────────────

interface DashboardOverviewProps {
  userName: string
  stats: {
    totalProperties: number
    totalLeads: number
    leadsChange: number
    totalViews: number
    viewsChange: number
    conversionRate: number
    recentLeads: Array<{
      id: string
      name: string
      status: string
      source: string
      createdAt: Date
      property: { id: string; title: string; titleAr: string | null } | null
      agent: { id: string; name: string } | null
    }>
    topProperties: Array<{
      propertyId: string | null
      views: number
      title: string
      titleAr: string
      slug: string
      thumbnail: string | null
    }>
  } | null
  leadsOverTime: Array<{ date: string; count: number }> | null
  viewsByType: Array<{ type: string; count: number }> | null
  officeSlug: string
}

// ─── Status Labels ──────────────────────────────────────────

const statusLabels: Record<string, string> = {
  NEW: 'جديد',
  CONTACTED: 'تم التواصل',
  QUALIFIED: 'مؤهل',
  CLOSED: 'مغلق',
}

// ─── Metric Card ────────────────────────────────────────────

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  suffix,
}: {
  title: string
  value: number | string
  change?: number
  icon: React.ElementType
  suffix?: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-body">{title}</p>
            <p className="text-3xl font-bold text-heading">
              {value}
              {suffix && (
                <span className="ms-1 text-lg font-normal text-dim">
                  {suffix}
                </span>
              )}
            </p>
            {change !== undefined && (
              <div className="flex items-center gap-1">
                {change >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                )}
                <span
                  className={`text-xs font-medium ${
                    change >= 0 ? 'text-emerald-500' : 'text-red-500'
                  }`}
                >
                  {change >= 0 ? '+' : ''}
                  {change}%
                </span>
                <span className="text-xs text-dim">مقارنة بالشهر الماضي</span>
              </div>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card-hover">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Custom Tooltip ─────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-edge bg-elevated px-3 py-2 text-sm shadow-lg">
      <p className="text-body">{label}</p>
      <p className="font-semibold text-primary">{payload[0].value}</p>
    </div>
  )
}

// ─── Status Badge ───────────────────────────────────────────

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning'> = {
  NEW: 'default',
  CONTACTED: 'warning',
  QUALIFIED: 'success',
  CLOSED: 'secondary',
}

// ─── Component ──────────────────────────────────────────────

export function DashboardOverview({
  userName,
  stats,
  leadsOverTime,
  viewsByType,
  officeSlug,
}: DashboardOverviewProps) {
  const safeStats = stats || {
    totalProperties: 0,
    totalLeads: 0,
    leadsChange: 0,
    totalViews: 0,
    viewsChange: 0,
    conversionRate: 0,
    recentLeads: [],
    topProperties: [],
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">
            مرحبا بعودتك، {userName}
          </h1>
          <p className="mt-1 text-sm text-body">
            إليك ما يحدث مع عقاراتك اليوم.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/properties/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              إضافة عقار
            </Button>
          </Link>
          <Link href={`/${officeSlug}`} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
              عرض الموقع
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="إجمالي العقارات"
          value={safeStats.totalProperties}
          icon={Building2}
        />
        <MetricCard
          title="إجمالي العملاء"
          value={safeStats.totalLeads}
          change={safeStats.leadsChange}
          icon={Users}
        />
        <MetricCard
          title="إجمالي الزيارات"
          value={safeStats.totalViews}
          change={safeStats.viewsChange}
          icon={Eye}
        />
        <MetricCard
          title="معدل التحويل"
          value={safeStats.conversionRate}
          suffix="%"
          icon={Target}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Leads Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">العملاء عبر الوقت</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {leadsOverTime && leadsOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={leadsOverTime}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--edge-clr, #E5DCC6)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="var(--dim-clr, #887B60)"
                      fontSize={11}
                      tickFormatter={(value) => {
                        const d = new Date(value)
                        return d.toLocaleDateString('ar-SA-u-nu-latn', { month: 'numeric', day: 'numeric' })
                      }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      stroke="var(--dim-clr, #887B60)"
                      fontSize={11}
                      allowDecimals={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="var(--color-primary, #D4AF37)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: 'var(--color-primary, #D4AF37)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-dim">
                  لا توجد بيانات بعد
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Views by Property Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">المشاهدات حسب نوع العقار</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {viewsByType && viewsByType.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={viewsByType}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--edge-clr, #E5DCC6)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="type"
                      stroke="var(--dim-clr, #887B60)"
                      fontSize={11}
                    />
                    <YAxis
                      stroke="var(--dim-clr, #887B60)"
                      fontSize={11}
                      allowDecimals={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar
                      dataKey="count"
                      fill="var(--color-primary, #D4AF37)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-dim">
                  لا توجد بيانات بعد
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads + Top Properties */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">آخر العملاء المحتملين</CardTitle>
            <Link
              href="/dashboard/leads"
              className="text-xs text-primary hover:underline"
            >
              عرض الكل
            </Link>
          </CardHeader>
          <CardContent>
            {safeStats.recentLeads.length > 0 ? (
              <div className="space-y-3">
                {safeStats.recentLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/dashboard/leads/${lead.id}`}
                    className="flex items-center justify-between rounded-lg border border-edge bg-elevated p-3 transition-colors hover:border-primary/40 hover:bg-card-hover"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-heading">
                        {lead.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-dim">
                        {lead.property?.titleAr || lead.property?.title || 'بدون عقار'}
                        {lead.agent && ` - ${lead.agent.name}`}
                      </p>
                    </div>
                    <div className="ms-3 flex items-center gap-2">
                      <Badge variant={statusColors[lead.status] || 'secondary'}>
                        {statusLabels[lead.status] || lead.status}
                      </Badge>
                      <ArrowUpRight className="h-4 w-4 text-dim" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-dim">
                لا يوجد عملاء بعد
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Properties */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">أفضل العقارات حسب المشاهدات</CardTitle>
            <Link
              href="/dashboard/properties"
              className="text-xs text-primary hover:underline"
            >
              عرض الكل
            </Link>
          </CardHeader>
          <CardContent>
            {safeStats.topProperties.length > 0 ? (
              <div className="space-y-3">
                {safeStats.topProperties.map((prop, idx) => (
                  <div
                    key={prop.propertyId || idx}
                    className="flex items-center gap-3 rounded-lg border border-edge bg-elevated p-3"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-card-hover text-sm font-bold text-heading">
                      #{idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-heading">
                        {prop.titleAr || prop.title || 'بدون عنوان'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-body">
                      <Eye className="h-3.5 w-3.5" />
                      {prop.views} مشاهدة
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-dim">
                لا توجد مشاهدات للعقارات بعد
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
