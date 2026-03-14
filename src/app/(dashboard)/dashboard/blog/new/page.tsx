'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Plus,
  Tag,
  FolderOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  createBlogPost,
  getBlogCategories,
  getBlogTags,
  createBlogCategory,
  createBlogTag,
  type CreateBlogPostInput,
} from '@/lib/actions/blog'

// ─── Types ──────────────────────────────────────────────────

type CategoryItem = {
  id: string
  name: string
  nameAr: string | null
  slug: string
  _count: { posts: number }
}

type TagItem = {
  id: string
  name: string
  nameAr: string | null
  slug: string
  _count: { posts: number }
}

// ─── Component ──────────────────────────────────────────────

export default function NewBlogPostPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [titleAr, setTitleAr] = useState('')
  const [content, setContent] = useState('')
  const [contentAr, setContentAr] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [excerptAr, setExcerptAr] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [featuredImagePreview, setFeaturedImagePreview] = useState('')
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')

  // Categories & Tags
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [tags, setTags] = useState<TagItem[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  // Inline creation
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryNameAr, setNewCategoryNameAr] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)

  const [showNewTag, setShowNewTag] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagNameAr, setNewTagNameAr] = useState('')
  const [creatingTag, setCreatingTag] = useState(false)

  // Load categories and tags
  useEffect(() => {
    getBlogCategories()
      .then((data) => setCategories(data as CategoryItem[]))
      .catch(() => {})
    getBlogTags()
      .then((data) => setTags(data as TagItem[]))
      .catch(() => {})
  }, [])

  // Featured image upload via file input
  const handleFeaturedImageSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    if (!file.type.startsWith('image/')) return
    setFeaturedImagePreview(URL.createObjectURL(file))
    // In production, upload to storage and set URL
    setFeaturedImage(URL.createObjectURL(file))
  }, [])

  const removeFeaturedImage = () => {
    if (featuredImagePreview) {
      URL.revokeObjectURL(featuredImagePreview)
    }
    setFeaturedImage('')
    setFeaturedImagePreview('')
  }

  // Category toggle
  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  // Tag toggle
  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  // Create new category inline
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    setCreatingCategory(true)
    try {
      const cat = await createBlogCategory(
        newCategoryName.trim(),
        newCategoryNameAr.trim() || undefined
      )
      setCategories((prev) => [...prev, { ...cat, _count: { posts: 0 } } as CategoryItem])
      setSelectedCategoryIds((prev) => [...prev, cat.id])
      setNewCategoryName('')
      setNewCategoryNameAr('')
      setShowNewCategory(false)
    } catch (err) {
      console.error('Failed to create category:', err)
    } finally {
      setCreatingCategory(false)
    }
  }

  // Create new tag inline
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    setCreatingTag(true)
    try {
      const tag = await createBlogTag(
        newTagName.trim(),
        newTagNameAr.trim() || undefined
      )
      setTags((prev) => [...prev, { ...tag, _count: { posts: 0 } } as TagItem])
      setSelectedTagIds((prev) => [...prev, tag.id])
      setNewTagName('')
      setNewTagNameAr('')
      setShowNewTag(false)
    } catch (err) {
      console.error('Failed to create tag:', err)
    } finally {
      setCreatingTag(false)
    }
  }

  // Submit
  const handleSubmit = async (saveStatus: 'DRAFT' | 'PUBLISHED') => {
    if (!title.trim()) {
      setError('العنوان مطلوب')
      return
    }
    if (!content.trim()) {
      setError('المحتوى مطلوب')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const input: CreateBlogPostInput = {
        title: title.trim(),
        titleAr: titleAr.trim() || undefined,
        content: content.trim(),
        contentAr: contentAr.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        excerptAr: excerptAr.trim() || undefined,
        featuredImage: featuredImage || undefined,
        status: saveStatus,
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined,
        categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      }

      await createBlogPost(input)
      router.push('/dashboard/blog')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في إنشاء المقال')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/blog">
            <button className="rounded-lg p-2 text-[#718096] transition-colors hover:bg-[#F7F7F2] hover:text-[#1E3A5F]">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <h1 className="text-2xl font-bold text-[#2D3748]">إنشاء مقال</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit('DRAFT')}
            disabled={submitting}
          >
            <Save className="h-4 w-4" />
            حفظ كمسودة
          </Button>
          <Button onClick={() => handleSubmit('PUBLISHED')} isLoading={submitting}>
            نشر
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Left 2 Columns */}
        <div className="space-y-6 lg:col-span-2">
          {/* Title */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">العنوان</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>العنوان (إنجليزي)</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="أدخل عنوان المقال..."
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>العنوان (عربي)</Label>
                  <Input
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder="عنوان المقال..."
                    dir="rtl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">المحتوى</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>المحتوى (إنجليزي)</Label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="اكتب محتوى المقال بالإنجليزية..."
                    dir="ltr"
                    rows={12}
                    className="flex w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748] placeholder:text-[#718096] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>المحتوى (عربي)</Label>
                  <textarea
                    value={contentAr}
                    onChange={(e) => setContentAr(e.target.value)}
                    placeholder="اكتب محتوى المقال..."
                    dir="rtl"
                    rows={12}
                    className="flex w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748] placeholder:text-[#718096] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Excerpt */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">المقتطف</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>المقتطف (إنجليزي)</Label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="ملخص موجز للمقال بالإنجليزية..."
                    dir="ltr"
                    rows={3}
                    className="flex w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748] placeholder:text-[#718096] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>المقتطف (عربي)</Label>
                  <textarea
                    value={excerptAr}
                    onChange={(e) => setExcerptAr(e.target.value)}
                    placeholder="ملخص موجز للمقال..."
                    dir="rtl"
                    rows={3}
                    className="flex w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748] placeholder:text-[#718096] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">الصورة الرئيسية</CardTitle>
            </CardHeader>
            <CardContent>
              {featuredImagePreview ? (
                <div className="relative aspect-video overflow-hidden rounded-lg border border-[#E2E8F0]">
                  <Image
                    src={featuredImagePreview}
                    alt="الصورة الرئيسية"
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={removeFeaturedImage}
                    className="absolute end-2 top-2 rounded-full bg-red-600 p-1.5 transition-opacity hover:bg-red-700"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    handleFeaturedImageSelect(e.dataTransfer.files)
                  }}
                  className="cursor-pointer rounded-xl border-2 border-dashed border-[#E2E8F0] bg-[#FAFAF7] p-8 text-center transition-all hover:border-[#C8A96E]/40"
                >
                  <Upload className="mx-auto h-8 w-8 text-[#718096]" />
                  <p className="mt-2 text-sm font-medium text-[#2D3748]">
                    اسحب الصورة هنا أو اضغط للرفع
                  </p>
                  <p className="mt-1 text-xs text-[#718096]">
                    JPG, PNG, WebP - الحجم الموصى به 1200x630
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFeaturedImageSelect(e.target.files)}
              />
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">إعدادات SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>العنوان الوصفي</Label>
                <Input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="عنوان SEO مخصص (يستخدم عنوان المقال افتراضياً)"
                  dir="ltr"
                />
                <p className="text-xs text-[#718096]">
                  {seoTitle.length}/60 حرف
                </p>
              </div>
              <div className="space-y-2">
                <Label>الوصف الوصفي</Label>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="وصف مخصص لمحركات البحث..."
                  dir="ltr"
                  rows={3}
                  className="flex w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748] placeholder:text-[#718096] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]"
                />
                <p className="text-xs text-[#718096]">
                  {seoDescription.length}/160 حرف
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">الحالة</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                className="flex h-10 w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748]"
              >
                <option value="DRAFT">مسودة</option>
                <option value="PUBLISHED">منشور</option>
              </select>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">
                <FolderOpen className="me-2 inline-block h-4 w-4" />
                التصنيفات
              </CardTitle>
              <button
                onClick={() => setShowNewCategory(!showNewCategory)}
                className="rounded-md p-1 text-[#718096] transition-colors hover:bg-[#F7F7F2] hover:text-[#C8A96E]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Inline Create */}
              {showNewCategory && (
                <div className="space-y-2 rounded-lg border border-[#E2E8F0] bg-[#FAFAF7] p-3">
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="اسم التصنيف (إنجليزي)"
                    dir="ltr"
                  />
                  <Input
                    value={newCategoryNameAr}
                    onChange={(e) => setNewCategoryNameAr(e.target.value)}
                    placeholder="اسم التصنيف (عربي)"
                    dir="rtl"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleCreateCategory}
                      isLoading={creatingCategory}
                      className="flex-1"
                    >
                      إضافة
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowNewCategory(false)}
                      className="flex-1"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              )}

              {/* Category List */}
              {categories.length > 0 ? (
                <div className="max-h-48 space-y-1 overflow-y-auto">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-[#F7F7F2]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategoryIds.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                        className="h-4 w-4 rounded border-[#E2E8F0] bg-[#FAFAF7] text-[#C8A96E] focus:ring-[#C8A96E]"
                      />
                      <span className="text-[#2D3748]">{cat.name}</span>
                      {cat.nameAr && (
                        <span className="text-xs text-[#718096]" dir="rtl">
                          {cat.nameAr}
                        </span>
                      )}
                      <span className="ms-auto text-xs text-[#718096]">
                        {cat._count.posts}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="py-2 text-center text-sm text-[#718096]">
                  لا توجد تصنيفات بعد
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">
                <Tag className="me-2 inline-block h-4 w-4" />
                الوسوم
              </CardTitle>
              <button
                onClick={() => setShowNewTag(!showNewTag)}
                className="rounded-md p-1 text-[#718096] transition-colors hover:bg-[#F7F7F2] hover:text-[#C8A96E]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Inline Create */}
              {showNewTag && (
                <div className="space-y-2 rounded-lg border border-[#E2E8F0] bg-[#FAFAF7] p-3">
                  <Input
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="اسم الوسم (إنجليزي)"
                    dir="ltr"
                  />
                  <Input
                    value={newTagNameAr}
                    onChange={(e) => setNewTagNameAr(e.target.value)}
                    placeholder="اسم الوسم (عربي)"
                    dir="rtl"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleCreateTag}
                      isLoading={creatingTag}
                      className="flex-1"
                    >
                      إضافة
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowNewTag(false)}
                      className="flex-1"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              )}

              {/* Tag List */}
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                        selectedTagIds.includes(tag.id)
                          ? 'border-[#C8A96E] bg-[#C8A96E]/10 text-[#C8A96E]'
                          : 'border-[#E2E8F0] text-[#718096] hover:border-[#C8A96E]/30 hover:text-[#1E3A5F]'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="py-2 text-center text-sm text-[#718096]">
                  لا توجد وسوم بعد
                </p>
              )}

              {/* Selected tags display */}
              {selectedTagIds.length > 0 && (
                <div className="border-t border-[#E2E8F0] pt-2">
                  <p className="mb-1.5 text-xs text-[#718096]">
                    {selectedTagIds.length} محدد
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTagIds.map((id) => {
                      const tag = tags.find((t) => t.id === id)
                      return tag ? (
                        <Badge key={id} variant="secondary" className="gap-1">
                          {tag.name}
                          <button onClick={() => toggleTag(id)}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
