'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePublicOffice } from '@/components/public/PublicOfficeContext'
import { useDirection } from '@/components/shared/DirectionProvider'
import { formatDate } from '@/lib/utils'
import { Calendar, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  featuredImage: string | null
  publishedAt: string | null
  categories: { slug: string; name: string }[]
}

interface BlogListClientProps {
  officeSlug: string
  posts: BlogPost[]
  categories: { slug: string; name: string }[]
  total: number
  page: number
  pageSize: number
  currentCategory: string
}

export function BlogListClient({
  officeSlug,
  posts,
  categories,
  total,
  page,
  pageSize,
  currentCategory,
}: BlogListClientProps) {
  const { dict } = usePublicOffice()
  const { locale, isRtl } = useDirection()
  const router = useRouter()

  const totalPages = Math.ceil(total / pageSize)
  const Arrow = isRtl ? ArrowLeft : ArrowRight

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-[#1E3A5F]">
          {dict.blog.blog}
        </h1>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => router.push(`/o/${officeSlug}/blog`)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
              !currentCategory
                ? 'bg-[#C8A96E] text-white border-[#C8A96E]'
                : 'bg-white text-[#718096] border-[#E2E8F0] hover:border-[#C8A96E] hover:text-[#C8A96E]'
            }`}
          >
            {dict.blog.allPosts}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => router.push(`/o/${officeSlug}/blog?category=${cat.slug}`)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                currentCategory === cat.slug
                  ? 'bg-[#C8A96E] text-white border-[#C8A96E]'
                  : 'bg-white text-[#718096] border-[#E2E8F0] hover:border-[#C8A96E] hover:text-[#C8A96E]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/o/${officeSlug}/blog/${post.slug}`}
              className="group rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-white border border-[#E2E8F0]"
            >
              {/* Featured Image */}
              <div className="aspect-[16/10] overflow-hidden">
                {post.featuredImage ? (
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-[#EBF0F7]">
                    <span className="text-4xl font-bold opacity-10 text-[#1E3A5F]">
                      {post.title.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5">
                {/* Categories */}
                {post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.categories.map((cat) => (
                      <span
                        key={cat.slug}
                        className="px-2 py-0.5 rounded text-xs font-medium bg-[#FAF5EB] text-[#C8A96E]"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h3 className="text-lg font-semibold mb-2 line-clamp-2 transition-colors text-[#1E3A5F] group-hover:text-[#C8A96E]">
                  {post.title}
                </h3>

                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-sm line-clamp-2 mb-4 text-[#718096]">
                    {post.excerpt}
                  </p>
                )}

                {/* Date + Read More */}
                <div className="flex items-center justify-between">
                  {post.publishedAt && (
                    <div className="flex items-center gap-1.5 text-xs text-[#A0AEC0]">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(post.publishedAt, locale === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US')}
                    </div>
                  )}
                  <span className="flex items-center gap-1 text-xs font-semibold text-[#C8A96E]">
                    {dict.blog.readMore}
                    <Arrow className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl p-16 text-center bg-white border border-[#E2E8F0]">
          <p className="text-lg font-semibold text-[#2D3748]">
            {dict.blog.noPostsFound}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => router.push(`/o/${officeSlug}/blog?${currentCategory ? `category=${currentCategory}&` : ''}page=${page - 1}`)}
            disabled={page <= 1}
            className="h-10 w-10 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 bg-white text-[#2D3748] border border-[#E2E8F0] hover:border-[#C8A96E]"
          >
            {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <span className="text-sm px-4 text-[#718096]">
            {dict.common.page} {page} / {totalPages}
          </span>
          <button
            onClick={() => router.push(`/o/${officeSlug}/blog?${currentCategory ? `category=${currentCategory}&` : ''}page=${page + 1}`)}
            disabled={page >= totalPages}
            className="h-10 w-10 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 bg-white text-[#2D3748] border border-[#E2E8F0] hover:border-[#C8A96E]"
          >
            {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  )
}
