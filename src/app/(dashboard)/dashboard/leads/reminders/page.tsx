'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Bell,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  User,
  Phone,
  Building,
  Check,
  PlusCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getLeadsReportsData } from '@/lib/actions/leads'
import { getReminders, createReminder, toggleReminderCompleted, deleteReminder } from '@/lib/actions/reminders'
import { LeadsHeader } from '@/components/leads/LeadsHeader'

// ─── Types ──────────────────────────────────────────────────

interface LeadOption {
  id: string
  name: string
  phone: string | null
}

interface Reminder {
  id: string
  leadId: string | null
  leadName: string
  leadPhone: string | null
  title: string
  dueDate: string // ISO date string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  completed: boolean
}

export default function RemindersPage() {
  const [leads, setLeads] = useState<LeadOption[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newLeadId, setNewLeadId] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newPriority, setNewPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM')

  const fetchLeadsData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [data, dbReminders] = await Promise.all([
        getLeadsReportsData(),
        getReminders(),
      ])
      setLeads(data.map((l) => ({ id: l.id, name: l.name, phone: l.phone })))
      setReminders(
        dbReminders.map((r) => ({
          id: r.id,
          leadId: r.leadId,
          leadName: r.leadName,
          leadPhone: r.leadPhone,
          title: r.title,
          dueDate: r.dueDate.toISOString(),
          priority: r.priority as 'HIGH' | 'MEDIUM' | 'LOW',
          completed: r.completed,
        }))
      )
    } catch (err) {
      console.error('Failed to load leads for reminders:', err)
      setError('فشل تحميل قائمة التذكيرات. يرجى محاولة التحديث.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeadsData()
  }, [fetchLeadsData])

  // Toggle Completion
  const handleToggleComplete = async (id: string) => {
    const reminder = reminders.find((r) => r.id === id)
    if (!reminder) return
    const newCompleted = !reminder.completed

    // Optimistic update
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: newCompleted } : r))
    )

    try {
      await toggleReminderCompleted(id, newCompleted)
    } catch (err) {
      console.error('Failed to toggle reminder:', err)
      setError('فشل تعديل حالة التذكير.')
      // Rollback on failure
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, completed: !newCompleted } : r))
      )
    }
  }

  // Delete Reminder
  const handleDeleteReminder = async (id: string) => {
    const previous = [...reminders]
    setError(null)
    // Optimistic update
    setReminders((prev) => prev.filter((r) => r.id !== id))

    try {
      await deleteReminder(id)
    } catch (err) {
      console.error('Failed to delete reminder:', err)
      setError('حدث خطأ أثناء محاولة حذف التذكير.')
      // Rollback on failure
      setReminders(previous)
    }
  }

  // Add new reminder
  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newDate || !newTime) return

    const selectedLead = leads.find((l) => l.id === newLeadId)
    const leadName = selectedLead ? selectedLead.name : 'عميل عام'
    const leadPhone = selectedLead ? selectedLead.phone : null

    const dueDateTime = new Date(`${newDate}T${newTime}`)

    setSaving(true)
    setError(null)
    try {
      const created = await createReminder({
        leadId: newLeadId || null,
        leadName,
        leadPhone: leadPhone || '',
        title: newTitle,
        dueDate: dueDateTime,
        priority: newPriority,
      })

      const newReminder: Reminder = {
        id: created.id,
        leadId: created.leadId,
        leadName: created.leadName,
        leadPhone: created.leadPhone,
        title: created.title,
        dueDate: created.dueDate.toISOString(),
        priority: created.priority as 'HIGH' | 'MEDIUM' | 'LOW',
        completed: created.completed,
      }

      setReminders((prev) => [newReminder, ...prev])

      // Reset Form
      setNewTitle('')
      setNewLeadId('')
      setNewDate('')
      setNewTime('')
      setNewPriority('MEDIUM')
      setShowAddForm(false)
    } catch (err) {
      console.error('Failed to add reminder:', err)
      setError('فشل إنشاء التذكير الجديد. يرجى التحقق من الاتصال بالخادم.')
    } finally {
      setSaving(false)
    }
  }

  // Split reminders into Overdue, Upcoming, Completed
  const now = new Date()
  
  const overdueReminders = reminders.filter(
    (r) => !r.completed && new Date(r.dueDate) < now
  )
  const upcomingReminders = reminders.filter(
    (r) => !r.completed && new Date(r.dueDate) >= now
  )
  const completedReminders = reminders.filter((r) => r.completed)

  // Format date output
  const formatReminderDate = (isoString: string) => {
    const d = new Date(isoString)
    return d.toLocaleDateString('ar-SA-u-nu-latn', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatReminderTime = (isoString: string) => {
    const d = new Date(isoString)
    return d.toLocaleTimeString('ar-SA-u-nu-latn', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getPriorityBadge = (priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
    if (priority === 'HIGH') return <Badge variant="destructive">هام جداً</Badge>
    if (priority === 'MEDIUM') return <Badge variant="warning">متوسط</Badge>
    return <Badge variant="outline">عادي</Badge>
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Shared Header */}
      <LeadsHeader
        title="تذكيرات ومواعيد المتابعة"
        description="تتبع المهام والمكالمات الهاتفية المجدولة مع العملاء للتأكد من عدم تفويت أي موعد."
      >
        <Button variant="default" size="sm" onClick={() => setShowAddForm(!showAddForm)} className="h-9">
          <Plus className="h-4 w-4" />
          إضافة تذكير جديد
        </Button>
      </LeadsHeader>

      {/* Error state banner */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 p-4 text-red-700 dark:text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Add Reminder Form Collapse */}
      {showAddForm && (
        <Card className="border-primary/20 bg-elevated/80 animate-fade-in-up">
          <CardContent className="p-5">
            <h3 className="text-base font-bold text-heading mb-4">تحديد تذكير أو موعد جديد مع عميل</h3>
            <form onSubmit={handleAddReminder} className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Reminder Title */}
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-heading">وصف التذكير / المهمة</label>
                <Input
                  placeholder="مثال: الاتصال لتأكيد موعد المعاينة، إرسال العقد..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="bg-page border-edge"
                />
              </div>

              {/* Select Client */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-heading">العميل المرتبط</label>
                <select
                  value={newLeadId}
                  onChange={(e) => setNewLeadId(e.target.value)}
                  className="h-10 rounded-lg border border-edge bg-page px-3 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">-- عميل عام / غير محدد --</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-heading">تاريخ الاستحقاق</label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]} // W-14: Prevent past dates
                  className="bg-page border-edge h-10 text-heading"
                />
              </div>

              {/* Due Time */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-heading">الوقت</label>
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  required
                  className="bg-page border-edge h-10 text-heading"
                />
              </div>

              {/* Priority */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-heading">الأهمية</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="h-10 rounded-lg border border-edge bg-page px-3 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="HIGH">عالية الأهمية</option>
                  <option value="MEDIUM">متوسطة الأهمية</option>
                  <option value="LOW">عادية</option>
                </select>
              </div>

              <div className="md:col-span-3 flex justify-end gap-2 pt-2 border-t border-edge/60">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)} disabled={saving}>
                  إلغاء
                </Button>
                <Button type="submit" variant="default" size="sm" isLoading={saving}>
                  حفظ التذكير
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Overdue Section */}
          {overdueReminders.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-500 font-bold px-1">
                <AlertCircle className="h-5 w-5" />
                <h2 className="text-base">مواعيد وتذكيرات متأخرة ({overdueReminders.length})</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {overdueReminders.map((reminder) => (
                  <Card
                    key={reminder.id}
                    className="border-red-200/60 dark:border-red-900/40 border-r-4 border-r-red-500 bg-red-50/20 dark:bg-red-950/10 hover:shadow-md transition-all duration-200"
                  >
                    <CardContent className="p-4 flex gap-3.5 items-start">
                      <button
                        onClick={() => handleToggleComplete(reminder.id)}
                        className="h-6 w-6 rounded-full border-2 border-red-400 dark:border-red-700 bg-page flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 cursor-pointer text-transparent hover:text-red-600 transition-colors mt-0.5 shrink-0"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold text-heading leading-relaxed">{reminder.title}</p>
                          <div className="shrink-0">{getPriorityBadge(reminder.priority)}</div>
                        </div>

                        {/* Client details */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-body">
                          <span className="flex items-center gap-1 font-medium">
                            <User className="h-3.5 w-3.5 text-dim" />
                            {reminder.leadId ? (
                              <Link href={`/dashboard/leads/${reminder.leadId}`} className="underline hover:text-primary">
                                {reminder.leadName}
                              </Link>
                            ) : (
                              reminder.leadName
                            )}
                          </span>
                          {reminder.leadPhone && (
                            <span className="flex items-center gap-1 text-dim">
                              <Phone className="h-3.5 w-3.5 text-dim" />
                              {reminder.leadPhone}
                            </span>
                          )}
                        </div>

                        {/* Due details */}
                        <div className="pt-2 border-t border-red-200/50 dark:border-red-900/30 flex items-center justify-between text-xs text-red-600 dark:text-red-400 font-semibold">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatReminderDate(reminder.dueDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatReminderTime(reminder.dueDate)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Section */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-heading px-1">تذكيرات ومواعيد قادمة ({upcomingReminders.length})</h2>
            {upcomingReminders.length === 0 ? (
              <Card className="border-edge bg-elevated/40">
                <CardContent className="py-8 text-center text-dim text-sm">
                  لا توجد تذكيرات قادمة مجدولة.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {upcomingReminders.map((reminder) => (
                  <Card
                    key={reminder.id}
                    className="border-edge bg-elevated hover:shadow-md hover:border-dim/30 transition-all duration-200"
                  >
                    <CardContent className="p-4 flex gap-3.5 items-start">
                      <button
                        onClick={() => handleToggleComplete(reminder.id)}
                        className="h-6 w-6 rounded-full border-2 border-edge bg-page flex items-center justify-center hover:bg-primary/10 hover:border-primary cursor-pointer text-transparent hover:text-primary transition-all mt-0.5 shrink-0"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold text-heading leading-relaxed">{reminder.title}</p>
                          <div className="shrink-0">{getPriorityBadge(reminder.priority)}</div>
                        </div>

                        {/* Client details */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-dim">
                          <span className="flex items-center gap-1 font-medium">
                            <User className="h-3.5 w-3.5" />
                            {reminder.leadId ? (
                              <Link href={`/dashboard/leads/${reminder.leadId}`} className="underline hover:text-primary">
                                {reminder.leadName}
                              </Link>
                            ) : (
                              reminder.leadName
                            )}
                          </span>
                          {reminder.leadPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5" />
                              {reminder.leadPhone}
                            </span>
                          )}
                        </div>

                        {/* Due details */}
                        <div className="pt-2 border-t border-edge/60 flex items-center justify-between text-xs text-dim font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatReminderDate(reminder.dueDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatReminderTime(reminder.dueDate)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Completed Section (Optional list showing recently completed) */}
          {completedReminders.length > 0 && (
            <div className="space-y-3 opacity-60">
              <h2 className="text-sm font-bold text-dim px-1">مكتملة مؤخراً ({completedReminders.length})</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {completedReminders.map((reminder) => (
                  <Card key={reminder.id} className="border-edge bg-elevated/30 line-through">
                    <CardContent className="p-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleComplete(reminder.id)}
                          className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center cursor-pointer text-emerald-600 shrink-0"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <div className="text-xs">
                          <p className="font-semibold text-heading truncate max-w-[200px]">{reminder.title}</p>
                          <p className="text-[10px] text-dim">{reminder.leadName}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteReminder(reminder.id)}
                        className="text-dim hover:text-red-500 p-1 hover:bg-card-hover rounded transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
