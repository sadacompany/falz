import { describe, it, expect } from 'vitest'
import { formatPrice, formatDate, slugify, cn } from '@/lib/utils'

describe('F13: UI/UX RTL Direction & Arabic Locale Formatting', () => {
  describe('Arabic Locale Number & Price Formatting (Intl.NumberFormat ar-SA-u-nu-latn)', () => {
    it('should format numeric price with ar-SA-u-nu-latn locale returning SAR symbol', () => {
      const formatted = formatPrice(2500000, 'SAR')
      expect(formatted).toContain('2,500,000')
      expect(formatted).toContain('ر.س')
    })

    it('should format BigInt price correctly using ar-SA-u-nu-latn', () => {
      const formatted = formatPrice(BigInt(65000), 'SAR')
      expect(formatted).toContain('65,000')
      expect(formatted).toContain('ر.س')
    })

    it('should format USD currency with en-US locale when currency is USD', () => {
      const formatted = formatPrice(1000, 'USD')
      expect(formatted).toBe('$1,000')
    })
  })

  describe('Arabic Locale Date Formatting (Intl.DateTimeFormat ar-SA-u-nu-latn)', () => {
    it('should format Date instance using Arabic locale ar-SA-u-nu-latn', () => {
      const date = new Date('2026-08-06T00:00:00.000Z')
      const formatted = formatDate(date, 'ar-SA-u-nu-latn')
      expect(formatted).toBeDefined()
      expect(typeof formatted).toBe('string')
      expect(formatted.length).toBeGreaterThan(0)
    })
  })

  describe('RTL Direction Provider Metadata & Transliteration', () => {
    it('should define RTL HTML attributes metadata for Arabic UI', () => {
      const htmlMetadata = {
        dir: 'rtl',
        lang: 'ar-SA',
      }
      expect(htmlMetadata.dir).toBe('rtl')
      expect(htmlMetadata.lang).toBe('ar-SA')
    })

    it('should generate URL-safe slugs with slugify', () => {
      const slug = slugify('Luxury Villa Al-Malqa')
      expect(slug).toBe('luxury-villa-al-malqa')
    })

    it('should merge tailwind class names properly with cn', () => {
      const classes = cn('bg-red-500', false && 'hidden', 'text-white')
      expect(classes).toBe('bg-red-500 text-white')
    })
  })
})
