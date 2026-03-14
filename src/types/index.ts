import type { Role } from '@prisma/client'

// ─── Session / Auth Types ──────────────────────────────────

export interface SessionUser {
  id: string
  email: string
  name: string
  isSuperAdmin: boolean
}

declare module 'next-auth' {
  interface Session {
    user: SessionUser
  }

  interface User {
    id: string
    email: string
    name: string
    isSuperAdmin: boolean
    isActive: boolean
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    userId: string
    email: string
    name: string
    isSuperAdmin: boolean
  }
}

// ─── Membership ─────────────────────────────────────────────

export interface MembershipInfo {
  id: string
  officeId: string
  role: Role
  isActive: boolean
  office: {
    id: string
    name: string
    nameAr: string | null
    slug: string
    logo: string | null
  }
}

export interface AuthenticatedUser extends SessionUser {
  memberships: MembershipInfo[]
}

// ─── API Response Types ─────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = unknown> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  success: false
  error: string
  code?: string
  details?: Record<string, string[]>
}

// ─── Storage Types ──────────────────────────────────────────

export interface UploadResult {
  url: string
  path: string
  filename: string
  size: number
  mimeType: string
}

// ─── Email Types ────────────────────────────────────────────

export interface EmailPayload {
  to: string
  subject: string
  html: string
}

export interface InvitationEmailData {
  recipientEmail: string
  officeName: string
  inviterName: string
  role: Role
  inviteUrl: string
}

export interface LeadNotificationEmailData {
  agentEmail: string
  agentName: string
  leadName: string
  leadPhone?: string | null
  leadEmail?: string | null
  leadMessage?: string | null
  propertyTitle?: string | null
  officeName: string
  dashboardUrl: string
}

// ─── Audit Types ────────────────────────────────────────────

export interface AuditLogEntry {
  officeId: string
  userId?: string | null
  action: string
  entity?: string | null
  entityId?: string | null
  details?: Record<string, unknown> | null
  ip?: string | null
}

// ─── Analytics Types ────────────────────────────────────────

export type AnalyticsEventType =
  | 'page_view'
  | 'property_view'
  | 'lead_submit'
  | 'whatsapp_click'
  | 'phone_click'
  | 'share_click'
  | 'gallery_view'
  | 'tour360_view'
  | 'contact_form_open'
  | 'search'

export type ReferrerCategory = 'direct' | 'social' | 'search' | 'referral'

export interface AnalyticsEventData {
  officeId: string
  propertyId?: string | null
  eventType: AnalyticsEventType | string
  sessionId?: string | null
  visitorId?: string | null
  referrer?: string | null
  userAgent?: string | null
  ip?: string | null
  page?: string | null
  metadata?: Record<string, unknown> | null
}

// ─── Tenant Types ───────────────────────────────────────────

export interface OfficeWithTheme {
  id: string
  name: string
  nameAr: string | null
  slug: string
  logo: string | null
  description: string | null
  descriptionAr: string | null
  customDomain: string | null
  subdomain: string | null
  defaultLanguage: string
  isActive: boolean
  isApproved: boolean
  themeSettings: {
    preset: string
    primaryColor: string | null
    accentColor: string | null
    backgroundColor: string | null
    textColor: string | null
    mutedTextColor: string | null
    fontFamily: string | null
    fontFamilyAr: string | null
    borderRadius: string | null
    cardStyle: string | null
  } | null
}

// ─── Utility Types ──────────────────────────────────────────

export type Locale = 'ar' | 'en'

export interface SearchParams {
  page?: string
  pageSize?: string
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
  [key: string]: string | string[] | undefined
}
