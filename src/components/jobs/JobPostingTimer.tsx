import { useEffect, useState } from 'react'
import { Timer, CheckCircle } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { INDUSTRY_AVERAGES } from '@/lib/competitiveAdvantage'

interface JobPostingTimerProps {
  startTime: number
  isComplete?: boolean
  finalTime?: number
}

export function JobPostingTimer({ startTime, isComplete, finalTime }: JobPostingTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  
  useEffect(() => {
    if (isComplete) return
    
    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / 1000)
      setElapsedSeconds(elapsed)
    }, 100)
    
    return () => clearInterval(interval)
  }, [startTime, isComplete])
  
  const displayTime = isComplete && finalTime ? finalTime : elapsedSeconds
  const industryTime = INDUSTRY_AVERAGES.jobPostingTimeMinutes * 60
  
  return (
    <AnimatePresence mode="wait">
      {!isComplete ? (
        <motion.div
          key="timing"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20"
        >
          <Timer className="text-primary animate-pulse" weight="bold" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Posting time: {displayTime}s
            </p>
            <p className="text-xs text-muted-foreground">
              Industry average: {INDUSTRY_AVERAGES.jobPostingTimeMinutes}+ minutes
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="complete"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 px-4 py-3 bg-primary rounded-lg"
        >
          <CheckCircle className="text-primary-foreground" size={24} weight="bold" />
          <div>
            <p className="text-sm font-bold text-primary-foreground">
              Job posted in {displayTime} seconds!
            </p>
            <p className="text-xs text-primary-foreground/80">
              {Math.floor(industryTime / displayTime)}x faster than competitors ({INDUSTRY_AVERAGES.jobPostingTimeMinutes} min average)
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
