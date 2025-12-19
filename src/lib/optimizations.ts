/**
 * Performance Optimizations for FairTradeWorker
 * Includes memoization, debouncing, throttling, and lazy loading utilities
 */

import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react'

// ============================================================================
// Debounce
// ============================================================================

/**
 * Debounce a function call
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * React hook for debounced values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// ============================================================================
// Throttle
// ============================================================================

/**
 * Throttle a function call
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * React hook for throttled callbacks
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now())

  return useCallback(
    ((...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args)
        lastRun.current = Date.now()
      }
    }) as T,
    [callback, delay]
  )
}

// ============================================================================
// Memoization
// ============================================================================

/**
 * Memoize expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

/**
 * React hook for memoized expensive computations
 */
export function useMemoized<T>(
  compute: () => T,
  deps: React.DependencyList
): T {
  return useMemo(compute, deps)
}

// ============================================================================
// Lazy Loading
// ============================================================================

/**
 * Lazy load images
 */
export function useLazyImage(src: string): {
  src: string | null
  loading: boolean
  error: boolean
} {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!src) {
      setLoading(false)
      return
    }

    const img = new Image()
    
    img.onload = () => {
      setLoadedSrc(src)
      setLoading(false)
      setError(false)
    }

    img.onerror = () => {
      setError(true)
      setLoading(false)
    }

    img.src = src
  }, [src])

  return { src: loadedSrc, loading, error }
}

/**
 * Intersection Observer for lazy loading components
 */
export function useIntersectionObserver(
  options?: IntersectionObserverInit
): [React.RefObject<HTMLElement>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [options])

  return [ref, isIntersecting]
}

// ============================================================================
// Request Batching
// ============================================================================

interface BatchedRequest<T> {
  resolve: (value: T) => void
  reject: (error: Error) => void
  request: () => Promise<T>
}

class RequestBatcher<T> {
  private batch: BatchedRequest<T>[] = []
  private timeout: NodeJS.Timeout | null = null
  private readonly batchSize: number
  private readonly batchDelay: number

  constructor(batchSize: number = 10, batchDelay: number = 100) {
    this.batchSize = batchSize
    this.batchDelay = batchDelay
  }

  add(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.batch.push({ resolve, reject, request })

      if (this.batch.length >= this.batchSize) {
        this.flush()
      } else if (!this.timeout) {
        this.timeout = setTimeout(() => this.flush(), this.batchDelay)
      }
    })
  }

  private async flush() {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }

    const batch = this.batch.splice(0, this.batchSize)

    if (batch.length === 0) return

    // Execute all requests in parallel
    const promises = batch.map(item => item.request())
    
    try {
      const results = await Promise.all(promises)
      batch.forEach((item, index) => {
        item.resolve(results[index])
      })
    } catch (error) {
      batch.forEach(item => {
        item.reject(error as Error)
      })
    }
  }
}

/**
 * Create a request batcher
 */
export function createRequestBatcher<T>(
  batchSize: number = 10,
  batchDelay: number = 100
): (request: () => Promise<T>) => Promise<T> {
  const batcher = new RequestBatcher<T>(batchSize, batchDelay)
  return (request: () => Promise<T>) => batcher.add(request)
}

// ============================================================================
// Virtual Scrolling Helpers
// ============================================================================

export interface VirtualScrollItem {
  index: number
  height: number
}

export function calculateVirtualScroll(
  items: VirtualScrollItem[],
  containerHeight: number,
  scrollTop: number
): {
  startIndex: number
  endIndex: number
  offsetY: number
} {
  let startIndex = 0
  let endIndex = items.length
  let offsetY = 0
  let currentHeight = 0

  // Find start index
  for (let i = 0; i < items.length; i++) {
    if (currentHeight + items[i].height > scrollTop) {
      startIndex = Math.max(0, i - 1)
      offsetY = currentHeight
      break
    }
    currentHeight += items[i].height
  }

  // Find end index
  currentHeight = offsetY
  for (let i = startIndex; i < items.length; i++) {
    currentHeight += items[i].height
    if (currentHeight > scrollTop + containerHeight) {
      endIndex = i + 1
      break
    }
  }

  return { startIndex, endIndex, offsetY }
}

// ============================================================================
// Code Splitting Helpers
// ============================================================================

/**
 * Lazy load a component
 */
import React from 'react'

export function lazyLoad<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(importFn)
}

// ============================================================================
// Performance Monitoring
// ============================================================================

export interface PerformanceMetric {
  name: string
  duration: number
  timestamp: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private maxMetrics = 100

  record(name: string, duration: number): void {
    this.metrics.push({
      name,
      duration,
      timestamp: Date.now()
    })

    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  getAverageDuration(name: string): number {
    const relevant = this.metrics.filter(m => m.name === name)
    if (relevant.length === 0) return 0

    const sum = relevant.reduce((acc, m) => acc + m.duration, 0)
    return sum / relevant.length
  }

  clear(): void {
    this.metrics = []
  }
}

export const performanceMonitor = new PerformanceMonitor()

/**
 * Measure function execution time
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now()
  const result = fn()
  const duration = performance.now() - start
  performanceMonitor.record(name, duration)
  return result
}

/**
 * React hook for measuring component render time
 */
export function usePerformanceMeasure(name: string): void {
  useEffect(() => {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      performanceMonitor.record(`${name}:render`, duration)
    }
  }, [name])
}

// ============================================================================
// Image Optimization
// ============================================================================

export function getOptimizedImageUrl(
  url: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  // If using a CDN like Cloudflare Images or Imgix
  // return `${url}?w=${width}&h=${height}&q=${quality}`
  
  // For now, return original URL
  return url
}

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

// ============================================================================
// Bundle Size Optimization
// ============================================================================

/**
 * Dynamic import helper for code splitting
 */
export async function dynamicImport<T>(
  importFn: () => Promise<T>
): Promise<T> {
  try {
    return await importFn()
  } catch (error) {
    console.error('Failed to dynamically import module:', error)
    throw error
  }
}

