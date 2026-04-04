import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { checkFeatureAccess } from '@/lib/billing'
import prisma from '@/lib/db'

/**
 * GET /api/dashboard/analytics/export-csv
 * Exports analytics data as CSV file for the office.
 * Query params: from, to (ISO date strings)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const membership = user.memberships[0]

    if (!membership) {
      return NextResponse.json(
        { success: false, error: 'No office membership found' },
        { status: 403 }
      )
    }

    const officeId = membership.officeId

    // Check CSV export feature access
    const access = await checkFeatureAccess(officeId, 'csvExport')
    if (!access.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `CSV export is not available on the ${access.planName} plan. Please upgrade to Pro or Enterprise.`,
        },
        { status: 403 }
      )
    }

    // Parse date range
    const { searchParams } = new URL(request.url)
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')

    const now = new Date()
    const from = fromParam ? new Date(fromParam) : new Date(now.getFullYear(), now.getMonth(), 1)
    const to = toParam ? new Date(toParam) : now

    // Ensure 'to' covers the entire day
    to.setHours(23, 59, 59, 999)

    // Fetch analytics data
    const [events, leads, properties] = await Promise.all([
      // Page views and events
      prisma.analyticsEvent.findMany({
        where: {
          officeId,
          createdAt: { gte: from, lte: to },
        },
        select: {
          eventType: true,
          page: true,
          referrer: true,
          referrerType: true,
          city: true,
          propertyId: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Leads
      prisma.lead.findMany({
        where: {
          officeId,
          createdAt: { gte: from, lte: to },
        },
        select: {
          name: true,
          email: true,
          phone: true,
          source: true,
          status: true,
          property: {
            select: { title: true },
          },
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Top viewed properties
      prisma.analyticsEvent.groupBy({
        by: ['propertyId'],
        where: {
          officeId,
          eventType: 'property_view',
          propertyId: { not: null },
          createdAt: { gte: from, lte: to },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 50,
      }),
    ])

    // Fetch property names
    const propertyIds = properties
      .map((p) => p.propertyId)
      .filter(Boolean) as string[]

    const propertyNames = propertyIds.length > 0
      ? await prisma.property.findMany({
          where: { id: { in: propertyIds } },
          select: { id: true, title: true },
        })
      : []

    const propertyNameMap = new Map(propertyNames.map((p) => [p.id, p.title]))

    // ─── Generate CSV Sheets ─────────────────────────────────

    // Sheet 1: Summary
    const summaryRows = [
      ['Metric', 'Value'],
      ['Date Range', `${from.toISOString().split('T')[0]} to ${to.toISOString().split('T')[0]}`],
      ['Total Page Views', String(events.filter((e) => e.eventType === 'page_view').length)],
      ['Total Property Views', String(events.filter((e) => e.eventType === 'property_view').length)],
      ['Total Leads', String(leads.length)],
      ['WhatsApp Clicks', String(events.filter((e) => e.eventType === 'whatsapp_click').length)],
      ['Phone Clicks', String(events.filter((e) => e.eventType === 'phone_click').length)],
    ]

    // Sheet 2: Events (detailed)
    const eventRows = [
      ['Date', 'Event Type', 'Page', 'Referrer', 'Referrer Type', 'City', 'Property ID'],
      ...events.map((e) => [
        e.createdAt.toISOString(),
        e.eventType,
        e.page || '',
        e.referrer || '',
        e.referrerType || 'direct',
        e.city || '',
        e.propertyId || '',
      ]),
    ]

    // Sheet 3: Leads
    const leadRows = [
      ['Date', 'Name', 'Email', 'Phone', 'Source', 'Status', 'Property'],
      ...leads.map((l) => [
        l.createdAt.toISOString(),
        l.name,
        l.email || '',
        l.phone || '',
        l.source,
        l.status,
        l.property?.title || '',
      ]),
    ]

    // Sheet 4: Top Properties
    const topPropertyRows = [
      ['Property', 'Views'],
      ...properties.map((p) => [
        propertyNameMap.get(p.propertyId ?? '') || p.propertyId || 'Unknown',
        String(p._count.id),
      ]),
    ]

    // Combine all sheets with section headers
    const allRows = [
      ['=== ANALYTICS SUMMARY ==='],
      ...summaryRows,
      [],
      ['=== EVENT LOG ==='],
      ...eventRows,
      [],
      ['=== LEADS ==='],
      ...leadRows,
      [],
      ['=== TOP PROPERTIES ==='],
      ...topPropertyRows,
    ]

    const { stringify } = await import('csv-stringify/sync')
    const csv = stringify(allRows)

    const filename = `falz-analytics-${from.toISOString().split('T')[0]}-to-${to.toISOString().split('T')[0]}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('CSV export error:', error)

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
