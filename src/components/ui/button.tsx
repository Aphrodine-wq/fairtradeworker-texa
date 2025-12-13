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
          "bg-white dark:bg-black text-black dark:text-white border border-black/10 dark:border-white/10 shadow-sm hover:shadow-md font-semibold relative overflow-hidden group",
        destructive:
          "bg-white dark:bg-black text-black dark:text-white border-2 border-red-500 shadow-sm hover:shadow-md",
        outline:
          "border border-black/10 dark:border-white/10 bg-white dark:bg-black text-black dark:text-white shadow-sm hover:shadow-md font-medium",
        secondary:
          "bg-white dark:bg-black text-black dark:text-white border border-black/10 dark:border-white/10 shadow-sm hover:shadow-md font-medium",
        ghost:
          "text-black dark:text-white hover:bg-white dark:hover:bg-black",
        link: "text-black dark:text-white underline-offset-4 hover:underline",
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
