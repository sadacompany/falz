'use client'

import { cn } from '@/lib/utils'

interface FalzLogoProps {
  variant?: 'dark' | 'light' | 'gold'
  size?: 'sm' | 'md' | 'lg'
  showWordmark?: boolean
  className?: string
}

const sizeMap = {
  sm: { icon: 32, wordmark: 'text-lg', gap: 'gap-2' },
  md: { icon: 48, wordmark: 'text-2xl', gap: 'gap-3' },
  lg: { icon: 72, wordmark: 'text-4xl', gap: 'gap-4' },
} as const

const colorMap = {
  dark: '#44360E',
  light: '#FFFFFF',
  gold: '#B8860B',
} as const

export function FalzLogo({
  variant = 'dark',
  size = 'md',
  showWordmark = false,
  className,
}: FalzLogoProps) {
  const { icon, wordmark, gap } = sizeMap[size]
  const color = colorMap[variant]

  return (
    <div className={cn('flex items-center', showWordmark && gap, className)}>
      {/* Geometric "F" Mark */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="FALZ"
      >
        {/* Rounded square background */}
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="14"
          fill={color}
          fillOpacity={variant === 'gold' ? 0.12 : 0.08}
        />
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="14"
          stroke={color}
          strokeWidth="2"
          strokeOpacity={0.2}
        />
        {/* Stylized "F" — vertical bar + two horizontal strokes */}
        <path
          d="M22 16h20a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H28v6h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H28v12a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V18a2 2 0 0 1 2-2z"
          fill={color}
        />
        {/* Decorative accent dot */}
        <circle cx="46" cy="44" r="4" fill={color} fillOpacity={0.4} />
      </svg>

      {/* Optional Wordmark */}
      {showWordmark && (
        <span
          className={cn('font-bold tracking-wider', wordmark)}
          style={{ color }}
        >
          FALZ
        </span>
      )}
    </div>
  )
}
