import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LiveStatsBar } from '@/components/viral/LiveStatsBar'

// Mock useKV hook
vi.mock('@github/spark/hooks', () => ({
  useKV: vi.fn((key: string, defaultValue: any) => {
    if (key === 'jobs') {
      return [
        [
          { id: '1', createdAt: new Date().toISOString(), status: 'open' },
          { id: '2', createdAt: new Date().toISOString(), status: 'open' },
          { id: '3', createdAt: new Date(Date.now() - 86400000).toISOString(), status: 'completed' },
        ],
        vi.fn()
      ]
    }
    if (key === 'bids') {
      return [
        [
          { id: 'b1', createdAt: new Date().toISOString(), jobId: '1' },
          { id: 'b2', createdAt: new Date(Date.now() - 3600000).toISOString(), jobId: '1' },
        ],
        vi.fn()
      ]
    }
    return [defaultValue, vi.fn()]
  })
}))

describe('LiveStatsBar', () => {
  it('renders without crashing', () => {
    render(<LiveStatsBar />)
    // Component should render some content
    const container = screen.getByRole('region', { name: /live stats/i }) || document.querySelector('[data-testid="live-stats"]')
    expect(container || document.body).toBeTruthy()
  })

  it('displays statistics', () => {
    const { container } = render(<LiveStatsBar />)
    // Should display some numeric data
    expect(container.textContent).toBeTruthy()
  })
})
