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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getLeads, getLeadStats, type LeadFilters } from '@/lib/actions/leads'

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

// ─── Component ──────────────────────────────────────────────

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
        pageSize: 20,
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
    const headers = ['الاسم', 'الهاتف', 'البريد الإلكتروني', 'المصدر', 'الحالة', 'العقار', 'الوكيل', 'التاريخ']
    const rows = data.leads.map((l) => [
      l.name,
      l.phone || '',
      l.email || '',
      l.source,
      l.status,
      l.property?.title || '',
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
  const pagination = data?.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3748]">العملاء المحتملين</h1>
          <p className="mt-1 text-sm text-[#718096]">
            إدارة العملاء المحتملين واستفساراتهم
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="h-4 w-4" />
          تصدير CSV
        </Button>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: 'الإجمالي', value: stats.total },
            { label: 'جديد', value: stats.new },
            { label: 'تم التواصل', value: stats.contacted },
            { label: 'مؤهل', value: stats.qualified },
            { label: 'مغلق', value: stats.closed },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="px-4 py-3 text-center">
                <p className="text-2xl font-bold text-[#2D3748]">{s.value}</p>
                <p className="text-xs text-[#718096]">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-[#E2E8F0] bg-white p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setStatusFilter(tab.key)
              setPage(1)
            }}
            className={cn(
              'whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors',
              statusFilter === tab.key
                ? 'bg-[#C8A96E] text-[#1E3A5F]'
                : 'text-[#718096] hover:text-[#1E3A5F]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718096]" />
          <Input
            placeholder="البحث بالاسم، الهاتف، البريد..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="ps-10"
          />
        </div>
        <select
          value={sourceFilter}
          onChange={(e) => { setSourceFilter(e.target.value); setPage(1) }}
          className="rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748]"
        >
          <option value="">جميع المصادر</option>
          <option value="CONTACT_FORM">نموذج التواصل</option>
          <option value="PROPERTY_INQUIRY">استفسار عقاري</option>
          <option value="WHATSAPP_CLICK">واتساب</option>
          <option value="PHONE_CLICK">هاتف</option>
          <option value="MANUAL">يدوي</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8A96E] border-t-transparent" />
        </div>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="mx-auto h-12 w-12 text-[#718096]" />
            <p className="mt-4 text-lg font-medium text-[#2D3748]">لا يوجد عملاء محتملين</p>
            <p className="mt-1 text-sm text-[#718096]">سيظهر العملاء المحتملين هنا عند استفسارهم عن عقاراتك.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-[#718096]">الاسم</th>
                  <th className="hidden px-4 py-3 text-start text-xs font-medium uppercase text-[#718096] md:table-cell">المصدر</th>
                  <th className="hidden px-4 py-3 text-start text-xs font-medium uppercase text-[#718096] lg:table-cell">العقار</th>
                  <th className="hidden px-4 py-3 text-start text-xs font-medium uppercase text-[#718096] md:table-cell">الوكيل</th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-[#718096]">الحالة</th>
                  <th className="hidden px-4 py-3 text-start text-xs font-medium uppercase text-[#718096] lg:table-cell">التاريخ</th>
                  <th className="px-4 py-3 text-end text-xs font-medium uppercase text-[#718096]">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-[#E2E8F0] transition-colors hover:bg-white/50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-[#2D3748]">{lead.name}</p>
                        <div className="flex items-center gap-2 text-xs text-[#718096]">
                          {lead.phone && (<span className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.phone}</span>)}
                          {lead.email && (<span className="flex items-center gap-1"><Mail className="h-3 w-3" />{lead.email}</span>)}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="text-sm text-[#718096]">{sourceLabel[lead.source] || lead.source}</span>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className="text-sm text-[#718096]">{lead.property?.title || '-'}</span>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="text-sm text-[#718096]">{lead.agent?.name || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[lead.status] || 'secondary'}>{statusLabel[lead.status] || lead.status}</Badge>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-[#718096] lg:table-cell">
                      {new Date(lead.createdAt).toLocaleDateString('ar-SA-u-nu-latn')}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <Link href={`/dashboard/leads/${lead.id}`}>
                        <Button variant="ghost" size="sm">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#718096]">
            عرض {(pagination.page - 1) * pagination.pageSize + 1} إلى{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} من {pagination.total}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              <ChevronRight className="h-4 w-4" />
              السابق
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}>
              التالي
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
