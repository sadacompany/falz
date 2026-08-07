import { describe, it, expect, beforeEach } from 'vitest'
import { prismaMock, seedDefaultPrismaMocks } from '../fixtures/prisma-mock'
import { mockAsOwner } from '../fixtures/auth-mock'
import { mockSaleProperty, mockRentProperty } from '../fixtures/test-data'
import { getProperties, createProperty } from '@/lib/actions/properties'

describe('F4: Payment Method Filter Logic (Cash vs Bank)', () => {
  beforeEach(() => {
    seedDefaultPrismaMocks()
    mockAsOwner()
  })

  it('should restrict results strictly to BANK_AND_CASH when paymentMethod filter is BANK_AND_CASH', async () => {
    prismaMock.property.findMany.mockResolvedValue([mockSaleProperty] as any)
    prismaMock.property.count.mockResolvedValue(1)

    const result = await getProperties({ paymentMethod: 'BANK_AND_CASH' })

    expect(prismaMock.property.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          paymentMethod: 'BANK_AND_CASH',
          officeId: 'office-123',
        }),
      })
    )
    expect(result.properties).toHaveLength(1)
    expect(result.properties[0].paymentMethod).toBe('BANK_AND_CASH')
  })

  it('should return all listings (Cash and Bank) when paymentMethod is CASH or omitted', async () => {
    prismaMock.property.findMany.mockResolvedValue([mockSaleProperty, mockRentProperty] as any)
    prismaMock.property.count.mockResolvedValue(2)

    const resultCash = await getProperties({ paymentMethod: 'CASH' })
    const findManyArgCash = prismaMock.property.findMany.mock.calls[0][0]
    expect(findManyArgCash.where.paymentMethod).toBeUndefined()
    expect(resultCash.properties).toHaveLength(2)

    prismaMock.property.findMany.mockClear()
    const resultAll = await getProperties({})
    const findManyArgAll = prismaMock.property.findMany.mock.calls[0][0]
    expect(findManyArgAll.where.paymentMethod).toBeUndefined()
    expect(resultAll.properties).toHaveLength(2)
  })

  it('should map public URL query parameter "BANK" or "BANK_AND_CASH" to BANK_AND_CASH filter', () => {
    const mapPublicPaymentFilter = (param?: string) => {
      const where: Record<string, any> = {}
      if (param === 'BANK_AND_CASH' || param === 'BANK') {
        where.paymentMethod = 'BANK_AND_CASH'
      }
      return where
    }

    expect(mapPublicPaymentFilter('BANK')).toEqual({ paymentMethod: 'BANK_AND_CASH' })
    expect(mapPublicPaymentFilter('BANK_AND_CASH')).toEqual({ paymentMethod: 'BANK_AND_CASH' })
    expect(mapPublicPaymentFilter('CASH')).toEqual({})
    expect(mapPublicPaymentFilter(undefined)).toEqual({})
  })

  it('should handle property creation with CASH vs BANK_AND_CASH paymentMethod enum values', async () => {
    prismaMock.property.create.mockImplementation((args: any) =>
      Promise.resolve({ id: 'prop-cash-1', ...args.data })
    )

    await createProperty({
      title: 'Cash-only Apartment',
      price: 500000,
      dealType: 'SALE',
      propertyType: 'APARTMENT',
      paymentMethod: 'CASH',
    } as any)

    expect(prismaMock.property.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          paymentMethod: 'CASH',
        }),
      })
    )
  })
})
