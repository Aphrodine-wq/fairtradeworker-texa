import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Microphone } from '@phosphor-icons/react'
import { useVoidStore } from '@/lib/void/store'
import { cn } from '@/lib/utils'
import '@/styles/void-voice.css'

interface VoidVoiceIconProps {
  icon: {
    id: string
    label: string
    position: { row: number; col: number }
    pinned: boolean
  }
  style: React.CSSProperties
  onContextMenu: (e: React.MouseEvent) => void
}

export function VoidVoiceIcon({ icon, style, onContextMenu }: VoidVoiceIconProps) {
  const { voiceState, setVoiceState, voicePermission } = useVoidStore()
  const [isPressed, setIsPressed] = useState(false)
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Handle press-and-hold
  const handleMouseDown = () => {
    setIsPressed(true)
    pressTimerRef.current = setTimeout(() => {
      if (voicePermission === 'granted') {
        setVoiceState('recording')
      } else if (voicePermission === 'prompt') {
        setVoiceState('permission-prompt')
      }
    }, 300) // 300ms hold to trigger
  }

  const handleMouseUp = () => {
    setIsPressed(false)
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current)
      pressTimerRef.current = null
    }
    if (voiceState === 'recording') {
      setVoiceState('processing')
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current)
      }
    }
  }, [])

  // Animation variants based on state
  const getAnimationVariants = () => {
    switch (voiceState) {
      case 'idle':
        return {
          scale: [1, 1.05, 1],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }
      case 'recording':
        return {
          scale: 1.1,
          boxShadow: [
            '0 0 0px rgba(239, 68, 68, 0.4)',
            '0 0 30px rgba(239, 68, 68, 0.8)',
            '0 0 0px rgba(239, 68, 68, 0.4)',
          ],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }
      case 'processing':
        return {
          rotate: [0, 360],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          },
        }
      case 'complete':
        return {
          scale: [1, 1.2, 1],
          transition: {
            duration: 0.3,
            ease: 'easeOut',
          },
        }
      default:
        return {}
    }
  }

  return (
    <div
      style={style}
      className="void-icon void-voice-icon-container"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={onContextMenu}
    >
      <motion.div
        className={cn(
          'void-icon-content void-voice-icon',
          voiceState === 'recording' && 'recording',
          voiceState === 'processing' && 'processing',
          voiceState === 'complete' && 'complete'
        )}
        animate={getAnimationVariants()}
        style={{ willChange: 'transform' }}
      >
        <div className="relative">
          <Microphone
            className={cn(
              'w-12 h-12',
              voiceState === 'idle' && 'text-[var(--void-accent)]',
              voiceState === 'recording' && 'text-[var(--void-error)]',
              voiceState === 'processing' && 'text-[var(--void-accent)]',
              voiceState === 'complete' && 'text-[var(--void-success)]'
            )}
          />
          
          {/* Recording rings */}
          <AnimatePresence>
            {voiceState === 'recording' && (
              <>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-[var(--void-error)]"
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{
                      scale: [1, 1.5, 2],
                      opacity: [0.6, 0.3, 0],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: 'easeOut',
                    }}
                    style={{ willChange: 'transform, opacity' }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
          
          {/* Processing trail */}
          {voiceState === 'processing' && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[var(--void-accent)] opacity-50"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ willChange: 'transform' }}
            />
          )}
        </div>
        
        <span className="void-icon-label">{icon.label}</span>
      </motion.div>
      
      {/* Confetti on complete */}
      <AnimatePresence>
        {voiceState === 'complete' && (
          <ConfettiBurst />
        )}
      </AnimatePresence>
    </div>
  )
}

// Confetti component
function ConfettiBurst() {
  const particles = Array.from({ length: 20 }, (_, i) => i)
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-[var(--void-accent)]"
          initial={{
            x: '50%',
            y: '50%',
            opacity: 1,
            scale: 0,
          }}
          animate={{
            x: `${50 + (Math.random() - 0.5) * 200}%`,
            y: `${50 + (Math.random() - 0.5) * 200}%`,
            opacity: [1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 0.8,
            delay: Math.random() * 0.2,
            ease: 'easeOut',
          }}
          style={{ willChange: 'transform, opacity' }}
        />
      ))}
    </div>
  )
}
