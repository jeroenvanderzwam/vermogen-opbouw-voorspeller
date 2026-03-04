import React from 'react'
import { cn } from '@/lib/utils'

const variants = {
  default: 'bg-blue-100 text-blue-800',
  secondary: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
}

export function Badge({ children, className, variant = 'default', ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
