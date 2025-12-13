import { ComponentProps } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] duration-100 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-white dark:bg-black text-black dark:text-white border border-black/10 dark:border-white/10",
        secondary:
          "bg-white dark:bg-black text-black dark:text-white border border-black/10 dark:border-white/10",
        destructive:
          "bg-white dark:bg-black text-black dark:text-white border-2 border-red-500",
        outline:
          "text-black dark:text-white border border-black/10 dark:border-white/10 [a&]:hover:bg-white dark:[a&]:hover:bg-black",
        success:
          "bg-white dark:bg-black text-black dark:text-white border-2 border-green-500",
        warning:
          "bg-white dark:bg-black text-black dark:text-white border-2 border-yellow-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
