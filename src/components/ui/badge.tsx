import { ComponentProps } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-none border-2 px-3 py-1 text-xs font-black uppercase tracking-tight w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-black dark:focus-visible:border-white focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white aria-invalid:border-[#FF0000] transition-[color,box-shadow] duration-100 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-white dark:bg-black text-black dark:text-white border-black dark:border-white",
        secondary:
          "bg-white dark:bg-black text-black dark:text-white border-black dark:border-white",
        destructive:
          "bg-[#FF0000] text-white border-black dark:border-white",
        outline:
          "text-black dark:text-white border-black dark:border-white [a&]:hover:bg-white dark:[a&]:hover:bg-black",
        success:
          "bg-[#00FF00] text-black border-black dark:border-white",
        warning:
          "bg-[#FFFF00] text-black border-black dark:border-white",
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
