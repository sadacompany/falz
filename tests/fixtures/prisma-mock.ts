import { vi } from 'vitest'
import {
  mockOffice,
  mockOwnerUser,
  mockOwnerMembership,
  mockSaleProperty,
  mockRentProperty,
  mockBidProperty,
  mockLandProperty,
  mockApartmentProperty,
  mockRegaOwner,
  mockBids,
  mockSaudiCityRiyadh,
  mockSaudiCityJeddah,
  mockSaudiDistrictMalqa,
  mockCustomDistrict,
  mockSubtypeDuplex,
} from './test-data'

export function createModelMock() {
  return {
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn().mockResolvedValue(null),
    findFirst: vi.fn().mockResolvedValue(null),
    create: vi
      .fn()
      .mockImplementation((args: any) =>
        Promise.resolve({ id: 'mock-created-id', ...args?.data })
      ),
    createMany: vi.fn().mockResolvedValue({ count: 1 }),
    update: vi.fn().mockImplementation((args: any) =>
      Promise.resolve({
        id: args?.where?.id || 'mock-updated-id',
        ...args?.data,
      })
    ),
    updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    upsert: vi.fn().mockImplementation((args: any) =>
      Promise.resolve({
        id: args?.where?.id || 'mock-upsert-id',
        ...args?.create,
      })
    ),
    delete: vi
      .fn()
      .mockImplementation((args: any) =>
        Promise.resolve({ id: args?.where?.id || 'mock-deleted-id' })
      ),
    deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
    count: vi.fn().mockResolvedValue(0),
    aggregate: vi.fn().mockResolvedValue({
      _count: 0,
      _sum: { price: BigInt(0), amount: BigInt(0) },
      _avg: { price: 0, area: 0 },
      _min: { price: 0 },
      _max: { price: 0 },
    }),
    groupBy: vi.fn().mockResolvedValue([]),
  }
}

export type MockModel = ReturnType<typeof createModelMock>

export function createPrismaMock() {
  const mock = {
    office: createModelMock(),
    user: createModelMock(),
    membership: createModelMock(),
    property: createModelMock(),
    propertyOwner: createModelMock(),
    propertyBid: createModelMock(),
    saudiCity: createModelMock(),
    saudiDistrict: createModelMock(),
    propertyMedia: createModelMock(),
    lead: createModelMock(),
    leadActivity: createModelMock(),
    propertyRequest: createModelMock(),
    visitor: createModelMock(),
    favorite: createModelMock(),
    analyticsEvent: createModelMock(),
    auditLog: createModelMock(),
    notification: createModelMock(),
    invitation: createModelMock(),
    agentProfile: createModelMock(),
    themeSettings: createModelMock(),
    propertySubtype: createModelMock(),
    signboard: createModelMock(),
    missedCall: createModelMock(),
    reminder: createModelMock(),
    plan: createModelMock(),
    subscription: createModelMock(),
    invoice: createModelMock(),
    blogPost: createModelMock(),
    blogCategory: createModelMock(),
    blogTag: createModelMock(),
    contactMessage: createModelMock(),

    $transaction: vi.fn().mockImplementation((arg: any) => {
      if (typeof arg === 'function') {
        return arg(mock)
      }
      if (Array.isArray(arg)) {
        return Promise.all(arg)
      }
      return Promise.resolve(arg)
    }),
    $queryRaw: vi.fn().mockResolvedValue([]),
    $executeRaw: vi.fn().mockResolvedValue(0),
    $connect: vi.fn().mockResolvedValue(undefined),
    $disconnect: vi.fn().mockResolvedValue(undefined),
  }
  return mock
}

export const prismaMock = createPrismaMock()

/**
  Resets all call histories and implementation defaults for prismaMock.
 */
export function resetPrismaMock(): void {
  Object.values(prismaMock).forEach((model: any) => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach((fn: any) => {
        if (typeof fn?.mockReset === 'function') {
          fn.mockReset()
          fn.mockResolvedValue?.(null)
        }
      })
    } else if (typeof model?.mockReset === 'function') {
      model.mockReset()
    }
  })

  // Restore basic defaults for create/createMany/update/delete
  Object.entries(prismaMock).forEach(([key, model]: [string, any]) => {
    if (model && typeof model === 'object' && 'findMany' in model) {
      model.findMany.mockResolvedValue([])
      model.findUnique.mockResolvedValue(null)
      model.findFirst.mockResolvedValue(null)
      model.create.mockImplementation((args: any) =>
        Promise.resolve({ id: `${key}-mock-id`, ...args?.data })
      )
      model.createMany.mockResolvedValue({ count: 1 })
      model.update.mockImplementation((args: any) =>
        Promise.resolve({
          id: args?.where?.id || `${key}-mock-id`,
          ...args?.data,
        })
      )
      model.updateMany.mockResolvedValue({ count: 1 })
      model.upsert.mockImplementation((args: any) =>
        Promise.resolve({
          id: args?.where?.id || `${key}-mock-id`,
          ...args?.create,
        })
      )
      model.delete.mockImplementation((args: any) =>
        Promise.resolve({ id: args?.where?.id || `${key}-mock-id` })
      )
      model.deleteMany.mockResolvedValue({ count: 1 })
      model.count.mockResolvedValue(0)
      model.aggregate.mockResolvedValue({
        _count: 0,
        _sum: { price: BigInt(0), amount: BigInt(0) },
        _avg: { price: 0, area: 0 },
        _min: { price: 0 },
        _max: { price: 0 },
      })
      model.groupBy.mockResolvedValue([])
    }
  })

  prismaMock.$transaction.mockImplementation((arg: any) => {
    if (typeof arg === 'function') {
      return arg(prismaMock)
    }
    if (Array.isArray(arg)) {
      return Promise.all(arg)
    }
    return Promise.resolve(arg)
  })
}

/**
  Populates prismaMock with standard default test data for typical happy path testing.
 */
export function seedDefaultPrismaMocks(): void {
  resetPrismaMock()

  prismaMock.office.findUnique.mockResolvedValue(mockOffice as any)
  prismaMock.office.findFirst.mockResolvedValue(mockOffice as any)
  prismaMock.office.findMany.mockResolvedValue([mockOffice] as any)

  prismaMock.user.findUnique.mockResolvedValue(mockOwnerUser as any)
  prismaMock.user.findMany.mockResolvedValue([mockOwnerUser] as any)

  prismaMock.membership.findMany.mockResolvedValue([
    mockOwnerMembership,
  ] as any)
  prismaMock.membership.findFirst.mockResolvedValue(
    mockOwnerMembership as any
  )

  prismaMock.property.findUnique.mockResolvedValue(mockSaleProperty as any)
  prismaMock.property.findFirst.mockResolvedValue(mockSaleProperty as any)
  prismaMock.property.findMany.mockResolvedValue([
    mockSaleProperty,
    mockRentProperty,
    mockBidProperty,
    mockLandProperty,
    mockApartmentProperty,
  ] as any)

  prismaMock.propertyOwner.findUnique.mockResolvedValue(mockRegaOwner as any)
  prismaMock.propertyOwner.findMany.mockResolvedValue([mockRegaOwner] as any)

  prismaMock.propertyBid.findMany.mockResolvedValue(mockBids as any)

  prismaMock.saudiCity.findMany.mockResolvedValue([
    mockSaudiCityRiyadh,
    mockSaudiCityJeddah,
  ] as any)
  prismaMock.saudiDistrict.findMany.mockResolvedValue([
    mockSaudiDistrictMalqa,
    mockCustomDistrict,
  ] as any)

  prismaMock.propertySubtype.findMany.mockResolvedValue([
    mockSubtypeDuplex,
  ] as any)
}
