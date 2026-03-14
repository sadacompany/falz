import type { Prisma } from '@prisma/client'
import prisma from '@/lib/db'
import type { AuditLogEntry } from '@/types'

/**
 * Create an audit log entry for tracking user actions within an office.
 *
 * @example
 * await logAudit({
 *   officeId: 'office-id',
 *   userId: 'user-id',
 *   action: 'property_published',
 *   entity: 'Property',
 *   entityId: 'property-id',
 *   details: { title: 'Luxury Villa' },
 *   ip: '192.168.1.1',
 * })
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        officeId: entry.officeId,
        userId: entry.userId ?? null,
        action: entry.action,
        entity: entry.entity ?? null,
        entityId: entry.entityId ?? null,
        details: (entry.details ?? undefined) as Prisma.InputJsonValue | undefined,
        ip: entry.ip ?? null,
      },
    })
  } catch (error) {
    // Audit logging should never break the main flow.
    // Log the error but do not throw.
    console.error('[AuditLog] Failed to create audit log entry:', error)
  }
}
