/**
 * VOID OS Settings System
 */

export type SettingsCategory = 
  | 'general'
  | 'appearance'
  | 'notifications'
  | 'privacy'
  | 'accounts'
  | 'integrations'
  | 'billing'
  | 'team'
  | 'data'
  | 'advanced'
  | 'about'

export interface Settings {
  // General
  language: string
  region: string
  timezone: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  
  // Appearance
  theme: 'light' | 'dark' | 'auto'
  accentColor: string
  dockStyle: 'dock' | 'taskbar'
  wiremapEnabled: boolean
  
  // Notifications
  notificationsEnabled: boolean
  soundEnabled: boolean
  doNotDisturb: boolean
  
  // Privacy
  analyticsEnabled: boolean
  crashReportingEnabled: boolean
  
  // Advanced
  developerMode: boolean
  performanceMode: 'auto' | 'high' | 'low'
}

export const DEFAULT_SETTINGS: Settings = {
  language: 'en',
  region: 'US',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  theme: 'dark',
  accentColor: '#00f5ff',
  dockStyle: 'taskbar',
  wiremapEnabled: true,
  notificationsEnabled: true,
  soundEnabled: true,
  doNotDisturb: false,
  analyticsEnabled: true,
  crashReportingEnabled: true,
  developerMode: false,
  performanceMode: 'auto',
}

/**
 * Get settings from localStorage
 */
export function getSettings(): Settings {
  try {
    const stored = localStorage.getItem('void-settings')
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch (error) {
    console.warn('[Settings] Failed to load settings:', error)
  }
  return DEFAULT_SETTINGS
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: Partial<Settings>): void {
  try {
    const current = getSettings()
    const updated = { ...current, ...settings }
    localStorage.setItem('void-settings', JSON.stringify(updated))
  } catch (error) {
    console.error('[Settings] Failed to save settings:', error)
  }
}

/**
 * Reset settings to defaults
 */
export function resetSettings(): void {
  localStorage.removeItem('void-settings')
}
