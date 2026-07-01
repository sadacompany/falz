'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Users,
  Kanban,
  UserCheck,
  Bell,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeadsHeaderProps {
  title: string
  description: string
  children?: React.ReactNode
}

export function LeadsHeader({ title, description, children }: LeadsHeaderProps) {
  const pathname = usePathname()

  const tabs = [
    {
      label: 'قائمة العملاء',
      href: '/dashboard/leads',
      icon: Users,
      active: pathname === '/dashboard/leads',
    },
    {
      label: 'لوحة المتابعة (Kanban)',
      href: '/dashboard/leads/board',
      icon: Kanban,
      active: pathname === '/dashboard/leads/board',
    },
    {
      label: 'طابور الانتظار',
      href: '/dashboard/leads/queue',
      icon: UserCheck,
      active: pathname === '/dashboard/leads/queue',
    },
    {
      label: 'التذكيرات',
      href: '/dashboard/leads/reminders',
      icon: Bell,
      active: pathname === '/dashboard/leads/reminders',
    },
    {
      label: 'التقارير والتحليلات',
      href: '/dashboard/leads/reports',
      icon: BarChart3,
      active: pathname === '/dashboard/leads/reports',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">{title}</h1>
          <p className="mt-1 text-sm text-dim">{description}</p>
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>

      {/* Tabs Sub-Navigation */}
      <div className="border-b border-edge">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'group flex items-center gap-2 border-b-2 px-1 pb-4 text-sm font-medium transition-all duration-200 whitespace-nowrap',
                  tab.active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-body hover:border-dim hover:text-heading'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 transition-colors',
                    tab.active ? 'text-primary' : 'text-dim group-hover:text-heading'
                  )}
                />
                <span>{tab.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
