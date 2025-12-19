import { useEffect } from 'react'
import { useVoidStore } from '@/lib/void/store'
import { spotifyAPI } from '@/lib/music/spotify'
import { MusicService } from '@/lib/music/types'

/**
 * Hook for CRM mood sync integration
 * - Buddy: "High-focus task detected → switch to instrumental"
 * - Voice capture: Auto-pause during recording
 * - Win: Play celebration sound
 * - Lead added: "Want to add a note while listening?"
 */
export function useCRMMoodSync() {
  const { voiceState, setIsPlaying, currentTrack, isPlaying } = useVoidStore()

  // Auto-pause during voice recording
  useEffect(() => {
    if (voiceState === 'recording' && isPlaying) {
      setIsPlaying(false)
      // Resume when recording stops
      return () => {
        if (voiceState !== 'recording') {
          setIsPlaying(true)
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
      // Play short, subtle celebration sound
      const audio = new Audio('/sounds/celebration.mp3')
      audio.volume = 0.3
      audio.play().catch(console.error)
    }

    // In a real implementation, these would be event listeners from buddyContext
    // For now, they're placeholders

    return () => {
      // Cleanup
    }
  }, [isPlaying, currentTrack])
}
