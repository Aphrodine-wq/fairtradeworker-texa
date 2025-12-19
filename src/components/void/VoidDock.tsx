/**
 * VOID OS Dock Component
 * macOS-style dock with app icons
 */

import { motion } from 'framer-motion'
import { useVoidStore } from '@/lib/void/store'
import { useSettings } from '@/hooks/useSettings'
import '@/styles/void-dock.css'

export function VoidDock() {
  const { windows, openWindow, activeWindowId } = useVoidStore()
  const { settings } = useSettings()
  
  // Only show dock if dockStyle is 'dock'
  if (settings.dockStyle !== 'dock') {
    return null
  }

  const dockApps = [
    { id: 'customers', name: 'Customers', icon: '📁' },
    { id: 'leads', name: 'Leads', icon: '📋' },
    { id: 'projects', name: 'Projects', icon: '📊' },
    { id: 'invoices', name: 'Invoices', icon: '💰' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
  ]

  return (
    <div className="void-dock">
      <div className="void-dock-container">
        {dockApps.map((app) => {
          const isOpen = windows.some(w => w.menuId === app.id)
          const isActive = windows.some(w => w.id === activeWindowId && w.menuId === app.id)
          
          return (
            <motion.button
              key={app.id}
              className={`void-dock-item ${isOpen ? 'open' : ''} ${isActive ? 'active' : ''}`}
              onClick={() => openWindow(app.id)}
              whileHover={{ scale: 1.2, y: -8 }}
              whileTap={{ scale: 1.1 }}
              title={app.name}
            >
              <div className="void-dock-icon">{app.icon}</div>
              {isOpen && <div className="void-dock-indicator" />}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
