import React from 'react'
import * as RadixTooltip from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'

export const TooltipProvider = RadixTooltip.Provider

export function Tooltip({ children, ...props }) {
  return <RadixTooltip.Root {...props}>{children}</RadixTooltip.Root>
}

export function TooltipTrigger({ children, ...props }) {
  return <RadixTooltip.Trigger {...props}>{children}</RadixTooltip.Trigger>
}

export function TooltipContent({ children, className, sideOffset = 5, ...props }) {
  return (
    <RadixTooltip.Portal>
      <RadixTooltip.Content
        sideOffset={sideOffset}
        className={cn(
          'z-50 max-w-xs rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg',
          'animate-in fade-in-0 zoom-in-95',
          className
        )}
        {...props}
      >
        {children}
        <RadixTooltip.Arrow className="fill-gray-900" />
      </RadixTooltip.Content>
    </RadixTooltip.Portal>
  )
}
