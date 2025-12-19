import { useState, useCallback, useEffect, useRef } from 'react'
import { useVoidStore } from '@/lib/void/store'
import { useBuddyContext } from '@/hooks/useBuddyContext'
import { useBuddyReactions } from '@/hooks/useBuddyReactions'
import { VoidBuddyIcon } from './VoidBuddyIcon'
import { VoidBuddyMessages } from './VoidBuddyMessages'
import { VoidVoiceCapture } from './VoidVoiceCapture'
import { motion } from 'framer-motion'
import { 
  getClickResponse, shouldTroll, shouldRagebait, getTrollMessage, getRagebaitMessage, 
  getEmotionForInteraction, getIdleMessage, getRandomEvent, getTimeBasedRoast, 
  getComparisonRoast, getStatsRoast, getStreakMessage,
  determineMood, getMoodResponse, type BuddyInteraction
} from '@/lib/void/buddyPersonality'
import type { User } from '@/lib/types'


interface VoidBuddyProps {
  user?: User
}

export function VoidBuddy({ user }: VoidBuddyProps) {
  // Safely access store with null checks
  let storeState
  try {
    storeState = useVoidStore()
  } catch (error) {
    console.error('[VoidBuddy] Store access error:', error)
    storeState = null
  }
  
  // Safe defaults
  const safeDefaults = {
    buddyState: {
      collapsed: false,
      position: 'top-center' as const,
      docked: false,
      lastMessageTime: 0,
      emotion: 'neutral' as const,
      mood: 'sassy' as const,
      stats: {
        windowsOpened: 0,
        windowsClosed: 0,
        totalClicks: 0,
        idleMinutes: 0,
        errors: 0,
        filesCreated: 0,
        settingsOpened: 0,
        startTime: Date.now(),
      },
      streak: {
        current: 0,
        longest: 0,
        lastInteraction: Date.now(),
        broken: false,
      },
    },
    addBuddyMessage: () => {},
    setBuddyEmotion: () => {},
    updateBuddyStats: () => {},
    setBuddyMood: () => {},
    updateBuddyStreak: () => {},
  }
  
  const { 
    buddyState = safeDefaults.buddyState, 
    addBuddyMessage = safeDefaults.addBuddyMessage, 
    setBuddyEmotion = safeDefaults.setBuddyEmotion, 
    updateBuddyStats = safeDefaults.updateBuddyStats, 
    setBuddyMood = safeDefaults.setBuddyMood, 
    updateBuddyStreak = safeDefaults.updateBuddyStreak,
  } = storeState || safeDefaults
  
  const [clickCount, setClickCount] = useState(0)
  const [interactions, setInteractions] = useState<BuddyInteraction[]>([])
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now())
  const randomEventTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastInteractionDateRef = useRef(new Date().toDateString())
  
  // CRITICAL FIX: Hooks must be called at top level, not inside useEffect
  // These hooks use other hooks internally, so they must be called unconditionally
  // If they throw errors during render, React error boundary will catch them
  // Wrapping in error boundary at component level ensures graceful degradation
  useBuddyContext()
  useBuddyReactions()

  // Track streak
  useEffect(() => {
    const today = new Date().toDateString()
    const lastInteractionDate = lastInteractionDateRef.current
    
    if (today !== lastInteractionDate) {
      // New day - check if streak continues
      const lastInteraction = buddyState.streak?.lastInteraction || Date.now()
      const daysSinceLastInteraction = Math.floor((Date.now() - lastInteraction) / (1000 * 60 * 60 * 24))
      
      if (daysSinceLastInteraction === 1) {
        // Streak continues
        const newStreak = (buddyState.streak?.current || 0) + 1
        updateBuddyStreak({
          current: newStreak,
          longest: Math.max(newStreak, buddyState.streak?.longest || 0),
          lastInteraction: Date.now(),
          broken: false,
        })
        
        // Milestone messages
        if (newStreak % 7 === 0) {
          addBuddyMessage({
            id: `buddy-streak-${Date.now()}`,
            message: getStreakMessage(newStreak, false, true),
            emotion: 'excited',
            timestamp: Date.now(),
            priority: 'medium',
          })
        }
      } else if (daysSinceLastInteraction > 1) {
        // Streak broken
        updateBuddyStreak({
          current: 0,
          broken: true,
          lastInteraction: Date.now(),
        })
        addBuddyMessage({
          id: `buddy-streak-${Date.now()}`,
          message: getStreakMessage(buddyState.streak?.current || 0, true, false),
          emotion: 'thinking',
          timestamp: Date.now(),
          priority: 'low',
        })
      }
      
      lastInteractionDateRef.current = today
    }
  }, [buddyState.streak, updateBuddyStreak, addBuddyMessage])

  // Update mood based on stats
  useEffect(() => {
    if (buddyState.stats) {
      const mood = determineMood(
        buddyState.stats,
        clickCount,
        buddyState.stats.errors
      )
      if (mood !== buddyState.mood) {
        setBuddyMood(mood)
      }
    }
  }, [buddyState.stats, buddyState.mood, clickCount, setBuddyMood])

  // Random events every 10-15 minutes
  useEffect(() => {
    const scheduleRandomEvent = () => {
      const delay = 10 * 60 * 1000 + Math.random() * 5 * 60 * 1000 // 10-15 minutes
      randomEventTimerRef.current = setTimeout(() => {
        if (Math.random() < 0.4) { // 40% chance
          const event = getRandomEvent(buddyState.stats?.errors)
          addBuddyMessage({
            id: `buddy-random-${Date.now()}`,
            message: event,
            emotion: 'thinking',
            timestamp: Date.now(),
            priority: 'low',
          })
        }
        scheduleRandomEvent() // Schedule next event
      }, delay)
    }
    
    scheduleRandomEvent()
    return () => {
      if (randomEventTimerRef.current) {
        clearTimeout(randomEventTimerRef.current)
      }
    }
  }, [addBuddyMessage, buddyState.stats?.errors])

  // Time-based roasts on first interaction of the hour
  useEffect(() => {
    const checkTimeBasedRoast = () => {
      const hour = new Date().getHours()
      const lastHour = localStorage.getItem('buddy-last-hour-roast')
      
      if (lastHour !== hour.toString()) {
        if (Math.random() < 0.3) { // 30% chance
          addBuddyMessage({
            id: `buddy-time-${Date.now()}`,
            message: getTimeBasedRoast(),
            emotion: 'neutral',
            timestamp: Date.now(),
            priority: 'low',
          })
          localStorage.setItem('buddy-last-hour-roast', hour.toString())
        }
      }
    }
    
    checkTimeBasedRoast()
    const interval = setInterval(checkTimeBasedRoast, 60 * 60 * 1000) // Check every hour
    return () => clearInterval(interval)
  }, [addBuddyMessage])

  // Comparison roasts occasionally
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1 && buddyState.stats) { // 10% chance every check
        const comparison = getComparisonRoast()
        addBuddyMessage({
          id: `buddy-comparison-${Date.now()}`,
          message: comparison,
          emotion: 'happy',
          timestamp: Date.now(),
          priority: 'low',
        })
      }
    }, 5 * 60 * 1000) // Check every 5 minutes
    
    return () => clearInterval(interval)
  }, [addBuddyMessage, buddyState.stats])

  // Stats roast when stats get high
  useEffect(() => {
    if (buddyState.stats && Math.random() < 0.2) {
      const statsRoast = getStatsRoast(buddyState.stats)
      if (statsRoast !== "Your stats are... acceptable. Barely.") {
        addBuddyMessage({
          id: `buddy-stats-${Date.now()}`,
          message: statsRoast,
          emotion: 'happy',
          timestamp: Date.now(),
          priority: 'low',
        })
      }
    }
  }, [buddyState.stats, addBuddyMessage])

  // Handle icon click with trolling
  const handleIconClick = useCallback(() => {
    const newCount = clickCount + 1
    setClickCount(newCount)
    setLastInteractionTime(Date.now())
    
    // Update stats
    updateBuddyStats({ totalClicks: (buddyState.stats?.totalClicks || 0) + 1 })
    
    // Update streak
    updateBuddyStreak({ lastInteraction: Date.now() })
    
    // Add interaction
    const interaction: BuddyInteraction = {
      id: `interaction-${Date.now()}`,
      type: 'click',
      timestamp: Date.now(),
    }
    setInteractions(prev => [...prev.slice(-49), interaction]) // Keep last 50
    
    // Get mood-based response
    const mood = buddyState.mood || 'sassy'
    const moodResponse = getMoodResponse(mood)
    
    // Determine response
    let response: string
    let emotion = getEmotionForInteraction('click')
    
    // Special responses for high click counts
    if (newCount === 10) {
      response = "10 clicks! You're persistent. I'll give you that."
      emotion = 'happy'
    } else if (newCount === 25) {
      response = "25 clicks. Are you okay? Do you need help?"
      emotion = 'thinking'
    } else if (newCount === 50) {
      response = "50 CLICKS! You've officially clicked me more than your work today. Achievement unlocked: 'Persistent Clicker' 🏆"
      emotion = 'excited'
    } else if (shouldTroll(interactions, lastInteractionTime)) {
      response = getTrollMessage()
      emotion = 'happy'
    } else if (shouldRagebait(interactions)) {
      response = getRagebaitMessage()
      emotion = 'excited'
    } else if (Math.random() < 0.3) {
      // 30% chance to use mood response
      response = moodResponse
    } else {
      response = getClickResponse(newCount)
    }
    
    // Add message
    addBuddyMessage({
      id: `buddy-click-${Date.now()}`,
      message: response,
      emotion,
      timestamp: Date.now(),
      priority: 'low',
    })
    
    // Set emotion
    setBuddyEmotion(emotion)
    
    // Reset emotion after 3 seconds
    setTimeout(() => {
      setBuddyEmotion('neutral')
    }, 3000)
  }, [clickCount, interactions, lastInteractionTime, addBuddyMessage, setBuddyEmotion, updateBuddyStats, updateBuddyStreak, buddyState.stats, buddyState.mood])

  // Monitor idle time and troll user
  useEffect(() => {
    const interval = setInterval(() => {
      const idleMinutes = Math.floor((Date.now() - lastInteractionTime) / 60000)
      
      // Troll if idle for more than 3 minutes
      if (idleMinutes >= 3 && Math.random() < 0.3) {
        const idleResponse = getIdleMessage(idleMinutes)
        addBuddyMessage({
          id: `buddy-idle-${Date.now()}`,
          message: idleResponse,
          emotion: 'thinking',
          timestamp: Date.now(),
          priority: 'low',
        })
        setBuddyEmotion('thinking')
        setTimeout(() => setBuddyEmotion('neutral'), 3000)
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [lastInteractionTime, addBuddyMessage, setBuddyEmotion])

  // Calculate position based on docked state
  const getPosition = () => {
    if (typeof buddyState.position === 'string') {
      switch (buddyState.position) {
        case 'top-left':
          return { top: '80px', left: '20px' }
        case 'top-right':
          return { top: '80px', right: '20px' }
        case 'top-center':
          return {
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)'
          }
        case 'bottom-left':
          return { bottom: '60px', left: '20px' }
        case 'bottom-right':
          return { bottom: '60px', right: '20px' }
        default:
          return {
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)'
          }
      }
    }
    return {
      top: `${buddyState.position.y}px`,
      left: `${buddyState.position.x}px`,
    }
  }

  const position = getPosition()

  return (
    <>
      <div
        className="fixed z-50 flex flex-col items-center"
        style={position}
      >
        {/* Icon always visible - now larger */}
        <div>
          <VoidBuddyIcon onExpand={handleIconClick} />
        </div>
        
        {/* Buddy's name - below icon */}
        <motion.h3
          className="text-xl font-semibold mt-2 text-center"
          style={{
            color: 'var(--text-primary, var(--void-text-primary))',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          Buddy
        </motion.h3>
      </div>
      
      {/* iPhone-style messages falling from the right */}
      <VoidBuddyMessages buddyPosition={position} />
      
      {/* Voice Capture Modal - still accessible via keyboard shortcuts */}
      {user && <VoidVoiceCapture user={user} />}
    </>
  )
}
