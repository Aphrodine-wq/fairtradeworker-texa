/**
 * VOID OS Control Center
 * Quick settings and controls panel
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, WifiHigh, WifiSlash, Bell, BellSlash, Target, Globe, MusicNote, TrendUp } from '@phosphor-icons/react'
import { useVoidStore } from '@/lib/void/store'
import '@/styles/void-control-center.css'

interface VoidControlCenterProps {
  isOpen: boolean
  onClose: () => void
}

export function VoidControlCenter({ isOpen, onClose }: VoidControlCenterProps) {
  const {
    theme,
    setTheme,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    wiremapEnabled,
    setWiremapEnabled,
    currentTrack,
    isPlaying,
  } = useVoidStore()

  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [brightness, setBrightness] = useState(100)
  const [doNotDisturb, setDoNotDisturb] = useState(false)
  const [focusMode, setFocusMode] = useState(false)

  // Online status
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

  // Mock stats (would come from store/API)
  const todayStats = {
    leads: 5,
    revenue: 12000,
  }

  if (!isOpen) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="void-control-center-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="void-system-control-center void-control-center"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="void-control-center-content">
              {/* Display Brightness */}
              <div className="void-control-section">
                <div className="void-control-section-header">
                  <Sun weight="regular" className="void-control-section-icon" size={24} />
                  <span className="void-control-section-title">DISPLAY</span>
                </div>
                <div className="void-control-slider-container">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="void-control-slider"
                  />
                  <span className="void-control-slider-value">{brightness}%</span>
                </div>
              </div>

              {/* Sound Volume */}
              <div className="void-control-section">
                <div className="void-control-section-header">
                  <MusicNote weight="regular" className="void-control-section-icon" size={24} />
                  <span className="void-control-section-title">SOUND</span>
                </div>
                <div className="void-control-slider-container">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(volume * 100)}
                    onChange={(e) => setVolume(Number(e.target.value) / 100)}
                    className="void-control-slider"
                  />
                  <span className="void-control-slider-value">{Math.round(volume * 100)}%</span>
                </div>
              </div>

              {/* Quick Toggles */}
              <div className="void-control-section">
                <div className="void-control-section-title">QUICK TOGGLES</div>
                <div className="void-control-toggles">
                  <button
                    className={`void-control-toggle ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    title="Dark Mode"
                  >
                    {theme === 'dark' ? <Moon weight="regular" className="void-control-toggle-icon" size={24} /> : <Sun weight="regular" className="void-control-toggle-icon" size={24} />}
                    <span className="void-control-toggle-label">Dark</span>
                  </button>

                  <button
                    className={`void-control-toggle ${isOnline ? 'active' : ''}`}
                    onClick={() => {}}
                    title="WiFi"
                    disabled
                  >
                    {isOnline ? <WifiHigh weight="regular" className="void-control-toggle-icon" size={24} /> : <WifiSlash weight="regular" className="void-control-toggle-icon" size={24} />}
                    <span className="void-control-toggle-label">WiFi</span>
                  </button>

                  <button
                    className={`void-control-toggle ${doNotDisturb ? 'active' : ''}`}
                    onClick={() => setDoNotDisturb(!doNotDisturb)}
                    title="Do Not Disturb"
                  >
                    {doNotDisturb ? <BellSlash weight="regular" className="void-control-toggle-icon" size={24} /> : <Bell weight="regular" className="void-control-toggle-icon" size={24} />}
                    <span className="void-control-toggle-label">DND</span>
                  </button>

                  <button
                    className={`void-control-toggle ${focusMode ? 'active' : ''}`}
                    onClick={() => setFocusMode(!focusMode)}
                    title="Focus Mode"
                  >
                    <Target weight="regular" className="void-control-toggle-icon" size={24} />
                    <span className="void-control-toggle-label">Focus</span>
                  </button>

                  <button
                    className={`void-control-toggle ${wiremapEnabled ? 'active' : ''}`}
                    onClick={() => setWiremapEnabled(!wiremapEnabled)}
                    title="Wiremap"
                  >
                    <Globe weight="regular" className="void-control-toggle-icon" size={24} />
                    <span className="void-control-toggle-label">Wire</span>
                  </button>
                </div>
              </div>

              {/* Now Playing */}
              {currentTrack && (
                <div className="void-control-section">
                  <div className="void-control-section-header">
                    <MusicNote weight="regular" className="void-control-section-icon" size={24} />
                    <span className="void-control-section-title">NOW PLAYING</span>
                  </div>
                  <div className="void-control-now-playing">
                    <div className="void-control-now-playing-info">
                      <div className="void-control-now-playing-title">{currentTrack.title}</div>
                      <div className="void-control-now-playing-artist">{currentTrack.artist}</div>
                    </div>
                    <div className="void-control-now-playing-status">
                      {isPlaying ? '▶' : '⏸'}
                    </div>
                  </div>
                </div>
              )}

              {/* Today Stats */}
              <div className="void-control-section">
                <div className="void-control-section-header">
                  <TrendUp weight="regular" className="void-control-section-icon" size={24} />
                  <span className="void-control-section-title">TODAY</span>
                </div>
                <div className="void-control-stats">
                  <div className="void-control-stat">
                    <div className="void-control-stat-label">Leads</div>
                    <div className="void-control-stat-value">{todayStats.leads} new</div>
                  </div>
                  <div className="void-control-stat">
                    <div className="void-control-stat-label">Revenue</div>
                    <div className="void-control-stat-value">${todayStats.revenue.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
