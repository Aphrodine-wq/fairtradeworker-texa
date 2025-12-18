/**
 * VOID Taskbar - Bottom taskbar for minimized windows
 */

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { VoidWindow as VoidWindowType } from '@/lib/void/types'

interface VoidTaskbarProps {
  windows: VoidWindowType[]
  onRestore: (windowId: string) => void
  onClose: (windowId: string) => void
  activeWindowId?: string
}

export function VoidTaskbar({ windows, onRestore, onClose, activeWindowId }: VoidTaskbarProps) {
  const minimizedWindows = windows.filter(w => w.isMinimized)

  if (minimizedWindows.length === 0) return null

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-t border-[#00f0ff]/20 h-16 flex items-center gap-2 px-4"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {minimizedWindows.map(window => (
        <motion.button
          key={window.id}
          onClick={() => onRestore(window.id)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            "bg-black/50 border border-[#00f0ff]/30 text-white",
            "hover:bg-[#00f0ff]/10 hover:border-[#00f0ff]",
            activeWindowId === window.id && "bg-[#00f0ff]/20 border-[#00f0ff]"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{window.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose(window.id)
              }}
              className="ml-2 w-4 h-4 rounded-full hover:bg-red-500/20 flex items-center justify-center"
            >
              <span className="text-xs">×</span>
            </button>
          </div>
        </motion.button>
      ))}
    </motion.div>
  )
}
