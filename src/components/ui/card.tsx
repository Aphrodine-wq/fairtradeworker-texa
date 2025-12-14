import { ComponentProps } from "react"

import { cn } from "@/lib/utils"

interface CardProps extends ComponentProps<"div"> {
  /** Enable glass effect for Pro features */
  glass?: boolean
}

function Card({ className, glass = false, ...props }: CardProps) {
  if (glass) {
    // Pro glass variant - semi-transparent with subtle blur
    return (
      <div
        data-slot="card"
        className={cn(
          "bg-glass-light dark:bg-glass-dark backdrop-blur-xs",
          "text-black dark:text-white flex flex-col gap-5 rounded-lg py-5",
          "border border-black/10 dark:border-white/10",
          "shadow-sm hover:shadow-md",
          "transition-all duration-200",
          "hover:-translate-y-0.5",
          "relative overflow-hidden group",
          className
        )}
        {...props}
      />
    )
  }

  // Default card (non-glass) - modern professional style
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-white dark:bg-black text-black dark:text-white flex flex-col gap-5 rounded-lg py-5 border border-black/10 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1 px-5 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-5",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-tight font-semibold text-base text-black dark:text-white", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-black dark:text-white text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-5", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-5 [.border-t]:pt-5", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
