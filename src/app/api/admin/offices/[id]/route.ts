import { NextRequest, NextResponse } from 'next/server'
import { getOfficeDetail, approveOffice, disableOffice } from '@/lib/actions/admin'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const office = await getOfficeDetail(id)

    if (!office) {
      return NextResponse.json(
        { success: false, error: 'Office not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: office })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'

    if (message === 'Super admin access required' || message === 'Authentication required') {
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action } = body

    if (action === 'approve') {
      const result = await approveOffice(id)
      return NextResponse.json({ success: true, data: result })
    }

    if (action === 'disable') {
      const result = await disableOffice(id)
      return NextResponse.json({ success: true, data: result })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use "approve" or "disable".' },
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

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
