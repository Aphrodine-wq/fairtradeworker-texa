import { VoidSystemTray } from './VoidSystemTray'
import type { User } from '@/lib/types'
import '@/styles/void-os-layers.css'
import '@/styles/void-toolbar.css'

interface VoidToolbarProps {
  user: User
  onNavigate?: (page: string) => void
}

export function VoidToolbar({ user, onNavigate }: VoidToolbarProps) {
  return (
    <div className="void-toolbar void-toolbar-container">
      {/* Left: Logo */}
      <div className="void-toolbar-left">
        <div className="void-toolbar-logo">VOID</div>
      </div>

      {/* Right: System Tray */}
      <div className="void-toolbar-right">
        <VoidSystemTray user={user} />
      </div>
    </div>
  )
}
