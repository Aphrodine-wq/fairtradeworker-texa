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
        "peer data-[state=checked]:bg-black dark:data-[state=checked]:bg-white data-[state=unchecked]:bg-white dark:data-[state=unchecked]:bg-black focus-visible:border-black dark:focus-visible:border-white focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white inline-flex h-6 w-12 shrink-0 items-center rounded-md border border-black/20 dark:border-white/20 shadow-sm transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-white dark:data-[state=unchecked]:bg-black dark:data-[state=checked]:bg-black data-[state=checked]:bg-white pointer-events-none block size-5 rounded-md border border-black/20 dark:border-white/20 ring-0 transition-transform duration-200 data-[state=checked]:translate-x-[calc(100%-4px)] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
