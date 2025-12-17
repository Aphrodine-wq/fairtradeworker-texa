import { useEffect, useCallback } from 'react'
import { toast } from 'sonner'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  description: string
  action: () => void
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Don't trigger shortcuts when user is typing in inputs, textareas, or contenteditable
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      shortcuts.forEach((shortcut) => {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey
        const altMatches = shortcut.alt ? event.altKey : !event.altKey

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          event.preventDefault()
          shortcut.action()
        }
      })
    },
    [shortcuts, enabled]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled])
}

// Common shortcuts configuration
export const commonShortcuts: Omit<KeyboardShortcut, 'action'>[] = [
  {
    key: 'k',
    ctrl: true,
    description: 'Open search / Command palette',
  },
  {
    key: '/',
    ctrl: true,
    description: 'Show keyboard shortcuts help',
  },
  {
    key: 'h',
    description: 'Go to Home (press G then H)',
  },
  {
    key: 'j',
    description: 'Go to Browse Jobs (press G then J)',
  },
  {
    key: 'm',
    description: 'Go to My Jobs (press G then M)',
  },
  {
    key: 'i',
    description: 'Go to Invoices (press G then I)',
  },
  {
    key: 'c',
    description: 'Go to CRM (press G then C)',
  },
  {
    key: 'd',
    description: 'Go to Dashboard (press G then D)',
  },
  {
    key: '?',
    description: 'Show keyboard shortcuts help',
  },
  {
    key: 'Escape',
    description: 'Close modals / dialogs',
  },
]
