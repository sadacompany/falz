'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Search,
  Building,
  User,
  Plus,
  ArrowLeftRight,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Phone,
  Mail,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getLeadsReportsData, updateLeadStatus } from '@/lib/actions/leads'
import { LeadsHeader } from '@/components/leads/LeadsHeader'

// ─── Types ──────────────────────────────────────────────────

interface LeadWithDetails {
  id: string
  name: string
  phone: string | null
  email: string | null
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CLOSED'
  createdAt: Date
  updatedAt: Date
  property?: {
    id: string
    title: string
    titleAr: string | null
    slug: string
    propertyType: string
  } | null
  agent?: {
    id: string
    name: string
    avatar: string | null
  } | null
}

const CATEGORY_TABS = [
  { key: 'ALL', label: 'الكل' },
  { key: 'RESIDENTIAL', label: 'سكني' },
  { key: 'COMMERCIAL', label: 'تجاري' },
  { key: 'AGRICULTURAL', label: 'زراعي' },
]

const OUTCOME_REASONS = [
  { value: 'تم الشراء بنجاح', label: '🎉 تم الشراء بنجاح' },
  { value: 'الميزانية غير مناسبة', label: '💰 الميزانية غير مناسبة' },
  { value: 'عدم جدية العميل', label: '⚠️ عدم جدية العميل' },
  { value: 'عدم توفر عقار مناسب', label: '🏠 عدم توفر عقار مناسب' },
  { value: 'تم الشراء من مكان آخر', label: '🏢 تم الشراء من مكان آخر' },
  { value: 'تعذر التواصل مع العميل', label: '📞 تعذر التواصل مع العميل' },
]

export default function KanbanBoardPage() {
  const [leads, setLeads] = useState<LeadWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [error, setError] = useState<string | null>(null)

  // Drag state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null)

  // Outcome modal state
  const [showOutcomeModal, setShowOutcomeModal] = useState(false)
  const [pendingLeadId, setPendingLeadId] = useState<string | null>(null)
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')

  const fetchBoardData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getLeadsReportsData()
      // Cast the prisma output to our required interface
      setLeads(data as unknown as LeadWithDetails[])
    } catch (err) {
      console.error('Failed to load board data:', err)
      setError('حدث خطأ أثناء تحميل بيانات العملاء. يرجى إعادة المحاولة.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBoardData()
  }, [fetchBoardData])

  // Helper to map propertyType to board categories
  const getCategoryKey = (propertyType: string | null | undefined): string => {
    if (!propertyType) return 'ALL'
    const type = propertyType.toUpperCase()
    if (['APARTMENT', 'VILLA', 'COMPOUND'].includes(type)) return 'RESIDENTIAL'
    if (['OFFICE', 'COMMERCIAL', 'BUILDING'].includes(type)) return 'COMMERCIAL'
    if (['LAND', 'FARM'].includes(type)) return 'AGRICULTURAL'
    return 'ALL'
  }

  const getCategoryBadgeLabel = (propertyType: string | null | undefined): { label: string; variant: 'default' | 'success' | 'warning' | 'outline' } => {
    if (!propertyType) return { label: 'عام', variant: 'outline' }
    const type = propertyType.toUpperCase()
    if (['APARTMENT', 'VILLA', 'COMPOUND'].includes(type)) return { label: 'سكني', variant: 'default' }
    if (['OFFICE', 'COMMERCIAL', 'BUILDING'].includes(type)) return { label: 'تجاري', variant: 'warning' }
    if (['LAND', 'FARM'].includes(type)) return { label: 'زراعي', variant: 'success' }
    return { label: 'عام', variant: 'outline' }
  }

  // Handle stage change
  const handleMoveLead = async (leadId: string, newStatus: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CLOSED', closingReason?: string) => {
    // Optimistic update in frontend
    setLeads((prevLeads) =>
      prevLeads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    )
    setError(null)

    try {
      await updateLeadStatus(leadId, newStatus, closingReason)
    } catch (err) {
      console.error('Failed to update stage:', err)
      setError('فشل نقل العميل وتحديث حالته. يرجى المحاولة مرة أخرى.')
      // Rollback on error
      fetchBoardData()
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id)
    setDraggedLeadId(id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetColumn: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CLOSED') => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain') || draggedLeadId
    if (!id) return

    setDraggedLeadId(null)
    const lead = leads.find((l) => l.id === id)
    if (!lead) return

    // Map board columns back to Prisma LeadStatus enum values
    if (targetColumn === 'NEW') {
      if (lead.status !== 'NEW') handleMoveLead(id, 'NEW')
    } else if (targetColumn === 'CONTACTED') {
      if (lead.status !== 'CONTACTED') handleMoveLead(id, 'CONTACTED')
    } else if (targetColumn === 'QUALIFIED') {
      if (lead.status !== 'QUALIFIED') handleMoveLead(id, 'QUALIFIED')
    } else if (targetColumn === 'CLOSED') {
      if (lead.status !== 'CLOSED') {
        setPendingLeadId(id)
        setShowOutcomeModal(true)
      }
    }
  }

  // Handle submission of closing reason
  const handleConfirmOutcome = () => {
    if (!pendingLeadId) return
    const reason = selectedReason === 'other' ? customReason : selectedReason
    handleMoveLead(pendingLeadId, 'CLOSED', reason || 'لا يوجد تفاصيل')
    setShowOutcomeModal(false)
    setPendingLeadId(null)
  }

  // Filter leads based on search and category
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.phone && lead.phone.includes(search)) ||
      (lead.email && lead.email.toLowerCase().includes(search.toLowerCase()))

    const matchesCategory =
      categoryFilter === 'ALL' ||
      getCategoryKey(lead.property?.propertyType) === categoryFilter

    return matchesSearch && matchesCategory
  })

  // Distribute leads into board columns
  const newColumn = filteredLeads.filter((l) => l.status === 'NEW')
  const contactedColumn = filteredLeads.filter((l) => l.status === 'CONTACTED')
  const qualifiedColumn = filteredLeads.filter((l) => l.status === 'QUALIFIED')
  const closedColumn = filteredLeads.filter((l) => l.status === 'CLOSED')

  // Render columns count labels
  const getColHeaderClass = (col: string) => {
    if (col === 'NEW') return 'border-t-4 border-t-primary'
    if (col === 'CONTACTED') return 'border-t-4 border-t-amber-500'
    if (col === 'QUALIFIED') return 'border-t-4 border-t-emerald-500'
    return 'border-t-4 border-t-dim'
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Shared Header */}
      <LeadsHeader
        title="لوحة تتبع العملاء"
        description="لوحة تفاعلية لمتابعة العملاء وتحديث مراحل التفاوض بالسحب والإفلات."
      />

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-elevated border border-edge p-4 rounded-xl">
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-page p-1 border border-edge max-w-max">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCategoryFilter(tab.key)}
              className={cn(
                'whitespace-nowrap rounded-md px-4 py-2 text-xs font-semibold transition-all duration-200',
                categoryFilter === tab.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-body hover:bg-card-hover hover:text-heading'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
          <Input
            placeholder="البحث بالاسم أو الهاتف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-10 h-10 bg-page border-edge text-heading"
          />
        </div>
      </div>

      {/* Kanban Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-4 min-h-[600px]">
          {/* Column 1: جديد */}
          <div
            className={cn(
              "flex flex-col bg-elevated/45 rounded-xl border border-edge p-4 transition-all",
              getColHeaderClass('NEW')
            )}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'NEW')}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-edge/60">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <h3 className="font-bold text-heading text-sm">عملاء جدد</h3>
              </div>
              <Badge variant="outline" className="px-2 py-0.5 text-xs text-dim bg-page font-semibold border-edge">
                {newColumn.length}
              </Badge>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[700px] scrollbar-thin">
              {newColumn.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-edge text-center p-4">
                  <span className="text-xs text-dim">اسحب البطاقات هنا لتغيير الحالة</span>
                </div>
              ) : (
                newColumn.map((lead) => (
                  <KanbanCard
                    key={lead.id}
                    lead={lead}
                    getCategoryBadgeLabel={getCategoryBadgeLabel}
                    onDragStart={handleDragStart}
                    onMove={(target) => {
                      if (target === 'CLOSED') {
                        setPendingLeadId(lead.id)
                        setShowOutcomeModal(true)
                      } else {
                        handleMoveLead(lead.id, target)
                      }
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Column 2: تم التواصل */}
          <div
            className={cn(
              "flex flex-col bg-elevated/45 rounded-xl border border-edge p-4 transition-all",
              getColHeaderClass('CONTACTED')
            )}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'CONTACTED')}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-edge/60">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <h3 className="font-bold text-heading text-sm">تم التواصل</h3>
              </div>
              <Badge variant="outline" className="px-2 py-0.5 text-xs text-dim bg-page font-semibold border-edge">
                {contactedColumn.length}
              </Badge>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[700px] scrollbar-thin">
              {contactedColumn.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-edge text-center p-4">
                  <span className="text-xs text-dim">اسحب البطاقات هنا لتغيير الحالة</span>
                </div>
              ) : (
                contactedColumn.map((lead) => (
                  <KanbanCard
                    key={lead.id}
                    lead={lead}
                    getCategoryBadgeLabel={getCategoryBadgeLabel}
                    onDragStart={handleDragStart}
                    onMove={(target) => {
                      if (target === 'CLOSED') {
                        setPendingLeadId(lead.id)
                        setShowOutcomeModal(true)
                      } else {
                        handleMoveLead(lead.id, target)
                      }
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Column 3: مؤهل */}
          <div
            className={cn(
              "flex flex-col bg-elevated/45 rounded-xl border border-edge p-4 transition-all",
              getColHeaderClass('QUALIFIED')
            )}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'QUALIFIED')}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-edge/60">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <h3 className="font-bold text-heading text-sm">مؤهل</h3>
              </div>
              <Badge variant="outline" className="px-2 py-0.5 text-xs text-dim bg-page font-semibold border-edge">
                {qualifiedColumn.length}
              </Badge>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[700px] scrollbar-thin">
              {qualifiedColumn.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-edge text-center p-4">
                  <span className="text-xs text-dim">اسحب البطاقات هنا لتغيير الحالة</span>
                </div>
              ) : (
                qualifiedColumn.map((lead) => (
                  <KanbanCard
                    key={lead.id}
                    lead={lead}
                    getCategoryBadgeLabel={getCategoryBadgeLabel}
                    onDragStart={handleDragStart}
                    onMove={(target) => {
                      if (target === 'CLOSED') {
                        setPendingLeadId(lead.id)
                        setShowOutcomeModal(true)
                      } else {
                        handleMoveLead(lead.id, target)
                      }
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Column 4: منتهي */}
          <div
            className={cn(
              "flex flex-col bg-elevated/45 rounded-xl border border-edge p-4 transition-all",
              getColHeaderClass('CLOSED')
            )}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'CLOSED')}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-edge/60">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-dim" />
                <h3 className="font-bold text-heading text-sm">منتهي (مغلق)</h3>
              </div>
              <Badge variant="outline" className="px-2 py-0.5 text-xs text-dim bg-page font-semibold border-edge">
                {closedColumn.length}
              </Badge>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[700px] scrollbar-thin">
              {closedColumn.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-edge text-center p-4">
                  <span className="text-xs text-dim">اسحب البطاقات هنا لتغيير الحالة</span>
                </div>
              ) : (
                closedColumn.map((lead) => (
                  <KanbanCard
                    key={lead.id}
                    lead={lead}
                    getCategoryBadgeLabel={getCategoryBadgeLabel}
                    onDragStart={handleDragStart}
                    onMove={(target) => {
                      if (target === 'CLOSED') {
                        setPendingLeadId(lead.id)
                        setShowOutcomeModal(true)
                      } else {
                        handleMoveLead(lead.id, target)
                      }
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Outcome Reason Modal */}
      {showOutcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-edge bg-elevated p-6 shadow-xl animate-fade-in-up">
            <h3 className="text-lg font-bold text-heading">تحديد نتيجة إغلاق الملف</h3>
            <p className="mt-2 text-sm text-dim">يرجى تحديد سبب الإغلاق أو نتيجة التواصل مع العميل لأغراض التقارير والتحسين.</p>

            <div className="mt-4 space-y-3">
              {OUTCOME_REASONS.map((reason) => (
                <label
                  key={reason.value}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border border-edge p-3 cursor-pointer transition-colors",
                    selectedReason === reason.value ? "bg-primary/5 border-primary" : "hover:bg-card-hover"
                  )}
                >
                  <input
                    type="radio"
                    name="closingReason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="accent-primary h-4 w-4"
                  />
                  <span className="text-sm font-medium text-heading">{reason.label}</span>
                </label>
              ))}

              <label
                className={cn(
                  "flex flex-col gap-2 rounded-lg border border-edge p-3 cursor-pointer transition-colors",
                  selectedReason === 'other' ? "bg-primary/5 border-primary" : "hover:bg-card-hover"
                )}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="closingReason"
                    value="other"
                    checked={selectedReason === 'other'}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="accent-primary h-4 w-4"
                  />
                  <span className="text-sm font-medium text-heading">📝 سبب آخر (اكتب تفاصيل)</span>
                </div>
                {selectedReason === 'other' && (
                  <Input
                    placeholder="اكتب سبب إغلاق الطلب هنا..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="mt-2 h-9 bg-page border-edge text-sm"
                  />
                )}
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowOutcomeModal(false)}>
                إلغاء
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleConfirmOutcome}
                disabled={!selectedReason || (selectedReason === 'other' && !customReason.trim())}
              >
                تأكيد الإغلاق
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Kanban Card Component ──────────────────────────────────

interface KanbanCardProps {
  lead: LeadWithDetails
  getCategoryBadgeLabel: (type: string | null | undefined) => { label: string; variant: 'default' | 'success' | 'warning' | 'outline' }
  onDragStart: (e: React.DragEvent, id: string) => void
  onMove: (target: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CLOSED') => void
}

function KanbanCard({ lead, getCategoryBadgeLabel, onDragStart, onMove }: KanbanCardProps) {
  const cat = getCategoryBadgeLabel(lead.property?.propertyType)
  
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      className="group relative cursor-grab rounded-xl border border-edge bg-elevated p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-dim/40 active:cursor-grabbing"
    >
      {/* Category Badge & Drag Handle */}
      <div className="flex items-center justify-between">
        <Badge variant={cat.variant} className="text-[10px] py-0 px-2 font-medium">
          {cat.label}
        </Badge>
        
        {/* Stage quick action helper for mobile / mouse */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-page/90 border border-edge rounded-md p-1 scale-90">
          {lead.status !== 'NEW' && (
            <button
              onClick={() => onMove('NEW')}
              className="text-[10px] font-bold px-1.5 py-0.5 hover:bg-card-hover rounded text-primary"
              title="نقل إلى جديد"
            >
              جديد
            </button>
          )}
          {lead.status !== 'CONTACTED' && (
            <button
              onClick={() => onMove('CONTACTED')}
              className="text-[10px] font-bold px-1.5 py-0.5 hover:bg-card-hover rounded text-amber-500"
              title="نقل إلى تم التواصل"
            >
              تواصل
            </button>
          )}
          {lead.status !== 'QUALIFIED' && (
            <button
              onClick={() => onMove('QUALIFIED')}
              className="text-[10px] font-bold px-1.5 py-0.5 hover:bg-card-hover rounded text-emerald-500"
              title="نقل إلى مؤهل"
            >
              تأهيل
            </button>
          )}
          {lead.status !== 'CLOSED' && (
            <button
              onClick={() => onMove('CLOSED')}
              className="text-[10px] font-bold px-1.5 py-0.5 hover:bg-card-hover rounded text-dim"
              title="نقل إلى منتهي"
            >
              إغلاق
            </button>
          )}
        </div>
      </div>

      {/* Client Name */}
      <div className="mt-3">
        <Link href={`/dashboard/leads/${lead.id}`} className="text-sm font-semibold text-heading hover:text-primary transition-colors block">
          {lead.name}
        </Link>
        <div className="mt-1.5 flex flex-col gap-1 text-[11px] text-dim">
          {lead.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-dim" />
              {lead.phone}
            </span>
          )}
          {lead.property && (
            <span className="flex items-center gap-1 truncate text-dim/95" title={lead.property.titleAr || lead.property.title}>
              <Building className="h-3 w-3 text-dim" />
              {lead.property.titleAr || lead.property.title}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Agent & Date */}
      <div className="mt-4 flex items-center justify-between border-t border-edge/60 pt-3">
        {/* Agent Info */}
        {lead.agent ? (
          <div className="flex items-center gap-1.5">
            {lead.agent.avatar ? (
              <img
                src={lead.agent.avatar}
                alt={lead.agent.name}
                className="h-5 w-5 rounded-full object-cover border border-edge"
              />
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary border border-primary/20">
                {lead.agent.name.substring(0, 2)}
              </div>
            )}
            <span className="text-[10px] font-medium text-dim">{lead.agent.name}</span>
          </div>
        ) : (
          <span className="text-[10px] text-dim/60 italic">بدون وكيل</span>
        )}

        {/* Date */}
        <span className="text-[10px] text-dim/50">
          {new Date(lead.createdAt).toLocaleDateString('ar-SA-u-nu-latn')}
        </span>
      </div>
    </div>
  )
}
