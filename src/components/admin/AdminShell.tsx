'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  FileText,
  LogOut,
  Menu,
  X,
  Shield,
  Mail,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/shared/Logo'

// ─── Types ────────────────────────────────────────────────────

interface AdminShellProps {
  user: {
    id: string
    name: string
    email: string
  }
  children: React.ReactNode
}

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

// ─── Nav Items ────────────────────────────────────────────────

const navItems: NavItem[] = [
  {
    label: 'لوحة التحكم',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'المكاتب',
    href: '/admin/offices',
    icon: Building2,
  },
  {
    label: 'المستخدمين',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'الخطط',
    href: '/admin/plans',
    icon: CreditCard,
  },
  {
    label: 'الرسائل',
    href: '/admin/messages',
    icon: Mail,
  },
  {
    label: 'سجل المراجعة',
    href: '/admin/audit',
    icon: FileText,
  },
]

// ─── Component ────────────────────────────────────────────────

export function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  // ─── Sidebar Content ────────────────────────────────────

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo Section */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5">
        <Logo size="sm" variant="light" />
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary tracking-wide">FALZ</span>
            <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-300">
              مشرف
            </span>
          </div>
        )}
      </div>

      {/* Admin Badge */}
      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-red-400/30 bg-red-500/10 text-red-300">
            <Shield className="h-4 w-4" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {user.name}
              </p>
              <p className="truncate text-xs text-white/50">المشرف العام</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-white/15 text-primary shadow-sm'
                      : 'text-white/60 hover:bg-white/10 hover:text-white',
                    sidebarCollapsed && 'justify-center px-2'
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0 transition-colors',
                      active
                        ? 'text-primary'
                        : 'text-white/50 group-hover:text-white'
                    )}
                  />
                  {!sidebarCollapsed && (
                    <span>{item.label}</span>
                  )}
                  {active && !sidebarCollapsed && (
                    <div className="ms-auto h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Back to Dashboard */}
      <div className="border-t border-white/10 px-3 py-3">
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white',
            sidebarCollapsed && 'justify-center px-2'
          )}
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          {!sidebarCollapsed && <span>العودة للوحة التحكم</span>}
        </Link>
      </div>

      {/* Collapse Toggle (Desktop) */}
      <div className="hidden border-t border-white/10 px-3 py-3 lg:block">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span>طي</span>
            </>
          )}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-page">
      {/* Desktop Sidebar - Navy for admin distinction */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-e border-[#1A2F4A]/20 bg-[#1A2F4A] transition-all duration-300',
          sidebarCollapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 border-e border-[#1A2F4A]/20 bg-[#1A2F4A] transition-transform duration-300 lg:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-edge bg-elevated px-4 lg:px-6">
          {/* Left side */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              className="rounded-lg p-2 text-body transition-colors hover:bg-card-hover hover:text-heading lg:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <h2 className="text-sm font-medium text-body">
              إدارة المنصة
            </h2>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-heading">{user.name}</p>
              <p className="text-xs text-dim">{user.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="rounded-lg p-2 text-body transition-colors hover:bg-red-50 hover:text-red-500"
              title="تسجيل الخروج"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
