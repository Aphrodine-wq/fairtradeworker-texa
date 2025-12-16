import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '@/components/ui/input'

describe('Input Component', () => {
  describe('Rendering', () => {
    it('should render input element', () => {
      render(<Input data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toBeInTheDocument()
      expect(input.tagName).toBe('INPUT')
    })

    it('should have data-slot attribute', () => {
      render(<Input data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveAttribute('data-slot', 'input')
    })

    it('should apply custom className', () => {
      render(<Input className="custom-class" data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveClass('custom-class')
    })

    it('should have base styling classes', () => {
      render(<Input data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('bg-white', 'dark:bg-black', 'rounded-md', 'border')
    })
  })

  describe('Input Types', () => {
    it('should render text input by default', () => {
      render(<Input data-testid="input" />)
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.type).toBe('text')
    })

    it('should render email type', () => {
      render(<Input type="email" data-testid="input" />)
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.type).toBe('email')
    })

    it('should render password type', () => {
      render(<Input type="password" data-testid="input" />)
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.type).toBe('password')
    })

    it('should render number type', () => {
      render(<Input type="number" data-testid="input" />)
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.type).toBe('number')
    })

    it('should render tel type', () => {
      render(<Input type="tel" data-testid="input" />)
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.type).toBe('tel')
    })

    it('should render search type', () => {
      render(<Input type="search" data-testid="input" />)
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.type).toBe('search')
    })

    it('should render url type', () => {
      render(<Input type="url" data-testid="input" />)
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.type).toBe('url')
    })

    it('should render date type', () => {
      render(<Input type="date" data-testid="input" />)
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.type).toBe('date')
    })

    it('should render file type', () => {
      render(<Input type="file" data-testid="input" />)
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.type).toBe('file')
    })
  })

  describe('Placeholder', () => {
    it('should display placeholder text', () => {
      render(<Input placeholder="Enter text" data-testid="input" />)
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.placeholder).toBe('Enter text')
    })

    it('should have placeholder styling classes', () => {
      render(<Input placeholder="Test" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('placeholder:text-black/60', 'dark:placeholder:text-white/60')
    })
  })

  describe('Value and onChange', () => {
    it('should handle controlled input', () => {
      let value = ''
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        value = e.target.value
      }

      const { rerender } = render(<Input value={value} onChange={handleChange} data-testid="input" />)
      const input = screen.getByTestId('input') as HTMLInputElement

      fireEvent.change(input, { target: { value: 'test' } })
      rerender(<Input value={value} onChange={handleChange} data-testid="input" />)
      expect(value).toBe('test')
    })

    it('should display initial value', () => {
      render(<Input value="initial" onChange={() => {}} data-testid="input" />)
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.value).toBe('initial')
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toBeDisabled()
    })

    it('should have disabled styling classes', () => {
      render(<Input disabled data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-40')
    })
  })

  describe('Focus State', () => {
    it('should have focus styling classes', () => {
      render(<Input data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveClass(
        'focus:bg-white',
        'dark:focus:bg-black',
        'focus:shadow-md',
        'focus:border-black',
        'focus:ring-2'
      )
    })

    it('should focus when focused programmatically', () => {
      render(<Input data-testid="input" />)
      const input = screen.getByTestId('input') as HTMLInputElement
      input.focus()
      expect(input).toHaveFocus()
    })
  })

  describe('Invalid State', () => {
    it('should have invalid styling when aria-invalid is true', () => {
      render(<Input aria-invalid="true" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('aria-invalid:border-[#FF0000]', 'aria-invalid:ring-2')
    })

    it('should support aria-invalid attribute', () => {
      render(<Input aria-invalid="true" data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('Required Attribute', () => {
    it('should support required attribute', () => {
      render(<Input required data-testid="input" />)
      expect(screen.getByTestId('input')).toBeRequired()
    })
  })

  describe('Readonly Attribute', () => {
    it('should support readonly attribute', () => {
      render(<Input readOnly data-testid="input" />)
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.readOnly).toBe(true)
    })
  })

  describe('Name and ID', () => {
    it('should support name attribute', () => {
      render(<Input name="username" data-testid="input" />)
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.name).toBe('username')
    })

    it('should support id attribute', () => {
      render(<Input id="email-input" data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveAttribute('id', 'email-input')
    })
  })

  describe('Min and Max', () => {
    it('should support min attribute for number input', () => {
      render(<Input type="number" min={0} data-testid="input" />)
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.min).toBe('0')
    })

    it('should support max attribute for number input', () => {
      render(<Input type="number" max={100} data-testid="input" />)
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.max).toBe('100')
    })
  })

  describe('Pattern', () => {
    it('should support pattern attribute', () => {
      render(<Input pattern="[0-9]*" data-testid="input" />)
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.pattern).toBe('[0-9]*')
    })
  })

  describe('AutoComplete', () => {
    it('should support autocomplete attribute', () => {
      render(<Input autoComplete="email" data-testid="input" />)
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.autocomplete).toBe('email')
    })
  })

  describe('Sizing and Dimensions', () => {
    it('should have default height', () => {
      render(<Input data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveClass('h-9')
    })

    it('should have full width', () => {
      render(<Input data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveClass('w-full')
    })

    it('should have padding', () => {
      render(<Input data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveClass('px-4', 'py-3')
    })
  })

  describe('Transitions', () => {
    it('should have transition classes', () => {
      render(<Input data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveClass('transition-all', 'duration-200')
    })
  })

  describe('Text Styling', () => {
    it('should have text size classes', () => {
      render(<Input data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveClass('text-sm')
    })

    it('should have text color classes', () => {
      render(<Input data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('text-black', 'dark:text-white')
    })

    it('should have selection styling', () => {
      render(<Input data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('selection:bg-black', 'selection:text-white')
    })
  })

  describe('File Input', () => {
    it('should have file input styling classes', () => {
      render(<Input type="file" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('file:border-0', 'file:bg-transparent', 'file:text-sm')
    })
  })

  describe('Accessibility', () => {
    it('should support aria-label', () => {
      render(<Input aria-label="Username input" data-testid="input" />)
      expect(screen.getByLabelText('Username input')).toBeInTheDocument()
    })

    it('should support aria-describedby', () => {
      render(<Input aria-describedby="error-message" data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveAttribute('aria-describedby', 'error-message')
    })
  })
})
