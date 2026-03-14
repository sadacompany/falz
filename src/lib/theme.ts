// ─── Theme Types ──────────────────────────────────────────

export interface ThemeConfig {
  /** Display name for the theme preset */
  name: string
  /** Unique key for the preset */
  key: string
  /** Primary brand colour (e.g. sidebar, header) */
  primary: string
  /** Accent / highlight colour (e.g. buttons, links, badges) */
  accent: string
  /** Page background colour */
  background: string
  /** Card / elevated surface colour */
  surface: string
  /** Muted / secondary text colour */
  muted: string
  /** Primary text colour */
  text: string
  /** Border / divider colour */
  border: string
  /** Font family for Latin text */
  fontFamily: string
  /** Font family for Arabic text */
  fontFamilyAr: string
  /** Border radius token: sm | md | lg | full */
  borderRadius: 'sm' | 'md' | 'lg' | 'full'
  /** Card rendering style */
  cardStyle: 'flat' | 'elevated' | 'bordered'
  /** Footer background colour (defaults to primary) */
  footer: string
}

export type ThemePreset = Pick<
  ThemeConfig,
  | 'name'
  | 'key'
  | 'primary'
  | 'accent'
  | 'background'
  | 'surface'
  | 'muted'
  | 'text'
  | 'border'
>

// ─── Theme Preset Definitions ─────────────────────────────

const navyGold: ThemeConfig = {
  name: 'Navy & Gold',
  key: 'navy-gold',
  primary: '#1E3A5F',
  accent: '#C8A96E',
  background: '#FAFAF7',
  surface: '#FFFFFF',
  muted: '#718096',
  text: '#2D3748',
  border: '#E2E8F0',
  fontFamily: 'Inter, Noto Sans Arabic, sans-serif',
  fontFamilyAr: 'Noto Sans Arabic, Inter, sans-serif',
  borderRadius: 'md',
  cardStyle: 'elevated',
  footer: '#1E3A5F',
}

const deepGreenGold: ThemeConfig = {
  name: 'Deep Green & Gold',
  key: 'deep-green-gold',
  primary: '#1B4332',
  accent: '#C8A96E',
  background: '#F8FAF8',
  surface: '#FFFFFF',
  muted: '#6B8A7A',
  text: '#1A3328',
  border: '#D4E5DA',
  fontFamily: 'Inter, Noto Sans Arabic, sans-serif',
  fontFamilyAr: 'Noto Sans Arabic, Inter, sans-serif',
  borderRadius: 'md',
  cardStyle: 'elevated',
  footer: '#1B4332',
}

const charcoalSand: ThemeConfig = {
  name: 'Charcoal & Sand',
  key: 'charcoal-sand',
  primary: '#374151',
  accent: '#C9A96E',
  background: '#FAF9F7',
  surface: '#FFFFFF',
  muted: '#6B7280',
  text: '#1F2937',
  border: '#E5E7EB',
  fontFamily: 'Inter, Noto Sans Arabic, sans-serif',
  fontFamilyAr: 'Noto Sans Arabic, Inter, sans-serif',
  borderRadius: 'md',
  cardStyle: 'elevated',
  footer: '#374151',
}

const royalIvory: ThemeConfig = {
  name: 'عاجي ملكي',
  key: 'royal-ivory',
  primary: '#2C1810',
  accent: '#8B6914',
  background: '#FFFEF8',
  surface: '#FFFFFF',
  muted: '#8A7A6B',
  text: '#2C1810',
  border: '#E8E0D0',
  fontFamily: 'Inter, Noto Sans Arabic, sans-serif',
  fontFamilyAr: 'Noto Sans Arabic, Inter, sans-serif',
  borderRadius: 'md',
  cardStyle: 'elevated',
  footer: '#2C1810',
}

const freshSage: ThemeConfig = {
  name: 'أخضر مريمية',
  key: 'fresh-sage',
  primary: '#2D4A3E',
  accent: '#5B8A6D',
  background: '#F5FAF7',
  surface: '#FFFFFF',
  muted: '#6B8A7A',
  text: '#2D4A3E',
  border: '#D4E5DA',
  fontFamily: 'Inter, Noto Sans Arabic, sans-serif',
  fontFamilyAr: 'Noto Sans Arabic, Inter, sans-serif',
  borderRadius: 'md',
  cardStyle: 'elevated',
  footer: '#2D4A3E',
}

const warmSand: ThemeConfig = {
  name: 'رملي دافئ',
  key: 'warm-sand',
  primary: '#5C3D2E',
  accent: '#C9956B',
  background: '#FDF8F0',
  surface: '#FFFFFF',
  muted: '#9A7E6A',
  text: '#5C3D2E',
  border: '#E8DCC8',
  fontFamily: 'Inter, Noto Sans Arabic, sans-serif',
  fontFamilyAr: 'Noto Sans Arabic, Inter, sans-serif',
  borderRadius: 'md',
  cardStyle: 'elevated',
  footer: '#5C3D2E',
}

const skyBlue: ThemeConfig = {
  name: 'أزرق سماوي',
  key: 'sky-blue',
  primary: '#1B3A5C',
  accent: '#3B82C4',
  background: '#F0F7FF',
  surface: '#FFFFFF',
  muted: '#6B8AAA',
  text: '#1B3A5C',
  border: '#D0E2F0',
  fontFamily: 'Inter, Noto Sans Arabic, sans-serif',
  fontFamilyAr: 'Noto Sans Arabic, Inter, sans-serif',
  borderRadius: 'md',
  cardStyle: 'elevated',
  footer: '#1B3A5C',
}

const roseBlush: ThemeConfig = {
  name: 'وردي ناعم',
  key: 'rose-blush',
  primary: '#6B2D5B',
  accent: '#D4789C',
  background: '#FFF5F8',
  surface: '#FFFFFF',
  muted: '#A07090',
  text: '#6B2D5B',
  border: '#F0D0E0',
  fontFamily: 'Inter, Noto Sans Arabic, sans-serif',
  fontFamilyAr: 'Noto Sans Arabic, Inter, sans-serif',
  borderRadius: 'md',
  cardStyle: 'elevated',
  footer: '#6B2D5B',
}

const goldenCream: ThemeConfig = {
  name: 'ذهبي كريمي',
  key: 'golden-cream',
  primary: '#44360E',
  accent: '#B8860B',
  background: '#FFFDF5',
  surface: '#FFFFFF',
  muted: '#6B5D3A',
  text: '#2E2506',
  border: '#E8DFC4',
  fontFamily: 'Inter, Noto Sans Arabic, sans-serif',
  fontFamilyAr: 'Noto Sans Arabic, Inter, sans-serif',
  borderRadius: 'md',
  cardStyle: 'elevated',
  footer: '#44360E',
}

/**
 * All available theme presets.
 * Exported as an array for the theme picker UI.
 */
export const themePresets: ThemeConfig[] = [
  navyGold,
  deepGreenGold,
  charcoalSand,
  royalIvory,
  freshSage,
  warmSand,
  skyBlue,
  roseBlush,
  goldenCream,
]

/**
 * Map of preset keys to their configs for fast lookup.
 */
export const themePresetsMap: Record<string, ThemeConfig> = {
  'navy-gold': navyGold,
  'deep-green-gold': deepGreenGold,
  'charcoal-sand': charcoalSand,
  'royal-ivory': royalIvory,
  'fresh-sage': freshSage,
  'warm-sand': warmSand,
  'sky-blue': skyBlue,
  'rose-blush': roseBlush,
  'golden-cream': goldenCream,
}

// ─── Border Radius Mapping ────────────────────────────────

const borderRadiusMap: Record<ThemeConfig['borderRadius'], string> = {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  full: '9999px',
}

// ─── Card Style Mapping ───────────────────────────────────

const cardStyleMap: Record<ThemeConfig['cardStyle'], string> = {
  flat: 'none',
  elevated: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
  bordered: 'none',
}

// ─── Theme Helpers ────────────────────────────────────────

/**
 * Office theme settings shape — matches the Prisma ThemeSettings model
 * and the OfficeWithTheme.themeSettings type from @/types.
 */
export interface OfficeThemeSettings {
  preset: string
  primaryColor?: string | null
  accentColor?: string | null
  backgroundColor?: string | null
  textColor?: string | null
  mutedTextColor?: string | null
  fontFamily?: string | null
  fontFamilyAr?: string | null
  borderRadius?: string | null
  cardStyle?: string | null
  footerColor?: string | null
}

/**
 * Resolve a full ThemeConfig for an office.
 *
 * Starts from the preset defined in the office's theme settings,
 * then applies any per-office colour / font / style overrides.
 *
 * If `themeSettings` is null the default preset (navy-gold) is returned.
 */
export function getThemeForOffice(
  themeSettings: OfficeThemeSettings | null | undefined
): ThemeConfig {
  // Fallback to the default preset when no settings exist
  if (!themeSettings) {
    return { ...navyGold }
  }

  // Look up the base preset, defaulting to navy-gold
  const base: ThemeConfig = {
    ...(themePresetsMap[themeSettings.preset] ?? navyGold),
  }

  // Apply overrides when present
  if (themeSettings.primaryColor) base.primary = themeSettings.primaryColor
  if (themeSettings.footerColor) base.footer = themeSettings.footerColor
  if (themeSettings.accentColor) base.accent = themeSettings.accentColor
  if (themeSettings.backgroundColor) base.background = themeSettings.backgroundColor
  if (themeSettings.textColor) base.text = themeSettings.textColor
  if (themeSettings.mutedTextColor) base.muted = themeSettings.mutedTextColor
  if (themeSettings.fontFamily) base.fontFamily = themeSettings.fontFamily
  if (themeSettings.fontFamilyAr) base.fontFamilyAr = themeSettings.fontFamilyAr

  if (
    themeSettings.borderRadius &&
    ['sm', 'md', 'lg', 'full'].includes(themeSettings.borderRadius)
  ) {
    base.borderRadius = themeSettings.borderRadius as ThemeConfig['borderRadius']
  }

  if (
    themeSettings.cardStyle &&
    ['flat', 'elevated', 'bordered'].includes(themeSettings.cardStyle)
  ) {
    base.cardStyle = themeSettings.cardStyle as ThemeConfig['cardStyle']
  }

  return base
}

/**
 * Convert a ThemeConfig into a CSS custom properties string.
 *
 * Intended to be injected into a `<style>` tag on `:root` (or a wrapper element)
 * so that the entire UI can consume theme tokens via `var(--theme-primary)`, etc.
 *
 * @example
 * ```tsx
 * <style dangerouslySetInnerHTML={{ __html: `:root { ${themeToCSS(theme)} }` }} />
 * ```
 */
export function themeToCSS(theme: ThemeConfig): string {
  const radius = borderRadiusMap[theme.borderRadius] ?? borderRadiusMap.md
  const shadow = cardStyleMap[theme.cardStyle] ?? cardStyleMap.elevated
  const cardBorder = theme.cardStyle === 'bordered' ? `1px solid ${theme.border}` : 'none'

  return [
    `--theme-primary: ${theme.primary}`,
    `--theme-accent: ${theme.accent}`,
    `--theme-background: ${theme.background}`,
    `--theme-surface: ${theme.surface}`,
    `--theme-muted: ${theme.muted}`,
    `--theme-text: ${theme.text}`,
    `--theme-border: ${theme.border}`,
    `--theme-footer-bg: ${theme.footer}`,
    `--theme-font-family: ${theme.fontFamily}`,
    `--theme-font-family-ar: ${theme.fontFamilyAr}`,
    `--theme-radius: ${radius}`,
    `--theme-card-shadow: ${shadow}`,
    `--theme-card-border: ${cardBorder}`,
    // Derived tokens for common use-cases
    `--theme-accent-hover: ${adjustBrightness(theme.accent, -12)}`,
    `--theme-accent-active: ${adjustBrightness(theme.accent, -20)}`,
    `--theme-surface-hover: ${adjustBrightness(theme.background, -3)}`,
  ].join('; ')
}

// ─── Internal Helpers ─────────────────────────────────────

/**
 * Very small utility to lighten or darken a hex colour by a percentage.
 * Positive `percent` lightens, negative darkens.
 */
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + Math.round(2.55 * percent)))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + Math.round(2.55 * percent)))
  const b = Math.min(255, Math.max(0, (num & 0xff) + Math.round(2.55 * percent)))

  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}
