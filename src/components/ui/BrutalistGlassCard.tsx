import { ComponentProps } from "react"
import { cn } from "@/lib/utils"

interface BrutalistGlassCardProps extends ComponentProps<"div"> {
  /** Glass variant for Pro features */
  variant?: "default" | "overlay"
  /** Apply glass effect (Pro features only) */
  glass?: boolean
}

/**
 * Brutalist Glass Card - Pro Features Only
 * 
 * Combines raw brutalist edges with subtle glass-like transparency.
 * Use ONLY in Pro dashboard components to add premium depth.
 * 
 * Rules:
 * - Glass variant uses rgba(255,255,255,0.2) + 2px blur
 * - Hard 2px borders with #000000
 * - Shadow: 0 4px 6px rgba(0,0,0,0.1) for glass
 * - No rounded corners (rounded-md)
 */
function BrutalistGlassCard({ 
  className, 
  variant = "default",
  glass = false,
  ...props 
}: BrutalistGlassCardProps) {
  if (glass) {
    // Pro glass variant - semi-transparent with subtle blur
    return (
      <div
        data-slot="glass-card"
        className={cn(
          // Glass background with 0.2 alpha
          "bg-glass-light dark:bg-glass-dark",
          // Subtle 2px blur (Pro only)
          "backdrop-blur-xs",
          // Subtle border
          "border border-black/10 dark:border-white/10",
          // Glass shadow (soft, not hard pixel shadow)
          "shadow-sm hover:shadow-md",
          // Rounded corners
          "rounded-lg",
          // Layout
          "flex flex-col gap-5 py-5 px-5",
          // Transitions
          "transition-all duration-200",
          // Hover: slight lift
          "hover:-translate-y-0.5",
          className
        )}
        {...props}
      />
    )
  }

  // Default brutalist card (non-glass)
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-white dark:bg-black text-black dark:text-white",
        "flex flex-col gap-5 rounded-lg py-5 border border-black/10 dark:border-white/10",
        "shadow-sm",
        "transition-all duration-200",
        "hover:shadow-md",
        "relative overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function GlassCardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card-header"
      className={cn(
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1",
        "has-data-[slot=glass-card-action]:grid-cols-[1fr_auto]",
        "[.border-b]:pb-5",
        className
      )}
      {...props}
    />
  )
}

function GlassCardTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card-title"
      className={cn(
        "leading-tight font-semibold text-base text-black dark:text-white",
        className
      )}
      {...props}
    />
  )
}

function GlassCardDescription({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card-description"
      className={cn(
        "text-black dark:text-white text-sm",
        className
      )}
      {...props}
    />
  )
}

function GlassCardContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card-content"
      className={cn("px-5", className)}
      {...props}
    />
  )
}

function GlassCardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card-footer"
      className={cn(
        "flex items-center px-5 [.border-t]:pt-5",
        className
      )}
      {...props}
    />
  )
}

export {
  BrutalistGlassCard,
  GlassCardHeader,
  GlassCardFooter,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
}
