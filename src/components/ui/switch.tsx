"use client"

import { ComponentProps } from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-8 w-16 shrink-0 items-center rounded-full border border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700",
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-neutral-200 dark:data-[state=unchecked]:bg-neutral-700",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block h-6 w-6 rounded-full border border-neutral-300 dark:border-white/30",
          "bg-white shadow-sm data-[state=checked]:bg-white",
          "transition-transform duration-300 translate-x-1 data-[state=checked]:translate-x-[calc(100%-4px)]"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
