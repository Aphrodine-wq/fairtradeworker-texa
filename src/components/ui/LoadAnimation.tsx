import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { Wrench } from "@phosphor-icons/react"

interface LoadAnimationProps {
  onComplete?: () => void
  duration?: number
}

/**
 * Smooth, minimal welcome animation matching UnifiedPostJob style
 * Fast fade-in with logo and text - no choppy nested animations
 */
export function LoadAnimation({ onComplete, duration = 400 }: LoadAnimationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.2, 
            ease: [0.25, 0.46, 0.45, 0.94] 
          }}
          className="fixed inset-0 z-[9999] bg-gray-50 dark:bg-gray-900 flex items-center justify-center"
          style={{ willChange: 'opacity', transform: 'translateZ(0)' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.4
            }}
            style={{ willChange: 'transform, opacity' }}
            className="flex flex-col items-center gap-6"
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 400,
                damping: 30,
                delay: 0.1
              }}
              style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
              className="w-16 h-16 rounded-xl bg-black dark:bg-white flex items-center justify-center shadow-lg"
            >
              <Wrench 
                size={32} 
                weight="fill" 
                className="text-white dark:text-black"
              />
            </motion.div>

            {/* Brand Text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 30,
                delay: 0.15
              }}
              style={{ willChange: 'opacity, transform', transform: 'translateZ(0)' }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                FairTradeWorker
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Zero fees. 100% fair.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
