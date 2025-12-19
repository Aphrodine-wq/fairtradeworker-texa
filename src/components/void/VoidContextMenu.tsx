/**
 * VOID OS Context Menu Component
 * Universal context menu for desktop, icons, and windows
 */

import { useState, useEffect } from 'react'
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu'
import { motion } from 'framer-motion'
import type { ContextMenuItem, ContextMenuType } from '@/lib/void/contextMenus'
import '@/styles/void-context-menu.css'

interface VoidContextMenuProps {
  type: ContextMenuType
  items: ContextMenuItem[]
  children: React.ReactNode
  onOpenChange?: (open: boolean) => void
}

function ContextMenuSubItem({ item }: { item: ContextMenuItem }) {
  if (item.separator) {
    return <ContextMenuPrimitive.Separator className="void-context-menu-separator" />
  }

  if (item.submenu && item.submenu.length > 0) {
    return (
      <ContextMenuPrimitive.Sub>
        <ContextMenuPrimitive.SubTrigger
          className="void-context-menu-item"
          disabled={item.disabled}
        >
          <span className="void-context-menu-item-label">{item.label}</span>
          {item.shortcut && (
            <span className="void-context-menu-item-shortcut">{item.shortcut}</span>
          )}
          <span className="void-context-menu-item-arrow">▶</span>
        </ContextMenuPrimitive.SubTrigger>
        <ContextMenuPrimitive.Portal>
          <ContextMenuPrimitive.SubContent
            className="void-context-menu-sub-content"
            sideOffset={2}
            alignOffset={-5}
          >
            {item.submenu.map((subItem, index) => (
              <ContextMenuSubItem key={index} item={subItem} />
            ))}
          </ContextMenuPrimitive.SubContent>
        </ContextMenuPrimitive.Portal>
      </ContextMenuPrimitive.Sub>
    )
  }

  return (
    <ContextMenuPrimitive.Item
      className="void-context-menu-item"
      disabled={item.disabled}
      onSelect={() => {
        if (item.action && !item.disabled) {
          item.action()
        }
      }}
    >
      {item.icon && <span className="void-context-menu-item-icon">{item.icon}</span>}
      <span className="void-context-menu-item-label">{item.label}</span>
      {item.shortcut && (
        <span className="void-context-menu-item-shortcut">{item.shortcut}</span>
      )}
    </ContextMenuPrimitive.Item>
  )
}

export function VoidContextMenu({
  type,
  items,
  children,
  onOpenChange,
}: VoidContextMenuProps) {
  const [open, setOpen] = useState(false)

  // Handle Escape key
  useEffect(() => {
    if (!open) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        onOpenChange?.(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [open, onOpenChange])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  return (
    <ContextMenuPrimitive.Root open={open} onOpenChange={handleOpenChange} modal={false}>
      <ContextMenuPrimitive.Trigger asChild>
        {children}
      </ContextMenuPrimitive.Trigger>
      <ContextMenuPrimitive.Portal>
        <ContextMenuPrimitive.Content
          className={`void-system-context-menu void-context-menu void-context-menu-${type}`}
          sideOffset={5}
          alignOffset={-5}
          onEscapeKeyDown={(e) => {
            e.preventDefault()
            setOpen(false)
            onOpenChange?.(false)
          }}
          onPointerDownOutside={(e) => {
            e.preventDefault()
            setOpen(false)
            onOpenChange?.(false)
          }}
          onInteractOutside={(e) => {
            e.preventDefault()
            setOpen(false)
            onOpenChange?.(false)
          }}
          asChild
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            {items.map((item, index) => (
              <ContextMenuSubItem key={index} item={item} />
            ))}
          </motion.div>
        </ContextMenuPrimitive.Content>
      </ContextMenuPrimitive.Portal>
    </ContextMenuPrimitive.Root>
  )
}
