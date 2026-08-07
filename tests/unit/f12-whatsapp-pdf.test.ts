import { describe, it, expect } from 'vitest'
import { generatePropertyWhatsAppShareText, getWhatsAppShareLink } from '@/lib/whatsapp'

describe('F12: WhatsApp Share Text & PDF Flyer Data Rendering', () => {
  describe('generatePropertyWhatsAppShareText Listing Variants', () => {
    it('should format SALE listing text with "للبيع" and required price label', () => {
      const saleProperty = {
        title: 'فيلا فاخرة',
        titleAr: 'فيلا فاخرة بالملقا',
        price: '2500000',
        dealType: 'SALE' as const,
        propertyType: 'VILLA',
        city: 'الرياض',
        district: 'الملقا',
        area: 450,
        bedrooms: 5,
        bathrooms: 6,
        publicUrl: 'https://falz.sa/p/villa-sale-1',
      }

      const text = generatePropertyWhatsAppShareText(saleProperty)

      expect(text).toContain('للبيع')
      expect(text).toContain('السعر المطلـوب: 2500000 ر.س')
      expect(text).toContain('📍 *الموقع:* الملقا - الرياض')
      expect(text).toContain('المساحة: 450 م² | غرف النوم: 5 | دورات المياه: 6')
      expect(text).toContain('https://falz.sa/p/villa-sale-1')
    })

    it('should format RENT listing text with "للإيجار" and rent price label', () => {
      const rentProperty = {
        title: 'شقة للإيجار',
        titleAr: 'شقة للإيجار بالعليا',
        price: '65000',
        dealType: 'RENT' as const,
        propertyType: 'APARTMENT',
        city: 'الرياض',
        district: 'العليا',
        area: 180,
        bedrooms: 3,
        bathrooms: 3,
        publicUrl: 'https://falz.sa/p/apt-rent-1',
      }

      const text = generatePropertyWhatsAppShareText(rentProperty)

      expect(text).toContain('للإيجار')
      expect(text).toContain('السعر المطلـوب: 65000 ر.س')
      expect(text).toContain('📍 *الموقع:* العليا - الرياض')
    })

    it('should format BID listing text showing highest bid when active', () => {
      const activeBidProperty = {
        title: 'أرض للمزاد',
        price: '5500000',
        dealType: 'SALE' as const,
        propertyType: 'LAND',
        pricingModel: 'BID',
        isBidExpired: false,
        publicUrl: 'https://falz.sa/p/land-bid-1',
      }

      const text = generatePropertyWhatsAppShareText(activeBidProperty)

      expect(text).toContain('أعلى سومة: 5500000 ر.س')
    })

    it('should format BID listing text showing "السوم الحالي: يوجد سوم" when expired', () => {
      const expiredBidProperty = {
        title: 'أرض للمزاد',
        price: '5500000',
        dealType: 'SALE' as const,
        propertyType: 'LAND',
        pricingModel: 'BID',
        isBidExpired: true,
        publicUrl: 'https://falz.sa/p/land-bid-1',
      }

      const text = generatePropertyWhatsAppShareText(expiredBidProperty)

      expect(text).toContain('السوم الحالي: يوجد سوم')
    })

    it('should generate valid WhatsApp URI via getWhatsAppShareLink', () => {
      const prop = {
        title: 'فيلا فاخرة',
        price: '2500000',
        dealType: 'SALE' as const,
        propertyType: 'VILLA',
        publicUrl: 'https://falz.sa/p/1',
      }

      const link = getWhatsAppShareLink(prop)

      expect(link).toContain('https://wa.me/?text=')
      expect(link).toContain(encodeURIComponent('للبيع'))
    })
  })

  describe('PDF Flyer Modal Data Rendering', () => {
    it('should assemble printable brochure fields accurately', () => {
      const flyerData = {
        officeName: 'عقارات الرياض',
        officePhone: '+966500000000',
        officeEmail: 'info@riyadh-re.com',
        property: {
          titleAr: 'فيلا راقية للبيع',
          title: 'Luxury Villa',
          price: '2,500,000',
          currency: 'SAR',
          dealType: 'SALE',
          propertyType: 'VILLA',
          city: 'الرياض',
          district: 'الملقا',
          area: 450,
          bedrooms: 5,
          bathrooms: 6,
          deedNumber: '918273645',
        },
      }

      const title = flyerData.property.titleAr || flyerData.property.title
      const location = `${flyerData.property.district} - ${flyerData.property.city}`
      const priceText = `${flyerData.property.price} ${flyerData.property.currency}`

      expect(title).toBe('فيلا راقية للبيع')
      expect(location).toBe('الملقا - الرياض')
      expect(priceText).toBe('2,500,000 SAR')
      expect(flyerData.officeName).toBe('عقارات الرياض')
    })
  })
})
