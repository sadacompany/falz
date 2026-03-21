'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, Building2, Send, Clock, Heart, FileText, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getLead, updateLeadStatus, assignLeadAgent, addLeadNote, getLinkedVisitorData } from '@/lib/actions/leads'
import { getAgents } from '@/lib/actions/properties'

const statusVariant: Record<string, 'default' | 'secondary' | 'success' | 'warning'> = {
  NEW: 'default',
  CONTACTED: 'warning',
  QUALIFIED: 'success',
  CLOSED: 'secondary',
}

const statusLabel: Record<string, string> = {
  NEW: 'جديد',
  CONTACTED: 'تم التواصل',
  QUALIFIED: 'مؤهل',
  CLOSED: 'مغلق',
}

const sourceLabel: Record<string, string> = {
  CONTACT_FORM: 'نموذج التواصل',
  PROPERTY_INQUIRY: 'استفسار عقاري',
  WHATSAPP_CLICK: 'واتساب',
  PHONE_CLICK: 'هاتف',
  MANUAL: 'يدوي',
}

const activityTypeLabel: Record<string, string> = {
  note: 'ملاحظة',
  status_change: 'تغيير حالة',
  assignment: 'تعيين',
}

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED'] as const

export default function LeadDetailPage() {
  const params = useParams()
  const leadId = params.id as string
  const [lead, setLead] = useState<Awaited<ReturnType<typeof getLead>>>(null)
  const [agents, setAgents] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [noteContent, setNoteContent] = useState('')
  const [submittingNote, setSubmittingNote] = useState(false)
  const [changingStatus, setChangingStatus] = useState(false)
  const [visitorData, setVisitorData] = useState<Awaited<ReturnType<typeof getLinkedVisitorData>>>(null)

  const loadData = async () => {
    try {
      const [leadData, agentData] = await Promise.all([
        getLead(leadId),
        getAgents(),
      ])
      setLead(leadData)
      setAgents(agentData)
      if (leadData?.phone) {
        getLinkedVisitorData(leadId).then(setVisitorData).catch((err) => console.error('Failed to load visitor data:', err))
      }
    } catch (error) {
      console.error('Failed to load lead:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [leadId])

  const handleStatusChange = async (status: string) => {
    if (changingStatus) return
    setChangingStatus(true)
    try {
      await updateLeadStatus(leadId, status as (typeof STATUSES)[number])
      await loadData()
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setChangingStatus(false)
    }
  }

  const handleAgentAssign = async (agentId: string) => {
    try {
      await assignLeadAgent(leadId, agentId || null)
      loadData()
    } catch (error) {
      console.error('Failed to assign agent:', error)
    }
  }

  const handleAddNote = async () => {
    if (!noteContent.trim()) return
    setSubmittingNote(true)
    try {
      await addLeadNote(leadId, noteContent.trim())
      setNoteContent('')
      loadData()
    } catch (error) {
      console.error('Failed to add note:', error)
    } finally {
      setSubmittingNote(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8A96E] border-t-transparent" />
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-medium text-[#2D3748]">العميل المحتمل غير موجود</p>
        <Link href="/dashboard/leads" className="mt-2 text-sm text-[#C8A96E] hover:underline">
          العودة للعملاء المحتملين
        </Link>
      </div>
    )
  }

  const hasVisitorActivity = visitorData && (visitorData.favorites.length > 0 || visitorData.requests.length > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/leads"
          aria-label="العودة للعملاء المحتملين"
          className="rounded-lg p-2 text-[#718096] transition-colors hover:bg-[#F7F7F2] hover:text-[#1E3A5F] focus-visible:ring-2 focus-visible:ring-[#C8A96E] focus-visible:ring-offset-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#2D3748]">{lead.name}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={statusVariant[lead.status] || 'secondary'}>{statusLabel[lead.status] || lead.status}</Badge>
            <span className="text-xs text-[#A0AEC0]">{sourceLabel[lead.source] || lead.source}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact Info + Property (merged) */}
          <Card>
            <CardContent className="space-y-3 pt-6">
              {lead.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-[#718096]" />
                  <a href={`tel:${lead.phone}`} className="text-[#C8A96E] hover:underline">{lead.phone}</a>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-[#718096]" />
                  <a href={`mailto:${lead.email}`} className="text-[#C8A96E] hover:underline">{lead.email}</a>
                </div>
              )}
              {lead.property && (
                <Link
                  href={`/dashboard/properties/${lead.property.id}`}
                  className="flex items-center gap-3 text-sm hover:text-[#C8A96E]"
                >
                  <Building2 className="h-4 w-4 text-[#718096]" />
                  <span className="text-[#2D3748] hover:text-[#C8A96E]">{lead.property.titleAr || lead.property.title}</span>
                </Link>
              )}
              {lead.message && (
                <div className="mt-2 rounded-lg bg-[#FAFAF7] p-3">
                  <p className="text-sm text-[#2D3748]">{lead.message}</p>
                </div>
              )}
              <p className="flex items-center gap-1.5 pt-1 text-xs text-[#A0AEC0]">
                <Clock className="h-3 w-3" />
                {new Date(lead.createdAt).toLocaleString('ar-SA-u-nu-latn')}
              </p>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">سجل النشاط</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2">
                <Input
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="أضف ملاحظة..."
                  aria-label="أضف ملاحظة"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddNote() }}
                />
                <Button onClick={handleAddNote} isLoading={submittingNote} size="icon" aria-label="إرسال ملاحظة">
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {lead.activities && lead.activities.length > 0 ? (
                  lead.activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3 border-s-2 border-[#E2E8F0] ps-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#2D3748]">
                            {activity.user?.name || 'النظام'}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {activityTypeLabel[activity.type] || activity.type}
                          </Badge>
                        </div>
                        {activity.content && (
                          <p className="mt-1 text-sm text-[#718096]">{activity.content}</p>
                        )}
                        <p className="mt-1 text-xs text-[#A0AEC0]">
                          {new Date(activity.createdAt).toLocaleString('ar-SA-u-nu-latn')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-sm text-[#718096]">لا يوجد نشاط بعد</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Visitor Activity (merged: favorites + requests) */}
          {hasVisitorActivity && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Eye className="h-4 w-4 text-[#C8A96E]" />
                    نشاط الزائر
                  </CardTitle>
                  <p className="text-xs text-[#A0AEC0]">
                    مسجّل منذ {new Date(visitorData!.visitor.createdAt).toLocaleDateString('ar-SA-u-nu-latn')}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Favorites */}
                {visitorData!.favorites.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[#718096]">
                      <Heart className="h-3 w-3" />
                      المفضلة ({visitorData!.favorites.length})
                    </p>
                    <div className="space-y-1">
                      {visitorData!.favorites.map((fav) => (
                        <Link
                          key={fav.id}
                          href={`/dashboard/properties/${fav.property.id}`}
                          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[#FAFAF7]"
                        >
                          <span className="truncate text-[#2D3748]">{fav.property.titleAr || fav.property.title}</span>
                          <span className="ms-2 flex-shrink-0 text-xs text-[#A0AEC0]">{new Date(fav.createdAt).toLocaleDateString('ar-SA-u-nu-latn')}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Requests */}
                {visitorData!.requests.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[#718096]">
                      <FileText className="h-3 w-3" />
                      الطلبات ({visitorData!.requests.length})
                    </p>
                    <div className="space-y-2">
                      {visitorData!.requests.map((req) => (
                        <div key={req.id} className="rounded-lg bg-[#FAFAF7] p-3">
                          <div className="flex items-center justify-between">
                            <Link
                              href={`/dashboard/properties/${req.property.id}`}
                              className="text-sm font-medium text-[#2D3748] hover:text-[#C8A96E]"
                            >
                              {req.property.titleAr || req.property.title}
                            </Link>
                            <Badge variant={req.status === 'PENDING' ? 'warning' : req.status === 'RESPONDED' ? 'success' : 'secondary'}>
                              {req.status === 'PENDING' ? 'معلق' : req.status === 'RESPONDED' ? 'تم الرد' : 'مغلق'}
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs text-[#718096]">
                            {req.type === 'VIEWING' ? 'طلب معاينة' : req.type === 'INFO' ? 'طلب معلومات' : 'إبداء اهتمام'}
                          </p>
                          {req.message && (
                            <p className="mt-1 text-sm text-[#718096]">{req.message}</p>
                          )}
                          {req.response && (
                            <div className="mt-2 rounded border-s-2 border-[#C8A96E] bg-white p-2 text-sm text-[#2D3748]">
                              {req.response}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar — merged status + agent into one card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">إدارة العميل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Status */}
              <div>
                <p className="mb-2 text-xs font-medium text-[#718096]">الحالة</p>
                <div className="flex flex-col gap-1.5">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={changingStatus}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-[#C8A96E] focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                        lead.status === s
                          ? 'border-[#C8A96E] bg-[#C8A96E]/10 text-[#C8A96E]'
                          : 'border-[#E2E8F0] text-[#718096] hover:border-[#C8A96E]/30 hover:text-[#1E3A5F]'
                      }`}
                    >
                      {statusLabel[s] || s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Agent */}
              <div>
                <p className="mb-2 text-xs font-medium text-[#718096]">الوكيل</p>
                <select
                  value={lead.agent?.id || ''}
                  onChange={(e) => handleAgentAssign(e.target.value)}
                  aria-label="تعيين وكيل"
                  className="flex h-10 w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748] focus-visible:ring-2 focus-visible:ring-[#C8A96E] focus-visible:ring-offset-1"
                >
                  <option value="">غير معين</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
