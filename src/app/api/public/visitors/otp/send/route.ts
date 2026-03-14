import { NextRequest, NextResponse } from 'next/server'
import { sendOTP, normalizePhone } from '@/lib/twilio-verify'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const normalized = normalizePhone(phone)
    const result = await sendOTP(normalized)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Visitor OTP Send] Error:', error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
