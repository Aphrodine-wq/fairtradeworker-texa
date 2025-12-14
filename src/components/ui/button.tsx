import { ComponentProps } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-none text-sm font-black uppercase tracking-tight transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white aria-invalid:border-[#FF0000] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff] hover:bg-white dark:hover:bg-black hover:text-black dark:hover:text-white hover:shadow-[6px_6px_0_#000] dark:hover:shadow-[6px_6px_0_#fff] relative overflow-hidden group",
        destructive:
          "bg-[#FF0000] text-white border-2 border-black dark:border-white shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff] hover:shadow-[6px_6px_0_#000] dark:hover:shadow-[6px_6px_0_#fff]",
        outline:
          "border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff] hover:shadow-[6px_6px_0_#000] dark:hover:shadow-[6px_6px_0_#fff] font-black",
        secondary:
          "bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff] hover:shadow-[6px_6px_0_#000] dark:hover:shadow-[6px_6px_0_#fff] font-black",
        ghost:
          "text-black dark:text-white hover:bg-white dark:hover:bg-black border-2 border-transparent hover:border-black dark:hover:border-white",
        link: "text-black dark:text-white underline-offset-4 hover:underline font-black",
      },
      size: {
        default: "h-9 px-3.5 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-none gap-1 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-10 rounded-none px-5 has-[>svg]:px-4",
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
