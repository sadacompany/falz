import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAuth } from '@/lib/auth-utils'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    if (!user.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { isRead, notes } = body

    const message = await prisma.contactMessage.update({
      where: { id },
      data: {
        ...(isRead !== undefined && { isRead }),
        ...(notes !== undefined && { notes }),
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Admin message update error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
