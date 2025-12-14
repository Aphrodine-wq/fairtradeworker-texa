import { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-black dark:placeholder:text-white focus-visible:ring-black dark:focus-visible:ring-white aria-invalid:ring-[#FF0000] bg-white dark:bg-black flex field-sizing-content min-h-20 w-full rounded-none border-2 border-black dark:border-white px-3 py-2 text-sm font-mono shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff] transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:shadow-[6px_6px_0_#000] dark:focus-visible:shadow-[6px_6px_0_#fff] disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
