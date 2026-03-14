export type SectionType =
  | 'hero'
  | 'about'
  | 'services'
  | 'featured_properties'
  | 'stats'
  | 'cta'
  | 'testimonials'
  | 'team'
  | 'partners'
  | 'contact'
  | 'gallery'
  | 'footer'

export interface SectionItem {
  title?: string
  titleAr?: string
  description?: string
  descriptionAr?: string
  icon?: string
  imageUrl?: string
  link?: string
  name?: string
  nameAr?: string
  role?: string
  roleAr?: string
  rating?: number
  photoUrl?: string
  logoUrl?: string
  url?: string
}

export interface PageSectionConfig {
  id: string
  type: SectionType
  enabled: boolean
  order: number
  content: {
    title?: string
    titleAr?: string
    subtitle?: string
    subtitleAr?: string
    body?: string
    bodyAr?: string
    imageUrl?: string
    items?: SectionItem[]
    backgroundImage?: string
    layout?: 'centered' | 'split'
    buttonText?: string
    buttonTextAr?: string
    buttonUrl?: string
    showSearch?: boolean
    mapEmbed?: string
  }
}

export interface PageVisibilityConfig {
  about: boolean
  contact: boolean
  agents: boolean
  blog: boolean
}

export const SECTION_TYPE_LABELS: Record<SectionType, { ar: string; en: string }> = {
  hero: { ar: 'القسم الرئيسي', en: 'Hero' },
  about: { ar: 'من نحن', en: 'About' },
  services: { ar: 'خدماتنا', en: 'Services' },
  featured_properties: { ar: 'العقارات المميزة', en: 'Featured Properties' },
  stats: { ar: 'الإحصائيات', en: 'Statistics' },
  cta: { ar: 'دعوة للتواصل', en: 'Call to Action' },
  testimonials: { ar: 'آراء العملاء', en: 'Testimonials' },
  team: { ar: 'فريقنا', en: 'Our Team' },
  partners: { ar: 'شركاؤنا', en: 'Partners' },
  contact: { ar: 'تواصل معنا', en: 'Contact' },
  gallery: { ar: 'معرض الصور', en: 'Gallery' },
  footer: { ar: 'التذييل', en: 'Footer' },
}
