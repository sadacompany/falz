'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  FileText,
  MessageSquare,
  UserPlus,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  ExternalLink,
  CreditCard,
  UserCheck,
  PhoneMissed,
  Signpost,
  Plus,
  Check,
  PhoneCall,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/shared/Logo'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import type { Role } from '@prisma/client'
import { getMissedCalls, createMissedCall, resolveMissedCall } from '@/lib/actions/missed-calls'

// ─── Types ──────────────────────────────────────────────────

interface DashboardShellProps {
  user: {
    id: string
    name: string
    email: string
    isSuperAdmin: boolean
  }
  office: {
    id: string
    name: string
    nameAr: string | null
    slug: string
    logo: string | null
  }
  role: Role
  children: React.ReactNode
}

interface NavSubItem {
  label: string
  labelAr: string
  href: string
}

interface NavItem {
  label: string
  labelAr: string
  href: string
  icon: React.ElementType
  roles?: Role[]
  subItems?: NavSubItem[]
}

// ─── Nav Items ──────────────────────────────────────────────

const navItems: NavItem[] = [
  {
    label: 'Overview',
    labelAr: 'نظرة عامة',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Properties',
    labelAr: 'العقارات',
    href: '/dashboard/properties',
    icon: Building2,
    subItems: [
      { label: 'Residential', labelAr: 'سكني', href: '/dashboard/properties?category=RESIDENTIAL' },
      { label: 'Commercial', labelAr: 'تجاري', href: '/dashboard/properties?category=COMMERCIAL' },
      { label: 'Agricultural', labelAr: 'زراعي', href: '/dashboard/properties?category=AGRICULTURAL' },
      { label: 'Owners', labelAr: 'إدارة الملاك', href: '/dashboard/properties/owners' },
    ],
  },
  {
    label: 'CRM',
    labelAr: 'العملاء (CRM)',
    href: '/dashboard/leads',
    icon: Users,
    subItems: [
      { label: 'Board', labelAr: 'لوحة المتابعة', href: '/dashboard/leads/board' },
      { label: 'Leads List', labelAr: 'قائمة العملاء', href: '/dashboard/leads' },
      { label: 'Queue', labelAr: 'قائمة الانتظار', href: '/dashboard/leads/queue' },
      { label: 'Reminders', labelAr: 'التذكيرات', href: '/dashboard/leads/reminders' },
      { label: 'Analytics', labelAr: 'التقارير والتحليلات', href: '/dashboard/leads/reports' },
      { label: 'Visitors', labelAr: 'الزوار', href: '/dashboard/visitors' },
      { label: 'Requests', labelAr: 'الطلبـات', href: '/dashboard/requests' },
    ],
  },
  {
    label: 'Signboards',
    labelAr: 'اللوحات الإعلانية',
    href: '/dashboard/signboards',
    icon: Signpost,
  },
  {
    label: 'Team',
    labelAr: 'الفريق',
    href: '/dashboard/team',
    icon: UserPlus,
    roles: ['OWNER', 'MANAGER'],
  },
  {
    label: 'Billing',
    labelAr: 'الفوترة',
    href: '/dashboard/billing',
    icon: CreditCard,
    roles: ['OWNER', 'MANAGER'],
  },
  {
    label: 'Settings',
    labelAr: 'الإعدادات',
    href: '/dashboard/settings',
    icon: Settings,
    roles: ['OWNER', 'MANAGER'],
    subItems: [
      { label: 'General', labelAr: 'عام', href: '/dashboard/settings' },
      { label: 'Visual Editor', labelAr: 'المحرر المرئي', href: '/dashboard/settings?tab=editor' },
      { label: 'Domain', labelAr: 'النطاق', href: '/dashboard/settings?tab=domain' },
      { label: 'SEO', labelAr: 'تحسين محركات البحث', href: '/dashboard/settings?tab=seo' },
      { label: 'Social', labelAr: 'التواصل الاجتماعي', href: '/dashboard/settings?tab=social' },
    ],
  },
]

// ─── Component ──────────────────────────────────────────────

export function DashboardShell({
  user,
  office,
  role,
  children,
}: DashboardShellProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locale = 'ar' as const
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [expandedNav, setExpandedNav] = useState<string | null>(null)
  const isRtl = locale === 'ar'

  // Missed Calls states
  const [missedCalls, setMissedCalls] = useState<any[]>([])
  const [missedCallsOpen, setMissedCallsOpen] = useState(false)
  const [newCallFormOpen, setNewCallFormOpen] = useState(false)
  const [newPhone, setNewPhone] = useState('')
  const [newName, setNewName] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [resolvingCallId, setResolvingCallId] = useState<string | null>(null)
  const [resolveNotes, setResolveNotes] = useState('')

  const fetchCalls = async () => {
    try {
      const list = await getMissedCalls()
      setMissedCalls(list)
    } catch (e) {
      console.error('Failed to load missed calls:', e)
    }
  }

  useEffect(() => {
    fetchCalls()
    const interval = setInterval(fetchCalls, 20000)
    return () => clearInterval(interval)
  }, [])

  const handleLogCall = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPhone.trim()) return
    try {
      await createMissedCall({
        phone: newPhone.trim(),
      })
      setNewPhone('')
      setNewCallFormOpen(false)
      fetchCalls()
    } catch (error) {
      console.error(error)
    }
  }

  const handleResolveCall = async (id: string) => {
    try {
      await resolveMissedCall(id)
      setResolvingCallId(null)
      fetchCalls()
    } catch (error) {
      console.error(error)
    }
  }

  const unresolvedCalls = missedCalls.filter((c) => c.status === 'PENDING')
  const resolvedCalls = missedCalls.filter((c) => c.status === 'RESOLVED')

  // Close mobile menu on route change, auto-expand active sub-nav
  useEffect(() => {
    setMobileMenuOpen(false)
    for (const item of navItems) {
      if (item.subItems && pathname.startsWith(item.href)) {
        setExpandedNav(item.href)
      }
    }
  }, [pathname])

  // Close user menu when clicking outside or pressing Escape
  useEffect(() => {
    if (!userMenuOpen) return
    const handleClick = () => setUserMenuOpen(false)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUserMenuOpen(false)
    }
    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [userMenuOpen])

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  )

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const isSubActive = (subHref: string) => {
    try {
      const subUrl = new URL(subHref, 'http://x')
      if (pathname !== subUrl.pathname) return false
      
      const subTab = subUrl.searchParams.get('tab')
      const currentTab = searchParams.get('tab')
      
      const subCategory = subUrl.searchParams.get('category')
      const currentCategory = searchParams.get('category')

      const subView = subUrl.searchParams.get('view')
      const currentView = searchParams.get('view')

      if (subTab !== currentTab) return false
      if (subCategory !== currentCategory) return false
      if (subView !== currentView) return false

      return true
    } catch (e) {
      return false
    }
  }

  // ─── Sidebar Content ────────────────────────────────────

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo Section */}
      <div className="flex items-center gap-3 border-b border-edge px-4 py-5">
        <Logo size="sm" />
        {!sidebarCollapsed && (
          <span className="text-lg font-bold text-heading tracking-wide">
            FAL<span className="text-primary">Z</span>
          </span>
        )}
      </div>

      {/* Office Info */}
      <div className="border-b border-edge px-4 py-4">
        <div className="flex items-center gap-3">
          {office.logo ? (
            <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg border border-edge">
              <Image
                src={office.logo}
                alt={office.nameAr || office.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-edge bg-card-hover text-primary">
              <Building2 className="h-4 w-4" />
            </div>
          )}
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-heading">
                {locale === 'ar' ? (office.nameAr || office.name) : office.name}
              </p>
              <p className="truncate text-xs text-dim">
                {office.slug}.falz.sa
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            const hasSubItems = item.subItems && !sidebarCollapsed
            const isExpanded = expandedNav === item.href

            return (
              <li key={item.href}>
                {hasSubItems ? (
                  <>
                    <button
                      onClick={() => setExpandedNav(isExpanded ? null : item.href)}
                      aria-expanded={isExpanded}
                      className={cn(
                        'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                        active
                          ? 'bg-card-hover text-primary border-e-2 border-primary'
                          : 'text-body hover:bg-card-hover hover:text-heading'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5 flex-shrink-0 transition-colors',
                          active
                            ? 'text-primary'
                            : 'text-dim group-hover:text-heading'
                        )}
                      />
                      <span>{locale === 'ar' ? item.labelAr : item.label}</span>
                      <ChevronDown
                        className={cn(
                          'ms-auto h-4 w-4 transition-transform duration-200',
                          isExpanded && 'rotate-180'
                        )}
                      />
                    </button>
                    {isExpanded && (
                      <ul className="mt-1 space-y-0.5 ps-8">
                        {item.subItems!.map((sub) => {
                          const subActive = isSubActive(sub.href)
                          return (
                            <li key={sub.href}>
                              <Link
                                href={sub.href}
                                className={cn(
                                  'block rounded-lg px-3 py-2 text-sm transition-all duration-200',
                                  subActive
                                    ? 'text-primary font-medium bg-card-hover border-e-2 border-primary'
                                    : 'text-body hover:bg-card-hover hover:text-heading'
                                )}
                              >
                                {locale === 'ar' ? sub.labelAr : sub.label}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      active
                        ? 'bg-card-hover text-primary border-e-2 border-primary'
                        : 'text-body hover:bg-card-hover hover:text-heading',
                      sidebarCollapsed && 'justify-center px-2'
                    )}
                    title={sidebarCollapsed ? (locale === 'ar' ? item.labelAr : item.label) : undefined}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 flex-shrink-0 transition-colors',
                        active
                          ? 'text-primary'
                          : 'text-dim group-hover:text-heading'
                      )}
                    />
                    {!sidebarCollapsed && (
                      <span>{locale === 'ar' ? item.labelAr : item.label}</span>
                    )}
                    {active && !sidebarCollapsed && (
                      <div className="ms-auto h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* View Public Site */}
      <div className="border-t border-edge px-3 py-3">
        <Link
          href={`/${office.slug}`}
          target="_blank"
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-body transition-colors hover:bg-card-hover hover:text-heading',
            sidebarCollapsed && 'justify-center px-2'
          )}
        >
          <ExternalLink className="h-4 w-4" />
          {!sidebarCollapsed && (
            <span>{locale === 'ar' ? 'عرض الموقع' : 'View Public Site'}</span>
          )}
        </Link>
      </div>

      {/* Collapse Toggle (Desktop) */}
      <div className="hidden border-t border-edge px-3 py-3 lg:block">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? (locale === 'ar' ? 'توسيع القائمة' : 'Expand sidebar') : (locale === 'ar' ? 'طي القائمة' : 'Collapse sidebar')}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-body transition-colors hover:bg-card-hover hover:text-heading focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span>{locale === 'ar' ? 'طي القائمة' : 'Collapse'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="flex h-screen overflow-hidden bg-page"
    >
      {/* ── Desktop Sidebar ──────────────────────────── */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-e border-edge bg-elevated transition-all duration-300',
          sidebarCollapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ────────────────────── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Mobile Sidebar Drawer ─────────────────────── */}
      <aside
        className={cn(
          'fixed top-0 z-50 h-full w-64 border-e border-edge bg-elevated transition-transform duration-300 lg:hidden',
          isRtl ? 'right-0' : 'left-0',
          mobileMenuOpen
            ? 'translate-x-0'
            : isRtl
              ? 'translate-x-full'
              : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>

      {/* ── Main Content ─────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-edge bg-elevated px-4 lg:px-6">
          {/* Left side */}
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={locale === 'ar' ? (mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة') : (mobileMenuOpen ? 'Close menu' : 'Open menu')}
              className="rounded-lg p-2 text-body transition-colors hover:bg-card-hover hover:text-heading focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 lg:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Search */}
            <div className="hidden items-center gap-2 rounded-lg border border-edge bg-input px-3 py-2 sm:flex">
              <Search className="h-4 w-4 text-dim" />
              <input
                type="text"
                placeholder={locale === 'ar' ? 'بحث...' : 'Search...'}
                aria-label={locale === 'ar' ? 'بحث' : 'Search'}
                className="w-48 bg-transparent text-sm text-heading placeholder:text-dim focus:outline-none lg:w-64"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Missed Calls Icon Button */}
            <button
              onClick={() => setMissedCallsOpen(true)}
              aria-label="المكالمات الفائتة"
              className="relative rounded-lg p-2 text-body transition-colors hover:bg-card-hover hover:text-heading focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
            >
              <PhoneMissed className="h-5 w-5 text-red-500" />
              {unresolvedCalls.length > 0 && (
                <span className="absolute -end-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-elevated animate-pulse">
                  {unresolvedCalls.length}
                </span>
              )}
            </button>

            <ThemeToggle />

            {/* Notifications */}
            <button
              aria-label={locale === 'ar' ? 'الإشعارات' : 'Notifications'}
              className="relative rounded-lg p-2 text-body transition-colors hover:bg-card-hover hover:text-heading focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute end-1 top-1 h-2 w-2 rounded-full bg-primary" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setUserMenuOpen(!userMenuOpen)
                }}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label={locale === 'ar' ? 'قائمة المستخدم' : 'User menu'}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-card-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-card-hover text-heading">
                  <User className="h-4 w-4" />
                </div>
                <div className="hidden text-start sm:block">
                  <p className="text-sm font-medium text-heading">
                    {user.name}
                  </p>
                  <p className="text-xs text-dim">
                    {role === 'OWNER'
                      ? locale === 'ar'
                        ? 'مالك'
                        : 'Owner'
                      : role === 'MANAGER'
                        ? locale === 'ar'
                          ? 'مدير'
                          : 'Manager'
                        : locale === 'ar'
                          ? 'وكيل'
                          : 'Agent'}
                  </p>
                </div>
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div
                  role="menu"
                  className={cn(
                    'absolute top-full mt-2 w-56 rounded-xl border border-edge bg-elevated py-1 shadow-lg z-50',
                    isRtl ? 'left-0' : 'right-0'
                  )}
                >
                  <div className="border-b border-edge px-4 py-3">
                    <p className="text-sm font-medium text-heading">
                      {user.name}
                    </p>
                    <p className="text-xs text-dim">{user.email}</p>
                  </div>

                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-body transition-colors hover:bg-card-hover hover:text-heading"
                  >
                    <Settings className="h-4 w-4" />
                    {locale === 'ar' ? 'الإعدادات' : 'Settings'}
                  </Link>

                  <div className="border-t border-edge">
                    <button
                      onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      {locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>

      {/* ── Missed Calls Modal ───────────────────────── */}
      {missedCallsOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setMissedCallsOpen(false)
              setNewCallFormOpen(false)
              setResolvingCallId(null)
            }}
          />
          <div
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-edge bg-elevated p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-edge pb-4 mb-4">
              <div className="flex items-center gap-2">
                <PhoneMissed className="h-6 w-6 text-red-500" />
                <h3 className="text-xl font-bold text-heading">المكالمات الفائتة</h3>
              </div>
              <button
                onClick={() => {
                  setMissedCallsOpen(false)
                  setNewCallFormOpen(false)
                  setResolvingCallId(null)
                }}
                className="rounded-lg p-1.5 text-dim hover:bg-card-hover hover:text-heading transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setNewCallFormOpen(!newCallFormOpen)}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-primary-hover transition-colors"
              >
                {newCallFormOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {newCallFormOpen ? 'إلغاء' : 'تسجيل مكالمة جديدة'}
              </button>
              <span className="text-xs text-dim">
                {unresolvedCalls.length} معلقة | {resolvedCalls.length} منتهية
              </span>
            </div>

            {/* Log New Call Form */}
            {newCallFormOpen && (
              <form onSubmit={handleLogCall} className="border border-edge rounded-xl p-4 bg-page mb-4 space-y-3">
                <h4 className="text-sm font-bold text-heading">تسجيل تفاصيل المكالمة</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-body mb-1">رقم الهاتف</label>
                    <input
                      type="tel"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="مثال: 0500000000"
                      className="w-full rounded-lg border border-edge bg-input px-3 py-2 text-sm text-heading placeholder:text-dim focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#C8A96E] hover:bg-[#B7985D] text-[#1E3A5F] py-2 text-sm font-bold shadow transition-colors"
                >
                  حفظ المكالمة
                </button>
              </form>
            )}

            {/* Call Logs Container */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {missedCalls.length === 0 ? (
                <div className="text-center py-8 text-dim">لا توجد مكالمات مسجلة حالياً.</div>
              ) : (
                missedCalls.map((call) => (
                  <div
                    key={call.id}
                    className={cn(
                      'border rounded-xl p-4 bg-card hover:bg-card-hover transition-all flex flex-col md:flex-row justify-between gap-3',
                      call.status === 'RESOLVED' ? 'border-edge opacity-70' : 'border-red-200 bg-red-50/5'
                    )}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-heading">{call.phone}</span>
                        {call.status === 'PENDING' ? (
                          <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">معلقة</span>
                        ) : (
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">تم الحل</span>
                        )}
                      </div>
                      <p className="text-sm text-body">مكالمة فائتة للوكيل: {call.user?.nameAr || call.user?.name || 'غير محدد'}</p>
                      <div className="flex items-center gap-4 text-xs text-dim">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(call.createdAt).toLocaleDateString('ar-SA-u-nu-latn')} {new Date(call.createdAt).toLocaleTimeString('ar-SA-u-nu-latn', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Resolve Actions */}
                    <div className="flex items-center justify-end">
                      {call.status === 'PENDING' && (
                        <>
                          {resolvingCallId === call.id ? (
                            <div className="flex flex-col gap-2 w-full md:w-48">
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleResolveCall(call.id)}
                                  className="flex-1 rounded bg-emerald-600 text-white py-1 text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1"
                                >
                                  <Check className="h-3.5 w-3.5" /> تأكيد الحل
                                </button>
                                <button
                                  onClick={() => {
                                    setResolvingCallId(null)
                                  }}
                                  className="rounded bg-page border border-edge text-body px-2 py-1 text-xs hover:bg-card-hover transition-colors"
                                >
                                  إلغاء
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setResolvingCallId(call.id)}
                              className="rounded border border-emerald-600 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1.5"
                            >
                              <PhoneCall className="h-3.5 w-3.5" /> حل المكالمة
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-edge pt-4 mt-4 flex justify-end">
              <button
                onClick={() => {
                  setMissedCallsOpen(false)
                  setNewCallFormOpen(false)
                  setResolvingCallId(null)
                }}
                className="rounded-lg border border-edge bg-page px-4 py-2 text-sm font-semibold text-body hover:bg-card-hover transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
