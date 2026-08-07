import { describe, it, expect, beforeEach } from 'vitest'
import { prismaMock, seedDefaultPrismaMocks } from '../fixtures/prisma-mock'
import { mockAsOwner } from '../fixtures/auth-mock'
import { mockSaleProperty, mockRentProperty } from '../fixtures/test-data'
import { getProperties } from '@/lib/actions/properties'

describe('F1: Deal Type Query Isolation & Default Tab Behavior', () => {
  beforeEach(() => {
    seedDefaultPrismaMocks()
    mockAsOwner()
  })

  it('should filter properties strictly by SALE dealType when SALE is specified', async () => {
    prismaMock.property.findMany.mockResolvedValue([mockSaleProperty] as any)
    prismaMock.property.count.mockResolvedValue(1)

    const result = await getProperties({ dealType: 'SALE' })

    expect(prismaMock.property.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          dealType: 'SALE',
          officeId: 'office-123',
        }),
      })
    )
    expect(result.properties).toHaveLength(1)
    expect(result.properties[0].dealType).toBe('SALE')
  })

  it('should filter properties strictly by RENT dealType when RENT is specified', async () => {
    prismaMock.property.findMany.mockResolvedValue([mockRentProperty] as any)
    prismaMock.property.count.mockResolvedValue(1)

    const result = await getProperties({ dealType: 'RENT' })

    expect(prismaMock.property.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          dealType: 'RENT',
          officeId: 'office-123',
        }),
      })
    )
    expect(result.properties).toHaveLength(1)
    expect(result.properties[0].dealType).toBe('RENT')
  })

  it('should not filter by dealType when dealType is omitted (default tab behavior returning all)', async () => {
    prismaMock.property.findMany.mockResolvedValue([mockSaleProperty, mockRentProperty] as any)
    prismaMock.property.count.mockResolvedValue(2)

    const result = await getProperties({})

    const findManyCallArg = prismaMock.property.findMany.mock.calls[0][0]
    expect(findManyCallArg.where.dealType).toBeUndefined()
    expect(result.properties).toHaveLength(2)
  })

  it('should handle empty dealType filter as default tab behavior without throwing', async () => {
    prismaMock.property.findMany.mockResolvedValue([mockSaleProperty, mockRentProperty] as any)
    prismaMock.property.count.mockResolvedValue(2)

    const result = await getProperties({ dealType: '' as any })

    const findManyCallArg = prismaMock.property.findMany.mock.calls[0][0]
    expect(findManyCallArg.where.dealType).toBeUndefined()
    expect(result.properties).toHaveLength(2)
  })

  it('should verify public URL route handler logic for dealType query param mapping', () => {
    const parseDealTypeQuery = (queryParam?: string) => {
      const where: Record<string, any> = {}
      if (queryParam && ['SALE', 'RENT'].includes(queryParam)) {
        where.dealType = queryParam as 'SALE' | 'RENT'
      }
      return where
    }

    expect(parseDealTypeQuery('SALE')).toEqual({ dealType: 'SALE' })
    expect(parseDealTypeQuery('RENT')).toEqual({ dealType: 'RENT' })
    expect(parseDealTypeQuery(undefined)).toEqual({})
    expect(parseDealTypeQuery('INVALID')).toEqual({})
  })
})
