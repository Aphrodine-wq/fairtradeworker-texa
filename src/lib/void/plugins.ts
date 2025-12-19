/**
 * VOID OS Plugin System
 */

import type React from 'react'

export type PluginCategory = 
  | 'analytics'
  | 'email'
  | 'payments'
  | 'scheduling'
  | 'crm'
  | 'social'
  | 'themes'

export interface IconContribution {
  id: string
  name: string
  icon: string
  action: () => void
}

export interface WindowContribution {
  id: string
  title: string
  component: React.ComponentType
}

export interface ShortcutContribution {
  key: string
  action: () => void
  description: string
}

export interface PluginPermission {
  type: 'storage' | 'network' | 'notifications' | 'clipboard'
  reason: string
}

export interface VoidPlugin {
  id: string
  name: string
  version: string
  author: string
  description: string
  category: PluginCategory
  enabled: boolean
  
  // Lifecycle
  onInstall?: () => Promise<void>
  onEnable?: () => Promise<void>
  onDisable?: () => Promise<void>
  onUninstall?: () => Promise<void>
  
  // Contributions
  contributes?: {
    icons?: IconContribution[]
    windows?: WindowContribution[]
    shortcuts?: ShortcutContribution[]
  }
  
  // Permissions
  permissions?: PluginPermission[]
}

const PLUGIN_STORAGE_KEY = 'void-plugins'

/**
 * Get installed plugins
 */
export function getInstalledPlugins(): VoidPlugin[] {
  try {
    const stored = localStorage.getItem(PLUGIN_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('[Plugins] Failed to load plugins:', error)
  }
  return []
}

/**
 * Save plugins
 */
export function savePlugins(plugins: VoidPlugin[]): void {
  try {
    localStorage.setItem(PLUGIN_STORAGE_KEY, JSON.stringify(plugins))
  } catch (error) {
    console.error('[Plugins] Failed to save plugins:', error)
  }
}

/**
 * Install plugin
 */
export async function installPlugin(plugin: VoidPlugin): Promise<void> {
  const plugins = getInstalledPlugins()
  
  if (plugins.some(p => p.id === plugin.id)) {
    throw new Error('Plugin already installed')
  }
  
  if (plugin.onInstall) {
    await plugin.onInstall()
  }
  
  plugins.push({ ...plugin, enabled: true })
  savePlugins(plugins)
}

/**
 * Uninstall plugin
 */
export async function uninstallPlugin(pluginId: string): Promise<void> {
  const plugins = getInstalledPlugins()
  const plugin = plugins.find(p => p.id === pluginId)
  
  if (!plugin) {
    throw new Error('Plugin not found')
  }
  
  if (plugin.onUninstall) {
    await plugin.onUninstall()
  }
  
  const updated = plugins.filter(p => p.id !== pluginId)
  savePlugins(updated)
}

/**
 * Enable plugin
 */
export async function enablePlugin(pluginId: string): Promise<void> {
  const plugins = getInstalledPlugins()
  const plugin = plugins.find(p => p.id === pluginId)
  
  if (!plugin) {
    throw new Error('Plugin not found')
  }
  
  if (plugin.onEnable) {
    await plugin.onEnable()
  }
  
  plugin.enabled = true
  savePlugins(plugins)
}

/**
 * Disable plugin
 */
export async function disablePlugin(pluginId: string): Promise<void> {
  const plugins = getInstalledPlugins()
  const plugin = plugins.find(p => p.id === pluginId)
  
  if (!plugin) {
    throw new Error('Plugin not found')
  }
  
  if (plugin.onDisable) {
    await plugin.onDisable()
  }
  
  plugin.enabled = false
  savePlugins(plugins)
}
