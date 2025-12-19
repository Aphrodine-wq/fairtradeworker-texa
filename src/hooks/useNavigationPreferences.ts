/**
 * Hook for managing user navigation preferences
 */

import { useLocalKV } from './useLocalKV'
import { useMemo } from 'react'
import type { User } from '@/lib/types'
import type { NavItem, NavigationPreferences } from '@/lib/types/navigation'
import { DEFAULT_NAVIGATION, mergeWithDefaults } from '@/lib/types/navigation'

const NAV_PREF_KEY = (userId: string) => `nav-preferences-${userId}`

export function useNavigationPreferences(user: User | null) {
  const key = user ? NAV_PREF_KEY(user.id) : ''
  const [preferences, setPreferences] = useLocalKV<NavigationPreferences | null>(
    key,
    null
  )

  const navigation = useMemo(() => {
    if (!user) return []
    
    // Get defaults for user role
    const defaults = DEFAULT_NAVIGATION[user.role]
    
    // If no preferences saved, use defaults
    if (!preferences || !preferences.items) {
      return defaults
    }
    
    // Merge defaults with saved preferences
    // This handles new tools being added
    return mergeWithDefaults(defaults, preferences.items)
  }, [user, preferences])

  const savePreferences = (items: NavItem[]) => {
    if (!user) {
      console.warn('Cannot save preferences: user not available')
      return
    }
    
    try {
      // Ensure items are sorted by order
      const sortedItems = [...items].sort((a, b) => a.order - b.order)
      
      const prefs: NavigationPreferences = {
        items: sortedItems,
        version: '1.0.0',
        lastUpdated: new Date().toISOString()
      }
      
      setPreferences(prefs)
    } catch (error) {
      console.error('Error saving navigation preferences:', error)
      // Re-throw to allow caller to handle (e.g., show user notification)
      throw error
    }
  }

  const resetToDefaults = () => {
    if (!user) return
    setPreferences(null) // Will use defaults
  }

  return {
    navigation,
    savePreferences,
    resetToDefaults,
    isLoading: !user
  }
}
