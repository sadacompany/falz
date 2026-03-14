'use server'

import prisma from '@/lib/db'
import { requireSuperAdmin } from '@/lib/auth-utils'
import { cookies } from 'next/headers'

// ─── Types ────────────────────────────────────────────────────

interface AdminFilters {
  page?: number
  pageSize?: number
  search?: string
  action?: string
  dateFrom?: string
  dateTo?: string
}

// ─── getAdminStats ─────────────────────────────────────────────

export async function getAdminStats() {
  await requireSuperAdmin()

  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalOffices,
    totalUsers,
    totalProperties,
    totalLeads,
    recentOffices,
    subscriptions,
    totalRevenueResult,
    monthlyRevenueResult,
    paidInvoices,
    pendingInvoices,
  ] = await Promise.all([
    prisma.office.count(),
    prisma.user.count(),
    prisma.property.count(),
    prisma.lead.count(),

    // Recent signups (offices)
    prisma.office.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        slug: true,
        isApproved: true,
        isActive: true,
        createdAt: true,
        memberships: {
          where: { role: 'OWNER' },
          take: 1,
          select: {
            user: {
              select: { email: true },
            },
          },
        },
      },
    }),

    // Subscription distribution
    prisma.subscription.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIALING', 'GRACE_PERIOD'] },
      },
      select: {
        plan: {
          select: { name: true },
        },
      },
    }),

    // Total revenue (all paid invoices)
    prisma.invoice.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
    }),

    // Monthly revenue
    prisma.invoice.aggregate({
      where: {
        status: 'PAID',
        paidAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
    }),

    // Paid invoice count
    prisma.invoice.count({ where: { status: 'PAID' } }),

    // Pending invoice count
    prisma.invoice.count({ where: { status: 'PENDING' } }),
  ])

  // Build subscription distribution
  const planCounts = new Map<string, number>()
  subscriptions.forEach((sub) => {
    const name = sub.plan.name
    planCounts.set(name, (planCounts.get(name) || 0) + 1)
  })

  // Ensure all plans show up
  const allPlans = ['Basic', 'Pro', 'Enterprise']
  const subscriptionDistribution = allPlans.map((plan) => ({
    plan,
    count: planCounts.get(plan) || 0,
  }))

  return {
    totalOffices,
    totalUsers,
    totalProperties,
    totalLeads,
    subscriptionDistribution,
    totalRevenue: totalRevenueResult._sum.amount || 0,
    monthlyRevenue: monthlyRevenueResult._sum.amount || 0,
    paidInvoices,
    pendingInvoices,
    recentSignups: recentOffices.map((office) => ({
      id: office.id,
      name: office.name,
      slug: office.slug,
      isApproved: office.isApproved,
      ownerEmail: office.memberships[0]?.user?.email || null,
      createdAt: office.createdAt.toISOString(),
    })),
  }
}

// ─── getOffices ────────────────────────────────────────────────

export async function getOffices(filters: AdminFilters = {}) {
  await requireSuperAdmin()

  const { page = 1, pageSize = 20, search } = filters
  const skip = (page - 1) * pageSize

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { slug: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [offices, total] = await Promise.all([
    prisma.office.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        isApproved: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            memberships: true,
            properties: true,
          },
        },
        subscriptions: {
          where: {
            status: { in: ['ACTIVE', 'TRIALING', 'GRACE_PERIOD'] },
          },
          take: 1,
          select: {
            plan: {
              select: { name: true },
            },
          },
        },
      },
    }),
    prisma.office.count({ where }),
  ])

  return {
    data: offices.map((office) => ({
      id: office.id,
      name: office.name,
      slug: office.slug,
      plan: office.subscriptions[0]?.plan?.name || 'Basic',
      isApproved: office.isApproved,
      isActive: office.isActive,
      usersCount: office._count.memberships,
      propertiesCount: office._count.properties,
      createdAt: office.createdAt.toISOString(),
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}

// ─── approveOffice / disableOffice ────────────────────────────

export async function approveOffice(officeId: string) {
  const user = await requireSuperAdmin()

  await prisma.office.update({
    where: { id: officeId },
    data: { isApproved: true, isActive: true },
  })

  await prisma.auditLog.create({
    data: {
      officeId,
      userId: user.id,
      action: 'office_approved',
      entity: 'Office',
      entityId: officeId,
    },
  })

  return { success: true }
}

export async function disableOffice(officeId: string) {
  const user = await requireSuperAdmin()

  await prisma.office.update({
    where: { id: officeId },
    data: { isApproved: false, isActive: false },
  })

  await prisma.auditLog.create({
    data: {
      officeId,
      userId: user.id,
      action: 'office_disabled',
      entity: 'Office',
      entityId: officeId,
    },
  })

  return { success: true }
}

// ─── getOfficeDetail ──────────────────────────────────────────

export async function getOfficeDetail(officeId: string) {
  await requireSuperAdmin()

  const office = await prisma.office.findUnique({
    where: { id: officeId },
    select: {
      id: true,
      name: true,
      nameAr: true,
      slug: true,
      logo: true,
      email: true,
      phone: true,
      city: true,
      falLicenseNo: true,
      isApproved: true,
      isActive: true,
      createdAt: true,
      memberships: {
        select: {
          role: true,
          isActive: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              isActive: true,
              lastLoginAt: true,
            },
          },
        },
      },
      subscriptions: {
        where: {
          status: { in: ['ACTIVE', 'TRIALING', 'GRACE_PERIOD'] },
        },
        take: 1,
        include: {
          plan: {
            select: { name: true, slug: true },
          },
        },
      },
      _count: {
        select: {
          properties: true,
          leads: true,
        },
      },
    },
  })

  if (!office) return null

  const subscription = office.subscriptions[0]

  return {
    id: office.id,
    name: office.name,
    nameAr: office.nameAr,
    slug: office.slug,
    logo: office.logo,
    email: office.email,
    phone: office.phone,
    city: office.city,
    falLicenseNo: office.falLicenseNo,
    isApproved: office.isApproved,
    isActive: office.isActive,
    createdAt: office.createdAt.toISOString(),
    subscription: subscription
      ? {
          planName: subscription.plan.name,
          planSlug: subscription.plan.slug,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
        }
      : null,
    users: office.memberships.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      isActive: m.isActive && m.user.isActive,
      lastLoginAt: m.user.lastLoginAt?.toISOString() || null,
    })),
    propertiesCount: office._count.properties,
    leadsCount: office._count.leads,
  }
}

// ─── getUsers ──────────────────────────────────────────────────

export async function getUsers(filters: AdminFilters = {}) {
  await requireSuperAdmin()

  const { page = 1, pageSize = 20, search } = filters
  const skip = (page - 1) * pageSize

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isSuperAdmin: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        memberships: {
          select: {
            role: true,
            office: {
              select: { name: true },
            },
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ])

  return {
    data: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isSuperAdmin: user.isSuperAdmin,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
      createdAt: user.createdAt.toISOString(),
      memberships: user.memberships.map((m) => ({
        officeName: m.office.name,
        role: m.role,
      })),
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}

// ─── toggleUserActive ──────────────────────────────────────────

export async function toggleUserActive(userId: string) {
  const admin = await requireSuperAdmin()

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isActive: true, isSuperAdmin: true },
  })

  if (!user) throw new Error('User not found')
  if (user.isSuperAdmin) throw new Error('Cannot toggle super admin accounts')

  const newStatus = !user.isActive

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: newStatus },
  })

  // Create audit log for first available office membership
  const membership = await prisma.membership.findFirst({
    where: { userId },
    select: { officeId: true },
  })

  if (membership) {
    await prisma.auditLog.create({
      data: {
        officeId: membership.officeId,
        userId: admin.id,
        action: newStatus ? 'user_activated' : 'user_deactivated',
        entity: 'User',
        entityId: userId,
      },
    })
  }

  return { success: true, isActive: newStatus }
}

// ─── getPlans ──────────────────────────────────────────────────

export async function getPlans() {
  await requireSuperAdmin()

  const plans = await prisma.plan.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: {
          subscriptions: {
            where: {
              status: { in: ['ACTIVE', 'TRIALING', 'GRACE_PERIOD'] },
            },
          },
        },
      },
    },
  })

  return plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    slug: plan.slug,
    priceMonthly: plan.priceMonthly,
    priceYearly: plan.priceYearly,
    currency: plan.currency,
    maxListings: plan.maxListings,
    maxAgents: plan.maxAgents,
    maxMediaPerListing: plan.maxMediaPerListing,
    features: plan.features as Record<string, boolean>,
    isActive: plan.isActive,
    sortOrder: plan.sortOrder,
    _count: plan._count,
  }))
}

// ─── updatePlan ───────────────────────────────────────────────

export async function updatePlan(
  planId: string,
  data: {
    priceMonthly?: number
    priceYearly?: number
    maxListings?: number
    maxAgents?: number
    maxMediaPerListing?: number
    features?: Record<string, boolean>
    isActive?: boolean
  }
) {
  const admin = await requireSuperAdmin()

  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  })

  if (!plan) throw new Error('Plan not found')

  const updated = await prisma.plan.update({
    where: { id: planId },
    data: {
      ...(data.priceMonthly !== undefined && { priceMonthly: data.priceMonthly }),
      ...(data.priceYearly !== undefined && { priceYearly: data.priceYearly }),
      ...(data.maxListings !== undefined && { maxListings: data.maxListings }),
      ...(data.maxAgents !== undefined && { maxAgents: data.maxAgents }),
      ...(data.maxMediaPerListing !== undefined && {
        maxMediaPerListing: data.maxMediaPerListing,
      }),
      ...(data.features !== undefined && { features: data.features }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  })

  // Audit log (use a system office ID or first office)
  const firstOffice = await prisma.office.findFirst({ select: { id: true } })
  if (firstOffice) {
    await prisma.auditLog.create({
      data: {
        officeId: firstOffice.id,
        userId: admin.id,
        action: 'plan_updated',
        entity: 'Plan',
        entityId: planId,
        details: {
          planName: plan.name,
          changes: data,
        },
      },
    })
  }

  return {
    success: true,
    plan: updated,
  }
}

// ─── getAuditLogs ─────────────────────────────────────────────

export async function getAuditLogs(filters: AdminFilters = {}) {
  await requireSuperAdmin()

  const { page = 1, pageSize = 30, search, action, dateFrom, dateTo } = filters
  const skip = (page - 1) * pageSize

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      {
        office: {
          name: { contains: search, mode: 'insensitive' },
        },
      },
      {
        user: {
          name: { contains: search, mode: 'insensitive' },
        },
      },
    ]
  }

  if (action) {
    where.action = { contains: action, mode: 'insensitive' }
  }

  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) {
      (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom)
    }
    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(23, 59, 59, 999)
      ;(where.createdAt as Record<string, unknown>).lte = to
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        officeId: true,
        office: {
          select: { name: true },
        },
        userId: true,
        user: {
          select: { name: true },
        },
        action: true,
        entity: true,
        entityId: true,
        details: true,
        ip: true,
        createdAt: true,
      },
    }),
    prisma.auditLog.count({ where }),
  ])

  return {
    data: logs.map((log) => ({
      id: log.id,
      officeId: log.officeId,
      officeName: log.office.name,
      userId: log.userId,
      userName: log.user?.name || null,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      details: log.details as Record<string, unknown> | null,
      ip: log.ip,
      createdAt: log.createdAt.toISOString(),
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}

// ─── impersonateOffice ────────────────────────────────────────

export async function impersonateOffice(officeId: string) {
  const admin = await requireSuperAdmin()

  const office = await prisma.office.findUnique({
    where: { id: officeId },
    select: { id: true, name: true },
  })

  if (!office) throw new Error('Office not found')

  // Set impersonation cookie
  const cookieStore = await cookies()
  cookieStore.set('falz-impersonate-office', officeId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  })

  // Audit log
  await prisma.auditLog.create({
    data: {
      officeId,
      userId: admin.id,
      action: 'office_impersonated',
      entity: 'Office',
      entityId: officeId,
      details: {
        adminId: admin.id,
        adminEmail: admin.email,
        officeName: office.name,
      },
    },
  })

  return { success: true, officeName: office.name }
}
