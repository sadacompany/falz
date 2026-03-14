import { NextRequest, NextResponse } from 'next/server'
import { verifyOTP, normalizePhone } from '@/lib/twilio-verify'
import prisma from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { phone, code, mode } = await request.json()

    if (!phone || !code) {
      return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 })
    }

    const normalized = normalizePhone(phone)
    const result = await verifyOTP(normalized, code)

    if (!result.success) {
      return NextResponse.json({ error: 'INVALID_OTP' }, { status: 400 })
    }

    // In "verify-only" mode (e.g. signup), just confirm the OTP is valid
    if (mode === 'verify-only') {
      return NextResponse.json({ success: true })
    }

    // Look up user by phone
    const user = await prisma.user.findUnique({
      where: { phone: normalized },
      select: { id: true, phone: true, name: true, email: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 })
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('[OTP Verify] Error:', error)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
