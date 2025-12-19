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
  const [isClosing, setIsClosing] = useState(false)

  // Auto-dismiss timer (5 seconds of inactivity)
  useEffect(() => {
    if (!open) return

    let timeoutId: NodeJS.Timeout

    const resetTimer = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        handleClose()
      }, 5000) // Auto-close after 5 seconds
    }

    resetTimer()

    // Reset timer on any interaction
    const handleInteraction = () => resetTimer()
    window.addEventListener('mousemove', handleInteraction)
    window.addEventListener('keydown', handleInteraction)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('mousemove', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
    }
  }, [open])

  // Handle Escape key
  useEffect(() => {
    if (!open) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [open, onOpenChange])

  const handleClose = () => {
    setIsClosing(true)
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      setOpen(false)
      setIsClosing(false)
      onOpenChange?.(false)
    }, 200) // Match the fade-out animation duration
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setOpen(newOpen)
      setIsClosing(false)
      onOpenChange?.(newOpen)
    } else {
      handleClose()
    }
  }

  return (
    <ContextMenuPrimitive.Root open={open} onOpenChange={handleOpenChange} modal={false}>
      <ContextMenuPrimitive.Trigger asChild>
        {children}
      </ContextMenuPrimitive.Trigger>
      <ContextMenuPrimitive.Portal>
        <ContextMenuPrimitive.Content
          className={`void-system-context-menu void-context-menu void-context-menu-${type} ${isClosing ? 'closing' : ''}`}
          sideOffset={5}
          alignOffset={-5}
          onEscapeKeyDown={(e) => {
            e.preventDefault()
            handleClose()
          }}
          onPointerDownOutside={(e) => {
            e.preventDefault()
            handleClose()
          }}
          onInteractOutside={(e) => {
            e.preventDefault()
            handleClose()
          }}
          asChild
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
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
