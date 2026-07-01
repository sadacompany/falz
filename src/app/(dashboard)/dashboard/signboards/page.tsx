'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Phone,
  FileText,
  X,
  Building,
  CheckCircle,
  AlertCircle,
  MinusCircle,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getSignboards, createSignboard, updateSignboard, deleteSignboard } from '@/lib/actions/signboards'
import { getProperties } from '@/lib/actions/properties'

const STATUS_LABELS = {
  AVAILABLE: 'متاحة',
  INSTALLED: 'مثبتة',
  MAINTENANCE: 'صيانة',
  REMOVED: 'تمت إزالتها',
}

const STATUS_BADGES: Record<string, 'success' | 'default' | 'warning' | 'secondary'> = {
  AVAILABLE: 'success',
  INSTALLED: 'default',
  MAINTENANCE: 'warning',
  REMOVED: 'secondary',
}

export default function SignboardsPage() {
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [signboards, setSignboards] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSignboard, setSelectedSignboard] = useState<any | null>(null)

  // Form states
  const [code, setCode] = useState('')
  const [phone, setPhone] = useState('')
  const [propertyId, setPropertyId] = useState('')
  const [status, setStatus] = useState<'AVAILABLE' | 'INSTALLED' | 'MAINTENANCE' | 'REMOVED'>('AVAILABLE')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [signboardsData, propertiesData] = await Promise.all([
        getSignboards({ search }),
        getProperties({ pageSize: 100 }), // Get properties to link
      ])
      setSignboards(signboardsData.signboards)
      setProperties(propertiesData.properties || [])
    } catch (error) {
      console.error('Failed to fetch signboards data:', error)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleOpenAdd = () => {
    setSelectedSignboard(null)
    setCode('')
    setPhone('')
    setPropertyId('')
    setStatus('AVAILABLE')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (signboard: any) => {
    setSelectedSignboard(signboard)
    setCode(signboard.title)
    setPhone(signboard.phone)
    setPropertyId(signboard.propertyId || '')
    setStatus(signboard.status)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (selectedSignboard) {
        await updateSignboard(selectedSignboard.id, {
          title: code,
          phone,
          propertyId: propertyId || null,
          status,
        })
      } else {
        await createSignboard({
          title: code,
          phone,
          propertyId: propertyId || null,
          status,
        })
      }
      setIsModalOpen(false)
      fetchData()
    } catch (error) {
      console.error('Failed to save signboard:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه اللوحة؟')) {
      try {
        await deleteSignboard(id)
        fetchData()
      } catch (error) {
        console.error('Failed to delete signboard:', error)
      }
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3748]">اللوحات الإعلانية</h1>
          <p className="mt-1 text-sm text-[#718096]">
            متابعة وإدارة اللوحات الإعلانية المثبتة على العقارات وأرقام الهواتف المعروضة عليها
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-[#C8A96E] hover:bg-[#B7985D] text-[#1E3A5F] flex items-center gap-2 font-bold shadow-md rounded-lg"
        >
          <Plus className="h-4 w-4" />
          إضافة لوحة جديدة
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718096]" />
          <Input
            placeholder="البحث برمز اللوحة أو رقم الجوال..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-10 border-[#E2E8F0] focus:border-[#C8A96E] bg-white rounded-lg"
          />
        </div>
      </div>

      {/* Signboards Table Card */}
      <Card className="border border-[#E2E8F0] bg-white shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-right text-sm">
              <thead className="bg-[#FAFAF7] border-b border-[#E2E8F0] text-[#718096] font-semibold">
                <tr>
                  <th className="px-6 py-4">رمز / عنوان اللوحة</th>
                  <th className="px-6 py-4">رقم الجوال على اللوحة</th>
                  <th className="px-6 py-4">العقار المرتبط</th>
                  <th className="px-6 py-4">حالة اللوحة</th>
                  <th className="px-6 py-4">تاريخ الإضافة</th>
                  <th className="px-6 py-4 text-left">العمليات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#718096]">
                      جاري تحميل البيانات...
                    </td>
                  </tr>
                ) : signboards.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#718096]">
                      لا توجد لوحات مسجلة تطابق البحث.
                    </td>
                  </tr>
                ) : (
                  signboards.map((sign) => (
                    <tr key={sign.id} className="hover:bg-[#FAFAF7] transition-colors">
                      <td className="px-6 py-4 font-semibold text-[#1E3A5F]">{sign.title}</td>
                      <td className="px-6 py-4 font-mono">{sign.phone}</td>
                      <td className="px-6 py-4">
                        {sign.property ? (
                          <Link
                            href={`/dashboard/properties/${sign.property.id}`}
                            className="inline-flex items-center gap-1 text-[#C8A96E] hover:underline font-semibold"
                          >
                            <Building className="h-3.5 w-3.5" />
                            {sign.property.titleAr || sign.property.title}
                            <ExternalLink className="h-3 w-3 mr-0.5" />
                          </Link>
                        ) : (
                          <span className="text-[#718096]">غير مرتبط بعقار</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={STATUS_BADGES[sign.status as keyof typeof STATUS_BADGES]}
                          className="rounded-full px-3 py-1 font-medium"
                        >
                          {STATUS_LABELS[sign.status as keyof typeof STATUS_LABELS]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-[#718096]">
                        {new Date(sign.createdAt).toLocaleDateString('ar-SA-u-nu-latn')}
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(sign)}
                            className="rounded-lg p-2 text-[#718096] hover:text-amber-600 border-[#E2E8F0]"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(sign.id)}
                            className="rounded-lg p-2 text-[#718096] hover:text-red-600 border-[#E2E8F0]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Dialog */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-4">
              <h3 className="text-lg font-bold text-[#1E3A5F]">
                {selectedSignboard ? 'تعديل بيانات اللوحة الإعلانية' : 'إضافة لوحة جديدة'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-[#718096] hover:bg-[#FAFAF7] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2D3748] mb-1">رمز / عنوان اللوحة</label>
                <Input
                  type="text"
                  required
                  placeholder="مثال: L-101 أو لوحة الواجهة"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="rounded-lg border-[#E2E8F0] focus:border-[#C8A96E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D3748] mb-1">رقم الهاتف الظاهر على اللوحة</label>
                <Input
                  type="tel"
                  required
                  placeholder="مثال: 05xxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-lg border-[#E2E8F0] focus:border-[#C8A96E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D3748] mb-1">العقار المرتبط باللوحة</label>
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#2D3748] focus:border-[#C8A96E] focus:outline-none"
                >
                  <option value="">-- اختر العقار --</option>
                  {properties.map((prop) => (
                    <option key={prop.id} value={prop.id}>
                      {prop.titleAr || prop.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D3748] mb-1">حالة اللوحة</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#2D3748] focus:border-[#C8A96E] focus:outline-none"
                >
                  <option value="AVAILABLE">متاحة</option>
                  <option value="INSTALLED">مثبتة</option>
                  <option value="MAINTENANCE">صيانة</option>
                  <option value="REMOVED">تمت إزالتها</option>
                </select>
              </div>

              {/* Modal Buttons */}
              <div className="border-t border-[#E2E8F0] pt-4 mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border-[#E2E8F0]"
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  className="bg-[#C8A96E] hover:bg-[#B7985D] text-[#1E3A5F] font-bold rounded-lg px-6"
                >
                  حفظ
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
