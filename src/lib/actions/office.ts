'use server'

import prisma from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth-utils'
import { logAudit } from '@/lib/audit'
import type { Prisma } from '@prisma/client'

// ─── Helper ─────────────────────────────────────────────────

async function getOfficeId(): Promise<string> {
  const user = await requireAuth()
  const membership = user.memberships[0]
  if (!membership) throw new Error('No office membership found')
  return membership.officeId
}

// ─── Get Office Details ─────────────────────────────────────

export async function getOfficeDetails() {
  const officeId = await getOfficeId()

  return prisma.office.findUnique({
    where: { id: officeId },
    include: {
      themeSettings: true,
    },
  })
}

// ─── Update General Settings ────────────────────────────────

export async function updateOfficeGeneral(data: {
  name?: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  phone?: string
  email?: string
  whatsapp?: string
  website?: string
  falLicenseNo?: string
  address?: string
  addressAr?: string
  city?: string
  cityAr?: string
  district?: string
  districtAr?: string
}) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  await requireRole(officeId, ['OWNER', 'MANAGER'])

  const updateData: Prisma.OfficeUpdateInput = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.nameAr !== undefined) updateData.nameAr = data.nameAr
  if (data.description !== undefined) updateData.description = data.description
  if (data.descriptionAr !== undefined) updateData.descriptionAr = data.descriptionAr
  if (data.phone !== undefined) updateData.phone = data.phone
  if (data.email !== undefined) updateData.email = data.email
  if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp
  if (data.website !== undefined) updateData.website = data.website
  if (data.falLicenseNo !== undefined) updateData.falLicenseNo = data.falLicenseNo
  if (data.address !== undefined) updateData.address = data.address
  if (data.addressAr !== undefined) updateData.addressAr = data.addressAr
  if (data.city !== undefined) updateData.city = data.city
  if (data.cityAr !== undefined) updateData.cityAr = data.cityAr
  if (data.district !== undefined) updateData.district = data.district
  if (data.districtAr !== undefined) updateData.districtAr = data.districtAr

  const office = await prisma.office.update({
    where: { id: officeId },
    data: updateData,
  })

  await logAudit({
    officeId,
    userId: user.id,
    action: 'office_settings_updated',
    entity: 'Office',
    entityId: officeId,
    details: { section: 'general' },
  }).catch(() => {})

  return office
}

// ─── Update Theme Settings ──────────────────────────────────

export async function updateOfficeTheme(data: {
  preset?: string
  primaryColor?: string
  accentColor?: string
  backgroundColor?: string
  textColor?: string
  mutedTextColor?: string
  fontFamily?: string
  fontFamilyAr?: string
  borderRadius?: string
  cardStyle?: string
  footerColor?: string
}) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  await requireRole(officeId, ['OWNER', 'MANAGER'])

  const theme = await prisma.themeSettings.upsert({
    where: { officeId },
    create: {
      officeId,
      preset: data.preset || 'navy-gold',
      primaryColor: data.primaryColor || null,
      accentColor: data.accentColor || null,
      backgroundColor: data.backgroundColor || null,
      textColor: data.textColor || null,
      mutedTextColor: data.mutedTextColor || null,
      fontFamily: data.fontFamily || null,
      fontFamilyAr: data.fontFamilyAr || null,
      borderRadius: data.borderRadius || null,
      cardStyle: data.cardStyle || null,
      footerColor: data.footerColor || null,
    },
    update: {
      ...(data.preset !== undefined && { preset: data.preset }),
      ...(data.primaryColor !== undefined && { primaryColor: data.primaryColor }),
      ...(data.accentColor !== undefined && { accentColor: data.accentColor }),
      ...(data.backgroundColor !== undefined && { backgroundColor: data.backgroundColor }),
      ...(data.textColor !== undefined && { textColor: data.textColor }),
      ...(data.mutedTextColor !== undefined && { mutedTextColor: data.mutedTextColor }),
      ...(data.fontFamily !== undefined && { fontFamily: data.fontFamily }),
      ...(data.fontFamilyAr !== undefined && { fontFamilyAr: data.fontFamilyAr }),
      ...(data.borderRadius !== undefined && { borderRadius: data.borderRadius }),
      ...(data.cardStyle !== undefined && { cardStyle: data.cardStyle }),
      ...(data.footerColor !== undefined && { footerColor: data.footerColor }),
    },
  })

  await logAudit({
    officeId,
    userId: user.id,
    action: 'theme_changed',
    entity: 'ThemeSettings',
    entityId: theme.id,
  }).catch(() => {})

  return theme
}

// ─── Update SEO Settings ────────────────────────────────────

export async function updateOfficeSeo(data: {
  seoTitle?: string
  seoTitleAr?: string
  seoDescription?: string
  seoDescriptionAr?: string
  ogImage?: string
}) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  await requireRole(officeId, ['OWNER', 'MANAGER'])

  const office = await prisma.office.update({
    where: { id: officeId },
    data: {
      seoTitle: data.seoTitle,
      seoTitleAr: data.seoTitleAr,
      seoDescription: data.seoDescription,
      seoDescriptionAr: data.seoDescriptionAr,
      ogImage: data.ogImage,
    },
  })

  return office
}

// ─── Update Social Links ────────────────────────────────────

export async function updateOfficeSocial(socialLinks: {
  twitter?: string
  instagram?: string
  snapchat?: string
  linkedin?: string
  tiktok?: string
}) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  await requireRole(officeId, ['OWNER', 'MANAGER'])

  const office = await prisma.office.update({
    where: { id: officeId },
    data: { socialLinks },
  })

  return office
}

// ─── Update Domain Settings ─────────────────────────────────

export async function updateOfficeDomain(data: {
  customDomain?: string
  subdomain?: string
}) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  await requireRole(officeId, ['OWNER'])

  // Check domain uniqueness
  if (data.customDomain) {
    const existing = await prisma.office.findFirst({
      where: {
        customDomain: data.customDomain,
        id: { not: officeId },
      },
    })
    if (existing) throw new Error('This domain is already in use')
  }

  if (data.subdomain) {
    const existing = await prisma.office.findFirst({
      where: {
        subdomain: data.subdomain,
        id: { not: officeId },
      },
    })
    if (existing) throw new Error('This subdomain is already in use')
  }

  const office = await prisma.office.update({
    where: { id: officeId },
    data: {
      customDomain: data.customDomain || null,
      subdomain: data.subdomain || null,
    },
  })

  return office
}

// ─── Update Page Sections ──────────────────────────────────

export async function updateOfficePageSections(sections: any[]) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  await requireRole(officeId, ['OWNER', 'MANAGER'])

  const office = await prisma.office.update({
    where: { id: officeId },
    data: { pageSections: sections },
  })

  await logAudit({
    officeId,
    userId: user.id,
    action: 'page_sections_updated',
    entity: 'Office',
    entityId: officeId,
  }).catch(() => {})

  return office
}

// ─── Get Office Page Sections ──────────────────────────────

export async function getOfficePageSections() {
  const officeId = await getOfficeId()
  const office = await prisma.office.findUnique({
    where: { id: officeId },
    select: { pageSections: true },
  })
  return office?.pageSections || null
}

// ─── Update Page Visibility ──────────────────────────────────

export async function updateOfficePageVisibility(config: {
  about?: boolean
  contact?: boolean
  agents?: boolean
  blog?: boolean
}) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  await requireRole(officeId, ['OWNER', 'MANAGER'])

  const office = await prisma.office.update({
    where: { id: officeId },
    data: { pageVisibility: config },
  })

  await logAudit({
    officeId,
    userId: user.id,
    action: 'page_visibility_updated',
    entity: 'Office',
    entityId: officeId,
    details: config,
  }).catch(() => {})

  return office
}

// ─── Get Office Page Visibility ──────────────────────────────

export async function getOfficePageVisibility() {
  const officeId = await getOfficeId()
  const office = await prisma.office.findUnique({
    where: { id: officeId },
    select: { pageVisibility: true },
  })
  return office?.pageVisibility || null
}

// ─── Update Language Setting ────────────────────────────────

export async function updateOfficeLanguage(defaultLanguage: string) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  await requireRole(officeId, ['OWNER', 'MANAGER'])

  const office = await prisma.office.update({
    where: { id: officeId },
    data: { defaultLanguage },
  })

  return office
}
