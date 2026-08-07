import { describe, it, expect, beforeEach } from 'vitest'
import { prismaMock, seedDefaultPrismaMocks } from '../fixtures/prisma-mock'
import { mockAsOwner } from '../fixtures/auth-mock'
import { getDashboardStats } from '@/lib/actions/analytics'

describe('F10: Analytics KPIs & getDashboardStats Calculations', () => {
  beforeEach(() => {
    seedDefaultPrismaMocks()
    mockAsOwner()
  })

  it('should calculate active listings count, leads, views, and conversion rate correctly', async () => {
    prismaMock.property.count.mockResolvedValue(15) // totalProperties
    prismaMock.lead.count
      .mockResolvedValueOnce(20) // totalLeads (last 30d)
      .mockResolvedValueOnce(10) // totalLeadsPrevious (previous 30d)
    prismaMock.analyticsEvent.count
      .mockResolvedValueOnce(400) // totalViews (last 30d)
      .mockResolvedValueOnce(200) // totalViewsPrevious (previous 30d)
    prismaMock.lead.findMany.mockResolvedValue([])
    prismaMock.analyticsEvent.groupBy.mockResolvedValue([])
    prismaMock.property.aggregate
      .mockResolvedValueOnce({ _sum: { price: BigInt(5000000) } } as any)
      .mockResolvedValueOnce({ _sum: { price: BigInt(15000000) } } as any)
    prismaMock.propertyBid.count.mockResolvedValue(8)
    prismaMock.propertyOwner.count.mockResolvedValue(5)
    prismaMock.property.findMany.mockResolvedValue([])
    prismaMock.propertyBid.findMany.mockResolvedValue([])

    const stats = await getDashboardStats()

    expect(stats.totalProperties).toBe(15)
    expect(stats.totalLeads).toBe(20)
    expect(stats.totalViews).toBe(400)
    expect(stats.conversionRate).toBe(5) // (20 / 400) * 100 = 5.0%
    expect(stats.leadsChange).toBe(100) // ((20 - 10) / 10) * 100 = 100%
    expect(stats.viewsChange).toBe(100) // ((400 - 200) / 200) * 100 = 100%
    expect(stats.totalBids).toBe(8)
    expect(stats.totalOwners).toBe(5)
    expect(stats.monthlySales).toBe('5000000')
    expect(stats.quarterlySales).toBe('15000000')
  })

  it('should handle zero views gracefully without NaN in conversionRate', async () => {
    prismaMock.property.count.mockResolvedValue(5)
    prismaMock.lead.count.mockResolvedValue(0)
    prismaMock.analyticsEvent.count.mockResolvedValue(0)
    prismaMock.lead.findMany.mockResolvedValue([])
    prismaMock.analyticsEvent.groupBy.mockResolvedValue([])
    prismaMock.property.aggregate.mockResolvedValue({ _sum: { price: null } } as any)
    prismaMock.propertyBid.count.mockResolvedValue(0)
    prismaMock.propertyOwner.count.mockResolvedValue(0)
    prismaMock.property.findMany.mockResolvedValue([])
    prismaMock.propertyBid.findMany.mockResolvedValue([])

    const stats = await getDashboardStats()

    expect(stats.totalViews).toBe(0)
    expect(stats.conversionRate).toBe(0)
    expect(Number.isNaN(stats.conversionRate)).toBe(false)
  })
})
