import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { checkFeatureAccess } from '@/lib/billing'
import prisma from '@/lib/db'

// Theme colors
const COLORS = {
  primary: [11, 31, 59] as [number, number, number], // #0B1F3B
  accent: [201, 162, 39] as [number, number, number], // #C9A227
  bg: [10, 15, 24] as [number, number, number], // #0A0F18
  surface: [17, 24, 39] as [number, number, number], // #111827
  text: [248, 250, 252] as [number, number, number], // #F8FAFC
  muted: [138, 148, 166] as [number, number, number], // #8A94A6
  white: [255, 255, 255] as [number, number, number],
  dark: [30, 41, 59] as [number, number, number], // #1E293B
}

/**
 * GET /api/dashboard/analytics/export-pdf
 * Generates a PDF monthly report using jsPDF.
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

    // Check PDF reports feature access
    const access = await checkFeatureAccess(officeId, 'pdfReports')
    if (!access.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `PDF reports are not available on the ${access.planName} plan. Please upgrade to Pro or Enterprise.`,
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
    to.setHours(23, 59, 59, 999)

    // Fetch office info
    const office = await prisma.office.findUnique({
      where: { id: officeId },
      select: {
        name: true,
        nameAr: true,
        logo: true,
        slug: true,
      },
    })

    if (!office) {
      return NextResponse.json(
        { success: false, error: 'Office not found' },
        { status: 404 }
      )
    }

    // Fetch all analytics data
    const [
      pageViews,
      propertyViews,
      leadSubmits,
      whatsappClicks,
      phoneClicks,
      trafficSources,
      topProperties,
      leadSources,
      totalLeads,
    ] = await Promise.all([
      prisma.analyticsEvent.count({
        where: {
          officeId,
          eventType: 'page_view',
          createdAt: { gte: from, lte: to },
        },
      }),
      prisma.analyticsEvent.count({
        where: {
          officeId,
          eventType: 'property_view',
          createdAt: { gte: from, lte: to },
        },
      }),
      prisma.analyticsEvent.count({
        where: {
          officeId,
          eventType: 'lead_submit',
          createdAt: { gte: from, lte: to },
        },
      }),
      prisma.analyticsEvent.count({
        where: {
          officeId,
          eventType: 'whatsapp_click',
          createdAt: { gte: from, lte: to },
        },
      }),
      prisma.analyticsEvent.count({
        where: {
          officeId,
          eventType: 'phone_click',
          createdAt: { gte: from, lte: to },
        },
      }),
      // Traffic sources
      prisma.analyticsEvent.groupBy({
        by: ['referrerType'],
        where: {
          officeId,
          eventType: 'page_view',
          createdAt: { gte: from, lte: to },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      // Top properties
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
        take: 10,
      }),
      // Lead sources
      prisma.lead.groupBy({
        by: ['source'],
        where: {
          officeId,
          createdAt: { gte: from, lte: to },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.lead.count({
        where: {
          officeId,
          createdAt: { gte: from, lte: to },
        },
      }),
    ])

    // Fetch property names for top properties
    const topPropertyIds = topProperties
      .map((p) => p.propertyId)
      .filter(Boolean) as string[]

    const propertyDetails = topPropertyIds.length > 0
      ? await prisma.property.findMany({
          where: { id: { in: topPropertyIds } },
          select: {
            id: true,
            title: true,
            city: true,
            propertyType: true,
            dealType: true,
          },
        })
      : []

    const propertyMap = new Map(propertyDetails.map((p) => [p.id, p]))

    // ─── Generate PDF ────────────────────────────────────────

    const { jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20

    // ─── Header ──────────────────────────────────────────────

    // Background header bar
    doc.setFillColor(...COLORS.primary)
    doc.rect(0, 0, pageWidth, 45, 'F')

    // Gold accent line
    doc.setFillColor(...COLORS.accent)
    doc.rect(0, 45, pageWidth, 2, 'F')

    // Office name
    doc.setTextColor(...COLORS.white)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text(office.name, margin, 20)

    // Report subtitle
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COLORS.accent)
    doc.text('Analytics Report', margin, 28)

    // Date range
    doc.setFontSize(9)
    doc.setTextColor(200, 200, 200)
    const dateRange = `${from.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })} - ${to.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })}`
    doc.text(dateRange, margin, 36)

    // FALZ branding (right side)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.accent)
    doc.text('FALZ', pageWidth - margin, 20, { align: 'right' })
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(200, 200, 200)
    doc.text('Real Estate Platform', pageWidth - margin, 27, { align: 'right' })

    // Logo reference
    if (office.logo) {
      doc.setFontSize(7)
      doc.setTextColor(150, 150, 150)
      doc.text(`Logo: ${office.logo}`, pageWidth - margin, 34, { align: 'right' })
    }

    let yPos = 58

    // ─── Key Metrics Summary ─────────────────────────────────

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.primary)
    doc.text('Key Metrics', margin, yPos)
    yPos += 8

    const conversionRate = pageViews > 0
      ? ((totalLeads / pageViews) * 100).toFixed(1)
      : '0.0'

    const metrics = [
      { label: 'Page Views', value: pageViews.toLocaleString('en') },
      { label: 'Property Views', value: propertyViews.toLocaleString('en') },
      { label: 'Total Leads', value: totalLeads.toLocaleString('en') },
      { label: 'WhatsApp Clicks', value: whatsappClicks.toLocaleString('en') },
      { label: 'Phone Clicks', value: phoneClicks.toLocaleString('en') },
      { label: 'Conversion Rate', value: `${conversionRate}%` },
    ]

    // Draw metric boxes in a 3x2 grid
    const boxWidth = (pageWidth - 2 * margin - 10) / 3
    const boxHeight = 22

    metrics.forEach((metric, i) => {
      const col = i % 3
      const row = Math.floor(i / 3)
      const x = margin + col * (boxWidth + 5)
      const y = yPos + row * (boxHeight + 5)

      // Box background
      doc.setFillColor(245, 245, 250)
      doc.roundedRect(x, y, boxWidth, boxHeight, 3, 3, 'F')

      // Border
      doc.setDrawColor(220, 220, 230)
      doc.roundedRect(x, y, boxWidth, boxHeight, 3, 3, 'S')

      // Value
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...COLORS.primary)
      doc.text(metric.value, x + boxWidth / 2, y + 10, { align: 'center' })

      // Label
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 120)
      doc.text(metric.label, x + boxWidth / 2, y + 17, { align: 'center' })
    })

    yPos += 2 * (boxHeight + 5) + 12

    // ─── Top Properties Table ────────────────────────────────

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.primary)
    doc.text('Top Properties', margin, yPos)
    yPos += 4

    if (topProperties.length > 0) {
      const propertyTableData = topProperties.map((tp, i) => {
        const detail = propertyMap.get(tp.propertyId ?? '')
        return [
          String(i + 1),
          detail?.title || `Property ${tp.propertyId?.slice(0, 8)}...`,
          detail?.city || '-',
          detail?.propertyType || '-',
          detail?.dealType || '-',
          String(tp._count.id),
        ]
      })

      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Title', 'City', 'Type', 'Deal', 'Views']],
        body: propertyTableData,
        theme: 'striped',
        headStyles: {
          fillColor: COLORS.primary,
          textColor: COLORS.white,
          fontStyle: 'bold',
          fontSize: 8,
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [50, 50, 70],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 250],
        },
        margin: { left: margin, right: margin },
        columnStyles: {
          0: { cellWidth: 10 },
          5: { cellWidth: 18, halign: 'center' },
        },
      })

      // Get the final Y position after the table
      yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12
    } else {
      yPos += 4
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(150, 150, 150)
      doc.text('No property view data available for this period.', margin, yPos)
      yPos += 12
    }

    // ─── Check if we need a new page ─────────────────────────

    if (yPos > 230) {
      doc.addPage()
      yPos = 20
    }

    // ─── Lead Sources Breakdown ──────────────────────────────

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.primary)
    doc.text('Lead Sources', margin, yPos)
    yPos += 4

    if (leadSources.length > 0) {
      const sourceLabels: Record<string, string> = {
        CONTACT_FORM: 'Contact Form',
        PROPERTY_INQUIRY: 'Property Inquiry',
        WHATSAPP_CLICK: 'WhatsApp',
        PHONE_CLICK: 'Phone',
        MANUAL: 'Manual',
      }

      const leadSourceData = leadSources.map((ls) => {
        const percentage = totalLeads > 0
          ? ((ls._count.id / totalLeads) * 100).toFixed(1)
          : '0.0'

        return [
          sourceLabels[ls.source] || ls.source,
          String(ls._count.id),
          `${percentage}%`,
        ]
      })

      autoTable(doc, {
        startY: yPos,
        head: [['Source', 'Leads', 'Percentage']],
        body: leadSourceData,
        theme: 'striped',
        headStyles: {
          fillColor: COLORS.primary,
          textColor: COLORS.white,
          fontStyle: 'bold',
          fontSize: 8,
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [50, 50, 70],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 250],
        },
        margin: { left: margin, right: margin },
        columnStyles: {
          1: { halign: 'center', cellWidth: 25 },
          2: { halign: 'center', cellWidth: 30 },
        },
      })

      yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12
    } else {
      yPos += 4
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(150, 150, 150)
      doc.text('No lead data available for this period.', margin, yPos)
      yPos += 12
    }

    // ─── Check if we need a new page ─────────────────────────

    if (yPos > 230) {
      doc.addPage()
      yPos = 20
    }

    // ─── Traffic Sources ─────────────────────────────────────

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.primary)
    doc.text('Traffic Sources', margin, yPos)
    yPos += 4

    if (trafficSources.length > 0) {
      const totalTraffic = trafficSources.reduce((sum, ts) => sum + ts._count.id, 0)

      const trafficData = trafficSources.map((ts) => {
        const label = ts.referrerType || 'Direct'
        const percentage = totalTraffic > 0
          ? ((ts._count.id / totalTraffic) * 100).toFixed(1)
          : '0.0'

        return [
          label.charAt(0).toUpperCase() + label.slice(1),
          String(ts._count.id),
          `${percentage}%`,
        ]
      })

      autoTable(doc, {
        startY: yPos,
        head: [['Source', 'Visits', 'Percentage']],
        body: trafficData,
        theme: 'striped',
        headStyles: {
          fillColor: COLORS.primary,
          textColor: COLORS.white,
          fontStyle: 'bold',
          fontSize: 8,
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [50, 50, 70],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 250],
        },
        margin: { left: margin, right: margin },
        columnStyles: {
          1: { halign: 'center', cellWidth: 25 },
          2: { halign: 'center', cellWidth: 30 },
        },
      })

      yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12
    } else {
      yPos += 4
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(150, 150, 150)
      doc.text('No traffic source data available for this period.', margin, yPos)
      yPos += 12
    }

    // ─── Footer ──────────────────────────────────────────────

    const pageHeight = doc.internal.pageSize.getHeight()

    // Footer on each page
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)

      // Footer line
      doc.setDrawColor(...COLORS.accent)
      doc.setLineWidth(0.5)
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)

      // Footer text
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(150, 150, 150)
      doc.text(
        `Generated by FALZ Platform on ${new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}`,
        margin,
        pageHeight - 10
      )
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - margin,
        pageHeight - 10,
        { align: 'right' }
      )
    }

    // ─── Return PDF ──────────────────────────────────────────

    const pdfBuffer = doc.output('arraybuffer')
    const filename = `falz-report-${office.slug}-${from.toISOString().split('T')[0]}-to-${to.toISOString().split('T')[0]}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('PDF export error:', error)

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
