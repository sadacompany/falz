'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Download,
  Trash2,
  CheckSquare,
  Eye,
  Edit,
  MoreHorizontal,
  Building2,
  ChevronLeft,
  ChevronRight,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn, formatPrice } from '@/lib/utils'
import {
  getProperties,
  bulkDeleteProperties,
  bulkPublishProperties,
  type PropertyFilters,
} from '@/lib/actions/properties'

// ─── Status Badge ───────────────────────────────────────────

const statusBadge: Record<string, { label: string; variant: 'default' | 'success' | 'secondary' | 'warning' }> = {
  DRAFT: { label: 'مسودة', variant: 'secondary' },
  PUBLISHED: { label: 'منشور', variant: 'success' },
  ARCHIVED: { label: 'مؤرشف', variant: 'warning' },
}

const dealBadge: Record<string, { label: string; variant: 'default' | 'secondary' }> = {
  SALE: { label: 'بيع', variant: 'default' },
  RENT: { label: 'إيجار', variant: 'secondary' },
}

const propertyTypeLabel: Record<string, string> = {
  APARTMENT: 'شقة',
  VILLA: 'فيلا',
  LAND: 'أرض',
  OFFICE: 'مكتب',
  COMMERCIAL: 'تجاري',
  BUILDING: 'مبنى',
  COMPOUND: 'مجمع',
  FARM: 'مزرعة',
  OTHER: 'أخرى',
}

// ─── Component ──────────────────────────────────────────────

export default function PropertiesPage() {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [dealFilter, setDealFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Awaited<ReturnType<typeof getProperties>> | null>(null)

  const fetchProperties = useCallback(async () => {
    setLoading(true)
    try {
      const filters: PropertyFilters = {
        page,
        pageSize: 20,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter as PropertyFilters['status'] }),
        ...(dealFilter && { dealType: dealFilter as PropertyFilters['dealType'] }),
        ...(typeFilter && { propertyType: typeFilter as PropertyFilters['propertyType'] }),
      }
      const result = await getProperties(filters)
      setData(result)
    } catch (error) {
      console.error('Failed to fetch properties:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, dealFilter, typeFilter])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const selectAll = () => {
    if (!data) return
    if (selectedIds.size === data.properties.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(data.properties.map((p) => p.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف العقارات المحددة؟')) return
    try {
      await bulkDeleteProperties(Array.from(selectedIds))
      setSelectedIds(new Set())
      fetchProperties()
    } catch (error) {
      console.error('Bulk delete failed:', error)
    }
  }

  const handleBulkPublish = async () => {
    try {
      await bulkPublishProperties(Array.from(selectedIds))
      setSelectedIds(new Set())
      fetchProperties()
    } catch (error) {
      console.error('Bulk publish failed:', error)
    }
  }

  const handleExportCSV = () => {
    if (!data) return
    const headers = ['العنوان', 'السعر', 'الحالة', 'نوع الصفقة', 'النوع', 'المدينة', 'المشاهدات', 'التاريخ']
    const rows = data.properties.map((p) => [
      p.title,
      p.price,
      p.status,
      p.dealType,
      p.propertyType,
      p.city || '',
      p._count.analyticsEvents,
      new Date(p.createdAt).toLocaleDateString('ar-SA-u-nu-latn'),
    ])

    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'properties.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const properties = data?.properties || []
  const pagination = data?.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">العقارات</h1>
          <p className="mt-1 text-sm text-dim">
            {pagination.total} عقار
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            تصدير CSV
          </Button>
          <Link href="/dashboard/properties/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              إضافة عقار
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
              <Input
                placeholder="البحث في العقارات..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="ps-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="rounded-md border border-edge bg-page px-3 py-2 text-sm text-heading"
            >
              <option value="">جميع الحالات</option>
              <option value="DRAFT">مسودة</option>
              <option value="PUBLISHED">منشور</option>
              <option value="ARCHIVED">مؤرشف</option>
            </select>

            <select
              value={dealFilter}
              onChange={(e) => {
                setDealFilter(e.target.value)
                setPage(1)
              }}
              className="rounded-md border border-edge bg-page px-3 py-2 text-sm text-heading"
            >
              <option value="">جميع الأنواع</option>
              <option value="SALE">بيع</option>
              <option value="RENT">إيجار</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value)
                setPage(1)
              }}
              className="rounded-md border border-edge bg-page px-3 py-2 text-sm text-heading"
            >
              <option value="">جميع الأصناف</option>
              <option value="APARTMENT">شقة</option>
              <option value="VILLA">فيلا</option>
              <option value="LAND">أرض</option>
              <option value="OFFICE">مكتب</option>
              <option value="COMMERCIAL">تجاري</option>
              <option value="BUILDING">مبنى</option>
            </select>

            <div className="flex gap-1 border-s border-edge ps-3">
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  'rounded-md p-2 transition-colors',
                  viewMode === 'table'
                    ? 'bg-primary/10 text-primary'
                    : 'text-dim hover:text-heading'
                )}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'rounded-md p-2 transition-colors',
                  viewMode === 'grid'
                    ? 'bg-primary/10 text-primary'
                    : 'text-dim hover:text-heading'
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
          <span className="text-sm text-primary">
            {selectedIds.size} محدد
          </span>
          <Button variant="outline" size="sm" onClick={handleBulkPublish}>
            <Upload className="h-4 w-4" />
            نشر
          </Button>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="h-4 w-4" />
            حذف
          </Button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : properties.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="mx-auto h-12 w-12 text-dim" />
            <p className="mt-4 text-lg font-medium text-heading">
              لا توجد عقارات
            </p>
            <p className="mt-1 text-sm text-dim">
              أضف أول عقار لك للبدء.
            </p>
            <Link href="/dashboard/properties/new" className="mt-4 inline-block">
              <Button>
                <Plus className="h-4 w-4" />
                إضافة عقار
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        /* Table View */
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-edge">
                  <th className="px-4 py-3 text-start">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === properties.length && properties.length > 0}
                      onChange={selectAll}
                      className="rounded border-edge"
                    />
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-dim">
                    العقار
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-dim">
                    السعر
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-dim">
                    الحالة
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-dim">
                    النوع
                  </th>
                  <th className="hidden px-4 py-3 text-start text-xs font-medium uppercase text-dim md:table-cell">
                    المشاهدات
                  </th>
                  <th className="hidden px-4 py-3 text-start text-xs font-medium uppercase text-dim lg:table-cell">
                    التاريخ
                  </th>
                  <th className="px-4 py-3 text-end text-xs font-medium uppercase text-dim">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => {
                  const status = statusBadge[property.status] || statusBadge.DRAFT
                  const deal = dealBadge[property.dealType] || dealBadge.SALE
                  const thumb = property.media[0]?.url

                  return (
                    <tr
                      key={property.id}
                      className="border-b border-edge transition-colors hover:bg-card-hover"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(property.id)}
                          onChange={() => toggleSelect(property.id)}
                          className="rounded border-edge"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {thumb ? (
                            <div className="relative h-10 w-14 flex-shrink-0 overflow-hidden rounded-md">
                              <Image
                                src={thumb}
                                alt={property.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-10 w-14 flex-shrink-0 items-center justify-center rounded-md bg-alt">
                              <Building2 className="h-4 w-4 text-dim" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-heading">
                              {property.title}
                            </p>
                            <p className="text-xs text-dim">
                              {propertyTypeLabel[property.propertyType] || property.propertyType} - {property.city || 'غير محدد'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-heading">
                        {formatPrice(BigInt(property.price), property.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={deal.variant}>{deal.label}</Badge>
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-dim md:table-cell">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {property._count.analyticsEvents}
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-dim lg:table-cell">
                        {new Date(property.createdAt).toLocaleDateString('ar-SA-u-nu-latn')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/dashboard/properties/${property.id}`}>
                            <button className="rounded-md p-1.5 text-dim transition-colors hover:bg-card-hover hover:text-heading">
                              <Edit className="h-4 w-4" />
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Grid View */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((property) => {
            const status = statusBadge[property.status] || statusBadge.DRAFT
            const thumb = property.media[0]?.url

            return (
              <Link key={property.id} href={`/dashboard/properties/${property.id}`}>
                <Card className="overflow-hidden transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                  <div className="relative aspect-[4/3]">
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-alt">
                        <Building2 className="h-8 w-8 text-dim" />
                      </div>
                    )}
                    <div className="absolute start-2 top-2">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="truncate text-sm font-semibold text-heading">
                      {property.title}
                    </p>
                    <p className="mt-1 text-sm font-medium text-primary">
                      {formatPrice(BigInt(property.price), property.currency)}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs text-dim">
                      <span>{propertyTypeLabel[property.propertyType] || property.propertyType}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {property._count.analyticsEvents}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-dim">
            عرض {(pagination.page - 1) * pagination.pageSize + 1} إلى{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} من{' '}
            {pagination.total}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronRight className="h-4 w-4" />
              السابق
            </Button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const p = i + 1
              return (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
            >
              التالي
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
