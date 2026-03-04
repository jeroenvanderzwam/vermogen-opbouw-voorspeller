import React from 'react'
import { cn } from '@/lib/utils'

const variants = {
  default: 'bg-primary text-white hover:bg-blue-700 focus:ring-blue-500',
  outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-400',
  ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
}

export function Button({ children, className, variant = 'default', disabled, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant] || variants.default,
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
