import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Development-friendly KV hook that falls back to localStorage
 * when Spark KV is unavailable (403 errors in development)
 */
export function useLocalKV<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Try to get from localStorage first
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error loading ${key} from localStorage:`, error)
      return initialValue
    }
  })

  const isInitialized = useRef(false)

  // Sync with localStorage whenever the value changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
    }
  }, [key, storedValue])

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

        // Try to sync to Spark KV if available, but don't wait
        try {
          const spark = (window as any).spark
          if (spark?.kv) {
            spark.kv.set(key, valueToStore).catch(() => {
              // Silently fail - localStorage is our source of truth in dev mode
            })
          }
        } catch (error) {
          // Ignore Spark KV errors in development
        }
      } catch (error) {
        console.error(`Error in setValue for ${key}:`, error)
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue]
}
