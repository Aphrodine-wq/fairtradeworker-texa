/**
 * Keyboard Shortcuts Dashboard
 * Free Feature - Power-user navigation (j/k scrolling)
 */

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Keyboard
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface KeyboardShortcutsProps {
  user: User
  onShortcut?: (key: string) => void
}

interface Shortcut {
  key: string
  description: string
  category: 'navigation' | 'actions' | 'general'
}

const shortcuts: Shortcut[] = [
  { key: 'j', description: 'Next job/item', category: 'navigation' },
  { key: 'k', description: 'Previous job/item', category: 'navigation' },
  { key: 'o', description: 'Open selected', category: 'navigation' },
  { key: 'b', description: 'Go back', category: 'navigation' },
  { key: 'g + h', description: 'Go to home', category: 'navigation' },
  { key: 'g + j', description: 'Go to jobs', category: 'navigation' },
  { key: 's', description: 'Save/bookmark', category: 'actions' },
  { key: 'a', description: 'Apply/bid', category: 'actions' },
  { key: 'm', description: 'Message', category: 'actions' },
  { key: '?', description: 'Show all shortcuts', category: 'general' },
  { key: 'Esc', description: 'Close modal/dialog', category: 'general' },
  { key: '/', description: 'Focus search', category: 'general' },
]

export function KeyboardShortcuts({ user, onShortcut }: KeyboardShortcutsProps) {
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Show help with ?
      if (e.key === '?') {
        setShowHelp(prev => !prev)
        return
      }

      // Navigation shortcuts
      if (e.key === 'j' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        onShortcut?.('next')
      }
      if (e.key === 'k' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        onShortcut?.('prev')
      }
      if (e.key === 'o' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        onShortcut?.('open')
      }
      if (e.key === 'b' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        onShortcut?.('back')
      }

      // Search focus
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]') as HTMLInputElement
        searchInput?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onShortcut])

  if (!showHelp) {
    return null
  }

  const navigation = shortcuts.filter(s => s.category === 'navigation')
  const actions = shortcuts.filter(s => s.category === 'actions')
  const general = shortcuts.filter(s => s.category === 'general')

  return (
    <Card className="fixed inset-4 z-50 overflow-auto border border-black/20 dark:border-white/20 bg-white dark:bg-black">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Keyboard weight="duotone" size={24} />
          Keyboard Shortcuts
        </CardTitle>
        <CardDescription>
          Press '?' again to close
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold text-black dark:text-white mb-3">Navigation</h3>
          <div className="grid grid-cols-2 gap-3">
            {navigation.map((s) => (
              <div key={s.key} className="flex items-center justify-between p-2 border border-black/20 dark:border-white/20">
                <span className="text-sm text-black dark:text-white">{s.description}</span>
                <Badge variant="outline" className="font-mono">{s.key}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-black dark:text-white mb-3">Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {actions.map((s) => (
              <div key={s.key} className="flex items-center justify-between p-2 border border-black/20 dark:border-white/20">
                <span className="text-sm text-black dark:text-white">{s.description}</span>
                <Badge variant="outline" className="font-mono">{s.key}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-black dark:text-white mb-3">General</h3>
          <div className="grid grid-cols-2 gap-3">
            {general.map((s) => (
              <div key={s.key} className="flex items-center justify-between p-2 border border-black/20 dark:border-white/20">
                <span className="text-sm text-black dark:text-white">{s.description}</span>
                <Badge variant="outline" className="font-mono">{s.key}</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
