import React from 'react'
import * as RadixSlider from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'

export function Slider({ className, ...props }) {
  return (
    <RadixSlider.Root
      className={cn('relative flex items-center select-none touch-none w-full h-5', className)}
      {...props}
    >
      <RadixSlider.Track className="bg-gray-200 relative grow rounded-full h-1.5">
        <RadixSlider.Range className="absolute bg-primary rounded-full h-full" />
      </RadixSlider.Track>
      <RadixSlider.Thumb
        className="block w-4 h-4 bg-white border-2 border-primary rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
      />
    </RadixSlider.Root>
  )
}
