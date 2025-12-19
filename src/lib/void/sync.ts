/**
 * VOID OS Offline Mode & Sync
 */

export type SyncStatus = 'online' | 'offline' | 'syncing' | 'error'

export interface PendingChange {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: string // 'customer' | 'lead' | 'project' | 'invoice'
  data: any
  timestamp: number
}

const SYNC_DB_NAME = 'void-offline'
const SYNC_STORES = {
  customers: 'customers',
  leads: 'leads',
  projects: 'projects',
  invoices: 'invoices',
  pendingChanges: 'pendingChanges',
  syncMeta: 'syncMeta',
}

/**
 * Initialize IndexedDB for offline storage
 */
async function initSyncDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SYNC_DB_NAME, 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      
      // Create object stores
      Object.values(SYNC_STORES).forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: 'id' })
          if (storeName === 'pendingChanges') {
            store.createIndex('timestamp', 'timestamp', { unique: false })
          }
        }
      })
    }
  })
}

/**
 * Cache entity for offline access
 */
export async function cacheEntity(
  entity: string,
  data: any
): Promise<void> {
  try {
    const db = await initSyncDB()
    const transaction = db.transaction([entity], 'readwrite')
    const store = transaction.objectStore(entity)
    await new Promise<void>((resolve, reject) => {
      const request = store.put({ id: data.id, ...data, cachedAt: Date.now() })
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('[Sync] Failed to cache entity:', error)
  }
}

/**
 * Get cached entities
 */
export async function getCachedEntities(entity: string): Promise<any[]> {
  try {
    const db = await initSyncDB()
    const transaction = db.transaction([entity], 'readonly')
    const store = transaction.objectStore(entity)
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('[Sync] Failed to get cached entities:', error)
    return []
  }
}

/**
 * Add pending change
 */
export async function addPendingChange(change: Omit<PendingChange, 'id' | 'timestamp'>): Promise<void> {
  try {
    const db = await initSyncDB()
    const transaction = db.transaction([SYNC_STORES.pendingChanges], 'readwrite')
    const store = transaction.objectStore(SYNC_STORES.pendingChanges)
    
    const pendingChange: PendingChange = {
      id: `change-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      ...change,
      timestamp: Date.now(),
    }
    
    await new Promise<void>((resolve, reject) => {
      const request = store.add(pendingChange)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('[Sync] Failed to add pending change:', error)
  }
}

/**
 * Get pending changes
 */
export async function getPendingChanges(): Promise<PendingChange[]> {
  try {
    const db = await initSyncDB()
    const transaction = db.transaction([SYNC_STORES.pendingChanges], 'readonly')
    const store = transaction.objectStore(SYNC_STORES.pendingChanges)
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('[Sync] Failed to get pending changes:', error)
    return []
  }
}

/**
 * Clear pending change
 */
export async function clearPendingChange(id: string): Promise<void> {
  try {
    const db = await initSyncDB()
    const transaction = db.transaction([SYNC_STORES.pendingChanges], 'readwrite')
    const store = transaction.objectStore(SYNC_STORES.pendingChanges)
    store.delete(id)
  } catch (error) {
    console.error('[Sync] Failed to clear pending change:', error)
  }
}

/**
 * Sync pending changes to server
 */
export async function syncPendingChanges(): Promise<{ success: number; failed: number }> {
  const changes = await getPendingChanges()
  let success = 0
  let failed = 0

  for (const change of changes) {
    try {
      // TODO: Implement actual API sync
      // const response = await fetch('/api/sync', {
      //   method: 'POST',
      //   body: JSON.stringify(change),
      // })
      // if (response.ok) {
      //   await clearPendingChange(change.id)
      //   success++
      // } else {
      //   failed++
      // }
      
      // Simulate sync for now
      await new Promise(resolve => setTimeout(resolve, 100))
      await clearPendingChange(change.id)
      success++
    } catch (error) {
      console.error('[Sync] Failed to sync change:', error)
      failed++
    }
  }

  return { success, failed }
}

/**
 * Update last sync timestamp
 */
export async function updateLastSync(): Promise<void> {
  try {
    const db = await initSyncDB()
    const transaction = db.transaction([SYNC_STORES.syncMeta], 'readwrite')
    const store = transaction.objectStore(SYNC_STORES.syncMeta)
    await new Promise<void>((resolve, reject) => {
      const request = store.put({ id: 'lastSync', timestamp: Date.now() })
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('[Sync] Failed to update last sync:', error)
  }
}

/**
 * Get last sync timestamp
 */
export async function getLastSync(): Promise<number | null> {
  try {
    const db = await initSyncDB()
    const transaction = db.transaction([SYNC_STORES.syncMeta], 'readonly')
    const store = transaction.objectStore(SYNC_STORES.syncMeta)
    return new Promise((resolve, reject) => {
      const request = store.get('lastSync')
      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.timestamp : null)
      }
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('[Sync] Failed to get last sync:', error)
    return null
  }
}
