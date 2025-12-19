import { useEffect, useRef } from 'react'
import { initMediaSession, updateMediaMetadata, updatePlaybackState, setPositionState, clearMediaSession } from '@/lib/music/mediaSession'
import type { Track } from '@/lib/music/types'

interface UseMediaSessionOptions {
  track: Track | null
  isPlaying: boolean
  currentTime?: number
  duration?: number
  onPlay?: () => void
  onPause?: () => void
  onNext?: () => void
  onPrevious?: () => void
  onSeekBackward?: (offset: number) => void
  onSeekForward?: (offset: number) => void
  onSeekTo?: (time: number) => void
  onStop?: () => void
}

/**
 * Hook for Media Session API integration
 */
export function useMediaSession(options: UseMediaSessionOptions): void {
  const {
    track,
    isPlaying,
    currentTime = 0,
    duration = 0,
    onPlay,
    onPause,
    onNext,
    onPrevious,
    onSeekBackward,
    onSeekForward,
    onSeekTo,
    onStop,
  } = options

  const handlersRef = useRef({
    onPlay,
    onPause,
    onNext,
    onPrevious,
    onSeekBackward,
    onSeekForward,
    onSeekTo,
    onStop,
  })

  // Update handlers ref when they change
  useEffect(() => {
    handlersRef.current = {
      onPlay,
      onPause,
      onNext,
      onPrevious,
      onSeekBackward,
      onSeekForward,
      onSeekTo,
      onStop,
    }
  }, [onPlay, onPause, onNext, onPrevious, onSeekBackward, onSeekForward, onSeekTo, onStop])

  // Initialize Media Session
  useEffect(() => {
    initMediaSession({
      onPlay: () => handlersRef.current.onPlay?.(),
      onPause: () => handlersRef.current.onPause?.(),
      onNext: () => handlersRef.current.onNext?.(),
      onPrevious: () => handlersRef.current.onPrevious?.(),
      onSeekBackward: (details) => {
        const offset = details.seekOffset || 10
        handlersRef.current.onSeekBackward?.(offset)
      },
      onSeekForward: (details) => {
        const offset = details.seekOffset || 10
        handlersRef.current.onSeekForward?.(offset)
      },
      onSeekTo: (details) => {
        const time = details.seekTime || 0
        handlersRef.current.onSeekTo?.(time)
      },
      onStop: () => handlersRef.current.onStop?.(),
    })

    return () => {
      clearMediaSession()
    }
  }, [])

  // Update metadata when track changes
  useEffect(() => {
    updateMediaMetadata(track, isPlaying)
  }, [track, isPlaying])

  // Update playback state
  useEffect(() => {
    updatePlaybackState(isPlaying)
  }, [isPlaying])

  // Update position state for seeking
  useEffect(() => {
    if (duration > 0) {
      setPositionState(duration, currentTime)
    }
  }, [duration, currentTime])
}
