'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Search,
  Users,
  UserCheck,
  Heart,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Phone,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { getVisitors, getVisitorStats } from '@/lib/actions/visitors'

export default function VisitorsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Awaited<ReturnType<typeof getVisitors>> | null>(null)
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getVisitorStats>> | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [visitorsData, statsData] = await Promise.all([
        getVisitors({ page, search: search || undefined }),
        getVisitorStats(),
      ])
      setData(visitorsData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to fetch visitors:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const visitors = data?.visitors || []
  const totalPages = data?.totalPages || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#2D3748]">الزوار</h1>
        <p className="mt-1 text-sm text-[#718096]">إدارة زوار الموقع المسجلين</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'الإجمالي', value: stats.total, icon: Users, color: 'text-[#C8A96E]', bg: 'bg-[#C8A96E]/10' },
            { label: 'نشط', value: stats.active, icon: UserCheck, color: 'text-green-500', bg: 'bg-green-50' },
            { label: 'لديهم طلبات', value: stats.withRequests, icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'لديهم مفضلة', value: stats.withFavorites, icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-xl border border-[#E2E8F0] bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#718096]">{label}</p>
                  <p className="mt-1 text-2xl font-bold text-[#2D3748]">{value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718096]" />
        <Input
          placeholder="البحث بالاسم، الهاتف، البريد..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="ps-10"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8A96E] border-t-transparent" />
        </div>
      ) : visitors.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="mx-auto h-12 w-12 text-[#718096]" />
            <p className="mt-4 text-lg font-medium text-[#2D3748]">لا يوجد زوار مسجلين</p>
            <p className="mt-1 text-sm text-[#718096]">سيظهر الزوار هنا عند تسجيلهم في موقعك</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-[#718096]">الاسم</th>
                  <th className="hidden px-4 py-3 text-start text-xs font-medium uppercase text-[#718096] md:table-cell">الهاتف</th>
                  <th className="hidden px-4 py-3 text-start text-xs font-medium uppercase text-[#718096] lg:table-cell">البريد</th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-[#718096]">الطلبات</th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-[#718096]">المفضلة</th>
                  <th className="hidden px-4 py-3 text-start text-xs font-medium uppercase text-[#718096] lg:table-cell">آخر دخول</th>
                  <th className="hidden px-4 py-3 text-start text-xs font-medium uppercase text-[#718096] md:table-cell">التاريخ</th>
                  <th className="px-4 py-3 text-end text-xs font-medium uppercase text-[#718096]">عرض</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => (
                  <tr key={v.id} className="border-b border-[#E2E8F0] transition-colors hover:bg-white/50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-[#2D3748]">{v.name}</p>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="flex items-center gap-1 text-sm text-[#718096]">
                        <Phone className="h-3 w-3" />
                        {v.phone}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className="flex items-center gap-1 text-sm text-[#718096]">
                        <Mail className="h-3 w-3" />
                        {v.email || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-sm text-[#718096]">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {v._count.requests}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-sm text-[#718096]">
                        <Heart className="h-3.5 w-3.5" />
                        {v._count.favorites}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-[#718096] lg:table-cell">
                      {v.lastLoginAt ? new Date(v.lastLoginAt).toLocaleDateString('ar-SA-u-nu-latn') : '-'}
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-[#718096] md:table-cell">
                      {new Date(v.createdAt).toLocaleDateString('ar-SA-u-nu-latn')}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <Link href={`/dashboard/visitors/${v.id}`}>
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
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#718096]">
            صفحة {page} من {totalPages}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              <ChevronRight className="h-4 w-4" />
              السابق
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              التالي
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
