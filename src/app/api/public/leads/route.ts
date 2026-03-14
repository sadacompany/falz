import { NextResponse, type NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { trackEvent, EVENT_TYPES } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { officeId, name, phone, email, message, source, propertyId } = body

    // ── Validation ──────────────────────────────────────────
    if (!officeId || typeof officeId !== 'string') {
      return NextResponse.json({ success: false, error: 'officeId is required' }, { status: 400 })
    }
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Name is required (min 2 chars)' }, { status: 400 })
    }
    if (!phone || typeof phone !== 'string' || phone.trim().length < 6) {
      return NextResponse.json({ success: false, error: 'Phone is required (min 6 chars)' }, { status: 400 })
    }

    // Validate source
    const validSources = ['CONTACT_FORM', 'PROPERTY_INQUIRY', 'WHATSAPP_CLICK', 'PHONE_CLICK', 'MANUAL']
    const leadSource = validSources.includes(source) ? source : 'CONTACT_FORM'

    // ── Verify office exists and is active ──────────────────
    const office = await prisma.office.findUnique({
      where: { id: officeId },
      select: { id: true, name: true, isActive: true, isApproved: true },
    })

    if (!office || !office.isActive || !office.isApproved) {
      return NextResponse.json({ success: false, error: 'Office not found' }, { status: 404 })
    }

    // ── Auto-assign to property agent if property is specified ──
    let agentId: string | null = null

    if (propertyId) {
      const property = await prisma.property.findFirst({
        where: { id: propertyId, officeId },
        select: { agentId: true },
      })
      if (property?.agentId) {
        agentId = property.agentId
      }
    }

    // If no agent from property, try to find the office owner
    if (!agentId) {
      const ownerMembership = await prisma.membership.findFirst({
        where: { officeId, role: 'OWNER', isActive: true },
        select: { userId: true },
      })
      if (ownerMembership) {
        agentId = ownerMembership.userId
      }
    }

    // ── Create lead ─────────────────────────────────────────
    const lead = await prisma.lead.create({
      data: {
        officeId,
        propertyId: propertyId || null,
        agentId,
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        message: message?.trim() || null,
        source: leadSource,
        status: 'NEW',
      },
    })

    // ── Create in-app notification for the assigned agent ───
    if (agentId) {
      await prisma.notification.create({
        data: {
          officeId,
          userId: agentId,
          type: 'lead_new',
          title: `New lead: ${name.trim()}`,
          titleAr: `عميل جديد: ${name.trim()}`,
          message: message?.trim() || `New inquiry via ${leadSource.toLowerCase().replace('_', ' ')}`,
          messageAr: message?.trim() || `استفسار جديد`,
          link: `/dashboard/leads/${lead.id}`,
        },
      }).catch(() => {
        // Notification creation should not break the lead flow
      })
    }

    // ── Track analytics event ───────────────────────────────
    trackEvent({
      officeId,
      propertyId: propertyId || null,
      eventType: EVENT_TYPES.LEAD_SUBMIT,
      page: request.headers.get('referer') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined,
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      data: { id: lead.id },
    }, { status: 201 })

  } catch (error) {
    console.error('[API] POST /api/public/leads error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
