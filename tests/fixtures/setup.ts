import { vi, beforeEach, afterEach } from 'vitest'
import { prismaMock, resetPrismaMock } from './prisma-mock'
import { resetAuthMock, getCurrentUser, requireAuth, requireRole, requireSuperAdmin } from './auth-mock'

// Environment variables for tests
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.DATABASE_URL = 'postgresql://mock:mock@localhost:5432/mockdb'

// Globally mock Prisma client DB module
vi.mock('@/lib/db', () => ({
  __esModule: true,
  default: prismaMock,
  prisma: prismaMock,
}))

// Globally mock @/lib/auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: 'user-owner-1', email: 'owner@example.com' } }),
}))

// Globally mock @/lib/auth-utils to delegate to auth-mock functions
vi.mock('@/lib/auth-utils', () => ({
  hashPassword: (p: string) => Promise.resolve('hashed_' + p),
  verifyPassword: (p: string, h: string) => Promise.resolve(true),
  getCurrentUser: () => getCurrentUser(),
  requireAuth: () => requireAuth(),
  requireRole: (officeId: string, roles: any[]) => requireRole(officeId, roles),
  requireSuperAdmin: () => requireSuperAdmin(),
}))

beforeEach(() => {
  resetPrismaMock()
  resetAuthMock()
})

afterEach(() => {
  vi.clearAllMocks()
})
