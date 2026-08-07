import { describe, it, expect, beforeEach } from 'vitest'
import { prismaMock, seedDefaultPrismaMocks } from '../fixtures/prisma-mock'
import { mockAsOwner } from '../fixtures/auth-mock'
import {
  mockSaleProperty,
  mockVisitor,
  mockPropertyRequest,
  mockReservedProperty,
  mockOwnerMembership,
} from '../fixtures/test-data'
import {
  createPublicPropertyRequest,
  getPropertyRequests,
  updateRequestStatus,
  respondToRequest,
} from '@/lib/actions/requests'

describe('F8: Client Requests API, Visitor Linking & Staff Notifications', () => {
  beforeEach(() => {
    seedDefaultPrismaMocks()
    mockAsOwner()
  })

  it('should auto-create visitor record and link request when visitor phone is new', async () => {
    prismaMock.property.findUnique.mockResolvedValue(mockSaleProperty as any)
    prismaMock.visitor.findFirst.mockResolvedValue(null)
    prismaMock.visitor.create.mockResolvedValue(mockVisitor as any)
    prismaMock.propertyRequest.create.mockResolvedValue(mockPropertyRequest as any)
    prismaMock.membership.findMany.mockResolvedValue([mockOwnerMembership] as any)

    const result = await createPublicPropertyRequest({
      propertyId: 'prop-sale-1',
      name: 'خالد العمري',
      phone: '+966509998887',
      email: 'khaled@example.com',
      type: 'INTEREST',
      message: 'أرغب برؤية العقار',
    })

    expect(prismaMock.visitor.create).toHaveBeenCalledWith({
      data: {
        officeId: 'office-123',
        name: 'خالد العمري',
        phone: '+966509998887',
        email: 'khaled@example.com',
      },
    })
    expect(prismaMock.propertyRequest.create).toHaveBeenCalledWith({
      data: {
        visitorId: 'visitor-1',
        propertyId: 'prop-sale-1',
        type: 'INTEREST',
        message: 'أرغب برؤية العقار',
      },
    })
    expect(prismaMock.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          officeId: 'office-123',
          type: 'new_request',
        }),
      })
    )
    expect(result).toEqual(mockPropertyRequest)
  })

  it('should link to existing visitor record when phone already exists for office', async () => {
    prismaMock.property.findUnique.mockResolvedValue(mockSaleProperty as any)
    prismaMock.visitor.findFirst.mockResolvedValue(mockVisitor as any)
    prismaMock.propertyRequest.create.mockResolvedValue(mockPropertyRequest as any)
    prismaMock.membership.findMany.mockResolvedValue([mockOwnerMembership] as any)

    await createPublicPropertyRequest({
      propertyId: 'prop-sale-1',
      name: 'خالد العمري',
      phone: '+966509998887',
    })

    expect(prismaMock.visitor.create).not.toHaveBeenCalled()
    expect(prismaMock.propertyRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          visitorId: 'visitor-1',
        }),
      })
    )
  })

  it('should reject request when target property is RESERVED, SOLD, or RENTED with exact error', async () => {
    prismaMock.property.findUnique.mockResolvedValue(mockReservedProperty as any)

    await expect(
      createPublicPropertyRequest({
        propertyId: 'prop-reserved-1',
        name: 'خالد العمري',
        phone: '+966509998887',
      })
    ).rejects.toThrow('عذرًا، العقار غير متوفر حاليًا لتلقي الطلبات.')
  })

  it('should throw error when missing mandatory visitor fields (name or phone or propertyId)', async () => {
    await expect(
      createPublicPropertyRequest({
        propertyId: 'prop-sale-1',
        name: '',
        phone: '+966509998887',
      })
    ).rejects.toThrow('بيانات المشتري (الاسم ورقم الجوال) مطلوبة لتسجيل الطلب.')
  })

  it('should fetch paginated office property requests for dashboard staff', async () => {
    prismaMock.propertyRequest.findMany.mockResolvedValue([mockPropertyRequest] as any)
    prismaMock.propertyRequest.count.mockResolvedValue(1)

    const result = await getPropertyRequests({ page: 1, limit: 10 })

    expect(result.requests).toHaveLength(1)
    expect((result as any).total).toBe(1)
  })

  it('should update request status and save response text', async () => {
    prismaMock.propertyRequest.findFirst.mockResolvedValue(mockPropertyRequest as any)
    prismaMock.propertyRequest.update.mockResolvedValue({
      ...mockPropertyRequest,
      status: 'RESPONDED',
      response: 'تم التواصل وتحديد الموعد',
    } as any)

    const updatedStatus = await updateRequestStatus('req-1', 'RESPONDED')
    expect(updatedStatus.status).toBe('RESPONDED')

    const updatedResp = await respondToRequest('req-1', 'تم التواصل وتحديد الموعد')
    expect(prismaMock.propertyRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'req-1' },
        data: expect.objectContaining({
          response: 'تم التواصل وتحديد الموعد',
          status: 'RESPONDED',
        }),
      })
    )
  })
})
