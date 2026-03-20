import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl

  // Skip static files and auth API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|webp|gif|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next()
  }

  const response = NextResponse.next()

  // ─── Locale Detection ───────────────────────────────────────
  // Priority: cookie > Accept-Language header > default (ar)
  const localeCookie = request.cookies.get('falz-locale')?.value
  const acceptLang = request.headers.get('accept-language')
  const locale =
    localeCookie ||
    (acceptLang?.split(',').some((l) => l.trim().startsWith('ar')) ? 'ar' : 'en')
  response.headers.set('x-locale', locale)

  // ─── Subdomain-based Office Detection (Production) ──────────
  const parts = hostname.split('.')
  if (parts.length >= 3 && !hostname.startsWith('localhost')) {
    const subdomain = parts[0]
    if (subdomain !== 'www' && subdomain !== 'app') {
      response.headers.set('x-office-slug', subdomain)
    }
  }

  // ─── Legacy /o/{slug} Redirect (301 for SEO) ────────────────
  const legacyOfficeMatch = pathname.match(/^\/o\/([^/]+)(.*)$/)
  if (legacyOfficeMatch) {
    const [, slug, rest] = legacyOfficeMatch
    const newUrl = new URL(`/${slug}${rest || ''}`, request.url)
    newUrl.search = request.nextUrl.search
    return NextResponse.redirect(newUrl, 301)
  }

  // ─── Path-based Office Detection: /{slug}/... ──────────────
  const RESERVED = new Set([
    'dashboard', 'admin', 'auth', 'api', 'sada', 'contact',
    '_next', 'favicon.ico', 'images', 'uploads',
  ])
  const firstSegment = pathname.split('/')[1]
  if (firstSegment && !RESERVED.has(firstSegment)) {
    response.headers.set('x-office-slug', firstSegment)
  }

  // ─── Dashboard Auth Check ───────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    const token =
      request.cookies.get('authjs.session-token')?.value ||
      request.cookies.get('__Secure-authjs.session-token')?.value
    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  // ─── Admin Auth Check ───────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    const token =
      request.cookies.get('authjs.session-token')?.value ||
      request.cookies.get('__Secure-authjs.session-token')?.value
    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|uploads).*)'],
}
