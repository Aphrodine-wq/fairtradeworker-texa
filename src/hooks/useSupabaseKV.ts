/**
 * Supabase-based KV hook - replaces localStorage with Supabase database
 * Provides real-time sync, encryption, and better performance
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { debounce } from '@/lib/performance'
import { encryptData, decryptData } from '@/lib/security'

interface KVOptions {
  encrypt?: boolean
  debounceMs?: number
  table?: string
  realtime?: boolean
}

// Cache for decrypted values
const decryptionCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Supabase KV hook with encryption, debouncing, and real-time sync
 */
export function useSupabaseKV<T>(
  key: string,
  initialValue: T,
  options?: KVOptions
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const { 
    encrypt = false, 
    debounceMs = 300, 
    table = 'user_data',
    realtime = false 
  } = options || {}
  
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const isInitialized = useRef(false)
  const pendingUpdate = useRef<T | null>(null)
  const channelRef = useRef<any>(null)

  // Get current user
  const getUserId = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id
  }, [])

  // Load from Supabase
  const loadFromSupabase = useCallback(async () => {
    try {
      setLoading(true)
      const userId = await getUserId()
      if (!userId) {
        setStoredValue(initialValue)
        setLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from(table)
        .select('value, encrypted')
        .eq('user_id', userId)
        .eq('key', key)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
        throw fetchError
      }

      if (!data) {
        setStoredValue(initialValue)
        setLoading(false)
        return
      }

      let parsed: T = initialValue

      if (data.encrypted && encrypt) {
        // Check cache first
        const cached = decryptionCache.get(key)
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          parsed = cached.data as T
        } else {
          // Decrypt
          const decrypted = await decryptData(data.value)
          parsed = JSON.parse(decrypted)
          decryptionCache.set(key, { data: parsed, timestamp: Date.now() })
        }
      } else {
        parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value
      }

      setStoredValue(parsed)
      setError(null)
    } catch (err) {
      console.error(`Error loading ${key} from Supabase:`, err)
      setError(err as Error)
      setStoredValue(initialValue)
    } finally {
      setLoading(false)
    }
  }, [key, initialValue, encrypt, table, getUserId])

  // Save to Supabase (debounced)
  const debouncedSave = useCallback(
    debounce(async (value: T) => {
      try {
        const userId = await getUserId()
        if (!userId) return

        let valueToStore: string
        let isEncrypted = false

        if (encrypt) {
          valueToStore = await encryptData(JSON.stringify(value))
          isEncrypted = true
          // Update cache
          decryptionCache.set(key, { data: value, timestamp: Date.now() })
        } else {
          valueToStore = JSON.stringify(value)
        }

        const { error: upsertError } = await supabase
          .from(table)
          .upsert({
            user_id: userId,
            key,
            value: valueToStore,
            encrypted: isEncrypted,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,key'
          })

        if (upsertError) throw upsertError
      } catch (err) {
        console.error(`Error saving ${key} to Supabase:`, err)
        setError(err as Error)
      }
    }, debounceMs),
    [key, encrypt, debounceMs, table, getUserId]
  )

  // Initialize on mount
  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true

    loadFromSupabase()

    // Set up real-time subscription if enabled
    if (realtime) {
      const setupRealtime = async () => {
        const userId = await getUserId()
        if (!userId) return

        channelRef.current = supabase
          .channel(`kv:${key}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table,
              filter: `user_id=eq.${userId}&key=eq.${key}`
            },
            () => {
              // Reload when changes occur
              loadFromSupabase()
            }
          )
          .subscribe()
      }

      setupRealtime()
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [key, loadFromSupabase, realtime, getUserId])

  // Save when value changes
  useEffect(() => {
    if (!isInitialized.current || loading) return
    if (pendingUpdate.current !== null) {
      debouncedSave(storedValue)
      pendingUpdate.current = null
    }
  }, [storedValue, debouncedSave, loading])

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        pendingUpdate.current = valueToStore
      } catch (err) {
        console.error(`Error in setValue for ${key}:`, err)
        setError(err as Error)
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue, loading]
}
