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

// ─── Public Action: Visitor Submit Request ─────────────────

export async function createPublicPropertyRequest(input: {
  propertyId: string
  name: string
  phone: string
  email?: string
  type?: 'INTEREST' | 'VIEWING' | 'INFO'
  message?: string
}) {
  const { propertyId, name, phone, email, type = 'INTEREST', message } = input

  if (!propertyId || !name || !phone) {
    throw new Error('بيانات المشتري (الاسم ورقم الجوال) مطلوبة لتسجيل الطلب.')
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { officeId: true, title: true, titleAr: true, availability: true },
  })

  if (!property) {
    throw new Error('العقار غير موجود')
  }

  if (property.availability === 'RESERVED' || property.availability === 'SOLD' || property.availability === 'RENTED') {
    throw new Error('عذرًا، العقار غير متوفر حاليًا لتلقي الطلبات.')
  }

  // Find or create visitor for this office
  let visitor = await prisma.visitor.findFirst({
    where: { phone, officeId: property.officeId },
  })

  if (!visitor) {
    visitor = await prisma.visitor.create({
      data: {
        officeId: property.officeId,
        name,
        phone,
        email: email || null,
      },
    })
  }

  const newRequest = await prisma.propertyRequest.create({
    data: {
      visitorId: visitor.id,
      propertyId,
      type,
      message: message || null,
    },
  })

  // Create notification for office staff
  const members = await prisma.membership.findMany({
    where: { officeId: property.officeId, isActive: true },
    select: { userId: true },
  })

  const propTitle = property.titleAr || property.title
  for (const member of members) {
    await prisma.notification.create({
      data: {
        officeId: property.officeId,
        userId: member.userId,
        type: 'new_request',
        title: 'طلب جديد على عقار',
        titleAr: 'طلب جديد على عقار',
        message: `تم استقبال طلب جديد من ${name} (${phone}) على العقار "${propTitle}".`,
        messageAr: `تم استقبال طلب جديد من ${name} (${phone}) على العقار "${propTitle}".`,
        link: `/dashboard/requests`,
      },
    }).catch(() => {})
  }

  return newRequest
}
