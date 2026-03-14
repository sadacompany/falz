'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft,
  Upload,
  X,
  GripVertical,
  ImageIcon,
  Save,
  Globe,
  Plus,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createProperty, getAgents, type CreatePropertyInput } from '@/lib/actions/properties'
import { useEffect } from 'react'

// ─── Amenity List ───────────────────────────────────────────

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

// ─── Component ──────────────────────────────────────────────

export default function NewPropertyPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
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
  const [mediaFiles, setMediaFiles] = useState<Array<{ file: File; preview: string }>>([])

  useEffect(() => {
    getAgents().then(setAgents).catch(() => {})
  }, [])

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }))
    setMediaFiles((prev) => [...prev, ...newFiles])
  }, [])

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => {
      const copy = [...prev]
      URL.revokeObjectURL(copy[index].preview)
      copy.splice(index, 1)
      return copy
    })
  }

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

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleSubmit = async (saveStatus: 'DRAFT' | 'PUBLISHED') => {
    if (!title.trim()) {
      setError('العنوان مطلوب')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const input: CreatePropertyInput = {
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
        status: saveStatus,
        agentId: agentId || undefined,
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined,
      }

      // TODO: Upload media files first, then pass URLs
      // For now, create property without media
      await createProperty(input)
      router.push('/dashboard/properties')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في إنشاء العقار')
    } finally {
      setSubmitting(false)
    }
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
          <h1 className="text-2xl font-bold text-[#2D3748]">إضافة عقار</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit('DRAFT')}
            disabled={submitting}
          >
            <Save className="h-4 w-4" />
            حفظ كمسودة
          </Button>
          <Button onClick={() => handleSubmit('PUBLISHED')} isLoading={submitting}>
            نشر
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Left 2 Columns */}
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
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Luxury Villa in Riyadh"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>العنوان (عربي)</Label>
                  <Input
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder="فيلا فاخرة في الرياض"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>الوصف (إنجليزي)</Label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="وصف العقار بالإنجليزية..."
                    dir="ltr"
                    rows={4}
                    className="flex w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748] placeholder:text-[#718096] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الوصف (عربي)</Label>
                  <textarea
                    value={descriptionAr}
                    onChange={(e) => setDescriptionAr(e.target.value)}
                    placeholder="وصف العقار..."
                    dir="rtl"
                    rows={4}
                    className="flex w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748] placeholder:text-[#718096] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]"
                  />
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
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="1000000"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>العملة</Label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748]"
                  >
                    <option value="SAR">ر.س</option>
                    <option value="USD">دولار</option>
                    <option value="AED">د.إ</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>نوع الصفقة</Label>
                  <div className="flex rounded-lg border border-[#E2E8F0] p-1">
                    <button
                      type="button"
                      onClick={() => setDealType('SALE')}
                      className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                        dealType === 'SALE'
                          ? 'bg-[#C8A96E] text-[#1E3A5F]'
                          : 'text-[#718096] hover:text-[#1E3A5F]'
                      }`}
                    >
                      بيع
                    </button>
                    <button
                      type="button"
                      onClick={() => setDealType('RENT')}
                      className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                        dealType === 'RENT'
                          ? 'bg-[#C8A96E] text-[#1E3A5F]'
                          : 'text-[#718096] hover:text-[#1E3A5F]'
                      }`}
                    >
                      إيجار
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <Label>نوع العقار</Label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748]"
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>المساحة (م²)</Label>
                  <Input
                    type="number"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="250"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>غرف النوم</Label>
                  <Input
                    type="number"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    placeholder="4"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>دورات المياه</Label>
                  <Input
                    type="number"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    placeholder="3"
                    dir="ltr"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">العنوان</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>المدينة (إنجليزي)</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Riyadh" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label>المدينة (عربي)</Label>
                  <Input value={cityAr} onChange={(e) => setCityAr(e.target.value)} placeholder="الرياض" dir="rtl" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>الحي (إنجليزي)</Label>
                  <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Al Olaya" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label>الحي (عربي)</Label>
                  <Input value={districtAr} onChange={(e) => setDistrictAr(e.target.value)} placeholder="العليا" dir="rtl" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>الشارع (إنجليزي)</Label>
                  <Input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="King Fahd Road" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label>الشارع (عربي)</Label>
                  <Input value={streetAr} onChange={(e) => setStreetAr(e.target.value)} placeholder="طريق الملك فهد" dir="rtl" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>خط العرض</Label>
                  <Input type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="24.7136" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label>خط الطول</Label>
                  <Input type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="46.6753" dir="ltr" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">الوسائط</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  handleFileSelect(e.dataTransfer.files)
                }}
                className="cursor-pointer rounded-xl border-2 border-dashed border-[#E2E8F0] bg-[#FAFAF7] p-8 text-center transition-all hover:border-[#C8A96E]/40"
              >
                <Upload className="mx-auto h-8 w-8 text-[#718096]" />
                <p className="mt-2 text-sm font-medium text-[#2D3748]">
                  اسحب الصور هنا أو اضغط للرفع
                </p>
                <p className="mt-1 text-xs text-[#718096]">
                  JPG, PNG, WebP - الحد الأقصى 10MB لكل صورة
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </div>

              {/* Preview Grid */}
              {mediaFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  {mediaFiles.map((media, idx) => (
                    <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg border border-[#E2E8F0]">
                      <Image
                        src={media.preview}
                        alt={`صورة ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={() => removeMedia(idx)}
                        className="absolute end-1 top-1 rounded-full bg-red-600 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                      {idx === 0 && (
                        <div className="absolute bottom-0 start-0 end-0 bg-[#C8A96E] py-0.5 text-center text-[10px] font-medium text-[#1E3A5F]">
                          الغلاف
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Video & 360 */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>رابط الفيديو</Label>
                  <Input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>رابط جولة 360°</Label>
                  <Input
                    value={tour360Url}
                    onChange={(e) => setTour360Url(e.target.value)}
                    placeholder="https://..."
                    dir="ltr"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">المرافق</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                      selectedAmenities.includes(amenity)
                        ? 'border-[#C8A96E] bg-[#C8A96E]/10 text-[#C8A96E]'
                        : 'border-[#E2E8F0] text-[#718096] hover:border-[#C8A96E]/30 hover:text-[#1E3A5F]'
                    }`}
                  >
                    {AMENITY_LABELS[amenity] || amenity}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">تحسين محركات البحث (SEO)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>عنوان SEO</Label>
                <Input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="عنوان مخصص لمحركات البحث"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label>وصف SEO</Label>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="وصف مخصص لمحركات البحث..."
                  dir="rtl"
                  rows={3}
                  className="flex w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748] placeholder:text-[#718096] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">الحالة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                className="flex h-10 w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748]"
              >
                <option value="DRAFT">مسودة</option>
                <option value="PUBLISHED">منشور</option>
              </select>

              <div className="flex items-center justify-between">
                <Label>مميز</Label>
                <button
                  type="button"
                  onClick={() => setIsFeatured(!isFeatured)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    isFeatured ? 'bg-[#C8A96E]' : 'bg-[#EBF0F7]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      isFeatured ? 'start-[22px]' : 'start-0.5'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Agent Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">تعيين الوكيل</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748]"
              >
                <option value="">لم يتم تعيين وكيل</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.role})
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">الوسوم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  placeholder="أضف وسم..."
                  dir="rtl"
                />
                <Button variant="outline" size="icon" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
