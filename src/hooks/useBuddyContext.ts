import { useEffect, useCallback } from 'react'
import { useVoidStore } from '@/lib/void/store'
import { getTimeBasedTrigger, getMockedMessage, shouldShowMessage, gatherContext } from '@/lib/void/buddyContext'
import type { BuddyMessage } from '@/lib/void/types'

export function useBuddyContext() {
  const { buddyState, addBuddyMessage, updateBuddyLastMessageTime } = useVoidStore()

  const generateMessage = useCallback((trigger: string, context?: Record<string, unknown>): BuddyMessage => {
    const message = getMockedMessage(trigger, context)
    const emotion = trigger.includes('Morning') || trigger.includes('closed') ? 'happy' : 'neutral'
    
    return {
      id: `buddy-msg-${Date.now()}`,
      message,
      emotion,
      timestamp: Date.now(),
      priority: trigger.includes('pending') || trigger.includes('need') ? 'high' : 'medium',
      suggestedActions: trigger.includes('leads') ? [
        { label: 'Draft Email', action: 'draft-email', params: {} },
        { label: 'Schedule Call', action: 'schedule-call', params: {} },
      ] : undefined,
    }
  }, [])

  const checkAndShowMessage = useCallback(() => {
    if (!shouldShowMessage(buddyState.lastMessageTime)) {
      return // Cooldown active
    }

    const trigger = getTimeBasedTrigger()
    if (!trigger) return

    const context = gatherContext()
    const message = generateMessage(trigger, context)
    addBuddyMessage(message)
  }, [buddyState.lastMessageTime, generateMessage, addBuddyMessage])

  // Check for messages periodically
  useEffect(() => {
    const interval = setInterval(() => {
      checkAndShowMessage()
    }, 60 * 1000) // Check every minute

    return () => clearInterval(interval)
  }, [checkAndShowMessage])

  return {
    generateMessage,
    checkAndShowMessage,
  }
}
