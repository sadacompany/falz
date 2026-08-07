import type { Role } from '@prisma/client'
import type { AuthenticatedUser } from '@/types'
import {
  mockOwnerAuthUser,
  mockManagerAuthUser,
  mockAgentAuthUser,
  mockSuperAdminAuthUser,
} from './test-data'

let currentMockUser: AuthenticatedUser | null = mockOwnerAuthUser

/**
  Sets the active mock user for auth calls.
 */
export function setMockCurrentUser(user: AuthenticatedUser | null): void {
  currentMockUser = user
}

/**
  Gets the active mock user.
 */
export function getMockCurrentUser(): AuthenticatedUser | null {
  return currentMockUser
}

/**
  Resets the mock user to default (Owner).
 */
export function resetAuthMock(): void {
  currentMockUser = mockOwnerAuthUser
}

/**
  Helper shortcuts to set specific roles.
 */
export function mockAsOwner(): void {
  setMockCurrentUser(mockOwnerAuthUser)
}

export function mockAsManager(): void {
  setMockCurrentUser(mockManagerAuthUser)
}

export function mockAsAgent(): void {
  setMockCurrentUser(mockAgentAuthUser)
}

export function mockAsSuperAdmin(): void {
  setMockCurrentUser(mockSuperAdminAuthUser)
}

export function mockUnauthenticated(): void {
  setMockCurrentUser(null)
}

/**
  Mock implementation of `getCurrentUser` from `@/lib/auth-utils`
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  return currentMockUser
}

/**
  Mock implementation of `requireAuth` from `@/lib/auth-utils`
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  if (!currentMockUser) {
    throw new Error('Authentication required')
  }
  return currentMockUser
}

/**
  Mock implementation of `requireRole` from `@/lib/auth-utils`
 */
export async function requireRole(
  officeId: string,
  roles: Role[]
): Promise<AuthenticatedUser> {
  const user = await requireAuth()

  if (user.isSuperAdmin) {
    return user
  }

  const membership = user.memberships?.find(
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
  Mock implementation of `requireSuperAdmin` from `@/lib/auth-utils`
 */
export async function requireSuperAdmin(): Promise<AuthenticatedUser> {
  const user = await requireAuth()

  if (!user.isSuperAdmin) {
    throw new Error('Super admin access required')
  }

  return user
}
