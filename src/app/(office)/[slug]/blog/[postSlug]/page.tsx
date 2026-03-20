import { notFound } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import prisma from '@/lib/db'
import { resolveLocale, getDictionary } from '@/i18n'
import { BlogPostClient } from './BlogPostClient'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string; postSlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, postSlug } = await params
  const office = await prisma.office.findUnique({
    where: { slug },
    select: { id: true, name: true },
  })
  if (!office) return { title: 'Not Found' }

  const post = await prisma.blogPost.findFirst({
    where: { officeId: office.id, slug: postSlug, status: 'PUBLISHED' },
    select: { title: true, seoTitle: true, seoDescription: true, ogImage: true, excerpt: true },
  })
  if (!post) return { title: 'Not Found' }

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || undefined,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || undefined,
      images: post.ogImage ? [post.ogImage] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug, postSlug } = await params

  const office = await prisma.office.findUnique({
    where: { slug },
    select: { id: true, name: true, nameAr: true, defaultLanguage: true },
  })
  if (!office) notFound()

  const post = await prisma.blogPost.findFirst({
    where: { officeId: office.id, slug: postSlug, status: 'PUBLISHED' },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
    },
  })
  if (!post) notFound()

  const cookieStore = await cookies()
  const headerStore = await headers()
  const cookieLocale = cookieStore.get('locale')?.value
  const acceptLang = headerStore.get('accept-language')
  const browserLocale = acceptLang?.startsWith('ar') ? 'ar' : acceptLang?.startsWith('en') ? 'en' : undefined
  const locale = resolveLocale(cookieLocale || browserLocale || office.defaultLanguage)

  // Related posts
  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      officeId: office.id,
      status: 'PUBLISHED',
      id: { not: post.id },
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: {
      id: true,
      slug: true,
      title: true,
      titleAr: true,
      excerpt: true,
      excerptAr: true,
      featuredImage: true,
      publishedAt: true,
    },
  })

  const serializedPost = {
    id: post.id,
    slug: post.slug,
    title: locale === 'ar' && post.titleAr ? post.titleAr : post.title,
    content: locale === 'ar' && post.contentAr ? post.contentAr : post.content,
    excerpt: locale === 'ar' && post.excerptAr ? post.excerptAr : post.excerpt,
    featuredImage: post.featuredImage,
    publishedAt: post.publishedAt?.toISOString() || null,
    categories: post.categories.map((c) => ({
      slug: c.category.slug,
      name: locale === 'ar' && c.category.nameAr ? c.category.nameAr : c.category.name,
    })),
    tags: post.tags.map((t) => ({
      slug: t.tag.slug,
      name: locale === 'ar' && t.tag.nameAr ? t.tag.nameAr : t.tag.name,
    })),
  }

  const serializedRelated = relatedPosts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: locale === 'ar' && p.titleAr ? p.titleAr : p.title,
    excerpt: locale === 'ar' && p.excerptAr ? p.excerptAr : p.excerpt,
    featuredImage: p.featuredImage,
    publishedAt: p.publishedAt?.toISOString() || null,
  }))

  return (
    <BlogPostClient
      officeSlug={slug}
      post={serializedPost}
      relatedPosts={serializedRelated}
    />
  )
}
