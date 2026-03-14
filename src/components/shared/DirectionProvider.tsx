'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import { type Locale, getDirection, getHtmlLang } from '@/i18n'

// ─── Context ──────────────────────────────────────────────

interface DirectionContextValue {
  /** The active locale ('ar' | 'en') */
  locale: Locale
  /** Text direction derived from the locale */
  dir: 'rtl' | 'ltr'
  /** Whether the current direction is right-to-left */
  isRtl: boolean
}

const DirectionContext = createContext<DirectionContextValue | null>(null)

// ─── Hook ─────────────────────────────────────────────────

/**
 * Access the current locale and direction from any client component.
 *
 * @example
 * ```tsx
 * const { locale, dir, isRtl } = useDirection()
 * ```
 */
export function useDirection(): DirectionContextValue {
  const ctx = useContext(DirectionContext)
  if (!ctx) {
    throw new Error('useDirection must be used within a <DirectionProvider>')
  }
  return ctx
}

// ─── Provider ─────────────────────────────────────────────

interface DirectionProviderProps {
  /** The active locale for this page / layout. */
  locale: Locale
  children: ReactNode
}

/**
 * Sets `dir` and `lang` attributes on the `<html>` element and provides
 * locale / direction context to all child components.
 *
 * Should be placed near the top of the component tree, typically inside the
 * root layout alongside `<ThemeProvider>`.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { DirectionProvider } from '@/components/shared/DirectionProvider'
 *
 * export default function RootLayout({ children, params }) {
 *   const locale = params.locale ?? 'ar'
 *   return (
 *     <html>
 *       <body>
 *         <DirectionProvider locale={locale}>
 *           {children}
 *         </DirectionProvider>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
export function DirectionProvider({ locale, children }: DirectionProviderProps) {
  const dir = getDirection(locale)
  const lang = getHtmlLang(locale)
  const isRtl = dir === 'rtl'

  // Synchronise <html> attributes on the client whenever the locale changes.
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('dir', dir)
    html.setAttribute('lang', lang)

    // Clean up on unmount / locale change to avoid stale attributes
    return () => {
      // Only reset if the values haven't been changed by another provider
      if (html.getAttribute('dir') === dir) {
        html.removeAttribute('dir')
      }
      if (html.getAttribute('lang') === lang) {
        html.removeAttribute('lang')
      }
    }
  }, [dir, lang])

  const contextValue = useMemo<DirectionContextValue>(
    () => ({ locale, dir, isRtl }),
    [locale, dir, isRtl]
  )

  return (
    <DirectionContext.Provider value={contextValue}>
      {children}
    </DirectionContext.Provider>
  )
}
