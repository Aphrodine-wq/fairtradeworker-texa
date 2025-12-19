/**
 * VOID OS Bottom Navigation Bar
 * Provides quick access to common functions
 */

import { Home, Search, Settings, Bell, User, MusicNote, GridFour } from '@phosphor-icons/react'
import { useVoidStore } from '@/lib/void/store'
import type { User as UserType } from '@/lib/types'
import '@/styles/void-bottom-nav.css'

interface VoidBottomNavProps {
  user: UserType
  onNavigate?: (page: string) => void
}

export function VoidBottomNav({ user, onNavigate }: VoidBottomNavProps) {
  const { openWindow, spotlightOpen, setSpotlightOpen, currentTrack, setControlCenterOpen } = useVoidStore()

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      action: () => onNavigate?.('home'),
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      action: () => setSpotlightOpen(!spotlightOpen),
    },
    {
      id: 'music',
      label: 'Music',
      icon: MusicNote,
      action: () => {
        // Music player is always visible in MediaToolbar
        // This button can open control center or just focus music
        openWindow('music')
      },
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      action: () => openWindow('notifications'),
    },
    {
      id: 'modules',
      label: 'Modules',
      icon: GridFour,
      action: () => {
        // Open modules window or spotlight
        setSpotlightOpen(true)
      },
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      action: () => openWindow('settings'),
    },
  ]

  return (
    <nav className="void-bottom-nav">
      <div className="void-bottom-nav-container">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.id === 'music' && currentTrack
          return (
            <button
              key={item.id}
              className={`void-bottom-nav-item ${isActive ? 'active' : ''}`}
              onClick={item.action}
              aria-label={item.label}
              title={item.label}
            >
              <Icon weight={isActive ? 'fill' : 'regular'} size={20} />
              <span className="void-bottom-nav-label">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
