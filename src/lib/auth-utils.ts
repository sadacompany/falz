import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import type { Role } from '@prisma/client'
import type { AuthenticatedUser } from '@/types'

const SALT_ROUNDS = 12

/**
 * Hash a plaintext password.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verify a plaintext password against a hash.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Get the currently authenticated user from the session,
 * including their office memberships.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  const memberships = await prisma.membership.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
    },
    select: {
      id: true,
      officeId: true,
      role: true,
      isActive: true,
      office: {
        select: {
          id: true,
          name: true,
          nameAr: true,
          slug: true,
          logo: true,
        },
      },
    },
  })

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    isSuperAdmin: session.user.isSuperAdmin,
    memberships,
  }
}

/**
 * Require authentication. Throws if the user is not signed in.
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Authentication required')
  }

  return user
}

/**
 * Require the user to have one of the specified roles in the given office.
 * Throws if the user does not have the required role.
 * Super admins bypass this check.
 */
export async function requireRole(
  officeId: string,
  roles: Role[]
): Promise<AuthenticatedUser> {
  const user = await requireAuth()

  // Super admins bypass role checks
  if (user.isSuperAdmin) {
    return user
  }

  const membership = user.memberships.find(
    (m) => m.officeId === officeId && m.isActive
  )

  if (!membership) {
    throw new Error('You do not have access to this office')
  }

  if (!roles.includes(membership.role)) {
    throw new Error(
      `Insufficient permissions. Required role: ${roles.join(' or ')}`
    )
  }

  return user
}

/**
 * Require the user to be a super admin.
 * Throws if the user is not a super admin.
 */
export async function requireSuperAdmin(): Promise<AuthenticatedUser> {
  const user = await requireAuth()

  if (!user.isSuperAdmin) {
    throw new Error('Super admin access required')
  }

  return user
}
