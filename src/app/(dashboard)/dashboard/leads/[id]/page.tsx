'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Phone, Mail, Building2, MessageSquare, Send, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getLead, updateLeadStatus, assignLeadAgent, addLeadNote } from '@/lib/actions/leads'
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

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED'] as const

export default function LeadDetailPage() {
  const params = useParams()
  const leadId = params.id as string
  const [lead, setLead] = useState<Awaited<ReturnType<typeof getLead>>>(null)
  const [agents, setAgents] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [noteContent, setNoteContent] = useState('')
  const [submittingNote, setSubmittingNote] = useState(false)

  const loadData = async () => {
    try {
      const [leadData, agentData] = await Promise.all([
        getLead(leadId),
        getAgents(),
      ])
      setLead(leadData)
      setAgents(agentData)
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
    try {
      await updateLeadStatus(leadId, status as (typeof STATUSES)[number])
      loadData()
    } catch (error) {
      console.error('Failed to update status:', error)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/leads">
          <button className="rounded-lg p-2 text-[#718096] transition-colors hover:bg-[#F7F7F2] hover:text-[#1E3A5F]">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#2D3748]">{lead.name}</h1>
          <Badge variant={statusVariant[lead.status] || 'secondary'}>{statusLabel[lead.status] || lead.status}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Lead Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">معلومات التواصل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-[#718096]" />
                <span className="text-[#2D3748]">{lead.name}</span>
              </div>
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
              {lead.message && (
                <div className="mt-3 rounded-lg border border-[#E2E8F0] bg-[#FAFAF7] p-3">
                  <p className="text-xs font-medium text-[#718096]">الرسالة</p>
                  <p className="mt-1 text-sm text-[#2D3748]">{lead.message}</p>
                </div>
              )}
              <div className="flex items-center gap-2 pt-2 text-xs text-[#718096]">
                <Clock className="h-3.5 w-3.5" />
                {new Date(lead.createdAt).toLocaleString('ar-SA-u-nu-latn')}
                <span className="ms-2">المصدر: {sourceLabel[lead.source] || lead.source}</span>
              </div>
            </CardContent>
          </Card>

          {/* Linked Property */}
          {lead.property && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">العقار المرتبط</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/dashboard/properties/${lead.property.id}`}
                  className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] p-3 transition-colors hover:border-[#C8A96E]/30"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EBF0F7]">
                    <Building2 className="h-5 w-5 text-[#C8A96E]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2D3748]">{lead.property.title}</p>
                    <p className="text-xs text-[#718096]">{lead.property.slug}</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">سجل النشاط</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add Note Form */}
              <div className="mb-4 flex gap-2">
                <Input
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="أضف ملاحظة..."
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddNote() }}
                />
                <Button onClick={handleAddNote} isLoading={submittingNote} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Timeline */}
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
                            {activity.type}
                          </Badge>
                        </div>
                        {activity.content && (
                          <p className="mt-1 text-sm text-[#718096]">{activity.content}</p>
                        )}
                        <p className="mt-1 text-xs text-[#718096]">
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Change */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">تغيير الحالة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                      lead.status === s
                        ? 'border-[#C8A96E] bg-[#C8A96E]/10 text-[#C8A96E]'
                        : 'border-[#E2E8F0] text-[#718096] hover:border-[#C8A96E]/30 hover:text-[#1E3A5F]'
                    }`}
                  >
                    {statusLabel[s] || s}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Agent Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">تعيين وكيل</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={lead.agent?.id || ''}
                onChange={(e) => handleAgentAssign(e.target.value)}
                className="flex h-10 w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748]"
              >
                <option value="">غير معين</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
