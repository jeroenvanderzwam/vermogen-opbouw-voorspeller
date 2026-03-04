import React from 'react'
import { cn } from '@/lib/utils'

export function Label({ children, className, ...props }) {
  return (
    <label
      className={cn('block text-sm font-medium text-gray-700 mb-1', className)}
      {...props}
    >
      {children}
    </label>
  )
}
