import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useEffect, useState, memo } from "react"
import { Wrench } from "@phosphor-icons/react"

interface LoadAnimationProps {
  onComplete?: () => void
  duration?: number
}

/**
 * GPU-optimized welcome animation
 * Fast fade with reduced motion support
 */
export const LoadAnimation = memo(function LoadAnimation({ onComplete, duration = 300 }: LoadAnimationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete?.()
    }, shouldReduceMotion ? 100 : duration)

    return () => clearTimeout(timer)
  }, [duration, onComplete, shouldReduceMotion])

  // Instant load for reduced motion preference
  if (shouldReduceMotion) {
    return isVisible ? (
      <div 
        className="fixed inset-0 z-[9999] bg-white dark:bg-black flex items-center justify-center"
        style={{ transform: 'translateZ(0)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-black dark:bg-white flex items-center justify-center">
            <Wrench size={28} weight="fill" className="text-white dark:text-black" />
          </div>
          <h1 className="text-2xl font-bold">FairTradeWorker</h1>
        </div>
      </div>
    ) : null
  }

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: [0.2, 0, 0.2, 1] }}
          className="fixed inset-0 z-[9999] bg-white dark:bg-black flex items-center justify-center gpu-composite"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              type: "tween",
              duration: 0.2,
              ease: [0.2, 0, 0.2, 1]
            }}
            className="flex flex-col items-center gap-4 gpu-layer"
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                type: "tween",
                duration: 0.15,
                delay: 0.05,
                ease: [0.2, 0, 0.2, 1]
              }}
              className="w-14 h-14 rounded-xl bg-black dark:bg-white flex items-center justify-center shadow-lg gpu-layer"
            >
              <Wrench size={28} weight="fill" className="text-white dark:text-black" />
            </motion.div>

            {/* Brand Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.15 }}
              className="text-center"
            >
              <h1 className="text-2xl font-bold text-black dark:text-white mb-1">
                FairTradeWorker
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Zero fees. 100% fair.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})
