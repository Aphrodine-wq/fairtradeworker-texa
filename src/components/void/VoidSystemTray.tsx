/**
 * VOID OS System Tray
 * Status icons and controls in top-right of toolbar
 */

import { useState } from 'react'
import { Bell, MusicNote, WifiHigh, WifiSlash, Sun, Moon, SpeakerHigh, SpeakerX, Clock, User } from '@phosphor-icons/react'
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
          <Bell weight="regular" className="void-tray-icon-svg" size={24} />
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
            <MusicNote weight="regular" className="void-tray-icon-svg" size={24} />
            {isPlaying && <div className="void-tray-music-pulse" />}
          </button>
        )}

        {/* Connection Status */}
        <div
          className="void-tray-icon void-tray-connection"
          title={isOnline ? 'Connected' : 'Offline'}
        >
          {isOnline ? (
            <WifiHigh weight="regular" className="void-tray-icon-svg" size={24} />
          ) : (
            <WifiSlash weight="regular" className="void-tray-icon-svg" size={24} />
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
            <Sun weight="regular" className="void-tray-icon-svg" size={24} />
          ) : (
            <Moon weight="regular" className="void-tray-icon-svg" size={24} />
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
            <SpeakerX weight="regular" className="void-tray-icon-svg" size={24} />
          ) : (
            <SpeakerHigh weight="regular" className="void-tray-icon-svg" size={24} />
          )}
        </button>

        {/* Clock/Calendar */}
        <button
          className="void-tray-icon void-tray-clock"
          onClick={() => setShowTimeMenu(!showTimeMenu)}
          aria-label="Time and date"
          title={formatDate()}
        >
          <Clock weight="regular" className="void-tray-icon-svg" size={24} />
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
            <User weight="regular" className="void-tray-icon-svg" size={24} />
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
