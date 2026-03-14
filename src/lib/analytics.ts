import type { Prisma } from '@prisma/client'
import prisma from '@/lib/db'
import { parseReferrer } from '@/lib/utils'
import type { AnalyticsEventData, AnalyticsEventType, ReferrerCategory } from '@/types'

// ─── Event Type Constants ───────────────────────────────────

export const EVENT_TYPES = {
  PAGE_VIEW: 'page_view',
  PROPERTY_VIEW: 'property_view',
  LEAD_SUBMIT: 'lead_submit',
  WHATSAPP_CLICK: 'whatsapp_click',
  PHONE_CLICK: 'phone_click',
  SHARE_CLICK: 'share_click',
  GALLERY_VIEW: 'gallery_view',
  TOUR360_VIEW: 'tour360_view',
  CONTACT_FORM_OPEN: 'contact_form_open',
  SEARCH: 'search',
} as const satisfies Record<string, AnalyticsEventType>

// ─── Track Event ────────────────────────────────────────────

/**
 * Track an analytics event. This is a fire-and-forget operation --
 * analytics tracking should never break the main request flow.
 *
 * @example
 * await trackEvent({
 *   officeId: 'office-id',
 *   propertyId: 'property-id',
 *   eventType: EVENT_TYPES.PROPERTY_VIEW,
 *   sessionId: 'session-id',
 *   visitorId: 'visitor-cookie-id',
 *   referrer: 'https://google.com',
 *   userAgent: request.headers.get('user-agent'),
 *   ip: '192.168.1.1',
 *   page: '/properties/luxury-villa',
 * })
 */
export async function trackEvent(data: AnalyticsEventData): Promise<void> {
  try {
    const referrerType = categorizeReferrer(data.referrer)

    await prisma.analyticsEvent.create({
      data: {
        officeId: data.officeId,
        propertyId: data.propertyId ?? null,
        eventType: data.eventType,
        sessionId: data.sessionId ?? null,
        visitorId: data.visitorId ?? null,
        referrer: data.referrer ?? null,
        referrerType,
        userAgent: data.userAgent ?? null,
        ip: data.ip ?? null,
        page: data.page ?? null,
        metadata: (data.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    })
  } catch (error) {
    // Analytics should never break the main flow.
    console.error('[Analytics] Failed to track event:', error)
  }
}

// ─── Categorize Referrer ────────────────────────────────────

/**
 * Categorize a referrer URL into a source type.
 * This is a convenience re-export of parseReferrer from utils.
 */
export function categorizeReferrer(
  referrer: string | null | undefined
): ReferrerCategory {
  return parseReferrer(referrer)
}
