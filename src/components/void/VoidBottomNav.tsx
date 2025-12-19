/**
 * VOID OS Bottom Navigation Bar
 * Provides quick access to common functions
 */

import { Home, Search, Settings, Bell, User } from '@phosphor-icons/react'
import { useVoidStore } from '@/lib/void/store'
import type { User as UserType } from '@/lib/types'
import '@/styles/void-bottom-nav.css'

interface VoidBottomNavProps {
  user: UserType
  onNavigate?: (page: string) => void
}

export function VoidBottomNav({ user, onNavigate }: VoidBottomNavProps) {
  const { openWindow, spotlightOpen, setSpotlightOpen } = useVoidStore()

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
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      action: () => openWindow('notifications'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      action: () => openWindow('settings'),
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      action: () => onNavigate?.('profile'),
    },
  ]

  return (
    <nav className="void-bottom-nav">
      <div className="void-bottom-nav-container">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className="void-bottom-nav-item"
              onClick={item.action}
              aria-label={item.label}
              title={item.label}
            >
              <Icon weight="regular" size={24} />
              <span className="void-bottom-nav-label">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
