import { NextRequest, NextResponse } from 'next/server'
import { toggleUserActive } from '@/lib/actions/admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Toggle user active status
    if (body.isActive !== undefined) {
      const result = await toggleUserActive(id)
      return NextResponse.json({ success: true, data: result })
    }

    return NextResponse.json(
      { success: false, error: 'No valid action specified' },
      { status: 400 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'

    if (message === 'Super admin access required' || message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: message },
        { status: 403 }
      )
    }

    if (message === 'Cannot toggle super admin accounts') {
      return NextResponse.json(
        { success: false, error: message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
