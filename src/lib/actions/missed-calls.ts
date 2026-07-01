'use server'

import prisma from '@/lib/db'
import { requireAuth } from '@/lib/auth-utils'
import { tenantWhere } from '@/lib/tenant'
import { logAudit } from '@/lib/audit'
import type { Prisma } from '@prisma/client'

// ─── Helper: Get officeId from user ─────────────────────────

async function getOfficeId(): Promise<string> {
  const user = await requireAuth()
  const membership = user.memberships[0]
  if (!membership) throw new Error('No office membership found')
  return membership.officeId
}

// ─── Get Unresolved Missed Calls List ───────────────────────

export async function getMissedCalls() {
  const officeId = await getOfficeId()

  const calls = await prisma.missedCall.findMany({
    where: {
      ...tenantWhere(officeId),
      status: 'PENDING',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return calls
}

// ─── Create Missed Call ─────────────────────────────────────

// SEC-2: userId is no longer accepted from client — always derived from authenticated session
export async function createMissedCall(input: { phone: string }) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  const call = await prisma.missedCall.create({
    data: {
      officeId,
      phone: input.phone,
      userId: user.id,  // always from the authenticated session
      status: 'PENDING',
    },
  })

  await logAudit({
    officeId,
    userId: user.id,
    action: 'missed_call_created',
    entity: 'MissedCall',
    entityId: call.id,
    details: { phone: call.phone },
  }).catch(() => {})

  return call
}

// ─── Resolve Missed Call ────────────────────────────────────

export async function resolveMissedCall(id: string) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  const existing = await prisma.missedCall.findFirst({
    where: { id, ...tenantWhere(officeId) },
  })
  if (!existing) throw new Error('Missed call not found')

  // SEC-1: Include officeId in the final mutation to prevent TOCTOU race condition
  const call = await prisma.missedCall.update({
    where: { id, officeId },
    data: { status: 'RESOLVED' },
  })

  await logAudit({
    officeId,
    userId: user.id,
    action: 'missed_call_resolved',
    entity: 'MissedCall',
    entityId: id,
    details: { phone: call.phone },
  }).catch(() => {})

  return call
}
