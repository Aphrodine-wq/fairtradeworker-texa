/**
 * VOID OS Mission Control
 * Overview of all virtual desktops
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { useVoidStore } from '@/lib/void/store'
import { createDesktop } from '@/lib/void/virtualDesktops'
import type { VirtualDesktop } from '@/lib/void/virtualDesktops'
import '@/styles/void-mission-control.css'

interface VoidMissionControlProps {
  isOpen: boolean
  onClose: () => void
}

export function VoidMissionControl({ isOpen, onClose }: VoidMissionControlProps) {
  const {
    virtualDesktops,
    activeDesktopId,
    createDesktop: createDesktopInStore,
    switchDesktop: switchDesktopInStore,
  } = useVoidStore()

  const handleCreateDesktop = () => {
    const newDesktop = createDesktop(`Desktop ${virtualDesktops.length + 1}`)
    createDesktopInStore(newDesktop)
  }

  const handleSwitchDesktop = (desktopId: string) => {
    switchDesktopInStore(desktopId)
    onClose()
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
            className="void-mission-control-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Mission Control Panel */}
          <motion.div
            className="void-mission-control"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className="void-mission-control-header">
              <h2 className="void-mission-control-title">Mission Control</h2>
              <button
                className="void-mission-control-close"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="void-mission-control-close-icon" />
              </button>
            </div>

            <div className="void-mission-control-content">
              {/* Desktops Grid */}
              <div className="void-mission-control-desktops">
                {virtualDesktops.map((desktop) => (
                  <motion.div
                    key={desktop.id}
                    className={`void-mission-control-desktop ${desktop.id === activeDesktopId ? 'active' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleSwitchDesktop(desktop.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="void-mission-control-desktop-preview">
                      {/* Desktop preview would show windows here */}
                      <div className="void-mission-control-desktop-windows">
                        {/* Window previews */}
                      </div>
                    </div>
                    <div className="void-mission-control-desktop-name">{desktop.name}</div>
                    {desktop.id === activeDesktopId && (
                      <div className="void-mission-control-desktop-indicator">●</div>
                    )}
                  </motion.div>
                ))}

                {/* Add Desktop Button */}
                <motion.button
                  className="void-mission-control-add"
                  onClick={handleCreateDesktop}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="void-mission-control-add-icon" />
                  <span>Add Desktop</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
