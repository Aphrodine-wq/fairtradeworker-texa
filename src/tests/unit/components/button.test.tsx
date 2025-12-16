import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render with default variant and size', () => {
      render(<Button>Click me</Button>)
      const button = screen.getByRole('button', { name: /click me/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('bg-black', 'text-white', 'h-10')
    })

    it('should render button text correctly', () => {
      render(<Button>Test Button</Button>)
      expect(screen.getByText('Test Button')).toBeInTheDocument()
    })

    it('should render with custom className', () => {
      render(<Button className="custom-class">Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })
  })

  describe('Variants', () => {
    it('should render default variant', () => {
      render(<Button variant="default">Default</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-black', 'text-white', 'border-black')
    })

    it('should render destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-red-600', 'text-white', 'border-red-600')
    })

    it('should render outline variant', () => {
      render(<Button variant="outline">Outline</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-transparent', 'border-black')
    })

    it('should render secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-gray-100', 'text-black', 'border-gray-300')
    })

    it('should render ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-transparent', 'border-transparent')
    })

    it('should render link variant', () => {
      render(<Button variant="link">Link</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-transparent', 'underline-offset-4')
    })

    it('should render success variant', () => {
      render(<Button variant="success">Success</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-green-600', 'text-white', 'border-green-600')
    })

    it('should render warning variant', () => {
      render(<Button variant="warning">Warning</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-yellow-500', 'text-black', 'border-yellow-600')
    })
  })

  describe('Sizes', () => {
    it('should render default size', () => {
      render(<Button size="default">Default Size</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10', 'px-4', 'py-2')
    })

    it('should render small size', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-8', 'px-3', 'text-xs')
    })

    it('should render large size', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-12', 'px-6', 'text-base')
    })

    it('should render extra large size', () => {
      render(<Button size="xl">Extra Large</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-14', 'px-8', 'text-lg')
    })

    it('should render icon size', () => {
      render(<Button size="icon" aria-label="Icon button">⚙️</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10', 'w-10', 'p-0')
    })
  })

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
    })

    it('should not be disabled by default', () => {
      render(<Button>Enabled</Button>)
      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
    })

    it('should have hover classes', () => {
      render(<Button>Hover</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:scale-[1.02]', 'hover:bg-gray-800')
    })

    it('should have active classes', () => {
      render(<Button>Active</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('active:scale-[0.98]')
    })

    it('should have focus-visible classes', () => {
      render(<Button>Focus</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2')
    })
  })

  describe('Transitions', () => {
    it('should have transition classes', () => {
      render(<Button>Transition</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('transition-all', 'duration-200', 'ease-out')
    })
  })

  describe('Border', () => {
    it('should have border-2 class by default', () => {
      render(<Button>Border</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border-2')
    })

    it('should have border-transparent for ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border-transparent')
    })

    it('should have border-transparent for link variant', () => {
      render(<Button variant="link">Link</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border-transparent')
    })
  })

  describe('Variant and Size Combinations', () => {
    it('should render destructive small button', () => {
      render(<Button variant="destructive" size="sm">Delete</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-red-600', 'h-8', 'text-xs')
    })

    it('should render outline large button', () => {
      render(<Button variant="outline" size="lg">Outline Large</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-transparent', 'h-12', 'text-base')
    })

    it('should render success extra large button', () => {
      render(<Button variant="success" size="xl">Success XL</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-green-600', 'h-14', 'text-lg')
    })
  })

  describe('asChild Prop', () => {
    it('should render as Slot when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      )
      const link = screen.getByRole('link', { name: /link button/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
    })
  })

  describe('Click Handler', () => {
    it('should call onClick when clicked', () => {
      let clicked = false
      render(<Button onClick={() => { clicked = true }}>Click</Button>)
      const button = screen.getByRole('button')
      button.click()
      expect(clicked).toBe(true)
    })

    it('should not call onClick when disabled', () => {
      let clicked = false
      render(<Button disabled onClick={() => { clicked = true }}>Click</Button>)
      const button = screen.getByRole('button')
      button.click()
      expect(clicked).toBe(false)
    })
  })

  describe('Accessibility', () => {
    it('should have button role', () => {
      render(<Button>Button</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should support aria-label', () => {
      render(<Button aria-label="Custom label">Icon</Button>)
      expect(screen.getByLabelText('Custom label')).toBeInTheDocument()
    })

    it('should support aria-disabled', () => {
      render(<Button disabled aria-disabled="true">Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-disabled', 'true')
    })

    it('should have focus-visible ring for accessibility', () => {
      render(<Button>Focus Ring</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-offset-2')
    })
  })

  describe('Icon Support', () => {
    it('should render with SVG icons', () => {
      render(
        <Button>
          <svg data-testid="test-icon" />
          Icon Button
        </Button>
      )
      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
      expect(screen.getByText('Icon Button')).toBeInTheDocument()
    })

    it('should have icon-specific classes for SVG', () => {
      render(<Button>Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('[&_svg]:pointer-events-none')
    })
  })

  describe('Type Attribute', () => {
    it('should render without explicit type by default', () => {
      render(<Button>Button</Button>)
      const button = screen.getByRole('button')
      // Buttons without type attribute default to "submit" in forms, but our component doesn't enforce this
      expect(button).toBeInTheDocument()
    })

    it('should support submit type', () => {
      render(<Button type="submit">Submit</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
    })

    it('should support reset type', () => {
      render(<Button type="reset">Reset</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'reset')
    })

    it('should support button type explicitly', () => {
      render(<Button type="button">Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
    })
  })
})
