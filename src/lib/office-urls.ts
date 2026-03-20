/**
 * Centralized office URL generation.
 * Single source of truth — if the URL scheme changes, only update this file.
 */

export const RESERVED_SLUGS = new Set([
  'dashboard',
  'admin',
  'auth',
  'api',
  'sada',
  'contact',
  '_next',
  'favicon.ico',
  'images',
  'uploads',
  'robots.txt',
  'sitemap.xml',
])

/** Base path for an office microsite */
export function officeBasePath(slug: string): string {
  return `/${slug}`
}

/** Full path within an office microsite */
export function officePath(slug: string, subpath?: string): string {
  const base = officeBasePath(slug)
  if (!subpath) return base
  return `${base}/${subpath.replace(/^\//, '')}`
}

/** Check if a slug is reserved */
export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase())
}
