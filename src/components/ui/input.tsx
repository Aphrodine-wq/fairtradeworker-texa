import { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-black dark:text-white placeholder:text-black/60 dark:placeholder:text-white/60 selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black bg-white/90 dark:bg-black/90 backdrop-blur-sm border border-white/10 dark:border-white/10 flex h-9 w-full min-w-0 rounded-md px-4 py-3 text-sm text-black dark:text-white shadow-sm transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
        "focus:bg-white dark:focus:bg-black focus:shadow-md focus:border-white/20 dark:focus:border-white/20 focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10",
        "aria-invalid:border-[#FF0000] aria-invalid:ring-2 aria-invalid:ring-[#FF0000]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
