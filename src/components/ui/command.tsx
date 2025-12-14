"use client" import { ComponentProps } from "react"
import { Command as CommandPrimitive } from "cmdk"
import SearchIcon from "lucide-react/dist/esm/icons/search" import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog" function Command({ className, ...props
}: ComponentProps<typeof CommandPrimitive>) { return ( <CommandPrimitive data-slot="command" className={cn( "bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white flex h-full w-full flex-col overflow-hidden rounded-none shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff]", className )} {...props} /> )
} function CommandDialog({ title = "Command Palette", description = "Search for a command to run...", children, ...props
}: ComponentProps<typeof Dialog> & { title?: string description?: string
}) { return ( <Dialog {...props}> <DialogHeader className="sr-only"> <DialogTitle>{title}</DialogTitle> <DialogDescription>{description}</DialogDescription> </DialogHeader> <DialogContent className="overflow-hidden p-0"> <Command className="[&_[cmdk-group-heading]]:text-black dark:text-white **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"> {children} </Command> </DialogContent> </Dialog> )
} function CommandInput({ className, ...props
}: ComponentProps<typeof CommandPrimitive.Input>) { return ( <div data-slot="command-input-wrapper" className="flex h-9 items-center gap-2 border-b px-3" > <SearchIcon className="size-4 shrink-0 text-black dark:text-white" /> <CommandPrimitive.Input data-slot="command-input" className={cn( "placeholder:text-black dark:placeholder:text-white flex h-10 w-full rounded-none bg-white dark:bg-black py-3 text-sm font-mono outline-hidden disabled:cursor-not-allowed disabled:opacity-50", className )} {...props} /> </div> )
} function CommandList({ className, ...props
}: ComponentProps<typeof CommandPrimitive.List>) { return ( <CommandPrimitive.List data-slot="command-list" className={cn( "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto", className )} {...props} /> )
} function CommandEmpty({ ...props
}: ComponentProps<typeof CommandPrimitive.Empty>) { return ( <CommandPrimitive.Empty data-slot="command-empty" className="py-6 text-center text-sm" {...props} /> )
} function CommandGroup({ className, ...props
}: ComponentProps<typeof CommandPrimitive.Group>) { return ( <CommandPrimitive.Group data-slot="command-group" className={cn( "text-black dark:text-white [&_[cmdk-group-heading]]:text-black dark:text-white overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium", className )} {...props} /> )
} function CommandSeparator({ className, ...props
}: ComponentProps<typeof CommandPrimitive.Separator>) { return ( <CommandPrimitive.Separator data-slot="command-separator" className={cn("bg-black dark:bg-white -mx-1 h-[2px]", className)} {...props} /> )
} function CommandItem({ className, ...props
}: ComponentProps<typeof CommandPrimitive.Item>) { return ( <CommandPrimitive.Item data-slot="command-item" className={cn( "data-[selected=true]:bg-black dark:data-[selected=true]:bg-white data-[selected=true]:text-white dark:data-[selected=true]:text-black [&_svg:not([class*='text-'])]:text-black dark:[&_svg:not([class*='text-'])]:text-white relative flex cursor-default items-center gap-2 rounded-none px-2 py-1.5 text-sm font-mono outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className )} {...props} /> )
} function CommandShortcut({ className, ...props
}: ComponentProps<"span">) { return ( <span data-slot="command-shortcut" className={cn( "text-black dark:text-white ml-auto text-xs font-mono tracking-widest", className )} {...props} /> )
} export { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator,
}
