import { describe, it, expect } from 'vitest'

/**
 * Normalizes decimal input strings by replacing Arabic decimal separator (٫) and commas (,) with standard dot (.)
 */
export const normalizeDecimal = (val: string): string => {
  return val.replace(/٫/g, '.').replace(/,/g, '.')
}

/**
 * Validates specifications constraint: bathrooms must be >= masterBedrooms
 */
export function validateSpecificationConstraints(bedrooms: number, bathrooms: number, masterBedrooms: number): { valid: boolean; error?: string } {
  if (masterBedrooms > bedrooms) {
    return { valid: false, error: 'عدد غرف النوم الماستر لا يمكن أن يتجاوز إجمالي غرف النوم' }
  }
  if (bathrooms < masterBedrooms) {
    return { valid: false, error: 'عدد دورات المياه يجب أن يكون أكبر من أو يساوي عدد غرف النوم الماستر' }
  }
  return { valid: true }
}

/**
 * Determines field visibility based on property category and subtype
 */
export function getFieldVisibility(category: string, subtypeName?: string) {
  const isLand = category === 'AGRICULTURAL' || (subtypeName && subtypeName.includes('أرض'))
  return {
    showBedrooms: !isLand,
    showBathrooms: !isLand,
    showBuiltArea: !isLand,
    showFloorNumber: category === 'RESIDENTIAL' && !isLand,
  }
}

describe('F6: Listing Specifications, Constraints & normalizeDecimal', () => {
  describe('normalizeDecimal with at least 5 input variants including Arabic decimal separator ٫', () => {
    it('should convert standard dot string "123.45" correctly', () => {
      expect(normalizeDecimal('123.45')).toBe('123.45')
    })

    it('should convert comma separator string "123,45" correctly', () => {
      expect(normalizeDecimal('123,45')).toBe('123.45')
    })

    it('should convert Arabic decimal separator string "123٫45" (U+066B) correctly', () => {
      expect(normalizeDecimal('123٫45')).toBe('123.45')
    })

    it('should convert Arabic decimal separator string "1000٫5" correctly', () => {
      expect(normalizeDecimal('1000٫5')).toBe('1000.5')
    })

    it('should convert Arabic decimal separator string "0٫75" correctly', () => {
      expect(normalizeDecimal('0٫75')).toBe('0.75')
    })
  })

  describe('Specification Constraints Validation', () => {
    it('should pass validation when bathrooms >= masterBedrooms and masterBedrooms <= bedrooms', () => {
      const result = validateSpecificationConstraints(5, 6, 3)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should fail validation when masterBedrooms exceeds total bedrooms', () => {
      const result = validateSpecificationConstraints(3, 4, 5)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('عدد غرف النوم الماستر لا يمكن أن يتجاوز إجمالي غرف النوم')
    })

    it('should fail validation when bathrooms is less than masterBedrooms', () => {
      const result = validateSpecificationConstraints(5, 2, 3)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('عدد دورات المياه يجب أن يكون أكبر من أو يساوي عدد غرف النوم الماستر')
    })
  })

  describe('Conditional Visibility by Property Type', () => {
    it('should hide room counters and built area for land properties', () => {
      const landSpecs = getFieldVisibility('RESIDENTIAL', 'أرض سكنية')
      expect(landSpecs.showBedrooms).toBe(false)
      expect(landSpecs.showBathrooms).toBe(false)
      expect(landSpecs.showBuiltArea).toBe(false)

      const agSpecs = getFieldVisibility('AGRICULTURAL')
      expect(agSpecs.showBedrooms).toBe(false)
      expect(agSpecs.showBathrooms).toBe(false)
    })

    it('should show room counters and built area for residential buildings/apartments', () => {
      const aptSpecs = getFieldVisibility('RESIDENTIAL', 'شقة')
      expect(aptSpecs.showBedrooms).toBe(true)
      expect(aptSpecs.showBathrooms).toBe(true)
      expect(aptSpecs.showBuiltArea).toBe(true)
      expect(aptSpecs.showFloorNumber).toBe(true)
    })
  })
})
