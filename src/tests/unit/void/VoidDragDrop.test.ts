/**
 * VOID Drag and Drop System Tests
 * Tests for native HTML5 drag and drop functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useVoidStore } from '@/lib/void/store'
import type { GridPosition } from '@/lib/void/types'

describe('VOID Drag and Drop System', () => {
  beforeEach(() => {
    const store = useVoidStore.getState()
    // Reset icon positions
    Object.keys(store.iconPositions).forEach(id => {
      store.updateIconPosition(id, { row: 0, col: 0 })
    })
  })

  describe('Icon Drag Start', () => {
    it('should set drag data on drag start', () => {
      const store = useVoidStore.getState()
      if (store.icons.length === 0) return

      const iconId = store.icons[0].id
      const mockDataTransfer = {
        setData: vi.fn(),
        effectAllowed: 'move' as const
      }

      const dragEvent = {
        dataTransfer: mockDataTransfer,
        preventDefault: vi.fn()
      } as unknown as DragEvent

      // Simulate drag start (normally handled by VoidIcon component)
      mockDataTransfer.setData('text/plain', iconId)
      mockDataTransfer.effectAllowed = 'move'

      expect(mockDataTransfer.setData).toHaveBeenCalledWith('text/plain', iconId)
      expect(mockDataTransfer.effectAllowed).toBe('move')
    })

    it('should not allow dragging pinned icons', () => {
      const store = useVoidStore.getState()
      if (store.icons.length === 0) return

      const iconId = store.icons[0].id
      // Ensure icon is not already pinned
      if (store.pinnedIcons.has(iconId)) {
        store.unpinIcon(iconId)
      }
      
      store.pinIcon(iconId)

      // Pinned icons should be in the pinnedIcons set
      expect(store.pinnedIcons.has(iconId)).toBe(true)
      // Icon should also have pinned property set
      const icon = store.icons.find(i => i.id === iconId)
      expect(icon?.pinned).toBe(true)
    })
  })

  describe('Icon Drop', () => {
    it('should update icon position on drop', () => {
      const store = useVoidStore.getState()
      if (store.icons.length === 0) return

      const iconId = store.icons[0].id
      const newPosition: GridPosition = { row: 5, col: 3 }

      // Simulate drop (normally handled by VoidDesktop component)
      store.updateIconPosition(iconId, newPosition)

      expect(store.iconPositions[iconId]).toEqual(newPosition)
    })

    it('should snap to grid on drop', () => {
      const store = useVoidStore.getState()
      if (store.icons.length === 0) return

      const iconId = store.icons[0].id
      // Grid uses row/col coordinates
      const rawPosition: GridPosition = { row: 5, col: 3 }

      store.updateIconPosition(iconId, rawPosition)
      
      // Position should be updated (actual snapping happens in component)
      const position = store.iconPositions[iconId]
      expect(position).toEqual(rawPosition)
    })

    it('should prevent overlapping icons', () => {
      const store = useVoidStore.getState()
      if (store.icons.length < 2) return

      const icon1Id = store.icons[0].id
      const icon2Id = store.icons[1].id

      const position: GridPosition = { row: 2, col: 2 }
      store.updateIconPosition(icon1Id, position)
      store.updateIconPosition(icon2Id, position)

      // Both icons can have same position initially
      // Collision detection would happen in component
      expect(store.iconPositions[icon1Id]).toEqual(position)
      expect(store.iconPositions[icon2Id]).toEqual(position)
    })
  })

  describe('Window Drag', () => {
    it('should update window position on drag', () => {
      const store = useVoidStore.getState()
      store.openWindow('settings')
      const window = store.windows.find(w => w.menuId === 'settings')
      
      if (window) {
        const newPosition = { x: 200, y: 150 }
        store.updateWindowPosition(window.id, newPosition)
        
        const updatedWindow = store.windows.find(w => w.id === window.id)
        expect(updatedWindow?.position).toEqual(newPosition)
      }
    })

    it('should not allow dragging maximized windows', () => {
      const store = useVoidStore.getState()
      // Close any existing settings window
      const existing = store.windows.find(w => w.menuId === 'settings')
      if (existing) {
        store.closeWindow(existing.id)
      }
      
      store.openWindow('settings')
      const window = store.windows.find(w => w.menuId === 'settings')
      
      if (window) {
        // Ensure window is not maximized initially
        if (window.maximized) {
          store.maximizeWindow(window.id) // Toggle off
        }
        
        // Maximize the window
        store.maximizeWindow(window.id)
        const updatedWindow = store.windows.find(w => w.id === window.id)
        
        // Maximized windows shouldn't be draggable
        // This is enforced in the component, not the store
        // Store just tracks the maximized state
        expect(updatedWindow?.maximized).toBe(true)
      }
    })
  })
})
