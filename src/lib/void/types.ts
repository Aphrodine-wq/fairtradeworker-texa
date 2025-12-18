/**
 * VOID CRM Type Definitions
 */

import type React from 'react'

export interface VoidIcon {
  id: string
  label: string
  icon: string // Emoji or icon name
  menuId: string
  position: { x: number; y: number }
  isPinned: boolean
  color?: string
  isHidden: boolean
}

export interface VoidWindow {
  id: string
  menuId: string
  title: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  content: React.ReactNode
}

export interface WiremapNode {
  id: string
  x: number
  y: number
  size: number
  color: string
  pulsePhase: number
  connections: string[] // IDs of connected nodes
}

export interface WiremapConnection {
  from: string
  to: string
  color: string
  opacity: number
}

export interface VoiceRecordingState {
  state: 'idle' | 'listening' | 'processing' | 'syncing' | 'complete'
  transcript: string
  entities: ExtractedEntity[]
  waveform: number[]
}

export interface ExtractedEntity {
  type: 'name' | 'phone' | 'email' | 'address' | 'project_type' | 'budget'
  value: string
  confidence: number
}

export interface BuddyMessage {
  text: string
  type: 'greeting' | 'insight' | 'milestone' | 'reminder' | 'celebration'
  timestamp: number
}

export interface SpotifyState {
  isConnected: boolean
  isPlaying: boolean
  currentTrack: {
    name: string
    artist: string
    album: string
    artwork: string
    duration: number
    currentTime: number
  } | null
  volume: number
  isShuffled: boolean
  isRepeating: boolean
}

export type MenuId = 
  | 'customers'
  | 'leads'
  | 'ai'
  | 'automation'
  | 'integrations'
  | 'sales'
  | 'pipeline'
  | 'social-media'
  | 'analytics'
  | 'contacts'
  | 'workflows'
  | 'marketing'
  | 'email'
  | 'billing'
  | 'documents'
  | 'calendar'
  | 'marketplace'
  | 'settings'
  | 'support'
  | 'voice'

export interface MenuConfig {
  id: MenuId
  label: string
  icon: string
  sections: {
    left: MenuSection
    middle: MenuSection
    right: MenuSection
  }
}

export interface MenuSection {
  title: string
  items: MenuItem[]
}

export interface MenuItem {
  id: string
  label: string
  icon?: string
  action: string | (() => void)
  badge?: number
}
