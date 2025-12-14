import { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-black/60 dark:placeholder:text-white/60 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 aria-invalid:ring-[#FF0000] bg-white dark:bg-black flex field-sizing-content min-h-20 w-full rounded-md border border-black/20 dark:border-white/20 px-3 py-2 text-sm shadow-sm transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:shadow-md focus-visible:border-black dark:focus-visible:border-white disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
