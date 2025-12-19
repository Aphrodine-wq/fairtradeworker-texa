/**
 * VOID OS Boot Screen
 * Displays boot progress with VOID branding
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useBootSequence } from '@/hooks/useBootSequence'
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
          <div className="void-boot-content">
            {/* VOID Logo */}
            <motion.div
              className="void-boot-logo"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="void-boot-logo-inner">
                <div className="void-boot-logo-text">VOID</div>
              </div>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              className="void-boot-progress-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="void-boot-progress-bar">
                <motion.div
                  className="void-boot-progress-fill"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress.progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
              <div className="void-boot-progress-text">
                {progress.progress}%
              </div>
            </motion.div>

            {/* Status Message */}
            <motion.div
              className="void-boot-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {progress.message}
            </motion.div>

            {/* Welcome Message */}
            {userName && progress.phase === 'desktop-ready' && (
              <motion.div
                className="void-boot-welcome"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                Welcome back, {userName}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
