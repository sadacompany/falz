import { NextRequest, NextResponse } from 'next/server'
import { getBillingProvider } from '@/lib/billing'

/**
 * POST /api/billing/webhook
 * Handles payment provider webhooks (mock, Moyasar, Stripe).
 * Updates subscription status and creates invoices.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    let payload: Record<string, unknown>

    try {
      payload = JSON.parse(rawBody)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    // Determine provider from header or payload
    const providerHeader = request.headers.get('x-billing-provider')
    const provider = getBillingProvider()

    // Check provider matches if header is present
    if (providerHeader && providerHeader !== provider.name) {
      console.warn(
        `Webhook provider mismatch: header=${providerHeader}, configured=${provider.name}`
      )
    }

    // Parse event type and external ID from different provider formats
    let eventType = ''
    let externalId = ''
    let metadata: Record<string, unknown> = {}

    // Stripe-style webhooks
    if (payload.type && typeof payload.type === 'string') {
      eventType = payload.type
      const data = payload.data as Record<string, unknown> | undefined
      const object = data?.object as Record<string, unknown> | undefined
      externalId = (object?.id as string) || ''
      metadata = (object?.metadata as Record<string, unknown>) || {}
    }
    // Moyasar-style webhooks
    else if (payload.type === undefined && payload.id) {
      eventType = (payload.status as string) || 'unknown'
      externalId = (payload.id as string) || ''
      metadata = (payload.metadata as Record<string, unknown>) || {}

      // Map Moyasar statuses to our event types
      const moyasarStatusMap: Record<string, string> = {
        paid: 'payment_paid',
        failed: 'payment_failed',
        refunded: 'payment_refunded',
      }
      eventType = moyasarStatusMap[eventType] || eventType
    }
    // Mock-style webhooks
    else if (payload.eventType) {
      eventType = payload.eventType as string
      externalId = (payload.externalId as string) || ''
      metadata = (payload.metadata as Record<string, unknown>) || {}
    }

    if (!eventType) {
      return NextResponse.json(
        { success: false, error: 'Could not determine event type from webhook payload' },
        { status: 400 }
      )
    }

    console.log(`[Billing Webhook] Provider: ${provider.name}, Event: ${eventType}, ExternalId: ${externalId}`)

    const result = await provider.handleWebhook({
      provider: provider.name,
      eventType,
      externalId,
      metadata,
      rawBody,
    })

    if (result.handled) {
      console.log(
        `[Billing Webhook] Handled: ${result.action}, Subscription: ${result.subscriptionId}`
      )
    } else {
      console.log(`[Billing Webhook] Event not handled: ${eventType}`)
    }

    return NextResponse.json({
      success: true,
      data: {
        handled: result.handled,
        action: result.action || null,
      },
    })
  } catch (error) {
    console.error('Billing webhook error:', error)

    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
