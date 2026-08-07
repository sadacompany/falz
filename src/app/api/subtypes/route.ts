import { NextResponse } from 'next/server'
import { getSubtypes, createSubtype } from '@/lib/actions/subtypes'
import type { PropertyCategory } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as PropertyCategory | null
    const list = await getSubtypes(category || undefined)
    return NextResponse.json({ subtypes: list })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'فشل تحميل التصنيفات الفرعية' },
      { status: 400 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, category } = body
    if (!name || !category) {
      return NextResponse.json(
        { error: 'الاسم والتصنيف الرئيسي مطلوبان' },
        { status: 400 }
      )
    }
    const subtype = await createSubtype(name, category as PropertyCategory)
    return NextResponse.json({ subtype })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'فشل إنشاء التصنيف الفرعي' },
      { status: 400 }
    )
  }
}
