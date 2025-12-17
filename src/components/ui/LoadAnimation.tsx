import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { Wrench, Sparkle } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface LoadAnimationProps {
  onComplete?: () => void
  duration?: number
}

export function LoadAnimation({ onComplete, duration = 700 }: LoadAnimationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Faster progress animation - update more frequently for smoother feel
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 3.5 // Faster increment
      })
    }, duration / 30) // More frequent updates

    // Complete animation after duration
    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete?.()
    }, duration)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(timer)
    }
  }, [duration, onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed inset-0 z-[9999] bg-white dark:bg-black flex items-center justify-center"
          style={{ willChange: 'opacity', transform: 'translateZ(0)' }}
        >
          <div className="flex flex-col items-center gap-8">
            {/* Logo/Brand Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              delay: 0.05
            }}
            style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              initial={{ rotate: -90, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 22,
                delay: 0.1
              }}
              style={{ willChange: 'transform', transform: 'translateZ(0)' }}
              className="relative"
            >
              <div className="w-20 h-20 rounded-2xl bg-black dark:bg-white flex items-center justify-center shadow-lg">
                <Wrench 
                  size={40} 
                  weight="fill" 
                  className="text-white dark:text-black"
                />
              </div>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 600,
                  damping: 20,
                  delay: 0.2
                }}
                style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
                className="absolute -top-1 -right-1"
              >
                <Sparkle 
                  size={24} 
                  weight="fill" 
                  className="text-[#00FF00]"
                />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                delay: 0.15
              }}
              style={{ willChange: 'opacity, transform', transform: 'translateZ(0)' }}
              className="text-center"
            >
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-black dark:text-white">
                FairTradeWorker
              </h1>
              <p className="text-sm font-mono text-muted-foreground mt-2">
                Zero fees. 100% fair.
              </p>
            </motion.div>
          </motion.div>

            {/* Progress Indicator */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "200px" }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                delay: 0.25
              }}
              style={{ willChange: 'width, opacity', transform: 'translateZ(0)' }}
              className="w-[200px] h-1 bg-muted rounded-full overflow-hidden"
            >
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{
                  duration: duration / 1000,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                style={{ willChange: 'width', transform: 'translateZ(0)' }}
                className="h-full bg-[#00FF00] rounded-full"
              />
            </motion.div>

            {/* Loading Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3
              }}
              style={{ willChange: 'opacity' }}
              className="text-xs font-mono text-muted-foreground"
            >
              Loading...
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
