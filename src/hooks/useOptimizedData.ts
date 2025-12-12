import { useEffect, useState, useCallback } from 'react'
import { cachedFetch, measureAsync } from '@/lib/performance'

export function useOptimizedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    cache?: boolean
    cacheDuration?: number
    onError?: (error: Error) => void
  } = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const result = options.cache
        ? await cachedFetch(key, fetcher, options.cacheDuration)
        : await measureAsync(`Load ${key}`, fetcher)

      setData(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      options.onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, options.cache, options.cacheDuration, options.onError])

  useEffect(() => {
    loadData()
  }, [loadData])

  return { data, loading, error, reload: loadData }
}

export function usePaginatedData<T>(
  items: T[],
  pageSize: number = 20
) {
  const [currentPage, setCurrentPage] = useState(1)
  
  const totalPages = Math.ceil(items.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentItems = items.slice(startIndex, endIndex)
  
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }, [totalPages])
  
  const nextPage = useCallback(() => {
    goToPage(currentPage + 1)
  }, [currentPage, goToPage])
  
  const prevPage = useCallback(() => {
    goToPage(currentPage - 1)
  }, [currentPage, goToPage])
  
  return {
    currentItems,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  }
}

export function useVirtualList<T>(
  items: T[],
  options: {
    itemHeight: number
    containerHeight: number
    overscan?: number
  }
) {
  const [scrollTop, setScrollTop] = useState(0)
  const { itemHeight, containerHeight, overscan = 3 } = options
  
  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / itemHeight) - overscan
  )
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )
  
  const visibleItems = items.slice(startIndex, endIndex + 1)
  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex,
  }
}

export function useInfiniteScroll<T>(
  items: T[],
  options: {
    pageSize: number
    onLoadMore?: () => void
  }
) {
  const [displayCount, setDisplayCount] = useState(options.pageSize)
  const [isLoading, setIsLoading] = useState(false)
  
  const visibleItems = items.slice(0, displayCount)
  const hasMore = displayCount < items.length
  
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return
    
    setIsLoading(true)
    options.onLoadMore?.()
    
    await new Promise(resolve => setTimeout(resolve, 100))
    
    setDisplayCount(prev => Math.min(prev + options.pageSize, items.length))
    setIsLoading(false)
  }, [isLoading, hasMore, items.length, options])
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      loadMore()
    }
  }, [loadMore])
  
  return {
    visibleItems,
    hasMore,
    isLoading,
    loadMore,
    handleScroll,
  }
}

export function useDebouncedValue<T>(value: T, delay: number = 300): T {
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

export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const [isThrottled, setIsThrottled] = useState(false)
  
  return useCallback(
    (...args: Parameters<T>) => {
      if (isThrottled) return
      
      callback(...args)
      setIsThrottled(true)
      
      setTimeout(() => {
        setIsThrottled(false)
      }, delay)
    },
    [callback, delay, isThrottled]
  ) as T
}

export function useImagePreloader(urls: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [failed, setFailed] = useState<Set<string>>(new Set())
  
  useEffect(() => {
    const loadImage = (url: string) => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(url)
        img.onerror = () => reject(url)
        img.src = url
      })
    }
    
    urls.forEach(async (url) => {
      try {
        await loadImage(url)
        setLoadedImages(prev => new Set(prev).add(url))
      } catch {
        setFailed(prev => new Set(prev).add(url))
      }
    })
  }, [urls])
  
  return {
    isLoaded: (url: string) => loadedImages.has(url),
    isFailed: (url: string) => failed.has(url),
    allLoaded: loadedImages.size === urls.length,
  }
}

export function useDataCache<T>(key: string, initialData: T) {
  const [cache, setCache] = useState<Map<string, T>>(() => {
    const stored = localStorage.getItem(`cache-${key}`)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        return new Map(Object.entries(parsed))
      } catch {
        return new Map([[key, initialData]])
      }
    }
    return new Map([[key, initialData]])
  })
  
  const get = useCallback((cacheKey: string): T | undefined => {
    return cache.get(cacheKey)
  }, [cache])
  
  const set = useCallback((cacheKey: string, value: T) => {
    setCache(prev => {
      const newCache = new Map(prev)
      newCache.set(cacheKey, value)
      
      try {
        const obj = Object.fromEntries(newCache)
        localStorage.setItem(`cache-${key}`, JSON.stringify(obj))
      } catch (error) {
        console.error('Failed to cache data:', error)
      }
      
      return newCache
    })
  }, [key])
  
  const clear = useCallback(() => {
    setCache(new Map())
    localStorage.removeItem(`cache-${key}`)
  }, [key])
  
  return { get, set, clear, cache }
}
