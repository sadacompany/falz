'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  CreditCard,
  Crown,
  Building2,
  Users,
  Image as ImageIcon,
  Check,
  X,
  Download,
  AlertTriangle,
  Loader2,
  Zap,
  Shield,
  BarChart3,
  FileText,
  Globe,
  Headphones,
  Code2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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

interface ActivePlan {
  planId: string
  planSlug: string
  planName: string
  subscriptionId: string
  subscriptionStatus: string
  maxListings: number
  maxAgents: number
  maxMediaPerListing: number
  features: PlanFeatures
  currentPeriodEnd: string
}

interface UsageLimits {
  allowed: boolean
  current: number
  max: number
  isUnlimited: boolean
}

interface InvoiceItem {
  id: string
  amount: number
  currency: string
  status: string
  paidAt: string | null
  createdAt: string
  planName: string
  planSlug: string
  invoiceUrl: string | null
}

interface BillingData {
  plan: ActivePlan
  listings: UsageLimits
  agents: UsageLimits
  invoices: InvoiceItem[]
}

// ─── Plan Definitions (for comparison table) ──────────────────

const planDefinitions = [
  {
    slug: 'basic',
    name: 'أساسي',
    priceMonthly: 0,
    priceYearly: 0,
    maxListings: 10,
    maxAgents: 2,
    maxMediaPerListing: 5,
    features: {
      customDomain: false,
      advancedAnalytics: false,
      basicAnalytics: true,
      pdfReports: false,
      csvExport: false,
      blogEnabled: true,
      prioritySupport: false,
      apiAccess: false,
    },
  },
  {
    slug: 'pro',
    name: 'احترافي',
    priceMonthly: 299,
    priceYearly: 2999,
    maxListings: 50,
    maxAgents: 10,
    maxMediaPerListing: 20,
    features: {
      customDomain: true,
      advancedAnalytics: true,
      basicAnalytics: true,
      pdfReports: true,
      csvExport: true,
      blogEnabled: true,
      prioritySupport: false,
      apiAccess: false,
    },
  },
  {
    slug: 'enterprise',
    name: 'مؤسسي',
    priceMonthly: 799,
    priceYearly: 7999,
    maxListings: -1,
    maxAgents: -1,
    maxMediaPerListing: 50,
    features: {
      customDomain: true,
      advancedAnalytics: true,
      basicAnalytics: true,
      pdfReports: true,
      csvExport: true,
      blogEnabled: true,
      prioritySupport: true,
      apiAccess: true,
    },
  },
]

const featureLabels: { key: keyof PlanFeatures; label: string; icon: React.ElementType }[] = [
  { key: 'blogEnabled', label: 'نظام المدونة', icon: FileText },
  { key: 'basicAnalytics', label: 'تحليلات أساسية', icon: BarChart3 },
  { key: 'advancedAnalytics', label: 'تحليلات متقدمة', icon: BarChart3 },
  { key: 'customDomain', label: 'نطاق مخصص', icon: Globe },
  { key: 'pdfReports', label: 'تقارير PDF', icon: FileText },
  { key: 'csvExport', label: 'تصدير CSV', icon: Download },
  { key: 'prioritySupport', label: 'دعم فني أولوية', icon: Headphones },
  { key: 'apiAccess', label: 'وصول API', icon: Code2 },
]

const statusLabels: Record<string, string> = {
  ACTIVE: 'نشط',
  GRACE_PERIOD: 'فترة سماح',
  PAST_DUE: 'متأخر الدفع',
  CANCELLED: 'ملغي',
  PAID: 'مدفوع',
  PENDING: 'قيد الانتظار',
  FAILED: 'فشل',
  REFUNDED: 'مسترد',
}

// ─── Component ───────────────────────────────────────────────

export default function BillingPage() {
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBillingData = useCallback(async () => {
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_billing_data' }),
      })

      if (!res.ok) {
        setBillingData(null)
      } else {
        const data = await res.json()
        if (data.success) {
          setBillingData(data.data)
        }
      }
    } catch {
      // Silently fail - the page will render with defaults
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBillingData()
  }, [fetchBillingData])

  const handleUpgrade = async (planSlug: string) => {
    setActionLoading(planSlug)
    setError(null)

    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planSlug,
          billingCycle,
          officeId: billingData?.plan?.planId ? undefined : undefined,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'فشل في معالجة الترقية')
        return
      }

      if (data.data.paymentUrl) {
        window.location.href = data.data.paymentUrl
      } else {
        await fetchBillingData()
      }
    } catch {
      setError('حدث خطأ غير متوقع')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async () => {
    if (!billingData?.plan?.subscriptionId) return

    setActionLoading('cancel')
    setError(null)

    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          subscriptionId: billingData.plan.subscriptionId,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'فشل في إلغاء الاشتراك')
        return
      }

      setShowCancelModal(false)
      await fetchBillingData()
    } catch {
      setError('حدث خطأ غير متوقع')
    } finally {
      setActionLoading(null)
    }
  }

  // ─── Loading State ────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#C8A96E]" />
          <p className="text-sm text-[#718096]">جاري تحميل معلومات الفوترة...</p>
        </div>
      </div>
    )
  }

  const currentPlan = billingData?.plan
  const currentPlanSlug = currentPlan?.planSlug || 'basic'
  const listings = billingData?.listings || { current: 0, max: 10, isUnlimited: false, allowed: true }
  const agents = billingData?.agents || { current: 0, max: 2, isUnlimited: false, allowed: true }
  const invoices = billingData?.invoices || []

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#2D3748]">الفوترة والاشتراك</h1>
        <p className="mt-1 text-sm text-[#718096]">
          إدارة اشتراكك، عرض الاستخدام، وتحميل الفواتير.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-600/50 bg-red-600/10 px-4 py-3 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C8A96E]/10">
                <Crown className="h-5 w-5 text-[#C8A96E]" />
              </div>
              <div>
                <CardTitle>الخطة الحالية</CardTitle>
                <CardDescription>
                  {currentPlan?.subscriptionStatus === 'GRACE_PERIOD'
                    ? 'اشتراكك في فترة سماح'
                    : currentPlan?.subscriptionStatus === 'PAST_DUE'
                      ? 'الدفع متأخر'
                      : 'اشتراكك النشط'}
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={
                currentPlan?.subscriptionStatus === 'ACTIVE' || !currentPlan?.subscriptionStatus
                  ? 'success'
                  : currentPlan?.subscriptionStatus === 'GRACE_PERIOD'
                    ? 'warning'
                    : currentPlan?.subscriptionStatus === 'PAST_DUE'
                      ? 'destructive'
                      : 'secondary'
              }
            >
              {statusLabels[currentPlan?.subscriptionStatus || 'ACTIVE'] || currentPlan?.subscriptionStatus || 'نشط'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-3xl font-bold text-[#C8A96E]">
                {currentPlanSlug === 'basic'
                  ? 'أساسي'
                  : currentPlanSlug === 'pro'
                    ? 'احترافي'
                    : currentPlanSlug === 'enterprise'
                      ? 'مؤسسي'
                      : (currentPlan?.planName || 'أساسي')}
              </p>
              <p className="mt-1 text-sm text-[#718096]">
                {currentPlanSlug === 'basic'
                  ? 'مجاني للأبد'
                  : `يتجدد ${currentPlan?.currentPeriodEnd
                      ? new Date(currentPlan.currentPeriodEnd).toLocaleDateString('ar-SA-u-nu-latn', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'غير محدد'
                    }`}
              </p>
            </div>

            {/* Quick Feature Tags */}
            <div className="flex flex-wrap gap-2">
              {currentPlan?.features &&
                Object.entries(currentPlan.features)
                  .filter(([, v]) => v === true)
                  .slice(0, 4)
                  .map(([key]) => {
                    const feat = featureLabels.find((f) => f.key === key)
                    return feat ? (
                      <Badge key={key} variant="outline" className="gap-1">
                        <Check className="h-3 w-3" />
                        {feat.label}
                      </Badge>
                    ) : null
                  })}
            </div>
          </div>
        </CardContent>
        {currentPlanSlug !== 'basic' && currentPlan?.subscriptionId && (
          <CardFooter className="border-t border-[#E2E8F0] pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:bg-red-600/10 hover:text-red-300"
              onClick={() => setShowCancelModal(true)}
            >
              إلغاء الاشتراك
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Usage Meters */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Listings Usage */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                <Building2 className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#718096]">العقارات</p>
                <p className="text-lg font-semibold text-[#2D3748]">
                  {listings.current}{' '}
                  <span className="text-sm font-normal text-[#718096]">
                    / {listings.isUnlimited ? 'غير محدود' : listings.max}
                  </span>
                </p>
              </div>
            </div>
            {!listings.isUnlimited && (
              <div className="mt-3">
                <div className="h-2 overflow-hidden rounded-full bg-[#EBF0F7]">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{
                      width: `${Math.min((listings.current / listings.max) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-[#718096]">
                  {listings.max - listings.current} متبقي
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Agents Usage */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10">
                <Users className="h-4 w-4 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#718096]">أعضاء الفريق</p>
                <p className="text-lg font-semibold text-[#2D3748]">
                  {agents.current}{' '}
                  <span className="text-sm font-normal text-[#718096]">
                    / {agents.isUnlimited ? 'غير محدود' : agents.max}
                  </span>
                </p>
              </div>
            </div>
            {!agents.isUnlimited && (
              <div className="mt-3">
                <div className="h-2 overflow-hidden rounded-full bg-[#EBF0F7]">
                  <div
                    className="h-full rounded-full bg-purple-500 transition-all"
                    style={{
                      width: `${Math.min((agents.current / agents.max) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-[#718096]">
                  {agents.max - agents.current} متبقي
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Media Per Listing */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                <ImageIcon className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#718096]">الوسائط لكل عقار</p>
                <p className="text-lg font-semibold text-[#2D3748]">
                  {currentPlan?.maxMediaPerListing || 5}{' '}
                  <span className="text-sm font-normal text-[#718096]">كحد أقصى</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Comparison Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#C8A96E]" />
                مقارنة الخطط
              </CardTitle>
              <CardDescription>اختر الخطة المناسبة لاحتياجات مكتبك</CardDescription>
            </div>
            {/* Billing Cycle Toggle */}
            <div className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#FAFAF7] p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-[#C8A96E] text-[#1E3A5F]'
                    : 'text-[#718096] hover:text-[#1E3A5F]'
                }`}
              >
                شهري
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-[#C8A96E] text-[#1E3A5F]'
                    : 'text-[#718096] hover:text-[#1E3A5F]'
                }`}
              >
                سنوي
                <span className="mr-1.5 text-xs opacity-75">وفر 17%</span>
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {planDefinitions.map((plan) => {
              const isCurrent = plan.slug === currentPlanSlug
              const isUpgrade =
                planDefinitions.findIndex((p) => p.slug === plan.slug) >
                planDefinitions.findIndex((p) => p.slug === currentPlanSlug)
              const isDowngrade =
                planDefinitions.findIndex((p) => p.slug === plan.slug) <
                planDefinitions.findIndex((p) => p.slug === currentPlanSlug)
              const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly

              return (
                <div
                  key={plan.slug}
                  className={`relative flex flex-col rounded-xl border p-6 transition-all ${
                    isCurrent
                      ? 'border-[#C8A96E] bg-[#C8A96E]/5'
                      : plan.slug === 'pro'
                        ? 'border-[#C8A96E]/30 bg-[#FAFAF7]'
                        : 'border-[#E2E8F0] bg-[#FAFAF7]'
                  }`}
                >
                  {plan.slug === 'pro' && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-[#C8A96E] text-[#1E3A5F]">الأكثر شعبية</Badge>
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="success">الخطة الحالية</Badge>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-[#2D3748]">{plan.name}</h3>
                    <div className="mt-3">
                      <span className="text-3xl font-bold text-[#2D3748]">
                        {price === 0 ? 'مجاني' : `${price} ر.س`}
                      </span>
                      {price > 0 && (
                        <span className="text-sm text-[#718096]">
                          /{billingCycle === 'yearly' ? 'سنة' : 'شهر'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Limits */}
                  <div className="mb-4 space-y-2 border-b border-[#E2E8F0] pb-4">
                    <div className="flex items-center gap-2 text-sm text-[#2D3748]">
                      <Building2 className="h-4 w-4 text-[#718096]" />
                      {plan.maxListings === -1 ? 'غير محدود' : plan.maxListings} عقار
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#2D3748]">
                      <Users className="h-4 w-4 text-[#718096]" />
                      {plan.maxAgents === -1 ? 'غير محدود' : plan.maxAgents} عضو فريق
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#2D3748]">
                      <ImageIcon className="h-4 w-4 text-[#718096]" />
                      {plan.maxMediaPerListing} وسائط/عقار
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-6 flex-1 space-y-2">
                    {featureLabels.map(({ key, label }) => {
                      const enabled = plan.features[key]
                      return (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          {enabled ? (
                            <Check className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                          ) : (
                            <X className="h-4 w-4 flex-shrink-0 text-[#A0AEC0]" />
                          )}
                          <span className={enabled ? 'text-[#2D3748]' : 'text-[#A0AEC0]'}>
                            {label}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Action Button */}
                  {isCurrent ? (
                    <Button variant="outline" disabled className="w-full">
                      <Shield className="h-4 w-4" />
                      الخطة الحالية
                    </Button>
                  ) : isUpgrade ? (
                    <Button
                      className="w-full"
                      onClick={() => handleUpgrade(plan.slug)}
                      isLoading={actionLoading === plan.slug}
                    >
                      <Zap className="h-4 w-4" />
                      ترقية إلى {plan.name}
                    </Button>
                  ) : isDowngrade ? (
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => handleUpgrade(plan.slug)}
                      isLoading={actionLoading === plan.slug}
                    >
                      تخفيض إلى {plan.name}
                    </Button>
                  ) : null}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#C8A96E]" />
            سجل الفواتير
          </CardTitle>
          <CardDescription>عرض وتحميل الفواتير السابقة</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="py-12 text-center">
              <CreditCard className="mx-auto h-10 w-10 text-[#A0AEC0]" />
              <p className="mt-3 text-sm text-[#718096]">لا توجد فواتير بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#718096]">
                      التاريخ
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#718096]">
                      الخطة
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#718096]">
                      المبلغ
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[#718096]">
                      الحالة
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#718096]">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="transition-colors hover:bg-[#F7F7F2]/30">
                      <td className="px-4 py-3 text-sm text-[#2D3748]">
                        {new Date(invoice.createdAt).toLocaleDateString('ar-SA-u-nu-latn', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#2D3748]">
                        {invoice.planSlug === 'basic'
                          ? 'أساسي'
                          : invoice.planSlug === 'pro'
                            ? 'احترافي'
                            : invoice.planSlug === 'enterprise'
                              ? 'مؤسسي'
                              : invoice.planName}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#2D3748]">
                        {(invoice.amount / 100).toFixed(2)} ر.س
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            invoice.status === 'PAID'
                              ? 'success'
                              : invoice.status === 'PENDING'
                                ? 'warning'
                                : invoice.status === 'FAILED'
                                  ? 'destructive'
                                  : 'secondary'
                          }
                        >
                          {statusLabels[invoice.status] || invoice.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-left">
                        {invoice.invoiceUrl && (
                          <a
                            href={invoice.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-[#C8A96E] hover:underline"
                          >
                            <Download className="h-3.5 w-3.5" />
                            تحميل
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600/10">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#2D3748]">إلغاء الاشتراك</h3>
                <p className="text-sm text-[#718096]">لا يمكن التراجع عن هذا الإجراء بسهولة</p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-[#E2E8F0] bg-[#FAFAF7] p-4">
              <p className="text-sm text-[#2D3748]">
                عند إلغاء اشتراكك:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-[#718096]">
                <li>- ستحصل على فترة سماح 7 أيام</li>
                <li>- بعد ذلك، ستعود خطتك إلى الأساسية</li>
                <li>- قد تفقد الوصول إلى ميزات الاحترافي/المؤسسي</li>
                <li>- لن يتم حذف بياناتك الحالية</li>
              </ul>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCancelModal(false)}
              >
                الإبقاء على الاشتراك
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleCancel}
                isLoading={actionLoading === 'cancel'}
              >
                تأكيد الإلغاء
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
