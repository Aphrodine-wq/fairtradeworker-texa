import { useVoidStore } from '@/lib/void/store'

export function VoidTaskbar() {
  const { windows } = useVoidStore()
  const minimizedWindows = windows.filter(w => w.minimized)

  const handleRestore = (windowId: string) => {
    const window = windows.find(w => w.id === windowId)
    if (window) {
      useVoidStore.getState().minimizeWindow(windowId) // Toggle to restore
    }
  }

  if (minimizedWindows.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-[var(--void-surface)] border-t border-[var(--void-border)] z-50 flex items-center gap-2 px-2">
      {minimizedWindows.map((window) => (
        <button
          key={window.id}
          onClick={() => handleRestore(window.id)}
          className="px-3 py-1.5 bg-[var(--void-surface-hover)] border border-[var(--void-border)] rounded text-xs text-[var(--void-text)] hover:bg-[var(--void-surface)] transition-colors"
        >
          {window.title}
        </button>
      ))}
    </div>
  )
}
