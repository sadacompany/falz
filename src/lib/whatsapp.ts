/**
 * Generates formatted WhatsApp share text for a property listing.
 */
export function generatePropertyWhatsAppShareText(property: {
  title: string
  titleAr?: string | null
  price: string | number
  currency?: string
  dealType: 'SALE' | 'RENT'
  propertyType: string
  subtypeName?: string | null
  city?: string | null
  district?: string | null
  bedrooms?: number | null
  bathrooms?: number | null
  area?: number | null
  pricingModel?: string | null
  isBidExpired?: boolean
  publicUrl: string
}): string {
  const title = property.titleAr || property.title
  const dealTypeStr = property.dealType === 'SALE' ? 'للبيع' : 'للإيجار'
  const typeStr = property.subtypeName || property.propertyType
  const locationStr = [property.district, property.city].filter(Boolean).join(' - ')

  let priceStr = ''
  if (property.pricingModel === 'BID') {
    priceStr = property.isBidExpired ? 'السوم الحالي: يوجد سوم' : `أعلى سومة: ${property.price} ر.س`
  } else {
    priceStr = `السعر المطلـوب: ${property.price} ر.س`
  }

  const specs: string[] = []
  if (property.area) specs.push(`المساحة: ${property.area} م²`)
  if (property.bedrooms) specs.push(`غرف النوم: ${property.bedrooms}`)
  if (property.bathrooms) specs.push(`دورات المياه: ${property.bathrooms}`)

  const specsText = specs.length > 0 ? `\n📌 ${specs.join(' | ')}` : ''

  const text = `🏡 *عقار مميز ${dealTypeStr} | ${typeStr}*
📍 *الموقع:* ${locationStr}
💰 *${priceStr}*
عنوان العقار: ${title}${specsText}

🔗 *رابط التفاصيل الكاملة والصور:*
${property.publicUrl}

📲 *للتواصل والاستفسار المباشر عبر واتساب*`

  return text
}

export function getWhatsAppShareLink(property: Parameters<typeof generatePropertyWhatsAppShareText>[0]): string {
  const text = generatePropertyWhatsAppShareText(property)
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
