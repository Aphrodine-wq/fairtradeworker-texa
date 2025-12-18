import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { 
  Play, Pause, SkipBack, SkipForward, SpeakerHigh, SpeakerSlash,
  MusicNote, X, Radio, DotsSixVertical
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { useLocalKV as useKV } from '@/hooks/useLocalKV'
import { MusicService } from '@/lib/music/types'
import { getSpotifyConfig, authenticateSpotify } from '@/lib/music/spotify'
import { getPandoraConfig, authenticatePandora } from '@/lib/music/pandora'

interface MusicPlayerProps {
  className?: string
  position?: { x: number; y: number }
  onDragEnd?: (position: { x: number; y: number }) => void
  isDraggable?: boolean
}

export function MusicPlayer({ className, position, onDragEnd, isDraggable = true }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [playlist, setPlaylist] = useKV<string[]>('crm-void-playlist', [])
  const [currentTrackIndex, setCurrentTrackIndex] = useKV<number>('crm-void-current-track', 0)
  const [service, setService] = useKV<MusicService>('crm-void-music-service', MusicService.LOCAL)
  const [showServiceSelect, setShowServiceSelect] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [playerPosition, setPlayerPosition] = useState(position || { x: 0, y: 0 })
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // Update position when prop changes
  useEffect(() => {
    if (position) {
      setPlayerPosition(position)
    }
  }, [position])
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false)
    if (onDragEnd) {
      const newX = playerPosition.x + info.offset.x
      const newY = playerPosition.y + info.offset.y
      const constrainedPos = constrainToBounds(newX, newY)
      setPlayerPosition(constrainedPos)
      onDragEnd(constrainedPos)
    }
  }
  
  // Constrain position to viewport bounds
  const constrainToBounds = (x: number, y: number) => {
    const maxX = window.innerWidth / 2 - 200 // Half player width
    const maxY = window.innerHeight / 2 - 150 // Half player height
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y))
    }
  }

  // Check service authentication status
  useEffect(() => {
    if (service === MusicService.SPOTIFY) {
      const config = getSpotifyConfig()
      if (!config?.isAuthenticated) {
        setService(MusicService.LOCAL)
      }
    } else if (service === MusicService.PANDORA) {
      const config = getPandoraConfig()
      if (!config?.isAuthenticated) {
        setService(MusicService.LOCAL)
      }
    }
  }, [service, setService])

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
        "absolute",
        className
      )}
      style={{
        left: '50%',
        top: '50%',
        zIndex: isDragging ? 50 : 30,
        cursor: isDraggable ? (isDragging ? 'grabbing' : 'grab') : 'default',
      }}
      initial={false}
      animate={{ 
        x: playerPosition.x, 
        y: playerPosition.y,
        opacity: 1,
        scale: isDragging ? 1.05 : 1,
      }}
      drag={isDraggable}
      dragMomentum={false}
      dragElastic={0.1}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05, zIndex: 50 }}
      transition={{ 
        type: 'spring', 
        stiffness: 900, 
        damping: 18,
        mass: 0.35,
      }}
    >
      <motion.div
        className={cn(
          "glass-card rounded-3xl p-6",
          "backdrop-blur-[16px]",
          "shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(255,255,255,0.12)]",
          "min-w-[320px] max-w-[400px]",
          "bg-white/90 dark:bg-black/90",
          "border border-white/20 dark:border-white/10",
        )}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
      {!isMinimized ? (
        <div className="space-y-4">
          {/* Header with drag handle */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isDraggable && (
                <DotsSixVertical size={16} className="text-black/40 dark:text-white/40 cursor-grab active:cursor-grabbing" />
              )}
              {service === MusicService.SPOTIFY ? (
                <MusicNote size={20} className="text-green-500" weight="fill" />
              ) : service === MusicService.PANDORA ? (
                <Radio size={20} className="text-blue-500" weight="fill" />
              ) : (
                <MusicNote size={20} className="text-cyan-400" weight="fill" />
              )}
              <span className="text-sm font-bold text-black dark:text-white">Music Player</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowServiceSelect(!showServiceSelect)}
                className="h-7 w-7 p-0 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 rounded-lg"
                title="Select service"
              >
                <MusicNote size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-7 w-7 p-0 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 rounded-lg"
              >
                <X size={14} />
              </Button>
            </div>
          </div>

          {/* Service Selection */}
          <AnimatePresence>
            {showServiceSelect && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2 space-y-1"
              >
                <Button
                  variant={service === MusicService.LOCAL ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setService(MusicService.LOCAL)
                    setShowServiceSelect(false)
                  }}
                  className="w-full h-6 text-[10px] justify-start"
                >
                  <MusicNote size={10} className="mr-1" />
                  Local
                </Button>
                <Button
                  variant={service === MusicService.SPOTIFY ? 'default' : 'ghost'}
                  size="sm"
                  onClick={async () => {
                    const config = getSpotifyConfig()
                    if (!config?.isAuthenticated) {
                      await authenticateSpotify()
                    } else {
                      setService(MusicService.SPOTIFY)
                      setShowServiceSelect(false)
                    }
                  }}
                  className="w-full h-6 text-[10px] justify-start"
                >
                  <MusicNote size={10} className="mr-1 text-green-500" />
                  Spotify
                </Button>
                <Button
                  variant={service === MusicService.PANDORA ? 'default' : 'ghost'}
                  size="sm"
                  onClick={async () => {
                    const config = getPandoraConfig()
                    if (!config?.isAuthenticated) {
                      await authenticatePandora()
                    } else {
                      setService(MusicService.PANDORA)
                      setShowServiceSelect(false)
                    }
                  }}
                  className="w-full h-6 text-[10px] justify-start"
                >
                  <Radio size={10} className="mr-1 text-blue-500" />
                  Pandora
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modern Controls */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              className="h-10 w-10 p-0 text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-all hover:scale-110"
            >
              <SkipBack size={18} weight="fill" />
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={handlePlayPause}
              className="h-14 w-14 p-0 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
            >
              {isPlaying ? (
                <Pause size={20} weight="fill" />
              ) : (
                <Play size={20} weight="fill" className="ml-0.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              className="h-10 w-10 p-0 text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-all hover:scale-110"
            >
              <SkipForward size={18} weight="fill" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="w-full h-2"
            />
            <div className="flex justify-between text-xs font-medium text-black/70 dark:text-white/70">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="h-8 w-8 p-0 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-all"
            >
              {isMuted ? (
                <SpeakerSlash size={16} weight="fill" />
              ) : (
                <SpeakerHigh size={16} weight="fill" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="flex-1 h-2"
            />
          </div>

          {/* Track info */}
          {playlist && playlist.length > 0 && (
            <div className="text-center pt-2 border-t border-black/10 dark:border-white/10">
              <p className="text-xs font-medium text-black/70 dark:text-white/70">
                Track {currentTrackIndex + 1} of {playlist.length}
              </p>
            </div>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-center"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(false)}
            className="h-10 w-10 p-0 text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-all hover:scale-110"
          >
            <MusicNote size={20} className="text-cyan-400" weight="fill" />
          </Button>
        </motion.div>
      )}
      </motion.div>
    </motion.div>
  )
}
