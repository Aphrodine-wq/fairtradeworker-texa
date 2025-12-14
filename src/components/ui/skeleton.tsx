import { cn } from "@/lib/utils"
import { ComponentProps } from "react"

function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-white dark:bg-black border-2 border-black dark:border-white animate-pulse rounded-none", className)}
      {...props}
    />
  )
}

export { Skeleton }
