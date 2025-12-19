/**
 * VOID Window Component Tests
 * Tests for window rendering, interactions, and state management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VoidWindow } from '@/components/void/VoidWindow'
import { useVoidStore } from '@/lib/void/store'
import type { WindowData } from '@/lib/void/types'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}))

describe('VoidWindow', () => {
  let testWindow: WindowData

  beforeEach(() => {
    // Create a test window
    const store = useVoidStore.getState()
    store.openWindow('settings')
    testWindow = store.windows.find(w => w.menuId === 'settings')!
    
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true })
  })

  it('should render window with title', () => {
    render(<VoidWindow window={testWindow} />)
    expect(screen.getByText(/settings/i)).toBeInTheDocument()
  })

  it('should display window controls', () => {
    render(<VoidWindow window={testWindow} />)
    
    const minimizeBtn = screen.getByLabelText(/minimize/i)
    const maximizeBtn = screen.getByLabelText(/maximize/i)
    const closeBtn = screen.getByLabelText(/close/i)

    expect(minimizeBtn).toBeInTheDocument()
    expect(maximizeBtn).toBeInTheDocument()
    expect(closeBtn).toBeInTheDocument()
  })

  it('should close window when close button is clicked', () => {
    const store = useVoidStore.getState()
    const initialCount = store.windows.length

    render(<VoidWindow window={testWindow} />)
    const closeBtn = screen.getByLabelText(/close/i)
    fireEvent.click(closeBtn)

    expect(store.windows.length).toBe(initialCount - 1)
  })

  it('should minimize window when minimize button is clicked', () => {
    const store = useVoidStore.getState()
    
    render(<VoidWindow window={testWindow} />)
    const minimizeBtn = screen.getByLabelText(/minimize/i)
    fireEvent.click(minimizeBtn)

    const updatedWindow = store.windows.find(w => w.id === testWindow.id)
    expect(updatedWindow?.minimized).toBe(true)
  })

  it('should maximize window when maximize button is clicked', () => {
    const store = useVoidStore.getState()
    
    render(<VoidWindow window={testWindow} />)
    const maximizeBtn = screen.getByLabelText(/maximize/i)
    fireEvent.click(maximizeBtn)

    const updatedWindow = store.windows.find(w => w.id === testWindow.id)
    expect(updatedWindow?.maximized).toBe(true)
  })

  it('should focus window when clicked', () => {
    const store = useVoidStore.getState()
    
    render(<VoidWindow window={testWindow} />)
    const windowElement = screen.getByText(/settings/i).closest('.void-window')
    
    if (windowElement) {
      fireEvent.click(windowElement)
      expect(store.activeWindowId).toBe(testWindow.id)
    }
  })

  it('should render window content', () => {
    render(<VoidWindow window={testWindow} />)
    // Window should have content area
    const content = screen.getByText(/window content/i)
    expect(content).toBeInTheDocument()
  })
})
