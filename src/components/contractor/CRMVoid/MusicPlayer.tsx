import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, Pause, SkipBack, SkipForward, SpeakerHigh, SpeakerSlash,
  MusicNote, X
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { useLocalKV as useKV } from '@/hooks/useLocalKV'

interface MusicPlayerProps {
  className?: string
}

export function MusicPlayer({ className }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [playlist, setPlaylist] = useKV<string[]>('crm-void-playlist', [])
  const [currentTrackIndex, setCurrentTrackIndex] = useKV<number>('crm-void-current-track', 0)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0)
      })
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0)
      })
      audioRef.current.addEventListener('ended', () => {
        handleNext()
      })
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err)
          // If no track is loaded, use a placeholder
          if (!playlist || playlist.length === 0) {
            // Create a silent audio track as placeholder
            const silentAudio = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKzn8LZjGwU7kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUrgc7y2Yk2CBtpvfDknE4MDlCs5/C2YxsFO5HX8sx5LAUkd8fw3ZBACg=='
            audioRef.current.src = silentAudio
            audioRef.current.play()
          }
        })
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handlePrevious = () => {
    if (playlist && playlist.length > 0) {
      const newIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : playlist.length - 1
      setCurrentTrackIndex(newIndex)
      if (audioRef.current) {
        audioRef.current.src = playlist[newIndex]
        audioRef.current.load()
        if (isPlaying) {
          audioRef.current.play()
        }
      }
    }
  }

  const handleNext = () => {
    if (playlist && playlist.length > 0) {
      const newIndex = currentTrackIndex < playlist.length - 1 ? currentTrackIndex + 1 : 0
      setCurrentTrackIndex(newIndex)
      if (audioRef.current) {
        audioRef.current.src = playlist[newIndex]
        audioRef.current.load()
        if (isPlaying) {
          audioRef.current.play()
        }
      }
    }
  }

  const handleSeek = (value: number[]) => {
    const newTime = value[0]
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    setIsMuted(false)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      className={cn(
        "fixed bottom-8 right-8 z-50",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden">
        {!isMinimized ? (
          <div className="p-4 space-y-3 min-w-[320px]">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MusicNote size={20} className="text-cyan-400" weight="fill" />
                <span className="text-white text-sm font-semibold">Music Player</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-6 w-6 p-0 text-white/60 hover:text-white"
              >
                <X size={14} />
              </Button>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-white/60">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                className="h-8 w-8 p-0 text-white hover:bg-white/10"
              >
                <SkipBack size={16} weight="fill" />
              </Button>
              <Button
                variant="default"
                size="lg"
                onClick={handlePlayPause}
                className="h-10 w-10 p-0 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full"
              >
                {isPlaying ? (
                  <Pause size={20} weight="fill" />
                ) : (
                  <Play size={20} weight="fill" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNext}
                className="h-8 w-8 p-0 text-white hover:bg-white/10"
              >
                <SkipForward size={16} weight="fill" />
              </Button>
            </div>

            {/* Volume control */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="h-6 w-6 p-0 text-white/60 hover:text-white"
              >
                {isMuted ? (
                  <SpeakerSlash size={14} weight="fill" />
                ) : (
                  <SpeakerHigh size={14} weight="fill" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="flex-1"
              />
            </div>

            {/* Track info */}
            {playlist && playlist.length > 0 && (
              <div className="text-center">
                <p className="text-xs text-white/80">
                  Track {currentTrackIndex + 1} of {playlist.length}
                </p>
              </div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="p-2"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(false)}
              className="h-10 w-10 p-0 text-white hover:bg-white/10 rounded-full"
            >
              <MusicNote size={20} className="text-cyan-400" weight="fill" />
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
