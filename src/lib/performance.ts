/**
 * Performance optimization utilities
 * Implements monitoring, caching, and optimization strategies
 */

// Performance monitoring
interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.setupObservers()
    }
  }

  private setupObservers() {
    // Monitor long tasks
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            this.recordMetric('long-task', entry.duration)
          }
        }
      })
      longTaskObserver.observe({ entryTypes: ['longtask'] })
      this.observers.push(longTaskObserver)
    } catch (e) {
      // Long task observer not supported
    }

    // Monitor paint metrics
    try {
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric(entry.name, entry.startTime)
        }
      })
      paintObserver.observe({ entryTypes: ['paint'] })
      this.observers.push(paintObserver)
    } catch (e) {
      // Paint observer not supported
    }
  }

  recordMetric(name: string, value: number) {
    this.metrics.push({ name, value, timestamp: Date.now() })
    
    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics.shift()
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  getAverageMetric(name: string): number {
    const filtered = this.metrics.filter(m => m.name === name)
    if (filtered.length === 0) return 0
    const sum = filtered.reduce((acc, m) => acc + m.value, 0)
    return sum / filtered.length
  }

  cleanup() {
    this.observers.forEach(obs => obs.disconnect())
    this.observers = []
  }
}

export const performanceMonitor = new PerformanceMonitor()

// LRU Cache implementation
class LRUCache<K, V> {
  private cache: Map<K, V>
  private maxSize: number

  constructor(maxSize: number = 100) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined
    
    // Move to end (most recently used)
    const value = this.cache.get(key)!
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

export const dataCache = new LRUCache<string, any>(200)

// Debounce function
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
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Batch DOM updates
export function batchDOMUpdates(updates: (() => void)[]): void {
  requestAnimationFrame(() => {
    updates.forEach(update => update())
  })
}

// Preload images
export async function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(
    srcs.map(src => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = reject
        img.src = src
      })
    })
  )
}

// Lazy load image with Intersection Observer
export function lazyLoadImage(img: HTMLImageElement) {
  const src = img.dataset.src
  if (!src) return

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLImageElement
        element.src = element.dataset.src || ''
        element.removeAttribute('data-src')
        observer.unobserve(element)
      }
    })
  }, {
    rootMargin: '50px'
  })

  observer.observe(img)
}

// Prefetch route
export function prefetchRoute(route: string) {
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = route
  document.head.appendChild(link)
}

// Measure function execution time
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  performanceMonitor.recordMetric(name, end - start)
  return result
}

// Virtual scrolling helper
export interface VirtualScrollItem {
  id: string
  height?: number
}

export function calculateVirtualScroll(
  items: VirtualScrollItem[],
  containerHeight: number,
  itemHeight: number,
  scrollTop: number
): { startIndex: number; endIndex: number; offsetY: number } {
  const startIndex = Math.floor(scrollTop / itemHeight)
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const endIndex = Math.min(startIndex + visibleCount + 1, items.length)
  const offsetY = startIndex * itemHeight

  return { startIndex, endIndex, offsetY }
}

// Memory cleanup utility
export function cleanupMemory() {
  if ('gc' in window && typeof (window as any).gc === 'function') {
    (window as any).gc()
  }
  
  // Clear caches
  dataCache.clear()
  
  // Force garbage collection hint
  if (performance.memory) {
    const used = (performance as any).memory.usedJSHeapSize
    const limit = (performance as any).memory.jsHeapSizeLimit
    
    if (used / limit > 0.9) {
      console.warn('High memory usage detected:', used / 1024 / 1024, 'MB')
    }
  }
}

// Request idle callback wrapper
export function requestIdleCallback(callback: () => void, timeout?: number) {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout })
  } else {
    // Fallback to setTimeout
    return setTimeout(callback, timeout || 1)
  }
}

// Cancel idle callback wrapper
export function cancelIdleCallback(id: number) {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id)
  } else {
    clearTimeout(id)
  }
}
