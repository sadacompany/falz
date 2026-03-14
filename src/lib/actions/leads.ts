'use server'

import prisma from '@/lib/db'
import { requireAuth } from '@/lib/auth-utils'
import { tenantWhere } from '@/lib/tenant'
import { logAudit } from '@/lib/audit'
import type { LeadStatus, LeadSource, Prisma } from '@prisma/client'

// ─── Types ──────────────────────────────────────────────────

export interface LeadFilters {
  status?: LeadStatus
  source?: LeadSource
  search?: string
  agentId?: string
  page?: number
  pageSize?: number
}

// ─── Helper ─────────────────────────────────────────────────

async function getOfficeId(): Promise<string> {
  const user = await requireAuth()
  const membership = user.memberships[0]
  if (!membership) throw new Error('No office membership found')
  return membership.officeId
}

// ─── Get Leads ──────────────────────────────────────────────

export async function getLeads(filters: LeadFilters = {}) {
  const officeId = await getOfficeId()
  const {
    status,
    source,
    search,
    agentId,
    page = 1,
    pageSize = 20,
  } = filters

  const where: Prisma.LeadWhereInput = {
    ...tenantWhere(officeId),
    ...(status && { status }),
    ...(source && { source }),
    ...(agentId && { agentId }),
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
          select: { id: true, title: true, titleAr: true, slug: true },
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
        select: { id: true, title: true, titleAr: true, slug: true },
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

// ─── Update Lead Status ─────────────────────────────────────

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  const lead = await prisma.lead.findFirst({
    where: { id, ...tenantWhere(officeId) },
    select: { id: true, status: true },
  })

  if (!lead) throw new Error('Lead not found')

  const [updatedLead] = await Promise.all([
    prisma.lead.update({
      where: { id },
      data: { status },
    }),
    prisma.leadActivity.create({
      data: {
        leadId: id,
        userId: user.id,
        type: 'status_change',
        content: `Status changed from ${lead.status} to ${status}`,
        metadata: { from: lead.status, to: status },
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
      data: { agentId },
    }),
    prisma.leadActivity.create({
      data: {
        leadId: id,
        userId: user.id,
        type: 'assignment',
        content: agentId ? `Agent assigned` : 'Agent unassigned',
        metadata: { agentId },
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

  await prisma.lead.delete({ where: { id } })

  await logAudit({
    officeId,
    userId: user.id,
    action: 'lead_deleted',
    entity: 'Lead',
    entityId: id,
  }).catch(() => {})

  return { success: true }
}
