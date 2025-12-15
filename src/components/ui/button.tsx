import { ComponentProps } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  /* Base styles - ALL buttons */
  [
    "inline-flex items-center justify-center gap-2",
    "font-bold uppercase text-sm",
    "transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-black text-white dark:bg-white dark:text-black",
          "border-2 border-black dark:border-white",
          "shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff]",
          "hover:bg-[#00FF00] hover:text-black hover:border-black",
        ],
        destructive: [
          "bg-[#FF0000] text-white",
          "border-2 border-black dark:border-white",
          "shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff]",
          "hover:bg-black hover:text-[#FF0000]",
        ],
        outline: [
          "bg-white dark:bg-black",
          "text-black dark:text-white",
          "border-2 border-black dark:border-white",
          "shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff]",
          "hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black",
        ],
        secondary: [
          "bg-[#00FF00] text-black",
          "border-2 border-black",
          "shadow-[4px_4px_0_#000]",
          "hover:bg-black hover:text-[#00FF00]",
        ],
        ghost: [
          "bg-transparent",
          "text-black dark:text-white",
          "hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black",
        ],
        link: [
          "bg-transparent",
          "text-black dark:text-white",
          "underline-offset-4 hover:underline",
          "hover:text-[#00FF00]",
        ],
        success: [
          "bg-[#00FF00] text-black",
          "border-2 border-black",
          "shadow-[4px_4px_0_#000]",
          "hover:bg-black hover:text-[#00FF00]",
        ],
        warning: [
          "bg-[#FFFF00] text-black",
          "border-2 border-black",
          "shadow-[4px_4px_0_#000]",
          "hover:bg-black hover:text-[#FFFF00]",
        ],
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
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
