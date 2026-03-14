import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import type { OfficeWithTheme } from '@/types'

const officeSelectWithTheme = {
  id: true,
  name: true,
  nameAr: true,
  slug: true,
  logo: true,
  description: true,
  descriptionAr: true,
  customDomain: true,
  subdomain: true,
  defaultLanguage: true,
  isActive: true,
  isApproved: true,
  themeSettings: {
    select: {
      preset: true,
      primaryColor: true,
      accentColor: true,
      backgroundColor: true,
      textColor: true,
      mutedTextColor: true,
      fontFamily: true,
      fontFamilyAr: true,
      borderRadius: true,
      cardStyle: true,
    },
  },
} as const

/**
 * Get an office by its slug, including theme settings.
 */
export async function getOfficeBySlug(
  slug: string
): Promise<OfficeWithTheme | null> {
  const office = await prisma.office.findUnique({
    where: { slug },
    select: officeSelectWithTheme,
  })

  return office
}

/**
 * Get an office by custom domain or subdomain.
 * First checks customDomain, then checks subdomain.
 */
export async function getOfficeByDomain(
  domain: string
): Promise<OfficeWithTheme | null> {
  // Try custom domain first (e.g., properties.myoffice.com)
  const byCustomDomain = await prisma.office.findUnique({
    where: { customDomain: domain },
    select: officeSelectWithTheme,
  })

  if (byCustomDomain) return byCustomDomain

  // Try subdomain match (e.g., myoffice.falz.sa -> subdomain = "myoffice")
  const bySubdomain = await prisma.office.findUnique({
    where: { subdomain: domain },
    select: officeSelectWithTheme,
  })

  return bySubdomain
}

/**
 * Resolve the tenant office from the incoming request.
 *
 * Resolution order:
 * 1. Custom domain (if the host doesn't match the platform domain)
 * 2. Subdomain (e.g., office-slug.falz.sa)
 * 3. Path-based (e.g., /office/office-slug/...)
 */
export async function resolveOffice(
  request: NextRequest
): Promise<OfficeWithTheme | null> {
  const host = request.headers.get('host') || ''
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'localhost:3000'

  // 1. Check if this is a custom domain
  const hostWithoutPort = host.split(':')[0]
  const platformWithoutPort = platformDomain.split(':')[0]

  if (
    hostWithoutPort !== platformWithoutPort &&
    hostWithoutPort !== 'localhost' &&
    !hostWithoutPort.endsWith(`.${platformWithoutPort}`)
  ) {
    // This is a custom domain
    return getOfficeByDomain(hostWithoutPort)
  }

  // 2. Check for subdomain (e.g., myoffice.falz.sa)
  if (hostWithoutPort.endsWith(`.${platformWithoutPort}`)) {
    const subdomain = hostWithoutPort.replace(`.${platformWithoutPort}`, '')
    if (subdomain && subdomain !== 'www') {
      return getOfficeByDomain(subdomain)
    }
  }

  // 3. Path-based resolution (e.g., /office/my-office/properties)
  const pathname = request.nextUrl.pathname
  const officePathMatch = pathname.match(/^\/office\/([^/]+)/)
  if (officePathMatch) {
    return getOfficeBySlug(officePathMatch[1])
  }

  return null
}

/**
 * Verify that a user belongs to the given office.
 * Throws if the user does not have an active membership.
 */
export async function requireTenantAccess(
  officeId: string,
  userId: string
): Promise<void> {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_officeId: {
        userId,
        officeId,
      },
    },
    select: { isActive: true },
  })

  if (!membership || !membership.isActive) {
    throw new Error('You do not have access to this office')
  }
}

/**
 * Returns a Prisma `where` clause fragment for tenant isolation.
 * Use this in every query to ensure data is scoped to the correct office.
 *
 * @example
 * const properties = await prisma.property.findMany({
 *   where: {
 *     ...tenantWhere(officeId),
 *     status: 'PUBLISHED',
 *   },
 * })
 */
export function tenantWhere(officeId: string): { officeId: string } {
  return { officeId }
}
