'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft,
  Upload,
  X,
  GripVertical,
  ImageIcon,
  Save,
  Plus,
  Trash2,
  Coins,
  MapPin,
  FileText,
  User,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
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
import { getSubtypes } from '@/lib/actions/subtypes'
import { getOwners, createOwner } from '@/lib/actions/owners'
import { MockMapPicker } from '@/components/shared/MockMapPicker'
import { PropertyCategory, PricingModel, PaymentMethod, Availability } from '@prisma/client'
import { cn, formatPrice } from '@/lib/utils'

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

export default function EditPropertyPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const deedFileInputRef = useRef<HTMLInputElement>(null)
  const [agents, setAgents] = useState<Array<{ id: string; name: string; role: string }>>([])

  // Main Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [dealType, setDealType] = useState<'SALE' | 'RENT'>('SALE')
  const [category, setCategory] = useState<PropertyCategory>('RESIDENTIAL')
  const [subtypeId, setSubtypeId] = useState('')
  const [subtypes, setSubtypes] = useState<any[]>([])
  const [area, setArea] = useState('')
  const [builtArea, setBuiltArea] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  
  // Location
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [street, setStreet] = useState('')
  const [directionalArea, setDirectionalArea] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)

  // Media
  const [videoUrl, setVideoUrl] = useState('')
  const [tour360Url, setTour360Url] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')
  const [availability, setAvailability] = useState<Availability>('AVAILABLE')
  const [agentId, setAgentId] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [mediaFiles, setMediaFiles] = useState<Array<{ file?: File; preview: string }>>([])
  const [slug, setSlug] = useState('')

  // Specifications
  const [facing, setFacing] = useState('')
  const [streetWidth, setStreetWidth] = useState('')
  const [age, setAge] = useState('')
  const [floorNumber, setFloorNumber] = useState('')
  const [borderNorth, setBorderNorth] = useState('')
  const [borderSouth, setBorderSouth] = useState('')
  const [borderEast, setBorderEast] = useState('')
  const [borderWest, setBorderWest] = useState('')
  const [internalNotes, setInternalNotes] = useState('')

  // Pricing & Transaction
  const [pricingModel, setPricingModel] = useState<PricingModel>('LIMIT')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_AND_CASH')

  // Bids (if PricingModel === BID)
  const [bidsList, setBidsList] = useState<any[]>([])
  const [newBidAmount, setNewBidAmount] = useState('')
  const [newBidderName, setNewBidderName] = useState('')
  const [newBidderPhone, setNewBidderPhone] = useState('')
  const [newBidDate, setNewBidDate] = useState(new Date().toISOString().split('T')[0])

  // Legal Documents
  const [deedNumber, setDeedNumber] = useState('')
  const [deedFile, setDeedFile] = useState('')
  const [marketingContractNumber, setMarketingContractNumber] = useState('')
  const [contractExpiryDate, setContractExpiryDate] = useState('')

  // Owners CRM Selection
  const [owners, setOwners] = useState<any[]>([])
  const [ownerId, setOwnerId] = useState('')
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false)

  // Owner Modal Fields
  const [newOwnerName, setNewOwnerName] = useState('')
  const [newOwnerPhone, setNewOwnerPhone] = useState('')
  const [newOwnerDob, setNewOwnerDob] = useState('')
  const [newOwnerNationalId, setNewOwnerNationalId] = useState('')
  const [ownerModalError, setOwnerModalError] = useState<string | null>(null)
  const [ownerModalLoading, setOwnerModalLoading] = useState(false)

  // Fetch subtypes based on category
  useEffect(() => {
    getSubtypes(category).then(setSubtypes).catch(() => {})
  }, [category])

  // Fetch initial details
  useEffect(() => {
    async function load() {
      try {
        const [property, agentList, ownersList] = await Promise.all([
          getProperty(propertyId),
          getAgents(),
          getOwners(),
        ])
        setAgents(agentList)
        setOwners(ownersList.owners)

        if (!property) {
          setError('العقار غير موجود')
          return
        }

        setTitle(property.title || '')
        setDescription(property.description || '')
        setPrice(property.price || '0')
        setDealType(property.dealType as 'SALE' | 'RENT')
        setCategory(property.category as PropertyCategory)
        setSubtypeId(property.subtypeId || '')
        setOwnerId(property.ownerId || '')
        setArea(property.area?.toString() || '')
        setBuiltArea(property.builtArea?.toString() || '')
        setBedrooms(property.bedrooms?.toString() || '')
        setBathrooms(property.bathrooms?.toString() || '')
        setSelectedAmenities(
          Array.isArray(property.amenities) ? (property.amenities as string[]) : []
        )
        setCity(property.city || '')
        setDistrict(property.district || '')
        setStreet(property.street || '')
        setDirectionalArea(property.directionalArea || '')
        setLat(property.lat ?? null)
        setLng(property.lng ?? null)
        setVideoUrl(property.videoUrl || '')
        setTour360Url(property.tour360Url || '')
        setTags(property.tags || [])
        setIsFeatured(property.isFeatured)
        setStatus(property.status as 'DRAFT' | 'PUBLISHED')
        setAvailability(property.availability as Availability)
        setAgentId(property.agentId || '')
        setSeoTitle(property.seoTitle || '')
        setSeoDescription(property.seoDescription || '')
        setSlug(property.slug || '')

        // Specs
        setFacing(property.facing || '')
        setStreetWidth(property.streetWidth || '')
        setAge(property.age?.toString() || '')
        setFloorNumber(property.floorNumber?.toString() || '')
        setBorderNorth(property.borderNorth?.toString() || '')
        setBorderSouth(property.borderSouth?.toString() || '')
        setBorderEast(property.borderEast?.toString() || '')
        setBorderWest(property.borderWest?.toString() || '')
        setInternalNotes(property.internalNotes || '')

        // Pricing & Payment
        setPricingModel(property.pricingModel as PricingModel)
        setPaymentMethod(property.paymentMethod as PaymentMethod)
        setBidsList(property.bids || [])

        // Legal
        setDeedNumber(property.deedNumber || '')
        setDeedFile(property.deedFile || '')
        setMarketingContractNumber(property.marketingContractNumber || '')
        setContractExpiryDate(
          property.contractExpiryDate
            ? new Date(property.contractExpiryDate).toISOString().split('T')[0]
            : ''
        )

        // Media files preview
        if (Array.isArray(property.media)) {
          setMediaFiles(
            property.media.map((m: any) => ({
              preview: m.url,
            }))
          )
        }
      } catch (err) {
        setError('فشل في تحميل العقار')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [propertyId])

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
      if (copy[index].file === undefined) {
        // Revoke preview if base64 or object URL (not external)
      } else {
        URL.revokeObjectURL(copy[index].preview)
      }
      copy.splice(index, 1)
      return copy
    })
  }

  const handleDeedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDeedFile(file.name)
    }
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

  // Check if subtype or category represents Land
  const isLandSelected = () => {
    if (category === 'AGRICULTURAL') return true;
    const subTypeName = subtypes.find(s => s.id === subtypeId)?.name || '';
    return subTypeName === 'أرض سكنية' || subTypeName === 'أرض تجارية' || subTypeName === 'أرض زراعية' || subTypeName.includes('أرض');
  }

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOwnerName.trim() || !newOwnerPhone.trim() || !newOwnerNationalId.trim()) {
      setOwnerModalError('يرجى ملء جميع الحقول الإلزامية للمالك')
      return
    }
    setOwnerModalLoading(true)
    setOwnerModalError(null)
    try {
      const owner = await createOwner({
        name: newOwnerName.trim(),
        phone: newOwnerPhone.trim(),
        dob: newOwnerDob ? new Date(newOwnerDob) : null,
        nationalId: newOwnerNationalId.trim(),
      })
      const res = await getOwners()
      setOwners(res.owners)
      setOwnerId(owner.id)
      setIsOwnerModalOpen(false)
      setNewOwnerName('')
      setNewOwnerPhone('')
      setNewOwnerDob('')
      setNewOwnerNationalId('')
    } catch (err: any) {
      console.error(err)
      setOwnerModalError(err.message || 'فشل في إنشاء المالك')
    } finally {
      setOwnerModalLoading(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setError('العنوان مطلوب')
      return
    }
    if (deedNumber.trim() && !deedFile) {
      setError('يجب تحميل ملف صك الملكية عند إدخال رقم الصك')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const input: Partial<CreatePropertyInput> = {
        title: title.trim(),
        titleAr: title.trim(),
        description: description.trim() || undefined,
        descriptionAr: description.trim() || undefined,
        price: parseInt(price) || 0,
        currency: 'SAR',
        dealType: dealType as 'SALE' | 'RENT',
        propertyType: isLandSelected() ? 'LAND' : category === 'AGRICULTURAL' ? 'FARM' : 'OTHER',
        category,
        subtypeId: subtypeId || null,
        ownerId: ownerId || null,
        area: parseFloat(area) || undefined,
        builtArea: isLandSelected() ? undefined : (parseFloat(builtArea) || undefined),
        bedrooms: isLandSelected() ? 0 : (parseInt(bedrooms) || undefined),
        bathrooms: isLandSelected() ? 0 : (parseInt(bathrooms) || undefined),
        amenities: selectedAmenities,
        tags,
        isFeatured,
        city: city.trim() || undefined,
        cityAr: city.trim() || undefined,
        district: district.trim() || undefined,
        districtAr: district.trim() || undefined,
        street: street.trim() || undefined,
        streetAr: street.trim() || undefined,
        lat: lat !== null ? lat : undefined,
        lng: lng !== null ? lng : undefined,
        videoUrl: videoUrl.trim() || undefined,
        tour360Url: tour360Url.trim() || undefined,
        status,
        availability,
        agentId: agentId || undefined,
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined,
        facing: facing.trim() || undefined,
        streetWidth: streetWidth.trim() || undefined,
        age: parseInt(age) || undefined,
        floorNumber: isLandSelected() ? undefined : (parseInt(floorNumber) || undefined),
        borderNorth: parseFloat(borderNorth) || undefined,
        borderSouth: parseFloat(borderSouth) || undefined,
        borderEast: parseFloat(borderEast) || undefined,
        borderWest: parseFloat(borderWest) || undefined,
        internalNotes: internalNotes.trim() || undefined,
        pricingModel,
        paymentMethod,
        directionalArea: directionalArea.trim() || undefined,
        deedNumber: deedNumber.trim() || undefined,
        deedFile: deedFile.trim() || undefined,
        marketingContractNumber: marketingContractNumber.trim() || undefined,
        contractExpiryDate: contractExpiryDate ? new Date(contractExpiryDate) : undefined,
        newBid: (pricingModel === 'BID' && newBidAmount) ? {
          amount: parseInt(newBidAmount),
          bidderName: newBidderName.trim(),
          bidderPhone: newBidderPhone.trim(),
          bidDate: newBidDate ? new Date(newBidDate) : undefined,
        } : undefined,
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const isLand = isLandSelected()

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-edge pb-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/properties">
            <button className="rounded-lg p-2 text-dim hover:bg-card-hover hover:text-heading transition-colors">
              <ArrowLeft className="h-5 w-5 rotate-180" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-heading">تعديل العقار</h1>
            <p className="text-xs text-dim mt-0.5">تعديل وتحديث المواصفات لـ: {slug}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            حذف
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} disabled={submitting}>
            <Save className="h-4 w-4" />
            حفظ التغييرات
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content Columns */}
        <div className="space-y-6 lg:col-span-2">
          {/* Owner Selection - PRD: Must be first in form */}
          <Card>
            <CardHeader className="pb-3 border-b border-edge mb-4">
              <CardTitle className="text-base text-primary flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span>مالك العقار</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">اختر المالك</Label>
                <button
                  type="button"
                  onClick={() => setIsOwnerModalOpen(true)}
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
                >
                  <Plus className="h-3 w-3" />
                  + إضافة مالك جديد
                </button>
              </div>
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-edge bg-page px-3 py-2 text-sm text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dim"
              >
                <option value="">لم يتم ربط مالك</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.phone})
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader className="pb-3 border-b border-edge mb-4">
              <CardTitle className="text-base text-primary">المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-xs font-semibold">عنوان العقار</Label>
                  <Input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="العنوان"
                    className="bg-page"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">التصنيف الرئيسي</Label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value as PropertyCategory)
                      setSubtypeId('')
                    }}
                    className="flex h-10 w-full rounded-md border border-edge bg-page px-3 py-2 text-sm text-heading focus-visible:outline-none"
                  >
                    <option value="RESIDENTIAL">سكنية</option>
                    <option value="COMMERCIAL">تجارية</option>
                    <option value="AGRICULTURAL">زراعية</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">التصنيف الفرعي</Label>
                  <select
                    value={subtypeId}
                    onChange={(e) => setSubtypeId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-edge bg-page px-3 py-2 text-sm text-heading focus-visible:outline-none"
                  >
                    <option value="">اختر تصنيف فرعي</option>
                    {subtypes.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>


              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">وصف العقار</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="الوصف..."
                  rows={4}
                  className="flex w-full rounded-md border border-edge bg-page px-3 py-2 text-sm text-heading focus-visible:outline-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Transaction */}
          <Card>
            <CardHeader className="pb-3 border-b border-edge mb-4">
              <CardTitle className="text-base text-primary">التسعير والمعاملات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">نوع الصفقة</Label>
                  <div className="flex rounded-lg border border-edge p-1 bg-page">
                    <button
                      type="button"
                      onClick={() => setDealType('SALE')}
                      className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${
                        dealType === 'SALE' ? 'bg-primary text-white' : 'text-dim hover:text-heading'
                      }`}
                    >
                      بيع
                    </button>
                    <button
                      type="button"
                      onClick={() => setDealType('RENT')}
                      className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${
                        dealType === 'RENT' ? 'bg-primary text-white' : 'text-dim hover:text-heading'
                      }`}
                    >
                      إيجار
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">طريقة الدفع المقبولة</Label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="flex h-10 w-full rounded-md border border-edge bg-page px-3 py-2 text-sm text-heading focus-visible:outline-none"
                  >
                    <option value="BANK_AND_CASH">تقبل التمويل البنكي والكاش</option>
                    <option value="CASH">كاش فقط</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">إستراتيجية التسعير</Label>
                  <div className="flex rounded-lg border border-edge p-1 bg-page">
                    <button
                      type="button"
                      onClick={() => setPricingModel('LIMIT')}
                      className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${
                        pricingModel === 'LIMIT' ? 'bg-primary text-white' : 'text-dim hover:text-heading'
                      }`}
                    >
                      حد (سعر ثابت)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPricingModel('BID')}
                      className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${
                        pricingModel === 'BID' ? 'bg-primary text-white' : 'text-dim hover:text-heading'
                      }`}
                    >
                      سوم (مزاد)
                    </button>
                  </div>
                </div>
              </div>

              {pricingModel === 'LIMIT' ? (
                <div className="space-y-2 w-full sm:w-1/3">
                  <Label className="text-xs font-semibold">السعر المطلوب (ر.س)</Label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="السعر المطلوب"
                    className="bg-page"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Bids history list */}
                  {bidsList.length > 0 && (
                    <div className="rounded-xl border border-edge bg-alt/5 p-4 space-y-2">
                      <Label className="text-xs font-bold text-primary block">سجل المساومات الحالي ({bidsList.length})</Label>
                      <div className="divide-y divide-edge">
                        {bidsList.map((bid, i) => (
                          <div key={bid.id} className="flex justify-between py-2 text-xs">
                            <span className="font-bold text-heading">{formatPrice(BigInt(bid.amount), 'SAR')}</span>
                            <span className="text-dim">بواسطة {bid.bidderName} ({bid.bidderPhone})</span>
                            <span className="text-dim">{new Date(bid.bidDate).toLocaleDateString('ar-SA-u-nu-latn')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add bid subform */}
                  <div className="rounded-xl border border-dashed border-edge p-4 space-y-3">
                    <div className="flex items-center gap-1.5 text-primary text-xs font-bold">
                      <Plus className="h-4 w-4" />
                      <span>إضافة مساومة (سومة) جديدة للعقار</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px]">مبلغ السوم (ر.س)</Label>
                        <Input
                          type="number"
                          value={newBidAmount}
                          onChange={(e) => {
                            setNewBidAmount(e.target.value)
                            setPrice(e.target.value)
                          }}
                          placeholder="مبلغ السوم"
                          className="bg-page text-xs font-semibold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px]">اسم السائم</Label>
                        <Input
                          type="text"
                          value={newBidderName}
                          onChange={(e) => setNewBidderName(e.target.value)}
                          placeholder="الاسم"
                          className="bg-page text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px]">جوال السائم</Label>
                        <Input
                          type="tel"
                          value={newBidderPhone}
                          onChange={(e) => setNewBidderPhone(e.target.value)}
                          placeholder="الجوال"
                          className="bg-page text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px]">تاريخ السوم</Label>
                        <Input
                          type="date"
                          value={newBidDate}
                          onChange={(e) => setNewBidDate(e.target.value)}
                          className="bg-page text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location & Mapping */}
          <Card>
            <CardHeader className="pb-3 border-b border-edge mb-4">
              <CardTitle className="text-base text-primary">العنوان والموقع الجغرافي</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">المدينة</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="المدينة" className="bg-page" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">الحي</Label>
                  <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="الحي" className="bg-page" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">الاتجاه / المنطقة الجغرافية</Label>
                  <select
                    value={directionalArea}
                    onChange={(e) => setDirectionalArea(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-edge bg-page px-3 py-2 text-sm text-heading focus-visible:outline-none"
                  >
                    <option value="">غير محدد</option>
                    <option value="شمال">شمال المدينة</option>
                    <option value="جنوب">جنوب المدينة</option>
                    <option value="شرق">شرق المدينة</option>
                    <option value="غرب">غرب المدينة</option>
                    <option value="وسط">وسط المدينة</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">اسم الشارع</Label>
                <Input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="الشارع" className="bg-page" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>تحديد موقع العقار على الخريطة التفاعلية</span>
                </Label>
                <MockMapPicker
                  lat={lat}
                  lng={lng}
                  onChange={(newLat, newLng) => {
                    setLat(newLat)
                    setLng(newLng)
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Property Specifications */}
          <Card>
            <CardHeader className="pb-3 border-b border-edge mb-4">
              <CardTitle className="text-base text-primary">المواصفات الفنية للعقار</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">المساحة الإجمالية (م²)</Label>
                  <Input
                    type="number"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="المساحة"
                    className="bg-page"
                  />
                </div>

                {!isLand && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">مسطح البناء (م² - اختياري)</Label>
                      <Input
                        type="number"
                        value={builtArea}
                        onChange={(e) => setBuiltArea(e.target.value)}
                        placeholder="مسطح البناء"
                        className="bg-page"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">غرف النوم</Label>
                      <Input
                        type="number"
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        placeholder="الغرف"
                        className="bg-page"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">دورات المياه</Label>
                      <Input
                        type="number"
                        value={bathrooms}
                        onChange={(e) => setBathrooms(e.target.value)}
                        placeholder="دورات المياه"
                        className="bg-page"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">الواجهة / اتجاه العقار</Label>
                  <select
                    value={facing}
                    onChange={(e) => setFacing(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-edge bg-page px-3 py-2 text-sm text-heading focus-visible:outline-none"
                  >
                    <option value="">اختر الاتجاه</option>
                    <option value="شمالية">شمالية</option>
                    <option value="جنوبية">جنوبية</option>
                    <option value="شرقية">شرقية</option>
                    <option value="غربية">غربية</option>
                    <option value="شمالية شرقية">شمالية شرقية</option>
                    <option value="شمالية غربية">شمالية غربية</option>
                    <option value="جنوبية شرقية">جنوبية شرقية</option>
                    <option value="جنوبية غربية">جنوبية غربية</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">عرض الشارع (متر)</Label>
                  <Input
                    type="text"
                    value={streetWidth}
                    onChange={(e) => setStreetWidth(e.target.value)}
                    placeholder="مثال: 15م"
                    className="bg-page"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">عمر العقار (بالسنوات)</Label>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="العمر"
                    className="bg-page"
                  />
                </div>

                {!isLand && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">رقم الطابق (اختياري)</Label>
                    <Input
                      type="number"
                      value={floorNumber}
                      onChange={(e) => setFloorNumber(e.target.value)}
                      placeholder="الطابق"
                      className="bg-page"
                    />
                  </div>
                )}
              </div>

              {/* Borders Dimensions */}
              <div className="rounded-xl border border-edge bg-alt/5 p-4 space-y-3">
                <Label className="text-xs font-bold text-primary block">أطوال حدود العقار (متر)</Label>
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-dim">الحد الشمالي</span>
                    <Input type="number" value={borderNorth} onChange={(e) => setBorderNorth(e.target.value)} placeholder="الحد الشمالي" className="bg-page text-xs font-semibold" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-dim">الحد الجنوبي</span>
                    <Input type="number" value={borderSouth} onChange={(e) => setBorderSouth(e.target.value)} placeholder="الحد الجنوبي" className="bg-page text-xs font-semibold" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-dim">الحد الشرقي</span>
                    <Input type="number" value={borderEast} onChange={(e) => setBorderEast(e.target.value)} placeholder="الحد الشرقي" className="bg-page text-xs font-semibold" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-dim">الحد الغربي</span>
                    <Input type="number" value={borderWest} onChange={(e) => setBorderWest(e.target.value)} placeholder="الحد الغربي" className="bg-page text-xs font-semibold" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Documents and attachments */}
          <Card>
            <CardHeader className="pb-3 border-b border-edge mb-4">
              <CardTitle className="text-base text-primary">المستندات والوسائط</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Legal fields */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold flex items-center gap-1">
                    <span>رقم صك الملكية</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={deedNumber}
                    onChange={(e) => setDeedNumber(e.target.value)}
                    placeholder="رقم الصك"
                    className="bg-page"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">رقم عقد التسويق</Label>
                  <Input
                    value={marketingContractNumber}
                    onChange={(e) => setMarketingContractNumber(e.target.value)}
                    placeholder="رقم عقد التسويق"
                    className="bg-page"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">تاريخ انتهاء عقد التسويق</Label>
                  <Input
                    type="date"
                    value={contractExpiryDate}
                    onChange={(e) => setContractExpiryDate(e.target.value)}
                    className="bg-page"
                  />
                </div>
              </div>

              {/* Deed File upload */}
              <div className="rounded-xl border border-edge p-4 bg-alt/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <Label className="text-xs font-bold block">تحميل صورة/ملف الصك</Label>
                  <p className="text-[10px] text-dim mt-0.5">ملف إثبات صك ملكية العقار (PDF أو صور)</p>
                </div>
                <div className="flex items-center gap-2">
                  {deedFile ? (
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs px-3 py-1.5 rounded-lg border border-emerald-200">
                      <FileText className="h-4 w-4" />
                      <span className="truncate max-w-[150px]">{deedFile}</span>
                      <button type="button" onClick={() => setDeedFile('')} className="hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => deedFileInputRef.current?.click()}
                      className="flex items-center gap-1 text-xs"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      اختر الملف
                    </Button>
                  )}
                  <input
                    ref={deedFileInputRef}
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={handleDeedFileUpload}
                  />
                </div>
              </div>

              {/* Drag and Drop Media */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">صور العقار (اسحب وأسقط)</Label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    handleFileSelect(e.dataTransfer.files)
                  }}
                  className="cursor-pointer rounded-xl border-2 border-dashed border-edge bg-alt/5 p-6 text-center transition-all hover:border-dim/40"
                >
                  <Upload className="mx-auto h-8 w-8 text-dim" />
                  <p className="mt-2 text-sm font-medium text-heading">اسحب الصور هنا أو اضغط للرفع</p>
                  <p className="mt-1 text-[10px] text-dim">JPG, PNG, WebP</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />
                </div>

                {mediaFiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 mt-3">
                    {mediaFiles.map((media, idx) => (
                      <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg border border-edge bg-page">
                        <Image src={media.preview} alt={`صورة ${idx + 1}`} fill className="object-cover" />
                        <button
                          onClick={() => removeMedia(idx)}
                          className="absolute end-1 top-1 rounded-full bg-red-600 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                        {idx === 0 && (
                          <div className="absolute bottom-0 start-0 end-0 bg-primary py-0.5 text-center text-[9px] font-medium text-white">
                            صورة الغلاف
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video links */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">رابط فيديو YouTube</Label>
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="bg-page"
                  dir="ltr"
                />
              </div>
            </CardContent>
          </Card>

          {/* Internal notes */}
          <Card>
            <CardHeader className="pb-3 border-b border-edge mb-4">
              <CardTitle className="text-base text-primary flex items-center gap-1.5">
                <span>ملاحظات الموظفين (خاصة بالمكتب فقط)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="أدخل الملاحظات الداخلية الخاصة بالمكتب فقط..."
                rows={3}
                className="flex w-full rounded-md border border-edge bg-page px-3 py-2 text-sm text-heading focus-visible:outline-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">حالة النشر والتوفر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">حالة العقار</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                  className="flex h-10 w-full rounded-md border border-edge bg-page px-3 py-2 text-sm text-heading focus-visible:outline-none"
                >
                  <option value="DRAFT">مسودة</option>
                  <option value="PUBLISHED">منشور</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">حالة التوفر</Label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as Availability)}
                  className="flex h-10 w-full rounded-md border border-edge bg-page px-3 py-2 text-sm text-heading focus-visible:outline-none"
                >
                  <option value="AVAILABLE">متوفر</option>
                  <option value="SOLD">مباع</option>
                  <option value="RENTED">مؤجر</option>
                </select>
              </div>

              <div className="flex items-center justify-between border-t border-edge pt-3">
                <Label className="text-xs">تمييز العقار</Label>
                <button
                  type="button"
                  onClick={() => setIsFeatured(!isFeatured)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    isFeatured ? 'bg-primary' : 'bg-alt'
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
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">تعيين الوكيل المسؤول</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-edge bg-page px-3 py-2 text-sm text-heading focus-visible:outline-none"
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
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">الوسوم والكلمات الدلالية</CardTitle>
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
                  className="bg-page text-xs"
                />
                <Button variant="outline" size="icon" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
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

      {/* Owner Addition CRM Modal */}
      {isOwnerModalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setIsOwnerModalOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-edge bg-elevated p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-right" dir="rtl">
            <div className="flex items-center justify-between border-b border-edge pb-4 mb-4">
              <h3 className="text-lg font-bold text-primary flex items-center gap-1.5">
                <User className="h-5 w-5 text-primary" />
                <span>إضافة مالك جديد وعضو CRM</span>
              </h3>
              <button
                onClick={() => setIsOwnerModalOpen(false)}
                className="rounded-lg p-1.5 text-dim hover:bg-page transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {ownerModalError && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 mb-4">
                {ownerModalError}
              </div>
            )}

            <form onSubmit={handleCreateOwner} className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">اسم المالك</Label>
                <Input
                  required
                  placeholder="الاسم الكامل"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  className="bg-page"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">رقم الجوال</Label>
                  <Input
                    required
                    type="tel"
                    placeholder="05xxxxxxxx"
                    value={newOwnerPhone}
                    onChange={(e) => setNewOwnerPhone(e.target.value)}
                    className="bg-page"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">رقم الهوية الوطنية (إلزامي للهيئة العامة للعقار)</Label>
                  <Input
                    required
                    placeholder="1xxxxxxxx"
                    value={newOwnerNationalId}
                    onChange={(e) => setNewOwnerNationalId(e.target.value)}
                    className="bg-page"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">تاريخ الميلاد</Label>
                <Input
                  type="date"
                  value={newOwnerDob}
                  onChange={(e) => setNewOwnerDob(e.target.value)}
                  className="bg-page"
                />
              </div>

              <div className="border-t border-edge pt-4 mt-6 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOwnerModalOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" isLoading={ownerModalLoading}>
                  إضافة وحفظ
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
