import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { getBillingProvider } from '@/lib/billing'
import prisma from '@/lib/db'

/**
 * POST /api/billing/checkout
 * Creates or updates a subscription for an office.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    const body = await request.json()
    const { planSlug, billingCycle, officeId } = body as {
      planSlug: string
      billingCycle: 'monthly' | 'yearly'
      officeId: string
    }

    if (!planSlug || !billingCycle || !officeId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: planSlug, billingCycle, officeId' },
        { status: 400 }
      )
    }

    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return NextResponse.json(
        { success: false, error: 'billingCycle must be "monthly" or "yearly"' },
        { status: 400 }
      )
    }

    // Verify the user has access to this office (OWNER or MANAGER)
    const membership = user.memberships.find(
      (m) => m.officeId === officeId && m.isActive
    )

    if (!membership && !user.isSuperAdmin) {
      return NextResponse.json(
        { success: false, error: 'You do not have access to this office' },
        { status: 403 }
      )
    }

    if (membership && !['OWNER', 'MANAGER'].includes(membership.role) && !user.isSuperAdmin) {
      return NextResponse.json(
        { success: false, error: 'Only owners and managers can manage subscriptions' },
        { status: 403 }
      )
    }

    // Verify the plan exists
    const plan = await prisma.plan.findUnique({
      where: { slug: planSlug },
    })

    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { success: false, error: 'Plan not found or is not active' },
        { status: 404 }
      )
    }

    // Get the billing provider and create checkout
    const provider = getBillingProvider()
    const result = await provider.createCheckout({
      officeId,
      planSlug,
      billingCycle,
      userId: user.id,
    })

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        officeId,
        userId: user.id,
        action: 'subscription_created',
        entity: 'Subscription',
        entityId: result.subscriptionId,
        details: {
          planSlug,
          billingCycle,
          provider: provider.name,
          status: result.status,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        subscriptionId: result.subscriptionId,
        invoiceId: result.invoiceId,
        paymentUrl: result.paymentUrl || null,
        status: result.status,
      },
    })
  } catch (error) {
    console.error('Billing checkout error:', error)

    const message = error instanceof Error ? error.message : 'An unexpected error occurred'

    if (message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
