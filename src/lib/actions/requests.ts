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

export async function getPropertyRequests(params?: {
  page?: number
  limit?: number
  status?: string
  type?: string
  search?: string
}) {
  const officeId = await getOfficeId()
  const page = params?.page || 1
  const limit = params?.limit || 20
  const skip = (page - 1) * limit

  const where: any = {}

  // Filter by property belonging to this office
  where.property = { ...tenantWhere(officeId) }

  if (params?.status && params.status !== 'ALL') {
    where.status = params.status
  }

  if (params?.type && params.type !== 'ALL') {
    where.type = params.type
  }

  if (params?.search) {
    where.OR = [
      { visitor: { name: { contains: params.search, mode: 'insensitive' } } },
      { visitor: { email: { contains: params.search, mode: 'insensitive' } } },
      { property: { title: { contains: params.search, mode: 'insensitive' } } },
    ]
  }

  const [requests, total] = await Promise.all([
    prisma.propertyRequest.findMany({
      where,
      include: {
        visitor: {
          select: { id: true, name: true, email: true, phone: true },
        },
        property: {
          select: { id: true, title: true, titleAr: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.propertyRequest.count({ where }),
  ])

  return {
    requests,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

export async function updateRequestStatus(requestId: string, status: 'PENDING' | 'RESPONDED' | 'CLOSED') {
  const officeId = await getOfficeId()

  // Verify request belongs to a property owned by this office
  const request = await prisma.propertyRequest.findFirst({
    where: {
      id: requestId,
      property: { ...tenantWhere(officeId) },
    },
  })

  if (!request) throw new Error('Request not found')

  return prisma.propertyRequest.update({
    where: { id: requestId },
    data: { status },
  })
}

export async function respondToRequest(requestId: string, response: string) {
  const officeId = await getOfficeId()

  const request = await prisma.propertyRequest.findFirst({
    where: {
      id: requestId,
      property: { ...tenantWhere(officeId) },
    },
  })

  if (!request) throw new Error('Request not found')

  return prisma.propertyRequest.update({
    where: { id: requestId },
    data: { response, respondedAt: new Date(), status: 'RESPONDED' },
  })
}

export async function getRequestStats() {
  const officeId = await getOfficeId()

  const [total, pending, responded, closed] = await Promise.all([
    prisma.propertyRequest.count({ where: { property: { ...tenantWhere(officeId) } } }),
    prisma.propertyRequest.count({ where: { property: { ...tenantWhere(officeId) }, status: 'PENDING' } }),
    prisma.propertyRequest.count({ where: { property: { ...tenantWhere(officeId) }, status: 'RESPONDED' } }),
    prisma.propertyRequest.count({ where: { property: { ...tenantWhere(officeId) }, status: 'CLOSED' } }),
  ])

  return { total, pending, responded, closed }
}
