'use server'

import prisma from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth-utils'
import { tenantWhere } from '@/lib/tenant'
import { logAudit } from '@/lib/audit'
import { slugify } from '@/lib/utils'
import type { PostStatus, Prisma } from '@prisma/client'

// ─── Types ──────────────────────────────────────────────────

export interface BlogPostFilters {
  status?: PostStatus
  search?: string
  categoryId?: string
  page?: number
  pageSize?: number
}

export interface CreateBlogPostInput {
  title: string
  titleAr?: string
  content: string
  contentAr?: string
  excerpt?: string
  excerptAr?: string
  featuredImage?: string
  status?: PostStatus
  seoTitle?: string
  seoDescription?: string
  categoryIds?: string[]
  tagIds?: string[]
}

// ─── Helper ─────────────────────────────────────────────────

async function getOfficeId(): Promise<string> {
  const user = await requireAuth()
  const membership = user.memberships[0]
  if (!membership) throw new Error('No office membership found')
  return membership.officeId
}

// ─── Get Blog Posts ─────────────────────────────────────────

export async function getBlogPosts(filters: BlogPostFilters = {}) {
  const officeId = await getOfficeId()
  const {
    status,
    search,
    categoryId,
    page = 1,
    pageSize = 20,
  } = filters

  const where: Prisma.BlogPostWhereInput = {
    ...tenantWhere(officeId),
    ...(status && { status }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { titleAr: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(categoryId && {
      categories: {
        some: { categoryId },
      },
    }),
  }

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: {
        categories: {
          include: {
            category: {
              select: { id: true, name: true, nameAr: true },
            },
          },
        },
        tags: {
          include: {
            tag: {
              select: { id: true, name: true, nameAr: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.blogPost.count({ where }),
  ])

  return {
    posts,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}

// ─── Get Single Blog Post ───────────────────────────────────

export async function getBlogPost(id: string) {
  const officeId = await getOfficeId()

  return prisma.blogPost.findFirst({
    where: {
      id,
      ...tenantWhere(officeId),
    },
    include: {
      categories: {
        include: {
          category: {
            select: { id: true, name: true, nameAr: true, slug: true },
          },
        },
      },
      tags: {
        include: {
          tag: {
            select: { id: true, name: true, nameAr: true, slug: true },
          },
        },
      },
    },
  })
}

// ─── Create Blog Post ───────────────────────────────────────

export async function createBlogPost(input: CreateBlogPostInput) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  const slug = slugify(input.title)

  const existingSlug = await prisma.blogPost.findFirst({
    where: { officeId, slug },
    select: { id: true },
  })

  const finalSlug = existingSlug
    ? `${slug}-${Date.now().toString(36)}`
    : slug

  const post = await prisma.blogPost.create({
    data: {
      officeId,
      title: input.title,
      titleAr: input.titleAr || null,
      slug: finalSlug,
      content: input.content,
      contentAr: input.contentAr || null,
      excerpt: input.excerpt || null,
      excerptAr: input.excerptAr || null,
      featuredImage: input.featuredImage || null,
      status: input.status || 'DRAFT',
      authorId: user.id,
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
      publishedAt: input.status === 'PUBLISHED' ? new Date() : null,
      categories: input.categoryIds?.length
        ? {
            create: input.categoryIds.map((categoryId) => ({
              categoryId,
            })),
          }
        : undefined,
      tags: input.tagIds?.length
        ? {
            create: input.tagIds.map((tagId) => ({
              tagId,
            })),
          }
        : undefined,
    },
  })

  await logAudit({
    officeId,
    userId: user.id,
    action: 'blog_post_created',
    entity: 'BlogPost',
    entityId: post.id,
    details: { title: input.title },
  }).catch(() => {})

  return post
}

// ─── Update Blog Post ───────────────────────────────────────

export async function updateBlogPost(id: string, input: Partial<CreateBlogPostInput>) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  const existing = await prisma.blogPost.findFirst({
    where: { id, ...tenantWhere(officeId) },
    select: { id: true, status: true },
  })

  if (!existing) throw new Error('Blog post not found')

  const data: Prisma.BlogPostUpdateInput = {}

  if (input.title !== undefined) data.title = input.title
  if (input.titleAr !== undefined) data.titleAr = input.titleAr
  if (input.content !== undefined) data.content = input.content
  if (input.contentAr !== undefined) data.contentAr = input.contentAr
  if (input.excerpt !== undefined) data.excerpt = input.excerpt
  if (input.excerptAr !== undefined) data.excerptAr = input.excerptAr
  if (input.featuredImage !== undefined) data.featuredImage = input.featuredImage
  if (input.seoTitle !== undefined) data.seoTitle = input.seoTitle
  if (input.seoDescription !== undefined) data.seoDescription = input.seoDescription

  if (input.status !== undefined) {
    data.status = input.status
    if (input.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      data.publishedAt = new Date()
    }
  }

  // Handle categories - delete old and create new
  if (input.categoryIds !== undefined) {
    await prisma.blogPostCategory.deleteMany({ where: { postId: id } })
    if (input.categoryIds.length > 0) {
      await prisma.blogPostCategory.createMany({
        data: input.categoryIds.map((categoryId) => ({
          postId: id,
          categoryId,
        })),
      })
    }
  }

  // Handle tags
  if (input.tagIds !== undefined) {
    await prisma.blogPostTag.deleteMany({ where: { postId: id } })
    if (input.tagIds.length > 0) {
      await prisma.blogPostTag.createMany({
        data: input.tagIds.map((tagId) => ({
          postId: id,
          tagId,
        })),
      })
    }
  }

  const post = await prisma.blogPost.update({
    where: { id },
    data,
  })

  return post
}

// ─── Delete Blog Post ───────────────────────────────────────

export async function deleteBlogPost(id: string) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  await requireRole(officeId, ['OWNER', 'MANAGER'])

  const post = await prisma.blogPost.findFirst({
    where: { id, ...tenantWhere(officeId) },
    select: { id: true },
  })

  if (!post) throw new Error('Blog post not found')

  await prisma.blogPost.delete({ where: { id } })

  return { success: true }
}

// ─── Get Blog Categories ────────────────────────────────────

export async function getBlogCategories() {
  const officeId = await getOfficeId()

  return prisma.blogCategory.findMany({
    where: { ...tenantWhere(officeId) },
    include: {
      _count: {
        select: { posts: true },
      },
    },
    orderBy: { name: 'asc' },
  })
}

// ─── Create Blog Category ───────────────────────────────────

export async function createBlogCategory(name: string, nameAr?: string) {
  const officeId = await getOfficeId()
  const slug = slugify(name)

  return prisma.blogCategory.create({
    data: {
      officeId,
      name,
      nameAr: nameAr || null,
      slug,
    },
  })
}

// ─── Get Blog Tags ──────────────────────────────────────────

export async function getBlogTags() {
  const officeId = await getOfficeId()

  return prisma.blogTag.findMany({
    where: { ...tenantWhere(officeId) },
    include: {
      _count: {
        select: { posts: true },
      },
    },
    orderBy: { name: 'asc' },
  })
}

// ─── Create Blog Tag ────────────────────────────────────────

export async function createBlogTag(name: string, nameAr?: string) {
  const officeId = await getOfficeId()
  const slug = slugify(name)

  return prisma.blogTag.create({
    data: {
      officeId,
      name,
      nameAr: nameAr || null,
      slug,
    },
  })
}
