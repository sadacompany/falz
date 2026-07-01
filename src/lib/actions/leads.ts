'use server'

import prisma from '@/lib/db'
import { requireAuth } from '@/lib/auth-utils'
import { tenantWhere } from '@/lib/tenant'
import { logAudit } from '@/lib/audit'
import type { LeadStatus, LeadSource, PropertyCategory, DealType, PropertyType, Prisma } from '@prisma/client'

// ─── Types ──────────────────────────────────────────────────

export interface LeadFilters {
  status?: LeadStatus
  source?: LeadSource
  category?: PropertyCategory
  team?: string
  search?: string
  agentId?: string
  page?: number
  pageSize?: number
}

export interface CreateLeadInput {
  name: string
  phone?: string | null
  email?: string | null
  message?: string | null
  propertyId?: string | null
  agentId?: string | null
  source?: LeadSource
  category?: PropertyCategory | null
  dealOutcome?: string | null
  team?: string | null
  lastContactedAt?: Date | string | null
  reminderDate?: Date | string | null
  isReceived?: boolean
  city?: string | null
  reqDealType?: DealType | null
  reqPropertyType?: PropertyType | null
  reqDistrict?: string | null
  reqCity?: string | null
  reqBudget?: number | null
  reqRooms?: number | null
  reqArea?: number | null
  reqNotes?: string | null
}

// ─── Helper: Get officeId from user ─────────────────────────

async function getOfficeId(): Promise<string> {
  const user = await requireAuth()
  const membership = user.memberships[0]
  if (!membership) throw new Error('No office membership found')
  return membership.officeId
}

// ─── Get Leads List ─────────────────────────────────────────

export async function getLeads(filters: LeadFilters = {}) {
  const officeId = await getOfficeId()
  const {
    status,
    source,
    category,
    team,
    search,
    agentId,
    page = 1,
    pageSize = 20,
  } = filters

  const where: Prisma.LeadWhereInput = {
    ...tenantWhere(officeId),
    ...(status && { status }),
    ...(source && { source }),
    ...(category && { category }),
    ...(team && { team }),
    // Only add agentId filter when it is a non-empty string
    ...(agentId !== undefined && agentId !== '' && { agentId }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: {
        property: {
          select: { id: true, title: true, titleAr: true, slug: true, propertyType: true },
        },
        agent: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.lead.count({ where }),
  ])

  return {
    leads,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}

// ─── Get Single Lead ────────────────────────────────────────

export async function getLead(id: string) {
  const officeId = await getOfficeId()

  return prisma.lead.findFirst({
    where: {
      id,
      ...tenantWhere(officeId),
    },
    include: {
      property: {
        select: { id: true, title: true, titleAr: true, slug: true, propertyType: true },
      },
      agent: {
        select: { id: true, name: true, email: true, avatar: true },
      },
      activities: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

// ─── Create Lead (With Duplicate Phone Checking) ────────────

export async function createLead(input: CreateLeadInput) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  // Check if lead already exists by phone number in this office
  if (input.phone) {
    const existing = await prisma.lead.findFirst({
      where: {
        officeId,
        phone: input.phone,
      },
    })

    if (existing) {
      // Update existing lead with incoming fields and return it
      const updateData: Prisma.LeadUpdateInput = {}
      if (input.name !== undefined) updateData.name = input.name
      if (input.email !== undefined) updateData.email = input.email
      if (input.message !== undefined) updateData.message = input.message
      if (input.source !== undefined) updateData.source = input.source
      if (input.category !== undefined) updateData.category = input.category
      if (input.dealOutcome !== undefined) updateData.dealOutcome = input.dealOutcome
      if (input.team !== undefined) updateData.team = input.team
      if (input.lastContactedAt !== undefined) {
        updateData.lastContactedAt = input.lastContactedAt ? new Date(input.lastContactedAt) : null
      }
      if (input.reminderDate !== undefined) {
        updateData.reminderDate = input.reminderDate ? new Date(input.reminderDate) : null
      }
      if (input.isReceived !== undefined) updateData.isReceived = input.isReceived
      if (input.city !== undefined) updateData.city = input.city
      if (input.reqDealType !== undefined) updateData.reqDealType = input.reqDealType
      if (input.reqPropertyType !== undefined) updateData.reqPropertyType = input.reqPropertyType
      if (input.reqDistrict !== undefined) updateData.reqDistrict = input.reqDistrict
      if (input.reqCity !== undefined) updateData.reqCity = input.reqCity
      if (input.reqBudget !== undefined) updateData.reqBudget = input.reqBudget
      if (input.reqRooms !== undefined) updateData.reqRooms = input.reqRooms
      if (input.reqArea !== undefined) updateData.reqArea = input.reqArea
      if (input.reqNotes !== undefined) updateData.reqNotes = input.reqNotes

      if (input.propertyId !== undefined) {
        if (input.propertyId) {
          updateData.property = { connect: { id: input.propertyId } }
        } else {
          updateData.property = { disconnect: true }
        }
      }
      if (input.agentId !== undefined) {
        if (input.agentId) {
          updateData.agent = { connect: { id: input.agentId } }
        } else {
          updateData.agent = { disconnect: true }
        }
      }

      const updated = await prisma.lead.update({
        where: { id: existing.id },
        data: updateData,
      })

      await prisma.leadActivity.create({
        data: {
          leadId: updated.id,
          userId: user.id,
          type: 'note',
          content: 'تم تحديث بيانات العميل لوجود رقم هاتف مطابق مسجل مسبقاً',
        },
      }).catch(() => {})

      await logAudit({
        officeId,
        userId: user.id,
        action: 'lead_updated_duplicate',
        entity: 'Lead',
        entityId: updated.id,
        details: { phone: input.phone },
      }).catch(() => {})

      return updated
    }
  }

  // Create new lead if no duplicate phone
  const lead = await prisma.lead.create({
    data: {
      officeId,
      name: input.name,
      phone: input.phone || null,
      email: input.email || null,
      message: input.message || null,
      propertyId: input.propertyId || null,
      agentId: input.agentId || null,
      createdById: user.id,
      source: input.source || 'MANUAL',
      status: 'NEW',
      category: input.category || null,
      dealOutcome: input.dealOutcome || null,
      team: input.team || null,
      lastContactedAt: input.lastContactedAt ? new Date(input.lastContactedAt) : null,
      reminderDate: input.reminderDate ? new Date(input.reminderDate) : null,
      isReceived: input.isReceived || false,
      city: input.city || null,
      reqDealType: input.reqDealType || null,
      reqPropertyType: input.reqPropertyType || null,
      reqDistrict: input.reqDistrict || null,
      reqCity: input.reqCity || null,
      reqBudget: input.reqBudget || null,
      reqRooms: input.reqRooms || null,
      reqArea: input.reqArea || null,
      reqNotes: input.reqNotes || null,
    },
  })

  await logAudit({
    officeId,
    userId: user.id,
    action: 'lead_created',
    entity: 'Lead',
    entityId: lead.id,
    details: { name: lead.name, phone: lead.phone },
  }).catch(() => {})

  return lead
}

// ─── Update Lead Details (Generic) ──────────────────────────

export async function updateLead(id: string, input: Partial<CreateLeadInput>) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  const existing = await prisma.lead.findFirst({
    where: { id, ...tenantWhere(officeId) },
  })
  if (!existing) throw new Error('Lead not found')

  const data: Prisma.LeadUpdateInput = {}
  if (input.name !== undefined) data.name = input.name
  if (input.phone !== undefined) data.phone = input.phone
  if (input.email !== undefined) data.email = input.email
  if (input.message !== undefined) data.message = input.message
  if (input.source !== undefined) data.source = input.source
  if (input.category !== undefined) data.category = input.category
  if (input.dealOutcome !== undefined) data.dealOutcome = input.dealOutcome
  if (input.team !== undefined) data.team = input.team
  if (input.lastContactedAt !== undefined) {
    data.lastContactedAt = input.lastContactedAt ? new Date(input.lastContactedAt) : null
  }
  if (input.reminderDate !== undefined) {
    data.reminderDate = input.reminderDate ? new Date(input.reminderDate) : null
  }
  if (input.isReceived !== undefined) data.isReceived = input.isReceived
  if (input.city !== undefined) data.city = input.city
  if (input.reqDealType !== undefined) data.reqDealType = input.reqDealType
  if (input.reqPropertyType !== undefined) data.reqPropertyType = input.reqPropertyType
  if (input.reqDistrict !== undefined) data.reqDistrict = input.reqDistrict
  if (input.reqCity !== undefined) data.reqCity = input.reqCity
  if (input.reqBudget !== undefined) data.reqBudget = input.reqBudget
  if (input.reqRooms !== undefined) data.reqRooms = input.reqRooms
  if (input.reqArea !== undefined) data.reqArea = input.reqArea
  if (input.reqNotes !== undefined) data.reqNotes = input.reqNotes

  if (input.propertyId !== undefined) {
    if (input.propertyId) {
      data.property = { connect: { id: input.propertyId } }
    } else {
      data.property = { disconnect: true }
    }
  }
  if (input.agentId !== undefined) {
    if (input.agentId) {
      data.agent = { connect: { id: input.agentId } }
    } else {
      data.agent = { disconnect: true }
    }
  }

  // SEC-1: Include officeId in the final mutation to prevent TOCTOU race condition
  const updated = await prisma.lead.update({
    where: { id, officeId },
    data,
  })

  await logAudit({
    officeId,
    userId: user.id,
    action: 'lead_updated',
    entity: 'Lead',
    entityId: id,
  }).catch(() => {})

  return updated
}

// ─── Update Lead Status & Deal Outcome ──────────────────────

export async function updateLeadStatus(id: string, status: LeadStatus, dealOutcome?: string | null) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  const lead = await prisma.lead.findFirst({
    where: { id, ...tenantWhere(officeId) },
    select: { id: true, status: true },
  })

  if (!lead) throw new Error('Lead not found')

  const data: Prisma.LeadUpdateInput = { status }
  if (status === 'CLOSED') {
    data.dealOutcome = dealOutcome || null
  } else {
    data.dealOutcome = null
  }

  const [updatedLead] = await Promise.all([
    prisma.lead.update({
      where: { id },
      data,
    }),
    prisma.leadActivity.create({
      data: {
        leadId: id,
        userId: user.id,
        type: 'status_change',
        content: `تغيرت الحالة من ${lead.status} إلى ${status}${dealOutcome ? ` (${dealOutcome})` : ''}`,
        metadata: { from: lead.status, to: status, outcome: dealOutcome },
      },
    }),
  ])

  return updatedLead
}

// ─── Assign Agent to Lead ───────────────────────────────────

export async function assignLeadAgent(id: string, agentId: string | null) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  const lead = await prisma.lead.findFirst({
    where: { id, ...tenantWhere(officeId) },
    select: { id: true },
  })

  if (!lead) throw new Error('Lead not found')

  const [updatedLead] = await Promise.all([
    prisma.lead.update({
      where: { id },
      data: {
        agent: agentId ? { connect: { id: agentId } } : { disconnect: true },
        isReceived: agentId ? true : false,
      },
    }),
    prisma.leadActivity.create({
      data: {
        leadId: id,
        userId: user.id,
        type: 'assignment',
        content: agentId ? `تم تعيين وكيل` : 'تم إلغاء تعيين الوكيل',
        metadata: { agentId },
      },
    }),
  ])

  return updatedLead
}

// ─── Route Lead (Team Queue Routing) ────────────────────────

export async function routeLead(
  id: string,
  input: {
    team?: string | null
    agentId?: string | null
    isReceived?: boolean
  }
) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  const lead = await prisma.lead.findFirst({
    where: { id, ...tenantWhere(officeId) },
    select: { id: true },
  })

  if (!lead) throw new Error('Lead not found')

  const data: Prisma.LeadUpdateInput = {}
  
  if (input.team !== undefined) data.team = input.team
  if (input.isReceived !== undefined) data.isReceived = input.isReceived

  // Queue routing logic:
  // If team is assigned, clear agentId and set isReceived to false
  if (input.team) {
    data.agent = { disconnect: true }
    data.isReceived = false
  } else if (input.agentId !== undefined) {
    if (input.agentId) {
      data.isReceived = true
      data.agent = { connect: { id: input.agentId } }
      data.team = null
    } else {
      data.agent = { disconnect: true }
    }
  }

  const [updatedLead] = await Promise.all([
    prisma.lead.update({
      where: { id },
      data,
    }),
    prisma.leadActivity.create({
      data: {
        leadId: id,
        userId: user.id,
        type: 'assignment',
        content: input.agentId 
          ? `تم التوجيه المباشر للموظف` 
          : `تم توجيه الطلب إلى طابور قسم: ${data.team}`,
        metadata: { team: data.team, agentId: input.agentId, isReceived: data.isReceived },
      },
    }),
  ])

  return updatedLead
}

// ─── Add Note to Lead ───────────────────────────────────────

export async function addLeadNote(id: string, content: string) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  const lead = await prisma.lead.findFirst({
    where: { id, ...tenantWhere(officeId) },
    select: { id: true },
  })

  if (!lead) throw new Error('Lead not found')

  const activity = await prisma.leadActivity.create({
    data: {
      leadId: id,
      userId: user.id,
      type: 'note',
      content,
    },
    include: {
      user: {
        select: { id: true, name: true, avatar: true },
      },
    },
  })

  return activity
}

// ─── Get Lead Stats ─────────────────────────────────────────

export async function getLeadStats() {
  const officeId = await getOfficeId()

  const [total, newCount, contacted, qualified, closed] = await Promise.all([
    prisma.lead.count({ where: { ...tenantWhere(officeId) } }),
    prisma.lead.count({ where: { ...tenantWhere(officeId), status: 'NEW' } }),
    prisma.lead.count({ where: { ...tenantWhere(officeId), status: 'CONTACTED' } }),
    prisma.lead.count({ where: { ...tenantWhere(officeId), status: 'QUALIFIED' } }),
    prisma.lead.count({ where: { ...tenantWhere(officeId), status: 'CLOSED' } }),
  ])

  return { total, new: newCount, contacted, qualified, closed }
}

// ─── Get CRM Stats & Charts ─────────────────────────────────

export async function getCRMStats() {
  const officeId = await getOfficeId()

  // 1. Counts
  const [total, newCount, negotiatingCount, doneCount] = await Promise.all([
    prisma.lead.count({ where: { ...tenantWhere(officeId) } }),
    prisma.lead.count({ where: { ...tenantWhere(officeId), status: 'NEW' } }),
    prisma.lead.count({
      where: {
        ...tenantWhere(officeId),
        status: { in: ['CONTACTED', 'QUALIFIED'] },
      },
    }),
    prisma.lead.count({ where: { ...tenantWhere(officeId), status: 'CLOSED' } }),
  ])

  // 2. By Stage (Chart Data)
  const byStage = [
    { name: 'جديد', value: newCount },
    {
      name: 'جاري التواصل',
      value: await prisma.lead.count({ where: { ...tenantWhere(officeId), status: 'CONTACTED' } }),
    },
    {
      name: 'مؤهل',
      value: await prisma.lead.count({ where: { ...tenantWhere(officeId), status: 'QUALIFIED' } }),
    },
    { name: 'منتهي', value: doneCount },
  ]

  // 3. By Category (Chart Data)
  const [residentialCount, commercialCount, agriculturalCount, uncategorizedCount] = await Promise.all([
    prisma.lead.count({ where: { ...tenantWhere(officeId), category: 'RESIDENTIAL' } }),
    prisma.lead.count({ where: { ...tenantWhere(officeId), category: 'COMMERCIAL' } }),
    prisma.lead.count({ where: { ...tenantWhere(officeId), category: 'AGRICULTURAL' } }),
    prisma.lead.count({ where: { ...tenantWhere(officeId), category: null } }),
  ])

  const byCategory = [
    { name: 'سكني', value: residentialCount },
    { name: 'تجاري', value: commercialCount },
    { name: 'زراعي', value: agriculturalCount },
    { name: 'غير مصنف', value: uncategorizedCount },
  ]

  // 4. Closing Reasons (dealOutcome Chart Data)
  const leadsWithOutcome = await prisma.lead.findMany({
    where: {
      ...tenantWhere(officeId),
      status: 'CLOSED',
      dealOutcome: { not: null },
    },
    select: { dealOutcome: true },
  })

  const outcomeCounts: Record<string, number> = {}
  leadsWithOutcome.forEach((l) => {
    const outcome = l.dealOutcome || 'أخرى'
    outcomeCounts[outcome] = (outcomeCounts[outcome] || 0) + 1
  })

  const closingReasons = Object.entries(outcomeCounts).map(([reason, count]) => ({
    reason,
    count,
  }))

  // 5. Agent Rankings (CLOSED leads by agent)
  const memberships = await prisma.membership.findMany({
    where: { officeId, isActive: true },
    include: {
      user: {
        select: { id: true, name: true, nameAr: true },
      },
    },
  })

  const closedLeadsByAgent = await prisma.lead.groupBy({
    by: ['agentId'],
    where: {
      officeId,
      status: 'CLOSED',
      agentId: { not: null },
    },
    _count: {
      id: true,
    },
  })

  const agentClosedCountMap = new Map<string, number>()
  closedLeadsByAgent.forEach((group) => {
    if (group.agentId) {
      agentClosedCountMap.set(group.agentId, group._count.id)
    }
  })

  const agentRankings = memberships.map((m) => ({
    id: m.userId,
    name: m.user.nameAr || m.user.name,
    value: agentClosedCountMap.get(m.userId) || 0,
  }))

  agentRankings.sort((a, b) => b.value - a.value)

  return {
    counts: {
      total,
      new: newCount,
      negotiating: negotiatingCount,
      done: doneCount,
    },
    charts: {
      byStage,
      byCategory,
      closingReasons,
      agentRankings,
    },
  }
}

// ─── Get Linked Visitor Data ────────────────────────────

export async function getLinkedVisitorData(leadId: string) {
  const officeId = await getOfficeId()

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, ...tenantWhere(officeId) },
    select: { phone: true },
  })

  if (!lead?.phone) return null

  const visitor = await prisma.visitor.findFirst({
    where: { officeId, phone: lead.phone },
    include: {
      favorites: {
        include: {
          property: {
            select: { id: true, title: true, titleAr: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      requests: {
        include: {
          property: {
            select: { id: true, title: true, titleAr: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!visitor) return null

  return {
    visitor: {
      id: visitor.id,
      name: visitor.name,
      phone: visitor.phone,
      email: visitor.email,
      createdAt: visitor.createdAt,
      lastLoginAt: visitor.lastLoginAt,
    },
    favorites: visitor.favorites,
    requests: visitor.requests,
  }
}

// ─── Delete Lead ────────────────────────────────────────────

export async function deleteLead(id: string) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  const lead = await prisma.lead.findFirst({
    where: { id, ...tenantWhere(officeId) },
    select: { id: true },
  })

  if (!lead) throw new Error('Lead not found')

  // SEC-1: Include officeId in the final mutation to prevent TOCTOU race condition
  await prisma.lead.delete({ where: { id, officeId } })

  await logAudit({
    officeId,
    userId: user.id,
    action: 'lead_deleted',
    entity: 'Lead',
    entityId: id,
  }).catch(() => {})

  return { success: true }
}

// ─── Claim Lead (Queue) ─────────────────────────────────────

export async function claimLead(id: string) {
  const user = await requireAuth()
  return assignLeadAgent(id, user.id)
}

// ─── Get Leads Reports Data ─────────────────────────────────

export async function getLeadsReportsData() {
  const officeId = await getOfficeId()

  return prisma.lead.findMany({
    where: tenantWhere(officeId),
    take: 500, // DB-5: Limit returned rows to protect memory
    include: {
      property: {
        select: { id: true, title: true, titleAr: true, slug: true, propertyType: true },
      },
      agent: {
        select: { id: true, name: true, email: true, avatar: true },
      },
      activities: {
        where: { type: 'status_change' },
        select: {
          id: true,
          content: true,
          metadata: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' }, // Order by newest
  })
}
