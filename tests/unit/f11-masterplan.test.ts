import { describe, it, expect } from 'vitest'

interface MasterplanPlot {
  id: string
  number: string
  area: number
  price: number
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD'
}

function aggregateMasterplanPlots(plots: MasterplanPlot[]) {
  const availableCount = plots.filter((p) => p.status === 'AVAILABLE').length
  const reservedCount = plots.filter((p) => p.status === 'RESERVED').length
  const soldCount = plots.filter((p) => p.status === 'SOLD').length

  return {
    totalPlots: plots.length,
    availableCount,
    reservedCount,
    soldCount,
  }
}

function calculatePricePerSquareMeter(price: number, area: number): number {
  if (area <= 0) return 0
  return Math.round(price / area)
}

describe('F11: Masterplan Picker, Plot Filtering, Aggregations & Price/m²', () => {
  const samplePlots: MasterplanPlot[] = [
    { id: 'p1', number: '101', area: 500, price: 1000000, status: 'AVAILABLE' },
    { id: 'p2', number: '102', area: 600, price: 1500000, status: 'AVAILABLE' },
    { id: 'p3', number: '103', area: 450, price: 900000, status: 'RESERVED' },
    { id: 'p4', number: '104', area: 550, price: 1100000, status: 'SOLD' },
    { id: 'p5', number: '105', area: 500, price: 1050000, status: 'SOLD' },
  ]

  it('should aggregate plot counts correctly for availableCount, reservedCount, and soldCount', () => {
    const agg = aggregateMasterplanPlots(samplePlots)

    expect(agg.totalPlots).toBe(5)
    expect(agg.availableCount).toBe(2)
    expect(agg.reservedCount).toBe(1)
    expect(agg.soldCount).toBe(2)
  })

  it('should filter plot list strictly by status', () => {
    const availablePlots = samplePlots.filter((p) => p.status === 'AVAILABLE')
    const reservedPlots = samplePlots.filter((p) => p.status === 'RESERVED')
    const soldPlots = samplePlots.filter((p) => p.status === 'SOLD')

    expect(availablePlots).toHaveLength(2)
    expect(reservedPlots).toHaveLength(1)
    expect(soldPlots).toHaveLength(2)
  })

  it('should calculate price-per-meter accurately using Math.round(price / area)', () => {
    // 1,000,000 / 500 = 2,000
    expect(calculatePricePerSquareMeter(1000000, 500)).toBe(2000)
    // 1,500,000 / 600 = 2,500
    expect(calculatePricePerSquareMeter(1500000, 600)).toBe(2500)
    // 900,000 / 450 = 2,000
    expect(calculatePricePerSquareMeter(900000, 450)).toBe(2000)
    // 1,050,000 / 500 = 2,100
    expect(calculatePricePerSquareMeter(1050000, 500)).toBe(2100)
  })

  it('should return 0 when area is zero or negative to prevent divide by zero NaN', () => {
    expect(calculatePricePerSquareMeter(1000000, 0)).toBe(0)
  })
})
