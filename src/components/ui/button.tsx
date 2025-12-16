import { ComponentProps } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  /* Base styles - Simple, clean, effective */
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium text-sm",
    "rounded-md",
    "border-2",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "hover:scale-[1.02]",
    "active:scale-[0.98]",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-black text-white dark:bg-white dark:text-black",
          "border-black dark:border-white",
          "hover:bg-gray-800 dark:hover:bg-gray-100",
          "focus-visible:ring-black dark:focus-visible:ring-white",
        ],
        destructive: [
          "bg-red-600 text-white",
          "border-red-600",
          "hover:bg-red-700",
          "focus-visible:ring-red-600",
        ],
        outline: [
          "bg-transparent",
          "text-black dark:text-white",
          "border-black dark:border-white",
          "hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black",
          "focus-visible:ring-black dark:focus-visible:ring-white",
        ],
        secondary: [
          "bg-gray-100 text-black dark:bg-gray-800 dark:text-white",
          "border-gray-300 dark:border-gray-600",
          "hover:bg-gray-200 dark:hover:bg-gray-700",
          "focus-visible:ring-gray-400",
        ],
        ghost: [
          "bg-transparent",
          "text-black dark:text-white",
          "border-transparent",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
        ],
        link: [
          "bg-transparent",
          "text-black dark:text-white",
          "border-transparent",
          "underline-offset-4 hover:underline",
          "hover:scale-100",
        ],
        success: [
          "bg-green-600 text-white",
          "border-green-600",
          "hover:bg-green-700",
          "focus-visible:ring-green-600",
        ],
        warning: [
          "bg-yellow-500 text-black",
          "border-yellow-600",
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
