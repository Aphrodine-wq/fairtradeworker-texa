import { ComponentProps } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white aria-invalid:border-[#FF0000] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-black dark:bg-white text-white dark:text-black border border-black/20 dark:border-white/20 shadow-sm hover:shadow-md hover:bg-black/90 dark:hover:bg-white/90 relative overflow-hidden group",
        destructive:
          "bg-[#FF0000] text-white border border-[#FF0000]/20 shadow-sm hover:shadow-md hover:bg-[#FF0000]/90",
        outline:
          "border border-black dark:border-white bg-transparent text-black dark:text-white shadow-sm hover:shadow-md hover:bg-black/5 dark:hover:bg-white/5",
        secondary:
          "bg-white dark:bg-black text-black dark:text-white border border-black/10 dark:border-white/10 shadow-sm hover:shadow-md hover:bg-black/5 dark:hover:bg-white/5",
        ghost:
          "text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 border border-transparent",
        link: "text-black dark:text-white underline-offset-4 hover:underline font-medium",
      },
      size: {
        default: "h-9 px-3.5 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-10 rounded-md px-5 has-[>svg]:px-4",
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
