/**
 * Secure Storage Wrapper for VOID
 * Provides validation, integrity checks, error handling, and quota management
 */

const STORAGE_VERSION = '1.0.0'
const MAX_STORAGE_SIZE = 5 * 1024 * 1024 // 5MB limit
const STORAGE_PREFIX = 'void-secure:'

interface StorageItem<T> {
  version: string
  timestamp: number
  checksum?: string
  data: T
}

/**
 * Simple checksum for data integrity
 */
function calculateChecksum(data: string): string {
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Get storage size estimate
 */
function getStorageSize(): number {
  if (typeof localStorage === 'undefined') {
    return 0
  }
  
  let total = 0
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length
    }
  }
  return total
}

/**
 * Check if storage is available and has space
 */
function checkStorageAvailable(requiredSize: number): { available: boolean; error?: string } {
  if (typeof localStorage === 'undefined') {
    return { available: false, error: 'localStorage not available' }
  }
  
  try {
    const currentSize = getStorageSize()
    if (currentSize + requiredSize > MAX_STORAGE_SIZE) {
      return { available: false, error: 'Storage quota exceeded' }
    }
    
    // Test write
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return { available: true }
  } catch (error) {
    return { available: false, error: error instanceof Error ? error.message : 'Storage error' }
  }
}

/**
 * Secure set item with validation and error handling
 */
export function secureSetItem<T>(key: string, value: T): { success: boolean; error?: string } {
  try {
    const storageCheck = checkStorageAvailable(JSON.stringify(value).length)
    if (!storageCheck.available) {
      return { success: false, error: storageCheck.error }
    }
    
    const item: StorageItem<T> = {
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      data: value,
    }
    
    const serialized = JSON.stringify(item)
    item.checksum = calculateChecksum(serialized)
    
    const finalSerialized = JSON.stringify(item)
    const prefixedKey = `${STORAGE_PREFIX}${key}`
    
    localStorage.setItem(prefixedKey, finalSerialized)
    return { success: true }
  } catch (error) {
    console.error('[SecureStorage] Error setting item:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Secure get item with validation and integrity checking
 */
export function secureGetItem<T>(key: string, defaultValue: T): T {
  try {
    if (typeof localStorage === 'undefined') {
      return defaultValue
    }
    
    const prefixedKey = `${STORAGE_PREFIX}${key}`
    const raw = localStorage.getItem(prefixedKey)
    
    if (!raw) {
      return defaultValue
    }
    
    const item: StorageItem<T> = JSON.parse(raw)
    
    // Validate structure
    if (!item || typeof item !== 'object' || !item.data) {
      console.warn('[SecureStorage] Invalid item structure, using default')
      return defaultValue
    }
    
    // Verify checksum if present
    if (item.checksum) {
      const { checksum, ...itemWithoutChecksum } = item
      const expectedChecksum = calculateChecksum(JSON.stringify(itemWithoutChecksum))
      if (checksum !== expectedChecksum) {
        console.warn('[SecureStorage] Checksum mismatch, data may be corrupted')
        // Still return data but log warning
      }
    }
    
    // Check if data is too old (optional: expire after 90 days)
    const maxAge = 90 * 24 * 60 * 60 * 1000 // 90 days
    if (item.timestamp && Date.now() - item.timestamp > maxAge) {
      console.warn('[SecureStorage] Item expired, using default')
      secureRemoveItem(key)
      return defaultValue
    }
    
    return item.data
  } catch (error) {
    console.error('[SecureStorage] Error getting item:', error)
    return defaultValue
  }
}

/**
 * Secure remove item
 */
export function secureRemoveItem(key: string): void {
  try {
    if (typeof localStorage === 'undefined') {
      return
    }
    
    const prefixedKey = `${STORAGE_PREFIX}${key}`
    localStorage.removeItem(prefixedKey)
  } catch (error) {
    console.error('[SecureStorage] Error removing item:', error)
  }
}

/**
 * Clear all VOID secure storage
 */
export function secureClear(): void {
  try {
    if (typeof localStorage === 'undefined') {
      return
    }
    
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.error('[SecureStorage] Error clearing storage:', error)
  }
}

/**
 * Get storage quota information
 */
export function getStorageInfo(): {
  used: number
  available: number
  percentage: number
} {
  const used = getStorageSize()
  const available = MAX_STORAGE_SIZE - used
  const percentage = (used / MAX_STORAGE_SIZE) * 100
  
  return {
    used,
    available,
    percentage: Math.min(100, Math.max(0, percentage)),
  }
}
