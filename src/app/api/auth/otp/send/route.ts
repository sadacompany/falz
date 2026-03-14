import { NextRequest, NextResponse } from 'next/server'
import { sendOTP, normalizePhone } from '@/lib/twilio-verify'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'MISSING_PHONE' }, { status: 400 })
    }

    const normalized = normalizePhone(phone)
    const result = await sendOTP(normalized)

    if (!result.success) {
      return NextResponse.json({ error: 'SEND_FAILED' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[OTP Send] Error:', error)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
