'use server'

import prisma from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth-utils'

export async function getSaudiCities() {
  return prisma.saudiCity.findMany({
    orderBy: { nameAr: 'asc' },
  })
}

export async function getSaudiDistricts(cityId: string) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId

  if (!cityId) return []

  return prisma.saudiDistrict.findMany({
    where: {
      cityId,
      OR: [
        { officeId: null },
        ...(officeId ? [{ officeId }] : []),
      ],
    },
    orderBy: { nameAr: 'asc' },
  })
}

export async function createCustomDistrict(input: {
  cityId: string
  nameAr: string
  name?: string
  direction?: string
}) {
  const user = await requireAuth()
  const officeId = user.memberships[0]?.officeId
  if (!officeId) throw new Error('No office membership found')

  await requireRole(officeId, ['OWNER', 'MANAGER'])

  const trimmedNameAr = input.nameAr.trim()
  if (!input.cityId || !trimmedNameAr) {
    throw new Error('المدينة واسم الحي إجباريان')
  }

  const existing = await prisma.saudiDistrict.findFirst({
    where: {
      cityId: input.cityId,
      nameAr: trimmedNameAr,
      officeId,
    },
  })

  if (existing) {
    throw new Error('هذا الحي مضاف بالفعل لعلامتك التجارية')
  }

  return prisma.saudiDistrict.create({
    data: {
      cityId: input.cityId,
      officeId,
      nameAr: trimmedNameAr,
      name: input.name?.trim() || trimmedNameAr,
      direction: input.direction || null,
    },
  })
}
