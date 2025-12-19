import { motion } from 'framer-motion'
import { useVoidStore } from '@/lib/void/store'
import { Button } from '@/components/ui/button'
import { sanitizeString } from '@/lib/void/validation'

interface VoidBuddyPanelProps {
  onClose?: () => void
  userName: string
}

export function VoidBuddyPanel({ userName }: VoidBuddyPanelProps) {
  const { buddyMessages } = useVoidStore()
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
        className="h-12 px-4 border-b flex items-center justify-center"
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
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Messages Section - Always Visible */}
        <div>
          <h3 
            className="void-body-caption mb-2 uppercase tracking-wide"
            style={{ color: 'var(--text-secondary, var(--void-text-secondary))' }}
          >
            💬 MESSAGES
          </h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {buddyMessages.length > 0 ? (
              buddyMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="void-body-small p-2 rounded"
                  style={{
                    color: 'var(--text-primary, var(--void-text-primary))',
                    background: 'var(--surface-hover, var(--void-surface-hover))',
                    borderRadius: 'var(--radius-sm, 8px)',
                  }}
                >
                  {sanitizeString(msg.message, 200)}
                </div>
              ))
            ) : (
              <div 
                className="void-body-small p-2 rounded"
                style={{
                  color: 'var(--text-primary, var(--void-text-primary))',
                  background: 'var(--surface-hover, var(--void-surface-hover))',
                  borderRadius: 'var(--radius-sm, 8px)',
                }}
              >
                {`Morning ${sanitizeString(userName, 100)}! Streak: ${streak} days 🔥`}
              </div>
            )}
          </div>
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
