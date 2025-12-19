import { Gear } from '@phosphor-icons/react'
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

  return (
    <div className="void-toolbar void-toolbar-container">
      {/* Left: Logo and Settings */}
      <div className="void-toolbar-left">
        <div className="void-toolbar-logo">VOID</div>
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
