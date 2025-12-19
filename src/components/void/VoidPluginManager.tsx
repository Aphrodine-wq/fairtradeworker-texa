/**
 * VOID OS Plugin Manager
 * Manage installed plugins and marketplace
 */

import { useState } from 'react'
import { Package, Trash2, Power, Download } from 'lucide-react'
import { useVoidStore } from '@/lib/void/store'
import {
  getInstalledPlugins,
  installPlugin,
  uninstallPlugin,
  enablePlugin,
  disablePlugin,
  type VoidPlugin,
} from '@/lib/void/plugins'
import '@/styles/void-plugins.css'

export function VoidPluginManager() {
  const [plugins, setPlugins] = useState<VoidPlugin[]>(getInstalledPlugins())
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'email', name: 'Email' },
    { id: 'payments', name: 'Payments' },
    { id: 'scheduling', name: 'Scheduling' },
    { id: 'crm', name: 'CRM' },
    { id: 'social', name: 'Social' },
    { id: 'themes', name: 'Themes' },
  ]

  const filteredPlugins = selectedCategory === 'all'
    ? plugins
    : plugins.filter(p => p.category === selectedCategory)

  const handleToggle = async (pluginId: string, enabled: boolean) => {
    try {
      if (enabled) {
        await enablePlugin(pluginId)
      } else {
        await disablePlugin(pluginId)
      }
      setPlugins(getInstalledPlugins())
    } catch (error) {
      console.error('[PluginManager] Failed to toggle plugin:', error)
    }
  }

  const handleUninstall = async (pluginId: string) => {
    if (!confirm('Are you sure you want to uninstall this plugin?')) {
      return
    }
    
    try {
      await uninstallPlugin(pluginId)
      setPlugins(getInstalledPlugins())
    } catch (error) {
      console.error('[PluginManager] Failed to uninstall plugin:', error)
    }
  }

  return (
    <div className="void-plugin-manager">
      <div className="void-plugin-manager-header">
        <h2 className="void-plugin-manager-title">Plugins</h2>
      </div>

      <div className="void-plugin-manager-content">
        <div className="void-plugin-manager-sidebar">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`void-plugin-manager-category ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="void-plugin-manager-list">
          {filteredPlugins.length > 0 ? (
            filteredPlugins.map((plugin) => (
              <div key={plugin.id} className="void-plugin-item">
                <div className="void-plugin-item-info">
                  <h3 className="void-plugin-item-name">{plugin.name}</h3>
                  <p className="void-plugin-item-description">{plugin.description}</p>
                  <div className="void-plugin-item-meta">
                    <span className="void-plugin-item-version">v{plugin.version}</span>
                    <span className="void-plugin-item-author">by {plugin.author}</span>
                  </div>
                </div>
                <div className="void-plugin-item-actions">
                  <button
                    className={`void-plugin-item-toggle ${plugin.enabled ? 'enabled' : ''}`}
                    onClick={() => handleToggle(plugin.id, !plugin.enabled)}
                    title={plugin.enabled ? 'Disable' : 'Enable'}
                  >
                    <Power className="void-plugin-item-icon" />
                  </button>
                  <button
                    className="void-plugin-item-uninstall"
                    onClick={() => handleUninstall(plugin.id)}
                    title="Uninstall"
                  >
                    <Trash2 className="void-plugin-item-icon" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="void-plugin-manager-empty">
              <Package className="void-plugin-manager-empty-icon" />
              <p>No plugins installed</p>
              <p className="void-plugin-manager-empty-subtitle">
                Browse the marketplace to install plugins
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
