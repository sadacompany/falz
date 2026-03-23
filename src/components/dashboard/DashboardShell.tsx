'use client'

import { useState, useCallback, useEffect } from 'react'
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
  Globe,
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/shared/Logo'
import type { Role } from '@prisma/client'

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
  },
  {
    label: 'Leads',
    labelAr: 'العملاء',
    href: '/dashboard/leads',
    icon: Users,
  },
  {
    label: 'Requests',
    labelAr: 'الطلبات',
    href: '/dashboard/requests',
    icon: MessageSquare,
    roles: ['OWNER', 'MANAGER'],
  },
  {
    label: 'Visitors',
    labelAr: 'الزوار',
    href: '/dashboard/visitors',
    icon: UserCheck,
    roles: ['OWNER', 'MANAGER'],
  },
  {
    label: 'Analytics',
    labelAr: 'التحليلات',
    href: '/dashboard/analytics',
    icon: BarChart3,
    roles: ['OWNER', 'MANAGER'],
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
  const [locale, setLocale] = useState<'ar' | 'en'>('ar')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [expandedNav, setExpandedNav] = useState<string | null>(
    // Auto-expand if we're on a settings page
    null
  )
  const isRtl = locale === 'ar'

  // Close mobile menu on route change, auto-expand active sub-nav
  useEffect(() => {
    setMobileMenuOpen(false)
    // Auto-expand nav items with sub-items when active
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

  const toggleLocale = useCallback(() => {
    setLocale((l) => (l === 'ar' ? 'en' : 'ar'))
    document.cookie = `falz-locale=${locale === 'ar' ? 'en' : 'ar'}; path=/; max-age=31536000`
  }, [locale])

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  )

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  // ─── Sidebar Content ────────────────────────────────────

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo Section */}
      <div className="flex items-center gap-3 border-b border-[#2D2822] px-4 py-5">
        <Logo size="sm" variant="dark" />
        {!sidebarCollapsed && (
          <span className="text-lg font-bold text-[#C8A96E] tracking-wide">
            FALZ
          </span>
        )}
      </div>

      {/* Office Info */}
      <div className="border-b border-[#2D2822] px-4 py-4">
        <div className="flex items-center gap-3">
          {office.logo ? (
            <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg border border-[#2D2822]">
              <Image
                src={office.logo}
                alt={office.nameAr || office.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[#2D2822] bg-[#C8A96E]/10 text-[#C8A96E]">
              <Building2 className="h-4 w-4" />
            </div>
          )}
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#E8E0D0]">
                {locale === 'ar' ? (office.nameAr || office.name) : office.name}
              </p>
              <p className="truncate text-xs text-[#5A5040]">
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
                        'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#C8A96E] focus-visible:ring-offset-1',
                        active
                          ? 'bg-[#C8A96E]/10 text-[#C8A96E] border-e-2 border-[#C8A96E]'
                          : 'text-[#8A7E5E] hover:bg-[#252119] hover:text-[#E8E0D0]'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5 flex-shrink-0 transition-colors',
                          active
                            ? 'text-[#C8A96E]'
                            : 'text-[#5A5040] group-hover:text-[#E8E0D0]'
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
                          const currentTab = searchParams.get('tab')
                          const subUrl = new URL(sub.href, 'http://x')
                          const subTab = subUrl.searchParams.get('tab')
                          const subActive = pathname === subUrl.pathname && (currentTab || null) === (subTab || null)
                          return (
                            <li key={sub.href}>
                              <Link
                                href={sub.href}
                                className={cn(
                                  'block rounded-lg px-3 py-2 text-sm transition-all duration-200',
                                  subActive
                                    ? 'text-[#C8A96E] font-medium'
                                    : 'text-[#8A7E5E] hover:bg-[#252119] hover:text-[#E8E0D0]'
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
                        ? 'bg-[#C8A96E]/10 text-[#C8A96E] border-e-2 border-[#C8A96E]'
                        : 'text-[#8A7E5E] hover:bg-[#252119] hover:text-[#E8E0D0]',
                      sidebarCollapsed && 'justify-center px-2'
                    )}
                    title={sidebarCollapsed ? (locale === 'ar' ? item.labelAr : item.label) : undefined}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 flex-shrink-0 transition-colors',
                        active
                          ? 'text-[#C8A96E]'
                          : 'text-[#5A5040] group-hover:text-[#E8E0D0]'
                      )}
                    />
                    {!sidebarCollapsed && (
                      <span>{locale === 'ar' ? item.labelAr : item.label}</span>
                    )}
                    {active && !sidebarCollapsed && (
                      <div className="ms-auto h-1.5 w-1.5 rounded-full bg-[#C8A96E]" />
                    )}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* View Public Site */}
      <div className="border-t border-[#2D2822] px-3 py-3">
        <Link
          href={`/${office.slug}`}
          target="_blank"
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#8A7E5E] transition-colors hover:bg-[#252119] hover:text-[#E8E0D0]',
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
      <div className="hidden border-t border-[#2D2822] px-3 py-3 lg:block">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? (locale === 'ar' ? 'توسيع القائمة' : 'Expand sidebar') : (locale === 'ar' ? 'طي القائمة' : 'Collapse sidebar')}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-[#8A7E5E] transition-colors hover:bg-[#252119] hover:text-[#E8E0D0] focus-visible:ring-2 focus-visible:ring-[#C8A96E] focus-visible:ring-offset-1"
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
      className="flex h-screen overflow-hidden bg-[#110F0D]"
    >
      {/* ── Desktop Sidebar ──────────────────────────── */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-e border-[#2D2822] bg-[#1A1714] transition-all duration-300',
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
          'fixed top-0 z-50 h-full w-64 border-e border-[#2D2822] bg-[#1A1714] transition-transform duration-300 lg:hidden',
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
        <header className="flex h-16 items-center justify-between border-b border-[#2D2822] bg-[#1A1714] px-4 lg:px-6">
          {/* Left side */}
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={locale === 'ar' ? (mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة') : (mobileMenuOpen ? 'Close menu' : 'Open menu')}
              className="rounded-lg p-2 text-[#8A7E5E] transition-colors hover:bg-[#252119] hover:text-[#E8E0D0] focus-visible:ring-2 focus-visible:ring-[#C8A96E] focus-visible:ring-offset-1 lg:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Search */}
            <div className="hidden items-center gap-2 rounded-lg border border-[#2D2822] bg-[#110F0D] px-3 py-2 sm:flex">
              <Search className="h-4 w-4 text-[#5A5040]" />
              <input
                type="text"
                placeholder={locale === 'ar' ? 'بحث...' : 'Search...'}
                aria-label={locale === 'ar' ? 'بحث' : 'Search'}
                className="w-48 bg-transparent text-sm text-[#E8E0D0] placeholder:text-[#5A5040] focus:outline-none lg:w-64"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLocale}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-[#8A7E5E] transition-colors hover:bg-[#252119] hover:text-[#E8E0D0]"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">
                {locale === 'ar' ? 'EN' : 'AR'}
              </span>
            </button>

            {/* Notifications */}
            <button
              aria-label={locale === 'ar' ? 'الإشعارات' : 'Notifications'}
              className="relative rounded-lg p-2 text-[#8A7E5E] transition-colors hover:bg-[#252119] hover:text-[#E8E0D0] focus-visible:ring-2 focus-visible:ring-[#C8A96E] focus-visible:ring-offset-1"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute end-1 top-1 h-2 w-2 rounded-full bg-[#C8A96E]" />
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
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-[#252119] focus-visible:ring-2 focus-visible:ring-[#C8A96E] focus-visible:ring-offset-1"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C8A96E]/10 text-[#C8A96E]">
                  <User className="h-4 w-4" />
                </div>
                <div className="hidden text-start sm:block">
                  <p className="text-sm font-medium text-[#E8E0D0]">
                    {user.name}
                  </p>
                  <p className="text-xs text-[#5A5040]">
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
                    'absolute top-full mt-2 w-56 rounded-xl border border-[#2D2822] bg-[#1A1714] py-1 shadow-lg',
                    isRtl ? 'left-0' : 'right-0'
                  )}
                >
                  <div className="border-b border-[#2D2822] px-4 py-3">
                    <p className="text-sm font-medium text-[#E8E0D0]">
                      {user.name}
                    </p>
                    <p className="text-xs text-[#5A5040]">{user.email}</p>
                  </div>

                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#8A7E5E] transition-colors hover:bg-[#252119] hover:text-[#E8E0D0]"
                  >
                    <Settings className="h-4 w-4" />
                    {locale === 'ar' ? 'الإعدادات' : 'Settings'}
                  </Link>

                  <div className="border-t border-[#2D2822]">
                    <button
                      onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-500/10"
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
    </div>
  )
}
