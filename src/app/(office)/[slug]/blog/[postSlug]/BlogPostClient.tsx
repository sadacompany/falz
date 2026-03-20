'use client'

import Link from 'next/link'
import { usePublicOffice } from '@/components/public/PublicOfficeContext'
import { useDirection } from '@/components/shared/DirectionProvider'
import { formatDate } from '@/lib/utils'
import { Calendar, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react'

interface PostData {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string | null
  featuredImage: string | null
  publishedAt: string | null
  categories: { slug: string; name: string }[]
  tags: { slug: string; name: string }[]
}

interface RelatedPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  featuredImage: string | null
  publishedAt: string | null
}

interface BlogPostClientProps {
  officeSlug: string
  post: PostData
  relatedPosts: RelatedPost[]
}

export function BlogPostClient({ officeSlug, post, relatedPosts }: BlogPostClientProps) {
  const { dict } = usePublicOffice()
  const { locale, isRtl } = useDirection()

  const BackArrow = isRtl ? ChevronRight : ChevronLeft
  const Arrow = isRtl ? ArrowLeft : ArrowRight

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
      {/* Back */}
      <Link
        href={`/${officeSlug}/blog`}
        className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors hover:underline text-[#718096] hover:text-[#1E3A5F]"
      >
        <BackArrow className="h-4 w-4" />
        {dict.blog.blog}
      </Link>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="aspect-[2/1] rounded-2xl overflow-hidden mb-8 border border-[#E2E8F0]">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Categories */}
      {post.categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${officeSlug}/blog?category=${cat.slug}`}
              className="px-3 py-1 rounded-full text-xs font-semibold transition-colors hover:opacity-80 bg-[#FAF5EB] text-[#C8A96E]"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-[#1E3A5F]">
        {post.title}
      </h1>

      {/* Date */}
      {post.publishedAt && (
        <div className="flex items-center gap-2 text-sm mb-10 text-[#A0AEC0]">
          <Calendar className="h-4 w-4" />
          {formatDate(post.publishedAt, locale === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US')}
        </div>
      )}

      {/* Content */}
      <article
        className="prose prose-lg max-w-none mb-12"
        style={{
          color: '#2D3748',
          '--tw-prose-headings': '#1E3A5F',
          '--tw-prose-body': '#2D3748',
          '--tw-prose-links': '#C8A96E',
          '--tw-prose-bold': '#1E3A5F',
          '--tw-prose-quotes': '#718096',
          '--tw-prose-quote-borders': '#C8A96E',
        } as React.CSSProperties}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="py-6 mb-12 border-t border-[#E2E8F0] border-b border-b-[#E2E8F0]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-[#1E3A5F]">
              {dict.blog.tags}:
            </span>
            {post.tags.map((tag) => (
              <span
                key={tag.slug}
                className="px-3 py-1 rounded-lg text-xs bg-[#F7F8FA] text-[#718096] border border-[#E2E8F0]"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-8 text-[#1E3A5F]">
            {dict.blog.relatedPosts}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedPosts.map((rp) => (
              <Link
                key={rp.id}
                href={`/${officeSlug}/blog/${rp.slug}`}
                className="group rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-white border border-[#E2E8F0]"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  {rp.featuredImage ? (
                    <img
                      src={rp.featuredImage}
                      alt={rp.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-[#EBF0F7]">
                      <span className="text-3xl font-bold opacity-10 text-[#1E3A5F]">
                        {rp.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold line-clamp-2 mb-2 text-[#1E3A5F] group-hover:text-[#C8A96E]">
                    {rp.title}
                  </h3>
                  {rp.publishedAt && (
                    <p className="text-xs text-[#A0AEC0]">
                      {formatDate(rp.publishedAt, locale === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US')}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
