'use client'

import { cn } from '@/lib/utils'

interface FalzLogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 28,
  md: 40,
  lg: 60,
} as const

export function FalzLogo({ size = 'md', className }: FalzLogoProps) {
  const px = sizeMap[size]

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="FALZ"
      className={cn(className)}
    >
      {/* Top-left vertical bar */}
      <rect x="0" y="0" width="14" height="40" />
      {/* Top horizontal bar */}
      <rect x="24" y="0" width="76" height="14" />
      {/* Middle horizontal bar */}
      <rect x="24" y="24" width="52" height="14" />
      {/* Bottom-left stepped piece */}
      <path d="M0 52V100H24V66H14V52Z" />
      {/* Bottom horizontal bar */}
      <rect x="24" y="66" width="52" height="14" />
    </svg>
  )
}
