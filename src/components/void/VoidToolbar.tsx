import { Gear, House, Briefcase, ChartLine } from '@phosphor-icons/react'
import { VoidSystemTray } from './VoidSystemTray'
import { useVoidStore } from '@/lib/void/store'
import type { User } from '@/lib/types'
import '@/styles/void-os-layers.css'
import '@/styles/void-toolbar.css'

interface VoidToolbarProps {
  user: User
  onNavigate?: (page: string) => void
}

export function VoidToolbar({ user, onNavigate }: VoidToolbarProps) {
  const { openWindow } = useVoidStore()

  const handleFTWNavigation = (page: string) => {
    if (onNavigate) {
      onNavigate(page)
    } else {
      // Fallback: try to navigate via window location
      window.location.href = `#${page}`
    }
  }

  return (
    <div className="void-toolbar void-toolbar-container">
      {/* Left: Logo, FTW Quick Access, and Settings */}
      <div className="void-toolbar-left">
        <div className="void-toolbar-logo">VOID</div>
        
        {/* FTW Quick Access */}
        <div className="flex items-center gap-1 ml-4">
          <button
            className="void-toolbar-button"
            onClick={() => handleFTWNavigation('home')}
            aria-label="FTW Home"
            title="Go to FTW Home"
          >
            <House weight="regular" size={18} />
          </button>
          <button
            className="void-toolbar-button"
            onClick={() => handleFTWNavigation('dashboard')}
            aria-label="FTW Dashboard"
            title="Go to FTW Dashboard"
          >
            <ChartLine weight="regular" size={18} />
          </button>
          <button
            className="void-toolbar-button"
            onClick={() => handleFTWNavigation('browse-jobs')}
            aria-label="Browse Jobs"
            title="Browse Jobs"
          >
            <Briefcase weight="regular" size={18} />
          </button>
        </div>
        
        <button
          className="void-toolbar-button void-toolbar-settings"
          onClick={() => openWindow('settings')}
          aria-label="Settings"
          title="Settings (⌘,)"
        >
          <Gear weight="regular" size={20} />
        </button>
      </div>

      {/* Right: System Tray */}
      <div className="void-toolbar-right">
        <VoidSystemTray user={user} />
      </div>
    </div>
  )
}
