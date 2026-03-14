'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { Dictionary } from '@/i18n/dictionaries/ar'

// ─── Office Data Type ─────────────────────────────────────

export interface PublicOffice {
  id: string
  name: string
  nameAr: string | null
  slug: string
  logo: string | null
  description: string | null
  descriptionAr: string | null
  falLicenseNo: string | null
  phone: string | null
  email: string | null
  whatsapp: string | null
  website: string | null
  address: string | null
  addressAr: string | null
  city: string | null
  cityAr: string | null
  district: string | null
  districtAr: string | null
  lat: number | null
  lng: number | null
  socialLinks: Record<string, string> | null
  defaultLanguage: string
  pageVisibility?: { about?: boolean; contact?: boolean; agents?: boolean; blog?: boolean } | null
}

// ─── Context ──────────────────────────────────────────────

interface PublicOfficeContextValue {
  office: PublicOffice
  dict: Dictionary
}

const PublicOfficeContext = createContext<PublicOfficeContextValue | null>(null)

// ─── Hook ─────────────────────────────────────────────────

export function usePublicOffice(): PublicOfficeContextValue {
  const ctx = useContext(PublicOfficeContext)
  if (!ctx) {
    throw new Error('usePublicOffice must be used within a <PublicOfficeProvider>')
  }
  return ctx
}

// ─── Provider ─────────────────────────────────────────────

interface PublicOfficeProviderProps {
  office: PublicOffice
  dict: Dictionary
  children: ReactNode
}

export function PublicOfficeProvider({ office, dict, children }: PublicOfficeProviderProps) {
  return (
    <PublicOfficeContext.Provider value={{ office, dict }}>
      {children}
    </PublicOfficeContext.Provider>
  )
}
