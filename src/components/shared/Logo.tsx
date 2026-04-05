'use client'

import { cn } from '@/lib/utils'
import { FalzLogo } from './FalzLogo'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Logo({ size = 'md', className }: LogoProps) {
  return <FalzLogo size={size} className={cn('text-primary', className)} />
}
