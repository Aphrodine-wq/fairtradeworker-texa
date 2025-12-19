import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVoidStore } from '@/lib/void/store'

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

  const isIdle = emotion === 'neutral' && !isHovered
  const isProcessing = emotion === 'thinking'

  return (
    <motion.button
      className="relative w-16 h-16 cursor-pointer select-none"
      onClick={onExpand}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        // Subtle breathing when idle
        scale: isIdle ? [1, 1.02, 1] : 1,
      }}
      transition={{
        duration: 3,
        repeat: isIdle ? Infinity : 0,
        ease: 'easeInOut',
      }}
      style={{ willChange: 'transform' }}
      aria-label="Buddy AI Assistant"
    >
      {/* Glass container */}
      <div 
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom right, color-mix(in srgb, var(--surface) 50%, transparent), color-mix(in srgb, var(--surface) 30%, transparent), transparent)',
          backdropFilter: 'blur(var(--blur-lg, 32px))',
          WebkitBackdropFilter: 'blur(var(--blur-lg, 32px))',
          border: '1px solid var(--border)',
        }}
      >
        {/* Animated accent gradient border */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2"
          style={{ borderColor: 'var(--accent)' }}
          animate={{
            opacity: isHovered ? [0.3, 0.6, 0.3] : 0.2,
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Tech grid pattern (subtle) */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, var(--accent) 2px, var(--accent) 4px)',
            backgroundSize: '8px 8px',
          }}
        />
        
        {/* Face elements */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
          {/* Eyes: Professional dots */}
          <div className="flex gap-3 mb-1.5">
            <motion.div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: isProcessing ? 'var(--accent)' : 'var(--text-primary)' }}
              animate={{ 
                scaleY: isBlinking ? 0.1 : 1,
              }}
              transition={{ duration: 0.12, ease: 'easeInOut' }}
            />
            <motion.div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: isProcessing ? 'var(--accent)' : 'var(--text-primary)' }}
              animate={{ scaleY: isBlinking ? 0.1 : 1 }}
              transition={{ duration: 0.12, ease: 'easeInOut' }}
            />
          </div>
          
          {/* Mouth: Minimal line with emotion */}
          <motion.div
            className="border-b-2 rounded-full"
            style={{
              borderColor: emotion === 'error' ? 'var(--error)' : 'var(--text-primary)',
              width: emotion === 'happy' ? '12px' : emotion === 'thinking' ? '0' : '8px',
              borderWidth: emotion === 'happy' ? '3px' : '2px',
              opacity: emotion === 'thinking' ? 0.5 : 1,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          />
          
          {/* Processing indicator (three dots) */}
          {isProcessing && (
            <motion.div
              className="absolute top-2 right-2 flex gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: 'var(--accent)' }}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Status notification dot */}
      {hasNewMessages && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        >
          <div 
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: 'var(--accent)' }}
          />
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: 'var(--accent)' }}
            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      )}
    </motion.button>
  )
}
