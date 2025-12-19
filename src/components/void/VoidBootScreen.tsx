/**
 * VOID OS Boot Screen
 * Shows Buddy's face, bigger and centered
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useBootSequence } from '@/hooks/useBootSequence'
import { VoidBuddyIcon } from './VoidBuddyIcon'
import '@/styles/void-boot.css'

interface VoidBootScreenProps {
  userId?: string
  userName?: string
  onComplete?: () => void
}

export function VoidBootScreen({ userId, userName, onComplete }: VoidBootScreenProps) {
  const { isBooting, progress, isComplete } = useBootSequence({
    userId,
    userName,
    autoStart: true,
    onComplete,
  })

  if (!isBooting && isComplete) {
    return null
  }

  return (
    <AnimatePresence>
      {isBooting && (
        <motion.div
          className="void-overlay-boot void-boot-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="void-boot-content flex flex-col items-center justify-center min-h-screen">
            {/* Buddy's Face - Bigger and Centered */}
            <motion.div
              className="flex items-center justify-center mb-8"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className="scale-[3]"> {/* 3x bigger */}
                <VoidBuddyIcon />
              </div>
            </motion.div>

            {/* Subtle loading indicator */}
            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'var(--void-accent, var(--accent))' }}
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 1,
                      delay: i * 0.2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
