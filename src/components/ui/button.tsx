import { ComponentProps } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  /* Base styles - ALL buttons */
  [
    "inline-flex items-center justify-center gap-2",
      "font-semibold text-sm",
      "rounded-lg",
      "transition-all duration-150 ease-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-60",
      "active:translate-y-[3px] active:shadow-none",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-black text-white dark:bg-white dark:text-black",
          "shadow-[0_6px_0_0_rgba(0,0,0,0.3),0_10px_20px_-5px_rgba(0,0,0,0.2)] dark:shadow-[0_6px_0_0_rgba(255,255,255,0.2),0_10px_20px_-5px_rgba(255,255,255,0.1)]",
          "hover:translate-y-[-2px] hover:shadow-[0_10px_0_0_rgba(0,0,0,0.3),0_15px_25px_-5px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_10px_0_0_rgba(255,255,255,0.2),0_15px_25px_-5px_rgba(255,255,255,0.15)]",
        ],
        destructive: [
          "bg-red-600 text-white",
          "shadow-[0_6px_0_0_rgba(185,28,28,1),0_10px_20px_-5px_rgba(239,68,68,0.3)]",
          "hover:translate-y-[-2px] hover:shadow-[0_10px_0_0_rgba(185,28,28,1),0_15px_25px_-5px_rgba(239,68,68,0.4)]",
        ],
        outline: [
          "bg-white dark:bg-black",
          "text-black dark:text-white",
          "shadow-[0_4px_0_0_rgba(0,0,0,0.05),0_8px_15px_-5px_rgba(0,0,0,0.1)]",
          "hover:translate-y-[-2px] hover:shadow-[0_8px_0_0_rgba(0,0,0,0.08),0_12px_20px_-5px_rgba(0,0,0,0.15)]",
        ],
        secondary: [
          "bg-gray-100 dark:bg-gray-800 text-black dark:text-white",
          "shadow-[0_4px_0_0_rgba(0,0,0,0.08),0_8px_15px_-5px_rgba(0,0,0,0.1)]",
          "hover:translate-y-[-2px] hover:shadow-[0_8px_0_0_rgba(0,0,0,0.1),0_12px_20px_-5px_rgba(0,0,0,0.15)]",
        ],
        ghost: [
          "bg-transparent",
          "text-black dark:text-white",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          "hover:translate-y-[-1px]",
        ],
        link: [
          "bg-transparent",
          "text-black dark:text-white",
          "underline-offset-4 hover:underline",
        ],
        success: [
          "bg-green-500 text-white",
          "shadow-[0_6px_0_0_rgba(22,101,52,1),0_10px_20px_-5px_rgba(34,197,94,0.3)]",
          "hover:translate-y-[-2px] hover:shadow-[0_10px_0_0_rgba(22,101,52,1),0_15px_25px_-5px_rgba(34,197,94,0.4)]",
        ],
        warning: [
          "bg-yellow-500 text-black",
          "shadow-[0_6px_0_0_rgba(161,98,7,1),0_10px_20px_-5px_rgba(234,179,8,0.3)]",
          "hover:translate-y-[-2px] hover:shadow-[0_10px_0_0_rgba(161,98,7,1),0_15px_25px_-5px_rgba(234,179,8,0.4)]",
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
