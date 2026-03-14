import { NextResponse, type NextRequest } from 'next/server'
import { trackEvent } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { officeId, eventType, propertyId, page, referrer, visitorId } = body

    // Basic validation
    if (!officeId || typeof officeId !== 'string') {
      return NextResponse.json({ success: false, error: 'officeId is required' }, { status: 400 })
    }
    if (!eventType || typeof eventType !== 'string') {
      return NextResponse.json({ success: false, error: 'eventType is required' }, { status: 400 })
    }

    // Valid event types
    const validEvents = [
      'page_view', 'property_view', 'lead_submit', 'whatsapp_click',
      'phone_click', 'share_click', 'gallery_view', 'tour360_view',
      'contact_form_open', 'search',
    ]

    if (!validEvents.includes(eventType)) {
      return NextResponse.json({ success: false, error: 'Invalid eventType' }, { status: 400 })
    }

    // Fire-and-forget tracking
    await trackEvent({
      officeId,
      eventType,
      propertyId: propertyId || null,
      page: page || null,
      referrer: referrer || request.headers.get('referer') || null,
      visitorId: visitorId || null,
      userAgent: request.headers.get('user-agent') || null,
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] POST /api/public/analytics error:', error)
    // Analytics should never return errors to the client
    return NextResponse.json({ success: true })
  }
}
