'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Eye,
  Upload,
  X,
  Plus,
  ExternalLink,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  getProperty,
  updateProperty,
  deleteProperty,
  getAgents,
  type CreatePropertyInput,
} from '@/lib/actions/properties'

const AMENITIES = [
  'parking', 'pool', 'gym', 'elevator', 'security', 'garden', 'balcony',
  'maidRoom', 'driverRoom', 'storage', 'centralAC', 'splitAC',
  'furnished', 'kitchen', 'laundry', 'playground', 'mosque',
  'smartHome', 'cctv', 'fireSystem',
]

const AMENITY_LABELS: Record<string, string> = {
  parking: 'موقف سيارات',
  pool: 'مسبح',
  gym: 'نادي رياضي',
  elevator: 'مصعد',
  security: 'حراسة أمنية',
  garden: 'حديقة',
  balcony: 'شرفة',
  maidRoom: 'غرفة خادمة',
  driverRoom: 'غرفة سائق',
  storage: 'مستودع',
  centralAC: 'تكييف مركزي',
  splitAC: 'تكييف سبليت',
  furnished: 'مفروش',
  kitchen: 'مطبخ',
  laundry: 'غسيل',
  playground: 'ملعب أطفال',
  mosque: 'مسجد',
  smartHome: 'منزل ذكي',
  cctv: 'كاميرات مراقبة',
  fireSystem: 'نظام إطفاء',
}

const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: 'شقة' },
  { value: 'VILLA', label: 'فيلا' },
  { value: 'LAND', label: 'أرض' },
  { value: 'OFFICE', label: 'مكتب' },
  { value: 'COMMERCIAL', label: 'تجاري' },
  { value: 'BUILDING', label: 'مبنى' },
  { value: 'COMPOUND', label: 'مجمع' },
  { value: 'FARM', label: 'مزرعة' },
  { value: 'OTHER', label: 'أخرى' },
]

export default function EditPropertyPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agents, setAgents] = useState<Array<{ id: string; name: string; role: string }>>([])

  // Form state
  const [title, setTitle] = useState('')
  const [titleAr, setTitleAr] = useState('')
  const [description, setDescription] = useState('')
  const [descriptionAr, setDescriptionAr] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('SAR')
  const [dealType, setDealType] = useState<'SALE' | 'RENT'>('SALE')
  const [propertyType, setPropertyType] = useState('APARTMENT')
  const [area, setArea] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [city, setCity] = useState('')
  const [cityAr, setCityAr] = useState('')
  const [district, setDistrict] = useState('')
  const [districtAr, setDistrictAr] = useState('')
  const [street, setStreet] = useState('')
  const [streetAr, setStreetAr] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [tour360Url, setTour360Url] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')
  const [agentId, setAgentId] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [slug, setSlug] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [property, agentList] = await Promise.all([
          getProperty(propertyId),
          getAgents(),
        ])
        setAgents(agentList)

        if (!property) {
          setError('العقار غير موجود')
          return
        }

        setTitle(property.title || '')
        setTitleAr(property.titleAr || '')
        setDescription(property.description || '')
        setDescriptionAr(property.descriptionAr || '')
        setPrice(property.price || '0')
        setCurrency(property.currency || 'SAR')
        setDealType(property.dealType as 'SALE' | 'RENT')
        setPropertyType(property.propertyType)
        setArea(property.area?.toString() || '')
        setBedrooms(property.bedrooms?.toString() || '')
        setBathrooms(property.bathrooms?.toString() || '')
        setSelectedAmenities(
          Array.isArray(property.amenities) ? (property.amenities as string[]) : []
        )
        setCity(property.city || '')
        setCityAr(property.cityAr || '')
        setDistrict(property.district || '')
        setDistrictAr(property.districtAr || '')
        setStreet(property.street || '')
        setStreetAr(property.streetAr || '')
        setLat(property.lat?.toString() || '')
        setLng(property.lng?.toString() || '')
        setVideoUrl(property.videoUrl || '')
        setTour360Url(property.tour360Url || '')
        setTags(property.tags || [])
        setIsFeatured(property.isFeatured)
        setStatus(property.status as 'DRAFT' | 'PUBLISHED')
        setAgentId(property.agentId || '')
        setSeoTitle(property.seoTitle || '')
        setSeoDescription(property.seoDescription || '')
        setSlug(property.slug || '')
      } catch (err) {
        setError('فشل في تحميل العقار')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [propertyId])

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    )
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleSave = async () => {
    setSubmitting(true)
    setError(null)

    try {
      const input: Partial<CreatePropertyInput> = {
        title: title.trim(),
        titleAr: titleAr.trim() || undefined,
        description: description.trim() || undefined,
        descriptionAr: descriptionAr.trim() || undefined,
        price: parseInt(price) || 0,
        currency,
        dealType: dealType as 'SALE' | 'RENT',
        propertyType: propertyType as CreatePropertyInput['propertyType'],
        area: parseFloat(area) || undefined,
        bedrooms: parseInt(bedrooms) || undefined,
        bathrooms: parseInt(bathrooms) || undefined,
        amenities: selectedAmenities,
        tags,
        isFeatured,
        city: city.trim() || undefined,
        cityAr: cityAr.trim() || undefined,
        district: district.trim() || undefined,
        districtAr: districtAr.trim() || undefined,
        street: street.trim() || undefined,
        streetAr: streetAr.trim() || undefined,
        lat: parseFloat(lat) || undefined,
        lng: parseFloat(lng) || undefined,
        videoUrl: videoUrl.trim() || undefined,
        tour360Url: tour360Url.trim() || undefined,
        status,
        agentId: agentId || undefined,
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined,
      }

      await updateProperty(propertyId, input)
      router.push('/dashboard/properties')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحديث العقار')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا العقار؟ لا يمكن التراجع عن هذا الإجراء.')) return
    try {
      await deleteProperty(propertyId)
      router.push('/dashboard/properties')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في حذف العقار')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8A96E] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/properties">
            <button className="rounded-lg p-2 text-[#718096] transition-colors hover:bg-[#F7F7F2] hover:text-[#1E3A5F]">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#2D3748]">تعديل العقار</h1>
            <p className="text-sm text-[#718096]">/{slug}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            حذف
          </Button>
          <Button onClick={handleSave} isLoading={submitting}>
            <Save className="h-4 w-4" />
            حفظ التغييرات
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>العنوان (إنجليزي)</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label>العنوان (عربي)</Label>
                  <Input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} dir="rtl" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>الوصف (إنجليزي)</Label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} dir="ltr" className="flex w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748] placeholder:text-[#718096] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]" />
                </div>
                <div className="space-y-2">
                  <Label>الوصف (عربي)</Label>
                  <textarea value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} rows={4} dir="rtl" className="flex w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748] placeholder:text-[#718096] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price & Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">السعر والتفاصيل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>السعر</Label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label>العملة</Label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="flex h-10 w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748]">
                    <option value="SAR">ر.س</option>
                    <option value="USD">دولار</option>
                    <option value="AED">د.إ</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>نوع الصفقة</Label>
                  <div className="flex rounded-lg border border-[#E2E8F0] p-1">
                    <button type="button" onClick={() => setDealType('SALE')} className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${dealType === 'SALE' ? 'bg-[#C8A96E] text-[#1E3A5F]' : 'text-[#718096]'}`}>بيع</button>
                    <button type="button" onClick={() => setDealType('RENT')} className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${dealType === 'RENT' ? 'bg-[#C8A96E] text-[#1E3A5F]' : 'text-[#718096]'}`}>إيجار</button>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <Label>نوع العقار</Label>
                  <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="flex h-10 w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748]">
                    {PROPERTY_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                  </select>
                </div>
                <div className="space-y-2"><Label>المساحة (م²)</Label><Input type="number" value={area} onChange={(e) => setArea(e.target.value)} dir="ltr" /></div>
                <div className="space-y-2"><Label>غرف النوم</Label><Input type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} dir="ltr" /></div>
                <div className="space-y-2"><Label>دورات المياه</Label><Input type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} dir="ltr" /></div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader><CardTitle className="text-base">المرافق</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((amenity) => (
                  <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)} className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${selectedAmenities.includes(amenity) ? 'border-[#C8A96E] bg-[#C8A96E]/10 text-[#C8A96E]' : 'border-[#E2E8F0] text-[#718096] hover:border-[#C8A96E]/30'}`}>{AMENITY_LABELS[amenity] || amenity}</button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader><CardTitle className="text-base">العنوان</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>المدينة (إنجليزي)</Label><Input value={city} onChange={(e) => setCity(e.target.value)} dir="ltr" /></div>
                <div className="space-y-2"><Label>المدينة (عربي)</Label><Input value={cityAr} onChange={(e) => setCityAr(e.target.value)} dir="rtl" /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>الحي (إنجليزي)</Label><Input value={district} onChange={(e) => setDistrict(e.target.value)} dir="ltr" /></div>
                <div className="space-y-2"><Label>الحي (عربي)</Label><Input value={districtAr} onChange={(e) => setDistrictAr(e.target.value)} dir="rtl" /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>خط العرض</Label><Input type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} dir="ltr" /></div>
                <div className="space-y-2"><Label>خط الطول</Label><Input type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} dir="ltr" /></div>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader><CardTitle className="text-base">تحسين محركات البحث (SEO)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>عنوان SEO</Label><Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} dir="rtl" /></div>
              <div className="space-y-2"><Label>وصف SEO</Label><textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={3} dir="rtl" className="flex w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748] placeholder:text-[#718096] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]" /></div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">الحالة</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <select value={status} onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')} className="flex h-10 w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748]">
                <option value="DRAFT">مسودة</option>
                <option value="PUBLISHED">منشور</option>
              </select>
              <div className="flex items-center justify-between">
                <Label>مميز</Label>
                <button type="button" onClick={() => setIsFeatured(!isFeatured)} className={`relative h-6 w-11 rounded-full transition-colors ${isFeatured ? 'bg-[#C8A96E]' : 'bg-[#EBF0F7]'}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${isFeatured ? 'start-[22px]' : 'start-0.5'}`} />
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">الوكيل</CardTitle></CardHeader>
            <CardContent>
              <select value={agentId} onChange={(e) => setAgentId(e.target.value)} className="flex h-10 w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748]">
                <option value="">لم يتم تعيين وكيل</option>
                {agents.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}
              </select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">الوسوم</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} placeholder="أضف وسم..." dir="rtl" />
                <Button variant="outline" size="icon" onClick={addTag}><Plus className="h-4 w-4" /></Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">{tag}<button onClick={() => setTags(tags.filter((t) => t !== tag))}><X className="h-3 w-3" /></button></Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Video & Tour */}
          <Card>
            <CardHeader><CardTitle className="text-base">روابط الوسائط</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>رابط الفيديو</Label><Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} dir="ltr" /></div>
              <div className="space-y-2"><Label>رابط جولة 360°</Label><Input value={tour360Url} onChange={(e) => setTour360Url(e.target.value)} dir="ltr" /></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
