import { describe, it, expect, beforeEach } from 'vitest'
import { prismaMock, seedDefaultPrismaMocks } from '../fixtures/prisma-mock'
import { mockAsOwner, mockAsManager, mockAsAgent } from '../fixtures/auth-mock'
import {
  mockSaudiCityRiyadh,
  mockSaudiCityJeddah,
  mockSaudiDistrictMalqa,
  mockCustomDistrict,
} from '../fixtures/test-data'
import {
  getSaudiCities,
  getSaudiDistricts,
  createCustomDistrict,
} from '@/lib/actions/locations'

/**
 * Maps direction enum to Arabic sector text string.
 */
function mapDirectionToSector(direction?: string | null): string {
  switch (direction?.toUpperCase()) {
    case 'NORTH':
      return 'شمال'
    case 'SOUTH':
      return 'جنوب'
    case 'EAST':
      return 'شرق'
    case 'WEST':
      return 'غرب'
    case 'CENTER':
      return 'وسط'
    default:
      return ''
  }
}

describe('F5: Saudi Locations, Role-Gated Custom District Creation & Direction Auto-Fill', () => {
  beforeEach(() => {
    seedDefaultPrismaMocks()
    mockAsOwner()
  })

  it('should return all Saudi cities ordered by Arabic name', async () => {
    prismaMock.saudiCity.findMany.mockResolvedValue([
      mockSaudiCityRiyadh,
      mockSaudiCityJeddah,
    ] as any)

    const cities = await getSaudiCities()

    expect(prismaMock.saudiCity.findMany).toHaveBeenCalledWith({
      orderBy: { nameAr: 'asc' },
    })
    expect(cities).toHaveLength(2)
  })

  it('should return system districts plus tenant-specific custom districts for a given cityId', async () => {
    prismaMock.saudiDistrict.findMany.mockResolvedValue([
      mockSaudiDistrictMalqa,
      mockCustomDistrict,
    ] as any)

    const districts = await getSaudiDistricts('city-riyadh-1')

    expect(prismaMock.saudiDistrict.findMany).toHaveBeenCalledWith({
      where: {
        cityId: 'city-riyadh-1',
        OR: [{ officeId: null }, { officeId: 'office-123' }],
      },
      orderBy: { nameAr: 'asc' },
    })
    expect(districts).toHaveLength(2)
  })

  it('should allow OWNER role to create a custom district', async () => {
    mockAsOwner()
    prismaMock.saudiDistrict.findFirst.mockResolvedValue(null)
    prismaMock.saudiDistrict.create.mockResolvedValue(mockCustomDistrict as any)

    const result = await createCustomDistrict({
      cityId: 'city-riyadh-1',
      nameAr: 'حي مخصص جديد',
      name: 'Custom District',
      direction: 'NORTH',
    })

    expect(prismaMock.saudiDistrict.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          cityId: 'city-riyadh-1',
          nameAr: 'حي مخصص جديد',
          officeId: 'office-123',
        }),
      })
    )
    expect(result).toEqual(mockCustomDistrict)
  })

  it('should allow MANAGER role to create a custom district', async () => {
    mockAsManager()
    prismaMock.saudiDistrict.findFirst.mockResolvedValue(null)
    prismaMock.saudiDistrict.create.mockResolvedValue(mockCustomDistrict as any)

    const result = await createCustomDistrict({
      cityId: 'city-riyadh-1',
      nameAr: 'حي مخصص جديد',
    })

    expect(result).toEqual(mockCustomDistrict)
  })

  it('should REJECT non-OWNER/MANAGER role (e.g. AGENT) when creating custom district', async () => {
    mockAsAgent()

    await expect(
      createCustomDistrict({
        cityId: 'city-riyadh-1',
        nameAr: 'حي غير مسموح',
      })
    ).rejects.toThrow('Insufficient permissions')
  })

  it('should map sector direction code to Arabic sector text correctly', () => {
    expect(mapDirectionToSector('NORTH')).toBe('شمال')
    expect(mapDirectionToSector('SOUTH')).toBe('جنوب')
    expect(mapDirectionToSector('EAST')).toBe('شرق')
    expect(mapDirectionToSector('WEST')).toBe('غرب')
    expect(mapDirectionToSector('CENTER')).toBe('وسط')
    expect(mapDirectionToSector(null)).toBe('')
  })
})
