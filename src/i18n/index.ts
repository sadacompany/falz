import type { Dictionary } from './dictionaries/ar'

export type Locale = 'ar' | 'en'

export const defaultLocale: Locale = 'ar'

export const locales: Locale[] = ['ar', 'en']

/**
 * Locale display names (used in language switcher UI).
 */
export const localeNames: Record<Locale, string> = {
  ar: 'العربية',
  en: 'English',
}

/**
 * Lazy-load the dictionary for a given locale.
 * Uses dynamic imports so only the needed locale bundle is loaded.
 */
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  switch (locale) {
    case 'ar':
      return (await import('./dictionaries/ar')).default
    case 'en':
      return (await import('./dictionaries/en')).default
    default:
      return (await import('./dictionaries/ar')).default
  }
}

/**
 * Returns the text direction for a locale.
 */
export function getDirection(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr'
}

/**
 * Returns the HTML lang attribute value for a locale.
 */
export function getHtmlLang(locale: Locale): string {
  return locale === 'ar' ? 'ar-SA' : 'en'
}

/**
 * Validate and normalise a locale string.
 * Returns the default locale if the input is not supported.
 */
export function resolveLocale(value: string | undefined | null): Locale {
  if (value && locales.includes(value as Locale)) {
    return value as Locale
  }
  return defaultLocale
}

export type { Dictionary }
