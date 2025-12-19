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
export interface WindowData {
  id: string
  title: string
  menuId?: string
  position: { x: number; y: number } // Pixel coordinates
  size: { width: number; height: number } // Pixel dimensions
  minimized: boolean
  maximized: boolean
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
  position: { x: number; y: number } | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  docked: boolean
  lastMessageTime: number
  emotion: BuddyEmotion
}
