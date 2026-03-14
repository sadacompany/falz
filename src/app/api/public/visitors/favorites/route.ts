import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getVisitorSession } from '@/lib/visitor-auth'

export async function GET() {
  const session = await getVisitorSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const favorites = await prisma.favorite.findMany({
    where: { visitorId: session.id },
    include: {
      property: {
        select: {
          id: true, slug: true, title: true, titleAr: true,
          price: true, currency: true, dealType: true, propertyType: true,
          city: true, cityAr: true, district: true, districtAr: true,
          bedrooms: true, bathrooms: true, area: true, isFeatured: true, availability: true,
          officeId: true,
          media: { where: { type: 'IMAGE' }, orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true, alt: true, altAr: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    favorites: favorites.map((f) => ({
      id: f.id,
      propertyId: f.propertyId,
      createdAt: f.createdAt,
      property: {
        ...f.property,
        price: f.property.price.toString(),
      },
    })),
  })
}

export async function POST(req: NextRequest) {
  const session = await getVisitorSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { propertyId } = await req.json()
  if (!propertyId) return NextResponse.json({ error: 'propertyId required' }, { status: 400 })

  try {
    const favorite = await prisma.favorite.create({
      data: { visitorId: session.id, propertyId },
    })
    return NextResponse.json({ success: true, favorite })
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Already favorited' }, { status: 409 })
    }
    throw e
  }
}
