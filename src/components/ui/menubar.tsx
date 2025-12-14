import { ComponentProps } from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import CheckIcon from "lucide-react/dist/esm/icons/check"
import ChevronRightIcon from "lucide-react/dist/esm/icons/chevron-right"
import CircleIcon from "lucide-react/dist/esm/icons/circle" import { cn } from "@/lib/utils" function Menubar({ className, ...props
}: ComponentProps<typeof MenubarPrimitive.Root>) { return ( <MenubarPrimitive.Root data-slot="menubar" className={cn( "bg-white dark:bg-black flex h-9 items-center gap-1 rounded-none border-2 border-black dark:border-white p-1 shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]", className )} {...props} /> )
} function MenubarMenu({ ...props
}: ComponentProps<typeof MenubarPrimitive.Menu>) { return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />
} function MenubarGroup({ ...props
}: ComponentProps<typeof MenubarPrimitive.Group>) { return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />
} function MenubarPortal({ ...props
}: ComponentProps<typeof MenubarPrimitive.Portal>) { return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />
} function MenubarRadioGroup({ ...props
}: ComponentProps<typeof MenubarPrimitive.RadioGroup>) { return ( <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} /> )
} function MenubarTrigger({ className, ...props
}: ComponentProps<typeof MenubarPrimitive.Trigger>) { return ( <MenubarPrimitive.Trigger data-slot="menubar-trigger" className={cn( "focus:bg-black dark:focus:bg-white focus:text-white dark:focus:text-black data-[state=open]:bg-black dark:data-[state=open]:bg-white data-[state=open]:text-white dark:data-[state=open]:text-black flex items-center rounded-none px-2 py-1 text-sm font-black uppercase tracking-tight outline-hidden select-none", className )} {...props} /> )
} function MenubarContent({ className, align = "start", alignOffset = -4, sideOffset = 8, ...props
}: ComponentProps<typeof MenubarPrimitive.Content>) { return ( <MenubarPortal> <MenubarPrimitive.Content data-slot="menubar-content" align={align} alignOffset={alignOffset} sideOffset={sideOffset} className={cn( "bg-white dark:bg-black text-black dark:text-white data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[12rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-none border-2 border-black dark:border-white p-1 shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff]", className )} {...props} /> </MenubarPortal> )
} function MenubarItem({ className, inset, variant = "default", ...props
}: ComponentProps<typeof MenubarPrimitive.Item> & { inset?: boolean variant?: "default" | "destructive"
}) { return ( <MenubarPrimitive.Item data-slot="menubar-item" data-inset={inset} data-variant={variant} className={cn( "focus:bg-black dark:focus:bg-white focus:text-white dark:focus:text-black data-[variant=destructive]:text-white data-[variant=destructive]:bg-[#FF0000] data-[variant=destructive]:focus:bg-[#FF0000] data-[variant=destructive]:focus:text-white data-[variant=destructive]:*:[svg]:!text-white [&_svg:not([class*='text-'])]:text-black dark:[&_svg:not([class*='text-'])]:text-white relative flex cursor-default items-center gap-2 rounded-none px-2 py-1.5 text-sm font-mono outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className )} {...props} /> )
} function MenubarCheckboxItem({ className, children, checked, ...props
}: ComponentProps<typeof MenubarPrimitive.CheckboxItem>) { return ( <MenubarPrimitive.CheckboxItem data-slot="menubar-checkbox-item" className={cn( "focus:bg-black dark:focus:bg-white focus:text-white dark:focus:text-black relative flex cursor-default items-center gap-2 rounded-none py-1.5 pr-2 pl-8 text-sm font-mono outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className )} checked={checked} {...props} > <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center"> <MenubarPrimitive.ItemIndicator> <CheckIcon className="size-4" /> </MenubarPrimitive.ItemIndicator> </span> {children} </MenubarPrimitive.CheckboxItem> )
} function MenubarRadioItem({ className, children, ...props
}: ComponentProps<typeof MenubarPrimitive.RadioItem>) { return ( <MenubarPrimitive.RadioItem data-slot="menubar-radio-item" className={cn( "focus:bg-black dark:focus:bg-white focus:text-white dark:focus:text-black relative flex cursor-default items-center gap-2 rounded-none py-1.5 pr-2 pl-8 text-sm font-mono outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className )} {...props} > <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center"> <MenubarPrimitive.ItemIndicator> <CircleIcon className="size-2 fill-current" /> </MenubarPrimitive.ItemIndicator> </span> {children} </MenubarPrimitive.RadioItem> )
} function MenubarLabel({ className, inset, ...props
}: ComponentProps<typeof MenubarPrimitive.Label> & { inset?: boolean
}) { return ( <MenubarPrimitive.Label data-slot="menubar-label" data-inset={inset} className={cn( "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8", className )} {...props} /> )
} function MenubarSeparator({ className, ...props
}: ComponentProps<typeof MenubarPrimitive.Separator>) { return ( <MenubarPrimitive.Separator data-slot="menubar-separator" className={cn("bg-border -mx-1 my-1 h-px", className)} {...props} /> )
} function MenubarShortcut({ className, ...props
}: ComponentProps<"span">) { return ( <span data-slot="menubar-shortcut" className={cn( "text-black dark:text-white ml-auto text-xs tracking-widest", className )} {...props} /> )
} function MenubarSub({ ...props
}: ComponentProps<typeof MenubarPrimitive.Sub>) { return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />
} function MenubarSubTrigger({ className, inset, children, ...props
}: ComponentProps<typeof MenubarPrimitive.SubTrigger> & { inset?: boolean
}) { return ( <MenubarPrimitive.SubTrigger data-slot="menubar-sub-trigger" data-inset={inset} className={cn( "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[inset]:pl-8", className )} {...props} > {children} <ChevronRightIcon className="ml-auto h-4 w-4" /> </MenubarPrimitive.SubTrigger> )
} function MenubarSubContent({ className, ...props
}: ComponentProps<typeof MenubarPrimitive.SubContent>) { return ( <MenubarPrimitive.SubContent data-slot="menubar-sub-content" className={cn( "bg-white dark:bg-black text-black dark:text-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-none border-2 border-black dark:border-white p-1 shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff]", className )} {...props} /> )
} export { Menubar, MenubarPortal, MenubarMenu, MenubarTrigger, MenubarContent, MenubarGroup, MenubarSeparator, MenubarLabel, MenubarItem, MenubarShortcut, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarSub, MenubarSubTrigger, MenubarSubContent,
}
