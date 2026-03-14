'use server'

import prisma from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth-utils'
import { tenantWhere } from '@/lib/tenant'
import { logAudit } from '@/lib/audit'
import { sendInvitationEmail } from '@/lib/email'
import type { Role } from '@prisma/client'

// ─── Helper ─────────────────────────────────────────────────

async function getOfficeId(): Promise<string> {
  const user = await requireAuth()
  const membership = user.memberships[0]
  if (!membership) throw new Error('No office membership found')
  return membership.officeId
}

// ─── Get Team Members ───────────────────────────────────────

export async function getTeamMembers() {
  const officeId = await getOfficeId()

  const memberships = await prisma.membership.findMany({
    where: {
      officeId,
      isActive: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          nameAr: true,
          email: true,
          avatar: true,
          phone: true,
          lastLoginAt: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  return memberships.map((m) => ({
    membershipId: m.id,
    userId: m.user.id,
    name: m.user.name,
    nameAr: m.user.nameAr,
    email: m.user.email,
    avatar: m.user.avatar,
    phone: m.user.phone,
    role: m.role,
    lastLoginAt: m.user.lastLoginAt,
    joinedAt: m.createdAt,
  }))
}

// ─── Change Member Role ─────────────────────────────────────

export async function changeMemberRole(membershipId: string, newRole: Role) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  await requireRole(officeId, ['OWNER'])

  const membership = await prisma.membership.findFirst({
    where: {
      id: membershipId,
      officeId,
    },
    include: {
      user: { select: { name: true } },
    },
  })

  if (!membership) throw new Error('Membership not found')

  // Cannot change own role
  if (membership.userId === user.id) {
    throw new Error('Cannot change your own role')
  }

  await prisma.membership.update({
    where: { id: membershipId },
    data: { role: newRole },
  })

  await logAudit({
    officeId,
    userId: user.id,
    action: 'member_role_changed',
    entity: 'Membership',
    entityId: membershipId,
    details: {
      memberName: membership.user.name,
      fromRole: membership.role,
      toRole: newRole,
    },
  }).catch(() => {})

  return { success: true }
}

// ─── Remove Member ──────────────────────────────────────────

export async function removeMember(membershipId: string) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  await requireRole(officeId, ['OWNER'])

  const membership = await prisma.membership.findFirst({
    where: {
      id: membershipId,
      officeId,
    },
  })

  if (!membership) throw new Error('Membership not found')

  // Cannot remove yourself
  if (membership.userId === user.id) {
    throw new Error('Cannot remove yourself')
  }

  // Cannot remove another owner
  if (membership.role === 'OWNER') {
    throw new Error('Cannot remove an owner')
  }

  await prisma.membership.update({
    where: { id: membershipId },
    data: { isActive: false },
  })

  await logAudit({
    officeId,
    userId: user.id,
    action: 'member_removed',
    entity: 'Membership',
    entityId: membershipId,
  }).catch(() => {})

  return { success: true }
}

// ─── Invite Member ──────────────────────────────────────────

export async function inviteMember(email: string, role: Role) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  await requireRole(officeId, ['OWNER', 'MANAGER'])

  // Check for existing membership
  const existingMember = await prisma.membership.findFirst({
    where: {
      officeId,
      user: { email: email.toLowerCase().trim() },
      isActive: true,
    },
  })

  if (existingMember) {
    throw new Error('This user is already a member of this office')
  }

  // Check for pending invitation
  const existingInvitation = await prisma.invitation.findFirst({
    where: {
      officeId,
      email: email.toLowerCase().trim(),
      status: 'PENDING',
    },
  })

  if (existingInvitation) {
    throw new Error('An invitation is already pending for this email')
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

  const office = await prisma.office.findUnique({
    where: { id: officeId },
    select: { name: true },
  })

  const invitation = await prisma.invitation.create({
    data: {
      officeId,
      email: email.toLowerCase().trim(),
      role,
      expiresAt,
    },
  })

  // Send invitation email (fire and forget)
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/invite/${invitation.token}`
  sendInvitationEmail({
    recipientEmail: email,
    officeName: office?.name || 'Office',
    inviterName: user.name,
    role,
    inviteUrl,
  }).catch((err) => {
    console.error('[Team] Failed to send invitation email:', err)
  })

  await logAudit({
    officeId,
    userId: user.id,
    action: 'member_invited',
    entity: 'Invitation',
    entityId: invitation.id,
    details: { email, role },
  }).catch(() => {})

  return { success: true, invitationId: invitation.id }
}

// ─── Get Pending Invitations ────────────────────────────────

export async function getPendingInvitations() {
  const officeId = await getOfficeId()

  return prisma.invitation.findMany({
    where: {
      officeId,
      status: 'PENDING',
    },
    orderBy: { createdAt: 'desc' },
  })
}

// ─── Cancel Invitation ──────────────────────────────────────

export async function cancelInvitation(invitationId: string) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  await requireRole(officeId, ['OWNER', 'MANAGER'])

  const invitation = await prisma.invitation.findFirst({
    where: {
      id: invitationId,
      officeId,
      status: 'PENDING',
    },
  })

  if (!invitation) throw new Error('Invitation not found')

  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: 'CANCELLED' },
  })

  return { success: true }
}
