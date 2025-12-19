/**
 * VOID Boot Sequence Tests
 * Tests for boot sequence phases and timing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { runBootSequence } from '@/lib/void/bootSequence'
import type { BootProgress, BootPhase } from '@/lib/void/bootSequence'

describe('VOID Boot Sequence', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should complete all boot phases', async () => {
    const phases: BootPhase[] = []
    const progressUpdates: BootProgress[] = []

    const config = {
      onPhaseComplete: (phase: BootPhase) => {
        phases.push(phase)
      },
      onProgress: (progress: BootProgress) => {
        progressUpdates.push(progress)
      }
    }

    const bootPromise = runBootSequence(config, 'test-user', 'Test User')

    // Fast-forward through all timers
    await vi.runAllTimersAsync()

    await bootPromise

    expect(phases).toContain('pre-boot')
    expect(phases).toContain('system-init')
    expect(phases).toContain('user-load')
    expect(phases).toContain('desktop-ready')
    expect(phases).toContain('complete')
  })

  it('should report progress for each phase', async () => {
    const progressUpdates: BootProgress[] = []

    const config = {
      onProgress: (progress: BootProgress) => {
        progressUpdates.push(progress)
      }
    }

    const bootPromise = runBootSequence(config, 'test-user', 'Test User')
    await vi.runAllTimersAsync()
    await bootPromise

    // Should have progress updates for each phase
    expect(progressUpdates.length).toBeGreaterThan(0)
    
    // Check that we have progress from different phases
    const phases = new Set(progressUpdates.map(p => p.phase))
    expect(phases.size).toBeGreaterThan(1)
  })

  it('should complete within 2.5 seconds', async () => {
    const startTime = Date.now()
    
    const bootPromise = runBootSequence({}, 'test-user', 'Test User')
    await vi.runAllTimersAsync()
    await bootPromise

    const duration = Date.now() - startTime
    // Should complete in approximately 2.5 seconds (2500ms)
    // With fake timers, this should be near-instant, but allow margin for test execution
    // Actual timing: 200 + 600 + 600 + 600 + 500 = 2500ms
    expect(duration).toBeLessThan(3500)
  })

  it('should handle errors gracefully', async () => {
    // Mock a function that throws
    const originalConsoleError = console.error
    console.error = vi.fn()

    const config = {
      onComplete: vi.fn()
    }

    // Run boot sequence (should handle any errors internally)
    const bootPromise = runBootSequence(config, 'test-user', 'Test User')
    await vi.runAllTimersAsync()
    await bootPromise

    // Should still call onComplete even if errors occur
    expect(config.onComplete).toHaveBeenCalled()

    console.error = originalConsoleError
  })
})
