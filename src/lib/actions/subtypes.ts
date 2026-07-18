'use server'

import prisma from '@/lib/db'
import { requireAuth } from '@/lib/auth-utils'
import { PropertyCategory } from '@prisma/client'

// ─── Default Sub-types for Seeding ──────────────────────────
const DEFAULT_SUBTYPES = {
  RESIDENTIAL: [
    { name: 'شقة', category: PropertyCategory.RESIDENTIAL },
    { name: 'فيلا', category: PropertyCategory.RESIDENTIAL },
    { name: 'دوبلكس', category: PropertyCategory.RESIDENTIAL },
    { name: 'مجمع سكني', category: PropertyCategory.RESIDENTIAL },
    { name: 'أرض سكنية', category: PropertyCategory.RESIDENTIAL },
    { name: 'تاون هاوس', category: PropertyCategory.RESIDENTIAL },
    { name: 'شاليه', category: PropertyCategory.RESIDENTIAL },
  ],
  COMMERCIAL: [
    { name: 'مكتب', category: PropertyCategory.COMMERCIAL },
    { name: 'معرض/محل', category: PropertyCategory.COMMERCIAL },
    { name: 'مستودع', category: PropertyCategory.COMMERCIAL },
    { name: 'عمارة تجارية', category: PropertyCategory.COMMERCIAL },
    { name: 'أرض تجارية', category: PropertyCategory.COMMERCIAL },
  ],
  AGRICULTURAL: [
    { name: 'مزرعة', category: PropertyCategory.AGRICULTURAL },
    { name: 'أرض زراعية', category: PropertyCategory.AGRICULTURAL },
    { name: 'استراحة', category: PropertyCategory.AGRICULTURAL },
  ],
}

// ─── Helper: Get officeId from user ─────────────────────────
async function getOfficeId(): Promise<string> {
  const user = await requireAuth()
  const membership = user.memberships[0]
  if (!membership) throw new Error('No office membership found')
  return membership.officeId
}

// ─── Get Sub-types List (with dynamic lazy seeding) ──────────
export async function getSubtypes(category?: PropertyCategory) {
  const officeId = await getOfficeId()

  // Check if any subtypes exist for this office
  const count = await prisma.propertySubtype.count({
    where: { officeId },
  })

  // Seed defaults if none exist
  if (count === 0) {
    const allDefaults = [
      ...DEFAULT_SUBTYPES.RESIDENTIAL,
      ...DEFAULT_SUBTYPES.COMMERCIAL,
      ...DEFAULT_SUBTYPES.AGRICULTURAL,
    ]
    await prisma.propertySubtype.createMany({
      data: allDefaults.map((d) => ({
        officeId,
        name: d.name,
        category: d.category,
      })),
      skipDuplicates: true,
    })
  }

  return prisma.propertySubtype.findMany({
    where: {
      officeId,
      ...(category && { category }),
    },
    orderBy: { name: 'asc' },
  })
}

// ─── Create Custom Sub-type ─────────────────────────────────
export async function createSubtype(name: string, category: PropertyCategory) {
  const officeId = await getOfficeId()

  const trimmedName = name.trim()
  if (!trimmedName) throw new Error('الاسم مطلوب')

  const existing = await prisma.propertySubtype.findUnique({
    where: {
      officeId_name_category: {
        officeId,
        name: trimmedName,
        category,
      },
    },
  })

  if (existing) {
    throw new Error('هذا التصنيف الفرعي موجود بالفعل')
  }

  const subtype = await prisma.propertySubtype.create({
    data: {
      officeId,
      name: trimmedName,
      category,
    },
  })

  return subtype
}

// ─── Delete Sub-type ────────────────────────────────────────
export async function deleteSubtype(id: string) {
  const officeId = await getOfficeId()

  const existing = await prisma.propertySubtype.findFirst({
    where: { id, officeId },
  })

  if (!existing) {
    throw new Error('التصنيف الفرعي غير موجود')
  }

  await prisma.propertySubtype.delete({
    where: { id, officeId },
  })

  return { success: true }
}
