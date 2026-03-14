import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import prisma from '@/lib/db'

const JWT_SECRET = new TextEncoder().encode(
  process.env.VISITOR_JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-visitor-secret'
)
const COOKIE_NAME = 'falz-visitor-token'
const TOKEN_EXPIRY = '30d'

export interface VisitorSession {
  id: string
  officeId: string
  name: string
  email?: string
  phone?: string
}

export async function signToken(payload: VisitorSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<VisitorSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as VisitorSession
  } catch {
    return null
  }
}

export async function getVisitorSession(): Promise<VisitorSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}
