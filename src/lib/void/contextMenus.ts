/**
 * VOID OS Context Menu Definitions
 */

import type { NotificationAction } from './types'

export interface ContextMenuItem {
  label: string
  icon?: string
  shortcut?: string
  action?: () => void
  disabled?: boolean
  separator?: boolean
  submenu?: ContextMenuItem[]
}

export type ContextMenuType = 'desktop' | 'icon' | 'window'

/**
 * Desktop context menu items
 */
export function getDesktopContextMenu(
  onNew?: () => void,
  onRefresh?: () => void,
  onArrange?: () => void,
  onChangeBackground?: () => void,
  onDisplaySettings?: () => void,
  onPaste?: () => void
): ContextMenuItem[] {
  return [
    {
      label: 'New',
      icon: '📄',
      submenu: [
        { label: 'Folder', action: onNew },
        { label: 'Document', action: onNew },
        { label: 'Shortcut', action: onNew },
      ],
    },
    { label: 'Refresh', icon: '↻', shortcut: 'F5', action: onRefresh },
    {
      label: 'Arrange Icons',
      icon: '⊞',
      submenu: [
        { label: 'By Name', action: onArrange },
        { label: 'By Date', action: onArrange },
        { label: 'By Type', action: onArrange },
        { separator: true },
        { label: 'Auto Arrange', action: onArrange },
      ],
    },
    { separator: true },
    { label: 'Change Background', icon: '🖼', action: onChangeBackground },
    { label: 'Display Settings', icon: '⚙️', action: onDisplaySettings },
    { separator: true },
    { label: 'Paste', icon: '📋', shortcut: '⌘V', action: onPaste, disabled: true },
  ]
}

/**
 * Icon context menu items
 */
export function getIconContextMenu(
  onOpen?: () => void,
  onOpenNewWindow?: () => void,
  onPin?: () => void,
  onAddToFavorites?: () => void,
  onCut?: () => void,
  onCopy?: () => void,
  onDelete?: () => void
): ContextMenuItem[] {
  return [
    { label: 'Open', icon: '▶', action: onOpen },
    { label: 'Open in New Window', icon: '⧉', action: onOpenNewWindow },
    { separator: true },
    { label: 'Pin to Desktop', icon: '📌', action: onPin },
    { label: 'Add to Favorites', icon: '⭐', action: onAddToFavorites },
    { separator: true },
    { label: 'Cut', icon: '✂️', shortcut: '⌘X', action: onCut },
    { label: 'Copy', icon: '📋', shortcut: '⌘C', action: onCopy },
    { separator: true },
    { label: 'Move to Trash', icon: '🗑', shortcut: '⌘⌫', action: onDelete },
  ]
}

/**
 * Window context menu items
 */
export function getWindowContextMenu(
  onMinimize?: () => void,
  onMaximize?: () => void,
  onClose?: () => void,
  onMoveToDesktop?: () => void
): ContextMenuItem[] {
  return [
    { label: 'Minimize', icon: '➖', shortcut: '⌘M', action: onMinimize },
    { label: 'Maximize', icon: '⛶', shortcut: '⌘⇧M', action: onMaximize },
    { separator: true },
    { label: 'Close', icon: '✕', shortcut: '⌘W', action: onClose },
    { separator: true },
    {
      label: 'Move to Desktop',
      icon: '🖥',
      submenu: [
        { label: 'Desktop 1', action: onMoveToDesktop },
        { label: 'Desktop 2', action: onMoveToDesktop },
        { label: 'Desktop 3', action: onMoveToDesktop },
        { separator: true },
        { label: 'New Desktop', action: onMoveToDesktop },
      ],
    },
  ]
}
