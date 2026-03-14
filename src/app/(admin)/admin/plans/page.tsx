'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  CreditCard,
  Edit2,
  Save,
  X,
  Loader2,
  Check,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

// ─── Types ────────────────────────────────────────────────────

interface PlanFeatures {
  customDomain: boolean
  advancedAnalytics: boolean
  basicAnalytics: boolean
  pdfReports: boolean
  csvExport: boolean
  blogEnabled: boolean
  prioritySupport: boolean
  apiAccess: boolean
}

interface PlanItem {
  id: string
  name: string
  slug: string
  priceMonthly: number
  priceYearly: number
  currency: string
  maxListings: number
  maxAgents: number
  maxMediaPerListing: number
  features: PlanFeatures
  isActive: boolean
  sortOrder: number
  _count?: {
    subscriptions: number
  }
}

const planNameMap: Record<string, string> = {
  Basic: 'أساسي',
  Pro: 'احترافي',
  Enterprise: 'مؤسسي',
}

const featureLabels: Record<keyof PlanFeatures, string> = {
  customDomain: 'نطاق مخصص',
  advancedAnalytics: 'تحليلات متقدمة',
  basicAnalytics: 'تحليلات أساسية',
  pdfReports: 'تقارير PDF',
  csvExport: 'تصدير CSV',
  blogEnabled: 'نظام المدونة',
  prioritySupport: 'دعم أولوية',
  apiAccess: 'وصول API',
}

// ─── Component ────────────────────────────────────────────────

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<PlanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPlan, setEditingPlan] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<PlanItem>>({})
  const [saveLoading, setSaveLoading] = useState(false)

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/plans')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setPlans(data.data)
        }
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const handleEdit = (plan: PlanItem) => {
    setEditingPlan(plan.id)
    setEditData({
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      maxListings: plan.maxListings,
      maxAgents: plan.maxAgents,
      maxMediaPerListing: plan.maxMediaPerListing,
      features: { ...plan.features },
      isActive: plan.isActive,
    })
  }

  const handleSave = async (planId: string) => {
    setSaveLoading(true)
    try {
      const res = await fetch(`/api/admin/plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setPlans((prev) =>
            prev.map((p) => (p.id === planId ? { ...p, ...editData } as PlanItem : p))
          )
          setEditingPlan(null)
          setEditData({})
        }
      }
    } catch {
      // Handle error
    } finally {
      setSaveLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingPlan(null)
    setEditData({})
  }

  const toggleFeature = (feature: keyof PlanFeatures) => {
    setEditData((prev) => ({
      ...prev,
      features: {
        ...(prev.features as PlanFeatures),
        [feature]: !(prev.features as PlanFeatures)?.[feature],
      },
    }))
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C8A96E]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#2D3748]">إدارة الخطط</h1>
        <p className="mt-1 text-sm text-[#718096]">
          إعداد الأسعار والحدود والمميزات لكل خطة.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const isEditing = editingPlan === plan.id
          const data = isEditing ? editData : plan

          return (
            <Card
              key={plan.id}
              className={
                isEditing ? 'ring-2 ring-[#C8A96E]' : ''
              }
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-[#C8A96E]" />
                      {planNameMap[plan.name] || plan.name}
                    </CardTitle>
                    <CardDescription>{plan.slug}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={plan.isActive ? 'success' : 'destructive'}>
                      {plan.isActive ? 'مفعل' : 'غير مفعل'}
                    </Badge>
                    {plan._count && (
                      <Badge variant="secondary">
                        {plan._count.subscriptions} مشترك
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pricing */}
                <div className="space-y-3">
                  <h4 className="text-xs font-medium uppercase text-[#718096]">
                    الأسعار (بالهللات)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[#718096]">شهري</label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={data.priceMonthly || 0}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              priceMonthly: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-sm font-medium text-[#2D3748]">
                          {(plan.priceMonthly / 100).toFixed(2)} ر.س
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-[#718096]">سنوي</label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={data.priceYearly || 0}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              priceYearly: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-sm font-medium text-[#2D3748]">
                          {(plan.priceYearly / 100).toFixed(2)} ر.س
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Limits */}
                <div className="space-y-3">
                  <h4 className="text-xs font-medium uppercase text-[#718096]">
                    الحدود
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-[#718096]">العقارات</label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={data.maxListings ?? 0}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              maxListings: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-sm font-medium text-[#2D3748]">
                          {plan.maxListings === -1 ? 'غير محدود' : plan.maxListings}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-[#718096]">الوكلاء</label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={data.maxAgents ?? 0}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              maxAgents: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-sm font-medium text-[#2D3748]">
                          {plan.maxAgents === -1 ? 'غير محدود' : plan.maxAgents}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-[#718096]">وسائط/عقار</label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={data.maxMediaPerListing ?? 0}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              maxMediaPerListing: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-sm font-medium text-[#2D3748]">
                          {plan.maxMediaPerListing}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <h4 className="text-xs font-medium uppercase text-[#718096]">
                    المميزات
                  </h4>
                  <div className="space-y-2">
                    {(Object.keys(featureLabels) as Array<keyof PlanFeatures>).map(
                      (feature) => {
                        const enabled = isEditing
                          ? (data.features as PlanFeatures)?.[feature]
                          : plan.features[feature]

                        return (
                          <div
                            key={feature}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm text-[#2D3748]">
                              {featureLabels[feature]}
                            </span>
                            {isEditing ? (
                              <button
                                onClick={() => toggleFeature(feature)}
                                className={`relative h-5 w-9 rounded-full transition-colors ${
                                  enabled
                                    ? 'bg-[#C8A96E]'
                                    : 'bg-[#EBF0F7]'
                                }`}
                              >
                                <span
                                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                                    enabled
                                      ? 'translate-x-4'
                                      : 'translate-x-0.5'
                                  }`}
                                />
                              </button>
                            ) : (
                              <span>
                                {enabled ? (
                                  <Check className="h-4 w-4 text-emerald-400" />
                                ) : (
                                  <X className="h-4 w-4 text-[#A0AEC0]" />
                                )}
                              </span>
                            )}
                          </div>
                        )
                      }
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-[#E2E8F0] pt-4">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleSave(plan.id)}
                        isLoading={saveLoading}
                      >
                        <Save className="h-4 w-4" />
                        حفظ
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleCancel}
                      >
                        إلغاء
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleEdit(plan)}
                    >
                      <Edit2 className="h-4 w-4" />
                      تعديل الخطة
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
