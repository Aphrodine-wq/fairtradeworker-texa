import { cn } from "@/lib/utils"
import { ComponentProps } from "react"

function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-white dark:bg-black border border-black/20 dark:border-white/20 animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
