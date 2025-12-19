import type React from 'react'

// Grid System (200×200 CSS Grid)
export interface GridPosition {
  row: number // 1-200
  col: number // 1-200
}

export interface IconData {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  position: GridPosition
  pinned: boolean
  type: 'folder' | 'tool' | 'system'
  menuId?: string
  gridSize?: { width: number; height: number } // For special icons like voice (2×2)
}

// Window System
export type WindowState = 'normal' | 'minimized' | 'maximized' | 'snapped' | 'pip'

export interface WindowData {
  id: string
  title: string
  menuId?: string
  position: { x: number; y: number } // Pixel coordinates
  size: { width: number; height: number } // Pixel dimensions
  minimized: boolean
  maximized: boolean
  pip?: boolean // Picture-in-picture mode
  snapZone?: string // Current snap zone
  zIndex: number
  content: React.ReactNode
}

// Sort Options
export type SortOption = 'name' | 'date' | 'usage'

// Voice System
export type VoiceState = 'idle' | 'permission-prompt' | 'recording' | 'processing' | 'extracting' | 'validation' | 'complete'
export type VoicePermission = 'granted' | 'denied' | 'prompt'

export interface ExtractedEntity {
  value: string | number | null
  confidence: number // 0-1
  alternatives?: string[]
  normalized?: string
  range?: [number, number] // For budget
}

export interface ExtractedEntities {
  name?: ExtractedEntity
  phone?: ExtractedEntity
  email?: ExtractedEntity
  project?: ExtractedEntity
  budget?: ExtractedEntity
  urgency?: ExtractedEntity
}

// Buddy System
export type BuddyEmotion = 'neutral' | 'happy' | 'thinking' | 'excited'

export interface BuddyMessage {
  id: string
  message: string
  emotion: BuddyEmotion
  timestamp: number
  priority: 'low' | 'medium' | 'high'
  suggestedActions?: Array<{
    label: string
    action: string
    params?: Record<string, unknown>
  }>
}

export interface BuddyState {
  collapsed: boolean
  position: { x: number; y: number } | 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right'
  docked: boolean
  lastMessageTime: number
  emotion: BuddyEmotion
}

// Virtual Desktops
export interface VirtualDesktop {
  id: string
  name: string
  windows: string[] // window IDs
  wallpaper?: string
  createdAt: number
}

// File System
export type VoidFileType = 
  | 'contact'
  | 'project'
  | 'invoice'
  | 'estimate'
  | 'contract'
  | 'template'
  | 'folder'
  | 'smartfolder'

export interface VoidFile {
  id: string
  name: string
  type: VoidFileType
  path: string
  parentId: string | null
  metadata: Record<string, any>
  createdAt: number
  updatedAt: number
}

// Settings
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
  language: string
  region: string
  timezone: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  theme: 'light' | 'dark' | 'auto'
  accentColor: string
  dockStyle: 'dock' | 'taskbar'
  wiremapEnabled: boolean
  notificationsEnabled: boolean
  soundEnabled: boolean
  doNotDisturb: boolean
  analyticsEnabled: boolean
  crashReportingEnabled: boolean
  developerMode: boolean
  performanceMode: 'auto' | 'high' | 'low'
}

// Accessibility
export interface AccessibilitySettings {
  reduceMotion: boolean
  reduceTransparency: boolean
  increaseContrast: boolean
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
}

// Sync
export type SyncStatus = 'online' | 'offline' | 'syncing' | 'error'

export interface PendingChange {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: string
  data: any
  timestamp: number
}

// Plugins
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
  component: any // React.ComponentType
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
  onInstall?: () => Promise<void>
  onEnable?: () => Promise<void>
  onDisable?: () => Promise<void>
  onUninstall?: () => Promise<void>
  contributes?: {
    icons?: IconContribution[]
    windows?: WindowContribution[]
    shortcuts?: ShortcutContribution[]
  }
  permissions?: PluginPermission[]
}

// Security
export type AuthMethod = 'email' | 'google' | 'microsoft' | 'apple'

export interface AuthSession {
  userId: string
  email: string
  token: string
  refreshToken: string
  expiresAt: number
  method: AuthMethod
}

export interface SessionInfo {
  userId: string
  email: string
  createdAt: number
  lastActivity: number
  ipAddress?: string
  userAgent?: string
}

export type AuditAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'export'
  | 'import'

export interface AuditLog {
  id: string
  userId: string
  action: AuditAction
  entity: string
  entityId?: string
  changes?: Record<string, { from: any; to: any }>
  ipAddress?: string
  userAgent?: string
  timestamp: number
}

// Notification System
export type NotificationType = 
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'lead'
  | 'message'
  | 'reminder'
  | 'payment'

export interface NotificationAction {
  label: string
  action: () => void
  primary?: boolean
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: number
  read: boolean
  actions?: NotificationAction[]
  icon?: string
  sound?: boolean
  persistent?: boolean
}
