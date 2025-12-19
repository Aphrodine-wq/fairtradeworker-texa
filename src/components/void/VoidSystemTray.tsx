/**
 * VOID OS System Tray
 * Status icons and controls in top-right of toolbar
 */

import { useState } from 'react'
import { Bell, Music, Wifi, WifiOff, Sun, Moon, Volume2, VolumeX, Clock, User } from 'lucide-react'
import { useVoidStore } from '@/lib/void/store'
import { VoidNotificationCenter } from './VoidNotificationCenter'
import { VoidControlCenter } from './VoidControlCenter'
import '@/styles/void-system-tray.css'

interface VoidSystemTrayProps {
  user?: { fullName?: string; email?: string }
}

export function VoidSystemTray({ user }: VoidSystemTrayProps) {
  const {
    unreadCount,
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    theme,
    setTheme,
  } = useVoidStore()

  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false)
  const [controlCenterOpen, setControlCenterOpen] = useState(false)
  const [showTimeMenu, setShowTimeMenu] = useState(false)

  // Online/offline status
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Update online status
  useState(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  })

  // Format time
  const [currentTime, setCurrentTime] = useState(new Date())
  useState(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  })

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <>
      <div className="void-toolbar void-system-tray">
        {/* Notifications */}
        <button
          className="void-tray-icon void-tray-notifications"
          onClick={() => setNotificationCenterOpen(!notificationCenterOpen)}
          aria-label="Notifications"
        >
          <Bell className="void-tray-icon-svg" />
          {unreadCount > 0 && (
            <span className="void-tray-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>

        {/* Now Playing */}
        {currentTrack && (
          <button
            className="void-tray-icon void-tray-music"
            onClick={() => setControlCenterOpen(!controlCenterOpen)}
            aria-label="Now Playing"
            title={`${currentTrack.title} - ${currentTrack.artist}`}
          >
            <Music className="void-tray-icon-svg" />
            {isPlaying && <div className="void-tray-music-pulse" />}
          </button>
        )}

        {/* Connection Status */}
        <div
          className="void-tray-icon void-tray-connection"
          title={isOnline ? 'Connected' : 'Offline'}
        >
          {isOnline ? (
            <Wifi className="void-tray-icon-svg" />
          ) : (
            <WifiOff className="void-tray-icon-svg" />
          )}
        </div>

        {/* Theme Toggle */}
        <button
          className="void-tray-icon void-tray-theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="void-tray-icon-svg" />
          ) : (
            <Moon className="void-tray-icon-svg" />
          )}
        </button>

        {/* Volume */}
        <button
          className="void-tray-icon void-tray-volume"
          onClick={() => {
            // Toggle mute
            // This would be handled by media controls
          }}
          aria-label="Volume"
          title={`Volume: ${Math.round(volume * 100)}%`}
        >
          {isMuted ? (
            <VolumeX className="void-tray-icon-svg" />
          ) : (
            <Volume2 className="void-tray-icon-svg" />
          )}
        </button>

        {/* Clock/Calendar */}
        <button
          className="void-tray-icon void-tray-clock"
          onClick={() => setShowTimeMenu(!showTimeMenu)}
          aria-label="Time and date"
          title={formatDate()}
        >
          <Clock className="void-tray-icon-svg" />
          <span className="void-tray-clock-text">{formatTime()}</span>
          {showTimeMenu && (
            <div className="void-tray-clock-menu">
              <div className="void-tray-clock-menu-date">{formatDate()}</div>
              <div className="void-tray-clock-menu-time">{formatTime()}</div>
            </div>
          )}
        </button>

        {/* Profile */}
        {user && (
          <button
            className="void-tray-icon void-tray-profile"
            aria-label="Profile"
            title={user.fullName || user.email}
          >
            <User className="void-tray-icon-svg" />
          </button>
        )}
      </div>

      {/* Notification Center */}
      <VoidNotificationCenter
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
      />

      {/* Control Center */}
      <VoidControlCenter
        isOpen={controlCenterOpen}
        onClose={() => setControlCenterOpen(false)}
      />
    </>
  )
}
