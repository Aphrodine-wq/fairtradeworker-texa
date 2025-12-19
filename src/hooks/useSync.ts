/**
 * Hook for VOID OS Sync System
 */

import { useState, useEffect, useCallback } from 'react'
import {
  syncPendingChanges,
  getPendingChanges,
  getLastSync,
  updateLastSync,
  type SyncStatus,
  type PendingChange,
} from '@/lib/void/sync'

export function useSync() {
  const [status, setStatus] = useState<SyncStatus>(navigator.onLine ? 'online' : 'offline')
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([])
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setStatus('online')
      // Auto-sync when coming online
      handleSync()
    }
    const handleOffline = () => setStatus('offline')

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load pending changes and last sync time
  useEffect(() => {
    loadPendingChanges()
    loadLastSyncTime()
  }, [])

  const loadPendingChanges = useCallback(async () => {
    const changes = await getPendingChanges()
    setPendingChanges(changes)
  }, [])

  const loadLastSyncTime = useCallback(async () => {
    const time = await getLastSync()
    setLastSyncTime(time)
  }, [])

  const handleSync = useCallback(async () => {
    if (status !== 'online' || isSyncing) return

    setIsSyncing(true)
    setStatus('syncing')

    try {
      const result = await syncPendingChanges()
      await updateLastSync()
      await loadPendingChanges()
      await loadLastSyncTime()
      
      if (result.failed === 0) {
        setStatus('online')
      } else if (result.success > 0) {
        setStatus('online') // Partial success
      } else {
        setStatus('error')
      }
    } catch (error) {
      console.error('[Sync] Sync failed:', error)
      setStatus('error')
    } finally {
      setIsSyncing(false)
    }
  }, [status, isSyncing, loadPendingChanges, loadLastSyncTime])

  // Auto-sync every 30 seconds when online
  useEffect(() => {
    if (status !== 'online') return

    const interval = setInterval(() => {
      handleSync()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [status, handleSync])

  return {
    status,
    pendingChanges,
    pendingCount: pendingChanges.length,
    lastSyncTime,
    isSyncing,
    sync: handleSync,
    refresh: loadPendingChanges,
  }
}
