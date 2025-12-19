import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useVoidStore } from '@/lib/void/store'
import { cn } from '@/lib/utils'

interface VoidBuddyIconProps {
  onExpand: () => void
}

export function VoidBuddyIcon({ onExpand }: VoidBuddyIconProps) {
  const { buddyState, buddyMessages } = useVoidStore()
  const [isBlinking, setIsBlinking] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Blink animation (every 3-5 seconds)
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 3000 + Math.random() * 2000
      const timeout = setTimeout(() => {
        setIsBlinking(true)
        setTimeout(() => {
          setIsBlinking(false)
          scheduleBlink()
        }, 120 + Math.random() * 80)
      }, delay)
      return timeout
    }

    const timeout = scheduleBlink()
    return () => clearTimeout(timeout)
  }, [])

  const hasNewMessages = buddyMessages.length > 0 && 
    buddyMessages[buddyMessages.length - 1].timestamp > buddyState.lastMessageTime

  const emotion = buddyState.emotion || 'neutral'

  return (
    <motion.button
      className={cn(
        'w-12 h-12 rounded-full',
        'bg-[var(--void-surface)] border-2',
        emotion === 'neutral' && 'border-[var(--void-accent)]',
        emotion === 'happy' && 'border-[var(--void-success)]',
        emotion === 'thinking' && 'border-[var(--void-warning)]',
        emotion === 'excited' && 'border-[var(--void-accent-alt)]',
        'flex items-center justify-center',
        'relative cursor-pointer',
        'transition-all duration-200'
      )}
      onClick={onExpand}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        boxShadow: isHovered
          ? emotion === 'dark'
            ? '0 0 20px rgba(0,240,255,0.6)'
            : '0 0 20px rgba(0,102,204,0.5)'
          : emotion === 'dark'
          ? '0 0 10px rgba(0,240,255,0.4)'
          : '0 0 10px rgba(0,102,204,0.3)',
      }}
      style={{ willChange: 'transform' }}
    >
      {/* Eyes */}
      <div className="flex gap-2 mb-1">
        <motion.div
          className="w-2 h-2 rounded-full bg-[var(--void-text)]"
          animate={{
            scaleY: isBlinking ? 0.1 : 1,
          }}
          transition={{ duration: 0.08 }}
          style={{ willChange: 'transform' }}
        />
        <motion.div
          className="w-2 h-2 rounded-full bg-[var(--void-text)]"
          animate={{
            scaleY: isBlinking ? 0.1 : 1,
          }}
          transition={{ duration: 0.08 }}
          style={{ willChange: 'transform' }}
        />
      </div>

      {/* Mouth */}
      <motion.div
        className={cn(
          'border-b-2 border-[var(--void-text)]',
          emotion === 'happy' && 'border-b-4 rounded-b-full w-4 h-2',
          emotion === 'thinking' && 'w-3 h-0',
          emotion === 'excited' && 'border-t-2 rounded-t-full w-4 h-2',
          emotion === 'neutral' && 'w-3 h-0'
        )}
        animate={
          emotion === 'thinking'
            ? {
                x: [-2, 2, -2],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: emotion === 'thinking' ? Infinity : 0,
          ease: 'easeInOut',
        }}
        style={{ willChange: 'transform' }}
      />

      {/* Notification badge */}
      {hasNewMessages && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--void-error)] rounded-full border-2 border-[var(--void-surface)]"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  )
}
