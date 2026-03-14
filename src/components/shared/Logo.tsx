'use client'

import { cn } from '@/lib/utils'
import { FalzLogo } from './FalzLogo'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'light' | 'dark'
  className?: string
}

export function Logo({ size = 'md', variant = 'light', className }: LogoProps) {
  return (
    <FalzLogo
      size={size}
      variant={variant === 'dark' ? 'dark' : 'dark'}
      className={className}
    />
  )
}
