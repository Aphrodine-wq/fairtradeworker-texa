import { useEffect, useRef } from 'react'
import { useVoidStore } from '@/lib/void/store'
import { spotifyAPI } from '@/lib/music/spotify'
import { MusicService } from '@/lib/music/types'
import { rateLimit } from '@/lib/void/apiSecurity'

/**
 * Hook for CRM mood sync integration
 * - Buddy: "High-focus task detected → switch to instrumental"
 * - Voice capture: Auto-pause during recording
 * - Win: Play celebration sound
 * - Lead added: "Want to add a note while listening?"
 */
export function useCRMMoodSync() {
  const { voiceState, setIsPlaying, currentTrack, isPlaying } = useVoidStore()
  const lastActionTimeRef = useRef<number>(0)

  // Auto-pause during voice recording
  useEffect(() => {
    if (voiceState === 'recording' && isPlaying) {
      // Rate limit actions
      const now = Date.now()
      if (now - lastActionTimeRef.current < 1000) {
        return // Throttle to once per second
      }
      lastActionTimeRef.current = now
      
      setIsPlaying(false)
      // Resume when recording stops
      return () => {
        if (voiceState !== 'recording') {
          const resumeLimit = rateLimit('crm-resume', 10, 60000) // 10 resumes per minute
          if (resumeLimit.allowed) {
            setIsPlaying(true)
          }
        }
      }
    }
  }, [voiceState, isPlaying, setIsPlaying])

  // Listen for buddy mood events (simplified - would need actual event system)
  useEffect(() => {
    // High-focus task detected → switch to instrumental
    // This would be triggered by buddy context in a real implementation
    const handleFocusMode = () => {
      // TODO: Switch to instrumental playlist
      console.log('Switching to instrumental playlist for focus mode')
    }

    // Lead added event
    const handleLeadAdded = () => {
      if (isPlaying && currentTrack) {
        // Show notification: "Want to add a note while listening?"
        console.log('Lead added - offer to add note')
      }
    }

    // Win celebration
    const handleWin = () => {
      // Rate limit celebration sounds
      const limit = rateLimit('celebration-sound', 5, 60000) // 5 per minute
      if (!limit.allowed) return
      
      // Validate audio file path
      const audioPath = '/sounds/celebration.mp3'
      if (typeof audioPath !== 'string' || !audioPath.startsWith('/sounds/')) {
        console.warn('[CRM] Invalid audio path')
        return
      }
      
      // Play short, subtle celebration sound
      const audio = new Audio(audioPath)
      audio.volume = 0.3
      audio.play().catch((error) => {
        console.error('[CRM] Failed to play celebration sound:', error)
      })
    }

    // In a real implementation, these would be event listeners from buddyContext
    // For now, they're placeholders

    return () => {
      // Cleanup
    }
  }, [isPlaying, currentTrack])
}
