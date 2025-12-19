/**
 * VOID OS Bottom Navigation Bar
 * Modern CRM-style navigation with glassmorphism
 * Provides quick access to common functions
 */

import React from 'react'
import { Home, Search, Settings, Bell, MusicNote, GridFour } from '@phosphor-icons/react'
import { useVoidStore } from '@/lib/void/store'
import type { User as UserType } from '@/lib/types'
import '@/styles/void-bottom-nav.css'

interface VoidBottomNavProps {
  user: UserType
  onNavigate?: (page: string) => void
}

export function VoidBottomNav({ user, onNavigate }: VoidBottomNavProps) {
  const { openWindow, spotlightOpen, setSpotlightOpen, currentTrack } = useVoidStore()
  const [activePage, setActivePage] = React.useState('home')

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      action: () => {
        setActivePage('home')
        onNavigate?.('home')
      },
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      action: () => {
        setActivePage('search')
        setSpotlightOpen(!spotlightOpen)
      },
    },
    {
      id: 'music',
      label: 'Music',
      icon: MusicNote,
      action: () => {
        setActivePage('music')
        // Music player is always visible in MediaToolbar
        // This button can open control center or just focus music
        openWindow('music')
      },
    },
    {
      id: 'notifications',
      label: 'Alerts',
      icon: Bell,
      action: () => {
        setActivePage('notifications')
        openWindow('notifications')
      },
    },
    {
      id: 'modules',
      label: 'Apps',
      icon: GridFour,
      action: () => {
        setActivePage('modules')
        // Open modules window or spotlight
        setSpotlightOpen(true)
      },
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      action: () => {
        setActivePage('settings')
        openWindow('settings')
      },
    },
  ]

  return (
    <nav className="void-bottom-nav" role="navigation" aria-label="Main navigation">
      <div className="void-bottom-nav-container">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.id || (item.id === 'music' && currentTrack)
          return (
            <button
              key={item.id}
              className={`void-bottom-nav-item ${isActive ? 'active' : ''}`}
              onClick={item.action}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
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
