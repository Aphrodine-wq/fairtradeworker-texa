import { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-black dark:text-white placeholder:text-black dark:placeholder:text-white selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black bg-white dark:bg-black border-2 border-black dark:border-white flex h-9 w-full min-w-0 rounded-none px-4 py-3 text-sm font-mono text-black dark:text-white shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff] transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
        "focus:bg-white dark:focus:bg-black focus:shadow-[6px_6px_0_#000] dark:focus:shadow-[6px_6px_0_#fff] focus:border-black dark:focus:border-white",
        "aria-invalid:border-[#FF0000] aria-invalid:ring-2 aria-invalid:ring-[#FF0000]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
