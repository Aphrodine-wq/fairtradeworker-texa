import { ComponentProps } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  /* Base styles - Modern glassmorphism, no borders */
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium text-sm",
    "rounded-md",
    "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "hover:scale-[1.02]",
    "active:scale-[0.98]",
    "shadow-sm hover:shadow-md",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-black text-white dark:bg-white dark:text-black",
          "hover:bg-gray-800 dark:hover:bg-gray-100",
          "focus-visible:ring-black dark:focus-visible:ring-white",
        ],
        destructive: [
          "bg-red-600 text-white",
          "hover:bg-red-700",
          "focus-visible:ring-red-600",
        ],
        outline: [
          "bg-white/80 dark:bg-black/80 backdrop-blur-sm",
          "text-black dark:text-white",
          "border border-white/10 dark:border-white/10",
          "hover:bg-white/90 dark:hover:bg-black/90",
          "focus-visible:ring-black dark:focus-visible:ring-white",
        ],
        secondary: [
          "bg-gray-100/80 text-black dark:bg-gray-800/80 dark:text-white backdrop-blur-sm",
          "hover:bg-gray-200/90 dark:hover:bg-gray-700/90",
          "focus-visible:ring-gray-400",
        ],
        ghost: [
          "bg-transparent",
          "text-black dark:text-white",
          "hover:bg-gray-100/50 dark:hover:bg-gray-800/50",
        ],
        link: [
          "bg-transparent",
          "text-black dark:text-white",
          "underline-offset-4 hover:underline",
          "hover:scale-100",
        ],
        success: [
          "bg-green-600 text-white",
          "hover:bg-green-700",
          "focus-visible:ring-green-600",
        ],
        warning: [
          "bg-yellow-500 text-black",
          "hover:bg-yellow-600",
          "focus-visible:ring-yellow-500",
        ],
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
