/**
 * Hook for VOID OS Accessibility
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getAccessibilitySettings,
  saveAccessibilitySettings,
  applyAccessibilitySettings,
  type AccessibilitySettings,
} from '@/lib/void/accessibility'

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(getAccessibilitySettings())

  useEffect(() => {
    setSettings(getAccessibilitySettings())
    applyAccessibilitySettings(getAccessibilitySettings())
  }, [])

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    const updated = { ...settings, [key]: value }
    saveAccessibilitySettings({ [key]: value })
    setSettings(updated)
    applyAccessibilitySettings(updated)
  }, [settings])

  const updateSettings = useCallback((updates: Partial<AccessibilitySettings>) => {
    const updated = { ...settings, ...updates }
    saveAccessibilitySettings(updates)
    setSettings(updated)
    applyAccessibilitySettings(updated)
  }, [settings])

  return {
    settings,
    updateSetting,
    updateSettings,
  }
}
