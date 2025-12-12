import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
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

  it('toggles theme on click', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    
    // Initial state should be light
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    
    // Click to toggle to dark
    fireEvent.click(button)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
    
    // Click to toggle back to light
    fireEvent.click(button)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
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

  it('has proper button size for touch targets', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    
    expect(button).toHaveClass('min-w-[40px]')
    expect(button).toHaveClass('min-h-[40px]')
  })
})
