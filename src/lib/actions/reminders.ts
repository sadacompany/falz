'use server'

import prisma from '@/lib/db'
import { requireAuth } from '@/lib/auth-utils'
import { tenantWhere } from '@/lib/tenant'
import { logAudit } from '@/lib/audit'
import type { Prisma } from '@prisma/client'

async function getOfficeId(): Promise<string> {
  const user = await requireAuth()
  const membership = user.memberships[0]
  if (!membership) throw new Error('No office membership found')
  return membership.officeId
}

export async function getReminders() {
  const officeId = await getOfficeId()
  return prisma.reminder.findMany({
    where: tenantWhere(officeId),
    orderBy: { dueDate: 'asc' },
  })
}

export async function createReminder(input: {
  leadId?: string | null
  leadName: string
  leadPhone: string
  title: string
  dueDate: string | Date
  priority: string
}) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  const reminder = await prisma.reminder.create({
    data: {
      officeId,
      leadId: input.leadId || null,
      leadName: input.leadName,
      leadPhone: input.leadPhone,
      title: input.title,
      dueDate: new Date(input.dueDate),
      priority: input.priority || 'MEDIUM',
      completed: false,
    },
  })

  await logAudit({
    officeId,
    userId: user.id,
    action: 'reminder_created',
    entity: 'Reminder',
    entityId: reminder.id,
    details: { title: reminder.title },
  }).catch(() => {})

  return reminder
}

export async function toggleReminderCompleted(id: string, completed: boolean) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  const existing = await prisma.reminder.findFirst({
    where: { id, ...tenantWhere(officeId) },
  })
  if (!existing) throw new Error('Reminder not found')

  const updated = await prisma.reminder.update({
    where: { id, officeId },
    data: { completed },
  })

  await logAudit({
    officeId,
    userId: user.id,
    action: completed ? 'reminder_completed' : 'reminder_reopened',
    entity: 'Reminder',
    entityId: id,
  }).catch(() => {})

  return updated
}

export async function deleteReminder(id: string) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  const existing = await prisma.reminder.findFirst({
    where: { id, ...tenantWhere(officeId) },
  })
  if (!existing) throw new Error('Reminder not found')

  await prisma.reminder.delete({
    where: { id, officeId },
  })

  await logAudit({
    officeId,
    userId: user.id,
    action: 'reminder_deleted',
    entity: 'Reminder',
    entityId: id,
  }).catch(() => {})

  return { success: true }
}
