'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowRight,
  User,
  Phone,
  Calendar,
  Building,
  Eye,
  Edit,
  MapPin,
  Tag,
  DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getOwner } from '@/lib/actions/owners'

const RELATION_TYPES = {
  OWNER: 'مالك',
  AGENT: 'وكيل',
  HEIRS_REPRESENTATIVE: 'ممثل ورثة',
}

const PROPERTY_TYPES_AR: Record<string, string> = {
  APARTMENT: 'شقة',
  VILLA: 'فيلا',
  LAND: 'أرض',
  OFFICE: 'مكتب',
  COMMERCIAL: 'تجاري',
  BUILDING: 'عمارة',
  COMPOUND: 'مجمع',
  FARM: 'مزرعة',
  OTHER: 'أخرى',
}

const DEAL_TYPES_AR: Record<string, string> = {
  SALE: 'للبيع',
  RENT: 'للإيجار',
}

export default function OwnerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [owner, setOwner] = useState<any | null>(null)

  const fetchOwner = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await getOwner(id)
      setOwner(data)
    } catch (error) {
      console.error('Failed to fetch owner details:', error)
      router.push('/dashboard/properties/owners')
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchOwner()
  }, [fetchOwner])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[#718096]" dir="rtl">
        جاري تحميل تفاصيل المالك...
      </div>
    )
  }

  if (!owner) {
    return (
      <div className="text-center py-12 text-[#718096]" dir="rtl">
        المالك غير موجود.
      </div>
    )
  }

  const formatPrice = (price: any) => {
    try {
      const p = Number(price)
      return p.toLocaleString('ar-SA-u-nu-latn')
    } catch (e) {
      return price?.toString() || '0'
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn text-right" dir="rtl">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/properties/owners">
          <Button variant="outline" size="sm" className="rounded-lg border-[#E2E8F0] hover:bg-[#FAFAF7]">
            <ArrowRight className="h-4 w-4 ml-1" />
            العودة لقائمة الملاك
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Owner Card Info */}
        <Card className="border border-[#E2E8F0] bg-white shadow-sm rounded-xl overflow-hidden lg:col-span-1">
          <CardHeader className="bg-[#FAFAF7] border-b border-[#E2E8F0] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C8A96E]/10 text-[#C8A96E]">
                <User className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-[#1E3A5F]">{owner.name}</CardTitle>
                <Badge
                  variant={
                    owner.type === 'OWNER'
                      ? 'success'
                      : owner.type === 'AGENT'
                      ? 'default'
                      : 'warning'
                  }
                  className="mt-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                >
                  {RELATION_TYPES[owner.type as keyof typeof RELATION_TYPES]}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#718096] flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                رقم الجوال:
              </span>
              <span className="font-semibold text-[#2D3748] font-mono">{owner.phone}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#718096] flex items-center gap-1.5">
                <Building className="h-4 w-4" />
                الهوية الوطنية:
              </span>
              <span className="font-semibold text-[#2D3748] font-mono">{owner.nationalId}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#718096] flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                تاريخ الميلاد:
              </span>
              <span className="font-semibold text-[#2D3748] font-mono">
                {owner.dob ? new Date(owner.dob).toLocaleDateString('ar-SA-u-nu-latn') : '-'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-[#E2E8F0] pt-4">
              <span className="text-[#718096]">تاريخ التسجيل:</span>
              <span className="font-semibold text-[#2D3748] font-mono text-xs">
                {new Date(owner.createdAt).toLocaleDateString('ar-SA-u-nu-latn')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Owned Properties List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#1E3A5F]">العقارات المملوكة ({owner.properties?.length || 0})</h2>
          </div>

          <Card className="border border-[#E2E8F0] bg-white shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-0">
              {owner.properties?.length === 0 ? (
                <div className="text-center py-12 text-[#718096]">
                  لا توجد عقارات مرتبطة بهذا المالك حالياً.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-right text-sm">
                    <thead className="bg-[#FAFAF7] border-b border-[#E2E8F0] text-[#718096] font-semibold">
                      <tr>
                        <th className="px-6 py-4">العقار</th>
                        <th className="px-6 py-4">النوع</th>
                        <th className="px-6 py-4">العرض</th>
                        <th className="px-6 py-4">الموقع</th>
                        <th className="px-6 py-4">السعر</th>
                        <th className="px-6 py-4 text-left">العمليات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] text-[#2D3748]">
                      {owner.properties.map((prop: any) => (
                        <tr key={prop.id} className="hover:bg-[#FAFAF7] transition-colors">
                          <td className="px-6 py-4 font-semibold text-[#1E3A5F]">
                            {prop.titleAr || prop.title}
                          </td>
                          <td className="px-6 py-4">
                            {PROPERTY_TYPES_AR[prop.propertyType] || prop.propertyType}
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={prop.dealType === 'SALE' ? 'success' : 'default'}
                              className="rounded-md font-semibold"
                            >
                              {DEAL_TYPES_AR[prop.dealType] || prop.dealType}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <span className="flex items-center gap-1 text-xs text-[#718096]">
                              <MapPin className="h-3.5 w-3.5" />
                              {prop.cityAr || 'الرياض'} - {prop.districtAr || ''}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-[#C8A96E] font-mono">
                            {formatPrice(prop.price)} ر.س
                          </td>
                          <td className="px-6 py-4 text-left">
                            <Link href={`/dashboard/properties/${prop.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg p-2 text-[#718096] hover:text-[#1E3A5F] border-[#E2E8F0]"
                              >
                                <Edit className="h-4 w-4 ml-1" />
                                تعديل العقار
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
