'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useVisitorAuth } from './VisitorAuthContext'

interface FavoriteButtonProps {
  propertyId: string
  className?: string
  size?: 'sm' | 'md'
}

export function FavoriteButton({ propertyId, className = '', size = 'sm' }: FavoriteButtonProps) {
  const { visitor, setShowAuthModal } = useVisitorAuth()
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!visitor) {
      setIsFavorited(false)
      return
    }
    // Check if property is favorited
    fetch('/api/public/visitors/favorites')
      .then((r) => r.json())
      .then((data) => {
        const found = data.favorites?.some((f: any) => f.propertyId === propertyId)
        setIsFavorited(!!found)
      })
      .catch(() => {})
  }, [visitor, propertyId])

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!visitor) {
      setShowAuthModal(true)
      return
    }

    setLoading(true)
    try {
      if (isFavorited) {
        await fetch(`/api/public/visitors/favorites/${propertyId}`, { method: 'DELETE' })
        setIsFavorited(false)
      } else {
        const res = await fetch('/api/public/visitors/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ propertyId }),
        })
        if (res.ok) setIsFavorited(true)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  const btnSize = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center justify-center rounded-full transition-all ${btnSize} ${
        isFavorited
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-white/80 text-gray-500 hover:bg-white hover:text-red-500'
      } shadow-sm backdrop-blur-sm disabled:opacity-50 ${className}`}
      title={isFavorited ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
    >
      <Heart className={`${iconSize} ${isFavorited ? 'fill-current' : ''}`} />
    </button>
  )
}
