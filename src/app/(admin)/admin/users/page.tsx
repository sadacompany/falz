'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

// ─── Types ────────────────────────────────────────────────────

interface UserItem {
  id: string
  name: string
  email: string
  phone: string | null
  isSuperAdmin: boolean
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  memberships: {
    officeName: string
    role: string
  }[]
}

const roleNameMap: Record<string, string> = {
  OWNER: 'مالك',
  MANAGER: 'مدير',
  AGENT: 'وكيل',
  VIEWER: 'مشاهد',
}

// ─── Component ────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [toggleLoading, setToggleLoading] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: '20',
        ...(search && { search }),
      })

      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setUsers(data.data)
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
    fetchUsers()
  }, [fetchUsers])

  const handleToggleActive = async (userId: string, currentlyActive: boolean) => {
    setToggleLoading(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentlyActive }),
      })

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, isActive: !currentlyActive } : u
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
        <h1 className="text-2xl font-bold text-[#2D3748]">إدارة المستخدمين</h1>
        <p className="mt-1 text-sm text-[#718096]">
          عرض وإدارة جميع مستخدمي المنصة.
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718096]" />
            <Input
              placeholder="البحث بالاسم أو البريد..."
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

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-[#C8A96E]" />
            المستخدمين
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#C8A96E]" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto h-10 w-10 text-[#A0AEC0]" />
              <p className="mt-3 text-sm text-[#718096]">لا يوجد مستخدمين</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E2E8F0]">
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#718096]">
                        المستخدم
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#718096]">
                        المكتب
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
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#718096]">
                        تاريخ الانضمام
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#718096]">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="transition-colors hover:bg-[#F7F7F2]/30"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-[#2D3748]">
                                {user.name}
                              </p>
                              {user.isSuperAdmin && (
                                <Badge variant="destructive" className="text-[10px]">
                                  مشرف
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-[#718096]">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#718096]">
                          {user.memberships.length > 0
                            ? user.memberships.map((m) => m.officeName).join(', ')
                            : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {user.memberships.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {user.memberships.map((m, i) => (
                                <Badge key={i} variant="outline" className="text-[10px]">
                                  {roleNameMap[m.role] || m.role}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-[#718096]">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={user.isActive ? 'success' : 'destructive'}
                          >
                            {user.isActive ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#718096]">
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleDateString('ar-SA-u-nu-latn', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'لم يسجل دخول'}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#718096]">
                          {new Date(user.createdAt).toLocaleDateString('ar-SA-u-nu-latn', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant={user.isActive ? 'destructive' : 'default'}
                            size="sm"
                            isLoading={toggleLoading === user.id}
                            disabled={user.isSuperAdmin}
                            onClick={() =>
                              handleToggleActive(user.id, user.isActive)
                            }
                          >
                            {user.isActive ? 'تعطيل' : 'تفعيل'}
                          </Button>
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
