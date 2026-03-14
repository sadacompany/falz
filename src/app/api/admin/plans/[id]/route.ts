import { NextRequest, NextResponse } from 'next/server'
import { updatePlan } from '@/lib/actions/admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const result = await updatePlan(id, {
      priceMonthly: body.priceMonthly,
      priceYearly: body.priceYearly,
      maxListings: body.maxListings,
      maxAgents: body.maxAgents,
      maxMediaPerListing: body.maxMediaPerListing,
      features: body.features,
      isActive: body.isActive,
    })

    return NextResponse.json({ success: true, data: result })
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
