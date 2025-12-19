/**
 * iPhone-style messages falling from the right of Buddy
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVoidStore } from '@/lib/void/store'
import { sanitizeString } from '@/lib/void/validation'

interface VoidBuddyMessagesProps {
  buddyPosition: { top?: string; bottom?: string; left?: string; right?: string; transform?: string }
}

// Format timestamp for iPhone-style messages
function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function VoidBuddyMessages({ buddyPosition }: VoidBuddyMessagesProps) {
  // Safely access store with error handling
  let storeState
  try {
    storeState = useVoidStore()
  } catch (error) {
    console.error('[VoidBuddyMessages] Store access error:', error)
    storeState = null
  }
  
  const buddyMessages = storeState?.buddyMessages || []
  const [visibleMessages, setVisibleMessages] = useState<typeof buddyMessages>([])
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set())

  // Get theme for styling
  const theme = typeof document !== 'undefined' 
    ? document.documentElement.getAttribute('data-theme') || 'light'
    : 'light'
  const isDark = theme === 'dark'

  // Track new messages and add them with animation
  useEffect(() => {
    try {
      if (!buddyMessages || !Array.isArray(buddyMessages) || buddyMessages.length === 0) {
        return
      }

      buddyMessages.forEach((msg) => {
        // Validate message before processing
        if (!msg || !msg.id || !msg.message) {
          console.warn('[VoidBuddyMessages] Invalid message skipped:', msg)
          return
        }
        
        if (!processedIds.has(msg.id)) {
          setProcessedIds(prev => new Set([...prev, msg.id]))
          
          // Add message to visible list after a short delay for staggered effect
          setTimeout(() => {
            setVisibleMessages(prev => {
              // Keep only last 5 messages visible
              const newMessages = [...prev, msg].slice(-5)
              return newMessages
            })
          }, 100)
        }
      })
    } catch (error) {
      console.error('[VoidBuddyMessages] Error processing messages:', error)
    }
  }, [buddyMessages, processedIds])

  // Remove old messages after they've been visible for a while
  useEffect(() => {
    if (visibleMessages.length > 5) {
      const oldestMessage = visibleMessages[0]
      const timeout = setTimeout(() => {
        setVisibleMessages(prev => prev.filter(m => m.id !== oldestMessage.id))
      }, 8000) // Remove after 8 seconds
      return () => clearTimeout(timeout)
    }
  }, [visibleMessages])

  // Calculate position for each message (stacked vertically)
  const getMessagePosition = (index: number) => {
    try {
      // Messages are positioned relative to the container which is already below Buddy
      // Stack messages vertically with 100px spacing
      const horizontalOffset = -150 // Center messages (300px / 2 = 150px)
      const verticalOffset = index * 100 // Stack with 100px spacing
      
      return {
        left: `${horizontalOffset}px`,
        top: `${verticalOffset}px`,
        maxWidth: '300px',
        transform: 'translateX(50%)', // Center horizontally
      }
    } catch (error) {
      // Fallback position if calculation fails
      return {
        left: '-150px',
        top: `${index * 100}px`,
        maxWidth: '300px',
        transform: 'translateX(50%)',
      }
    }
  }

  // Calculate absolute position below Buddy's area
  // Buddy icon: 128px (w-32 h-32)
  // Buddy name: ~24px + 8px margin = ~32px
  // Total Buddy height: ~160px
  const getAbsolutePosition = () => {
    if (buddyPosition.top) {
      // Buddy is positioned from top
      const topValue = parseInt(buddyPosition.top) || 80
      return {
        top: `${topValue + 160 + 20}px`, // Buddy height + spacing
        left: buddyPosition.left || '50%',
        right: buddyPosition.right,
        transform: buddyPosition.transform || 'translateX(-50%)',
      }
    } else if (buddyPosition.bottom) {
      // Buddy is positioned from bottom
      const bottomValue = parseInt(buddyPosition.bottom) || 60
      return {
        bottom: `${bottomValue + 160 + 20}px`, // Buddy height + spacing
        left: buddyPosition.left || '50%',
        right: buddyPosition.right,
        transform: buddyPosition.transform || 'translateX(-50%)',
      }
    }
    // Default: top-center
    return {
      top: '260px', // 80px (Buddy top) + 160px (Buddy height) + 20px (spacing)
      left: '50%',
      transform: 'translateX(-50%)',
    }
  }

  return (
    <div
      className="fixed z-[60] pointer-events-none"
      style={getAbsolutePosition()}
    >
      <AnimatePresence>
        {visibleMessages.filter(msg => msg && msg.id && msg.message).map((msg, index) => (
          <motion.div
            key={msg.id}
            initial={{ 
              opacity: 0, 
              x: 100, 
              scale: 0.8,
              y: -20,
            }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              scale: 1,
              y: 0,
            }}
            exit={{ 
              opacity: 0, 
              x: 50, 
              scale: 0.8,
              y: -10,
              transition: { duration: 0.3 }
            }}
            transition={{ 
              type: 'spring',
              stiffness: 300,
              damping: 25,
              duration: 0.4,
            }}
            style={getMessagePosition(index)}
            className="mb-2"
          >
            {/* Floating white text - no bubble styling */}
            <motion.div
              className="leading-relaxed"
              style={{
                color: '#ffffff',
                textShadow: isDark
                  ? '0 2px 12px rgba(0, 0, 0, 0.9), 0 0 24px rgba(255, 255, 255, 0.4), 0 0 40px rgba(255, 255, 255, 0.2)'
                  : '0 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 255, 255, 0.3), 0 0 30px rgba(0, 0, 0, 0.5)',
                fontSize: '14px',
                fontWeight: '500',
                pointerEvents: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-words',
                maxWidth: '300px',
              }}
              whileHover={{ scale: 1.05, opacity: 0.9 }}
            >
              <div className="whitespace-pre-wrap break-words">
                {sanitizeString(msg.message, 200)}
              </div>
              
              {/* Timestamp - subtle, smaller */}
              <div 
                className="text-xs mt-1 opacity-60"
                style={{ 
                  color: 'rgba(255, 255, 255, 0.6)',
                  textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)',
                }}
              >
                {formatMessageTime(msg.timestamp)}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
