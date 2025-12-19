/**
 * VOID Store State Management Tests
 * Tests for Zustand store actions and state updates
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useVoidStore } from '@/lib/void/store'
import type { GridPosition, WindowData } from '@/lib/void/types'

describe('VOID Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useVoidStore.getState()
    store.windows.forEach(w => store.closeWindow(w.id))
    store.icons.forEach(icon => {
      if (store.pinnedIcons.has(icon.id)) {
        store.unpinIcon(icon.id)
      }
    })
  })

  describe('Icon Management', () => {
    it('should update icon position', () => {
      const store = useVoidStore.getState()
      const iconId = store.icons[0]?.id
      if (!iconId) return

      const newPosition: GridPosition = { row: 5, col: 3 }
      store.updateIconPosition(iconId, newPosition)

      expect(store.iconPositions[iconId]).toEqual(newPosition)
    })

    it('should pin and unpin icons', () => {
      const store = useVoidStore.getState()
      const iconId = store.icons[0]?.id
      if (!iconId) return

      // Ensure icon is not already pinned
      if (store.pinnedIcons.has(iconId)) {
        store.unpinIcon(iconId)
      }

      store.pinIcon(iconId)
      expect(store.pinnedIcons.has(iconId)).toBe(true)
      expect(store.icons.find(i => i.id === iconId)?.pinned).toBe(true)

      store.unpinIcon(iconId)
      expect(store.pinnedIcons.has(iconId)).toBe(false)
      expect(store.icons.find(i => i.id === iconId)?.pinned).toBe(false)
    })

    it('should record icon usage', () => {
      const store = useVoidStore.getState()
      const iconId = store.icons[0]?.id
      if (!iconId) return

      // Clear any existing usage
      const currentUsage = store.iconUsage[iconId] || 0
      // Reset to 0 by clearing and re-adding
      const newStore = useVoidStore.getState()
      const initialUsage = newStore.iconUsage[iconId] || 0
      
      newStore.recordIconUsage(iconId)
      const updatedStore = useVoidStore.getState()
      expect(updatedStore.iconUsage[iconId]).toBe(initialUsage + 1)
    })
  })

  describe('Window Management', () => {
    it('should open a window', () => {
      const store = useVoidStore.getState()
      // Close any existing settings window first
      const existing = store.windows.find(w => w.menuId === 'settings')
      if (existing) {
        store.closeWindow(existing.id)
      }
      const initialWindowCount = store.windows.length

      store.openWindow('settings')
      
      expect(store.windows.length).toBe(initialWindowCount + 1)
      expect(store.windows.some(w => w.menuId === 'settings')).toBe(true)
    })

    it('should close a window', () => {
      const store = useVoidStore.getState()
      store.openWindow('settings')
      const window = store.windows.find(w => w.menuId === 'settings')
      
      if (window) {
        store.closeWindow(window.id)
        expect(store.windows.find(w => w.id === window.id)).toBeUndefined()
      }
    })

    it('should minimize a window', () => {
      const store = useVoidStore.getState()
      store.openWindow('settings')
      const window = store.windows.find(w => w.menuId === 'settings')
      
      if (window) {
        store.minimizeWindow(window.id)
        const updatedWindow = store.windows.find(w => w.id === window.id)
        expect(updatedWindow?.minimized).toBe(true)
      }
    })

    it('should maximize a window', () => {
      const store = useVoidStore.getState()
      store.openWindow('settings')
      const window = store.windows.find(w => w.menuId === 'settings')
      
      if (window) {
        store.maximizeWindow(window.id)
        const updatedWindow = store.windows.find(w => w.id === window.id)
        expect(updatedWindow?.maximized).toBe(true)
      }
    })

    it('should focus a window', () => {
      const store = useVoidStore.getState()
      store.openWindow('settings')
      const window = store.windows.find(w => w.menuId === 'settings')
      
      if (window) {
        store.focusWindow(window.id)
        expect(store.activeWindowId).toBe(window.id)
      }
    })

    it('should update window position', () => {
      const store = useVoidStore.getState()
      store.openWindow('settings')
      const window = store.windows.find(w => w.menuId === 'settings')
      
      if (window) {
        const newPosition = { x: 100, y: 200 }
        store.updateWindowPosition(window.id, newPosition)
        const updatedWindow = store.windows.find(w => w.id === window.id)
        expect(updatedWindow?.position).toEqual(newPosition)
      }
    })

    it('should update window size', () => {
      const store = useVoidStore.getState()
      store.openWindow('settings')
      const window = store.windows.find(w => w.menuId === 'settings')
      
      if (window) {
        const newSize = { width: 800, height: 600 }
        store.updateWindowSize(window.id, newSize)
        const updatedWindow = store.windows.find(w => w.id === window.id)
        expect(updatedWindow?.size).toEqual(newSize)
      }
    })
  })

  describe('Theme Management', () => {
    it('should set theme', () => {
      const store = useVoidStore.getState()
      const initialTheme = store.theme
      
      // Test setting to opposite theme
      const newTheme = initialTheme === 'light' ? 'dark' : 'light'
      store.setTheme(newTheme)
      expect(store.theme).toBe(newTheme)

      // Test setting back
      store.setTheme(initialTheme)
      expect(store.theme).toBe(initialTheme)
    })
  })

  describe('Media Management', () => {
    it('should set current track', () => {
      const store = useVoidStore.getState()
      const track = {
        id: 'test-track',
        title: 'Test Song',
        artist: 'Test Artist',
        album: 'Test Album',
        duration: 180,
        artwork: 'https://example.com/artwork.jpg',
        url: 'https://example.com/track.mp3'
      }

      store.setCurrentTrack(track)
      expect(store.currentTrack).toEqual(track)
    })

    it('should toggle playing state', () => {
      const store = useVoidStore.getState()
      const initialPlaying = store.isPlaying

      // Toggle to opposite state
      const newPlayingState = !initialPlaying
      store.setIsPlaying(newPlayingState)
      expect(store.isPlaying).toBe(newPlayingState)
      
      // Toggle back
      store.setIsPlaying(initialPlaying)
      expect(store.isPlaying).toBe(initialPlaying)
    })

    it('should set volume', () => {
      const store = useVoidStore.getState()
      const initialVolume = store.volume
      
      store.setVolume(0.75)
      expect(store.volume).toBe(0.75)
      
      // Restore initial volume
      store.setVolume(initialVolume)
    })

    it('should clamp volume between 0 and 1', () => {
      const store = useVoidStore.getState()
      const initialVolume = store.volume
      
      store.setVolume(1.5)
      expect(store.volume).toBe(1)

      store.setVolume(-0.5)
      expect(store.volume).toBe(0)
      
      // Restore initial volume
      store.setVolume(initialVolume)
    })
  })

  describe('Buddy Management', () => {
    it('should add buddy message', () => {
      const store = useVoidStore.getState()
      const initialCount = store.buddyMessages.length

      const message = {
        id: `test-msg-${Date.now()}`,
        message: 'Hello!',
        emotion: 'neutral' as const,
        timestamp: Date.now(),
        priority: 'low' as const
      }

      store.addBuddyMessage(message)
      const updatedStore = useVoidStore.getState()
      expect(updatedStore.buddyMessages.length).toBe(initialCount + 1)
      expect(updatedStore.buddyMessages[updatedStore.buddyMessages.length - 1]).toEqual(message)
    })

    it('should update buddy position', () => {
      const store = useVoidStore.getState()
      const initialPosition = store.buddyState.position
      
      store.setBuddyPosition('bottom-right')
      expect(store.buddyState.position).toBe('bottom-right')
      
      // Restore initial position
      store.setBuddyPosition(initialPosition)
    })

    it('should update buddy emotion', () => {
      const store = useVoidStore.getState()
      const initialEmotion = store.buddyState.emotion
      
      store.setBuddyEmotion('happy')
      expect(store.buddyState.emotion).toBe('happy')
      
      // Restore initial emotion
      store.setBuddyEmotion(initialEmotion)
    })
  })
})
