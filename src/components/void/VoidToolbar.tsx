/**
 * VOID Toolbar - Top fixed toolbar with logo, search, date, notifications, profile, and Spotify
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlass, Bell, User, CalendarBlank } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { VoidSpotifyPlayer } from './VoidSpotifyPlayer'

interface VoidToolbarProps {
  onSearch?: (query: string) => void
  onNotificationClick?: () => void
  onProfileClick?: () => void
}

export function VoidToolbar({ onSearch, onNotificationClick, onProfileClick }: VoidToolbarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationCount, setNotificationCount] = useState(3)
  const [currentDate, setCurrentDate] = useState(new Date())

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-[#00f0ff]/20">
      <div className="flex items-center justify-between px-6 py-3 h-16">
        {/* Left: Logo */}
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#8b5cf6] flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <motion.div
              className="absolute inset-0 rounded-full bg-[#00f0ff]"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ filter: 'blur(8px)' }}
            />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">VOID</span>
        </motion.div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <MagnifyingGlass 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00f0ff]" 
              size={18} 
              weight="duotone"
            />
            <Input
              type="text"
              placeholder="Search everything... (⌘K)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                onSearch?.(e.target.value)
              }}
              className={cn(
                "pl-10 bg-black/50 border-[#00f0ff]/30 text-white placeholder:text-gray-500",
                "focus:border-[#00f0ff] focus:ring-[#00f0ff]/20",
                "w-full"
              )}
            />
          </div>
        </div>

        {/* Right: Date, Notifications, Profile */}
        <div className="flex items-center gap-4">
          {/* Date/Time */}
          <Button
            variant="ghost"
            className="text-white hover:bg-[#00f0ff]/10 border border-transparent hover:border-[#00f0ff]/30"
            onClick={() => {
              // Open calendar dropdown
            }}
          >
            <CalendarBlank size={18} weight="duotone" className="mr-2" />
            <span className="text-sm font-mono">{formatDate(currentDate)}</span>
            <span className="text-xs text-gray-400 ml-2">{formatTime(currentDate)}</span>
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            className="relative text-white hover:bg-[#00f0ff]/10 border border-transparent hover:border-[#00f0ff]/30"
            onClick={onNotificationClick}
          >
            <Bell size={20} weight="duotone" />
            {notificationCount > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#f59e0b] flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <span className="text-xs font-bold text-black">{notificationCount}</span>
              </motion.div>
            )}
          </Button>

          {/* Profile */}
          <Button
            variant="ghost"
            className="text-white hover:bg-[#00f0ff]/10 border border-transparent hover:border-[#00f0ff]/30"
            onClick={onProfileClick}
          >
            <User size={20} weight="duotone" />
          </Button>
        </div>
      </div>

      {/* Spotify Player Strip */}
      <div className="border-t border-[#00f0ff]/10">
        <VoidSpotifyPlayer />
      </div>
    </div>
  )
}
