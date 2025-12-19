import { useState, useEffect, useCallback, useRef } from 'react'
import { debounce } from '@/lib/performance'
import { encryptData, decryptData } from '@/lib/security'

// Cache for decrypted values to avoid repeated decryption
const decryptionCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const MAX_CACHE_SIZE = 100 // Maximum number of cached entries

// Clean up cache: remove expired entries and enforce size limit
function cleanupCache() {
  const now = Date.now()
  
  // Remove expired entries
  for (const [key, value] of decryptionCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      decryptionCache.delete(key)
    }
  }
  
  // If still over limit, remove oldest entries (LRU)
  if (decryptionCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(decryptionCache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp) // Sort by timestamp (oldest first)
    const toRemove = entries.slice(0, decryptionCache.size - MAX_CACHE_SIZE)
    for (const [key] of toRemove) {
      decryptionCache.delete(key)
    }
  }
}

// Compression utility (simple JSON compression)
function compressData(data: string): string {
  try {
    // Simple compression: remove whitespace
    return JSON.stringify(JSON.parse(data))
  } catch {
    return data
  }
}

/**
 * Enhanced KV hook with encryption, compression, and debounced updates
 * Falls back to localStorage when Spark KV is unavailable
 */
export function useLocalKV<T>(
  key: string,
  initialValue: T,
  options?: {
    encrypt?: boolean
    debounceMs?: number
    compress?: boolean
  }
): [T, (value: T | ((prev: T) => T)) => void] {
  const { encrypt = false, debounceMs = 300, compress = true } = options || {}
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Safari iOS localStorage access can fail in private browsing mode
      if (typeof window === 'undefined' || !window.localStorage) {
        return initialValue
      }

      const item = window.localStorage.getItem(key)
      if (!item) return initialValue
      
      // Clean up cache periodically
      cleanupCache()
      
      // Check cache first
      const cached = decryptionCache.get(key)
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data as T
      }
      
      let parsed: T
      if (encrypt) {
        // For initial render, use cached value or try parsing as plain JSON
        // Async decryption will happen in useEffect
        try {
          // Try to parse as plain JSON first (fallback)
          parsed = JSON.parse(item) as T
          // Cache it for now, will be updated when async decryption completes
          decryptionCache.set(key, { data: parsed, timestamp: Date.now() })
        } catch {
          return initialValue
        }
      } else {
        parsed = JSON.parse(item)
      }
      
      // Cache decrypted value
      if (encrypt) {
        decryptionCache.set(key, { data: parsed, timestamp: Date.now() })
      }
      
      return parsed
    } catch (error) {
      // Safari iOS specific error handling
      if (error instanceof DOMException) {
        // QuotaExceededError or other DOM exceptions
        if (error.name === 'QuotaExceededError' || error.code === 22) {
          console.warn(`localStorage quota exceeded for ${key}, using initial value`)
          return initialValue
        }
        // SecurityError can occur in Safari private browsing
        if (error.name === 'SecurityError' || error.code === 18) {
          console.warn(`localStorage access denied for ${key} (possibly private browsing), using initial value`)
          return initialValue
        }
      }
      console.warn(`Error loading ${key} from localStorage:`, error)
      if (error instanceof Error) {
        console.error('Parse error details:', error.message)
      }
      return initialValue
    }
  })

  const isInitialized = useRef(false)
  const pendingUpdate = useRef<T | null>(null)

  // Debounced save function with Safari iOS error handling
  const debouncedSave = useCallback(
    debounce(async (value: T) => {
      try {
        // Check if localStorage is available
        if (typeof window === 'undefined' || !window.localStorage) {
          console.warn(`localStorage not available for ${key}`)
          return
        }

        let dataToStore = JSON.stringify(value)
        
        // Compress if enabled
        if (compress) {
          dataToStore = compressData(dataToStore)
        }
        
        // Encrypt if enabled
        if (encrypt) {
          dataToStore = await encryptData(dataToStore)
        }
        
        // Safari iOS specific error handling for localStorage.setItem
        try {
          window.localStorage.setItem(key, dataToStore)
        } catch (storageError) {
          // Handle quota exceeded error
          if (storageError instanceof DOMException) {
            if (storageError.name === 'QuotaExceededError' || storageError.code === 22) {
              console.warn(`localStorage quota exceeded for ${key}, attempting to clear old data`)
              
              // Try to clear old entries to free up space
              try {
                const keysToRemove: string[] = []
                for (let i = 0; i < window.localStorage.length; i++) {
                  const storageKey = window.localStorage.key(i)
                  if (storageKey && storageKey.startsWith('crm-void-') && storageKey !== key) {
                    keysToRemove.push(storageKey)
                  }
                }
                // Remove oldest entries first
                keysToRemove.slice(0, 5).forEach(k => {
                  try {
                    window.localStorage.removeItem(k)
                  } catch {
                    // Ignore individual removal errors
                  }
                })
                
                // Try again after clearing
                window.localStorage.setItem(key, dataToStore)
                console.info(`Successfully saved ${key} after clearing old data`)
              } catch (clearError) {
                console.error(`Failed to save ${key} even after clearing old data:`, clearError)
                // Don't throw - gracefully degrade
              }
              return
            }
            
            // SecurityError in Safari private browsing
            if (storageError.name === 'SecurityError' || storageError.code === 18) {
              console.warn(`localStorage access denied for ${key} (possibly private browsing)`)
              return
            }
          }
          
          // Re-throw other errors
          throw storageError
        }
        
        // Update cache
        if (encrypt) {
          cleanupCache() // Clean before adding new entry
          decryptionCache.set(key, { data: value, timestamp: Date.now() })
        }
        
        // Try to sync to Spark KV if available
        try {
          const spark = (window as any).spark
          if (spark?.kv) {
            spark.kv.set(key, value).catch(() => {
              // Silently fail - localStorage is our source of truth
            })
          }
        } catch (error) {
          // Ignore Spark KV errors
        }
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error)
        // Don't throw - gracefully degrade to in-memory only
      }
    }, debounceMs),
    [key, encrypt, compress, debounceMs]
  )

  // Sync with localStorage (debounced)
  useEffect(() => {
    if (pendingUpdate.current !== null) {
      debouncedSave(storedValue)
      pendingUpdate.current = null
    }
  }, [storedValue, debouncedSave])

  // Handle async decryption for encrypted values
  useEffect(() => {
    if (!encrypt) return
    
    try {
      const item = window.localStorage?.getItem(key)
      if (!item) return
      
      // Check if we already have a cached decrypted value
      const cached = decryptionCache.get(key)
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return
      }
      
      // Perform async decryption and update state if different
      decryptData(item).then(decrypted => {
        try {
          const parsed = JSON.parse(decrypted) as T
          decryptionCache.set(key, { data: parsed, timestamp: Date.now() })
          // Only update if the value is different (to avoid unnecessary re-renders)
          setStoredValue(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(parsed)) {
              return parsed
            }
            return prev
          })
        } catch (parseError) {
          console.warn(`Failed to parse decrypted data for ${key}:`, parseError)
        }
      }).catch(() => {
        // Decryption failed, keep using the fallback value
        console.warn(`Decryption failed for ${key}, using fallback value`)
      })
    } catch (error) {
      // Ignore errors in async decryption
    }
  }, [key, encrypt])

  // Try to initialize from Spark KV on mount, but don't block on it
  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true

    const initFromSparkKV = async () => {
      try {
        // Attempt to use Spark KV if available
        const spark = (window as any).spark
        if (spark?.kv) {
          const sparkValue = await spark.kv.get(key)
          if (sparkValue !== null && sparkValue !== undefined) {
            setStoredValue(sparkValue)
          }
        }
      } catch (error) {
        // Silently fail - this is expected in development mode
        // We'll use localStorage instead
      }
    }

    initFromSparkKV()
  }, [key])

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        pendingUpdate.current = valueToStore
      } catch (error) {
        console.error(`Error in setValue for ${key}:`, error)
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue]
}
