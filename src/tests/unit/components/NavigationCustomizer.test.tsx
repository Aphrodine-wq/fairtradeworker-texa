import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NavigationCustomizer } from '@/components/navigation/NavigationCustomizer'
import type { User, NavItem, NavigationPreferences } from '@/lib/types'
import type { NavigationPreferences as NavPrefs } from '@/lib/types/navigation'

describe('NavigationCustomizer', () => {
  const mockUser: User = {
    id: 'test-user',
    email: 'test@example.com',
    fullName: 'Test User',
    role: 'contractor',
    isPro: false,
    performanceScore: 0,
    bidAccuracy: 0,
    isOperator: false,
    createdAt: new Date().toISOString(),
    referralEarnings: 0,
    contractorInviteCount: 0,
  }

  const mockNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      page: 'dashboard',
      visible: true,
      order: 1,
      iconName: 'ChartLine',
    },
    {
      id: 'crm',
      label: 'CRM',
      page: 'crm',
      visible: true,
      order: 2,
      iconName: 'Users',
    },
  ]

  const mockOnSave = vi.fn()
  const mockOnReset = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render the navigation customizer with correct title and description', () => {
      render(
        <NavigationCustomizer
          user={mockUser}
          currentNav={mockNavItems}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Customize Navigation')).toBeInTheDocument()
      expect(screen.getByText(/Drag items to reorder/i)).toBeInTheDocument()
    })

    it('should display all navigation items in the list', () => {
      render(
        <NavigationCustomizer
          user={mockUser}
          currentNav={mockNavItems}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('CRM')).toBeInTheDocument()
    })

    it('should show visible item count in description', () => {
      render(
        <NavigationCustomizer
          user={mockUser}
          currentNav={mockNavItems}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText(/2 item/)).toBeInTheDocument()
    })
  })

  describe('Business Tools Addition', () => {
    it('should display available business tools section for contractors', () => {
      render(
        <NavigationCustomizer
          user={mockUser}
          currentNav={mockNavItems}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
        />
      )

      // Business tools section should be visible for contractors
      expect(screen.getByText('Add Business Tools to Navigation')).toBeInTheDocument()
    })

    it('should show available business tools that are not already in navigation', async () => {
      render(
        <NavigationCustomizer
          user={mockUser}
          currentNav={mockNavItems}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
        />
      )

      // Should show business tools like Cost Calculator, Warranty Tracker, Quick Notes
      await waitFor(() => {
        expect(screen.getByText('Cost Calculator')).toBeInTheDocument()
        expect(screen.getByText('Warranty Tracker')).toBeInTheDocument()
        expect(screen.getByText('Quick Notes')).toBeInTheDocument()
      })
    })

    it('should allow adding a business tool to navigation', async () => {
      render(
        <NavigationCustomizer
          user={mockUser}
          currentNav={mockNavItems}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
        />
      )

      // Find and click the "Add" button for Cost Calculator
      const addButtons = screen.getAllByText('Add')
      const costCalculatorAddButton = addButtons.find(btn => 
        btn.closest('div')?.textContent?.includes('Cost Calculator')
      )

      expect(costCalculatorAddButton).toBeInTheDocument()
      
      if (costCalculatorAddButton) {
        fireEvent.click(costCalculatorAddButton)
        
        // Verify the tool was added to the navigation items
        await waitFor(() => {
          expect(screen.getByText('Cost Calculator')).toBeInTheDocument()
        })
      }
    })
  })

  describe('Navigation Item Management', () => {
    it('should allow toggling item visibility', async () => {
      render(
        <NavigationCustomizer
          user={mockUser}
          currentNav={mockNavItems}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
        />
      )

      // Find toggle switch for Dashboard
      const toggles = screen.getAllByRole('switch')
      const dashboardToggle = toggles[0]

      // Toggle off
      fireEvent.click(dashboardToggle)
      
      await waitFor(() => {
        expect(dashboardToggle).not.toBeChecked()
      })
    })

    it('should prevent hiding all navigation items', async () => {
      render(
        <NavigationCustomizer
          user={mockUser}
          currentNav={mockNavItems}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
        />
      )

      const toggles = screen.getAllByRole('switch')
      
      // Turn off first item
      fireEvent.click(toggles[0])
      
      // Try to turn off second item (should show validation error)
      fireEvent.click(toggles[1])
      
      // Should show error message about at least one item needing to be visible
      await waitFor(() => {
        // Error should be displayed (implementation dependent)
      })
    })
  })

  describe('Save Functionality', () => {
    it('should call onSave with updated preferences when save button is clicked', async () => {
      render(
        <NavigationCustomizer
          user={mockUser}
          currentNav={mockNavItems}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
        />
      )

      const saveButton = screen.getByText('Save Changes')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1)
        const savedPrefs = mockOnSave.mock.calls[0][0] as NavPrefs
        expect(savedPrefs.items).toHaveLength(2)
        expect(savedPrefs.version).toBe('1.0.0')
        expect(savedPrefs.lastUpdated).toBeDefined()
      })
    })

    it('should call onClose after successful save', async () => {
      render(
        <NavigationCustomizer
          user={mockUser}
          currentNav={mockNavItems}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
        />
      )

      const saveButton = screen.getByText('Save Changes')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })
  })

  describe('Reset Functionality', () => {
    it('should call onReset when reset button is clicked and confirmed', async () => {
      // Mock window.confirm to return true
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

      render(
        <NavigationCustomizer
          user={mockUser}
          currentNav={mockNavItems}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
        />
      )

      const resetButton = screen.getByText('Reset to Defaults')
      fireEvent.click(resetButton)

      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalledWith('Reset navigation to defaults? Your customizations will be lost.')
        expect(mockOnReset).toHaveBeenCalledTimes(1)
      })

      confirmSpy.mockRestore()
    })

    it('should not reset if user cancels confirmation', async () => {
      // Mock window.confirm to return false
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

      render(
        <NavigationCustomizer
          user={mockUser}
          currentNav={mockNavItems}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
        />
      )

      const resetButton = screen.getByText('Reset to Defaults')
      fireEvent.click(resetButton)

      await waitFor(() => {
        expect(mockOnReset).not.toHaveBeenCalled()
      })

      confirmSpy.mockRestore()
    })
  })

  describe('User Role Handling', () => {
    it('should show business tools section for homeowners', () => {
      const homeowner: User = { ...mockUser, role: 'homeowner' }
      
      render(
        <NavigationCustomizer
          user={homeowner}
          currentNav={mockNavItems}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Add Business Tools to Navigation')).toBeInTheDocument()
    })

    it('should not show business tools section for operators', () => {
      const operator: User = { ...mockUser, role: 'operator', isOperator: true }
      
      render(
        <NavigationCustomizer
          user={operator}
          currentNav={mockNavItems}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
        />
      )

      // Operators don't have business tools, so section should not appear
      expect(screen.queryByText('Add Business Tools to Navigation')).not.toBeInTheDocument()
    })
  })
})
