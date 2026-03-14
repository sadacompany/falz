'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

interface VisitorSession {
  id: string
  officeId: string
  name: string
  email?: string
  phone?: string
}

interface VisitorAuthContextValue {
  visitor: VisitorSession | null
  loading: boolean
  showAuthModal: boolean
  setShowAuthModal: (show: boolean) => void
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const VisitorAuthContext = createContext<VisitorAuthContextValue>({
  visitor: null,
  loading: true,
  showAuthModal: false,
  setShowAuthModal: () => {},
  refresh: async () => {},
  logout: async () => {},
})

export function useVisitorAuth() {
  return useContext(VisitorAuthContext)
}

export function VisitorAuthProvider({ children }: { children: ReactNode }) {
  const [visitor, setVisitor] = useState<VisitorSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/public/visitors/me')
      const data = await res.json()
      setVisitor(data.visitor || null)
    } catch {
      setVisitor(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const logout = useCallback(async () => {
    await fetch('/api/public/visitors/logout', { method: 'POST' })
    setVisitor(null)
  }, [])

  return (
    <VisitorAuthContext.Provider value={{ visitor, loading, showAuthModal, setShowAuthModal, refresh, logout }}>
      {children}
    </VisitorAuthContext.Provider>
  )
}
