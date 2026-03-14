import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyOTP, normalizePhone } from '@/lib/twilio-verify'
import { signToken } from '@/lib/visitor-auth'
import prisma from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { phone, code, officeId, name } = await request.json()

    if (!phone || !code || !officeId) {
      return NextResponse.json({ error: 'Phone, code, and officeId are required' }, { status: 400 })
    }

    const normalized = normalizePhone(phone)
    const result = await verifyOTP(normalized, code)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Find or create visitor by phone + officeId
    let visitor = await prisma.visitor.findUnique({
      where: { officeId_phone: { officeId, phone: normalized } },
    })

    if (!visitor) {
      // Auto-register new visitor
      visitor = await prisma.visitor.create({
        data: {
          officeId,
          phone: normalized,
          name: name?.trim() || normalized,
        },
      })
    } else {
      // Update last login
      await prisma.visitor.update({
        where: { id: visitor.id },
        data: { lastLoginAt: new Date() },
      })
    }

    const session = {
      id: visitor.id,
      officeId: visitor.officeId,
      name: visitor.name,
      phone: visitor.phone,
    }

    const token = await signToken(session)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('falz-visitor-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    return NextResponse.json({ success: true, visitor: session })
  } catch (error) {
    console.error('[Visitor OTP Verify] Error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
