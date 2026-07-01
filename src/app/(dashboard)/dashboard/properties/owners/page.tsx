'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  User,
  Phone,
  FileText,
  Calendar,
  X,
  Building,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getOwners, createOwner, updateOwner, deleteOwner } from '@/lib/actions/owners'
import { getProperties } from '@/lib/actions/properties'

const RELATION_TYPES = {
  OWNER: 'مالك',
  AGENT: 'وكيل',
  HEIRS_REPRESENTATIVE: 'ممثل ورثة',
}

export default function OwnersPage() {
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [owners, setOwners] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOwner, setSelectedOwner] = useState<any | null>(null)
  
  // Form states
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [type, setRelationType] = useState<'OWNER' | 'AGENT' | 'HEIRS_REPRESENTATIVE'>('OWNER')
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [ownersData, propertiesData] = await Promise.all([
        getOwners({ search }),
        getProperties({ pageSize: 100 }), // Get properties to link
      ])
      setOwners(ownersData.owners)
      setProperties(propertiesData.properties || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleOpenAdd = () => {
    setSelectedOwner(null)
    setName('')
    setPhone('')
    setDob('')
    setNationalId('')
    setRelationType('OWNER')
    setSelectedPropertyIds([])
    setIsModalOpen(true)
  }

  const handleOpenEdit = (owner: any) => {
    setSelectedOwner(owner)
    setName(owner.name)
    setPhone(owner.phone)
    setDob(owner.dob)
    setNationalId(owner.nationalId)
    setRelationType(owner.type)
    setSelectedPropertyIds(owner.properties?.map((p: any) => p.id) || [])
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (selectedOwner) {
        await updateOwner(selectedOwner.id, {
          name,
          phone,
          dob,
          nationalId,
          type,
          propertyIds: selectedPropertyIds,
        })
      } else {
        await createOwner({
          name,
          phone,
          dob,
          nationalId,
          type,
          propertyIds: selectedPropertyIds,
        })
      }
      setIsModalOpen(false)
      fetchData()
    } catch (error) {
      console.error('Failed to save owner:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المالك؟')) {
      try {
        await deleteOwner(id)
        fetchData()
      } catch (error) {
        console.error('Failed to delete owner:', error)
      }
    }
  }

  const handleToggleProperty = (propId: string) => {
    if (selectedPropertyIds.includes(propId)) {
      setSelectedPropertyIds(selectedPropertyIds.filter(id => id !== propId))
    } else {
      setSelectedPropertyIds([...selectedPropertyIds, propId])
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3748]">إدارة الملاك</h1>
          <p className="mt-1 text-sm text-[#718096]">
            إدارة بيانات ملاك العقارات، وكلائهم وممثلي الورثة
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-[#C8A96E] hover:bg-[#B7985D] text-[#1E3A5F] flex items-center gap-2 font-bold shadow-md rounded-lg"
        >
          <Plus className="h-4 w-4" />
          إضافة مالك جديد
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718096]" />
          <Input
            placeholder="البحث بالاسم، رقم الجوال أو الهوية..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-10 border-[#E2E8F0] focus:border-[#C8A96E] bg-white rounded-lg"
          />
        </div>
      </div>

      {/* Owners Table Card */}
      <Card className="border border-[#E2E8F0] bg-white shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-right text-sm">
              <thead className="bg-[#FAFAF7] border-b border-[#E2E8F0] text-[#718096] font-semibold">
                <tr>
                  <th className="px-6 py-4">الاسم</th>
                  <th className="px-6 py-4">رقم الجوال</th>
                  <th className="px-6 py-4">الهوية الوطنية</th>
                  <th className="px-6 py-4">تاريخ الميلاد</th>
                  <th className="px-6 py-4">نوع العلاقة</th>
                  <th className="px-6 py-4">العقارات المرتبطة</th>
                  <th className="px-6 py-4 text-left">العمليات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-[#718096]">
                      جاري تحميل البيانات...
                    </td>
                  </tr>
                ) : owners.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-[#718096]">
                      لا يوجد ملاك مسجلين يطابقون البحث.
                    </td>
                  </tr>
                ) : (
                  owners.map((owner) => (
                    <tr key={owner.id} className="hover:bg-[#FAFAF7] transition-colors">
                      <td className="px-6 py-4 font-semibold text-[#1E3A5F]">{owner.name}</td>
                      <td className="px-6 py-4 font-mono">{owner.phone}</td>
                      <td className="px-6 py-4 font-mono">{owner.nationalId}</td>
                      <td className="px-6 py-4 font-mono">
                        {owner.dob ? new Date(owner.dob).toLocaleDateString('ar-SA-u-nu-latn') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            owner.type === 'OWNER'
                              ? 'success'
                              : owner.type === 'AGENT'
                              ? 'default'
                              : 'warning'
                          }
                          className="rounded-full px-3 py-1 font-medium"
                        >
                          {RELATION_TYPES[owner.type as keyof typeof RELATION_TYPES]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded bg-[#E2E8F0]/50 px-2.5 py-1 text-xs font-semibold text-[#1E3A5F]">
                          <Building className="h-3.5 w-3.5" />
                          {owner.properties?.length || 0} عقار
                        </span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/properties/owners/${owner.id}`}>
                            <Button variant="outline" size="sm" className="rounded-lg p-2 text-[#718096] hover:text-[#1E3A5F] border-[#E2E8F0]">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(owner)}
                            className="rounded-lg p-2 text-[#718096] hover:text-amber-600 border-[#E2E8F0]"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(owner.id)}
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
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-4">
              <h3 className="text-lg font-bold text-[#1E3A5F]">
                {selectedOwner ? 'تعديل بيانات المالك' : 'إضافة مالك جديد'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-[#718096] hover:bg-[#FAFAF7] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div>
                <label className="block text-xs font-semibold text-[#2D3748] mb-1">الاسم الكامل</label>
                <Input
                  type="text"
                  required
                  placeholder="أدخل الاسم الكامل"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg border-[#E2E8F0] focus:border-[#C8A96E]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#2D3748] mb-1">رقم الهاتف الجوال</label>
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
                  <label className="block text-xs font-semibold text-[#2D3748] mb-1">الهوية الوطنية / الإقامة</label>
                  <Input
                    type="text"
                    required
                    placeholder="مثال: 10xxxxxxx"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="rounded-lg border-[#E2E8F0] focus:border-[#C8A96E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#2D3748] mb-1">تاريخ الميلاد</label>
                  <Input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="rounded-lg border-[#E2E8F0] focus:border-[#C8A96E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2D3748] mb-1">نوع العلاقة بالعقار</label>
                  <select
                    value={type}
                    onChange={(e) => setRelationType(e.target.value as any)}
                    className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#2D3748] focus:border-[#C8A96E] focus:outline-none"
                  >
                    <option value="OWNER">مالك</option>
                    <option value="AGENT">وكيل شرعي</option>
                    <option value="HEIRS_REPRESENTATIVE">ممثل ورثة</option>
                  </select>
                </div>
              </div>

              {/* Link Properties */}
              <div>
                <label className="block text-xs font-semibold text-[#2D3748] mb-2">ربط عقارات (اختر من القائمة)</label>
                <div className="border border-[#E2E8F0] rounded-lg p-3 max-h-40 overflow-y-auto space-y-2 bg-[#FAFAF7]">
                  {properties.length === 0 ? (
                    <div className="text-xs text-[#718096] text-center py-4">لا توجد عقارات مسجلة للمكتب.</div>
                  ) : (
                    properties.map((prop) => {
                      const isChecked = selectedPropertyIds.includes(prop.id)
                      return (
                        <label key={prop.id} className="flex items-center gap-2 text-xs text-[#2D3748] cursor-pointer hover:bg-white p-1 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleProperty(prop.id)}
                            className="rounded border-[#E2E8F0] text-[#C8A96E] focus:ring-[#C8A96E]"
                          />
                          <span>{prop.titleAr || prop.title}</span>
                        </label>
                      )
                    })
                  )}
                </div>
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
