/**
 * Hook for VOID OS boot sequence
 */

import { useState, useEffect, useCallback } from 'react'
import { runBootSequence, type BootProgress, type BootPhase } from '@/lib/void/bootSequence'

interface UseBootSequenceOptions {
  userId?: string
  userName?: string
  autoStart?: boolean
  onComplete?: () => void
}

export function useBootSequence(options: UseBootSequenceOptions = {}) {
  const { userId, userName, autoStart = true, onComplete } = options

  const [isBooting, setIsBooting] = useState(autoStart)
  const [progress, setProgress] = useState<BootProgress>({
    phase: 'pre-boot',
    progress: 0,
    message: 'Initializing...',
  })
  const [isComplete, setIsComplete] = useState(false)

  const startBoot = useCallback(async () => {
    setIsBooting(true)
    setIsComplete(false)
    setProgress({ phase: 'pre-boot', progress: 0, message: 'Starting...' })

    await runBootSequence(
      {
        onProgress: (bootProgress) => {
          setProgress(bootProgress)
        },
        onPhaseComplete: (phase: BootPhase) => {
          if (phase === 'complete') {
            setIsComplete(true)
            setIsBooting(false)
            if (onComplete) {
              // Delay to allow fade animation
              setTimeout(() => {
                onComplete()
              }, 300)
            }
          }
        },
        onComplete: () => {
          setIsComplete(true)
          setIsBooting(false)
        },
      },
      userId,
      userName
    )
  }, [userId, userName, onComplete])

  useEffect(() => {
    if (autoStart && !isComplete) {
      startBoot()
    }
  }, [autoStart, isComplete, startBoot])

  return {
    isBooting,
    progress,
    isComplete,
    startBoot,
  }
}
