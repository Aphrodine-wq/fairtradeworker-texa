/**
 * VOID OS Context Menu Component
 * Universal context menu for desktop, icons, and windows
 */

import * as React from 'react'
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
          // Close menu after action
          const root = document.querySelector('[data-radix-context-menu-root]')
          if (root) {
            const event = new Event('contextmenu-close', { bubbles: true })
            root.dispatchEvent(event)
          }
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
  const [open, setOpen] = React.useState(false)

  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    setOpen(newOpen)
    if (onOpenChange) {
      onOpenChange(newOpen)
    }
  }, [onOpenChange])

  // Close on Escape key
  React.useEffect(() => {
    if (!open) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleOpenChange(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, handleOpenChange])

  return (
    <ContextMenuPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <ContextMenuPrimitive.Trigger asChild>
        {children}
      </ContextMenuPrimitive.Trigger>
      <ContextMenuPrimitive.Portal>
        <ContextMenuPrimitive.Content
          className={`void-system-context-menu void-context-menu void-context-menu-${type}`}
          sideOffset={5}
          alignOffset={-5}
          onEscapeKeyDown={() => handleOpenChange(false)}
          onPointerDownOutside={() => handleOpenChange(false)}
          asChild
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
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
