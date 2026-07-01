'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  UserCheck,
  Building,
  Calendar,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  HelpCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getLeads, claimLead } from '@/lib/actions/leads'
import { LeadsHeader } from '@/components/leads/LeadsHeader'

// ─── Types ──────────────────────────────────────────────────

interface QueueLead {
  id: string
  name: string
  phone: string | null
  email: string | null
  message: string | null
  createdAt: Date
  source: string
  property?: {
    id: string
    title: string
    titleAr: string | null
    slug: string
    dealType: 'SALE' | 'RENT'
    propertyType: string
  } | null
}

const QUEUE_TABS = [
  { key: 'sales', label: 'قسم المبيعات', desc: 'طلبات الشراء والتعاقدات الجديدة' },
  { key: 'rentals', label: 'قسم الإيجارات', desc: 'طلبات التأجير والاستئجار السكني والتجاري' },
]

export default function QueuePage() {
  const [activeTab, setActiveTab] = useState('sales')
  const [dbLeads, setDbLeads] = useState<QueueLead[]>([])
  const [loading, setLoading] = useState(true)
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchQueueData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch NEW leads. We will filter those without an agent in frontend.
      const data = await getLeads({ status: 'NEW', pageSize: 100 })
      const unassigned = data.leads.filter((l) => !l.agentId) as unknown as QueueLead[]
      setDbLeads(unassigned)
    } catch (err) {
      console.error('Failed to load queue data:', err)
      setError('فشل تحميل قائمة طابور العملاء. يرجى محاولة التحديث.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQueueData()
  }, [fetchQueueData])

  // Split DB leads into sales and rentals
  const salesQueue = dbLeads.filter(
    (l) => !l.property || l.property.dealType === 'SALE'
  )
  const rentalsQueue = dbLeads.filter(
    (l) => l.property?.dealType === 'RENT'
  )

  // Handle claiming a lead
  const handleAcceptLead = async (leadId: string) => {
    setClaimingId(leadId)
    setError(null)
    try {
      // Run database server action
      await claimLead(leadId)
      // Refresh queue
      await fetchQueueData()
    } catch (err) {
      console.error('Failed to claim lead:', err)
      setError('فشل استلام العميل، ربما تم استلامه من قبل وكيل آخر.')
    } finally {
      setClaimingId(null)
    }
  }

  // Get active queue leads list
  const getActiveQueue = () => {
    if (activeTab === 'sales') return salesQueue
    if (activeTab === 'rentals') return rentalsQueue
    return []
  }

  const activeLeads = getActiveQueue()

  // Format waiting time relative
  const getWaitingTime = (date: Date) => {
    const diffMs = Date.now() - new Date(date).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 60) return `${diffMins} دقيقة`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} ساعة`
    return `${Math.floor(diffHours / 24)} يوم`
  }

  return (
    <div className="space-y-6">
      {/* Shared Header */}
      <LeadsHeader
        title="طابور توزيع العملاء"
        description="استعرض العملاء بانتظار الرد، واستلم طلبات العملاء الخاصة بقسمك مباشرة لتظهر في ملفك."
      />

      {/* Error state banner */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 p-4 text-red-700 dark:text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Queue Info Alert */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
        <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-primary">نظام الاستلام الذاتي (Self-Assignment)</h4>
          <p className="text-xs text-dim mt-1 leading-relaxed">
            العملاء المدرجون في هذه القوائم هم عملاء مهتمون ويسعون للتواصل الفوري. بالضغط على زر "استلمت"، سيتم تعيين العميل إليك وسيتم إشعار العميل باسمك وبيانات الاتصال الخاصة بك للمتابعة.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="grid grid-cols-2 gap-2 max-w-md bg-elevated border border-edge p-2 rounded-xl">
        {QUEUE_TABS.map((tab) => {
          const isSelected = activeTab === tab.key
          let count = 0
          if (tab.key === 'sales') count = salesQueue.length
          else if (tab.key === 'rentals') count = rentalsQueue.length

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all duration-200",
                isSelected
                  ? "bg-primary/5 border-primary text-primary"
                  : "bg-page border-edge hover:bg-card-hover text-body hover:text-heading"
              )}
            >
              <span className="text-xs font-bold whitespace-nowrap">{tab.label}</span>
              <div className="mt-2 flex items-center gap-1.5">
                <Badge variant={count > 0 ? (isSelected ? 'default' : 'warning') : 'secondary'} className="text-[10px] px-1.5 py-0">
                  {count} عملاء
                </Badge>
              </div>
            </button>
          )
        })}
      </div>

      {/* Queue Description */}
      <div className="text-xs text-dim px-2">
        ℹ️ {QUEUE_TABS.find((t) => t.key === activeTab)?.desc}
      </div>

      {/* Waiting Leads List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : activeLeads.length === 0 ? (
        <Card className="border-edge bg-elevated">
          <CardContent className="py-16 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
            <p className="mt-4 text-lg font-medium text-heading">القائمة فارغة حالياً</p>
            <p className="mt-1 text-sm text-dim">جميع العملاء في هذا القسم لديهم وكيل مسؤول ويتم متابعتهم.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {activeLeads.map((lead) => {
            const waitTime = getWaitingTime(lead.createdAt)
            
            return (
              <Card
                key={lead.id}
                className={cn(
                  "border-edge bg-elevated transition-all duration-200 hover:shadow-md hover:border-dim/30",
                  claimingId === lead.id && "opacity-60 pointer-events-none"
                )}
              >
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  {/* Header: Name and Wait Time */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-heading">{lead.name}</h4>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-500 font-semibold">
                        <Clock className="h-3.5 w-3.5" />
                        <span>بانتظار الرد منذ {waitTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body: Inquiry details */}
                  <div className="text-xs text-body leading-relaxed bg-page border border-edge/60 p-3 rounded-lg">
                    {lead.message ? (
                      <p className="line-clamp-2">{lead.message}</p>
                    ) : (
                      <p className="italic text-dim">لا توجد رسالة مرفقة من العميل، استفسار مباشر.</p>
                    )}

                    {lead.property && (
                      <div className="mt-2.5 pt-2 border-t border-edge flex items-center gap-1.5 text-dim font-medium">
                        <Building className="h-3.5 w-3.5 text-dim" />
                        <span className="truncate max-w-[280px]">
                          العقار: {lead.property.titleAr || lead.property.title}
                        </span>
                        <Badge variant="outline" className="text-[9px] py-0 px-1 hover:bg-transparent">
                          {lead.property.dealType === 'SALE' ? 'شراء' : 'إيجار'}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Contact Info & Claim Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-edge/40">
                    <div className="flex items-center gap-2.5 text-xs text-dim">
                      {lead.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </span>
                      )}
                      {lead.email && (
                        <span className="flex items-center gap-1 hidden sm:inline-flex">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </span>
                      )}
                    </div>

                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 text-xs font-semibold px-4"
                      isLoading={claimingId === lead.id}
                      onClick={() => handleAcceptLead(lead.id)}
                    >
                      <UserCheck className="h-4 w-4" />
                      استلمت العميل
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
