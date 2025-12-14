import { useState, useEffect, useCallback, useRef } from 'react'
import { debounce } from '@/lib/performance'
import { encryptData, decryptData } from '@/lib/security'

// Cache for decrypted values to avoid repeated decryption
const decryptionCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

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
      const item = window.localStorage.getItem(key)
      if (!item) return initialValue
      
      // Check cache first
      const cached = decryptionCache.get(key)
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data as T
      }
      
      let parsed: T
      if (encrypt) {
        // Decrypt if encrypted
        decryptData(item).then(decrypted => {
          parsed = JSON.parse(decrypted)
          decryptionCache.set(key, { data: parsed, timestamp: Date.now() })
        }).catch(() => {
          // Fallback: try parsing as plain JSON
          parsed = JSON.parse(item)
        })
        // For initial render, try synchronous decryption or use cached
        try {
          parsed = JSON.parse(item) as T // Fallback for initial render
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
      console.warn(`Error loading ${key} from localStorage:`, error)
      return initialValue
    }
  })

  const isInitialized = useRef(false)
  const pendingUpdate = useRef<T | null>(null)

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (value: T) => {
      try {
        let dataToStore = JSON.stringify(value)
        
        // Compress if enabled
        if (compress) {
          dataToStore = compressData(dataToStore)
        }
        
        // Encrypt if enabled
        if (encrypt) {
          dataToStore = await encryptData(dataToStore)
        }
        
        window.localStorage.setItem(key, dataToStore)
        
        // Update cache
        if (encrypt) {
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
