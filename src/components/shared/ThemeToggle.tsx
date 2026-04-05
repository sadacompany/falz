'use client'

import { useAppTheme } from './AppThemeProvider'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useAppTheme()

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
      className={`w-9 h-9 rounded-lg border border-edge flex items-center justify-center hover:bg-card-hover transition-colors cursor-pointer ${className ?? ''}`}
    >
      {theme === 'dark' ? (
        <svg viewBox="0 0 24 24" width={16} height={16} strokeWidth={1.5} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-body">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width={16} height={16} strokeWidth={1.5} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-body">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}
