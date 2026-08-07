import { describe, it, expect, beforeEach } from 'vitest'
import { PropertyCategory } from '@prisma/client'
import { prismaMock, seedDefaultPrismaMocks } from '../fixtures/prisma-mock'
import { mockAsOwner, mockAsManager, mockAsAgent } from '../fixtures/auth-mock'
import { mockSubtypeDuplex } from '../fixtures/test-data'
import {
  getSubtypes,
  createSubtype,
  deleteSubtype,
} from '@/lib/actions/subtypes'

describe('F14: Custom Subtypes API, Lazy Default Seeding & RBAC', () => {
  beforeEach(() => {
    seedDefaultPrismaMocks()
    mockAsOwner()
  })

  it('should auto-seed default subtypes when office count is 0 on first call', async () => {
    prismaMock.propertySubtype.count.mockResolvedValue(0)
    prismaMock.propertySubtype.findMany.mockResolvedValue([mockSubtypeDuplex] as any)

    const subtypes = await getSubtypes()

    expect(prismaMock.propertySubtype.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skipDuplicates: true,
      })
    )
    expect(subtypes).toHaveLength(1)
  })

  it('should allow OWNER role to create a new custom subtype', async () => {
    mockAsOwner()
    prismaMock.propertySubtype.findUnique.mockResolvedValue(null)
    prismaMock.propertySubtype.create.mockResolvedValue({
      id: 'subtype-custom',
      officeId: 'office-123',
      name: 'استديو فاخر',
      category: PropertyCategory.RESIDENTIAL,
    } as any)

    const created = await createSubtype('استديو فاخر', PropertyCategory.RESIDENTIAL)

    expect(prismaMock.propertySubtype.create).toHaveBeenCalledWith({
      data: {
        officeId: 'office-123',
        name: 'استديو فاخر',
        category: PropertyCategory.RESIDENTIAL,
      },
    })
    expect(created.name).toBe('استديو فاخر')
  })

  it('should allow MANAGER role to create a custom subtype', async () => {
    mockAsManager()
    prismaMock.propertySubtype.findUnique.mockResolvedValue(null)
    prismaMock.propertySubtype.create.mockResolvedValue(mockSubtypeDuplex as any)

    const created = await createSubtype('دوبلكس', PropertyCategory.RESIDENTIAL)

    expect(created).toEqual(mockSubtypeDuplex)
  })

  it('should REJECT non-OWNER/MANAGER role (e.g. AGENT) when creating custom subtype', async () => {
    mockAsAgent()

    await expect(
      createSubtype('غير مسموح', PropertyCategory.RESIDENTIAL)
    ).rejects.toThrow('Insufficient permissions')
  })

  it('should reject creation of duplicate subtype within same category for office', async () => {
    mockAsOwner()
    prismaMock.propertySubtype.findUnique.mockResolvedValue(mockSubtypeDuplex as any)

    await expect(
      createSubtype('دوبلكس', PropertyCategory.RESIDENTIAL)
    ).rejects.toThrow('هذا التصنيف الفرعي موجود بالفعل')
  })

  it('should allow OWNER/MANAGER to delete subtype and reject AGENT role', async () => {
    mockAsOwner()
    prismaMock.propertySubtype.findFirst.mockResolvedValue(mockSubtypeDuplex as any)

    const result = await deleteSubtype('subtype-1')
    expect(result).toEqual({ success: true })

    mockAsAgent()
    await expect(deleteSubtype('subtype-1')).rejects.toThrow('Insufficient permissions')
  })
})
