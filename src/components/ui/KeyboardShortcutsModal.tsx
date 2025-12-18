import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Keyboard } from "@phosphor-icons/react"
import { commonShortcuts } from "@/hooks/useKeyboardShortcuts"
import { cn } from "@/lib/utils"

interface KeyboardShortcutsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customShortcuts?: Array<{ key: string; ctrl?: boolean; shift?: boolean; alt?: boolean; description: string }>
}

export function KeyboardShortcutsModal({ open, onOpenChange, customShortcuts = [] }: KeyboardShortcutsModalProps) {
  const allShortcuts = [...commonShortcuts, ...customShortcuts]

  const formatKey = (shortcut: typeof commonShortcuts[0]) => {
    const parts: string[] = []
    if (shortcut.ctrl) parts.push('Ctrl')
    if (shortcut.shift) parts.push('Shift')
    if (shortcut.alt) parts.push('Alt')
    if (shortcut.key === 'Escape') {
      parts.push('Esc')
    } else if (shortcut.key === '/') {
      parts.push('/')
    } else {
      parts.push(shortcut.key.toUpperCase())
    }
    return parts.join(' + ')
  }

  const groupedShortcuts = {
    navigation: allShortcuts.filter(s => s.description.includes('Go to')),
    general: allShortcuts.filter(s => !s.description.includes('Go to') && !s.description.includes('G then')),
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto border-2 border-transparent dark:border-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-black dark:text-white">
            <Keyboard size={24} weight="duotone" className="text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription className="text-black/60 dark:text-white/60">
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {/* Navigation Shortcuts */}
          {groupedShortcuts.navigation.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-black dark:text-white mb-3">Navigation</h3>
              <div className="space-y-2">
                {groupedShortcuts.navigation.map((shortcut, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-black dark:text-white">{shortcut.description}</span>
                    <Badge variant="outline" className="border-transparent dark:border-white font-mono text-xs">
                      {shortcut.description.includes('G then') ? (
                        <span>G + {shortcut.key.toUpperCase()}</span>
                      ) : (
                        formatKey(shortcut as any)
                      )}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General Shortcuts */}
          {groupedShortcuts.general.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-black dark:text-white mb-3">General</h3>
              <div className="space-y-2">
                {groupedShortcuts.general.map((shortcut, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-black dark:text-white">{shortcut.description}</span>
                    <Badge variant="outline" className="border-transparent dark:border-white font-mono text-xs">
                      {formatKey(shortcut as any)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="p-4 bg-muted/30 rounded-lg border-0 shadow-sm">
            <p className="text-xs text-black/60 dark:text-white/60">
              <strong>Tip:</strong> Press <kbd className="px-2 py-1 bg-white dark:bg-black border-0 shadow-sm rounded text-xs">?</kbd> or <kbd className="px-2 py-1 bg-white dark:bg-black border-0 shadow-sm rounded text-xs">Ctrl + /</kbd> anytime to view this help.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
