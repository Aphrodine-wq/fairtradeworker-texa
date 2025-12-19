import { motion } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { useVoidStore } from '@/lib/void/store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { sanitizeString } from '@/lib/void/validation'

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
      className="glass-panel overflow-hidden flex flex-col"
      style={{
        width: '360px',
        height: '480px',
        borderRadius: 'var(--radius-lg, 16px)',
        boxShadow: 'var(--shadow-ambient)',
        willChange: 'transform',
      }}
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ 
        type: 'spring', 
        damping: 25, 
        stiffness: 300,
        duration: 0.2,
      }}
    >
      {/* Header */}
      <div 
        className="h-12 px-4 border-b flex items-center justify-between"
        style={{
          background: 'var(--surface-hover, var(--void-surface-hover))',
          borderColor: 'var(--border, var(--void-border))',
        }}
      >
        <span 
          className="void-heading-3"
          style={{ color: 'var(--text-primary, var(--void-text-primary))' }}
        >
          Buddy
        </span>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded flex items-center justify-center transition-colors"
          style={{
            transitionDuration: 'var(--duration-fast, 120ms)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
          aria-label="Close"
        >
          <X 
            className="w-4 h-4" 
            style={{ color: 'var(--text-secondary, var(--void-text-secondary))' }}
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Greeting */}
        <div 
          className="void-body-regular"
          style={{ color: 'var(--text-primary, var(--void-text-primary))' }}
        >
          {latestMessage?.message 
            ? sanitizeString(latestMessage.message, 1000)
            : `Morning ${sanitizeString(userName, 100)}! Streak: ${streak} days 🔥`}
        </div>

        {/* Priorities */}
        <div>
          <h3 
            className="void-body-caption mb-2 uppercase tracking-wide"
            style={{ color: 'var(--text-secondary, var(--void-text-secondary))' }}
          >
            📋 PRIORITIES
          </h3>
          <div className="space-y-2">
            <div 
              className="void-body-small p-2 rounded"
              style={{
                color: 'var(--text-primary, var(--void-text-primary))',
                background: 'var(--surface-hover, var(--void-surface-hover))',
                borderRadius: 'var(--radius-sm, 8px)',
              }}
            >
              ○ Sarah Miller (no response 48h)
            </div>
            <div 
              className="void-body-small p-2 rounded"
              style={{
                color: 'var(--text-primary, var(--void-text-primary))',
                background: 'var(--surface-hover, var(--void-surface-hover))',
                borderRadius: 'var(--radius-sm, 8px)',
              }}
            >
              ○ Johnson quote (due 3pm)
            </div>
          </div>
        </div>

        {/* Suggested Actions */}
        <div>
          <h3 
            className="void-body-caption mb-2 uppercase tracking-wide"
            style={{ color: 'var(--text-secondary, var(--void-text-secondary))' }}
          >
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
          <h3 
            className="void-body-caption mb-2 uppercase tracking-wide"
            style={{ color: 'var(--text-secondary, var(--void-text-secondary))' }}
          >
            🏆 INSIGHTS
          </h3>
          <div 
            className="space-y-1 void-body-small"
            style={{ color: 'var(--text-primary, var(--void-text-primary))' }}
          >
            <div>• $18k this week (+15% WoW)</div>
            <div>• Avg call: 7min (efficiency +25%)</div>
          </div>
        </div>

        {/* Soundscape */}
        <div>
          <h3 
            className="void-body-caption mb-2 uppercase tracking-wide"
            style={{ color: 'var(--text-secondary, var(--void-text-secondary))' }}
          >
            🎵 SOUNDSCAPE
          </h3>
          <div 
            className="void-body-small"
            style={{ color: 'var(--text-primary, var(--void-text-primary))' }}
          >
            Rain + Lo-fi
          </div>
        </div>
      </div>
    </motion.div>
  )
}
