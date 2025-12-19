/**
 * VOID OS Settings Window
 * Comprehensive settings interface
 */

import { useState } from 'react'
import { Search, Settings as SettingsIcon, Sun, Moon, Monitor, Palette, Bell, Shield, User, Plug, CreditCard, Users, Database, Code, Info } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'
import { useVoidStore } from '@/lib/void/store'
import type { SettingsCategory } from '@/lib/void/settings'
import '@/styles/void-settings.css'

interface VoidSettingsProps {
  isOpen: boolean
  onClose: () => void
}

const SETTINGS_CATEGORIES: Array<{ id: SettingsCategory; label: string; icon: typeof SettingsIcon }> = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'accounts', label: 'Accounts', icon: User },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'advanced', label: 'Advanced', icon: Code },
  { id: 'about', label: 'About', icon: Info },
]

export function VoidSettings({ isOpen, onClose }: VoidSettingsProps) {
  const { settings, updateSetting } = useSettings()
  const { theme, setTheme, wiremapEnabled, setWiremapEnabled } = useVoidStore()
  const [selectedCategory, setSelectedCategory] = useState<SettingsCategory>('general')
  const [searchQuery, setSearchQuery] = useState('')

  if (!isOpen) {
    return null
  }

  const filteredCategories = SETTINGS_CATEGORIES.filter(cat =>
    cat.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="void-settings">
      <div className="void-settings-container">
        {/* Sidebar */}
        <div className="void-settings-sidebar">
          <div className="void-settings-search">
            <Search className="void-settings-search-icon" />
            <input
              type="text"
              className="void-settings-search-input"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <nav className="void-settings-nav">
            {filteredCategories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  className={`void-settings-nav-item ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon className="void-settings-nav-icon" />
                  <span>{category.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="void-settings-content">
          <SettingsContent
            category={selectedCategory}
            settings={settings}
            updateSetting={updateSetting}
            theme={theme}
            setTheme={setTheme}
            wiremapEnabled={wiremapEnabled}
            setWiremapEnabled={setWiremapEnabled}
          />
        </div>
      </div>
    </div>
  )
}

function SettingsContent({
  category,
  settings,
  updateSetting,
  theme,
  setTheme,
  wiremapEnabled,
  setWiremapEnabled,
}: {
  category: SettingsCategory
  settings: any
  updateSetting: (key: string, value: any) => void
  theme: string
  setTheme: (theme: string) => void
  wiremapEnabled: boolean
  setWiremapEnabled: (enabled: boolean) => void
}) {
  switch (category) {
    case 'appearance':
      return (
        <div className="void-settings-section">
          <h2 className="void-settings-section-title">Appearance</h2>
          
          <div className="void-settings-group">
            <label className="void-settings-label">Theme</label>
            <div className="void-settings-theme-options">
              <button
                className={`void-settings-theme-option ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                <Sun className="void-settings-theme-icon" />
                <span>Light</span>
              </button>
              <button
                className={`void-settings-theme-option ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                <Moon className="void-settings-theme-icon" />
                <span>Dark</span>
              </button>
              <button
                className={`void-settings-theme-option ${theme === 'auto' ? 'active' : ''}`}
                onClick={() => setTheme('auto')}
              >
                <Monitor className="void-settings-theme-icon" />
                <span>Auto</span>
              </button>
            </div>
          </div>

          <div className="void-settings-group">
            <label className="void-settings-label">Dock Style</label>
            <div className="void-settings-toggle-group">
              <button
                className={`void-settings-toggle ${settings.dockStyle === 'dock' ? 'active' : ''}`}
                onClick={() => updateSetting('dockStyle', 'dock')}
              >
                macOS Dock
              </button>
              <button
                className={`void-settings-toggle ${settings.dockStyle === 'taskbar' ? 'active' : ''}`}
                onClick={() => updateSetting('dockStyle', 'taskbar')}
              >
                Windows Taskbar
              </button>
            </div>
          </div>

          <div className="void-settings-group">
            <label className="void-settings-label">Wiremap Animation</label>
            <div className="void-settings-switch">
              <input
                type="checkbox"
                id="wiremap"
                checked={wiremapEnabled}
                onChange={(e) => setWiremapEnabled(e.target.checked)}
              />
              <label htmlFor="wiremap">Enable wiremap background</label>
            </div>
          </div>
        </div>
      )

    case 'notifications':
      return (
        <div className="void-settings-section">
          <h2 className="void-settings-section-title">Notifications</h2>
          
          <div className="void-settings-group">
            <label className="void-settings-label">Enable Notifications</label>
            <div className="void-settings-switch">
              <input
                type="checkbox"
                id="notifications"
                checked={settings.notificationsEnabled}
                onChange={(e) => updateSetting('notificationsEnabled', e.target.checked)}
              />
              <label htmlFor="notifications">Show notifications</label>
            </div>
          </div>

          <div className="void-settings-group">
            <label className="void-settings-label">Sound</label>
            <div className="void-settings-switch">
              <input
                type="checkbox"
                id="sound"
                checked={settings.soundEnabled}
                onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
              />
              <label htmlFor="sound">Play notification sounds</label>
            </div>
          </div>

          <div className="void-settings-group">
            <label className="void-settings-label">Do Not Disturb</label>
            <div className="void-settings-switch">
              <input
                type="checkbox"
                id="dnd"
                checked={settings.doNotDisturb}
                onChange={(e) => updateSetting('doNotDisturb', e.target.checked)}
              />
              <label htmlFor="dnd">Silence all notifications</label>
            </div>
          </div>
        </div>
      )

    case 'general':
    default:
      return (
        <div className="void-settings-section">
          <h2 className="void-settings-section-title">General</h2>
          
          <div className="void-settings-group">
            <label className="void-settings-label">Language</label>
            <select
              className="void-settings-select"
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>

          <div className="void-settings-group">
            <label className="void-settings-label">Time Format</label>
            <div className="void-settings-toggle-group">
              <button
                className={`void-settings-toggle ${settings.timeFormat === '12h' ? 'active' : ''}`}
                onClick={() => updateSetting('timeFormat', '12h')}
              >
                12 Hour
              </button>
              <button
                className={`void-settings-toggle ${settings.timeFormat === '24h' ? 'active' : ''}`}
                onClick={() => updateSetting('timeFormat', '24h')}
              >
                24 Hour
              </button>
            </div>
          </div>
        </div>
      )

    case 'about':
      return (
        <div className="void-settings-section">
          <h2 className="void-settings-section-title">About VOID</h2>
          <div className="void-settings-about">
            <div className="void-settings-about-logo">VOID</div>
            <div className="void-settings-about-version">Version 2.0.0</div>
            <div className="void-settings-about-description">
              Complete Operating System for FairTradeWorker
            </div>
          </div>
        </div>
      )

    // Placeholder for other categories
    case 'privacy':
    case 'accounts':
    case 'integrations':
    case 'billing':
    case 'team':
    case 'data':
    case 'advanced':
      return (
        <div className="void-settings-section">
          <h2 className="void-settings-section-title">{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
          <div className="void-settings-placeholder">
            Settings for {category} coming soon...
          </div>
        </div>
      )
  }
}
