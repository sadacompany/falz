import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import slugifyLib from 'slugify'
import { randomBytes } from 'crypto'
import type { ReferrerCategory } from '@/types'

/**
 * Merge Tailwind CSS classes with clsx.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Create a URL-safe slug from text.
 * Supports Arabic text by transliterating or stripping diacritics.
 */
export function slugify(text: string): string {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  })
}

/**
 * Format a price amount for display.
 * Amounts are stored in the smallest currency unit (halalas for SAR, cents for USD).
 */
export function formatPrice(
  amount: number | bigint,
  currency: string = 'SAR'
): string {
  const numericAmount = typeof amount === 'bigint' ? Number(amount) : amount

  const locale = currency === 'SAR' ? 'ar-SA-u-nu-latn' : 'en-US'

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount)
}

/**
 * Format a date for display.
 */
export function formatDate(
  date: Date | string,
  locale: string = 'ar-SA-u-nu-latn'
): string {
  const d = typeof date === 'string' ? new Date(date) : date

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/**
 * Generate a cryptographically secure preview token.
 */
export function generatePreviewToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Known social media domains.
 */
const SOCIAL_DOMAINS = [
  'facebook.com',
  'fb.com',
  'twitter.com',
  'x.com',
  't.co',
  'instagram.com',
  'linkedin.com',
  'snapchat.com',
  'tiktok.com',
  'youtube.com',
  'youtu.be',
  'pinterest.com',
  'reddit.com',
  'whatsapp.com',
  'wa.me',
  'telegram.org',
  't.me',
]

/**
 * Known search engine domains.
 */
const SEARCH_DOMAINS = [
  'google.com',
  'google.co',
  'google.ae',
  'google.com.sa',
  'bing.com',
  'yahoo.com',
  'duckduckgo.com',
  'baidu.com',
  'yandex.com',
  'ecosia.org',
]

/**
 * Categorize a referrer URL into a source type.
 */
export function parseReferrer(referrer: string | null | undefined): ReferrerCategory {
  if (!referrer) return 'direct'

  let hostname: string
  try {
    hostname = new URL(referrer).hostname.toLowerCase()
  } catch {
    return 'direct'
  }

  if (SOCIAL_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`))) {
    return 'social'
  }

  if (SEARCH_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`))) {
    return 'search'
  }

  return 'referral'
}
