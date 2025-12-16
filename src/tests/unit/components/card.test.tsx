import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

describe('Card Component', () => {
  describe('Card', () => {
    it('should render card with default styles', () => {
      render(<Card data-testid="card">Card Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('bg-white', 'dark:bg-black', 'rounded-xl')
    })

    it('should render children correctly', () => {
      render(<Card>Test Content</Card>)
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<Card className="custom-class" data-testid="card">Content</Card>)
      expect(screen.getByTestId('card')).toHaveClass('custom-class')
    })

    it('should have shadow styles', () => {
      render(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('shadow-lg', 'hover:shadow-xl')
    })

    it('should have transition classes', () => {
      render(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('transition-all', 'duration-200')
    })

    it('should have data-slot attribute', () => {
      render(<Card data-testid="card">Content</Card>)
      expect(screen.getByTestId('card')).toHaveAttribute('data-slot', 'card')
    })

    it('should render with glass variant', () => {
      render(<Card glass data-testid="card">Glass Card</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('bg-glass-light', 'dark:bg-glass-dark', 'backdrop-blur-xs')
    })

    it('should not have glass styles by default', () => {
      render(<Card data-testid="card">Default Card</Card>)
      const card = screen.getByTestId('card')
      expect(card).not.toHaveClass('backdrop-blur-xs')
    })
  })

  describe('CardHeader', () => {
    it('should render CardHeader', () => {
      render(<CardHeader data-testid="card-header">Header</CardHeader>)
      const header = screen.getByTestId('card-header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveAttribute('data-slot', 'card-header')
    })

    it('should have grid layout classes', () => {
      render(<CardHeader data-testid="card-header">Header</CardHeader>)
      const header = screen.getByTestId('card-header')
      expect(header).toHaveClass('grid', 'auto-rows-min', 'items-start')
    })

    it('should apply custom className', () => {
      render(<CardHeader className="custom-header" data-testid="card-header">Header</CardHeader>)
      expect(screen.getByTestId('card-header')).toHaveClass('custom-header')
    })

    it('should have padding', () => {
      render(<CardHeader data-testid="card-header">Header</CardHeader>)
      expect(screen.getByTestId('card-header')).toHaveClass('px-5')
    })
  })

  describe('CardTitle', () => {
    it('should render CardTitle', () => {
      render(<CardTitle data-testid="card-title">Title</CardTitle>)
      const title = screen.getByTestId('card-title')
      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent('Title')
    })

    it('should have title styles', () => {
      render(<CardTitle data-testid="card-title">Title</CardTitle>)
      const title = screen.getByTestId('card-title')
      expect(title).toHaveClass('font-semibold', 'text-base')
    })

    it('should have data-slot attribute', () => {
      render(<CardTitle data-testid="card-title">Title</CardTitle>)
      expect(screen.getByTestId('card-title')).toHaveAttribute('data-slot', 'card-title')
    })

    it('should apply custom className', () => {
      render(<CardTitle className="custom-title" data-testid="card-title">Title</CardTitle>)
      expect(screen.getByTestId('card-title')).toHaveClass('custom-title')
    })
  })

  describe('CardDescription', () => {
    it('should render CardDescription', () => {
      render(<CardDescription data-testid="card-description">Description</CardDescription>)
      const description = screen.getByTestId('card-description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveTextContent('Description')
    })

    it('should have description styles', () => {
      render(<CardDescription data-testid="card-description">Description</CardDescription>)
      const description = screen.getByTestId('card-description')
      expect(description).toHaveClass('text-sm', 'text-black', 'dark:text-white')
    })

    it('should have data-slot attribute', () => {
      render(<CardDescription data-testid="card-description">Desc</CardDescription>)
      expect(screen.getByTestId('card-description')).toHaveAttribute('data-slot', 'card-description')
    })

    it('should apply custom className', () => {
      render(<CardDescription className="custom-desc" data-testid="card-description">Desc</CardDescription>)
      expect(screen.getByTestId('card-description')).toHaveClass('custom-desc')
    })
  })

  describe('CardAction', () => {
    it('should render CardAction', () => {
      render(<CardAction data-testid="card-action">Action</CardAction>)
      const action = screen.getByTestId('card-action')
      expect(action).toBeInTheDocument()
      expect(action).toHaveTextContent('Action')
    })

    it('should have action positioning classes', () => {
      render(<CardAction data-testid="card-action">Action</CardAction>)
      const action = screen.getByTestId('card-action')
      expect(action).toHaveClass('col-start-2', 'row-span-2', 'self-start', 'justify-self-end')
    })

    it('should have data-slot attribute', () => {
      render(<CardAction data-testid="card-action">Action</CardAction>)
      expect(screen.getByTestId('card-action')).toHaveAttribute('data-slot', 'card-action')
    })

    it('should apply custom className', () => {
      render(<CardAction className="custom-action" data-testid="card-action">Action</CardAction>)
      expect(screen.getByTestId('card-action')).toHaveClass('custom-action')
    })
  })

  describe('CardContent', () => {
    it('should render CardContent', () => {
      render(<CardContent data-testid="card-content">Content</CardContent>)
      const content = screen.getByTestId('card-content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveTextContent('Content')
    })

    it('should have padding', () => {
      render(<CardContent data-testid="card-content">Content</CardContent>)
      expect(screen.getByTestId('card-content')).toHaveClass('px-5')
    })

    it('should have data-slot attribute', () => {
      render(<CardContent data-testid="card-content">Content</CardContent>)
      expect(screen.getByTestId('card-content')).toHaveAttribute('data-slot', 'card-content')
    })

    it('should apply custom className', () => {
      render(<CardContent className="custom-content" data-testid="card-content">Content</CardContent>)
      expect(screen.getByTestId('card-content')).toHaveClass('custom-content')
    })
  })

  describe('CardFooter', () => {
    it('should render CardFooter', () => {
      render(<CardFooter data-testid="card-footer">Footer</CardFooter>)
      const footer = screen.getByTestId('card-footer')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveTextContent('Footer')
    })

    it('should have flex layout', () => {
      render(<CardFooter data-testid="card-footer">Footer</CardFooter>)
      const footer = screen.getByTestId('card-footer')
      expect(footer).toHaveClass('flex', 'items-center')
    })

    it('should have padding', () => {
      render(<CardFooter data-testid="card-footer">Footer</CardFooter>)
      expect(screen.getByTestId('card-footer')).toHaveClass('px-5')
    })

    it('should have data-slot attribute', () => {
      render(<CardFooter data-testid="card-footer">Footer</CardFooter>)
      expect(screen.getByTestId('card-footer')).toHaveAttribute('data-slot', 'card-footer')
    })

    it('should apply custom className', () => {
      render(<CardFooter className="custom-footer" data-testid="card-footer">Footer</CardFooter>)
      expect(screen.getByTestId('card-footer')).toHaveClass('custom-footer')
    })
  })

  describe('Full Card Composition', () => {
    it('should render complete card with all components', () => {
      render(
        <Card data-testid="full-card">
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
            <CardAction>Action Button</CardAction>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
          <CardFooter>
            <span>Footer content</span>
          </CardFooter>
        </Card>
      )

      expect(screen.getByTestId('full-card')).toBeInTheDocument()
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Action Button')).toBeInTheDocument()
      expect(screen.getByText('Card content goes here')).toBeInTheDocument()
      expect(screen.getByText('Footer content')).toBeInTheDocument()
    })

    it('should render glass card with all components', () => {
      render(
        <Card glass data-testid="glass-card">
          <CardHeader>
            <CardTitle>Glass Title</CardTitle>
          </CardHeader>
          <CardContent>Glass content</CardContent>
        </Card>
      )

      const card = screen.getByTestId('glass-card')
      expect(card).toHaveClass('backdrop-blur-xs')
      expect(screen.getByText('Glass Title')).toBeInTheDocument()
      expect(screen.getByText('Glass content')).toBeInTheDocument()
    })

    it('should render card with only content', () => {
      render(
        <Card data-testid="simple-card">
          <CardContent>Simple content only</CardContent>
        </Card>
      )

      expect(screen.getByTestId('simple-card')).toBeInTheDocument()
      expect(screen.getByText('Simple content only')).toBeInTheDocument()
    })
  })
})
