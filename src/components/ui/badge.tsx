import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8A96E] focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-[#FAF5EB] text-[#B8963E] border border-[#C8A96E]/20',
        secondary:
          'bg-[#EBF0F7] text-[#1E3A5F] border border-[#1E3A5F]/10',
        destructive:
          'bg-red-50 text-red-600 border border-red-200',
        outline:
          'border-[#E2E8F0] text-[#2D3748] bg-transparent',
        success:
          'bg-emerald-50 text-emerald-700 border border-emerald-200',
        warning:
          'bg-amber-50 text-amber-700 border border-amber-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
