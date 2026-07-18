'use server'

import prisma from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth-utils'
import { tenantWhere } from '@/lib/tenant'
import { logAudit } from '@/lib/audit'
import { slugify } from '@/lib/utils'
import type { PropertyStatus, DealType, PropertyType, PropertyCategory, Prisma, Availability, PricingModel, PaymentMethod } from '@prisma/client'

// ─── Types ──────────────────────────────────────────────────

export interface PropertyFilters {
  status?: PropertyStatus
  dealType?: DealType
  propertyType?: PropertyType
  category?: PropertyCategory
  subtypeId?: string
  paymentMethod?: 'CASH' | 'BANK_AND_CASH'
  search?: string
  page?: number
  pageSize?: number
  // SEC-3: sortBy is restricted to an allowlist to prevent Prisma query injection
  sortBy?: 'createdAt' | 'updatedAt' | 'price' | 'status' | 'title'
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
  category?: PropertyCategory
  subtypeId?: string | null
  ownerId?: string | null
  area?: number
  builtArea?: number
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
  availability?: Availability
  agentId?: string
  seoTitle?: string
  seoDescription?: string
  facing?: string
  streetWidth?: string
  age?: number
  floorNumber?: number
  borderNorth?: number
  borderSouth?: number
  borderEast?: number
  borderWest?: number
  internalNotes?: string
  pricingModel?: PricingModel
  paymentMethod?: PaymentMethod
  directionalArea?: string
  deedNumber?: string
  deedFile?: string
  marketingContractNumber?: string
  contractExpiryDate?: Date | string
  newBid?: {
    amount: number
    bidderName: string
    bidderPhone: string
    bidDate?: Date | string
  }
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
    category,
    subtypeId,
    paymentMethod,
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
    ...(category && { category }),
    ...(subtypeId && { subtypeId }),
    ...(paymentMethod === 'BANK_AND_CASH' && { paymentMethod: 'BANK_AND_CASH' }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { titleAr: { contains: search, mode: 'insensitive' as const } },
        { city: { contains: search, mode: 'insensitive' as const } },
        { district: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  // SEC-3: Validate sortBy against an explicit allowlist before using as a key
  const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'price', 'status', 'title'] as const
  const safeSortBy = sortBy && (ALLOWED_SORT_FIELDS as readonly string[]).includes(sortBy) ? sortBy : 'createdAt'

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        media: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
        owner: true,
        subtype: true,
        bids: {
          orderBy: { bidDate: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            leads: true,
            analyticsEvents: true,
          },
        },
      },
      orderBy: { [safeSortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.property.count({ where }),
  ])

  return {
    properties: properties.map((p) => ({
      ...p,
      price: p.price.toString(),
      bids: p.bids.map((b) => ({
        ...b,
        amount: b.amount.toString(),
      })),
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
      owner: true,
      subtype: true,
      bids: {
        orderBy: { bidDate: 'desc' },
      },
    },
  })

  if (!property) return null

  return {
    ...property,
    price: property.price.toString(),
    bids: property.bids.map((b) => ({
      ...b,
      amount: b.amount.toString(),
    })),
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

  const soldAt = input.availability === 'SOLD' ? new Date() : null

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
      category: input.category || 'RESIDENTIAL',
      ownerId: input.ownerId || null,
      area: input.area || null,
      builtArea: input.builtArea || null,
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
      // W-3: Use !== undefined instead of || to avoid erasing valid 0 coordinates
      lat: input.lat !== undefined ? input.lat : null,
      lng: input.lng !== undefined ? input.lng : null,
      videoUrl: input.videoUrl || null,
      tour360Url: input.tour360Url || null,
      status: input.status || 'DRAFT',
      availability: input.availability || 'AVAILABLE',
      agentId: input.agentId || null,
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
      publishedAt: input.status === 'PUBLISHED' ? new Date() : null,
      soldAt,
      facing: input.facing || null,
      streetWidth: input.streetWidth || null,
      age: input.age || null,
      floorNumber: input.floorNumber || null,
      borderNorth: input.borderNorth || null,
      borderSouth: input.borderSouth || null,
      borderEast: input.borderEast || null,
      borderWest: input.borderWest || null,
      internalNotes: input.internalNotes || null,
      pricingModel: input.pricingModel || 'LIMIT',
      paymentMethod: input.paymentMethod || 'BANK_AND_CASH',
      directionalArea: input.directionalArea || null,
      deedNumber: input.deedNumber || null,
      deedFile: input.deedFile || null,
      marketingContractNumber: input.marketingContractNumber || null,
      contractExpiryDate: input.contractExpiryDate ? new Date(input.contractExpiryDate) : null,
      subtypeId: input.subtypeId || null,
    },
  })

  // Create initial bid if provided
  if (input.pricingModel === 'BID' && input.newBid) {
    await prisma.propertyBid.create({
      data: {
        propertyId: property.id,
        amount: BigInt(input.newBid.amount),
        bidderName: input.newBid.bidderName,
        bidderPhone: input.newBid.bidderPhone,
        bidDate: input.newBid.bidDate ? new Date(input.newBid.bidDate) : new Date(),
      },
    })
  }

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
    select: { id: true, status: true, availability: true },
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
  if (input.category !== undefined) data.category = input.category
  if (input.area !== undefined) data.area = input.area
  if (input.builtArea !== undefined) data.builtArea = input.builtArea
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
  if (input.agentId !== undefined) {
    if (input.agentId) {
      data.agent = { connect: { id: input.agentId } }
    } else {
      data.agent = { disconnect: true }
    }
  }
  if (input.seoTitle !== undefined) data.seoTitle = input.seoTitle
  if (input.seoDescription !== undefined) data.seoDescription = input.seoDescription

  if (input.ownerId !== undefined) {
    if (input.ownerId) {
      data.owner = { connect: { id: input.ownerId } }
    } else {
      data.owner = { disconnect: true }
    }
  }

  if (input.status !== undefined) {
    data.status = input.status
    if (input.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      data.publishedAt = new Date()
    }
  }

  // Handle availability transitions and soldAt timestamp
  if (input.availability !== undefined) {
    data.availability = input.availability
    if (input.availability === 'SOLD' && existing.availability !== 'SOLD') {
      data.soldAt = new Date()
    } else if (input.availability !== 'SOLD' && existing.availability === 'SOLD') {
      data.soldAt = null
    }
  }

  // Map new custom specifications
  if (input.facing !== undefined) data.facing = input.facing
  if (input.streetWidth !== undefined) data.streetWidth = input.streetWidth
  if (input.age !== undefined) data.age = input.age
  if (input.floorNumber !== undefined) data.floorNumber = input.floorNumber
  if (input.borderNorth !== undefined) data.borderNorth = input.borderNorth
  if (input.borderSouth !== undefined) data.borderSouth = input.borderSouth
  if (input.borderEast !== undefined) data.borderEast = input.borderEast
  if (input.borderWest !== undefined) data.borderWest = input.borderWest
  if (input.internalNotes !== undefined) data.internalNotes = input.internalNotes
  if (input.pricingModel !== undefined) data.pricingModel = input.pricingModel
  if (input.paymentMethod !== undefined) data.paymentMethod = input.paymentMethod
  if (input.directionalArea !== undefined) data.directionalArea = input.directionalArea
  if (input.deedNumber !== undefined) data.deedNumber = input.deedNumber
  if (input.deedFile !== undefined) data.deedFile = input.deedFile
  if (input.marketingContractNumber !== undefined) data.marketingContractNumber = input.marketingContractNumber
  if (input.contractExpiryDate !== undefined) {
    data.contractExpiryDate = input.contractExpiryDate ? new Date(input.contractExpiryDate) : null
  }
  if (input.subtypeId !== undefined) {
    if (input.subtypeId) {
      data.subtype = { connect: { id: input.subtypeId } }
    } else {
      data.subtype = { disconnect: true }
    }
  }

  // SEC-1: Include officeId in the final mutation to prevent TOCTOU race condition
  const property = await prisma.property.update({
    where: { id, officeId },
    data,
  })

  // Create new bid if provided
  if (input.newBid) {
    await prisma.propertyBid.create({
      data: {
        propertyId: id,
        amount: BigInt(input.newBid.amount),
        bidderName: input.newBid.bidderName,
        bidderPhone: input.newBid.bidderPhone,
        bidDate: input.newBid.bidDate ? new Date(input.newBid.bidDate) : new Date(),
      },
    })
  }

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

  // SEC-1: Include officeId in the final mutation to prevent TOCTOU race condition
  await prisma.property.delete({ where: { id, officeId } })

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

  await requireRole(officeId, ['OWNER', 'MANAGER'])

  // SEC-4: Role check added — only OWNER/MANAGER can bulk-publish
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
