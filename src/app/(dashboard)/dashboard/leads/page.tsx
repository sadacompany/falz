'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Search,
  Download,
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Phone,
  Mail,
  UserCheck,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getLeads, getLeadStats, type LeadFilters } from '@/lib/actions/leads'
import { LeadsHeader } from '@/components/leads/LeadsHeader'

// ─── Constants ──────────────────────────────────────────────

const STATUS_TABS = [
  { key: '', label: 'الكل' },
  { key: 'NEW', label: 'جديد' },
  { key: 'CONTACTED', label: 'تم التواصل' },
  { key: 'QUALIFIED', label: 'مؤهل' },
  { key: 'CLOSED', label: 'مغلق' },
]

const statusVariant: Record<string, 'default' | 'secondary' | 'success' | 'warning'> = {
  NEW: 'default',
  CONTACTED: 'warning',
  QUALIFIED: 'success',
  CLOSED: 'secondary',
}

const statusLabel: Record<string, string> = {
  NEW: 'جديد',
  CONTACTED: 'تم التواصل',
  QUALIFIED: 'مؤهل',
  CLOSED: 'مغلق',
}

const sourceLabel: Record<string, string> = {
  CONTACT_FORM: 'نموذج التواصل',
  PROPERTY_INQUIRY: 'استفسار عقاري',
  WHATSAPP_CLICK: 'واتساب',
  PHONE_CLICK: 'هاتف',
  MANUAL: 'يدوي',
}

// ─── Helper to map propertyType to Arabic category ──────────
function getCategoryLabel(propertyType: string | null | undefined): { label: string; variant: 'default' | 'success' | 'warning' | 'outline' } {
  if (!propertyType) return { label: 'عام', variant: 'outline' }
  const type = propertyType.toUpperCase()
  
  if (['APARTMENT', 'VILLA', 'COMPOUND'].includes(type)) {
    return { label: 'سكني', variant: 'default' } // Blue-ish
  }
  if (['OFFICE', 'COMMERCIAL', 'BUILDING'].includes(type)) {
    return { label: 'تجاري', variant: 'warning' } // Amber-ish
  }
  if (['LAND', 'FARM'].includes(type)) {
    return { label: 'زراعي', variant: 'success' } // Emerald-ish
  }
  return { label: 'عام', variant: 'outline' }
}

export default function LeadsPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Awaited<ReturnType<typeof getLeads>> | null>(null)
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getLeadStats>> | null>(null)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const filters: LeadFilters = {
        page,
        pageSize: 15,
        ...(statusFilter && { status: statusFilter as LeadFilters['status'] }),
        ...(sourceFilter && { source: sourceFilter as LeadFilters['source'] }),
        ...(search && { search }),
      }
      const [leadsData, statsData] = await Promise.all([
        getLeads(filters),
        getLeadStats(),
      ])
      setData(leadsData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, sourceFilter, search])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handleExportCSV = () => {
    if (!data) return
    const headers = ['الاسم', 'الهاتف', 'البريد الإلكتروني', 'المصدر', 'الحالة', 'العقار', 'النوع', 'الوكيل', 'التاريخ']
    const rows = data.leads.map((l) => [
      l.name,
      l.phone || '',
      l.email || '',
      l.source,
      l.status,
      l.property?.title || '',
      getCategoryLabel(l.property?.propertyType).label,
      l.agent?.name || '',
      new Date(l.createdAt).toLocaleDateString('ar-SA-u-nu-latn'),
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'leads.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const leads = data?.leads || []
  const pagination = data?.pagination || { page: 1, pageSize: 15, total: 0, totalPages: 0 }

  return (
    <div className="space-y-6">
      {/* Shared Header Navigation */}
      <LeadsHeader
        title="إدارة العملاء"
        description="تتبع وإدارة العملاء المحتملين وتوزيعهم على أعضاء الفريق ومتابعة مستوى الأداء."
      >
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="h-4 w-4" />
          تصدير CSV
        </Button>
      </LeadsHeader>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[
            { label: 'إجمالي العملاء', value: stats.total, color: 'text-heading' },
            { label: 'عملاء جدد', value: stats.new, color: 'text-primary' },
            { label: 'تم التواصل', value: stats.contacted, color: 'text-amber-500' },
            { label: 'مؤهلون للمبيعات', value: stats.qualified, color: 'text-emerald-500' },
            { label: 'مغلق / منتهي', value: stats.closed, color: 'text-dim' },
          ].map((s) => (
            <Card key={s.label} className="border-edge bg-elevated transition-all hover:bg-card-hover">
              <CardContent className="flex flex-col justify-between px-6 py-4">
                <p className="text-xs font-medium text-dim">{s.label}</p>
                <p className={cn("mt-2 text-3xl font-bold", s.color)}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters & Actions Bar */}
      <Card className="border-edge bg-elevated">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Status Segmented Tabs */}
            <div className="flex gap-1 overflow-x-auto rounded-lg bg-page p-1 border border-edge max-w-max">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setStatusFilter(tab.key)
                    setPage(1)
                  }}
                  className={cn(
                    'whitespace-nowrap rounded-md px-4 py-2 text-xs font-semibold transition-all duration-200',
                    statusFilter === tab.key
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-body hover:bg-card-hover hover:text-heading'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Source select & search */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-1 sm:max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
                <Input
                  placeholder="البحث بالاسم، الهاتف، البريد..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="ps-10 h-10 bg-page border-edge text-heading"
                />
              </div>
              <select
                value={sourceFilter}
                onChange={(e) => { setSourceFilter(e.target.value); setPage(1) }}
                className="h-10 rounded-lg border border-edge bg-page px-3 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">جميع المصادر</option>
                <option value="CONTACT_FORM">نموذج التواصل</option>
                <option value="PROPERTY_INQUIRY">استفسار عقاري</option>
                <option value="WHATSAPP_CLICK">واتساب</option>
                <option value="PHONE_CLICK">هاتف</option>
                <option value="MANUAL">يدوي</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Redesigned Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : leads.length === 0 ? (
        <Card className="border-edge bg-elevated">
          <CardContent className="py-16 text-center">
            <Users className="mx-auto h-12 w-12 text-dim" />
            <p className="mt-4 text-lg font-medium text-heading">لا يوجد عملاء محتملين</p>
            <p className="mt-1 text-sm text-dim">سيظهر العملاء المحتملين هنا عند استفسارهم عن عقاراتك أو إضافة عميل يدويًا.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-edge bg-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start">
              <thead>
                <tr className="border-b border-edge bg-card/30">
                  <th className="px-6 py-4 text-start text-xs font-semibold text-dim uppercase tracking-wider">العميل والمصدر</th>
                  <th className="px-6 py-4 text-start text-xs font-semibold text-dim uppercase tracking-wider">نوع التصنيف</th>
                  <th className="px-6 py-4 text-start text-xs font-semibold text-dim uppercase tracking-wider">المرحلة</th>
                  <th className="px-6 py-4 text-start text-xs font-semibold text-dim uppercase tracking-wider">الوكيل المسؤول</th>
                  <th className="px-6 py-4 text-start text-xs font-semibold text-dim uppercase tracking-wider">تاريخ التواصل</th>
                  <th className="px-6 py-4 text-end text-xs font-semibold text-dim uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge">
                {leads.map((lead) => {
                  const cat = getCategoryLabel(lead.property?.propertyType)
                  return (
                    <tr key={lead.id} className="transition-colors hover:bg-card-hover/40">
                      {/* Client Column */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-heading">{lead.name}</span>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-dim">
                            {lead.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {lead.phone}
                              </span>
                            )}
                            {lead.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {lead.email}
                              </span>
                            )}
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-card border-edge text-dim font-medium">
                              {sourceLabel[lead.source] || lead.source}
                            </Badge>
                          </div>
                        </div>
                      </td>

                      {/* Type Category Tag Column */}
                      <td className="px-6 py-4">
                        <Badge variant={cat.variant} className="text-xs font-medium">
                          {cat.label}
                        </Badge>
                        {lead.property && (
                          <div className="mt-1 text-[11px] text-dim max-w-[200px] truncate" title={lead.property.titleAr || lead.property.title}>
                            {lead.property.titleAr || lead.property.title}
                          </div>
                        )}
                      </td>

                      {/* Stage Badge Column */}
                      <td className="px-6 py-4">
                        <Badge variant={statusVariant[lead.status] || 'secondary'} className="text-xs font-medium">
                          {statusLabel[lead.status] || lead.status}
                        </Badge>
                      </td>

                      {/* Assigned Agent Column */}
                      <td className="px-6 py-4">
                        {lead.agent ? (
                          <div className="flex items-center gap-2">
                            {lead.agent.avatar ? (
                              <img
                                src={lead.agent.avatar}
                                alt={lead.agent.name}
                                className="h-6 w-6 rounded-full object-cover border border-edge"
                              />
                            ) : (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary border border-primary/20">
                                {lead.agent.name.substring(0, 2)}
                              </div>
                            )}
                            <span className="text-xs font-medium text-heading">{lead.agent.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-dim italic">غير معين</span>
                        )}
                      </td>

                      {/* Last Contact Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-dim">
                          <Calendar className="h-3.5 w-3.5 text-dim" />
                          <span>{new Date(lead.updatedAt).toLocaleDateString('ar-SA-u-nu-latn', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}</span>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4 text-end">
                        <Link href={`/dashboard/leads/${lead.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 px-2 hover:text-primary">
                            <span>تفاصيل العميل</span>
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-dim">
            عرض {(pagination.page - 1) * pagination.pageSize + 1} إلى{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} من {pagination.total} عميل
          </p>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              <ChevronRight className="h-4 w-4" />
              السابق
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}>
              التالي
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
