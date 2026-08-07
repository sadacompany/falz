import { describe, it, expect, beforeEach } from 'vitest'
import { prismaMock, seedDefaultPrismaMocks } from '../fixtures/prisma-mock'
import { mockAsOwner } from '../fixtures/auth-mock'
import { mockRegaOwner } from '../fixtures/test-data'
import { createOwner, updateOwner, deleteOwner } from '@/lib/actions/owners'

describe('F2: REGA Compliance Validation & Owner Management', () => {
  beforeEach(() => {
    seedDefaultPrismaMocks()
    mockAsOwner()
  })

  it('should successfully create an owner when all REGA mandatory fields are provided', async () => {
    prismaMock.propertyOwner.findUnique.mockResolvedValue(null)
    prismaMock.propertyOwner.create.mockResolvedValue(mockRegaOwner as any)

    const ownerData = {
      name: 'أحمد الفالح',
      phone: '+966504444444',
      nationalId: '1012345678',
      dob: new Date('1990-01-15'),
      type: 'OWNER' as const,
    }

    const result = await createOwner(ownerData)

    expect(prismaMock.propertyOwner.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          officeId: 'office-123',
          name: 'أحمد الفالح',
          phone: '+966504444444',
          nationalId: '1012345678',
        }),
      })
    )
    expect(result).toEqual(mockRegaOwner)
  })

  it('should reject creation with exact REGA error message when nationalId is missing', async () => {
    const ownerData = {
      name: 'أحمد الفالح',
      phone: '+966504444444',
      dob: new Date('1990-01-15'),
    }

    await expect(createOwner(ownerData as any)).rejects.toThrow(
      'رقم الهوية وتاريخ الميلاد إجباريان لبلاغات الهيئة العامة للعقار (REGA)'
    )
  })

  it('should reject creation with exact REGA error message when dob is missing', async () => {
    const ownerData = {
      name: 'أحمد الفالح',
      phone: '+966504444444',
      nationalId: '1012345678',
    }

    await expect(createOwner(ownerData as any)).rejects.toThrow(
      'رقم الهوية وتاريخ الميلاد إجباريان لبلاغات الهيئة العامة للعقار (REGA)'
    )
  })

  it('should reject creation with exact REGA error message when name or phone is empty', async () => {
    const ownerDataEmptyName = {
      name: '   ',
      phone: '+966504444444',
      nationalId: '1012345678',
      dob: new Date('1990-01-15'),
    }

    await expect(createOwner(ownerDataEmptyName as any)).rejects.toThrow(
      'رقم الهوية وتاريخ الميلاد إجباريان لبلاغات الهيئة العامة للعقار (REGA)'
    )

    const ownerDataEmptyPhone = {
      name: 'أحمد الفالح',
      phone: '',
      nationalId: '1012345678',
      dob: new Date('1990-01-15'),
    }

    await expect(createOwner(ownerDataEmptyPhone as any)).rejects.toThrow(
      'رقم الهوية وتاريخ الميلاد إجباريان لبلاغات الهيئة العامة للعقار (REGA)'
    )
  })

  it('should throw error when duplicate phone exists for the same office', async () => {
    prismaMock.propertyOwner.findFirst.mockResolvedValue(mockRegaOwner as any)

    const ownerData = {
      name: 'أحمد الفالح الثاني',
      phone: '+966504444444',
      nationalId: '1099999999',
      dob: new Date('1992-05-20'),
    }

    await expect(createOwner(ownerData)).rejects.toThrow(
      'رقم الهاتف مسجل بالفعل لمالك آخر في هذا المكتب'
    )
  })

  it('should enforce multi-tenant isolation on updateOwner and deleteOwner', async () => {
    prismaMock.propertyOwner.findFirst.mockResolvedValue(mockRegaOwner as any)
    prismaMock.propertyOwner.update.mockResolvedValue({
      ...mockRegaOwner,
      name: 'أحمد الفالح المعدل',
    } as any)

    await updateOwner('owner-rega-1', { name: 'أحمد الفالح المعدل' })
    expect(prismaMock.propertyOwner.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'owner-rega-1', officeId: 'office-123' },
      })
    )

    prismaMock.propertyOwner.delete.mockResolvedValue(mockRegaOwner as any)
    await deleteOwner('owner-rega-1')
    expect(prismaMock.propertyOwner.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'owner-rega-1', officeId: 'office-123' },
      })
    )
  })
})
