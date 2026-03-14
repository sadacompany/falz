'use client'

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import { type ThemeConfig, themeToCSS } from '@/lib/theme'

// ─── Context ──────────────────────────────────────────────

interface ThemeContextValue {
  theme: ThemeConfig
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

// ─── Hook ─────────────────────────────────────────────────

/**
 * Access the current theme config from any client component.
 *
 * @example
 * ```tsx
 * const { theme } = useTheme()
 * ```
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a <ThemeProvider>')
  }
  return ctx
}

// ─── Provider ─────────────────────────────────────────────

interface ThemeProviderProps {
  /** The resolved theme configuration for the current office / page. */
  theme: ThemeConfig
  children: ReactNode
}

/**
 * Injects theme CSS custom properties into the document via a `<style>` tag
 * and provides the theme config to the component tree through React context.
 *
 * Place this as high as possible in the component tree (typically inside the
 * root layout or the tenant layout) so that every descendant can consume the
 * `var(--theme-*)` tokens and use the `useTheme()` hook.
 *
 * @example
 * ```tsx
 * // In a layout.tsx
 * import { ThemeProvider } from '@/components/shared/ThemeProvider'
 * import { getThemeForOffice } from '@/lib/theme'
 *
 * export default function TenantLayout({ children, office }) {
 *   const theme = getThemeForOffice(office.themeSettings)
 *   return (
 *     <ThemeProvider theme={theme}>
 *       {children}
 *     </ThemeProvider>
 *   )
 * }
 * ```
 */
export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const cssString = useMemo(() => themeToCSS(theme), [theme])

  const contextValue = useMemo<ThemeContextValue>(() => ({ theme }), [theme])

  return (
    <ThemeContext.Provider value={contextValue}>
      {/* Inject CSS custom properties so the whole subtree can use var(--theme-*) */}
      <style
        dangerouslySetInnerHTML={{
          __html: `:root { ${cssString} }`,
        }}
      />
      {children}
    </ThemeContext.Provider>
  )
}
