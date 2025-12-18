/**
 * VOID Spotify Player - Collapsed toolbar strip and expanded widget
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, SpeakerHigh, MusicNote } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { useLocalKV as useKV } from '@/hooks/useLocalKV'
import type { SpotifyState } from '@/lib/void/types'

interface VoidSpotifyPlayerProps {
  className?: string
}

export function VoidSpotifyPlayer({ className }: VoidSpotifyPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [spotifyState, setSpotifyState] = useKV<SpotifyState>('void-spotify-state', {
    isConnected: false,
    isPlaying: false,
    currentTrack: null,
    volume: 0.7,
    isShuffled: false,
    isRepeating: false,
  })

  // Collapsed strip view
  if (!isExpanded) {
    return (
      <div className={cn("flex items-center justify-between px-6 py-2 h-12 bg-black/30", className)}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <MusicNote size={16} weight="fill" className="text-[#00f0ff] flex-shrink-0" />
          {spotifyState.currentTrack ? (
            <>
              <span className="text-sm text-white truncate">
                {spotifyState.currentTrack.name} — {spotifyState.currentTrack.artist}
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-white hover:bg-[#00f0ff]/20"
                  onClick={() => setSpotifyState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
                >
                  {spotifyState.isPlaying ? (
                    <Pause size={14} weight="fill" />
                  ) : (
                    <Play size={14} weight="fill" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-white hover:bg-[#00f0ff]/20"
                  onClick={() => setIsExpanded(true)}
                >
                  <span className="text-xs">⬈</span>
                </Button>
              </div>
            </>
          ) : (
            <span className="text-sm text-gray-500">Not connected</span>
          )}
        </div>
      </div>
    )
  }

  // Expanded widget view
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "absolute top-16 right-6 w-80 bg-black/90 backdrop-blur-xl rounded-xl border border-[#00f0ff]/30 p-4 shadow-2xl",
        "z-50"
      )}
    >
      {spotifyState.currentTrack ? (
        <div className="space-y-4">
          {/* Album Art */}
          <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-[#00f0ff] to-[#8b5cf6]">
            {spotifyState.currentTrack.artwork ? (
              <img 
                src={spotifyState.currentTrack.artwork} 
                alt={spotifyState.currentTrack.album}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MusicNote size={48} weight="fill" className="text-white/50" />
              </div>
            )}
          </div>

          {/* Track Info */}
          <div>
            <h3 className="text-white font-bold text-lg truncate">{spotifyState.currentTrack.name}</h3>
            <p className="text-gray-400 text-sm truncate">{spotifyState.currentTrack.artist}</p>
            <p className="text-gray-500 text-xs truncate">{spotifyState.currentTrack.album}</p>
          </div>

          {/* Progress */}
          <div className="space-y-1">
            <Slider
              value={[spotifyState.currentTrack.currentTime]}
              max={spotifyState.currentTrack.duration}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formatTime(spotifyState.currentTrack.currentTime)}</span>
              <span>{formatTime(spotifyState.currentTrack.duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:bg-[#00f0ff]/20"
            >
              <SkipBack size={16} weight="fill" />
            </Button>
            <Button
              variant="default"
              size="lg"
              className="h-12 w-12 p-0 bg-gradient-to-br from-[#00f0ff] to-[#8b5cf6] hover:from-[#00d0df] hover:to-[#7b4ce6] text-white rounded-full"
              onClick={() => setSpotifyState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
            >
              {spotifyState.isPlaying ? (
                <Pause size={20} weight="fill" />
              ) : (
                <Play size={20} weight="fill" className="ml-0.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:bg-[#00f0ff]/20"
            >
              <SkipForward size={16} weight="fill" />
            </Button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <SpeakerHigh size={16} weight="duotone" className="text-gray-400" />
            <Slider
              value={[spotifyState.volume]}
              max={1}
              step={0.01}
              onValueChange={(value) => setSpotifyState(prev => ({ ...prev, volume: value[0] }))}
              className="flex-1"
            />
          </div>

          {/* Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-gray-400 hover:text-white hover:bg-[#00f0ff]/10"
            onClick={() => setIsExpanded(false)}
          >
            Collapse
          </Button>
        </div>
      ) : (
        <div className="text-center py-8 space-y-4">
          <MusicNote size={48} weight="duotone" className="text-[#00f0ff] mx-auto" />
          <p className="text-white font-medium">Connect Spotify</p>
          <Button
            variant="default"
            className="bg-[#1db954] hover:bg-[#1ed760] text-white"
            onClick={() => {
              // OAuth flow
            }}
          >
            Connect Spotify
          </Button>
        </div>
      )}
    </motion.div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
