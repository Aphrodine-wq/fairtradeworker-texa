/**
 * Media Session API wrapper for Windows media key support
 */

import type { Track } from './types'

interface MediaSessionHandlers {
  onPlay?: () => void
  onPause?: () => void
  onNext?: () => void
  onPrevious?: () => void
  onSeekBackward?: (details: MediaSessionActionDetails) => void
  onSeekForward?: (details: MediaSessionActionDetails) => void
  onSeekTo?: (details: MediaSessionSeekToActionDetails) => void
  onStop?: () => void
}

interface MediaSessionActionDetails {
  action: string
  seekOffset?: number
  seekTime?: number
  fastSeek?: boolean
}

interface MediaSessionSeekToActionDetails extends MediaSessionActionDetails {
  seekTime: number
}

/**
 * Initialize Media Session API with handlers
 */
export function initMediaSession(handlers: MediaSessionHandlers): void {
  if (!('mediaSession' in navigator)) {
    console.warn('Media Session API not supported')
    return
  }

  const { mediaSession } = navigator

  // Set action handlers
  if (handlers.onPlay) {
    mediaSession.setActionHandler('play', handlers.onPlay)
  }
  if (handlers.onPause) {
    mediaSession.setActionHandler('pause', handlers.onPause)
  }
  if (handlers.onNext) {
    mediaSession.setActionHandler('nexttrack', handlers.onNext)
  }
  if (handlers.onPrevious) {
    mediaSession.setActionHandler('previoustrack', handlers.onPrevious)
  }
  if (handlers.onSeekBackward) {
    mediaSession.setActionHandler('seekbackward', handlers.onSeekBackward)
  }
  if (handlers.onSeekForward) {
    mediaSession.setActionHandler('seekforward', handlers.onSeekForward)
  }
  if (handlers.onSeekTo) {
    mediaSession.setActionHandler('seekto', handlers.onSeekTo)
  }
  if (handlers.onStop) {
    mediaSession.setActionHandler('stop', handlers.onStop)
  }
}

/**
 * Update Media Session metadata
 */
export function updateMediaMetadata(track: Track | null, isPlaying: boolean): void {
  if (!('mediaSession' in navigator) || !track) {
    return
  }

  const { mediaSession } = navigator

  mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: track.artist,
    album: track.album || '',
    artwork: track.artwork
      ? [
          { src: track.artwork, sizes: '96x96', type: 'image/png' },
          { src: track.artwork, sizes: '128x128', type: 'image/png' },
          { src: track.artwork, sizes: '192x192', type: 'image/png' },
          { src: track.artwork, sizes: '256x256', type: 'image/png' },
          { src: track.artwork, sizes: '384x384', type: 'image/png' },
          { src: track.artwork, sizes: '512x512', type: 'image/png' },
        ]
      : [],
  })

  // Update playback state
  mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
}

/**
 * Update playback state
 */
export function updatePlaybackState(isPlaying: boolean): void {
  if (!('mediaSession' in navigator)) {
    return
  }

  navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
}

/**
 * Set position state for seeking
 */
export function setPositionState(
  duration: number,
  position: number,
  playbackRate: number = 1
): void {
  if (!('mediaSession' in navigator) || !('setPositionState' in navigator.mediaSession)) {
    return
  }

  try {
    navigator.mediaSession.setPositionState({
      duration,
      playbackRate,
      position,
    })
  } catch (error) {
    console.warn('Failed to set position state:', error)
  }
}

/**
 * Clear Media Session
 */
export function clearMediaSession(): void {
  if (!('mediaSession' in navigator)) {
    return
  }

  navigator.mediaSession.metadata = null
  navigator.mediaSession.playbackState = 'none'
}
