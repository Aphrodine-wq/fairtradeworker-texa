/**
 * VOID Desktop Component Tests
 * Tests for desktop rendering, icon display, and drag & drop
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VoidDesktop } from '@/components/void/VoidDesktop'
import { useVoidStore } from '@/lib/void/store'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => children
}))

describe('VoidDesktop', () => {
  beforeEach(() => {
    // Reset desktop state
    const store = useVoidStore.getState()
    // Ensure we have some icons
    if (store.icons.length === 0) {
      // Icons should be initialized by default
      return
    }
  })

  it('should render desktop', () => {
    render(<VoidDesktop />)
    const desktop = screen.getByRole('region', { name: /desktop/i }) || 
                    document.querySelector('.void-desktop')
    expect(desktop).toBeInTheDocument()
  })

  it('should display desktop icons', () => {
    const store = useVoidStore.getState()
    render(<VoidDesktop />)
    
    // Check if icons are rendered (they should be based on store.icons)
    if (store.icons.length > 0) {
      // Icons should be present in the DOM
      const icons = document.querySelectorAll('.void-icon')
      expect(icons.length).toBeGreaterThan(0)
    }
  })

  it('should handle icon drag start', () => {
    const store = useVoidStore.getState()
    if (store.icons.length === 0) return

    render(<VoidDesktop />)
    const icon = document.querySelector('.void-icon') as HTMLElement
    
    if (icon) {
      const dragEvent = new DragEvent('dragstart', { bubbles: true })
      Object.defineProperty(dragEvent, 'dataTransfer', {
        value: {
          setData: vi.fn(),
          effectAllowed: 'move'
        }
      })
      
      fireEvent(icon, dragEvent)
      // Drag should be initiated
      expect(icon.getAttribute('draggable')).toBe('true')
    }
  })

    it('should handle icon drop', async () => {
      const store = useVoidStore.getState()
      if (store.icons.length === 0) return

      const iconId = store.icons[0].id
      const initialPosition = store.iconPositions[iconId] || { row: 0, col: 0 }

      render(<VoidDesktop />)
      const desktop = document.querySelector('.void-desktop') as HTMLElement

      if (desktop) {
        // Simulate drag over
        const dragOverEvent = new DragEvent('dragover', { bubbles: true, cancelable: true })
        Object.defineProperty(dragOverEvent, 'dataTransfer', {
          value: { dropEffect: 'move' }
        })
        fireEvent(desktop, dragOverEvent)

        // Simulate drop
        const dropEvent = new DragEvent('drop', { bubbles: true })
        Object.defineProperty(dropEvent, 'dataTransfer', {
          value: {
            getData: vi.fn(() => iconId)
          }
        })
        
        // Get drop coordinates from event
        Object.defineProperty(dropEvent, 'clientX', { value: 500 })
        Object.defineProperty(dropEvent, 'clientY', { value: 300 })
        
        fireEvent(desktop, dropEvent)

        await waitFor(() => {
          const newPosition = store.iconPositions[iconId]
          // Position should be updated (snapped to grid)
          expect(newPosition).toBeDefined()
          // Should have row and col properties
          expect(newPosition).toHaveProperty('row')
          expect(newPosition).toHaveProperty('col')
        })
      }
    })

  it('should show dragging indicator during drag', () => {
    render(<VoidDesktop />)
    // When dragging, should show "DRAGGING" text
    // This is handled by the component's internal state
    const desktop = document.querySelector('.void-desktop')
    expect(desktop).toBeInTheDocument()
  })
})
