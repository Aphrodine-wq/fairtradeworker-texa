import { ComponentProps } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border border-white/10 dark:border-white/10 px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 aria-invalid:border-[#FF0000] transition-[color,box-shadow] duration-100 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-black dark:bg-white text-white dark:text-black border-black/20 dark:border-white/20",
        secondary:
          "bg-black/5 dark:bg-white/5 text-black dark:text-white border-black/10 dark:border-white/10",
        destructive:
          "bg-[#FF0000] text-white border-[#FF0000]/20",
        outline:
          "text-black dark:text-white border-black/20 dark:border-white/20 [a&]:hover:bg-black/5 dark:[a&]:hover:bg-white/5",
        success:
          "bg-[#00FF00]/20 text-black border-[#00FF00]/30 dark:border-[#00FF00]/20",
        warning:
          "bg-[#FFFF00]/20 text-black border-[#FFFF00]/30 dark:border-[#FFFF00]/20",
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
