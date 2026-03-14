import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Email/password registration is no longer supported. Please use phone + OTP.' },
    { status: 410 }
  )
}
