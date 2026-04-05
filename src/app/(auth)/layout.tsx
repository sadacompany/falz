import type { Metadata } from 'next'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

export const metadata: Metadata = {
  title: 'FALZ - Authentication',
  description: 'Sign in or register for the FALZ real estate platform',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page">
      {/* Subtle decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-card-hover opacity-60 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-card-hover opacity-60 blur-3xl" />
      </div>

      {/* Theme toggle */}
      <div className="fixed top-4 left-4 z-50">
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg px-4 py-8">
        {children}
      </div>
    </div>
  )
}
