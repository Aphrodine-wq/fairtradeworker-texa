"use client"

import { ComponentProps } from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import CircleIcon from "lucide-react/dist/esm/icons/circle"

import { cn } from "@/lib/utils"

function RadioGroup({
  className,
  ...props
}: ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "border border-black/20 dark:border-white/20 text-black dark:text-white focus-visible:border-black dark:focus-visible:border-white focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white aria-invalid:border-[#FF0000] aria-invalid:ring-2 aria-invalid:ring-[#FF0000] bg-white dark:bg-black aspect-square size-5 shrink-0 rounded-md shadow-sm transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
