import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { useVoidStore } from '@/lib/void/store'
import { NowPlayingWidget } from './NowPlayingWidget'
import { useMediaSession } from '@/hooks/useMediaSession'

interface MediaToolbarProps {
  className?: string
}

export function MediaToolbar({ className = '' }: MediaToolbarProps) {
  const { currentTrack, isPlaying, setIsPlaying } = useVoidStore()
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)

  // Media Session integration
  useMediaSession({
    track: currentTrack,
    isPlaying,
    onPlay: () => setIsPlaying(true),
    onPause: () => setIsPlaying(false),
    onNext: () => {
      // TODO: Implement next track
      console.log('Next track from media keys')
    },
    onPrevious: () => {
      // TODO: Implement previous track
      console.log('Previous track from media keys')
    },
  })

  // Auto-minimize if no track playing
  useEffect(() => {
    if (!currentTrack) {
      setIsMinimized(true)
      setIsExpanded(false)
    } else {
      setIsMinimized(false)
    }
  }, [currentTrack])

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  // Marquee text for minimized state
  const trackName = currentTrack?.title || 'No track playing'

  return (
    <motion.div
      className={`fixed top-0 right-0 z-50 ${className}`}
      style={{
        right: 'calc(var(--header-width, 0px) + 1rem)',
        top: '1rem',
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <AnimatePresence mode="wait">
        {isMinimized ? (
          // Minimized state: 8px bar with track name marquee
          <motion.div
            key="minimized"
            className="glass-panel px-3 py-1 flex items-center gap-2 cursor-pointer"
            style={{ height: '8px' }}
            onClick={toggleExpand}
            initial={{ height: 40, opacity: 0 }}
            animate={{ height: 8, opacity: 1 }}
            exit={{ height: 40, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <div className="text-xs truncate flex-1 min-w-0">
              {trackName}
            </div>
            <ChevronUpIcon className="w-3 h-3" />
          </motion.div>
        ) : isExpanded ? (
          // Expanded state: 40px height with full controls
          <motion.div
            key="expanded"
            className="glass-panel"
            initial={{ height: 8, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 8, opacity: 0 }}
            transition={{ 
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
          >
            <div className="flex items-center justify-between p-2 border-b border-void-border">
              <div className="text-xs font-medium">Spotify</div>
              <motion.button
                onClick={toggleExpand}
                className="p-1 rounded hover:bg-surface-secondary transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Minimize"
              >
                <ChevronDownIcon className="w-4 h-4" />
              </motion.button>
            </div>
            <NowPlayingWidget />
          </motion.div>
        ) : (
          // Collapsed but visible state
          <motion.div
            key="collapsed"
            className="glass-panel px-3 py-2 flex items-center gap-2 cursor-pointer"
            style={{ height: '40px' }}
            onClick={toggleExpand}
            initial={{ height: 8, opacity: 0 }}
            animate={{ height: 40, opacity: 1 }}
            exit={{ height: 8, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {currentTrack?.artwork && (
              <img
                src={currentTrack.artwork}
                alt=""
                className="w-6 h-6 rounded object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{trackName}</div>
              <div className="text-xs text-muted-foreground truncate">
                {currentTrack?.artist}
              </div>
            </div>
            <ChevronUpIcon className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
