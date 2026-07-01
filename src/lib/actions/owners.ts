'use server'

import prisma from '@/lib/db'
import { requireAuth } from '@/lib/auth-utils'
import { tenantWhere } from '@/lib/tenant'
import { logAudit } from '@/lib/audit'
import type { Prisma, OwnerType } from '@prisma/client'

// ─── Types ──────────────────────────────────────────────────

export interface OwnerFilters {
  search?: string
  page?: number
  pageSize?: number
}

export interface CreateOwnerInput {
  name: string
  phone: string
  dob?: Date | string | null
  nationalId?: string | null
  type?: OwnerType
  notes?: string | null
  propertyIds?: string[]
}

// ─── Helper: Get officeId from user ─────────────────────────

async function getOfficeId(): Promise<string> {
  const user = await requireAuth()
  const membership = user.memberships[0]
  if (!membership) throw new Error('No office membership found')
  return membership.officeId
}

// ─── Get Owners List ────────────────────────────────────────

export async function getOwners(filters: OwnerFilters = {}) {
  const officeId = await getOfficeId()
  const { search, page = 1, pageSize = 20 } = filters

  const where: Prisma.PropertyOwnerWhereInput = {
    ...tenantWhere(officeId),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } },
        { nationalId: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [owners, total] = await Promise.all([
    prisma.propertyOwner.findMany({
      where,
      include: {
        _count: {
          select: { properties: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.propertyOwner.count({ where }),
  ])

  return {
    owners,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}

// ─── Get Single Owner Profile ───────────────────────────────

export async function getOwner(id: string) {
  const officeId = await getOfficeId()

  const owner = await prisma.propertyOwner.findFirst({
    where: {
      id,
      ...tenantWhere(officeId),
    },
    include: {
      properties: {
        include: {
          media: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
        },
      },
    },
  })

  return owner
}

// ─── Create Owner ───────────────────────────────────────────

export async function createOwner(input: CreateOwnerInput) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  // Check for duplicate phone in same office
  const existing = await prisma.propertyOwner.findUnique({
    where: {
      officeId_phone: {
        officeId,
        phone: input.phone,
      },
    },
  })

  if (existing) {
    throw new Error('رقم الهاتف مسجل بالفعل لمالك آخر في هذا المكتب')
  }

  const owner = await prisma.propertyOwner.create({
    data: {
      officeId,
      name: input.name,
      phone: input.phone,
      dob: input.dob ? new Date(input.dob) : null,
      nationalId: input.nationalId || null,
      type: input.type || 'OWNER',
      notes: input.notes || null,
    },
  })

  // Link properties if provided
  if (input.propertyIds && input.propertyIds.length > 0) {
    await prisma.property.updateMany({
      where: { id: { in: input.propertyIds }, officeId },
      data: { ownerId: owner.id },
    })
  }

  await logAudit({
    officeId,
    userId: user.id,
    action: 'owner_created',
    entity: 'PropertyOwner',
    entityId: owner.id,
    details: { name: owner.name, phone: owner.phone },
  }).catch(() => {})

  return owner
}

// ─── Update Owner ───────────────────────────────────────────

export async function updateOwner(id: string, input: Partial<CreateOwnerInput>) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  // Check if owner exists
  const existing = await prisma.propertyOwner.findFirst({
    where: { id, ...tenantWhere(officeId) },
  })
  if (!existing) throw new Error('Owner not found')

  // Check duplicate phone if phone is updated
  if (input.phone && input.phone !== existing.phone) {
    const duplicate = await prisma.propertyOwner.findUnique({
      where: {
        officeId_phone: {
          officeId,
          phone: input.phone,
        },
      },
    })
    if (duplicate) {
      throw new Error('رقم الهاتف مسجل بالفعل لمالك آخر في هذا المكتب')
    }
  }

  const data: Prisma.PropertyOwnerUpdateInput = {}
  if (input.name !== undefined) data.name = input.name
  if (input.phone !== undefined) data.phone = input.phone
  if (input.dob !== undefined) data.dob = input.dob ? new Date(input.dob) : null
  if (input.nationalId !== undefined) data.nationalId = input.nationalId
  if (input.type !== undefined) data.type = input.type
  if (input.notes !== undefined) data.notes = input.notes

  // SEC-1: Include officeId in the final mutation to prevent TOCTOU race condition
  const owner = await prisma.propertyOwner.update({
    where: { id, officeId },
    data,
  })

  // Link / Unlink properties if provided
  if (input.propertyIds !== undefined) {
    // Unlink old ones first
    await prisma.property.updateMany({
      where: { ownerId: id, officeId },
      data: { ownerId: null },
    })
    // Link new ones
    if (input.propertyIds.length > 0) {
      await prisma.property.updateMany({
        where: { id: { in: input.propertyIds }, officeId },
        data: { ownerId: id },
      })
    }
  }

  await logAudit({
    officeId,
    userId: user.id,
    action: 'owner_updated',
    entity: 'PropertyOwner',
    entityId: id,
    details: { name: owner.name },
  }).catch(() => {})

  return owner
}

// ─── Delete Owner ───────────────────────────────────────────

export async function deleteOwner(id: string) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  // Check if owner exists
  const existing = await prisma.propertyOwner.findFirst({
    where: { id, ...tenantWhere(officeId) },
  })
  if (!existing) throw new Error('Owner not found')

  // SEC-1: Include officeId in the final mutation to prevent TOCTOU race condition
  await prisma.propertyOwner.delete({
    where: { id, officeId },
  })

  await logAudit({
    officeId,
    userId: user.id,
    action: 'owner_deleted',
    entity: 'PropertyOwner',
    entityId: id,
    details: { name: existing.name },
  }).catch(() => {})

  return { success: true }
}
