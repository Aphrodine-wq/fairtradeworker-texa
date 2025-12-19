/**
 * VOID OS Accessibility System
 */

export interface AccessibilitySettings {
  reduceMotion: boolean
  reduceTransparency: boolean
  increaseContrast: boolean
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
}

export const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  reduceMotion: false,
  reduceTransparency: false,
  increaseContrast: false,
  fontSize: 'medium',
  colorBlindMode: 'none',
}

/**
 * Get accessibility settings from localStorage
 */
export function getAccessibilitySettings(): AccessibilitySettings {
  try {
    const stored = localStorage.getItem('void-accessibility')
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...DEFAULT_ACCESSIBILITY, ...parsed }
    }
  } catch (error) {
    console.warn('[Accessibility] Failed to load settings:', error)
  }
  return DEFAULT_ACCESSIBILITY
}

/**
 * Save accessibility settings
 */
export function saveAccessibilitySettings(settings: Partial<AccessibilitySettings>): void {
  try {
    const current = getAccessibilitySettings()
    const updated = { ...current, ...settings }
    localStorage.setItem('void-accessibility', JSON.stringify(updated))
    applyAccessibilitySettings(updated)
  } catch (error) {
    console.error('[Accessibility] Failed to save settings:', error)
  }
}

/**
 * Apply accessibility settings to document
 */
export function applyAccessibilitySettings(settings: AccessibilitySettings): void {
  const root = document.documentElement
  
  // Reduce motion
  if (settings.reduceMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.setAttribute('data-reduce-motion', 'true')
  } else {
    root.removeAttribute('data-reduce-motion')
  }
  
  // Reduce transparency
  if (settings.reduceTransparency || window.matchMedia('(prefers-reduced-transparency: reduce)').matches) {
    root.setAttribute('data-reduce-transparency', 'true')
  } else {
    root.removeAttribute('data-reduce-transparency')
  }
  
  // Increase contrast
  if (settings.increaseContrast || window.matchMedia('(prefers-contrast: more)').matches) {
    root.setAttribute('data-increase-contrast', 'true')
  } else {
    root.removeAttribute('data-increase-contrast')
  }
  
  // Font size
  root.setAttribute('data-font-size', settings.fontSize)
  
  // Color blind mode
  root.setAttribute('data-color-blind', settings.colorBlindMode)
}

/**
 * Initialize accessibility on load
 */
export function initAccessibility(): void {
  const settings = getAccessibilitySettings()
  applyAccessibilitySettings(settings)
  
  // Listen for system preference changes
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const transparencyQuery = window.matchMedia('(prefers-reduced-transparency: reduce)')
  const contrastQuery = window.matchMedia('(prefers-contrast: more)')
  
  motionQuery.addEventListener('change', () => {
    const settings = getAccessibilitySettings()
    if (!settings.reduceMotion) {
      applyAccessibilitySettings(settings)
    }
  })
  
  transparencyQuery.addEventListener('change', () => {
    const settings = getAccessibilitySettings()
    if (!settings.reduceTransparency) {
      applyAccessibilitySettings(settings)
    }
  })
  
  contrastQuery.addEventListener('change', () => {
    const settings = getAccessibilitySettings()
    if (!settings.increaseContrast) {
      applyAccessibilitySettings(settings)
    }
  })
}
