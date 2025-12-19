import { useState, useCallback, useEffect, useRef } from 'react'
import { useVoidStore } from '@/lib/void/store'
import { useBuddyContext } from '@/hooks/useBuddyContext'
import { useBuddyReactions } from '@/hooks/useBuddyReactions'
import { VoidBuddyIcon } from './VoidBuddyIcon'
import { VoidBuddyPanel } from './VoidBuddyPanel'
import { 
  getClickResponse, shouldTroll, shouldRagebait, getTrollMessage, getRagebaitMessage, 
  getEmotionForInteraction, getIdleMessage, getRandomEvent, getTimeBasedRoast, 
  getComparisonRoast, getStatsRoast, getStreakMessage,
  determineMood, getMoodResponse, type BuddyInteraction, type MiniGameType 
} from '@/lib/void/buddyPersonality'

interface VoidBuddyProps {
  userName: string
}

export function VoidBuddy({ userName }: VoidBuddyProps) {
  const { 
    buddyState, 
    addBuddyMessage, 
    setBuddyEmotion, 
    updateBuddyStats, 
    setBuddyMood, 
    updateBuddyStreak,
  } = useVoidStore()
  const [clickCount, setClickCount] = useState(0)
  const [interactions, setInteractions] = useState<BuddyInteraction[]>([])
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now())
  const [miniGame, setMiniGame] = useState<MiniGameType>(null)
  const randomEventTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastInteractionDateRef = useRef(new Date().toDateString())
  
  useBuddyContext() // Initialize context checking
  useBuddyReactions() // Track user actions and trigger reactions

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

  return (
    <div
      className="fixed z-50 flex flex-col items-center"
      style={getPosition()}
    >
      {/* Icon always visible */}
      <div className="mb-2">
        <VoidBuddyIcon onExpand={handleIconClick} />
      </div>
      {/* Panel always visible below icon */}
      <VoidBuddyPanel 
        userName={userName}
        stats={buddyState.stats}
        streak={buddyState.streak}
        mood={buddyState.mood}
        miniGame={miniGame}
        onMessageClick={() => {
          // Handle message click - troll response
          const trollResponse = Math.random() > 0.5 ? getTrollMessage() : getRagebaitMessage()
          addBuddyMessage({
            id: `buddy-response-${Date.now()}`,
            message: trollResponse,
            emotion: 'happy',
            timestamp: Date.now(),
            priority: 'low',
          })
          setBuddyEmotion('happy')
          setTimeout(() => setBuddyEmotion('neutral'), 3000)
        }}
        onStartMiniGame={(gameType) => setMiniGame(gameType)}
        onCloseMiniGame={() => setMiniGame(null)}
      />
    </div>
  )
}
