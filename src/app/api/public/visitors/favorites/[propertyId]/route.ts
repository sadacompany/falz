import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getVisitorSession } from '@/lib/visitor-auth'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const session = await getVisitorSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { propertyId } = await params

  await prisma.favorite.deleteMany({
    where: { visitorId: session.id, propertyId },
  })

  return NextResponse.json({ success: true })
}
