import { useEffect } from 'react'
import { useVoidStore } from '@/lib/void/store'

export function useVoidKeyboard() {
  const { windows, closeWindow, openWindow, activeWindowId, focusWindow } = useVoidStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘W / Ctrl+W - Close active window
      if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
        e.preventDefault()
        if (activeWindowId) {
          closeWindow(activeWindowId)
        }
      }

      // Number keys 1-9 - Quick menu access (when no modifier keys)
      if (!e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        const num = parseInt(e.key)
        if (num >= 1 && num <= 9) {
          const menuIds = [
            'customers', 'leads', 'ai', 'automation', 'integrations',
            'sales', 'pipeline', 'social-media', 'analytics'
          ]
          if (menuIds[num - 1]) {
            openWindow(menuIds[num - 1])
          }
        }
      }

      // Escape - Close active window or clear focus
      if (e.key === 'Escape' && activeWindowId) {
        // Don't close, just blur (user might want to keep window open)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [windows, activeWindowId, closeWindow, openWindow, focusWindow])
}
