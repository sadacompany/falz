import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/visitor-auth'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('falz-visitor-token')?.value
  if (!token) {
    return NextResponse.json({ visitor: null })
  }

  const session = await verifyToken(token)
  return NextResponse.json({ visitor: session })
}
