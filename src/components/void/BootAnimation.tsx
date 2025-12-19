import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BOOT_CONFIG } from '@/lib/void/config'
import '@/styles/void.css'

interface BootAnimationProps {
  onComplete: () => void
}

export function BootAnimation({ onComplete }: BootAnimationProps) {
  const [currentStage, setCurrentStage] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const duration = BOOT_CONFIG.duration
    const stages = BOOT_CONFIG.stages
    const interval = 50 // Update every 50ms for smooth progress
    const totalSteps = duration / interval
    let step = 0

    const progressInterval = setInterval(() => {
      step++
      const currentProgress = (step / totalSteps) * 100
      setProgress(currentProgress)

      // Update stage based on progress
      const stageIndex = stages.findIndex(
        (stage, index) =>
          currentProgress >= stage.progress &&
          (index === stages.length - 1 || currentProgress < stages[index + 1].progress)
      )
      if (stageIndex !== -1 && stageIndex !== currentStage) {
        setCurrentStage(stageIndex)
      }

      if (step >= totalSteps) {
        clearInterval(progressInterval)
        setTimeout(() => {
          onComplete()
        }, 300) // Small delay before transition
      }
    }, interval)

    return () => clearInterval(progressInterval)
  }, [onComplete])

  const currentStageData = BOOT_CONFIG.stages[currentStage]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[10000] bg-[var(--void-bg)] flex flex-col items-center justify-center"
      >
        {/* VOID Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 300,
            delay: 0.2,
          }}
          className="mb-12"
        >
          <h1
            className="text-7xl font-bold tracking-tight"
            style={{
              fontFamily: 'var(--void-font-display)',
              background: 'linear-gradient(135deg, var(--void-accent), var(--void-accent-alt))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'var(--void-glow)',
            }}
          >
            VOID
          </h1>
        </motion.div>

        {/* Progress Bar */}
        <div className="w-80 max-w-[90vw] mb-4">
          <div className="h-1 bg-[var(--void-surface)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-[var(--void-accent)] to-[var(--void-accent-alt)]"
              style={{ boxShadow: 'var(--void-glow)' }}
            />
          </div>
        </div>

        {/* Stage Label */}
        <motion.p
          key={currentStage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-[var(--void-text-muted)] text-sm"
          style={{ fontFamily: 'var(--void-font-body)' }}
        >
          {currentStageData.label}
        </motion.p>

        {/* Loading Dots */}
        <motion.div
          className="flex gap-2 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-[var(--void-accent)]"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
