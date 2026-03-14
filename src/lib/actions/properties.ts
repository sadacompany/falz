'use server'

import prisma from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth-utils'
import { tenantWhere } from '@/lib/tenant'
import { logAudit } from '@/lib/audit'
import { slugify } from '@/lib/utils'
import type { PropertyStatus, DealType, PropertyType, Prisma } from '@prisma/client'

// ─── Types ──────────────────────────────────────────────────

export interface PropertyFilters {
  status?: PropertyStatus
  dealType?: DealType
  propertyType?: PropertyType
  search?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface CreatePropertyInput {
  title: string
  titleAr?: string
  description?: string
  descriptionAr?: string
  price: number
  currency?: string
  dealType: DealType
  propertyType: PropertyType
  area?: number
  bedrooms?: number
  bathrooms?: number
  amenities?: string[]
  tags?: string[]
  isFeatured?: boolean
  city?: string
  cityAr?: string
  district?: string
  districtAr?: string
  street?: string
  streetAr?: string
  lat?: number
  lng?: number
  videoUrl?: string
  tour360Url?: string
  status?: PropertyStatus
  agentId?: string
  seoTitle?: string
  seoDescription?: string
}

// ─── Helper: Get officeId from user ─────────────────────────

async function getOfficeId(): Promise<string> {
  const user = await requireAuth()
  const membership = user.memberships[0]
  if (!membership) throw new Error('No office membership found')
  return membership.officeId
}

// ─── Get Properties List ────────────────────────────────────

export async function getProperties(filters: PropertyFilters = {}) {
  const officeId = await getOfficeId()
  const {
    status,
    dealType,
    propertyType,
    search,
    page = 1,
    pageSize = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = filters

  const where: Prisma.PropertyWhereInput = {
    ...tenantWhere(officeId),
    ...(status && { status }),
    ...(dealType && { dealType }),
    ...(propertyType && { propertyType }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { titleAr: { contains: search, mode: 'insensitive' as const } },
        { city: { contains: search, mode: 'insensitive' as const } },
        { district: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        media: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
        _count: {
          select: {
            leads: true,
            analyticsEvents: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.property.count({ where }),
  ])

  return {
    properties: properties.map((p) => ({
      ...p,
      price: p.price.toString(),
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}

// ─── Get Single Property ────────────────────────────────────

export async function getProperty(id: string) {
  const officeId = await getOfficeId()

  const property = await prisma.property.findFirst({
    where: {
      id,
      ...tenantWhere(officeId),
    },
    include: {
      media: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!property) return null

  return {
    ...property,
    price: property.price.toString(),
  }
}

// ─── Create Property ────────────────────────────────────────

export async function createProperty(input: CreatePropertyInput) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  const slug = slugify(input.title)

  // Check for duplicate slug within office
  const existingSlug = await prisma.property.findFirst({
    where: { officeId, slug },
    select: { id: true },
  })

  const finalSlug = existingSlug
    ? `${slug}-${Date.now().toString(36)}`
    : slug

  const property = await prisma.property.create({
    data: {
      officeId,
      title: input.title,
      titleAr: input.titleAr || null,
      slug: finalSlug,
      description: input.description || null,
      descriptionAr: input.descriptionAr || null,
      price: BigInt(input.price),
      currency: input.currency || 'SAR',
      dealType: input.dealType,
      propertyType: input.propertyType,
      area: input.area || null,
      bedrooms: input.bedrooms || null,
      bathrooms: input.bathrooms || null,
      amenities: input.amenities || [],
      tags: input.tags || [],
      isFeatured: input.isFeatured || false,
      city: input.city || null,
      cityAr: input.cityAr || null,
      district: input.district || null,
      districtAr: input.districtAr || null,
      street: input.street || null,
      streetAr: input.streetAr || null,
      lat: input.lat || null,
      lng: input.lng || null,
      videoUrl: input.videoUrl || null,
      tour360Url: input.tour360Url || null,
      status: input.status || 'DRAFT',
      agentId: input.agentId || null,
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
      publishedAt: input.status === 'PUBLISHED' ? new Date() : null,
    },
  })

  await logAudit({
    officeId,
    userId: user.id,
    action: 'property_created',
    entity: 'Property',
    entityId: property.id,
    details: { title: input.title },
  }).catch(() => {})

  return { ...property, price: property.price.toString() }
}

// ─── Update Property ────────────────────────────────────────

export async function updateProperty(id: string, input: Partial<CreatePropertyInput>) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  // Verify property belongs to office
  const existing = await prisma.property.findFirst({
    where: { id, ...tenantWhere(officeId) },
    select: { id: true, status: true },
  })

  if (!existing) throw new Error('Property not found')

  const data: Prisma.PropertyUpdateInput = {}

  if (input.title !== undefined) data.title = input.title
  if (input.titleAr !== undefined) data.titleAr = input.titleAr
  if (input.description !== undefined) data.description = input.description
  if (input.descriptionAr !== undefined) data.descriptionAr = input.descriptionAr
  if (input.price !== undefined) data.price = BigInt(input.price)
  if (input.currency !== undefined) data.currency = input.currency
  if (input.dealType !== undefined) data.dealType = input.dealType
  if (input.propertyType !== undefined) data.propertyType = input.propertyType
  if (input.area !== undefined) data.area = input.area
  if (input.bedrooms !== undefined) data.bedrooms = input.bedrooms
  if (input.bathrooms !== undefined) data.bathrooms = input.bathrooms
  if (input.amenities !== undefined) data.amenities = input.amenities
  if (input.tags !== undefined) data.tags = input.tags
  if (input.isFeatured !== undefined) data.isFeatured = input.isFeatured
  if (input.city !== undefined) data.city = input.city
  if (input.cityAr !== undefined) data.cityAr = input.cityAr
  if (input.district !== undefined) data.district = input.district
  if (input.districtAr !== undefined) data.districtAr = input.districtAr
  if (input.street !== undefined) data.street = input.street
  if (input.streetAr !== undefined) data.streetAr = input.streetAr
  if (input.lat !== undefined) data.lat = input.lat
  if (input.lng !== undefined) data.lng = input.lng
  if (input.videoUrl !== undefined) data.videoUrl = input.videoUrl
  if (input.tour360Url !== undefined) data.tour360Url = input.tour360Url
  if (input.agentId !== undefined) data.agentId = input.agentId
  if (input.seoTitle !== undefined) data.seoTitle = input.seoTitle
  if (input.seoDescription !== undefined) data.seoDescription = input.seoDescription

  if (input.status !== undefined) {
    data.status = input.status
    if (input.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      data.publishedAt = new Date()
    }
  }

  const property = await prisma.property.update({
    where: { id },
    data,
  })

  await logAudit({
    officeId,
    userId: user.id,
    action: 'property_updated',
    entity: 'Property',
    entityId: id,
  }).catch(() => {})

  return { ...property, price: property.price.toString() }
}

// ─── Delete Property ────────────────────────────────────────

export async function deleteProperty(id: string) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  await requireRole(officeId, ['OWNER', 'MANAGER'])

  const property = await prisma.property.findFirst({
    where: { id, ...tenantWhere(officeId) },
    select: { id: true },
  })

  if (!property) throw new Error('Property not found')

  await prisma.property.delete({ where: { id } })

  await logAudit({
    officeId,
    userId: user.id,
    action: 'property_deleted',
    entity: 'Property',
    entityId: id,
  }).catch(() => {})

  return { success: true }
}

// ─── Bulk Delete Properties ─────────────────────────────────

export async function bulkDeleteProperties(ids: string[]) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  await requireRole(officeId, ['OWNER', 'MANAGER'])

  await prisma.property.deleteMany({
    where: {
      id: { in: ids },
      ...tenantWhere(officeId),
    },
  })

  return { success: true }
}

// ─── Bulk Publish Properties ────────────────────────────────

export async function bulkPublishProperties(ids: string[]) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  await prisma.property.updateMany({
    where: {
      id: { in: ids },
      ...tenantWhere(officeId),
    },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })

  return { success: true }
}

// ─── Get Property Stats ─────────────────────────────────────

export async function getPropertyStats() {
  const officeId = await getOfficeId()

  const [total, published, draft, archived] = await Promise.all([
    prisma.property.count({ where: { ...tenantWhere(officeId) } }),
    prisma.property.count({ where: { ...tenantWhere(officeId), status: 'PUBLISHED' } }),
    prisma.property.count({ where: { ...tenantWhere(officeId), status: 'DRAFT' } }),
    prisma.property.count({ where: { ...tenantWhere(officeId), status: 'ARCHIVED' } }),
  ])

  return { total, published, draft, archived }
}

// ─── Get Agents for Assignment ──────────────────────────────

export async function getAgents() {
  const officeId = await getOfficeId()

  const memberships = await prisma.membership.findMany({
    where: {
      officeId,
      isActive: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  })

  return memberships.map((m) => ({
    id: m.user.id,
    name: m.user.name,
    email: m.user.email,
    avatar: m.user.avatar,
    role: m.role,
  }))
}
