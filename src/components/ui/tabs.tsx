"use client"

import { ComponentProps } from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-white dark:bg-black text-black dark:text-white border border-black/20 dark:border-white/20 inline-flex h-9 w-fit items-center justify-center rounded-md p-[3px] shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black focus-visible:border-black dark:focus-visible:border-white focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white text-black dark:text-white inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border-2 border-transparent px-2 py-1 text-sm font-semibold tracking-tight whitespace-nowrap transition-all duration-200 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-[2px_2px_0_#000] dark:data-[state=active]:shadow-[2px_2px_0_#fff] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
