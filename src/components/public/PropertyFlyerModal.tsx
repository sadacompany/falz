'use client'

import { useState } from 'react'
import { Printer, X, Download, MapPin, Building2, Phone, Mail, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PropertyFlyerProps {
  officeName: string
  officePhone?: string | null
  officeEmail?: string | null
  officeLogo?: string | null
  property: {
    title: string
    titleAr?: string | null
    description?: string | null
    price: string
    currency: string
    dealType: string
    propertyType: string
    subtypeName?: string | null
    city?: string | null
    district?: string | null
    street?: string | null
    bedrooms?: number | null
    bathrooms?: number | null
    area?: number | null
    builtArea?: number | null
    facing?: string | null
    streetWidth?: string | null
    deedNumber?: string | null
    media?: Array<{ url: string }>
  }
}

export function PropertyFlyerModal({ officeName, officePhone, officeEmail, officeLogo, property }: PropertyFlyerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const title = property.titleAr || property.title
  const mainImage = property.media?.[0]?.url

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-xs font-semibold"
      >
        <Printer className="h-4 w-4 text-[#C8A96E]" />
        <span>طباعة بروشور (PDF)</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden print:m-0 print:p-0 print:shadow-none print:w-full print:max-w-none text-right" dir="rtl">
            {/* Modal Controls (Hidden in Print) */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-slate-50 print:hidden">
              <h3 className="text-base font-bold text-[#1E3A5F] flex items-center gap-2">
                <Printer className="h-5 w-5 text-[#C8A96E]" />
                <span>معاينة بروشور العقار للإرشيف والطباعة</span>
              </h3>
              <div className="flex items-center gap-2">
                <Button onClick={handlePrint} className="bg-[#1E3A5F] text-white flex items-center gap-1.5 text-xs font-bold">
                  <Printer className="h-4 w-4" />
                  طباعة / حفظ PDF
                </Button>
                <button onClick={() => setIsOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable A4 Flyer Sheet */}
            <div className="p-8 space-y-6 bg-white text-[#2D3748]">
              {/* Header: Office Branding */}
              <div className="flex items-center justify-between border-b-2 border-[#1E3A5F] pb-4">
                <div>
                  <h1 className="text-2xl font-black text-[#1E3A5F]">{officeName}</h1>
                  <p className="text-xs text-[#718096]">عروض عقارية موثوقة ونشر رسمي</p>
                </div>
                {officeLogo && (
                  <img src={officeLogo} alt={officeName} className="h-12 w-auto object-contain" />
                )}
              </div>

              {/* Title & Badge */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#1E3A5F] text-white mb-2">
                    {property.dealType === 'SALE' ? 'عقار للبيع' : 'عقار للإيجار'} | {property.subtypeName || property.propertyType}
                  </span>
                  <h2 className="text-xl font-extrabold text-[#1E3A5F]">{title}</h2>
                  <p className="text-xs text-[#718096] flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-[#C8A96E]" />
                    {[property.street, property.district, property.city].filter(Boolean).join(', ')}
                  </p>
                </div>
                <div className="text-left">
                  <span className="text-xs text-[#718096] block">السعر المطلـوب</span>
                  <span className="text-2xl font-black text-[#C8A96E]">{property.price} {property.currency}</span>
                </div>
              </div>

              {/* Main Cover Image */}
              {mainImage && (
                <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-gray-200">
                  <img src={mainImage} alt={title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Specifications Table */}
              <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-gray-200 text-center text-xs">
                {property.area != null && (
                  <div className="space-y-1">
                    <span className="text-gray-500 block">المساحة</span>
                    <span className="font-bold text-sm text-[#1E3A5F]">{property.area} م²</span>
                  </div>
                )}
                {property.bedrooms != null && (
                  <div className="space-y-1">
                    <span className="text-gray-500 block">غرف النوم</span>
                    <span className="font-bold text-sm text-[#1E3A5F]">{property.bedrooms}</span>
                  </div>
                )}
                {property.bathrooms != null && (
                  <div className="space-y-1">
                    <span className="text-gray-500 block">دورات المياه</span>
                    <span className="font-bold text-sm text-[#1E3A5F]">{property.bathrooms}</span>
                  </div>
                )}
                {property.facing && (
                  <div className="space-y-1">
                    <span className="text-gray-500 block">الواجهة</span>
                    <span className="font-bold text-sm text-[#1E3A5F]">{property.facing}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {property.description && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#1E3A5F]">الوصف التفصيلي:</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{property.description}</p>
                </div>
              )}

              {/* Footer Contacts */}
              <div className="border-t border-gray-200 pt-4 flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-4">
                  {officePhone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-[#C8A96E]" />
                      {officePhone}
                    </span>
                  )}
                  {officeEmail && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-[#C8A96E]" />
                      {officeEmail}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-400">تم الإنشاء بواسطة منصة فَلَذ العقارية</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
