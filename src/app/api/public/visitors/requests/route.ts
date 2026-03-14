import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getVisitorSession } from '@/lib/visitor-auth'

export async function GET() {
  const session = await getVisitorSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const requests = await prisma.propertyRequest.findMany({
    where: { visitorId: session.id },
    include: {
      property: {
        select: {
          id: true, slug: true, title: true, titleAr: true,
          price: true, currency: true, dealType: true,
          media: { where: { type: 'IMAGE' }, orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    requests: requests.map((r) => ({
      id: r.id,
      propertyId: r.propertyId,
      type: r.type,
      message: r.message,
      response: r.response,
      respondedAt: r.respondedAt,
      status: r.status,
      createdAt: r.createdAt,
      property: {
        ...r.property,
        price: r.property.price.toString(),
      },
    })),
  })
}

export async function POST(req: NextRequest) {
  const session = await getVisitorSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { propertyId, type, message } = await req.json()

  if (!propertyId || !type) {
    return NextResponse.json({ error: 'propertyId and type are required' }, { status: 400 })
  }

  const validTypes = ['INTEREST', 'VIEWING', 'INFO']
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })
  }

  const request = await prisma.propertyRequest.create({
    data: {
      visitorId: session.id,
      propertyId,
      type,
      message: message || null,
      status: 'PENDING',
    },
  })

  return NextResponse.json({ success: true, request })
}
