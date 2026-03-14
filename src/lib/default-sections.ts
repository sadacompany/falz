import type { PageSectionConfig, PageVisibilityConfig } from '@/types/sections'

export function getDefaultSections(): PageSectionConfig[] {
  return [
    {
      id: 'hero',
      type: 'hero',
      enabled: true,
      order: 0,
      content: {},
    },
    {
      id: 'about',
      type: 'about',
      enabled: true,
      order: 1,
      content: {},
    },
    {
      id: 'services',
      type: 'services',
      enabled: true,
      order: 2,
      content: {},
    },
    {
      id: 'featured_properties',
      type: 'featured_properties',
      enabled: true,
      order: 3,
      content: {},
    },
    {
      id: 'stats',
      type: 'stats',
      enabled: true,
      order: 4,
      content: {},
    },
    {
      id: 'cta',
      type: 'cta',
      enabled: true,
      order: 5,
      content: {},
    },
    {
      id: 'testimonials',
      type: 'testimonials',
      enabled: false,
      order: 6,
      content: {
        title: 'What Our Clients Say',
        titleAr: 'آراء عملائنا',
      },
    },
    {
      id: 'team',
      type: 'team',
      enabled: false,
      order: 7,
      content: {
        title: 'Our Team',
        titleAr: 'فريقنا',
      },
    },
    {
      id: 'partners',
      type: 'partners',
      enabled: false,
      order: 8,
      content: {
        title: 'Our Partners',
        titleAr: 'شركاؤنا',
      },
    },
    {
      id: 'contact',
      type: 'contact',
      enabled: false,
      order: 9,
      content: {
        title: 'Contact Us',
        titleAr: 'تواصل معنا',
      },
    },
    {
      id: 'gallery',
      type: 'gallery',
      enabled: false,
      order: 10,
      content: {
        title: 'Gallery',
        titleAr: 'معرض الصور',
      },
    },
    {
      id: 'footer',
      type: 'footer',
      enabled: true,
      order: 99,
      content: {
        showLogo: true,
        showNavLinks: true,
        showContactInfo: true,
        showSocialLinks: true,
      } as any,
    },
  ]
}

export function getDefaultPageVisibility(): PageVisibilityConfig {
  return {
    about: true,
    contact: true,
    agents: true,
    blog: true,
  }
}
