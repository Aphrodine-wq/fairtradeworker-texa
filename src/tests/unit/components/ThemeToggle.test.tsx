import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('renders the theme toggle button', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('has proper accessibility label', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label')
  })

  it('should toggle between light and dark themes on click and persist to localStorage', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    
    // Verify initial state is light mode
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBeNull()
    
    // Click to toggle to dark mode
    fireEvent.click(button)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
    
    // Verify theme color meta tag is updated
    const themeColorMeta = document.querySelector('meta[name="theme-color"]')
    expect(themeColorMeta?.getAttribute('content')).toBe('#000000')
    
    // Click to toggle back to light mode
    fireEvent.click(button)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
    
    // Verify theme color meta tag is updated for light mode
    expect(themeColorMeta?.getAttribute('content')).toBe('#ffffff')
  })

  it('respects saved theme preference', () => {
    localStorage.setItem('theme', 'dark')
    render(<ThemeToggle />)
    
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('respects system preference when no saved theme', () => {
    const matchMediaMock = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    })

    render(<ThemeToggle />)
    
    expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
  })

  it('should have proper button size for touch targets (minimum 44px for accessibility)', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    
    // Verify button has minimum size classes for touch accessibility
    expect(button.className).toContain('min-w-[44px]')
    expect(button.className).toContain('min-h-[44px]')
    
    // Verify button has proper dimensions
    const styles = window.getComputedStyle(button)
    expect(parseInt(styles.width) || parseInt(styles.minWidth)).toBeGreaterThanOrEqual(32)
    expect(parseInt(styles.height) || parseInt(styles.minHeight)).toBeGreaterThanOrEqual(32)
  })

  it('should have 5-second transition duration matching global theme transition', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    
    // Verify button has the 5-second transition duration class
    expect(button.className).toContain('duration-[5000ms]')
    
    // Verify motion component has 5-second transition
    // This ensures theme toggle animation is synchronized with page transitions
  })

  it('should update Apple status bar style meta tag when theme changes', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    
    // Check initial state (light mode - default status bar)
    let statusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
    expect(statusBarMeta?.getAttribute('content')).toBe('default')
    
    // Toggle to dark mode
    fireEvent.click(button)
    statusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
    expect(statusBarMeta?.getAttribute('content')).toBe('black')
    
    // Toggle back to light mode
    fireEvent.click(button)
    statusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
    expect(statusBarMeta?.getAttribute('content')).toBe('default')
  })

  it('should have hover and active states for better user interaction feedback', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    
    // Verify button has hover and active state classes
    expect(button.className).toContain('hover:scale-105')
    expect(button.className).toContain('active:scale-95')
  })
})
