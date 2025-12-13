import { ComponentProps } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-blue-400/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white shadow-[0_8px_30px_rgba(59,130,246,0.35)] hover:shadow-[0_12px_40px_rgba(59,130,246,0.45)] hover:-translate-y-0.5 font-semibold relative overflow-hidden group",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-0 bg-white/60 backdrop-blur-sm shadow-sm hover:bg-blue-50 text-blue-600 font-medium",
        secondary:
          "bg-blue-50 text-blue-600 border-0 shadow-sm hover:bg-blue-100 hover:shadow-[0_4px_12px_rgba(59,130,246,0.15)] font-medium",
        ghost:
          "text-gray-600 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-accent/50",
        link: "text-blue-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-3.5 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-xl gap-1 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-10 rounded-xl px-5 has-[>svg]:px-4",
        icon: "size-9",
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
