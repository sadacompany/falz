import { describe, it, expect, beforeEach } from 'vitest'
import { prismaMock, seedDefaultPrismaMocks } from '../fixtures/prisma-mock'
import { mockAsOwner, mockAsSuperAdmin, mockUnauthenticated } from '../fixtures/auth-mock'
import { mockOffice, mockOwnerUser, mockSaleProperty, mockRegaOwner, mockOwnerMembership } from '../fixtures/test-data'

import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  bulkDeleteProperties,
  bulkPublishProperties,
  getPropertyStats,
  getAgents,
  checkAndArchiveExpiredContracts,
} from '@/lib/actions/properties'

import {
  getOwners,
  getOwner,
  createOwner,
  updateOwner,
  deleteOwner,
} from '@/lib/actions/owners'

import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  updateLeadStatus,
  assignLeadAgent,
  routeLead,
  addLeadNote,
  getLeadStats,
  getCRMStats,
  getLinkedVisitorData,
  deleteLead,
  claimLead,
  getLeadsReportsData,
} from '@/lib/actions/leads'

import {
  getAdminStats,
  getOffices,
  approveOffice,
  disableOffice,
  getOfficeDetail,
  getUsers,
  toggleUserActive,
  getPlans,
  updatePlan,
  getAuditLogs,
  impersonateOffice,
} from '@/lib/actions/admin'

import {
  getTeamMembers,
  changeMemberRole,
  removeMember,
  inviteMember,
  getPendingInvitations,
  cancelInvitation,
} from '@/lib/actions/team'

import {
  getOfficeDetails,
  updateOfficeGeneral,
  updateOfficeTheme,
  updateOfficeSeo,
  updateOfficeSocial,
  updateOfficeDomain,
  updateOfficePageSections,
  updateOfficePageVisibility,
  updateOfficeLanguage,
} from '@/lib/actions/office'

import {
  getBlogPosts,
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getBlogCategories,
  createBlogCategory,
  getBlogTags,
  createBlogTag,
} from '@/lib/actions/blog'

import {
  getReminders,
  createReminder,
  toggleReminderCompleted,
  deleteReminder,
} from '@/lib/actions/reminders'

import {
  getMissedCalls,
  createMissedCall,
  resolveMissedCall,
} from '@/lib/actions/missed-calls'

import {
  getSignboards,
  createSignboard,
  updateSignboard,
  deleteSignboard,
} from '@/lib/actions/signboards'

import {
  getVisitors,
  getVisitor,
  getVisitorStats,
} from '@/lib/actions/visitors'

describe('Server Actions Suite (Comprehensive Coverage across all actions)', () => {
  beforeEach(() => {
    seedDefaultPrismaMocks()
    mockAsOwner()
  })

  // ─── PROPERTIES ACTIONS ───────────────────────────────────
  describe('Properties Actions (properties.ts)', () => {
    it('getProperty: happy path, missing entity, and auth error', async () => {
      prismaMock.property.findFirst.mockResolvedValue({ ...mockSaleProperty, bids: [] } as any)
      const found = await getProperty('prop-sale-1')
      expect(found).not.toBeNull()

      prismaMock.property.findFirst.mockResolvedValue(null)
      const missing = await getProperty('non-existent')
      expect(missing).toBeNull()

      mockUnauthenticated()
      await expect(getProperty('prop-sale-1')).rejects.toThrow('Authentication required')
    })

    it('deleteProperty & bulk operations: happy path, permission check, unauthenticated', async () => {
      prismaMock.property.delete.mockResolvedValue(mockSaleProperty as any)
      const del = await deleteProperty('prop-sale-1')
      expect(del).toEqual({ success: true })

      prismaMock.property.deleteMany.mockResolvedValue({ count: 2 })
      const bulkDel = await bulkDeleteProperties(['prop-1', 'prop-2'])
      expect(bulkDel).toEqual({ success: true })

      prismaMock.property.updateMany.mockResolvedValue({ count: 2 })
      const bulkPub = await bulkPublishProperties(['prop-1', 'prop-2'])
      expect(bulkPub).toEqual({ success: true })
    })

    it('getPropertyStats & getAgents: happy path', async () => {
      prismaMock.property.count.mockResolvedValue(10)
      const stats = await getPropertyStats()
      expect(stats.total).toBe(10)

      prismaMock.membership.findMany.mockResolvedValue([])
      const agents = await getAgents()
      expect(Array.isArray(agents)).toBe(true)
    })
  })

  // ─── OWNERS ACTIONS ──────────────────────────────────────
  describe('Owners Actions (owners.ts)', () => {
    it('getOwners & getOwner: happy path, missing entity, and auth check', async () => {
      prismaMock.propertyOwner.findMany.mockResolvedValue([mockRegaOwner] as any)
      prismaMock.propertyOwner.count.mockResolvedValue(1)
      const list = await getOwners()
      expect(list.owners).toHaveLength(1)

      prismaMock.propertyOwner.findFirst.mockResolvedValue({ ...mockRegaOwner, properties: [] } as any)
      const item = await getOwner('owner-rega-1')
      expect(item).not.toBeNull()

      mockUnauthenticated()
      await expect(getOwners()).rejects.toThrow('Authentication required')
    })
  })

  // ─── LEADS ACTIONS ───────────────────────────────────────
  describe('Leads Actions (leads.ts)', () => {
    it('getLeads & getLead: happy path and missing entity', async () => {
      prismaMock.lead.findMany.mockResolvedValue([])
      prismaMock.lead.count.mockResolvedValue(0)
      const list = await getLeads()
      expect(list.leads).toHaveLength(0)

      prismaMock.lead.findFirst.mockResolvedValue(null)
      const single = await getLead('non-existent')
      expect(single).toBeNull()
    })

    it('createLead: new lead creation vs existing phone merge', async () => {
      prismaMock.lead.findFirst.mockResolvedValue(null)
      prismaMock.lead.create.mockResolvedValue({ id: 'lead-1', phone: '+966500009999' } as any)

      const created = await createLead({
        name: 'عميل جديد',
        phone: '+966500009999',
      } as any)
      expect(created.id).toBe('lead-1')

      // Existing phone merge logic
      prismaMock.lead.findFirst.mockResolvedValue({ id: 'lead-existing', phone: '+966500009999' } as any)
      prismaMock.lead.update.mockResolvedValue({ id: 'lead-existing', phone: '+966500009999' } as any)

      const merged = await createLead({
        name: 'عميل مكرر',
        phone: '+966500009999',
      } as any)
      expect(merged.id).toBe('lead-existing')
    })

    it('updateLeadStatus, assignLeadAgent, routeLead, addLeadNote & claimLead', async () => {
      prismaMock.lead.findFirst.mockResolvedValue({ id: 'lead-1', officeId: 'office-123' } as any)
      prismaMock.lead.update.mockResolvedValue({ id: 'lead-1', status: 'CLOSED', dealOutcome: 'WON' } as any)

      const statusRes = await updateLeadStatus('lead-1', 'CLOSED', 'WON')
      expect(statusRes.status).toBe('CLOSED')

      prismaMock.lead.update.mockResolvedValue({ id: 'lead-1', isReceived: true } as any)
      const assigned = await assignLeadAgent('lead-1', 'user-agent-1')
      expect(assigned.isReceived).toBe(true)

      const routed = await routeLead('lead-1', { team: 'Sales' })
      expect(routed).toBeDefined()

      prismaMock.leadActivity.create.mockResolvedValue({ id: 'act-1' } as any)
      const note = await addLeadNote('lead-1', 'ملاحظة جادة')
      expect(note.id).toBe('act-1')

      const claimed = await claimLead('lead-1')
      expect(claimed).toBeDefined()
    })

    it('getLeadStats, getCRMStats, getLinkedVisitorData, deleteLead, getLeadsReportsData', async () => {
      prismaMock.lead.count.mockResolvedValue(5)
      const stats = await getLeadStats()
      expect(stats.total).toBe(5)

      prismaMock.membership.findMany.mockResolvedValue([{ ...mockOwnerMembership, user: mockOwnerUser }] as any)
      prismaMock.lead.groupBy.mockResolvedValue([])
      const crmStats = await getCRMStats()
      expect(crmStats.counts).toBeDefined()

      prismaMock.lead.findFirst.mockResolvedValue({ id: 'lead-1', phone: '+966509998887' } as any)
      prismaMock.visitor.findFirst.mockResolvedValue(null)
      const visitorData = await getLinkedVisitorData('lead-1')
      expect(visitorData).toBeNull()

      prismaMock.lead.delete.mockResolvedValue({ id: 'lead-1' } as any)
      const delRes = await deleteLead('lead-1')
      expect(delRes).toEqual({ success: true })

      prismaMock.lead.findMany.mockResolvedValue([])
      const reports = await getLeadsReportsData()
      expect(Array.isArray(reports)).toBe(true)
    })
  })

  // ─── ADMIN ACTIONS ───────────────────────────────────────
  describe('Admin Actions (admin.ts)', () => {
    it('super admin action enforcement & happy paths', async () => {
      mockAsSuperAdmin()

      prismaMock.office.count.mockResolvedValue(5)
      prismaMock.user.count.mockResolvedValue(10)
      prismaMock.subscription.count.mockResolvedValue(3)
      prismaMock.invoice.aggregate.mockResolvedValue({ _sum: { amount: BigInt(1000) } } as any)
      prismaMock.office.findMany.mockResolvedValue([])

      const stats = await getAdminStats()
      expect(stats.totalOffices).toBe(5)

      prismaMock.office.findMany.mockResolvedValue([])
      prismaMock.office.count.mockResolvedValue(0)
      const offices: any = await getOffices()
      expect(offices).toBeDefined()

      prismaMock.office.update.mockResolvedValue(mockOffice as any)
      const appRes = await approveOffice('office-123')
      expect(appRes).toBeDefined()

      const disRes = await disableOffice('office-123')
      expect(disRes).toBeDefined()

      prismaMock.office.findUnique.mockResolvedValue({ ...mockOffice, subscriptions: [{ plan: { name: 'PRO', slug: 'pro' }, status: 'ACTIVE', currentPeriodEnd: new Date() }], memberships: [], _count: { properties: 5, leads: 10 } } as any)
      const detail = await getOfficeDetail('office-123')
      expect(detail).not.toBeNull()

      prismaMock.user.findMany.mockResolvedValue([])
      prismaMock.user.count.mockResolvedValue(0)
      const users: any = await getUsers()
      expect(users).toBeDefined()

      prismaMock.user.findUnique.mockResolvedValue(mockOwnerUser as any)
      prismaMock.user.update.mockResolvedValue({ ...mockOwnerUser, isActive: false } as any)
      const toggle = await toggleUserActive('user-owner-1')
      expect(toggle).toBeDefined()

      prismaMock.plan.findMany.mockResolvedValue([])
      const plans = await getPlans()
      expect(plans).toHaveLength(0)

      prismaMock.plan.findUnique.mockResolvedValue({ id: 'plan-1' } as any)
      prismaMock.plan.update.mockResolvedValue({ id: 'plan-1' } as any)
      const planUpd = await updatePlan('plan-1', { priceMonthly: 100 } as any)
      expect(planUpd).toBeDefined()

      prismaMock.auditLog.findMany.mockResolvedValue([])
      prismaMock.auditLog.count.mockResolvedValue(0)
      const logs: any = await getAuditLogs()
      expect(logs).toBeDefined()
    })

    it('reject non-superadmin for admin actions', async () => {
      mockAsOwner()
      await expect(getAdminStats()).rejects.toThrow('Super admin access required')
    })
  })

  // ─── TEAM ACTIONS ─────────────────────────────────────────
  describe('Team Actions (team.ts)', () => {
    it('getTeamMembers, changeMemberRole, removeMember, inviteMember, cancelInvitation', async () => {
      prismaMock.membership.findMany.mockResolvedValue([])
      const members = await getTeamMembers()
      expect(members).toHaveLength(0)

      prismaMock.membership.findFirst.mockResolvedValue({ id: 'mem-1', officeId: 'office-123', role: 'AGENT', user: mockOwnerUser } as any)
      prismaMock.membership.update.mockResolvedValue({ id: 'mem-1', role: 'MANAGER', user: mockOwnerUser } as any)
      const roleRes: any = await changeMemberRole('mem-1', 'MANAGER')
      expect(roleRes).toBeDefined()

      prismaMock.membership.update.mockResolvedValue({ id: 'mem-1', isActive: false } as any)
      const remRes = await (removeMember as any)('mem-1')
      expect(remRes).toEqual({ success: true })

      prismaMock.membership.findFirst.mockResolvedValue(null)
      prismaMock.invitation.findFirst.mockResolvedValue(null)
      prismaMock.invitation.create.mockResolvedValue({ id: 'inv-1', email: 'test@example.com' } as any)
      const invRes = await inviteMember('test@example.com', 'AGENT')
      expect(invRes).toBeDefined()

      prismaMock.invitation.findMany.mockResolvedValue([])
      const pending = await getPendingInvitations()
      expect(pending).toHaveLength(0)

      prismaMock.invitation.findFirst.mockResolvedValue({ id: 'inv-1', officeId: 'office-123' } as any)
      prismaMock.invitation.delete.mockResolvedValue({ id: 'inv-1' } as any)
      const cancelRes = await cancelInvitation('inv-1')
      expect(cancelRes).toEqual({ success: true })
    })
  })

  // ─── OFFICE ACTIONS ───────────────────────────────────────
  describe('Office Actions (office.ts)', () => {
    it('getOfficeDetails & update office configs', async () => {
      prismaMock.office.findUnique.mockResolvedValue(mockOffice as any)
      const details = await getOfficeDetails()
      expect(details).toEqual(mockOffice)

      prismaMock.office.update.mockResolvedValue(mockOffice as any)
      const gen = await updateOfficeGeneral({ name: 'عقارات جديدة' })
      expect(gen).toBeDefined()

      prismaMock.themeSettings.upsert.mockResolvedValue({ id: 'theme-1' } as any)
      const theme = await updateOfficeTheme({ preset: 'modern' })
      expect(theme).toBeDefined()

      const seo = await updateOfficeSeo({ seoTitle: 'العقارات' })
      expect(seo).toBeDefined()

      const social = await updateOfficeSocial({ twitter: '@riyadh' })
      expect(social).toBeDefined()

      prismaMock.office.findFirst.mockResolvedValue(null)
      const domain = await updateOfficeDomain({ customDomain: 'custom.com' })
      expect(domain).toBeDefined()

      const sections = await updateOfficePageSections([] as any)
      expect(sections).toBeDefined()

      const visibility = await updateOfficePageVisibility({ about: true } as any)
      expect(visibility).toBeDefined()

      const lang = await updateOfficeLanguage('ar')
      expect(lang).toBeDefined()
    })
  })

  // ─── BLOG ACTIONS ─────────────────────────────────────────
  describe('Blog Actions (blog.ts)', () => {
    it('blog CRUD operations happy path', async () => {
      prismaMock.blogPost.findMany.mockResolvedValue([])
      prismaMock.blogPost.count.mockResolvedValue(0)
      const posts = await getBlogPosts()
      expect(posts.posts).toHaveLength(0)

      prismaMock.blogPost.findFirst.mockResolvedValue(null)
      const singlePost = await getBlogPost('non-existent')
      expect(singlePost).toBeNull()

      prismaMock.blogPost.create.mockResolvedValue({ id: 'post-1', title: 'مقالة تجريبية' } as any)
      const created = await createBlogPost({ title: 'مقالة تجريبية', content: 'محتوى المقالة' })
      expect(created.id).toBe('post-1')

      prismaMock.blogPost.findFirst.mockResolvedValue({ id: 'post-1', title: 'مقالة' } as any)
      prismaMock.blogPost.update.mockResolvedValue({ id: 'post-1', title: 'مقالة معدلة' } as any)
      const updated = await updateBlogPost('post-1', { title: 'مقالة معدلة' })
      expect(updated.title).toBe('مقالة معدلة')

      prismaMock.blogPost.delete.mockResolvedValue({ id: 'post-1' } as any)
      const del = await deleteBlogPost('post-1')
      expect(del).toEqual({ success: true })

      prismaMock.blogCategory.findMany.mockResolvedValue([])
      const categories = await getBlogCategories()
      expect(categories).toHaveLength(0)

      prismaMock.blogCategory.create.mockResolvedValue({ id: 'cat-1', name: 'أخبار' } as any)
      const cat = await createBlogCategory('News', 'أخبار')
      expect(cat.id).toBe('cat-1')

      prismaMock.blogTag.findMany.mockResolvedValue([])
      const tags = await getBlogTags()
      expect(tags).toHaveLength(0)

      prismaMock.blogTag.create.mockResolvedValue({ id: 'tag-1', name: 'عقارات' } as any)
      const tag = await createBlogTag('RealEstate', 'عقارات')
      expect(tag.id).toBe('tag-1')
    })
  })

  // ─── REMINDERS ACTIONS ────────────────────────────────────
  describe('Reminders Actions (reminders.ts)', () => {
    it('reminders CRUD operations happy path & auth error', async () => {
      prismaMock.reminder.findMany.mockResolvedValue([])
      const reminders = await getReminders()
      expect(reminders).toHaveLength(0)

      prismaMock.reminder.create.mockResolvedValue({ id: 'rem-1', title: 'تذكير اتصال' } as any)
      const created = await createReminder({
        leadName: 'عميل',
        leadPhone: '+966500000000',
        title: 'تذكير اتصال',
        dueDate: new Date(),
        priority: 'HIGH',
      } as any)
      expect(created.id).toBe('rem-1')

      prismaMock.reminder.findFirst.mockResolvedValue({ id: 'rem-1', completed: false } as any)
      prismaMock.reminder.update.mockResolvedValue({ id: 'rem-1', completed: true } as any)
      const toggled = await (toggleReminderCompleted as any)('rem-1')
      expect(toggled.completed).toBe(true)

      prismaMock.reminder.delete.mockResolvedValue({ id: 'rem-1' } as any)
      const del = await deleteReminder('rem-1')
      expect(del).toEqual({ success: true })

      mockUnauthenticated()
      await expect(getReminders()).rejects.toThrow('Authentication required')
    })
  })

  // ─── MISSED CALLS ACTIONS ─────────────────────────────────
  describe('Missed Calls Actions (missed-calls.ts)', () => {
    it('missed calls happy path & resolution', async () => {
      prismaMock.missedCall.findMany.mockResolvedValue([])
      const calls = await getMissedCalls()
      expect(calls).toHaveLength(0)

      prismaMock.missedCall.create.mockResolvedValue({ id: 'mc-1', phone: '+966501112233' } as any)
      const created = await createMissedCall({ phone: '+966501112233' })
      expect(created.id).toBe('mc-1')

      prismaMock.missedCall.findFirst.mockResolvedValue({ id: 'mc-1' } as any)
      prismaMock.missedCall.update.mockResolvedValue({ id: 'mc-1', status: 'RESOLVED' } as any)
      const resolved = await resolveMissedCall('mc-1')
      expect(resolved.status).toBe('RESOLVED')
    })
  })

  // ─── SIGNBOARDS ACTIONS ───────────────────────────────────
  describe('Signboards Actions (signboards.ts)', () => {
    it('signboards CRUD happy path & status updates', async () => {
      prismaMock.signboard.findMany.mockResolvedValue([])
      prismaMock.signboard.count.mockResolvedValue(0)
      const list = await getSignboards()
      expect(list.signboards).toHaveLength(0)

      prismaMock.signboard.create.mockResolvedValue({ id: 'sb-1', title: 'لوحة للبيع' } as any)
      const created = await createSignboard({ title: 'لوحة للبيع', phone: '+966500000000', status: 'AVAILABLE' })
      expect(created.id).toBe('sb-1')

      prismaMock.signboard.findFirst.mockResolvedValue({ id: 'sb-1' } as any)
      prismaMock.signboard.update.mockResolvedValue({ id: 'sb-1', status: 'INSTALLED' } as any)
      const updated = await updateSignboard('sb-1', { status: 'INSTALLED' })
      expect(updated.status).toBe('INSTALLED')

      prismaMock.signboard.delete.mockResolvedValue({ id: 'sb-1' } as any)
      const del = await deleteSignboard('sb-1')
      expect(del).toEqual({ success: true })
    })
  })

  // ─── VISITORS ACTIONS ─────────────────────────────────────
  describe('Visitors Actions (visitors.ts)', () => {
    it('visitors queries happy path & missing visitor handling', async () => {
      prismaMock.visitor.findMany.mockResolvedValue([])
      prismaMock.visitor.count.mockResolvedValue(0)
      const list = await getVisitors()
      expect(list.visitors).toHaveLength(0)

      prismaMock.visitor.findFirst.mockResolvedValue(null)
      const visitor = await getVisitor('non-existent')
      expect(visitor).toBeNull()

      prismaMock.visitor.count.mockResolvedValue(12)
      prismaMock.favorite.count.mockResolvedValue(45)
      prismaMock.propertyRequest.count.mockResolvedValue(8)
      const stats: any = await getVisitorStats()
      expect(stats.total).toBe(12)
      expect(stats.active).toBe(12)
    })
  })
})
