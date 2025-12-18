import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  SpeakerHigh, 
  SpeakerX,
  MusicNotes
} from "@phosphor-icons/react"

interface Track {
  id: number
  title: string
  artist: string
  duration: number // in seconds
}

const MOCK_PLAYLIST: Track[] = [
  { id: 1, title: "CRM Vibes", artist: "The Contractors", duration: 185 },
  { id: 2, title: "Zero Fees Anthem", artist: "FairTrade All-Stars", duration: 210 },
  { id: 3, title: "Building Dreams", artist: "The Pipeline Band", duration: 195 },
  { id: 4, title: "Invoice Paid", artist: "Cash Flow Crew", duration: 178 },
  { id: 5, title: "Job Well Done", artist: "The Finishers", duration: 220 },
]

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(75)
  const [isMuted, setIsMuted] = useState(false)

  const currentTrack = MOCK_PLAYLIST[currentTrackIndex]

  // Simulate playback progress
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= currentTrack.duration) {
          // Auto-advance to next track
          handleNext()
          return 0
        }
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, currentTrack.duration])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % MOCK_PLAYLIST.length)
    setProgress(0)
  }

  const handlePrevious = () => {
    if (progress > 5) {
      // If more than 5 seconds in, restart current track
      setProgress(0)
    } else {
      // Otherwise go to previous track
      setCurrentTrackIndex((prev) => 
        prev === 0 ? MOCK_PLAYLIST.length - 1 : prev - 1
      )
      setProgress(0)
    }
  }

  const handleProgressChange = (value: number[]) => {
    setProgress(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    if (value[0] > 0) {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="bg-white dark:bg-black border border-black/20 dark:border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-black dark:text-white">
          <MusicNotes weight="duotone" size={24} className="text-black dark:text-white" />
          CRM Void Radio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Track Info */}
        <div className="text-center space-y-1">
          <div className="text-lg font-semibold text-black dark:text-white">
            {currentTrack.title}
          </div>
          <div className="text-sm text-black/70 dark:text-white/70">
            {currentTrack.artist}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[progress]}
            max={currentTrack.duration}
            step={1}
            onValueChange={handleProgressChange}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-black/60 dark:text-white/60">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(currentTrack.duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            className="hover:bg-black/10 dark:hover:bg-white/10"
          >
            <SkipBack weight="fill" size={20} className="text-black dark:text-white" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            onClick={handlePlayPause}
            className="h-12 w-12 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 shadow-md hover:shadow-lg transition-all"
          >
            {isPlaying ? (
              <Pause weight="fill" size={24} />
            ) : (
              <Play weight="fill" size={24} />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="hover:bg-black/10 dark:hover:bg-white/10"
          >
            <SkipForward weight="fill" size={20} className="text-black dark:text-white" />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="hover:bg-black/10 dark:hover:bg-white/10 shrink-0"
          >
            {isMuted || volume === 0 ? (
              <SpeakerX weight="fill" size={20} className="text-black dark:text-white" />
            ) : (
              <SpeakerHigh weight="fill" size={20} className="text-black dark:text-white" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="flex-1 cursor-pointer"
          />
        </div>

        {/* Track List Preview */}
        <div className="pt-2 border-t border-black/10 dark:border-white/10">
          <div className="text-xs text-black/60 dark:text-white/60 mb-2">
            Up Next
          </div>
          <div className="text-sm text-black/70 dark:text-white/70">
            {MOCK_PLAYLIST[(currentTrackIndex + 1) % MOCK_PLAYLIST.length].title}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
