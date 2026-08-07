import { NextResponse } from 'next/server'
import { createPublicPropertyRequest } from '@/lib/actions/requests'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = await createPublicPropertyRequest(body)
    return NextResponse.json({ success: true, request: result })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إرسال الطلب' },
      { status: 400 }
    )
  }
}
