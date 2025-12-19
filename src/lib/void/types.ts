import type React from 'react'

// Grid System
export interface GridPosition {
  x: number // Grid units (0-200)
  y: number // Grid units (0-200)
}

export interface GridSize {
  width: number // Grid units
  height: number // Grid units
}

// Desktop Icons
export interface VoidIcon {
  id: string
  menuId?: string // For menu icons
  type: 'menu' | 'spotify' | 'voice' | 'buddy' | 'custom'
  label: string
  icon: React.ComponentType<{ className?: string }>
  position: GridPosition
  size: GridSize
  pinned: boolean
  hidden: boolean
}

// Windows
export interface VoidWindow {
  id: string
  menuId: string
  title: string
  position: { x: number; y: number } // Pixel coordinates
  size: { width: number; height: number } // Pixel dimensions
  minimized: boolean
  maximized: boolean
  zIndex: number
  content: React.ReactNode
}

// Background
export type BackgroundType = 'image' | 'video' | 'shader' | 'gradient' | 'default'

export interface BackgroundConfig {
  type: BackgroundType
  url?: string
  shader?: string
  brightness: number // 0-1
  contrast: number // 0-1
  overlayOpacity: number // 0-1
}

// Wiremap
export interface WiremapNode {
  x: number
  y: number
  vx: number // Velocity X
  vy: number // Velocity Y
  size: number
  color: string
}

export interface WiremapConnection {
  from: number // Node index
  to: number // Node index
  distance: number
  opacity: number
}

// Voice
export type VoiceState = 'idle' | 'listening' | 'processing' | 'syncing' | 'complete' | 'error'

export interface ExtractedEntity {
  value: string | number | null
  confidence: number // 0-1
  alternatives?: string[]
  normalized?: string
  notes?: string
}

export interface ExtractedEntities {
  name: ExtractedEntity
  phone: ExtractedEntity
  email: ExtractedEntity
  address?: ExtractedEntity
  projectType?: ExtractedEntity
  serviceCategory?: ExtractedEntity
  budget?: ExtractedEntity
  urgency?: ExtractedEntity
  notes?: ExtractedEntity
  sentiment?: ExtractedEntity
  language?: ExtractedEntity
  validation?: Array<{ field: string; isValid: boolean }>
}

// Buddy
export type BuddyEmotion = 'neutral' | 'happy' | 'thinking' | 'excited'

export interface BuddyMessage {
  id: string
  message: string
  tone: 'friendly' | 'professional' | 'enthusiastic' | 'concerned'
  priority: 'low' | 'medium' | 'high'
  suggestedActions?: Array<{
    label: string
    action: string
    params?: Record<string, unknown>
  }>
  insights?: string[]
  timestamp: number
}

export interface BuddyState {
  emotion: BuddyEmotion
  collapsed: boolean
  position: { x: number; y: number }
  messages: BuddyMessage[]
}

// Spotify
export type SpotifyService = 'spotify' | 'pandora'

export interface SpotifyTrack {
  id: string
  title: string
  artist: string
  album: string
  albumArt: string
  duration: number // seconds
  currentTime: number // seconds
  service: SpotifyService
}

export interface SpotifyState {
  connected: boolean
  service: SpotifyService
  playing: boolean
  currentTrack: SpotifyTrack | null
  queue: SpotifyTrack[]
  volume: number // 0-1
  shuffle: boolean
  repeat: 'off' | 'one' | 'all'
  expanded: boolean
  position: GridPosition | null // If pinned to desktop
}

// Theme
export type VoidTheme = 'dark' | 'light'

// Menu System
export interface MenuSection {
  id: string
  label: string
  items: MenuItem[]
}

export interface MenuItem {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  action: string
  params?: Record<string, unknown>
  badge?: string | number
}

export interface MenuConfig {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  sections: MenuSection[]
}

// Store State
export interface VoidStore {
  // Windows
  windows: VoidWindow[]
  activeWindowId: string | null
  nextZIndex: number
  
  // Desktop
  icons: VoidIcon[]
  iconPositions: Record<string, GridPosition>
  pinnedIcons: string[]
  hiddenIcons: string[]
  
  // Background
  background: BackgroundConfig
  backgroundHistory: BackgroundConfig[]
  
  // Theme
  theme: VoidTheme
  
  // Spotify
  spotifyState: SpotifyState
  spotifyConnected: boolean
  
  // Buddy
  buddyState: BuddyState
  
  // Voice
  voiceState: VoiceState
  voicePermission: 'granted' | 'denied' | 'prompt'
  extractedEntities: ExtractedEntities | null
  
  // Boot
  bootComplete: boolean
  
  // Actions
  openWindow: (menuId: string) => void
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void
  updateWindowSize: (id: string, size: { width: number; height: number }) => void
  focusWindow: (id: string) => void
  updateIconPosition: (id: string, position: GridPosition) => void
  pinIcon: (id: string) => void
  unpinIcon: (id: string) => void
  hideIcon: (id: string) => void
  showIcon: (id: string) => void
  setBackground: (background: BackgroundConfig) => void
  setTheme: (theme: VoidTheme) => void
  setSpotifyState: (state: Partial<SpotifyState>) => void
  setBuddyState: (state: Partial<BuddyState>) => void
  setVoiceState: (state: VoiceState) => void
  setVoicePermission: (permission: 'granted' | 'denied' | 'prompt') => void
  setExtractedEntities: (entities: ExtractedEntities | null) => void
  completeBoot: () => void
}
