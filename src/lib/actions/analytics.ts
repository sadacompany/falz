'use server'

import prisma from '@/lib/db'
import { requireAuth } from '@/lib/auth-utils'
import { tenantWhere } from '@/lib/tenant'

// ─── Helper ─────────────────────────────────────────────────

async function getOfficeId(): Promise<string> {
  const user = await requireAuth()
  const membership = user.memberships[0]
  if (!membership) throw new Error('No office membership found')
  return membership.officeId
}

// ─── Dashboard Overview Stats ───────────────────────────────

export async function getDashboardStats() {
  const officeId = await getOfficeId()

  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const sixtyDaysAgo = new Date(now)
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

  const [
    totalProperties,
    totalLeads,
    totalLeadsPrevious,
    totalViews,
    totalViewsPrevious,
    recentLeads,
    topProperties,
  ] = await Promise.all([
    // Total properties
    prisma.property.count({
      where: { ...tenantWhere(officeId), status: 'PUBLISHED' },
    }),

    // Total leads (last 30 days)
    prisma.lead.count({
      where: {
        ...tenantWhere(officeId),
        createdAt: { gte: thirtyDaysAgo },
      },
    }),

    // Total leads (previous 30 days for comparison)
    prisma.lead.count({
      where: {
        ...tenantWhere(officeId),
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
    }),

    // Total views (last 30 days)
    prisma.analyticsEvent.count({
      where: {
        ...tenantWhere(officeId),
        eventType: 'page_view',
        createdAt: { gte: thirtyDaysAgo },
      },
    }),

    // Total views (previous 30 days for comparison)
    prisma.analyticsEvent.count({
      where: {
        ...tenantWhere(officeId),
        eventType: 'page_view',
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
    }),

    // Recent leads (last 5)
    prisma.lead.findMany({
      where: { ...tenantWhere(officeId) },
      include: {
        property: {
          select: { id: true, title: true, titleAr: true },
        },
        agent: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),

    // Top properties by views (last 5)
    prisma.analyticsEvent.groupBy({
      by: ['propertyId'],
      where: {
        ...tenantWhere(officeId),
        eventType: 'property_view',
        propertyId: { not: null },
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
  ])

  // Fetch property details for top properties
  const topPropertyIds = topProperties
    .map((tp) => tp.propertyId)
    .filter(Boolean) as string[]

  const topPropertyDetails = topPropertyIds.length > 0
    ? await prisma.property.findMany({
        where: {
          id: { in: topPropertyIds },
          ...tenantWhere(officeId),
        },
        select: {
          id: true,
          title: true,
          titleAr: true,
          slug: true,
          media: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
            select: { url: true },
          },
        },
      })
    : []

  // Calculate conversion rate
  const conversionRate = totalViews > 0
    ? ((totalLeads / totalViews) * 100).toFixed(1)
    : '0.0'

  // Calculate change percentages
  const leadsChange = totalLeadsPrevious > 0
    ? (((totalLeads - totalLeadsPrevious) / totalLeadsPrevious) * 100).toFixed(1)
    : totalLeads > 0 ? '100.0' : '0.0'

  const viewsChange = totalViewsPrevious > 0
    ? (((totalViews - totalViewsPrevious) / totalViewsPrevious) * 100).toFixed(1)
    : totalViews > 0 ? '100.0' : '0.0'

  return {
    totalProperties,
    totalLeads,
    leadsChange: parseFloat(leadsChange),
    totalViews,
    viewsChange: parseFloat(viewsChange),
    conversionRate: parseFloat(conversionRate),
    recentLeads,
    topProperties: topProperties.map((tp) => {
      const detail = topPropertyDetails.find((p) => p.id === tp.propertyId)
      return {
        propertyId: tp.propertyId,
        views: tp._count.id,
        title: detail?.title || '',
        titleAr: detail?.titleAr || '',
        slug: detail?.slug || '',
        thumbnail: detail?.media[0]?.url || null,
      }
    }),
  }
}

// ─── Leads Over Time (Last 30 Days) ─────────────────────────

export async function getLeadsOverTime(days: number = 30) {
  const officeId = await getOfficeId()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const leads = await prisma.lead.findMany({
    where: {
      ...tenantWhere(officeId),
      createdAt: { gte: startDate },
    },
    select: {
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  // Group by date
  const dateMap = new Map<string, number>()

  // Initialize all dates
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    const key = date.toISOString().split('T')[0]
    dateMap.set(key, 0)
  }

  // Count leads per date
  leads.forEach((lead) => {
    const key = lead.createdAt.toISOString().split('T')[0]
    dateMap.set(key, (dateMap.get(key) || 0) + 1)
  })

  return Array.from(dateMap.entries()).map(([date, count]) => ({
    date,
    count,
  }))
}

// ─── Views by Property Type ─────────────────────────────────

export async function getViewsByPropertyType() {
  const officeId = await getOfficeId()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const events = await prisma.analyticsEvent.findMany({
    where: {
      ...tenantWhere(officeId),
      eventType: 'property_view',
      propertyId: { not: null },
      createdAt: { gte: thirtyDaysAgo },
    },
    select: {
      property: {
        select: { propertyType: true },
      },
    },
  })

  const typeCount = new Map<string, number>()
  events.forEach((e) => {
    if (e.property) {
      const type = e.property.propertyType
      typeCount.set(type, (typeCount.get(type) || 0) + 1)
    }
  })

  return Array.from(typeCount.entries()).map(([type, count]) => ({
    type,
    count,
  }))
}

// ─── Analytics Page: Full Stats ─────────────────────────────

export async function getAnalyticsData(days: number = 30) {
  const officeId = await getOfficeId()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const [
    visits,
    leads,
    whatsappClicks,
    phoneClicks,
    trafficSources,
    topProperties,
    cityDistribution,
  ] = await Promise.all([
    // Visits over time
    prisma.analyticsEvent.findMany({
      where: {
        ...tenantWhere(officeId),
        eventType: 'page_view',
        createdAt: { gte: startDate },
      },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),

    // Leads over time
    prisma.lead.findMany({
      where: {
        ...tenantWhere(officeId),
        createdAt: { gte: startDate },
      },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),

    // WhatsApp clicks
    prisma.analyticsEvent.count({
      where: {
        ...tenantWhere(officeId),
        eventType: 'whatsapp_click',
        createdAt: { gte: startDate },
      },
    }),

    // Phone clicks
    prisma.analyticsEvent.count({
      where: {
        ...tenantWhere(officeId),
        eventType: 'phone_click',
        createdAt: { gte: startDate },
      },
    }),

    // Traffic sources
    prisma.analyticsEvent.groupBy({
      by: ['referrerType'],
      where: {
        ...tenantWhere(officeId),
        eventType: 'page_view',
        createdAt: { gte: startDate },
      },
      _count: { id: true },
    }),

    // Top properties by views
    prisma.analyticsEvent.groupBy({
      by: ['propertyId'],
      where: {
        ...tenantWhere(officeId),
        eventType: 'property_view',
        propertyId: { not: null },
        createdAt: { gte: startDate },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),

    // City distribution
    prisma.analyticsEvent.groupBy({
      by: ['city'],
      where: {
        ...tenantWhere(officeId),
        eventType: 'page_view',
        city: { not: null },
        createdAt: { gte: startDate },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
  ])

  // Group visits by date
  const visitsByDate = groupByDate(
    visits.map((v) => v.createdAt),
    days
  )

  // Group leads by date
  const leadsByDate = groupByDate(
    leads.map((l) => l.createdAt),
    days
  )

  // Traffic source pie chart
  const trafficSourceData = trafficSources.map((ts) => ({
    source: ts.referrerType || 'direct',
    count: ts._count.id,
  }))

  // Fetch property details for top properties
  const topPropertyIds = topProperties
    .map((tp) => tp.propertyId)
    .filter(Boolean) as string[]

  const topPropertyDetails = topPropertyIds.length > 0
    ? await prisma.property.findMany({
        where: {
          id: { in: topPropertyIds },
          ...tenantWhere(officeId),
        },
        select: {
          id: true,
          title: true,
          titleAr: true,
        },
      })
    : []

  return {
    totalVisits: visits.length,
    totalLeads: leads.length,
    whatsappClicks,
    phoneClicks,
    conversionRate: visits.length > 0
      ? ((leads.length / visits.length) * 100).toFixed(1)
      : '0.0',
    visitsByDate,
    leadsByDate,
    trafficSourceData,
    topProperties: topProperties.map((tp) => {
      const detail = topPropertyDetails.find((p) => p.id === tp.propertyId)
      return {
        propertyId: tp.propertyId,
        views: tp._count.id,
        title: detail?.title || '',
        titleAr: detail?.titleAr || '',
      }
    }),
    cityDistribution: cityDistribution.map((c) => ({
      city: c.city || 'Unknown',
      count: c._count.id,
    })),
  }
}

// ─── Get Unread Notifications Count ─────────────────────────

export async function getUnreadNotificationsCount() {
  const user = await requireAuth()

  return prisma.notification.count({
    where: {
      userId: user.id,
      isRead: false,
    },
  })
}

// ─── Visitor Metrics ─────────────────────────────────────────

export async function getVisitorMetrics() {
  const officeId = await getOfficeId()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    totalVisitors,
    activeVisitors,
    totalFavorites,
    totalRequests,
    requestsByType,
    topFavoritedProperties,
  ] = await Promise.all([
    // Total registered visitors
    prisma.visitor.count({
      where: { officeId },
    }),

    // Active visitors (logged in within last 30 days)
    prisma.visitor.count({
      where: {
        officeId,
        lastLoginAt: { gte: thirtyDaysAgo },
      },
    }),

    // Total favorites
    prisma.favorite.count({
      where: {
        visitor: { officeId },
      },
    }),

    // Total property requests
    prisma.propertyRequest.count({
      where: {
        property: { ...tenantWhere(officeId) },
      },
    }),

    // Requests by type
    prisma.propertyRequest.groupBy({
      by: ['type'],
      where: {
        property: { ...tenantWhere(officeId) },
      },
      _count: { id: true },
    }),

    // Top 10 most favorited properties
    prisma.favorite.groupBy({
      by: ['propertyId'],
      where: {
        visitor: { officeId },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
  ])

  // Fetch property details for top favorited
  const topPropertyIds = topFavoritedProperties.map((f) => f.propertyId)
  const topPropertyDetails = topPropertyIds.length > 0
    ? await prisma.property.findMany({
        where: { id: { in: topPropertyIds } },
        select: { id: true, title: true, titleAr: true, slug: true },
      })
    : []

  return {
    totalVisitors,
    activeVisitors,
    totalFavorites,
    totalRequests,
    requestsByType: requestsByType.map((r) => ({
      type: r.type,
      count: r._count.id,
    })),
    topFavoritedProperties: topFavoritedProperties.map((f) => {
      const detail = topPropertyDetails.find((p) => p.id === f.propertyId)
      return {
        propertyId: f.propertyId,
        favorites: f._count.id,
        title: detail?.title || '',
        titleAr: detail?.titleAr || '',
        slug: detail?.slug || '',
      }
    }),
  }
}

// ─── Helper: Group Dates ────────────────────────────────────

function groupByDate(dates: Date[], days: number) {
  const dateMap = new Map<string, number>()

  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    const key = date.toISOString().split('T')[0]
    dateMap.set(key, 0)
  }

  dates.forEach((d) => {
    const key = d.toISOString().split('T')[0]
    dateMap.set(key, (dateMap.get(key) || 0) + 1)
  })

  return Array.from(dateMap.entries()).map(([date, count]) => ({
    date,
    count,
  }))
}
