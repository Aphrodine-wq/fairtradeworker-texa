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

    case 'privacy':
      return (
        <div className="void-settings-section">
          <h2 className="void-settings-section-title">Privacy & Security</h2>
          
          <div className="void-settings-group">
            <label className="void-settings-label">Analytics</label>
            <div className="void-settings-switch">
              <input
                type="checkbox"
                id="analytics"
                checked={settings.analyticsEnabled}
                onChange={(e) => updateSetting('analyticsEnabled', e.target.checked)}
              />
              <label htmlFor="analytics">Enable usage analytics</label>
            </div>
          </div>

          <div className="void-settings-group">
            <label className="void-settings-label">Crash Reporting</label>
            <div className="void-settings-switch">
              <input
                type="checkbox"
                id="crashReporting"
                checked={settings.crashReportingEnabled}
                onChange={(e) => updateSetting('crashReportingEnabled', e.target.checked)}
              />
              <label htmlFor="crashReporting">Send crash reports</label>
            </div>
          </div>

          <div className="void-settings-group">
            <label className="void-settings-label">Data Collection</label>
            <p className="void-settings-description">
              We collect minimal data to improve your experience. All data is encrypted and anonymized.
            </p>
          </div>
        </div>
      )

    case 'accounts':
      return (
        <div className="void-settings-section">
          <h2 className="void-settings-section-title">Accounts</h2>
          
          <div className="void-settings-group">
            <label className="void-settings-label">Active Account</label>
            <div className="void-settings-account-card">
              <div className="void-settings-account-info">
                <div className="void-settings-account-name">Primary Account</div>
                <div className="void-settings-account-email">user@example.com</div>
              </div>
              <button className="void-settings-button">Manage</button>
            </div>
          </div>

          <div className="void-settings-group">
            <label className="void-settings-label">Connected Accounts</label>
            <div className="void-settings-list">
              <div className="void-settings-list-item">
                <span>Google</span>
                <button className="void-settings-button-small">Disconnect</button>
              </div>
              <div className="void-settings-list-item">
                <span>Spotify</span>
                <button className="void-settings-button-small">Disconnect</button>
              </div>
            </div>
          </div>
        </div>
      )

    case 'integrations':
      return (
        <div className="void-settings-section">
          <h2 className="void-settings-section-title">Integrations</h2>
          
          <div className="void-settings-group">
            <label className="void-settings-label">Available Integrations</label>
            <div className="void-settings-list">
              <div className="void-settings-list-item">
                <span>Spotify</span>
                <button className="void-settings-button-small">Connect</button>
              </div>
              <div className="void-settings-list-item">
                <span>Google Calendar</span>
                <button className="void-settings-button-small">Connect</button>
              </div>
              <div className="void-settings-list-item">
                <span>Slack</span>
                <button className="void-settings-button-small">Connect</button>
              </div>
            </div>
          </div>
        </div>
      )

    case 'billing':
      return (
        <div className="void-settings-section">
          <h2 className="void-settings-section-title">Billing & Subscription</h2>
          
          <div className="void-settings-group">
            <label className="void-settings-label">Current Plan</label>
            <div className="void-settings-plan-card">
              <div className="void-settings-plan-name">Pro Plan</div>
              <div className="void-settings-plan-price">$29/month</div>
              <button className="void-settings-button">Upgrade</button>
            </div>
          </div>

          <div className="void-settings-group">
            <label className="void-settings-label">Payment Method</label>
            <div className="void-settings-payment-card">
              <span>•••• •••• •••• 4242</span>
              <button className="void-settings-button-small">Update</button>
            </div>
          </div>
        </div>
      )

    case 'team':
      return (
        <div className="void-settings-section">
          <h2 className="void-settings-section-title">Team Management</h2>
          
          <div className="void-settings-group">
            <label className="void-settings-label">Team Members</label>
            <div className="void-settings-list">
              <div className="void-settings-list-item">
                <span>John Doe (Owner)</span>
                <button className="void-settings-button-small">Manage</button>
              </div>
              <div className="void-settings-list-item">
                <span>Jane Smith (Member)</span>
                <button className="void-settings-button-small">Manage</button>
              </div>
            </div>
            <button className="void-settings-button">Invite Member</button>
          </div>
        </div>
      )

    case 'data':
      return (
        <div className="void-settings-section">
          <h2 className="void-settings-section-title">Data Management</h2>
          
          <div className="void-settings-group">
            <label className="void-settings-label">Export Data</label>
            <p className="void-settings-description">
              Download all your data in JSON format
            </p>
            <button className="void-settings-button">Export Data</button>
          </div>

          <div className="void-settings-group">
            <label className="void-settings-label">Clear Cache</label>
            <p className="void-settings-description">
              Clear cached data to free up space
            </p>
            <button className="void-settings-button">Clear Cache</button>
          </div>

          <div className="void-settings-group">
            <label className="void-settings-label">Delete All Data</label>
            <p className="void-settings-description void-settings-warning">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <button className="void-settings-button void-settings-button-danger">Delete All Data</button>
          </div>
        </div>
      )

    case 'advanced':
      return (
        <div className="void-settings-section">
          <h2 className="void-settings-section-title">Advanced</h2>
          
          <div className="void-settings-group">
            <label className="void-settings-label">Developer Mode</label>
            <div className="void-settings-switch">
              <input
                type="checkbox"
                id="developerMode"
                checked={settings.developerMode}
                onChange={(e) => updateSetting('developerMode', e.target.checked)}
              />
              <label htmlFor="developerMode">Enable developer tools</label>
            </div>
          </div>

          <div className="void-settings-group">
            <label className="void-settings-label">Performance Mode</label>
            <select
              className="void-settings-select"
              value={settings.performanceMode}
              onChange={(e) => updateSetting('performanceMode', e.target.value)}
            >
              <option value="auto">Auto</option>
              <option value="high">High Performance</option>
              <option value="low">Low Power</option>
            </select>
          </div>

          <div className="void-settings-group">
            <label className="void-settings-label">Debug Information</label>
            <button className="void-settings-button">Show Debug Info</button>
          </div>
        </div>
      )
  }
}
