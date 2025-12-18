import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, Pause, SkipBack, SkipForward, SpeakerHigh, SpeakerSlash,
  MusicNote, X, Radio
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
  const [service, setService] = useKV<MusicService>('crm-void-music-service', MusicService.LOCAL)
  const [showServiceSelect, setShowServiceSelect] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)

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
        "glass-card rounded-2xl p-4",
        "backdrop-blur-[12px]",
        "shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(255,255,255,0.04)]",
        "min-w-[180px]",
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {!isMinimized ? (
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              {service === MusicService.SPOTIFY ? (
                <MusicNote size={16} className="text-green-500" weight="fill" />
              ) : service === MusicService.PANDORA ? (
                <Radio size={16} className="text-blue-500" weight="fill" />
              ) : (
                <MusicNote size={16} className="text-cyan-400" weight="fill" />
              )}
              <span className="text-xs font-semibold text-black dark:text-white">Music</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowServiceSelect(!showServiceSelect)}
                className="h-5 w-5 p-0 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                title="Select service"
              >
                <MusicNote size={10} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-5 w-5 p-0 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
              >
                <X size={12} />
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

          {/* Compact Controls */}
          <div className="flex items-center justify-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              className="h-7 w-7 p-0 text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10"
            >
              <SkipBack size={12} weight="fill" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handlePlayPause}
              className="h-8 w-8 p-0 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full"
            >
              {isPlaying ? (
                <Pause size={14} weight="fill" />
              ) : (
                <Play size={14} weight="fill" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              className="h-7 w-7 p-0 text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10"
            >
              <SkipForward size={12} weight="fill" />
            </Button>
          </div>

          {/* Compact Progress */}
          <div className="space-y-0.5">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="w-full h-1"
            />
            <div className="flex justify-between text-[10px] text-black/60 dark:text-white/60">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Compact Volume */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="h-5 w-5 p-0 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
            >
              {isMuted ? (
                <SpeakerSlash size={10} weight="fill" />
              ) : (
                <SpeakerHigh size={10} weight="fill" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="flex-1 h-1"
            />
          </div>

          {/* Track info */}
          {playlist && playlist.length > 0 && (
            <div className="text-center pt-1">
              <p className="text-[10px] text-black/70 dark:text-white/70">
                {currentTrackIndex + 1}/{playlist.length}
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
            className="h-8 w-8 p-0 text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10 rounded-full"
          >
            <MusicNote size={16} className="text-cyan-400" weight="fill" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
