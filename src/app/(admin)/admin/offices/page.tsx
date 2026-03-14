'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Building2,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

// ─── Types ────────────────────────────────────────────────────

interface OfficeItem {
  id: string
  name: string
  slug: string
  plan: string
  isApproved: boolean
  isActive: boolean
  usersCount: number
  propertiesCount: number
  createdAt: string
}

const planNameMap: Record<string, string> = {
  Basic: 'أساسي',
  Pro: 'احترافي',
  Enterprise: 'مؤسسي',
}

// ─── Component ────────────────────────────────────────────────

export default function AdminOfficesPage() {
  const [offices, setOffices] = useState<OfficeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [toggleLoading, setToggleLoading] = useState<string | null>(null)

  const fetchOffices = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: '20',
        ...(search && { search }),
      })

      const res = await fetch(`/api/admin/offices?${params}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setOffices(data.data)
          setTotalPages(data.pagination?.totalPages || 1)
        }
      }
    } catch {
      // Handle error silently
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchOffices()
  }, [fetchOffices])

  const handleToggleApproval = async (officeId: string, currentlyApproved: boolean) => {
    setToggleLoading(officeId)
    try {
      const res = await fetch(`/api/admin/offices/${officeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: currentlyApproved ? 'disable' : 'approve',
        }),
      })

      if (res.ok) {
        setOffices((prev) =>
          prev.map((o) =>
            o.id === officeId
              ? { ...o, isApproved: !currentlyApproved, isActive: !currentlyApproved ? true : false }
              : o
          )
        )
      }
    } catch {
      // Handle error
    } finally {
      setToggleLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#2D3748]">إدارة المكاتب</h1>
        <p className="mt-1 text-sm text-[#718096]">
          عرض وإدارة جميع المكاتب المسجلة على المنصة.
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718096]" />
            <Input
              placeholder="البحث بالاسم أو المعرف..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Offices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-[#C8A96E]" />
            المكاتب
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#C8A96E]" />
            </div>
          ) : offices.length === 0 ? (
            <div className="py-12 text-center">
              <Building2 className="mx-auto h-10 w-10 text-[#A0AEC0]" />
              <p className="mt-3 text-sm text-[#718096]">لا توجد مكاتب</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E2E8F0]">
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#718096]">
                        المكتب
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#718096]">
                        الخطة
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#718096]">
                        الحالة
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#718096]">
                        المستخدمين
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#718096]">
                        العقارات
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#718096]">
                        تاريخ الإنشاء
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#718096]">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {offices.map((office) => (
                      <tr
                        key={office.id}
                        className="transition-colors hover:bg-[#F7F7F2]/30"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-[#2D3748]">
                              {office.name}
                            </p>
                            <p className="text-xs text-[#718096]">{office.slug}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              office.plan === 'Enterprise'
                                ? 'default'
                                : office.plan === 'Pro'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {planNameMap[office.plan] || planNameMap['Basic']}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
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
                        </td>
                        <td className="px-4 py-3 text-sm text-[#2D3748]">
                          {office.usersCount}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#2D3748]">
                          {office.propertiesCount}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#718096]">
                          {new Date(office.createdAt).toLocaleDateString('ar-SA-u-nu-latn', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/offices/${office.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant={office.isApproved ? 'destructive' : 'default'}
                              size="sm"
                              isLoading={toggleLoading === office.id}
                              onClick={() =>
                                handleToggleApproval(office.id, office.isApproved)
                              }
                            >
                              {office.isApproved ? 'تعطيل' : 'اعتماد'}
                            </Button>
                          </div>
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
