'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, FileText, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getBlogPosts, deleteBlogPost, type BlogPostFilters } from '@/lib/actions/blog'

const statusBadge: Record<string, { label: string; variant: 'default' | 'success' | 'secondary' | 'warning' }> = {
  DRAFT: { label: 'مسودة', variant: 'secondary' },
  PUBLISHED: { label: 'منشور', variant: 'success' },
  ARCHIVED: { label: 'مؤرشف', variant: 'warning' },
}

export default function BlogPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Awaited<ReturnType<typeof getBlogPosts>> | null>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const filters: BlogPostFilters = {
        ...(statusFilter && { status: statusFilter as BlogPostFilters['status'] }),
        ...(search && { search }),
      }
      const result = await getBlogPosts(filters)
      setData(result)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return
    try {
      await deleteBlogPost(id)
      fetchPosts()
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }

  const posts = data?.posts || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3748]">المدونة</h1>
          <p className="mt-1 text-sm text-[#718096]">
            {data?.pagination.total || 0} مقال
          </p>
        </div>
        <Link href="/dashboard/blog/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            مقال جديد
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718096]" />
          <Input
            placeholder="البحث في المقالات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748]"
        >
          <option value="">جميع الحالات</option>
          <option value="DRAFT">مسودة</option>
          <option value="PUBLISHED">منشور</option>
          <option value="ARCHIVED">مؤرشف</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8A96E] border-t-transparent" />
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="mx-auto h-12 w-12 text-[#718096]" />
            <p className="mt-4 text-lg font-medium text-[#2D3748]">لا توجد مقالات بعد</p>
            <p className="mt-1 text-sm text-[#718096]">أنشئ أول مقال لك لجذب الزوار.</p>
            <Link href="/dashboard/blog/new" className="mt-4 inline-block">
              <Button><Plus className="h-4 w-4" />مقال جديد</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-[#718096]">العنوان</th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-[#718096]">الحالة</th>
                  <th className="hidden px-4 py-3 text-start text-xs font-medium uppercase text-[#718096] md:table-cell">التصنيفات</th>
                  <th className="hidden px-4 py-3 text-start text-xs font-medium uppercase text-[#718096] lg:table-cell">التاريخ</th>
                  <th className="px-4 py-3 text-end text-xs font-medium uppercase text-[#718096]">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => {
                  const s = statusBadge[post.status] || statusBadge.DRAFT
                  return (
                    <tr key={post.id} className="border-b border-[#E2E8F0] transition-colors hover:bg-white/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-[#2D3748]">{post.title}</p>
                          {post.titleAr && <p className="text-xs text-[#718096]" dir="rtl">{post.titleAr}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {post.categories.map((pc) => (
                            <Badge key={pc.category.id} variant="outline" className="text-[10px]">
                              {pc.category.name}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-[#718096] lg:table-cell">
                        {new Date(post.createdAt).toLocaleDateString('ar-SA-u-nu-latn')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/dashboard/blog/${post.id}`}>
                            <button className="rounded-md p-1.5 text-[#718096] hover:bg-[#F7F7F2] hover:text-[#1E3A5F]" title="تعديل">
                              <Edit className="h-4 w-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="rounded-md p-1.5 text-[#718096] hover:bg-red-600/10 hover:text-red-400"
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
