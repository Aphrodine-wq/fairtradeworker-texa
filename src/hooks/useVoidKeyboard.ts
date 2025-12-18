/**
 * VOID Keyboard Shortcuts Hook
 */

import { useEffect } from 'react'

interface VoidKeyboardHandlers {
  onSearch?: () => void
  onCloseWindow?: () => void
  onNewWindow?: (menuId: string) => void
}

export function useVoidKeyboard(handlers: VoidKeyboardHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global search (⌘K or Ctrl+K)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        handlers.onSearch?.()
        return
      }

      // Close window (⌘W or Ctrl+W)
      if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
        e.preventDefault()
        handlers.onCloseWindow?.()
        return
      }

      // Number keys for quick menu access (1-9, 0)
      if (e.key >= '1' && e.key <= '9' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const menuIndex = parseInt(e.key) - 1
        if (menuIndex >= 0 && menuIndex <= 9) {
          const menuIds = [
            'customers', 'leads', 'ai', 'automation', 'integrations',
            'sales', 'pipeline', 'social-media', 'analytics', 'contacts',
          ]
          handlers.onNewWindow?.(menuIds[menuIndex])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}
