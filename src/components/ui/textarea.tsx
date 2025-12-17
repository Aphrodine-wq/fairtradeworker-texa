import { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-black/60 dark:placeholder:text-white/60 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 aria-invalid:ring-[#FF0000] bg-white/90 dark:bg-black/90 backdrop-blur-sm flex field-sizing-content min-h-20 w-full rounded-md border border-white/10 dark:border-white/10 px-3 py-2 text-sm shadow-sm transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:shadow-md focus-visible:border-white/20 dark:focus-visible:border-white/20 disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
