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
  Loader2,
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
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [owners, setOwners] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOwner, setSelectedOwner] = useState<any | null>(null)
  
  // Delete confirmation states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [type, setRelationType] = useState<'OWNER' | 'AGENT' | 'HEIRS_REPRESENTATIVE'>('OWNER')
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [ownersData, propertiesData] = await Promise.all([
        getOwners({ search }),
        getProperties({ pageSize: 100 }), // Get properties to link
      ])
      setOwners(ownersData.owners)
      setProperties(propertiesData.properties || [])
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setError('حدث خطأ أثناء تحميل بيانات الملاك. يرجى إعادة المحاولة.')
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
    setError(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (owner: any) => {
    setSelectedOwner(owner)
    setName(owner.name)
    setPhone(owner.phone)
    // W-1: Normalize date object/string to YYYY-MM-DD for input
    setDob(owner.dob ? new Date(owner.dob).toISOString().split('T')[0] : '')
    setNationalId(owner.nationalId || '')
    setRelationType(owner.type)
    setSelectedPropertyIds(owner.properties?.map((p: any) => p.id) || [])
    setError(null)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
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
    } catch (err: any) {
      console.error('Failed to save owner:', err)
      setError(err?.message || 'فشل حفظ بيانات المالك. يرجى التحقق من المدخلات.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return
    setDeleting(true)
    setError(null)
    try {
      await deleteOwner(deleteTargetId)
      setDeleteConfirmOpen(false)
      setDeleteTargetId(null)
      fetchData()
    } catch (err) {
      console.error('Failed to delete owner:', err)
      setError('حدث خطأ أثناء محاولة حذف المالك.')
    } finally {
      setDeleting(false)
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
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">إدارة الملاك</h1>
          <p className="mt-1 text-sm text-dim">
            إدارة بيانات ملاك العقارات، وكلائهم وممثلي الورثة
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          variant="default"
          className="flex items-center gap-2 font-bold shadow-sm rounded-lg"
        >
          <Plus className="h-4 w-4" />
          إضافة مالك جديد
        </Button>
      </div>

      {/* Error state banner */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 p-4 text-red-700 dark:text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
          <Input
            placeholder="البحث بالاسم، رقم الجوال أو الهوية..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-10 border-edge focus:border-dim bg-elevated rounded-lg"
          />
        </div>
      </div>

      {/* Owners Table Card */}
      <Card className="border border-edge bg-elevated shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-right text-sm">
              <thead className="bg-page border-b border-edge text-dim font-semibold">
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
              <tbody className="divide-y divide-edge text-heading">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-dim">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>جاري تحميل البيانات...</span>
                      </div>
                    </td>
                  </tr>
                ) : owners.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-dim">
                      لا يوجد ملاك مسجلين يطابقون البحث.
                    </td>
                  </tr>
                ) : (
                  owners.map((owner) => (
                    <tr key={owner.id} className="hover:bg-page transition-colors">
                      <td className="px-6 py-4 font-semibold text-primary">{owner.name}</td>
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
                        <span className="inline-flex items-center gap-1 rounded bg-page px-2.5 py-1 text-xs font-semibold text-primary border border-edge">
                          <Building className="h-3.5 w-3.5" />
                          {owner.properties?.length || 0} عقار
                        </span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/properties/owners/${owner.id}`}>
                            <Button variant="outline" size="sm" className="rounded-lg p-2 text-dim hover:text-primary border-edge">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(owner)}
                            className="rounded-lg p-2 text-dim hover:text-amber-600 border-edge"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(owner.id)}
                            className="rounded-lg p-2 text-dim hover:text-red-600 border-edge"
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
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-edge bg-elevated p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden" dir="rtl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-edge pb-4 mb-4">
              <h3 className="text-lg font-bold text-primary">
                {selectedOwner ? 'تعديل بيانات المالك' : 'إضافة مالك جديد'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-dim hover:bg-page transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1 text-right">
              <div>
                <label className="block text-xs font-semibold text-heading mb-1">الاسم الكامل</label>
                <Input
                  type="text"
                  required
                  placeholder="أدخل الاسم الكامل"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg border-edge focus:border-dim bg-page text-heading"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-heading mb-1">رقم الهاتف الجوال</label>
                  <Input
                    type="tel"
                    required
                    placeholder="مثال: 05xxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-lg border-edge focus:border-dim bg-page text-heading"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-heading mb-1">الهوية الوطنية / الإقامة</label>
                  <Input
                    type="text"
                    required
                    placeholder="مثال: 10xxxxxxx"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="rounded-lg border-edge focus:border-dim bg-page text-heading"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-heading mb-1">تاريخ الميلاد</label>
                  <Input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="rounded-lg border-edge focus:border-dim bg-page text-heading"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-heading mb-1">نوع العلاقة بالعقار</label>
                  <select
                    value={type}
                    onChange={(e) => setRelationType(e.target.value as any)}
                    className="w-full rounded-lg border border-edge bg-page px-3 py-2 text-sm text-heading focus:border-dim focus:outline-none"
                  >
                    <option value="OWNER">مالك</option>
                    <option value="AGENT">وكيل شرعي</option>
                    <option value="HEIRS_REPRESENTATIVE">ممثل ورثة</option>
                  </select>
                </div>
              </div>

              {/* Link Properties */}
              <div>
                <label className="block text-xs font-semibold text-heading mb-2">ربط عقارات (اختر من القائمة)</label>
                <div className="border border-edge rounded-lg p-3 max-h-40 overflow-y-auto space-y-2 bg-page">
                  {properties.length === 0 ? (
                    <div className="text-xs text-dim text-center py-4">لا توجد عقارات مسجلة للمكتب.</div>
                  ) : (
                    properties.map((prop) => {
                      const isChecked = selectedPropertyIds.includes(prop.id)
                      return (
                        <label key={prop.id} className="flex items-center gap-2 text-xs text-heading cursor-pointer hover:bg-elevated p-1 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleProperty(prop.id)}
                            className="rounded border-edge text-primary focus:ring-primary bg-page"
                          />
                          <span>{prop.titleAr || prop.title}</span>
                        </label>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="border-t border-edge pt-4 mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border-edge"
                  disabled={saving}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  className="font-bold rounded-lg px-6"
                  isLoading={saving}
                >
                  حفظ
                </Button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirmOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-edge bg-elevated p-6 shadow-2xl flex flex-col gap-4" dir="rtl">
            <h3 className="text-lg font-bold text-red-600 text-right">تأكيد الحذف</h3>
            <p className="text-sm text-heading text-right leading-relaxed">
              هل أنت متأكد من حذف هذا المالك؟ سيتم فصله عن كافة العقارات المرتبطة به. هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
                className="rounded-lg border-edge"
                disabled={deleting}
              >
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                className="font-bold rounded-lg px-6"
                isLoading={deleting}
              >
                حذف المالك
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
