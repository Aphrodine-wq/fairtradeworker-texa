/**
 * Hook for VOID OS Settings
 */

import { useState, useEffect, useCallback } from 'react'
import { getSettings, saveSettings, resetSettings, type Settings } from '@/lib/void/settings'

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(getSettings())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setSettings(getSettings())
  }, [])

  const updateSetting = useCallback(<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setIsLoading(true)
    try {
      const updated = { ...settings, [key]: value }
      saveSettings({ [key]: value })
      setSettings(updated)
    } catch (error) {
      console.error('[Settings] Failed to update setting:', error)
    } finally {
      setIsLoading(false)
    }
  }, [settings])

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setIsLoading(true)
    try {
      const updated = { ...settings, ...updates }
      saveSettings(updates)
      setSettings(updated)
    } catch (error) {
      console.error('[Settings] Failed to update settings:', error)
    } finally {
      setIsLoading(false)
    }
  }, [settings])

  const reset = useCallback(() => {
    setIsLoading(true)
    try {
      resetSettings()
      setSettings(getSettings())
    } catch (error) {
      console.error('[Settings] Failed to reset settings:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    settings,
    isLoading,
    updateSetting,
    updateSettings,
    reset,
  }
}
