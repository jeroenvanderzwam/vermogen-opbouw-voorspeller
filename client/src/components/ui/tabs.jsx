import React from 'react'
import * as RadixTabs from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

export function Tabs({ children, className, ...props }) {
  return (
    <RadixTabs.Root className={cn('', className)} {...props}>
      {children}
    </RadixTabs.Root>
  )
}

export function TabsList({ children, className, ...props }) {
  return (
    <RadixTabs.List
      className={cn(
        'flex gap-1 bg-gray-100 rounded-lg p-1 mb-4',
        className
      )}
      {...props}
    >
      {children}
    </RadixTabs.List>
  )
}

export function TabsTrigger({ children, className, ...props }) {
  return (
    <RadixTabs.Trigger
      className={cn(
        'px-4 py-2 text-sm font-medium rounded-md transition-all',
        'text-gray-600 hover:text-gray-900',
        'data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </RadixTabs.Trigger>
  )
}

export function TabsContent({ children, className, ...props }) {
  return (
    <RadixTabs.Content className={cn('outline-none', className)} {...props}>
      {children}
    </RadixTabs.Content>
  )
}
