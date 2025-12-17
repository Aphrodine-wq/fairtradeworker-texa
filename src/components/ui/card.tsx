import { ComponentProps } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { universalCardHover } from "@/lib/animations"

interface CardProps extends ComponentProps<"div"> {
  /** Enable glass effect for Pro features */
  glass?: boolean
  /** Disable hover animations */
  disableHover?: boolean
}

function Card({ className, glass = false, disableHover = false, ...props }: CardProps) {
  const baseClasses = glass
    ? "bg-glass-light dark:bg-glass-dark backdrop-blur-xs"
    : "bg-white dark:bg-black"
  
  const commonClasses = cn(
    baseClasses,
    "text-black dark:text-white flex flex-col gap-5 rounded-xl py-5",
    "shadow-lg relative overflow-hidden group",
    className
  )

  if (disableHover) {
    return (
      <div
        data-slot="card"
        className={commonClasses}
        {...props}
      />
    )
  }

  // Use framer-motion for smooth animations
  return (
    <motion.div
      data-slot="card"
      className={commonClasses}
      variants={universalCardHover}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
      style={{ willChange: 'transform, box-shadow' }}
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
