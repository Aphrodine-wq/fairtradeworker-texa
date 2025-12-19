import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlayIcon, 
  PauseIcon, 
  ForwardIcon, 
  BackwardIcon,
  HeartIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/react/24/solid'
import { useVoidStore } from '@/lib/void/store'
import type { Track } from '@/lib/music/types'

interface NowPlayingWidgetProps {
  className?: string
}

export function NowPlayingWidget({ className = '' }: NowPlayingWidgetProps) {
  const { currentTrack, isPlaying, volume, isMuted, setIsPlaying, setVolume, setIsMuted } = useVoidStore()
  const [isLiked, setIsLiked] = useState(false)
  const marqueeRef = useRef<HTMLDivElement>(null)

  // Marquee animation for long track names
  useEffect(() => {
    if (!marqueeRef.current || !currentTrack) return

    const element = marqueeRef.current
    const textWidth = element.scrollWidth
    const containerWidth = element.clientWidth

    if (textWidth > containerWidth) {
      element.style.animation = 'marquee 10s linear infinite'
    } else {
      element.style.animation = 'none'
    }
  }, [currentTrack])

  if (!currentTrack) {
    return null
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleNext = () => {
    // TODO: Implement next track
    console.log('Next track')
  }

  const handlePrevious = () => {
    // TODO: Implement previous track
    console.log('Previous track')
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    // TODO: Implement like functionality
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (newVolume > 0 && isMuted) {
      setIsMuted(false)
    }
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
  }

  return (
    <motion.div
      className={`glass-panel p-3 flex items-center gap-3 ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {/* Album Art */}
      {currentTrack.artwork && (
        <motion.img
          src={currentTrack.artwork}
          alt={`${currentTrack.title} by ${currentTrack.artist}`}
          className="w-10 h-10 rounded-md object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.15 }}
        />
      )}

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <div
          ref={marqueeRef}
          className="text-sm font-medium truncate"
          style={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {currentTrack.title}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {currentTrack.artist}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <motion.button
          onClick={handlePrevious}
          className="p-1.5 rounded hover:bg-surface-secondary transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Previous track"
        >
          <BackwardIcon className="w-4 h-4" />
        </motion.button>

        <motion.button
          onClick={handlePlayPause}
          className="p-1.5 rounded hover:bg-surface-secondary transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <PauseIcon className="w-5 h-5" />
          ) : (
            <PlayIcon className="w-5 h-5" />
          )}
        </motion.button>

        <motion.button
          onClick={handleNext}
          className="p-1.5 rounded hover:bg-surface-secondary transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Next track"
        >
          <ForwardIcon className="w-4 h-4" />
        </motion.button>

        <motion.button
          onClick={handleLike}
          className={`p-1.5 rounded hover:bg-surface-secondary transition-colors ${
            isLiked ? 'text-red-500' : ''
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={isLiked ? 'Unlike' : 'Like'}
        >
          <HeartIcon className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </motion.button>

        {/* Volume Control */}
        <div className="flex items-center gap-1.5">
          <motion.button
            onClick={handleMuteToggle}
            className="p-1.5 rounded hover:bg-surface-secondary transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <SpeakerXMarkIcon className="w-4 h-4" />
            ) : (
              <SpeakerWaveIcon className="w-4 h-4" />
            )}
          </motion.button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 bg-surface-secondary rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--void-accent) 0%, var(--void-accent) ${(isMuted ? 0 : volume) * 100}%, var(--void-surface-secondary) ${(isMuted ? 0 : volume) * 100}%, var(--void-surface-secondary) 100%)`,
            }}
            aria-label="Volume"
          />
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </motion.div>
  )
}
