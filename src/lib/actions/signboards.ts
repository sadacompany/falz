'use server'

import prisma from '@/lib/db'
import { requireAuth } from '@/lib/auth-utils'
import { tenantWhere } from '@/lib/tenant'
import { logAudit } from '@/lib/audit'
import type { Prisma } from '@prisma/client'

// ─── Types ──────────────────────────────────────────────────

export interface SignboardFilters {
  search?: string
  page?: number
  pageSize?: number
}

export interface CreateSignboardInput {
  title: string
  phone: string
  // W-12: Type status as an enum union instead of raw string
  status?: 'AVAILABLE' | 'INSTALLED' | 'MAINTENANCE' | 'REMOVED'
  notes?: string | null
  propertyId?: string | null
}

// ─── Helper: Get officeId from user ─────────────────────────

async function getOfficeId(): Promise<string> {
  const user = await requireAuth()
  const membership = user.memberships[0]
  if (!membership) throw new Error('No office membership found')
  return membership.officeId
}

// ─── Get Signboards List ────────────────────────────────────

export async function getSignboards(filters: SignboardFilters = {}) {
  const officeId = await getOfficeId()
  const { search, page = 1, pageSize = 20 } = filters

  const where: Prisma.SignboardWhereInput = {
    ...tenantWhere(officeId),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [signboards, total] = await Promise.all([
    prisma.signboard.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            titleAr: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.signboard.count({ where }),
  ])

  return {
    signboards,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}

// ─── Create Signboard ───────────────────────────────────────

export async function createSignboard(input: CreateSignboardInput) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  const signboard = await prisma.signboard.create({
    data: {
      officeId,
      title: input.title,
      phone: input.phone,
      status: input.status || 'AVAILABLE',
      notes: input.notes || null,
      propertyId: input.propertyId || null,
    },
  })

  await logAudit({
    officeId,
    userId: user.id,
    action: 'signboard_created',
    entity: 'Signboard',
    entityId: signboard.id,
    details: { title: signboard.title },
  }).catch(() => {})

  return signboard
}

// ─── Update Signboard ───────────────────────────────────────

export async function updateSignboard(id: string, input: Partial<CreateSignboardInput>) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  const existing = await prisma.signboard.findFirst({
    where: { id, ...tenantWhere(officeId) },
  })
  if (!existing) throw new Error('Signboard not found')

  const data: Prisma.SignboardUpdateInput = {}
  if (input.title !== undefined) data.title = input.title
  if (input.phone !== undefined) data.phone = input.phone
  if (input.status !== undefined) data.status = input.status
  if (input.notes !== undefined) data.notes = input.notes
  
  if (input.propertyId !== undefined) {
    if (input.propertyId) {
      data.property = { connect: { id: input.propertyId } }
    } else {
      data.property = { disconnect: true }
    }
  }

  // SEC-1: Include officeId in the final mutation to prevent TOCTOU race condition
  const signboard = await prisma.signboard.update({
    where: { id, officeId },
    data,
  })

  await logAudit({
    officeId,
    userId: user.id,
    action: 'signboard_updated',
    entity: 'Signboard',
    entityId: id,
    details: { title: signboard.title },
  }).catch(() => {})

  return signboard
}

// ─── Delete Signboard ───────────────────────────────────────

export async function deleteSignboard(id: string) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  const existing = await prisma.signboard.findFirst({
    where: { id, ...tenantWhere(officeId) },
  })
  if (!existing) throw new Error('Signboard not found')

  // SEC-1: Include officeId in the final mutation to prevent TOCTOU race condition
  await prisma.signboard.delete({
    where: { id, officeId },
  })

  await logAudit({
    officeId,
    userId: user.id,
    action: 'signboard_deleted',
    entity: 'Signboard',
    entityId: id,
    details: { title: existing.title },
  }).catch(() => {})

  return { success: true }
}
