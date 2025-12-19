import { motion } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { useVoidStore } from '@/lib/void/store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface VoidBuddyPanelProps {
  onClose: () => void
  userName: string
}

export function VoidBuddyPanel({ onClose, userName }: VoidBuddyPanelProps) {
  const { buddyMessages, buddyState } = useVoidStore()
  const latestMessage = buddyMessages[buddyMessages.length - 1]

  // Calculate streak (mock for now)
  const streak = 12

  return (
    <motion.div
      className="w-[360px] h-[480px] bg-[var(--void-surface)] border border-[var(--void-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      style={{ willChange: 'transform' }}
    >
      {/* Header */}
      <div className="h-12 px-4 bg-[var(--void-surface-hover)] border-b border-[var(--void-border)] flex items-center justify-between">
        <span className="font-semibold text-sm text-[var(--void-text)]">Buddy</span>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded hover:bg-[var(--void-surface)] flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-[var(--void-text-muted)]" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Greeting */}
        <div className="text-sm text-[var(--void-text)]">
          {latestMessage?.message || `Morning ${userName}! Streak: ${streak} days 🔥`}
        </div>

        {/* Priorities */}
        <div>
          <h3 className="text-xs font-semibold text-[var(--void-text-muted)] mb-2 uppercase tracking-wide">
            📋 PRIORITIES
          </h3>
          <div className="space-y-2">
            <div className="text-xs text-[var(--void-text)] p-2 bg-[var(--void-surface-hover)] rounded">
              ○ Sarah Miller (no response 48h)
            </div>
            <div className="text-xs text-[var(--void-text)] p-2 bg-[var(--void-surface-hover)] rounded">
              ○ Johnson quote (due 3pm)
            </div>
          </div>
        </div>

        {/* Suggested Actions */}
        <div>
          <h3 className="text-xs font-semibold text-[var(--void-text-muted)] mb-2 uppercase tracking-wide">
            ⚡ SUGGESTED ACTIONS
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="text-xs h-7">
              Draft Email
            </Button>
            <Button size="sm" variant="outline" className="text-xs h-7">
              Schedule
            </Button>
            <Button size="sm" variant="outline" className="text-xs h-7">
              Snooze
            </Button>
          </div>
        </div>

        {/* Insights */}
        <div>
          <h3 className="text-xs font-semibold text-[var(--void-text-muted)] mb-2 uppercase tracking-wide">
            🏆 INSIGHTS
          </h3>
          <div className="space-y-1 text-xs text-[var(--void-text)]">
            <div>• $18k this week (+15% WoW)</div>
            <div>• Avg call: 7min (efficiency +25%)</div>
          </div>
        </div>

        {/* Soundscape */}
        <div>
          <h3 className="text-xs font-semibold text-[var(--void-text-muted)] mb-2 uppercase tracking-wide">
            🎵 SOUNDSCAPE
          </h3>
          <div className="text-xs text-[var(--void-text)]">
            Rain + Lo-fi
          </div>
        </div>
      </div>
    </motion.div>
  )
}
