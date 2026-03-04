import React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef(function Input({ className, type = 'text', ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg',
        'bg-white placeholder-gray-400 text-gray-900',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
        'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
})
