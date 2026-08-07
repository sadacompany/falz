import { describe, it, expect, beforeEach } from 'vitest'
import { prismaMock, seedDefaultPrismaMocks } from '../fixtures/prisma-mock'
import { mockAsOwner } from '../fixtures/auth-mock'
import {
  mockSaleProperty,
  mockReservedProperty,
  mockExpiredContractProperty,
  mockOwnerMembership,
} from '../fixtures/test-data'
import {
  updateProperty,
  checkAndArchiveExpiredContracts,
} from '@/lib/actions/properties'
import { createPublicPropertyRequest } from '@/lib/actions/requests'

describe('F9: Status Engine, RESERVED Availability & Auto-Archiving Contracts', () => {
  beforeEach(() => {
    seedDefaultPrismaMocks()
    mockAsOwner()
  })

  it('should record reservedAt timestamp when availability changes to RESERVED', async () => {
    prismaMock.property.update.mockImplementation((args: any) =>
      Promise.resolve({
        ...mockSaleProperty,
        availability: 'RESERVED',
        reservedAt: args.data.reservedAt,
      })
    )

    const updated = await updateProperty('prop-sale-1', {
      availability: 'RESERVED',
    })

    expect(prismaMock.property.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'prop-sale-1', officeId: 'office-123' },
        data: expect.objectContaining({
          availability: 'RESERVED',
          reservedAt: expect.any(Date),
        }),
      })
    )
    expect(updated.availability).toBe('RESERVED')
  })

  it('should reset reservedAt timestamp to null when availability changes away from RESERVED', async () => {
    prismaMock.property.findFirst.mockResolvedValue(mockReservedProperty as any)
    prismaMock.property.update.mockImplementation((args: any) =>
      Promise.resolve({
        ...mockReservedProperty,
        availability: 'AVAILABLE',
        reservedAt: null,
      })
    )

    const updated = await updateProperty('prop-reserved-1', {
      availability: 'AVAILABLE',
    })

    expect(prismaMock.property.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'prop-reserved-1', officeId: 'office-123' },
        data: expect.objectContaining({
          availability: 'AVAILABLE',
          reservedAt: null,
        }),
      })
    )
    expect(updated.reservedAt).toBeNull()
  })

  it('should block public request submission when property status is RESERVED', async () => {
    prismaMock.property.findUnique.mockResolvedValue(mockReservedProperty as any)

    await expect(
      createPublicPropertyRequest({
        propertyId: 'prop-reserved-1',
        name: 'طالب عقار',
        phone: '+966501112233',
      })
    ).rejects.toThrow('عذرًا، العقار غير متوفر حاليًا لتلقي الطلبات.')
  })

  it('should auto-archive expired contracts when contractExpiryDate <= now and autoArchiveOnExpiry is true', async () => {
    prismaMock.property.findMany.mockResolvedValue([mockExpiredContractProperty] as any)
    prismaMock.property.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.membership.findMany.mockResolvedValue([mockOwnerMembership] as any)

    const count = await checkAndArchiveExpiredContracts('office-123')

    expect(prismaMock.property.findMany).toHaveBeenCalledWith({
      where: {
        officeId: 'office-123',
        status: 'PUBLISHED',
        autoArchiveOnExpiry: true,
        contractExpiryDate: { lte: expect.any(Date) },
      },
      select: { id: true, title: true, titleAr: true },
    })

    expect(prismaMock.property.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['prop-expired-1'] }, officeId: 'office-123' },
      data: { status: 'ARCHIVED' },
    })

    expect(prismaMock.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          officeId: 'office-123',
          type: 'property_archived',
        }),
      })
    )
    expect(count).toBe(1)
  })

  it('should NOT archive properties with non-expired contracts (contractExpiryDate in future)', async () => {
    prismaMock.property.findMany.mockResolvedValue([])

    const count = await checkAndArchiveExpiredContracts('office-123')

    expect(prismaMock.property.updateMany).not.toHaveBeenCalled()
    expect(count).toBe(0)
  })
})
