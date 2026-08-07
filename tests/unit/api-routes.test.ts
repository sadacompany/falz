import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prismaMock, seedDefaultPrismaMocks } from '../fixtures/prisma-mock'
import { mockAsOwner, mockAsManager, mockAsAgent, mockUnauthenticated } from '../fixtures/auth-mock'
import { mockSaudiCityRiyadh, mockSaudiDistrictMalqa, mockSubtypeDuplex, mockSaleProperty, mockOwnerMembership } from '../fixtures/test-data'

import { GET as getCities } from '@/app/api/locations/cities/route'
import { GET as getDistricts, POST as createDistrict } from '@/app/api/locations/districts/route'
import { GET as getSubtypesRoute, POST as createSubtypeRoute } from '@/app/api/subtypes/route'
import { POST as createRequestRoute } from '@/app/api/requests/route'
import { POST as uploadRoute } from '@/app/api/upload/route'

// Mock storage module for file upload route
vi.mock('@/lib/storage', () => ({
  uploadFile: vi.fn().mockResolvedValue({
    url: 'https://example.com/upload.jpg',
    path: 'uploads/upload.jpg',
    filename: 'upload.jpg',
    size: 1024,
    mimeType: 'image/jpeg',
  }),
}))

// Mock NextAuth session helper
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: 'user-owner-1', email: 'owner@example.com' } }),
}))

describe('API Routes Suite (Exhaustive Coverage per Route Handler)', () => {
  beforeEach(() => {
    seedDefaultPrismaMocks()
    mockAsOwner()
  })

  // ─── 1. /api/locations/cities ─────────────────────────────
  describe('GET /api/locations/cities', () => {
    it('should return 200 with cities array on success', async () => {
      prismaMock.saudiCity.findMany.mockResolvedValue([mockSaudiCityRiyadh] as any)

      const response = await getCities()
      expect(response.status).toBe(200)

      const json = await response.json()
      expect(json.cities).toHaveLength(1)
      expect(json.cities[0].nameAr).toBe('الرياض')
    })

    it('should return 500 status when database query fails', async () => {
      prismaMock.saudiCity.findMany.mockRejectedValue(new Error('DB Error'))

      const response = await getCities()
      expect(response.status).toBe(500)

      const json = await response.json()
      expect(json.error).toBe('DB Error')
    })
  })

  // ─── 2. /api/locations/districts ──────────────────────────
  describe('/api/locations/districts', () => {
    it('GET: should return 200 with system & custom districts for valid cityId', async () => {
      prismaMock.saudiDistrict.findMany.mockResolvedValue([mockSaudiDistrictMalqa] as any)

      const req = new Request('http://localhost:3000/api/locations/districts?cityId=city-riyadh-1')
      const response = await getDistricts(req)
      expect(response.status).toBe(200)

      const json = await response.json()
      expect(json.districts).toHaveLength(1)
    })

    it('GET: should return empty districts array when cityId is missing', async () => {
      const req = new Request('http://localhost:3000/api/locations/districts')
      const response = await getDistricts(req)
      expect(response.status).toBe(200)

      const json = await response.json()
      expect(json.districts).toHaveLength(0)
    })

    it('POST: should create custom district for OWNER role', async () => {
      mockAsOwner()
      prismaMock.saudiDistrict.findFirst.mockResolvedValue(null)
      prismaMock.saudiDistrict.create.mockResolvedValue(mockSaudiDistrictMalqa as any)

      const req = new Request('http://localhost:3000/api/locations/districts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId: 'city-riyadh-1',
          nameAr: 'الملقا الجديد',
        }),
      })

      const response = await createDistrict(req)
      expect(response.status).toBe(200)
    })

    it('POST: should return 400 error when cityId or nameAr is missing', async () => {
      mockAsOwner()
      const req = new Request('http://localhost:3000/api/locations/districts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityId: 'city-riyadh-1' }),
      })

      const response = await createDistrict(req)
      expect(response.status).toBe(400)

      const json = await response.json()
      expect(json.error).toBe('المدينة واسم الحي إجباريان')
    })
  })

  // ─── 3. /api/subtypes ──────────────────────────────────────
  describe('/api/subtypes', () => {
    it('GET: should return 200 with subtypes array', async () => {
      prismaMock.propertySubtype.count.mockResolvedValue(1)
      prismaMock.propertySubtype.findMany.mockResolvedValue([mockSubtypeDuplex] as any)

      const req = new Request('http://localhost:3000/api/subtypes')
      const response = await getSubtypesRoute(req)
      expect(response.status).toBe(200)

      const json = await response.json()
      expect(json.subtypes).toHaveLength(1)
    })

    it('POST: should create subtype for MANAGER role and return 200', async () => {
      mockAsManager()
      prismaMock.propertySubtype.findUnique.mockResolvedValue(null)
      prismaMock.propertySubtype.create.mockResolvedValue(mockSubtypeDuplex as any)

      const req = new Request('http://localhost:3000/api/subtypes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'دوبلكس',
          category: 'RESIDENTIAL',
        }),
      })

      const response = await createSubtypeRoute(req)
      expect(response.status).toBe(200)
    })

    it('POST: should return 400 when missing name or category', async () => {
      mockAsOwner()
      const req = new Request('http://localhost:3000/api/subtypes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'دوبلكس' }),
      })

      const response = await createSubtypeRoute(req)
      expect(response.status).toBe(400)
    })
  })

  // ─── 4. /api/requests ──────────────────────────────────────
  describe('POST /api/requests', () => {
    it('should return 200 with created request for valid payload', async () => {
      prismaMock.property.findUnique.mockResolvedValue(mockSaleProperty as any)
      prismaMock.visitor.findFirst.mockResolvedValue(null)
      prismaMock.visitor.create.mockResolvedValue({ id: 'visitor-1' } as any)
      prismaMock.propertyRequest.create.mockResolvedValue({ id: 'req-1' } as any)
      prismaMock.membership.findMany.mockResolvedValue([mockOwnerMembership] as any)

      const req = new Request('http://localhost:3000/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'prop-sale-1',
          name: 'خالد العمري',
          phone: '+966509998887',
        }),
      })

      const response = await createRequestRoute(req)
      expect(response.status).toBe(200)

      const json = await response.json()
      expect(json.success).toBe(true)
    })

    it('should return 400 error when propertyId, name, or phone is missing', async () => {
      const req = new Request('http://localhost:3000/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'prop-sale-1',
        }),
      })

      const response = await createRequestRoute(req)
      expect(response.status).toBe(400)
    })
  })

  // ─── 5. /api/upload ────────────────────────────────────────
  describe('POST /api/upload', () => {
    it('should upload valid file and return 200 with data', async () => {
      const formData = new FormData()
      const dummyFile = new File(['dummy content'], 'photo.jpg', { type: 'image/jpeg' })
      formData.append('file', dummyFile)

      const req = new Request('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      }) as any

      const response = await uploadRoute(req)
      expect(response.status).toBe(200)

      const json = await response.json()
      expect(json.success).toBe(true)
      expect(json.data.url).toBe('https://example.com/upload.jpg')
    })

    it('should return 400 NO_FILE error when file is missing in form data', async () => {
      const formData = new FormData()
      const req = new Request('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      }) as any

      const response = await uploadRoute(req)
      expect(response.status).toBe(400)

      const json = await response.json()
      expect(json.error).toBe('NO_FILE')
    })
  })
})
