import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const cities = await prisma.saudiCity.findMany({
      orderBy: { nameAr: 'asc' },
    })
    return NextResponse.json({ cities })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'فشل تحميل المدن' },
      { status: 500 }
    )
  }
}
