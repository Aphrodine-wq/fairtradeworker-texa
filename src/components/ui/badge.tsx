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
          "bg-blue-50 text-blue-700 border-blue-200",
        secondary:
          "bg-blue-50 text-blue-600 border-blue-200",
        destructive:
          "bg-rose-50 text-rose-700 border-rose-200",
        outline:
          "text-foreground border-black/10 dark:border-white/10 [a&]:hover:bg-white dark:[a&]:hover:bg-black",
        success:
          "bg-emerald-50 text-emerald-700 border-emerald-200",
        warning:
          "bg-amber-50 text-amber-700 border-amber-200",
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
