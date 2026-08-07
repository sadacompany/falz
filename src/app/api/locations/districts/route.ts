import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth-utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')
    const user = await requireAuth()
    const officeId = user.memberships[0]?.officeId

    if (!cityId) {
      return NextResponse.json({ districts: [] })
    }

    // Fetch system districts (officeId === null) + custom office districts
    const districts = await prisma.saudiDistrict.findMany({
      where: {
        cityId,
        OR: [
          { officeId: null },
          ...(officeId ? [{ officeId }] : []),
        ],
      },
      orderBy: { nameAr: 'asc' },
    })

    return NextResponse.json({ districts })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'فشل تحميل الأحياء' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const officeId = user.memberships[0]?.officeId
    if (!officeId) {
      return NextResponse.json({ error: 'لم يتم العثور على عضوية مكتب' }, { status: 400 })
    }

    // Role gate: OWNER and MANAGER only
    await requireRole(officeId, ['OWNER', 'MANAGER'])

    const body = await request.json()
    const { cityId, nameAr, name, direction } = body

    if (!cityId || !nameAr) {
      return NextResponse.json({ error: 'المدينة واسم الحي إجباريان' }, { status: 400 })
    }

    // Check duplicate
    const existing = await prisma.saudiDistrict.findFirst({
      where: {
        cityId,
        nameAr: nameAr.trim(),
        officeId,
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'هذا الحي مضاف بالفعل لعلامتك التجارية' }, { status: 400 })
    }

    const district = await prisma.saudiDistrict.create({
      data: {
        cityId,
        officeId,
        nameAr: nameAr.trim(),
        name: name?.trim() || nameAr.trim(),
        direction: direction || null,
      },
    })

    return NextResponse.json({ district })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'فشل إضافة الحي' },
      { status: 400 }
    )
  }
}
