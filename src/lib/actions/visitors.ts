'use server'

import prisma from '@/lib/db'
import { requireAuth } from '@/lib/auth-utils'
import { tenantWhere } from '@/lib/tenant'

async function getOfficeId(): Promise<string> {
  const user = await requireAuth()
  const membership = user.memberships[0]
  if (!membership) throw new Error('No office membership found')
  return membership.officeId
}

export async function getVisitors(params?: {
  page?: number
  limit?: number
  search?: string
}) {
  const officeId = await getOfficeId()
  const page = params?.page || 1
  const limit = params?.limit || 20
  const skip = (page - 1) * limit

  const where: any = { ...tenantWhere(officeId) }

  if (params?.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { phone: { contains: params.search, mode: 'insensitive' } },
      { email: { contains: params.search, mode: 'insensitive' } },
    ]
  }

  const [visitors, total] = await Promise.all([
    prisma.visitor.findMany({
      where,
      include: {
        _count: {
          select: { favorites: true, requests: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.visitor.count({ where }),
  ])

  return {
    visitors,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getVisitor(visitorId: string) {
  const officeId = await getOfficeId()

  const visitor = await prisma.visitor.findFirst({
    where: { id: visitorId, ...tenantWhere(officeId) },
    include: {
      favorites: {
        include: {
          property: {
            select: {
              id: true, title: true, titleAr: true, slug: true,
              price: true, currency: true, dealType: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      requests: {
        include: {
          property: {
            select: {
              id: true, title: true, titleAr: true, slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  return visitor
}

export async function getVisitorStats() {
  const officeId = await getOfficeId()
  const base = tenantWhere(officeId)

  const [total, active, withRequests, withFavorites] = await Promise.all([
    prisma.visitor.count({ where: base }),
    prisma.visitor.count({ where: { ...base, lastLoginAt: { not: null } } }),
    prisma.visitor.count({ where: { ...base, requests: { some: {} } } }),
    prisma.visitor.count({ where: { ...base, favorites: { some: {} } } }),
  ])

  return { total, active, withRequests, withFavorites }
}
