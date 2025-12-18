/**
 * VOID Window Manager - Manages all floating windows
 */

import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { VoidWindow } from './VoidWindow'
import type { VoidWindow as VoidWindowType, MenuId } from '@/lib/void/types'

interface VoidWindowManagerProps {
  windows: VoidWindowType[]
  onCloseWindow: (windowId: string) => void
  onMinimizeWindow: (windowId: string) => void
  onMaximizeWindow: (windowId: string) => void
  onResizeWindow: (windowId: string, size: { width: number; height: number }) => void
  onDragWindow: (windowId: string, position: { x: number; y: number }) => void
  onFocusWindow: (windowId: string) => void
  isMobile?: boolean
}

export function VoidWindowManager({
  windows,
  onCloseWindow,
  onMinimizeWindow,
  onMaximizeWindow,
  onResizeWindow,
  onDragWindow,
  onFocusWindow,
  isMobile = false,
}: VoidWindowManagerProps) {
  return (
    <AnimatePresence>
      {windows
        .filter(w => !w.isMinimized)
        .map(window => (
          <VoidWindow
            key={window.id}
            window={window}
            onClose={() => onCloseWindow(window.id)}
            onMinimize={() => onMinimizeWindow(window.id)}
            onMaximize={() => onMaximizeWindow(window.id)}
            onResize={(size) => onResizeWindow(window.id, size)}
            onDragEnd={(position) => onDragWindow(window.id, position)}
            onFocus={() => onFocusWindow(window.id)}
            isMobile={isMobile}
          />
        ))}
    </AnimatePresence>
  )
}
