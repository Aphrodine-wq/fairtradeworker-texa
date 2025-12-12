export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export const memoizeOne = <T extends (...args: any[]) => any>(
  func: T
): T => {
  let lastArgs: any[] | null = null
  let lastResult: ReturnType<T> | null = null
  
  return ((...args: Parameters<T>) => {
    if (
      lastArgs &&
      args.length === lastArgs.length &&
      args.every((arg, i) => arg === lastArgs![i])
    ) {
      return lastResult
    }
    
    lastArgs = args
    lastResult = func(...args)
    return lastResult
  }) as T
}

export const lazyLoadImage = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(src)
    img.onerror = reject
    img.src = src
  })
}

export const batchUpdates = <T>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => void
): Promise<void> => {
  return new Promise((resolve) => {
    let currentIndex = 0
    
    const processBatch = () => {
      const batch = items.slice(currentIndex, currentIndex + batchSize)
      if (batch.length === 0) {
        resolve()
        return
      }
      
      processor(batch)
      currentIndex += batchSize
      
      requestAnimationFrame(processBatch)
    }
    
    processBatch()
  })
}

export const cachedFetch = (() => {
  const cache = new Map<string, { data: any; timestamp: number }>()
  const CACHE_DURATION = 5 * 60 * 1000

  return async <T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = CACHE_DURATION
  ): Promise<T> => {
    const cached = cache.get(key)
    const now = Date.now()

    if (cached && now - cached.timestamp < ttl) {
      return cached.data as T
    }

    const data = await fetcher()
    cache.set(key, { data, timestamp: now })
    return data
  }
})()

export const virtualizeList = <T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  scrollTop: number
): { visibleItems: T[]; startIndex: number; endIndex: number } => {
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight)
  )
  
  return {
    visibleItems: items.slice(startIndex, endIndex + 1),
    startIndex,
    endIndex,
  }
}

export const preloadData = async <T>(
  keys: string[],
  fetcher: (key: string) => Promise<T>
): Promise<Map<string, T>> => {
  const results = new Map<string, T>()
  
  await Promise.all(
    keys.map(async (key) => {
      try {
        const data = await fetcher(key)
        results.set(key, data)
      } catch (error) {
        console.error(`Failed to preload ${key}:`, error)
      }
    })
  )
  
  return results
}

export const compressData = <T extends object>(data: T): string => {
  return JSON.stringify(data)
}

export const decompressData = <T>(compressed: string): T | null => {
  try {
    return JSON.parse(compressed) as T
  } catch {
    return null
  }
}

export const measurePerformance = (label: string, fn: () => void): void => {
  const start = performance.now()
  fn()
  const end = performance.now()
  console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`)
}

export const measureAsync = async <T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()
  console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`)
  return result
}

export const idleCallback = (callback: () => void): void => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback)
  } else {
    setTimeout(callback, 1)
  }
}

export const prefetchRoute = (route: string): void => {
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = route
  document.head.appendChild(link)
}

export const optimizeImages = (
  images: string[],
  maxWidth: number = 800
): string[] => {
  return images.map((url) => {
    if (url.includes('unsplash.com')) {
      return `${url}&w=${maxWidth}&q=80&auto=format`
    }
    return url
  })
}

export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()
  
  record(metric: string, value: number): void {
    if (!this.metrics.has(metric)) {
      this.metrics.set(metric, [])
    }
    this.metrics.get(metric)!.push(value)
  }
  
  getAverage(metric: string): number {
    const values = this.metrics.get(metric)
    if (!values || values.length === 0) return 0
    return values.reduce((a, b) => a + b, 0) / values.length
  }
  
  getP95(metric: string): number {
    const values = this.metrics.get(metric)
    if (!values || values.length === 0) return 0
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.floor(sorted.length * 0.95)
    return sorted[index]
  }
  
  report(): void {
    console.log('=== Performance Report ===')
    this.metrics.forEach((values, metric) => {
      console.log(`${metric}:`, {
        avg: this.getAverage(metric).toFixed(2),
        p95: this.getP95(metric).toFixed(2),
        samples: values.length,
      })
    })
  }
}

export const performanceMonitor = new PerformanceMonitor()
