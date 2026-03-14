'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Phone,
  Clock,
  Trash2,
  X,
  Send,
  MoreVertical,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  getTeamMembers,
  changeMemberRole,
  removeMember,
  inviteMember,
  getPendingInvitations,
  cancelInvitation,
} from '@/lib/actions/team'
import type { Role } from '@prisma/client'

// ─── Types ──────────────────────────────────────────────────

type TeamMember = {
  membershipId: string
  userId: string
  name: string
  nameAr: string | null
  email: string
  avatar: string | null
  phone: string | null
  role: Role
  lastLoginAt: Date | null
  joinedAt: Date
}

type PendingInvitation = {
  id: string
  email: string
  role: Role
  status: string
  createdAt: Date
  expiresAt: Date
}

// ─── Constants ──────────────────────────────────────────────

const ROLES: { value: Role; label: string; icon: typeof Shield; description: string }[] = [
  {
    value: 'OWNER',
    label: 'مالك',
    icon: ShieldAlert,
    description: 'صلاحية كاملة لجميع الإعدادات والإدارة',
  },
  {
    value: 'MANAGER',
    label: 'مدير',
    icon: ShieldCheck,
    description: 'إدارة العقارات والعملاء والمدونة والفريق',
  },
  {
    value: 'AGENT',
    label: 'وكيل',
    icon: Shield,
    description: 'إدارة العقارات والعملاء المسندين إليه',
  },
]

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'success' | 'warning'> = {
  OWNER: 'default',
  MANAGER: 'success',
  AGENT: 'secondary',
}

const roleLabels: Record<string, string> = {
  OWNER: 'مالك',
  MANAGER: 'مدير',
  AGENT: 'وكيل',
}

// ─── Component ──────────────────────────────────────────────

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invitations, setInvitations] = useState<PendingInvitation[]>([])
  const [loading, setLoading] = useState(true)

  // Invite form
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('AGENT')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState(false)

  // Role change dropdown
  const [roleDropdownOpen, setRoleDropdownOpen] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [membersData, invitationsData] = await Promise.all([
        getTeamMembers(),
        getPendingInvitations(),
      ])
      setMembers(membersData as TeamMember[])
      setInvitations(invitationsData as PendingInvitation[])
    } catch (error) {
      console.error('Failed to load team data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Invite handler
  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      setInviteError('البريد الإلكتروني مطلوب')
      return
    }

    setInviting(true)
    setInviteError(null)
    setInviteSuccess(false)

    try {
      await inviteMember(inviteEmail.trim(), inviteRole)
      setInviteSuccess(true)
      setInviteEmail('')
      setInviteRole('AGENT')
      loadData()
      // Auto-hide success message after 3s
      setTimeout(() => setInviteSuccess(false), 3000)
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'فشل في إرسال الدعوة')
    } finally {
      setInviting(false)
    }
  }

  // Role change handler
  const handleRoleChange = async (membershipId: string, newRole: Role) => {
    try {
      await changeMemberRole(membershipId, newRole)
      setRoleDropdownOpen(null)
      loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل في تغيير الدور')
    }
  }

  // Remove member handler
  const handleRemove = async (membershipId: string, memberName: string) => {
    if (!confirm(`هل أنت متأكد من إزالة ${memberName} من الفريق؟`)) return
    try {
      await removeMember(membershipId)
      loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل في إزالة العضو')
    }
  }

  // Cancel invitation handler
  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm('هل تريد إلغاء هذه الدعوة؟')) return
    try {
      await cancelInvitation(invitationId)
      loadData()
    } catch (err) {
      console.error('Failed to cancel invitation:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8A96E] border-t-transparent" />
      </div>
    )
  }

  const ownerCount = members.filter((m) => m.role === 'OWNER').length
  const managerCount = members.filter((m) => m.role === 'MANAGER').length
  const agentCount = members.filter((m) => m.role === 'AGENT').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3748]">الفريق</h1>
          <p className="mt-1 text-sm text-[#718096]">
            إدارة أعضاء الفريق والدعوات
          </p>
        </div>
        <Button size="sm" onClick={() => setShowInviteForm(!showInviteForm)}>
          <UserPlus className="h-4 w-4" />
          دعوة عضو
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'المالكين', value: ownerCount, icon: ShieldAlert },
          { label: 'المديرين', value: managerCount, icon: ShieldCheck },
          { label: 'الوكلاء', value: agentCount, icon: Shield },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C8A96E]/10">
                  <Icon className="h-5 w-5 text-[#C8A96E]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2D3748]">{stat.value}</p>
                  <p className="text-xs text-[#718096]">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <UserPlus className="me-2 inline-block h-4 w-4" />
              دعوة عضو للفريق
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inviteError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {inviteError}
              </div>
            )}
            {inviteSuccess && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
                تم إرسال الدعوة!
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-2">
                <Label>البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>الدور</Label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as Role)}
                  className="flex h-10 w-full rounded-md border border-[#E2E8F0] bg-[#FAFAF7] px-3 py-2 text-sm text-[#2D3748]"
                >
                  <option value="AGENT">وكيل</option>
                  <option value="MANAGER">مدير</option>
                  <option value="OWNER">مالك</option>
                </select>
              </div>
            </div>

            {/* Role descriptions */}
            <div className="grid gap-2 sm:grid-cols-3">
              {ROLES.map((r) => {
                const Icon = r.icon
                return (
                  <button
                    key={r.value}
                    onClick={() => setInviteRole(r.value)}
                    className={cn(
                      'rounded-lg border p-3 text-start transition-all',
                      inviteRole === r.value
                        ? 'border-[#C8A96E] bg-[#C8A96E]/5'
                        : 'border-[#E2E8F0] hover:border-[#C8A96E]/30'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={cn('h-4 w-4', inviteRole === r.value ? 'text-[#C8A96E]' : 'text-[#718096]')} />
                      <span className={cn('text-sm font-medium', inviteRole === r.value ? 'text-[#C8A96E]' : 'text-[#2D3748]')}>
                        {r.label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#718096]">{r.description}</p>
                  </button>
                )
              })}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleInvite} isLoading={inviting}>
                <Send className="h-4 w-4" />
                إرسال الدعوة
              </Button>
              <Button variant="outline" onClick={() => setShowInviteForm(false)}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <Users className="me-2 inline-block h-4 w-4" />
            أعضاء الفريق
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-[#718096]" />
              <p className="mt-4 text-lg font-medium text-[#2D3748]">لا يوجد أعضاء في الفريق</p>
              <p className="mt-1 text-sm text-[#718096]">ادعُ أول عضو للفريق للبدء.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.membershipId}
                  className="flex items-center gap-4 rounded-lg border border-[#E2E8F0] p-4 transition-colors hover:border-[#C8A96E]/20"
                >
                  {/* Avatar */}
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#EBF0F7] text-[#C8A96E]">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#2D3748]">{member.name}</p>
                      {member.nameAr && (
                        <span className="text-xs text-[#718096]" dir="rtl">
                          ({member.nameAr})
                        </span>
                      )}
                      <Badge variant={roleBadgeVariant[member.role] || 'secondary'}>
                        {roleLabels[member.role] || member.role}
                      </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#718096]">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </span>
                      {member.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {member.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        انضم {new Date(member.joinedAt).toLocaleDateString('ar-SA-u-nu-latn')}
                      </span>
                      {member.lastLoginAt && (
                        <span className="text-[#A0AEC0]">
                          آخر دخول: {new Date(member.lastLoginAt).toLocaleDateString('ar-SA-u-nu-latn')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="relative flex items-center gap-1">
                    {/* Role change dropdown */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setRoleDropdownOpen(
                            roleDropdownOpen === member.membershipId ? null : member.membershipId
                          )
                        }
                        className="rounded-md p-2 text-[#718096] transition-colors hover:bg-[#F7F7F2] hover:text-[#1E3A5F]"
                        title="تغيير الدور"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {roleDropdownOpen === member.membershipId && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setRoleDropdownOpen(null)}
                          />
                          <div className="absolute end-0 top-full z-50 mt-1 w-48 rounded-lg border border-[#E2E8F0] bg-white py-1 shadow-xl">
                            <p className="px-3 py-1.5 text-xs font-medium uppercase text-[#718096]">
                              تغيير الدور
                            </p>
                            {ROLES.map((r) => (
                              <button
                                key={r.value}
                                onClick={() => handleRoleChange(member.membershipId, r.value)}
                                disabled={member.role === r.value}
                                className={cn(
                                  'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors',
                                  member.role === r.value
                                    ? 'bg-[#C8A96E]/10 text-[#C8A96E]'
                                    : 'text-[#2D3748] hover:bg-[#F7F7F2]'
                                )}
                              >
                                <r.icon className="h-3.5 w-3.5" />
                                {r.label}
                                {member.role === r.value && (
                                  <span className="ms-auto text-xs text-[#718096]">الحالي</span>
                                )}
                              </button>
                            ))}
                            <div className="my-1 border-t border-[#E2E8F0]" />
                            <button
                              onClick={() => {
                                setRoleDropdownOpen(null)
                                handleRemove(member.membershipId, member.name)
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-600/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              إزالة من الفريق
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <Mail className="me-2 inline-block h-4 w-4" />
              الدعوات المعلقة ({invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-lg border border-[#E2E8F0] border-dashed p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-[#E2E8F0] text-[#718096]">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#2D3748]">{inv.email}</p>
                      <div className="flex items-center gap-2 text-xs text-[#718096]">
                        <Badge variant={roleBadgeVariant[inv.role] || 'secondary'} className="text-[10px]">
                          {roleLabels[inv.role] || inv.role}
                        </Badge>
                        <span>
                          أُرسلت {new Date(inv.createdAt).toLocaleDateString('ar-SA-u-nu-latn')}
                        </span>
                        <span>
                          ينتهي {new Date(inv.expiresAt).toLocaleDateString('ar-SA-u-nu-latn')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCancelInvitation(inv.id)}
                    className="rounded-md p-2 text-[#718096] transition-colors hover:bg-red-600/10 hover:text-red-400"
                    title="إلغاء الدعوة"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
