'use client'

import { useState } from 'react'
import { MapPin, Info, ArrowUpRight, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import Link from 'next/link'

export interface PlotItem {
  id: string
  number: string
  area: number
  price: number
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD'
  blockNumber?: string
  facing?: string
  slug?: string
}

interface MasterplanPickerProps {
  officeSlug: string
  title?: string
  plots?: PlotItem[]
}

const DEFAULT_PLOTS: PlotItem[] = [
  { id: 'p1', number: '101', area: 350, price: 525000, status: 'AVAILABLE', blockNumber: 'أ', facing: 'شمالية' },
  { id: 'p2', number: '102', area: 400, price: 600000, status: 'AVAILABLE', blockNumber: 'أ', facing: 'شرقية' },
  { id: 'p3', number: '103', area: 380, price: 570000, status: 'RESERVED', blockNumber: 'أ', facing: 'جنوبية' },
  { id: 'p4', number: '104', area: 450, price: 675000, status: 'SOLD', blockNumber: 'أ', facing: 'غربية' },
  { id: 'p5', number: '105', area: 500, price: 750000, status: 'AVAILABLE', blockNumber: 'ب', facing: 'شمالية شرقية' },
  { id: 'p6', number: '106', area: 420, price: 630000, status: 'AVAILABLE', blockNumber: 'ب', facing: 'شمالية' },
  { id: 'p7', number: '107', area: 360, price: 540000, status: 'RESERVED', blockNumber: 'ب', facing: 'جنوبية' },
  { id: 'p8', number: '108', area: 480, price: 720000, status: 'SOLD', blockNumber: 'ب', facing: 'شرقية' },
]

export function MasterplanPicker({ officeSlug, title = 'المخطط الهندسي للمشروع', plots = DEFAULT_PLOTS }: MasterplanPickerProps) {
  const [selectedPlot, setSelectedPlot] = useState<PlotItem | null>(plots[0] || null)

  const availableCount = plots.filter((p) => p.status === 'AVAILABLE').length
  const reservedCount = plots.filter((p) => p.status === 'RESERVED').length
  const soldCount = plots.filter((p) => p.status === 'SOLD').length

  const getStatusBadge = (status: PlotItem['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            متاح للبيع
          </span>
        )
      case 'RESERVED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <AlertTriangle className="h-3.5 w-3.5" />
            محجوز
          </span>
        )
      case 'SOLD':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
            <XCircle className="h-3.5 w-3.5" />
            مباع
          </span>
        )
    }
  }

  const getPlotCardColor = (plot: PlotItem) => {
    const isSelected = selectedPlot?.id === plot.id
    const borderStyle = isSelected ? 'ring-2 ring-[#C8A96E] border-[#C8A96E]' : 'border-[#E2E8F0]'

    switch (plot.status) {
      case 'AVAILABLE':
        return `bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-950 ${borderStyle}`
      case 'RESERVED':
        return `bg-amber-500/10 hover:bg-amber-500/20 text-amber-950 ${borderStyle}`
      case 'SOLD':
        return `bg-red-500/10 opacity-70 cursor-not-allowed text-red-950 ${borderStyle}`
    }
  }

  return (
    <div className="rounded-2xl bg-white border border-[#E2E8F0] p-6 shadow-sm space-y-6" dir="rtl">
      {/* Header & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <h3 className="text-xl font-bold text-[#1E3A5F] flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#C8A96E]" />
            <span>{title}</span>
          </h3>
          <p className="text-xs text-[#718096] mt-1">انقر على أي قطعة أرض لعرض بيانات التفاصيل والأسعار</p>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium">
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>متاح ({availableCount})</span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>محجوز ({reservedCount})</span>
          </div>
          <div className="flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-200">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>مباع ({soldCount})</span>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Plot Matrix */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {plots.map((plot) => (
              <button
                key={plot.id}
                type="button"
                onClick={() => setSelectedPlot(plot)}
                className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${getPlotCardColor(plot)}`}
              >
                <span className="text-xs font-semibold text-[#718096]">قطعة #{plot.number}</span>
                <span className="text-lg font-bold my-1 text-[#1E3A5F]">{plot.area} م²</span>
                {getStatusBadge(plot.status)}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Plot Detail Card */}
        {selectedPlot ? (
          <div className="rounded-xl border border-[#C8A96E]/30 bg-[#FAF5EB]/50 p-5 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#C8A96E]/20 pb-3 mb-3">
                <div>
                  <span className="text-xs text-[#718096]">قطعة أرض رقم</span>
                  <h4 className="text-2xl font-bold text-[#1E3A5F]">#{selectedPlot.number}</h4>
                </div>
                {getStatusBadge(selectedPlot.status)}
              </div>

              <div className="space-y-2 text-xs text-[#2D3748]">
                <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                  <span className="text-[#718096]">المساحة:</span>
                  <span className="font-bold">{selectedPlot.area} م²</span>
                </div>
                {selectedPlot.blockNumber && (
                  <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                    <span className="text-[#718096]">البلوك:</span>
                    <span className="font-bold">بلوك {selectedPlot.blockNumber}</span>
                  </div>
                )}
                {selectedPlot.facing && (
                  <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                    <span className="text-[#718096]">الواجهة:</span>
                    <span className="font-bold">{selectedPlot.facing}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                  <span className="text-[#718096]">السعر الإجمالي:</span>
                  <span className="font-bold text-[#1E3A5F] text-sm">
                    {selectedPlot.price.toLocaleString('ar-SA')} ر.س
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#718096]">سعر المتر:</span>
                  <span className="font-semibold text-amber-700">
                    {Math.round(selectedPlot.price / selectedPlot.area).toLocaleString('ar-SA')} ر.س/م²
                  </span>
                </div>
              </div>
            </div>

            {selectedPlot.status === 'AVAILABLE' ? (
              <div className="pt-2">
                <Link
                  href={`/${officeSlug}/properties`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 transition-colors"
                >
                  <span>طلب شراء القطعة</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <p className="text-[11px] text-center text-[#718096] italic">
                هذه القطعة غير متاحة حاليًا للطلب السريع.
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center p-6 rounded-xl border border-dashed border-[#E2E8F0] text-center text-xs text-[#718096]">
            اختر قطعة أرض من المخطط لاستعراض مواصفاتها.
          </div>
        )}
      </div>
    </div>
  )
}
