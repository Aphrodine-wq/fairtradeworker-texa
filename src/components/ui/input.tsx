import { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-black/50 dark:placeholder:text-white/50 selection:bg-black/20 dark:selection:bg-white/20 selection:text-black dark:selection:text-white bg-white dark:bg-black border border-black/10 dark:border-white/10 flex h-9 w-full min-w-0 rounded-xl px-4 py-3 text-sm text-black dark:text-white shadow-sm transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
        "focus:bg-white dark:focus:bg-black focus:shadow-md focus:border-black/20 dark:focus:border-white/20",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
