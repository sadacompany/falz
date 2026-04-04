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
          'flex h-10 w-full rounded-lg border border-[#E5DCC6] bg-white px-3 py-2 text-sm text-[#2E2506] shadow-sm transition-all duration-200',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#2E2506]',
          'placeholder:text-[#B3A88A]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4960C]/30 focus-visible:border-[#C4960C]',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F7F1E0]',
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
