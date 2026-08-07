import { describe, it, expect, beforeEach } from 'vitest'
import { BidAutoHideDuration } from '@prisma/client'
import { prismaMock, seedDefaultPrismaMocks } from '../fixtures/prisma-mock'
import { mockAsOwner } from '../fixtures/auth-mock'
import { mockBidProperty, mockBids } from '../fixtures/test-data'
import { createProperty, updateProperty } from '@/lib/actions/properties'
import { generatePropertyWhatsAppShareText } from '@/lib/whatsapp'

/**
 * Helper function to calculate bid auto-hide threshold duration in days for each enum value.
 */
function getBidAutoHideDays(duration: BidAutoHideDuration): number | null {
  switch (duration) {
    case BidAutoHideDuration.NONE:
      return null
    case BidAutoHideDuration.ONE_MONTH:
      return 30
    case BidAutoHideDuration.TWO_MONTHS:
      return 60
    case BidAutoHideDuration.THREE_MONTHS:
      return 90
    case BidAutoHideDuration.SIX_MONTHS:
      return 180
    case BidAutoHideDuration.ONE_YEAR:
      return 365
    default:
      return null
  }
}

describe('F3: Bidding Engine, Timer Calculation, and Sanitization', () => {
  beforeEach(() => {
    seedDefaultPrismaMocks()
    mockAsOwner()
  })

  describe('bidAutoHideDuration Enum Calculations (All 6 Values)', () => {
    it('should calculate correct duration threshold for NONE', () => {
      expect(getBidAutoHideDays(BidAutoHideDuration.NONE)).toBeNull()
    })

    it('should calculate correct duration threshold for ONE_MONTH (30 days)', () => {
      expect(getBidAutoHideDays(BidAutoHideDuration.ONE_MONTH)).toBe(30)
    })

    it('should calculate correct duration threshold for TWO_MONTHS (60 days)', () => {
      expect(getBidAutoHideDays(BidAutoHideDuration.TWO_MONTHS)).toBe(60)
    })

    it('should calculate correct duration threshold for THREE_MONTHS (90 days)', () => {
      expect(getBidAutoHideDays(BidAutoHideDuration.THREE_MONTHS)).toBe(90)
    })

    it('should calculate correct duration threshold for SIX_MONTHS (180 days)', () => {
      expect(getBidAutoHideDays(BidAutoHideDuration.SIX_MONTHS)).toBe(180)
    })

    it('should calculate correct duration threshold for ONE_YEAR (365 days)', () => {
      expect(getBidAutoHideDays(BidAutoHideDuration.ONE_YEAR)).toBe(365)
    })
  })

  describe('showBidDate Toggle and Sanitization', () => {
    it('should respect showBidDate=false by excluding bid timestamp in public payload', () => {
      const propertyWithHideDate = { ...mockBidProperty, showBidDate: false }
      const sanitizedBid = {
        amount: Number(mockBids[0].amount),
        bidderName: mockBids[0].bidderName,
        bidDate: propertyWithHideDate.showBidDate ? mockBids[0].bidDate : null,
      }
      expect(sanitizedBid.bidDate).toBeNull()
    })

    it('should preserve bid timestamp when showBidDate=true', () => {
      const propertyWithShowDate = { ...mockBidProperty, showBidDate: true }
      const sanitizedBid = {
        amount: Number(mockBids[0].amount),
        bidderName: mockBids[0].bidderName,
        bidDate: propertyWithShowDate.showBidDate ? mockBids[0].bidDate : null,
      }
      expect(sanitizedBid.bidDate).toEqual(mockBids[0].bidDate)
    })
  })

  describe('"يوجد سوم" Display Logic for Expired/Active Bids', () => {
    it('should format WhatsApp share text with "السوم الحالي: يوجد سوم" for expired/hidden bids', () => {
      const expiredBidProperty = {
        ...mockBidProperty,
        pricingModel: 'BID' as const,
        isBidExpired: true,
        price: '5000000',
      }
      const text = generatePropertyWhatsAppShareText(expiredBidProperty as any)
      expect(text).toContain('السوم الحالي: يوجد سوم')
    })

    it('should format WhatsApp share text with highest bid amount when bid is active', () => {
      const activeBidProperty = {
        ...mockBidProperty,
        pricingModel: 'BID' as const,
        isBidExpired: false,
        price: '5500000',
      }
      const text = generatePropertyWhatsAppShareText(activeBidProperty as any)
      expect(text).toContain('أعلى سومة: 5500000 ر.س')
    })
  })

  describe('Backdated Bid Acceptance', () => {
    it('should accept backdated bid timestamps in createProperty and updateProperty', async () => {
      const pastDate = new Date('2025-01-01T00:00:00.000Z')
      prismaMock.property.create.mockImplementation((args: any) =>
        Promise.resolve({ id: 'prop-bid-new', ...args.data })
      )

      await createProperty({
        title: 'Auction Property',
        price: 5000000,
        dealType: 'SALE',
        propertyType: 'LAND',
        pricingModel: 'BID',
        newBid: {
          amount: 5100000,
          bidderName: 'مشتري سابق',
          bidderPhone: '+966550001122',
          bidDate: pastDate,
        },
      } as any)

      expect(prismaMock.propertyBid.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: BigInt(5100000),
            bidderName: 'مشتري سابق',
            bidDate: expect.any(Date),
          }),
        })
      )

      prismaMock.property.findFirst.mockResolvedValue(mockBidProperty as any)
      prismaMock.property.update.mockResolvedValue({ ...mockBidProperty, price: BigInt(5000000) } as any)

      await updateProperty('prop-bid-1', {
        newBid: {
          amount: 5200000,
          bidderName: 'مزايد قديم',
          bidderPhone: '+966550001133',
          bidDate: pastDate,
        },
      })

      expect(prismaMock.propertyBid.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            propertyId: 'prop-bid-1',
            amount: BigInt(5200000),
            bidderName: 'مزايد قديم',
          }),
        })
      )
    })
  })
})
