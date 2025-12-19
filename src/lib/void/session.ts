/**
 * VOID OS Session Management
 */

import { getSession, clearSession, refreshToken } from './auth'

export interface SessionInfo {
  userId: string
  email: string
  createdAt: number
  lastActivity: number
  ipAddress?: string
  userAgent?: string
}

const MAX_SESSIONS = 5
const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes

/**
 * Get all active sessions
 */
export function getActiveSessions(): SessionInfo[] {
  try {
    const stored = localStorage.getItem('void-active-sessions')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('[Session] Failed to get active sessions:', error)
  }
  return []
}

/**
 * Save active sessions
 */
export function saveActiveSessions(sessions: SessionInfo[]): void {
  try {
    // Limit to max sessions
    const limited = sessions.slice(0, MAX_SESSIONS)
    localStorage.setItem('void-active-sessions', JSON.stringify(limited))
  } catch (error) {
    console.error('[Session] Failed to save active sessions:', error)
  }
}

/**
 * Add new session
 */
export function addSession(session: SessionInfo): void {
  const sessions = getActiveSessions()
  
  // Remove existing session for same user
  const filtered = sessions.filter(s => s.userId !== session.userId)
  
  // Add new session
  filtered.unshift(session)
  
  saveActiveSessions(filtered)
}

/**
 * Remove session
 */
export function removeSession(userId: string): void {
  const sessions = getActiveSessions()
  const filtered = sessions.filter(s => s.userId !== userId)
  saveActiveSessions(filtered)
}

/**
 * Update last activity
 */
export function updateLastActivity(userId: string): void {
  const sessions = getActiveSessions()
  const updated = sessions.map(s =>
    s.userId === userId
      ? { ...s, lastActivity: Date.now() }
      : s
  )
  saveActiveSessions(updated)
}

/**
 * Check for inactive sessions
 */
export function checkInactiveSessions(): void {
  const sessions = getActiveSessions()
  const now = Date.now()
  const active = sessions.filter(s => now - s.lastActivity < INACTIVITY_TIMEOUT)
  
  if (active.length < sessions.length) {
    saveActiveSessions(active)
    
    // Clear current session if inactive
    const current = getSession()
    if (current) {
      const currentSession = sessions.find(s => s.userId === current.userId)
      if (currentSession && now - currentSession.lastActivity >= INACTIVITY_TIMEOUT) {
        clearSession()
      }
    }
  }
}

/**
 * Auto-logout on inactivity
 */
export function setupInactivityTimer(): () => void {
  let timeoutId: NodeJS.Timeout | null = null
  
  const resetTimer = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      const current = getSession()
      if (current) {
        updateLastActivity(current.userId)
        checkInactiveSessions()
        
        // If session was cleared, reload
        if (!getSession()) {
          window.location.reload()
        }
      }
    }, INACTIVITY_TIMEOUT)
  }
  
  // Reset on user activity
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
  events.forEach(event => {
    document.addEventListener(event, resetTimer, { passive: true })
  })
  
  resetTimer()
  
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    events.forEach(event => {
      document.removeEventListener(event, resetTimer)
    })
  }
}
