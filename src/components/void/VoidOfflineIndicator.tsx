/**
 * VOID OS Offline Indicator
 * Shows sync status and pending changes
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react'
import { useSync } from '@/hooks/useSync'
import '@/styles/void-offline.css'

export function VoidOfflineIndicator() {
  const { status, pendingCount, lastSyncTime, isSyncing, sync } = useSync()

  if (status === 'online' && pendingCount === 0) {
    return null
  }

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Never'
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <AnimatePresence>
      <motion.div
        className={`void-offline-indicator void-offline-${status}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <div className="void-offline-content">
          {status === 'offline' ? (
            <>
              <WifiOff className="void-offline-icon" />
              <div className="void-offline-text">
                <div className="void-offline-title">Offline</div>
                {pendingCount > 0 && (
                  <div className="void-offline-subtitle">{pendingCount} changes pending</div>
                )}
              </div>
            </>
          ) : status === 'syncing' ? (
            <>
              <RefreshCw className="void-offline-icon void-offline-icon-spinning" />
              <div className="void-offline-text">
                <div className="void-offline-title">Syncing...</div>
                <div className="void-offline-subtitle">Uploading changes</div>
              </div>
            </>
          ) : status === 'error' ? (
            <>
              <AlertCircle className="void-offline-icon" />
              <div className="void-offline-text">
                <div className="void-offline-title">Sync Error</div>
                <div className="void-offline-subtitle">Some changes failed to sync</div>
              </div>
              <button
                className="void-offline-retry"
                onClick={sync}
                disabled={isSyncing}
              >
                Retry
              </button>
            </>
          ) : (
            <>
              <Wifi className="void-offline-icon" />
              <div className="void-offline-text">
                <div className="void-offline-title">Synced</div>
                <div className="void-offline-subtitle">Last sync: {formatLastSync(lastSyncTime)}</div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
