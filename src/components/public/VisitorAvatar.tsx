'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePublicOffice } from './PublicOfficeContext'
import { useVisitorAuth } from './VisitorAuthContext'
import { User, Heart, FileText, LogOut } from 'lucide-react'

export function VisitorAvatar() {
  const { office } = usePublicOffice()
  const { visitor, logout } = useVisitorAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  if (!visitor) return null

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
        className="flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-bold"
        style={{ backgroundColor: 'var(--theme-accent)' }}
      >
        {visitor.name.charAt(0).toUpperCase()}
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-xl border bg-white py-1 shadow-lg" style={{ borderColor: 'var(--theme-border)' }}>
            <div className="border-b px-4 py-3" style={{ borderColor: 'var(--theme-border)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>{visitor.name}</p>
              <p className="text-xs" style={{ color: 'var(--theme-muted)' }}>{visitor.email}</p>
            </div>
            <Link
              href={`/o/${office.slug}/profile`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-[#F7F7F2]"
              style={{ color: 'var(--theme-muted)' }}
            >
              <FileText className="h-4 w-4" />
              طلباتي
            </Link>
            <Link
              href={`/o/${office.slug}/favorites`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-[#F7F7F2]"
              style={{ color: 'var(--theme-muted)' }}
            >
              <Heart className="h-4 w-4" />
              المفضلة
            </Link>
            <div className="border-t" style={{ borderColor: 'var(--theme-border)' }}>
              <button
                onClick={() => { logout(); setMenuOpen(false) }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
