'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Building2,
  Globe,
  Search,
  Share2,
  Save,
  Check,
  Loader2,
  ExternalLink,
  LayoutTemplate,
  ChevronUp,
  ChevronDown,
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  GripVertical,
  Paintbrush,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  getOfficeDetails,
  updateOfficeGeneral,
  updateOfficeTheme,
  updateOfficeSeo,
  updateOfficeSocial,
  updateOfficeDomain,
  updateOfficeLanguage,
  updateOfficePageSections,
  getOfficePageSections,
} from '@/lib/actions/office'
import { extractDominantColors, suggestThemeFromColors } from '@/lib/color-extraction'
import { getDefaultSections } from '@/lib/default-sections'
import { SECTION_TYPE_LABELS, type PageSectionConfig, type SectionType, type PageVisibilityConfig } from '@/types/sections'
import { themePresetsMap, type ThemeConfig } from '@/lib/theme'
import { updateOfficePageVisibility } from '@/lib/actions/office'
import { SectionItemsEditor } from '@/components/dashboard/SectionItemsEditor'

// ─── Types ──────────────────────────────────────────────────

type OfficeData = NonNullable<Awaited<ReturnType<typeof getOfficeDetails>>>

// ─── Tabs ───────────────────────────────────────────────────

const TABS = [
  { key: 'general', label: 'عام', icon: Building2 },
  { key: 'editor', label: 'المحرر المرئي', icon: LayoutTemplate },
  { key: 'domain', label: 'النطاق', icon: Globe },
  { key: 'seo', label: 'تحسين محركات البحث', icon: Search },
  { key: 'social', label: 'التواصل الاجتماعي', icon: Share2 },
] as const

type TabKey = (typeof TABS)[number]['key']

// ─── Theme Presets ──────────────────────────────────────────

const THEME_PRESETS = [
  {
    value: 'navy-gold',
    label: 'كحلي وذهبي',
    preview: { primary: '#1E3A5F', accent: '#C8A96E', bg: '#FAFAF7' },
  },
  {
    value: 'deep-green-gold',
    label: 'أخضر داكن وذهبي',
    preview: { primary: '#1B4332', accent: '#C8A96E', bg: '#F8FAF8' },
  },
  {
    value: 'charcoal-sand',
    label: 'رمادي ورملي',
    preview: { primary: '#374151', accent: '#C9A96E', bg: '#FAF9F7' },
  },
  {
    value: 'royal-ivory',
    label: 'عاجي ملكي',
    preview: { primary: '#2C1810', accent: '#8B6914', bg: '#FFFEF8' },
  },
  {
    value: 'fresh-sage',
    label: 'أخضر مريمية',
    preview: { primary: '#2D4A3E', accent: '#5B8A6D', bg: '#F5FAF7' },
  },
  {
    value: 'warm-sand',
    label: 'رملي دافئ',
    preview: { primary: '#5C3D2E', accent: '#C9956B', bg: '#FDF8F0' },
  },
  {
    value: 'sky-blue',
    label: 'أزرق سماوي',
    preview: { primary: '#1B3A5C', accent: '#3B82C4', bg: '#F0F7FF' },
  },
  {
    value: 'rose-blush',
    label: 'وردي ناعم',
    preview: { primary: '#6B2D5B', accent: '#D4789C', bg: '#FFF5F8' },
  },
  {
    value: 'golden-cream',
    label: 'ذهبي كريمي',
    preview: { primary: '#44360E', accent: '#B8860B', bg: '#FFFDF5' },
  },
]

// ─── Device Sizes ──────────────────────────────────────────

const DEVICE_SIZES = [
  { key: 'desktop', icon: Monitor, label: 'سطح المكتب', width: '100%' },
  { key: 'tablet', icon: Tablet, label: 'جهاز لوحي', width: '768px' },
  { key: 'mobile', icon: Smartphone, label: 'جوال', width: '375px' },
] as const

type DeviceSize = (typeof DEVICE_SIZES)[number]['key']

// ─── Section Field Configs ──────────────────────────────────

interface FieldConfig {
  key: string
  label: string
  labelAr: string
  type: 'text' | 'textarea' | 'toggle'
  contentKey?: string
}

const SECTION_FIELDS: Partial<Record<SectionType, FieldConfig[]>> = {
  hero: [
    { key: 'titleAr', label: 'Title', labelAr: 'العنوان', type: 'text', contentKey: 'titleAr' },
    { key: 'subtitleAr', label: 'Subtitle', labelAr: 'العنوان الفرعي', type: 'text', contentKey: 'subtitleAr' },
    { key: 'backgroundImage', label: 'Background Image', labelAr: 'صورة الخلفية', type: 'text', contentKey: 'backgroundImage' },
    { key: 'buttonTextAr', label: 'Button Text', labelAr: 'نص الزر', type: 'text', contentKey: 'buttonTextAr' },
  ],
  about: [
    { key: 'titleAr', label: 'Title', labelAr: 'العنوان', type: 'text', contentKey: 'titleAr' },
    { key: 'bodyAr', label: 'Body', labelAr: 'المحتوى', type: 'textarea', contentKey: 'bodyAr' },
    { key: 'imageUrl', label: 'Image URL', labelAr: 'رابط الصورة', type: 'text', contentKey: 'imageUrl' },
  ],
  services: [
    { key: 'titleAr', label: 'Title', labelAr: 'العنوان', type: 'text', contentKey: 'titleAr' },
    { key: 'subtitleAr', label: 'Subtitle', labelAr: 'العنوان الفرعي', type: 'text', contentKey: 'subtitleAr' },
  ],
  featured_properties: [
    { key: 'titleAr', label: 'Title', labelAr: 'العنوان', type: 'text', contentKey: 'titleAr' },
  ],
  stats: [
    { key: 'titleAr', label: 'Title', labelAr: 'العنوان', type: 'text', contentKey: 'titleAr' },
  ],
  cta: [
    { key: 'titleAr', label: 'Title', labelAr: 'العنوان', type: 'text', contentKey: 'titleAr' },
    { key: 'subtitleAr', label: 'Subtitle', labelAr: 'العنوان الفرعي', type: 'text', contentKey: 'subtitleAr' },
    { key: 'backgroundImage', label: 'Background Image', labelAr: 'صورة الخلفية', type: 'text', contentKey: 'backgroundImage' },
    { key: 'buttonTextAr', label: 'Button Text', labelAr: 'نص الزر', type: 'text', contentKey: 'buttonTextAr' },
  ],
  testimonials: [
    { key: 'titleAr', label: 'Title', labelAr: 'العنوان', type: 'text', contentKey: 'titleAr' },
  ],
  team: [
    { key: 'titleAr', label: 'Title', labelAr: 'العنوان', type: 'text', contentKey: 'titleAr' },
  ],
  partners: [
    { key: 'titleAr', label: 'Title', labelAr: 'العنوان', type: 'text', contentKey: 'titleAr' },
  ],
  contact: [
    { key: 'titleAr', label: 'Title', labelAr: 'العنوان', type: 'text', contentKey: 'titleAr' },
    { key: 'subtitleAr', label: 'Subtitle', labelAr: 'العنوان الفرعي', type: 'text', contentKey: 'subtitleAr' },
    { key: 'mapEmbed', label: 'Map Embed URL', labelAr: 'رابط خرائط جوجل', type: 'text', contentKey: 'mapEmbed' },
  ],
  gallery: [
    { key: 'titleAr', label: 'Title', labelAr: 'العنوان', type: 'text', contentKey: 'titleAr' },
  ],
  footer: [
    { key: 'showLogo', label: 'Show Logo', labelAr: 'إظهار الشعار', type: 'toggle', contentKey: 'showLogo' },
    { key: 'showNavLinks', label: 'Show Navigation', labelAr: 'إظهار الروابط', type: 'toggle', contentKey: 'showNavLinks' },
    { key: 'showContactInfo', label: 'Show Contact', labelAr: 'إظهار التواصل', type: 'toggle', contentKey: 'showContactInfo' },
    { key: 'showSocialLinks', label: 'Show Social', labelAr: 'إظهار التواصل الاجتماعي', type: 'toggle', contentKey: 'showSocialLinks' },
    { key: 'titleAr', label: 'Copyright', labelAr: 'نص حقوق النشر', type: 'text', contentKey: 'titleAr' },
  ],
}

// Section types that support items editing
const SECTIONS_WITH_ITEMS = new Set<string>(['testimonials', 'team', 'partners', 'gallery', 'services'])

// ─── Component ──────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('general')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [office, setOffice] = useState<OfficeData | null>(null)

  // ─── General Fields ───────────────────────────────────────
  const [name, setName] = useState('')
  const [nameAr, setNameAr] = useState('')
  const [description, setDescription] = useState('')
  const [descriptionAr, setDescriptionAr] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [website, setWebsite] = useState('')
  const [falLicenseNo, setFalLicenseNo] = useState('')
  const [address, setAddress] = useState('')
  const [addressAr, setAddressAr] = useState('')
  const [city, setCity] = useState('')
  const [cityAr, setCityAr] = useState('')
  const [district, setDistrict] = useState('')
  const [districtAr, setDistrictAr] = useState('')

  // ─── Branding / Theme Fields ──────────────────────────────
  const [themePreset, setThemePreset] = useState('navy-gold')
  const [primaryColor, setPrimaryColor] = useState('')
  const [accentColor, setAccentColor] = useState('')
  const [backgroundColor, setBackgroundColor] = useState('')
  const [textColor, setTextColor] = useState('')
  const [fontFamily, setFontFamily] = useState('')
  const [fontFamilyAr, setFontFamilyAr] = useState('')
  const [borderRadius, setBorderRadius] = useState('')
  const [cardStyle, setCardStyle] = useState('')
  const [footerColor, setFooterColor] = useState('')

  // ─── Domain Fields ────────────────────────────────────────
  const [customDomain, setCustomDomain] = useState('')
  const [subdomain, setSubdomain] = useState('')

  // ─── SEO Fields ───────────────────────────────────────────
  const [seoTitle, setSeoTitle] = useState('')
  const [seoTitleAr, setSeoTitleAr] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [seoDescriptionAr, setSeoDescriptionAr] = useState('')
  const [ogImage, setOgImage] = useState('')

  // ─── Social Fields ────────────────────────────────────────
  const [twitter, setTwitter] = useState('')
  const [instagram, setInstagram] = useState('')
  const [snapchat, setSnapchat] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [tiktok, setTiktok] = useState('')

  // Language is always Arabic
  const defaultLanguage = 'ar'

  // ─── Page Sections ───────────────────────────────────────────
  const [pageSections, setPageSections] = useState<PageSectionConfig[]>(getDefaultSections())

  // ─── Page Visibility ─────────────────────────────────────────
  const [pageVisibility, setPageVisibility] = useState<PageVisibilityConfig>({
    about: true, contact: true, agents: true, blog: true,
  })

  // ─── Theme Suggestion ──────────────────────────────────────
  const [suggestedPreset, setSuggestedPreset] = useState<string | null>(null)

  // ─── Editor Tab State ──────────────────────────────────────
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [device, setDevice] = useState<DeviceSize>('desktop')
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [editorSubTab, setEditorSubTab] = useState<'sections' | 'colors' | 'pages'>('sections')

  // ─── Load Data ────────────────────────────────────────────

  useEffect(() => {
    getOfficeDetails()
      .then((data) => {
        if (!data) return
        setOffice(data)

        // General
        setName(data.name || '')
        setNameAr(data.nameAr || '')
        setDescription(data.description || '')
        setDescriptionAr(data.descriptionAr || '')
        setPhone(data.phone || '')
        setEmail(data.email || '')
        setWhatsapp(data.whatsapp || '')
        setWebsite(data.website || '')
        setFalLicenseNo(data.falLicenseNo || '')
        setAddress(data.address || '')
        setAddressAr(data.addressAr || '')
        setCity(data.city || '')
        setCityAr(data.cityAr || '')
        setDistrict(data.district || '')
        setDistrictAr(data.districtAr || '')

        // Branding
        if (data.themeSettings) {
          setThemePreset(data.themeSettings.preset || 'navy-gold')
          setPrimaryColor(data.themeSettings.primaryColor || '')
          setAccentColor(data.themeSettings.accentColor || '')
          setBackgroundColor(data.themeSettings.backgroundColor || '')
          setTextColor(data.themeSettings.textColor || '')
          setFontFamily(data.themeSettings.fontFamily || '')
          setFontFamilyAr(data.themeSettings.fontFamilyAr || '')
          setBorderRadius(data.themeSettings.borderRadius || '')
          setCardStyle(data.themeSettings.cardStyle || '')
          setFooterColor(data.themeSettings.footerColor || '')
        }

        // Domain
        setCustomDomain(data.customDomain || '')
        setSubdomain(data.subdomain || '')

        // SEO
        setSeoTitle(data.seoTitle || '')
        setSeoTitleAr(data.seoTitleAr || '')
        setSeoDescription(data.seoDescription || '')
        setSeoDescriptionAr(data.seoDescriptionAr || '')
        setOgImage(data.ogImage || '')

        // Social
        const social = (data.socialLinks as Record<string, string>) || {}
        setTwitter(social.twitter || '')
        setInstagram(social.instagram || '')
        setSnapchat(social.snapchat || '')
        setLinkedin(social.linkedin || '')
        setTiktok(social.tiktok || '')

        // Page Sections — merge with defaults to ensure new types appear
        const savedSections = data.pageSections && Array.isArray(data.pageSections) && (data.pageSections as any[]).length > 0
          ? data.pageSections as unknown as PageSectionConfig[]
          : []
        if (savedSections.length > 0) {
          const defaults = getDefaultSections()
          const savedIds = new Set(savedSections.map((s) => s.id))
          const merged = [
            ...savedSections,
            ...defaults.filter((d) => !savedIds.has(d.id)),
          ]
          setPageSections(merged)
        }

        // Page Visibility
        if (data.pageVisibility && typeof data.pageVisibility === 'object') {
          setPageVisibility({
            about: (data.pageVisibility as any).about !== false,
            contact: (data.pageVisibility as any).contact !== false,
            agents: (data.pageVisibility as any).agents !== false,
            blog: (data.pageVisibility as any).blog !== false,
          })
        }

        // Logo color extraction for theme suggestion
        if (data.logo) {
          extractDominantColors(data.logo).then((colors) => {
            if (colors.length > 0) {
              const suggested = suggestThemeFromColors(
                colors,
                THEME_PRESETS.map((p) => ({
                  key: p.value,
                  primary: p.preview.primary,
                  accent: p.preview.accent,
                }))
              )
              if (suggested && suggested !== (data.themeSettings?.preset || 'navy-gold')) {
                setSuggestedPreset(suggested)
              }
            }
          }).catch(() => {})
        }
      })
      .catch((err) => {
        console.error('Failed to load office:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  // ─── PostMessage Logic ────────────────────────────────────

  const postSectionsToIframe = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'falz-preview-update', sections: pageSections },
        window.location.origin
      )
    }
  }, [pageSections])

  const buildThemeConfig = useCallback((): ThemeConfig => {
    const base = themePresetsMap[themePreset] ?? themePresetsMap['navy-gold']
    const theme: ThemeConfig = { ...base }
    if (primaryColor) theme.primary = primaryColor
    if (accentColor) theme.accent = accentColor
    if (backgroundColor) theme.background = backgroundColor
    if (textColor) theme.text = textColor
    if (fontFamily) theme.fontFamily = fontFamily
    if (fontFamilyAr) theme.fontFamilyAr = fontFamilyAr
    if (borderRadius && ['sm', 'md', 'lg', 'full'].includes(borderRadius)) {
      theme.borderRadius = borderRadius as ThemeConfig['borderRadius']
    }
    if (cardStyle && ['flat', 'elevated', 'bordered'].includes(cardStyle)) {
      theme.cardStyle = cardStyle as ThemeConfig['cardStyle']
    }
    return theme
  }, [themePreset, primaryColor, accentColor, backgroundColor, textColor, fontFamily, fontFamilyAr, borderRadius, cardStyle])

  const postThemeToIframe = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'falz-theme-update', theme: buildThemeConfig() },
        window.location.origin
      )
    }
  }, [buildThemeConfig])

  // Send sections to iframe when they change
  useEffect(() => {
    if (activeTab === 'editor') {
      postSectionsToIframe()
    }
  }, [postSectionsToIframe, activeTab])

  // Send theme to iframe when it changes
  useEffect(() => {
    if (activeTab === 'editor') {
      postThemeToIframe()
    }
  }, [postThemeToIframe, activeTab])

  // ─── Section Editing Helpers ──────────────────────────────

  const toggleSection = (id: string) => {
    setPageSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    )
  }

  const moveSection = (idx: number, direction: 'up' | 'down') => {
    setPageSections((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order)
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev
      const temp = sorted[idx].order
      sorted[idx] = { ...sorted[idx], order: sorted[swapIdx].order }
      sorted[swapIdx] = { ...sorted[swapIdx], order: temp }
      return sorted
    })
  }

  const updateContent = (sectionId: string, key: string, value: any) => {
    setPageSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, content: { ...s.content, [key]: value } }
          : s
      )
    )
  }

  const updateItems = (sectionId: string, items: any[]) => {
    setPageSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, content: { ...s.content, items } }
          : s
      )
    )
  }

  const sortedSections = [...pageSections].sort((a, b) => a.order - b.order)

  // ─── Save Handlers ───────────────────────────────────────

  const showSuccess = () => {
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  const handleSaveGeneral = async () => {
    setSaving(true)
    setError(null)
    try {
      await updateOfficeGeneral({
        name: name.trim(),
        nameAr: nameAr.trim(),
        description: description.trim(),
        descriptionAr: descriptionAr.trim(),
        phone: phone.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim(),
        website: website.trim(),
        falLicenseNo: falLicenseNo.trim(),
        address: address.trim(),
        addressAr: addressAr.trim(),
        city: city.trim(),
        cityAr: cityAr.trim(),
        district: district.trim(),
        districtAr: districtAr.trim(),
      })
      showSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEditor = async () => {
    setSaving(true)
    setError(null)
    try {
      await Promise.all([
        updateOfficeTheme({
          preset: themePreset,
          primaryColor: primaryColor || undefined,
          accentColor: accentColor || undefined,
          backgroundColor: backgroundColor || undefined,
          textColor: textColor || undefined,
          fontFamily: fontFamily || undefined,
          fontFamilyAr: fontFamilyAr || undefined,
          borderRadius: borderRadius || undefined,
          cardStyle: cardStyle || undefined,
          footerColor: footerColor || undefined,
        }),
        updateOfficePageSections(pageSections),
        updateOfficePageVisibility(pageVisibility),
      ])
      showSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveDomain = async () => {
    setSaving(true)
    setError(null)
    try {
      await updateOfficeDomain({
        customDomain: customDomain.trim() || undefined,
        subdomain: subdomain.trim() || undefined,
      })
      showSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSeo = async () => {
    setSaving(true)
    setError(null)
    try {
      await updateOfficeSeo({
        seoTitle: seoTitle.trim() || undefined,
        seoTitleAr: seoTitleAr.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined,
        seoDescriptionAr: seoDescriptionAr.trim() || undefined,
        ogImage: ogImage.trim() || undefined,
      })
      showSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSocial = async () => {
    setSaving(true)
    setError(null)
    try {
      await updateOfficeSocial({
        twitter: twitter.trim() || undefined,
        instagram: instagram.trim() || undefined,
        snapchat: snapchat.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        tiktok: tiktok.trim() || undefined,
      })
      showSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const saveHandlers: Record<TabKey, () => Promise<void>> = {
    general: handleSaveGeneral,
    editor: handleSaveEditor,
    domain: handleSaveDomain,
    seo: handleSaveSeo,
    social: handleSaveSocial,
  }

  // ─── Loading State ───────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8A96E] border-t-transparent" />
      </div>
    )
  }

  const deviceConfig = DEVICE_SIZES.find((d) => d.key === device)!

  // ─── Render ──────────────────────────────────────────────

  // Editor tab uses a full-width layout, so render it separately
  if (activeTab === 'editor') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#2D3748]">الإعدادات</h1>
            <p className="mt-1 text-sm text-[#718096]">
              إدارة ملف المكتب والهوية والتفضيلات
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Sidebar tabs + Editor panel */}
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          {/* Sidebar Tabs */}
          <div>
            <nav className="flex flex-row gap-1 overflow-x-auto rounded-lg border border-[#E2E8F0] bg-white p-1 lg:flex-col">
              {TABS.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key)
                      setError(null)
                    }}
                    className={cn(
                      'flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      activeTab === tab.key
                        ? 'bg-[#C8A96E] text-[#1E3A5F]'
                        : 'text-[#718096] hover:bg-[#F7F7F2] hover:text-[#1E3A5F]'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Editor Two-Panel Layout */}
          <div className="flex flex-col lg:flex-row gap-0 rounded-lg border border-[#E2E8F0] bg-white overflow-hidden" style={{ height: 'calc(100vh - 12rem)' }}>
            {/* Left: Preview iframe */}
            <div className="flex-1 flex flex-col bg-[#F0F0F0] min-w-0">
              {/* Device selector bar */}
              <div className="flex items-center justify-center gap-2 border-b border-[#E2E8F0] bg-white px-4 py-2 shrink-0">
                <div className="flex items-center gap-1 rounded-lg border border-[#E2E8F0] p-0.5">
                  {DEVICE_SIZES.map((d) => {
                    const Icon = d.icon
                    return (
                      <button
                        key={d.key}
                        onClick={() => setDevice(d.key)}
                        className={cn(
                          'rounded-md p-1.5 transition-colors',
                          device === d.key
                            ? 'bg-[#C8A96E] text-white'
                            : 'text-[#718096] hover:bg-[#F7F7F2]'
                        )}
                        title={d.label}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* iframe */}
              <div className="flex-1 flex items-start justify-center p-4 overflow-auto">
                <div
                  className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300"
                  style={{
                    width: deviceConfig.width,
                    maxWidth: '100%',
                    height: '100%',
                  }}
                >
                  {office?.slug && (
                    <iframe
                      ref={iframeRef}
                      src={`/${office.slug}?preview=1`}
                      className="w-full h-full border-0"
                      onLoad={() => {
                        postSectionsToIframe()
                        postThemeToIframe()
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right: Editor sidebar */}
            <div className="w-full lg:w-[340px] border-t lg:border-t-0 lg:border-r border-[#E2E8F0] bg-white flex flex-col shrink-0 overflow-hidden">
              {/* Sub-tabs */}
              <div className="flex border-b border-[#E2E8F0] shrink-0">
                <button
                  onClick={() => setEditorSubTab('sections')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors',
                    editorSubTab === 'sections'
                      ? 'border-b-2 border-[#C8A96E] text-[#2D3748]'
                      : 'text-[#718096] hover:text-[#2D3748]'
                  )}
                >
                  <Eye className="h-3.5 w-3.5" />
                  الأقسام
                </button>
                <button
                  onClick={() => setEditorSubTab('colors')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors',
                    editorSubTab === 'colors'
                      ? 'border-b-2 border-[#C8A96E] text-[#2D3748]'
                      : 'text-[#718096] hover:text-[#2D3748]'
                  )}
                >
                  <Paintbrush className="h-3.5 w-3.5" />
                  الألوان
                </button>
                <button
                  onClick={() => setEditorSubTab('pages')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors',
                    editorSubTab === 'pages'
                      ? 'border-b-2 border-[#C8A96E] text-[#2D3748]'
                      : 'text-[#718096] hover:text-[#2D3748]'
                  )}
                >
                  <Globe className="h-3.5 w-3.5" />
                  الصفحات
                </button>
              </div>

              {/* Sub-tab content */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* ─── Sections Sub-Tab ──────────────────────── */}
                {editorSubTab === 'sections' && (
                  <div className="space-y-2">
                    {sortedSections.map((section, idx) => {
                      const isExpanded = expandedSection === section.id
                      const fields = SECTION_FIELDS[section.type]

                      return (
                        <div
                          key={section.id}
                          className={cn(
                            'rounded-lg border transition-all',
                            section.enabled
                              ? 'border-[#C8A96E]/30 bg-[#FAF5EB]/50'
                              : 'border-[#E2E8F0] bg-white'
                          )}
                        >
                          {/* Section Header */}
                          <div className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-[#A0AEC0]" />
                              <button
                                onClick={() => toggleSection(section.id)}
                                className={cn(
                                  'relative h-5 w-9 rounded-full transition-colors shrink-0',
                                  section.enabled ? 'bg-[#C8A96E]' : 'bg-[#E2E8F0]'
                                )}
                              >
                                <span
                                  className={cn(
                                    'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                                    section.enabled ? 'translate-x-4' : 'translate-x-0.5'
                                  )}
                                />
                              </button>
                              <button
                                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                                className={cn(
                                  'text-sm font-medium',
                                  section.enabled ? 'text-[#2D3748]' : 'text-[#A0AEC0]'
                                )}
                              >
                                {SECTION_TYPE_LABELS[section.type]?.ar || section.type}
                              </button>
                            </div>

                            <div className="flex items-center gap-0.5">
                              <button
                                onClick={() => moveSection(idx, 'up')}
                                disabled={idx === 0}
                                className="rounded p-1 text-[#718096] hover:bg-[#F7F7F2] disabled:opacity-30"
                              >
                                <ChevronUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => moveSection(idx, 'down')}
                                disabled={idx === sortedSections.length - 1}
                                className="rounded p-1 text-[#718096] hover:bg-[#F7F7F2] disabled:opacity-30"
                              >
                                <ChevronDown className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded Content Fields */}
                          {isExpanded && (
                            <div className="px-3 pb-3 border-t border-[#E2E8F0]/50 pt-3 space-y-3">
                              {fields && fields.map((field) => {
                                if (field.type === 'toggle') {
                                  const checked = (section.content as Record<string, any>)?.[field.contentKey!] !== false
                                  return (
                                    <div key={field.key} className="flex items-center justify-between">
                                      <Label className="text-xs text-[#4A5568]">
                                        {field.labelAr}
                                      </Label>
                                      <button
                                        onClick={() =>
                                          updateContent(section.id, field.contentKey!, !checked)
                                        }
                                        className={cn(
                                          'relative h-5 w-9 rounded-full transition-colors',
                                          checked ? 'bg-[#C8A96E]' : 'bg-[#E2E8F0]'
                                        )}
                                      >
                                        <span
                                          className={cn(
                                            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                                            checked ? 'translate-x-4' : 'translate-x-0.5'
                                          )}
                                        />
                                      </button>
                                    </div>
                                  )
                                }

                                const value = (section.content as any)?.[field.contentKey!] || ''

                                if (field.type === 'textarea') {
                                  return (
                                    <div key={field.key} className="space-y-1">
                                      <Label className="text-xs text-[#4A5568]">
                                        {field.labelAr}
                                      </Label>
                                      <textarea
                                        value={value}
                                        onChange={(e) =>
                                          updateContent(section.id, field.contentKey!, e.target.value)
                                        }
                                        rows={3}
                                        className="w-full rounded-md border border-[#E2E8F0] px-2 py-1.5 text-sm text-[#2D3748] focus:border-[#C8A96E] focus:outline-none focus:ring-1 focus:ring-[#C8A96E] resize-none"
                                        dir={field.key.endsWith('Ar') ? 'rtl' : 'ltr'}
                                      />
                                    </div>
                                  )
                                }

                                return (
                                  <div key={field.key} className="space-y-1">
                                    <Label className="text-xs text-[#4A5568]">
                                      {field.labelAr}
                                    </Label>
                                    <Input
                                      value={value}
                                      onChange={(e) =>
                                        updateContent(section.id, field.contentKey!, e.target.value)
                                      }
                                      className="h-8 text-sm"
                                      dir={field.key.endsWith('Ar') ? 'rtl' : 'ltr'}
                                    />
                                  </div>
                                )
                              })}

                              {/* Items editor for sections that support it */}
                              {SECTIONS_WITH_ITEMS.has(section.type) && (
                                <div className="mt-3 pt-3 border-t border-[#E2E8F0]/50">
                                  <SectionItemsEditor
                                    sectionType={section.type}
                                    items={section.content.items || []}
                                    onChange={(items) => updateItems(section.id, items)}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* ─── Colors Sub-Tab ────────────────────────── */}
                {editorSubTab === 'colors' && (
                  <div className="space-y-6">
                    {/* Theme Suggestion Banner */}
                    {suggestedPreset && (
                      <div className="flex items-center justify-between rounded-lg border border-[#C8A96E]/30 bg-[#FBF6E1] px-3 py-2">
                        <p className="text-xs text-[#44360E]">
                          ننصح بقالب{' '}
                          <strong>{THEME_PRESETS.find((p) => p.value === suggestedPreset)?.label}</strong>
                        </p>
                        <button
                          onClick={() => {
                            setThemePreset(suggestedPreset)
                            setPrimaryColor('')
                            setAccentColor('')
                            setBackgroundColor('')
                            setTextColor('')
                            setSuggestedPreset(null)
                          }}
                          className="rounded-lg bg-[#B8860B] px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#9A7209]"
                        >
                          تطبيق
                        </button>
                      </div>
                    )}

                    {/* Theme Preset Grid */}
                    <div>
                      <h3 className="text-sm font-semibold text-[#2D3748] mb-3">نمط التصميم</h3>
                      <div className="grid gap-2 grid-cols-2">
                        {THEME_PRESETS.map((preset) => (
                          <button
                            key={preset.value}
                            onClick={() => {
                              setThemePreset(preset.value)
                              setPrimaryColor('')
                              setAccentColor('')
                              setBackgroundColor('')
                              setTextColor('')
                            }}
                            className={cn(
                              'rounded-lg border p-3 text-start transition-all',
                              themePreset === preset.value
                                ? 'border-[#C8A96E] ring-1 ring-[#C8A96E]'
                                : 'border-[#E2E8F0] hover:border-[#C8A96E]/30'
                            )}
                          >
                            <div className="mb-2 flex gap-1.5">
                              <div
                                className="h-6 w-6 rounded-full border border-[#E2E8F0]"
                                style={{ backgroundColor: preset.preview.primary }}
                              />
                              <div
                                className="h-6 w-6 rounded-full border border-[#E2E8F0]"
                                style={{ backgroundColor: preset.preview.accent }}
                              />
                              <div
                                className="h-6 w-6 rounded-full border border-[#E2E8F0]"
                                style={{ backgroundColor: preset.preview.bg }}
                              />
                            </div>
                            <p className="text-xs font-medium text-[#2D3748]">
                              {preset.label}
                            </p>
                            {themePreset === preset.value && (
                              <Badge variant="default" className="mt-1 text-[10px]">
                                نشط
                              </Badge>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Color Overrides */}
                    <div>
                      <h3 className="text-sm font-semibold text-[#2D3748] mb-1">ألوان مخصصة</h3>
                      <p className="text-xs text-[#718096] mb-3">
                        تخصيص ألوان النمط
                      </p>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label className="text-xs">اللون الأساسي</Label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={primaryColor || (themePresetsMap[themePreset]?.primary ?? '#1E3A5F')}
                              onChange={(e) => setPrimaryColor(e.target.value)}
                              className="h-9 w-10 cursor-pointer rounded-md border border-[#E2E8F0] bg-transparent"
                            />
                            <Input
                              value={primaryColor}
                              onChange={(e) => setPrimaryColor(e.target.value)}
                              placeholder={themePresetsMap[themePreset]?.primary ?? '#1E3A5F'}
                              dir="ltr"
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">اللون المميز</Label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={accentColor || (themePresetsMap[themePreset]?.accent ?? '#C8A96E')}
                              onChange={(e) => setAccentColor(e.target.value)}
                              className="h-9 w-10 cursor-pointer rounded-md border border-[#E2E8F0] bg-transparent"
                            />
                            <Input
                              value={accentColor}
                              onChange={(e) => setAccentColor(e.target.value)}
                              placeholder={themePresetsMap[themePreset]?.accent ?? '#C8A96E'}
                              dir="ltr"
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">لون الخلفية</Label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={backgroundColor || (themePresetsMap[themePreset]?.background ?? '#FAFAF7')}
                              onChange={(e) => setBackgroundColor(e.target.value)}
                              className="h-9 w-10 cursor-pointer rounded-md border border-[#E2E8F0] bg-transparent"
                            />
                            <Input
                              value={backgroundColor}
                              onChange={(e) => setBackgroundColor(e.target.value)}
                              placeholder={themePresetsMap[themePreset]?.background ?? '#FAFAF7'}
                              dir="ltr"
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">لون النص</Label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={textColor || (themePresetsMap[themePreset]?.text ?? '#2D3748')}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="h-9 w-10 cursor-pointer rounded-md border border-[#E2E8F0] bg-transparent"
                            />
                            <Input
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              placeholder={themePresetsMap[themePreset]?.text ?? '#2D3748'}
                              dir="ltr"
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">لون الفوتر</Label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={footerColor || (themePresetsMap[themePreset]?.primary ?? '#1E3A5F')}
                              onChange={(e) => setFooterColor(e.target.value)}
                              className="h-9 w-10 cursor-pointer rounded-md border border-[#E2E8F0] bg-transparent"
                            />
                            <Input
                              value={footerColor}
                              onChange={(e) => setFooterColor(e.target.value)}
                              placeholder={themePresetsMap[themePreset]?.primary ?? '#1E3A5F'}
                              dir="ltr"
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Font & Style */}
                    <div>
                      <h3 className="text-sm font-semibold text-[#2D3748] mb-3">الخطوط والأنماط</h3>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label className="text-xs">نوع الخط (إنجليزي)</Label>
                          <select
                            value={fontFamily}
                            onChange={(e) => setFontFamily(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-1 text-sm text-[#2D3748]"
                          >
                            <option value="">افتراضي (Inter)</option>
                            <option value="Inter">Inter</option>
                            <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                            <option value="DM Sans">DM Sans</option>
                            <option value="Poppins">Poppins</option>
                            <option value="Outfit">Outfit</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">نوع الخط (عربي)</Label>
                          <select
                            value={fontFamilyAr}
                            onChange={(e) => setFontFamilyAr(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-1 text-sm text-[#2D3748]"
                          >
                            <option value="">افتراضي (IBM Plex Sans Arabic)</option>
                            <option value="IBM Plex Sans Arabic">IBM Plex Sans Arabic</option>
                            <option value="Tajawal">Tajawal</option>
                            <option value="Cairo">Cairo</option>
                            <option value="Almarai">Almarai</option>
                            <option value="Noto Sans Arabic">Noto Sans Arabic</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">استدارة الحواف</Label>
                          <select
                            value={borderRadius}
                            onChange={(e) => setBorderRadius(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-1 text-sm text-[#2D3748]"
                          >
                            <option value="">افتراضي</option>
                            <option value="none">بدون (حاد)</option>
                            <option value="sm">صغير</option>
                            <option value="md">متوسط</option>
                            <option value="lg">كبير</option>
                            <option value="xl">كبير جداً</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">نمط البطاقة</Label>
                          <select
                            value={cardStyle}
                            onChange={(e) => setCardStyle(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-1 text-sm text-[#2D3748]"
                          >
                            <option value="">افتراضي</option>
                            <option value="flat">مسطح</option>
                            <option value="bordered">بإطار</option>
                            <option value="elevated">مرتفع</option>
                            <option value="glass">زجاجي</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── Pages Sub-Tab ────────────────────────── */}
                {editorSubTab === 'pages' && (
                  <div className="space-y-4">
                    <p className="text-xs text-[#718096]">
                      تحكم في إظهار أو إخفاء الصفحات الفرعية
                    </p>
                    {[
                      { key: 'about' as const, label: 'صفحة من نحن' },
                      { key: 'contact' as const, label: 'صفحة تواصل معنا' },
                      { key: 'agents' as const, label: 'صفحة الوسطاء' },
                      { key: 'blog' as const, label: 'صفحة المدونة' },
                    ].map((page) => (
                      <div key={page.key} className="flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-white p-3">
                        <span className="text-sm font-medium text-[#2D3748]">{page.label}</span>
                        <button
                          onClick={() =>
                            setPageVisibility((prev) => ({ ...prev, [page.key]: !prev[page.key] }))
                          }
                          className={cn(
                            'relative h-5 w-9 rounded-full transition-colors',
                            pageVisibility[page.key] ? 'bg-[#C8A96E]' : 'bg-[#E2E8F0]'
                          )}
                        >
                          <span
                            className={cn(
                              'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                              pageVisibility[page.key] ? 'translate-x-4' : 'translate-x-0.5'
                            )}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save button */}
              <div className="border-t border-[#E2E8F0] p-4 shrink-0">
                <Button
                  onClick={handleSaveEditor}
                  disabled={saving}
                  className="w-full bg-[#C8A96E] hover:bg-[#B89A5E] text-white"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : saveSuccess ? (
                    <>
                      <Check className="h-4 w-4 ml-1" />
                      تم الحفظ
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 ml-1" />
                      حفظ
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3748]">الإعدادات</h1>
          <p className="mt-1 text-sm text-[#718096]">
            إدارة ملف المكتب والهوية والتفضيلات
          </p>
        </div>
        <Button onClick={() => saveHandlers[activeTab]()} isLoading={saving}>
          {saveSuccess ? (
            <>
              <Check className="h-4 w-4" />
              تم الحفظ!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              حفظ
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <nav className="flex flex-row gap-1 overflow-x-auto rounded-lg border border-[#E2E8F0] bg-white p-1 lg:flex-col">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key)
                    setError(null)
                  }}
                  className={cn(
                    'flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    activeTab === tab.key
                      ? 'bg-[#C8A96E] text-[#1E3A5F]'
                      : 'text-[#718096] hover:bg-[#F7F7F2] hover:text-[#1E3A5F]'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3">
          {/* ─── General Tab ────────────────────────────────── */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">معلومات المكتب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>اسم المكتب (إنجليزي)</Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="FALZ Real Estate"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>اسم المكتب (عربي)</Label>
                      <Input
                        value={nameAr}
                        onChange={(e) => setNameAr(e.target.value)}
                        placeholder="فالز العقارية"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>الوصف (إنجليزي)</Label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="نبذة عن مكتبك العقاري بالإنجليزية..."
                        dir="ltr"
                        rows={3}
                        className="flex w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748] placeholder:text-[#718096] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الوصف (عربي)</Label>
                      <textarea
                        value={descriptionAr}
                        onChange={(e) => setDescriptionAr(e.target.value)}
                        placeholder="عن مكتبك العقاري..."
                        dir="rtl"
                        rows={3}
                        className="flex w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748] placeholder:text-[#718096] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>رقم رخصة فال</Label>
                    <Input
                      value={falLicenseNo}
                      onChange={(e) => setFalLicenseNo(e.target.value)}
                      placeholder="FAL-XXXX-XXXX"
                      dir="ltr"
                    />
                    <p className="text-xs text-[#718096]">
                      رقم رخصة فال من الهيئة العامة للعقار (مطلوب في المملكة العربية السعودية)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">بيانات التواصل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>الهاتف</Label>
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+966 5XX XXX XXXX"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>البريد الإلكتروني</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="info@example.com"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>واتساب</Label>
                      <Input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="+966 5XX XXX XXXX"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الموقع الإلكتروني</Label>
                      <Input
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://example.com"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">العنوان</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>المدينة (إنجليزي)</Label>
                      <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Riyadh" dir="ltr" />
                    </div>
                    <div className="space-y-2">
                      <Label>المدينة (عربي)</Label>
                      <Input value={cityAr} onChange={(e) => setCityAr(e.target.value)} placeholder="الرياض" dir="rtl" />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>الحي (إنجليزي)</Label>
                      <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Al Olaya" dir="ltr" />
                    </div>
                    <div className="space-y-2">
                      <Label>الحي (عربي)</Label>
                      <Input value={districtAr} onChange={(e) => setDistrictAr(e.target.value)} placeholder="العليا" dir="rtl" />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>العنوان (إنجليزي)</Label>
                      <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="العنوان الكامل بالإنجليزية" dir="ltr" />
                    </div>
                    <div className="space-y-2">
                      <Label>العنوان (عربي)</Label>
                      <Input value={addressAr} onChange={(e) => setAddressAr(e.target.value)} placeholder="العنوان الكامل" dir="rtl" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ─── Domain Tab ─────────────────────────────────── */}
          {activeTab === 'domain' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">النطاق الفرعي</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>النطاق الفرعي</Label>
                    <div className="flex items-center gap-0">
                      <Input
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="myoffice"
                        dir="ltr"
                        className="rounded-e-none"
                      />
                      <div className="flex h-10 items-center rounded-e-md border border-s-0 border-[#E2E8F0] bg-[#EBF0F7]/50 px-3 text-sm text-[#718096]">
                        .falz.sa
                      </div>
                    </div>
                    <p className="text-xs text-[#718096]">
                      سيكون موقعك متاحاً على{' '}
                      <span className="text-[#C8A96E]">
                        {subdomain || 'myoffice'}.falz.sa
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">نطاق مخصص</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>اسم النطاق</Label>
                    <Input
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="www.myrealestate.com"
                      dir="ltr"
                    />
                    <p className="text-xs text-[#718096]">
                      وجّه سجل CNAME لنطاقك إلى{' '}
                      <code className="rounded bg-[#EBF0F7] px-1.5 py-0.5 text-[#C8A96E]">
                        cname.falz.sa
                      </code>
                    </p>
                  </div>

                  {customDomain && (
                    <div className="rounded-lg border border-[#E2E8F0] bg-[#FAFAF7] p-4">
                      <p className="mb-2 text-sm font-medium text-[#2D3748]">إعدادات DNS</p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-[#E2E8F0]">
                              <th className="py-2 pe-4 text-start text-xs text-[#718096]">النوع</th>
                              <th className="py-2 pe-4 text-start text-xs text-[#718096]">الاسم</th>
                              <th className="py-2 text-start text-xs text-[#718096]">القيمة</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="py-2 pe-4 text-[#2D3748]">CNAME</td>
                              <td className="py-2 pe-4 text-[#2D3748]">{customDomain}</td>
                              <td className="py-2 text-[#C8A96E]">cname.falz.sa</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ─── SEO Tab ────────────────────────────────────── */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">تحسين محركات البحث</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>عنوان محركات البحث (إنجليزي)</Label>
                      <Input
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="مكتبك - عقارات في السعودية"
                        dir="ltr"
                      />
                      <p className="text-xs text-[#718096]">{seoTitle.length}/60 حرف</p>
                    </div>
                    <div className="space-y-2">
                      <Label>عنوان محركات البحث (عربي)</Label>
                      <Input
                        value={seoTitleAr}
                        onChange={(e) => setSeoTitleAr(e.target.value)}
                        placeholder="مكتبك - عقارات في المملكة العربية السعودية"
                        dir="rtl"
                      />
                      <p className="text-xs text-[#718096]">{seoTitleAr.length}/60 حرف</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>الوصف الوصفي (إنجليزي)</Label>
                      <textarea
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        placeholder="اكتشف عقارات مميزة للبيع والإيجار بالإنجليزية..."
                        dir="ltr"
                        rows={3}
                        className="flex w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748] placeholder:text-[#718096] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]"
                      />
                      <p className="text-xs text-[#718096]">{seoDescription.length}/160 حرف</p>
                    </div>
                    <div className="space-y-2">
                      <Label>الوصف الوصفي (عربي)</Label>
                      <textarea
                        value={seoDescriptionAr}
                        onChange={(e) => setSeoDescriptionAr(e.target.value)}
                        placeholder="اكتشف عقارات مميزة للبيع والإيجار..."
                        dir="rtl"
                        rows={3}
                        className="flex w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748] placeholder:text-[#718096] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]"
                      />
                      <p className="text-xs text-[#718096]">{seoDescriptionAr.length}/160 حرف</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>رابط صورة المعاينة</Label>
                    <Input
                      value={ogImage}
                      onChange={(e) => setOgImage(e.target.value)}
                      placeholder="https://example.com/og-image.jpg"
                      dir="ltr"
                    />
                    <p className="text-xs text-[#718096]">
                      الحجم الموصى به: 1200x630 بكسل. تظهر هذه الصورة عند مشاركة موقعك على وسائل التواصل الاجتماعي.
                    </p>
                  </div>

                  {/* SEO Preview */}
                  <div className="rounded-lg border border-[#E2E8F0] bg-[#FAFAF7] p-4">
                    <p className="mb-2 text-xs font-medium uppercase text-[#718096]">
                      معاينة نتائج البحث
                    </p>
                    <div className="space-y-1">
                      <p className="text-lg text-[#8AB4F8]">
                        {seoTitle || name || 'اسم مكتبك'}
                      </p>
                      <p className="text-sm text-[#BDC1C6]">
                        {customDomain || `${subdomain || 'myoffice'}.falz.sa`}
                      </p>
                      <p className="text-sm text-[#9AA0A6]">
                        {seoDescription || description || 'أضف وصفاً لتحسين ظهورك في محركات البحث...'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ─── Social Tab ─────────────────────────────────── */}
          {activeTab === 'social' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">روابط التواصل الاجتماعي</CardTitle>
                <p className="text-xs text-[#718096]">
                  أضف حسابات التواصل الاجتماعي لعرضها على موقعك العام
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>تويتر / X</Label>
                  <Input
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="https://x.com/yourhandle"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>انستقرام</Label>
                  <Input
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/yourhandle"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>سناب شات</Label>
                  <Input
                    value={snapchat}
                    onChange={(e) => setSnapchat(e.target.value)}
                    placeholder="https://snapchat.com/add/yourhandle"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>لينكد إن</Label>
                  <Input
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/company/yourcompany"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>تيك توك</Label>
                  <Input
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    placeholder="https://tiktok.com/@yourhandle"
                    dir="ltr"
                  />
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  )
}
