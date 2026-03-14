'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  FileText,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

// ─── Types ────────────────────────────────────────────────────

interface AuditLogItem {
  id: string
  officeId: string
  officeName: string
  userId: string | null
  userName: string | null
  action: string
  entity: string | null
  entityId: string | null
  details: Record<string, unknown> | null
  ip: string | null
  createdAt: string
}

// ─── Action Color Map ─────────────────────────────────────────

function getActionColor(action: string): 'success' | 'warning' | 'destructive' | 'secondary' | 'default' {
  if (action.includes('created') || action.includes('approved') || action.includes('published')) return 'success'
  if (action.includes('updated') || action.includes('changed')) return 'warning'
  if (action.includes('deleted') || action.includes('disabled') || action.includes('cancelled')) return 'destructive'
  return 'secondary'
}

// ─── Component ────────────────────────────────────────────────

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: '30',
        ...(search && { search }),
        ...(actionFilter && { action: actionFilter }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      })

      const res = await fetch(`/api/admin/audit?${params}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setLogs(data.data)
          setTotalPages(data.pagination?.totalPages || 1)
        }
      }
    } catch {
      // Handle error silently
    } finally {
      setLoading(false)
    }
  }, [page, search, actionFilter, dateFrom, dateTo])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#2D3748]">سجل المراجعة</h1>
        <p className="mt-1 text-sm text-[#718096]">
          مراجعة جميع الإجراءات والنشاطات على المنصة.
        </p>
      </div>

      {/* Search + Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718096]" />
                <Input
                  placeholder="البحث بالمكتب أو المستخدم..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10"
                />
              </div>
              <Button
                variant={showFilters ? 'default' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                تصفية
              </Button>
            </div>

            {showFilters && (
              <div className="grid gap-3 rounded-lg border border-[#E2E8F0] bg-[#FAFAF7] p-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-[#718096]">
                    نوع الإجراء
                  </label>
                  <Input
                    placeholder="مثال: property_published"
                    value={actionFilter}
                    onChange={(e) => {
                      setActionFilter(e.target.value)
                      setPage(1)
                    }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[#718096]">
                    من تاريخ
                  </label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value)
                      setPage(1)
                    }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[#718096]">
                    إلى تاريخ
                  </label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value)
                      setPage(1)
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-[#C8A96E]" />
            سجل النشاطات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#C8A96E]" />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-10 w-10 text-[#A0AEC0]" />
              <p className="mt-3 text-sm text-[#718096]">لا توجد سجلات</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E2E8F0]">
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#718096]">
                        الوقت
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#718096]">
                        المستخدم
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#718096]">
                        المكتب
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#718096]">
                        الإجراء
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#718096]">
                        العنصر
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#718096]">
                        التفاصيل
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        className="transition-colors hover:bg-[#F7F7F2]/30"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs text-[#718096]">
                            <Calendar className="h-3 w-3" />
                            {new Date(log.createdAt).toLocaleDateString('ar-SA-u-nu-latn', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#2D3748]">
                          {log.userName || 'النظام'}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#718096]">
                          {log.officeName}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={getActionColor(log.action)}>
                            {log.action.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#2D3748]">
                          {log.entity ? (
                            <span>
                              {log.entity}
                              {log.entityId && (
                                <span className="ml-1 text-xs text-[#718096]">
                                  ({log.entityId.slice(0, 8)}...)
                                </span>
                              )}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="max-w-[200px] px-4 py-3 text-xs text-[#718096]">
                          {log.details ? (
                            <span className="truncate block">
                              {JSON.stringify(log.details).slice(0, 80)}
                              {JSON.stringify(log.details).length > 80 ? '...' : ''}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-[#E2E8F0] pt-4">
                  <p className="text-sm text-[#718096]">
                    صفحة {page} من {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
