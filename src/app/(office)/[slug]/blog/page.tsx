import { cookies, headers } from 'next/headers'
import prisma from '@/lib/db'
import { resolveLocale, getDictionary } from '@/i18n'
import { BlogListClient } from './BlogListClient'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const office = await prisma.office.findUnique({
    where: { slug },
    select: { name: true },
  })
  if (!office) return { title: 'Not Found' }
  return { title: `Blog | ${office.name}` }
}

export default async function BlogPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sp = await searchParams

  const office = await prisma.office.findUnique({
    where: { slug },
    select: { id: true, name: true, nameAr: true, defaultLanguage: true },
  })
  if (!office) return null

  const cookieStore = await cookies()
  const headerStore = await headers()
  const cookieLocale = cookieStore.get('locale')?.value
  const acceptLang = headerStore.get('accept-language')
  const browserLocale = acceptLang?.startsWith('ar') ? 'ar' : acceptLang?.startsWith('en') ? 'en' : undefined
  const locale = resolveLocale(cookieLocale || browserLocale || office.defaultLanguage)

  const categorySlug = (sp.category as string) || undefined
  const page = Math.max(1, parseInt((sp.page as string) || '1'))
  const pageSize = 9

  // Build where clause
  const where: any = {
    officeId: office.id,
    status: 'PUBLISHED',
  }

  if (categorySlug) {
    where.categories = {
      some: { category: { slug: categorySlug, officeId: office.id } },
    }
  }

  const [posts, total, categories] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: {
        categories: {
          include: { category: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.blogPost.count({ where }),
    prisma.blogCategory.findMany({
      where: { officeId: office.id },
      orderBy: { name: 'asc' },
    }),
  ])

  const serializedPosts = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: locale === 'ar' && p.titleAr ? p.titleAr : p.title,
    excerpt: locale === 'ar' && p.excerptAr ? p.excerptAr : p.excerpt,
    featuredImage: p.featuredImage,
    publishedAt: p.publishedAt?.toISOString() || null,
    categories: p.categories.map((c) => ({
      slug: c.category.slug,
      name: locale === 'ar' && c.category.nameAr ? c.category.nameAr : c.category.name,
    })),
  }))

  const serializedCategories = categories.map((c) => ({
    slug: c.slug,
    name: locale === 'ar' && c.nameAr ? c.nameAr : c.name,
  }))

  return (
    <BlogListClient
      officeSlug={slug}
      posts={serializedPosts}
      categories={serializedCategories}
      total={total}
      page={page}
      pageSize={pageSize}
      currentCategory={categorySlug || ''}
    />
  )
}
