/**
 * Buddy Reaction System Hook
 * Tracks user actions and triggers Buddy reactions
 */

import { useEffect } from 'react'
import { useVoidStore } from '@/lib/void/store'
import { getReactionMessage } from '@/lib/void/buddyPersonality'

export function useBuddyReactions() {
  const { 
    windows, 
    buddyState, 
    addBuddyMessage, 
    updateBuddyStats: updateStats,
    openWindow,
    closeWindow,
  } = useVoidStore()

  // Track window opens/closes
  useEffect(() => {
    const currentCount = windows.length
    const previousCount = window.buddyWindowCount || 0
    
    if (currentCount > previousCount) {
      // Window opened
      updateStats({ windowsOpened: (buddyState.stats?.windowsOpened || 0) + 1 })
      const reaction = getReactionMessage('window-opened', currentCount)
      addBuddyMessage({
        id: `buddy-reaction-${Date.now()}`,
        message: reaction,
        emotion: 'neutral',
        timestamp: Date.now(),
        priority: 'low',
      })
    } else if (currentCount < previousCount) {
      // Window closed
      updateStats({ windowsClosed: (buddyState.stats?.windowsClosed || 0) + 1 })
      const reaction = getReactionMessage('window-closed', currentCount)
      addBuddyMessage({
        id: `buddy-reaction-${Date.now()}`,
        message: reaction,
        emotion: 'happy',
        timestamp: Date.now(),
        priority: 'low',
      })
    }
    
    // @ts-ignore - Store window count globally for comparison
    window.buddyWindowCount = currentCount
  }, [windows.length, updateStats, addBuddyMessage, buddyState.stats])

  // Track settings opens
  useEffect(() => {
    const settingsWindow = windows.find(w => w.menuId === 'settings')
    if (settingsWindow && !window.buddySettingsOpened) {
      updateStats({ settingsOpened: (buddyState.stats?.settingsOpened || 0) + 1 })
      const reaction = getReactionMessage('settings-opened')
      addBuddyMessage({
        id: `buddy-reaction-${Date.now()}`,
        message: reaction,
        emotion: 'happy',
        timestamp: Date.now(),
        priority: 'low',
      })
      // @ts-ignore
      window.buddySettingsOpened = true
      setTimeout(() => {
        // @ts-ignore
        window.buddySettingsOpened = false
      }, 5000)
    }
  }, [windows, updateStats, addBuddyMessage, buddyState.stats])

  // Track errors (global error handler)
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      updateStats({ errors: (buddyState.stats?.errors || 0) + 1 })
      const reaction = getReactionMessage('error-occurred', buddyState.stats?.errors)
      addBuddyMessage({
        id: `buddy-error-${Date.now()}`,
        message: reaction,
        emotion: 'thinking',
        timestamp: Date.now(),
        priority: 'medium',
      })
    }

    window.addEventListener('error', errorHandler)
    return () => window.removeEventListener('error', errorHandler)
  }, [updateStats, addBuddyMessage, buddyState.stats])
}
