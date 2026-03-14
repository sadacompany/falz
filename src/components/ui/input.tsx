'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#2D3748] shadow-sm transition-colors',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#2D3748]',
          'placeholder:text-[#A0AEC0]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]/30 focus-visible:border-[#C8A96E]',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F7F7F2]',
          'rtl:text-right ltr:text-left',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }
