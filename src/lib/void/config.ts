/**
 * VOID CRM Configuration
 */

import type { MenuConfig, VoidIcon } from './types'

export const VOID_COLORS = {
  background: '#0a0a0f',
  primary: '#00f0ff', // Electric cyan
  secondary: '#8b5cf6', // Violet
  alert: '#f59e0b', // Warm amber
  success: '#10b981', // Emerald
  text: '#ffffff',
  textMuted: '#a0a0a0',
}

export const VOID_ICONS: Omit<VoidIcon, 'position' | 'isPinned' | 'isHidden'>[] = [
  { id: 'customers', label: 'Customers', icon: '👥', menuId: 'customers' },
  { id: 'leads', label: 'Leads', icon: '📊', menuId: 'leads' },
  { id: 'ai', label: 'AI', icon: '🤖', menuId: 'ai' },
  { id: 'automation', label: 'Automation', icon: '⚡', menuId: 'automation' },
  { id: 'integrations', label: 'Integrations', icon: '🔗', menuId: 'integrations' },
  { id: 'sales', label: 'Sales', icon: '💰', menuId: 'sales' },
  { id: 'pipeline', label: 'Pipeline', icon: '📈', menuId: 'pipeline' },
  { id: 'social-media', label: 'Social Media', icon: '📱', menuId: 'social-media' },
  { id: 'analytics', label: 'Analytics', icon: '📉', menuId: 'analytics' },
  { id: 'contacts', label: 'Contacts', icon: '👤', menuId: 'contacts' },
  { id: 'workflows', label: 'Workflows', icon: '🔄', menuId: 'workflows' },
  { id: 'marketing', label: 'Marketing', icon: '📣', menuId: 'marketing' },
  { id: 'email', label: 'Email', icon: '✉️', menuId: 'email' },
  { id: 'billing', label: 'Billing', icon: '💳', menuId: 'billing' },
  { id: 'documents', label: 'Documents', icon: '📄', menuId: 'documents' },
  { id: 'calendar', label: 'Calendar', icon: '📆', menuId: 'calendar' },
  { id: 'marketplace', label: 'Marketplace', icon: '🛒', menuId: 'marketplace' },
  { id: 'settings', label: 'Settings', icon: '⚙️', menuId: 'settings' },
  { id: 'support', label: 'Support', icon: '❓', menuId: 'support' },
  { id: 'voice', label: 'Voice', icon: '🎤', menuId: 'voice' },
]

export const WIREMAP_CONFIG = {
  nodes: {
    count: 50,
    colors: ['#00f0ff', '#8b5cf6', '#10b981'],
    size: { min: 3, max: 8 },
    pulse: true,
    connectDistance: 150,
  },
  connections: {
    color: 'rgba(0, 240, 255, 0.2)',
    width: 1,
    animated: true,
    dashArray: '5, 5',
  },
  movement: {
    speed: 0.5,
    direction: 'organic',
    parallax: true,
  },
  interaction: {
    mouseAttract: true,
    clickRipple: true,
  },
}
