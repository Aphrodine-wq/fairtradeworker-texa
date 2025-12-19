/**
 * Performance optimization hooks
 * For GPU acceleration, lazy loading, and smooth interactions
 */

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'

/**
 * Hook to prefetch routes on hover/focus for faster navigation
 */
export function usePrefetch(routes: string[]) {
  const prefetched = useRef(new Set<string>())
  
  useEffect(() => {
    routes.forEach(route => {
      if (!prefetched.current.has(route)) {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = route
        document.head.appendChild(link)
        prefetched.current.add(route)
      }
    })
  }, [routes])
}

/**
 * Hook for intersection-based lazy rendering
 */
export function useLazyRender(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin: '100px' }
    )
    
    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold])
  
  return { ref, isVisible }
}

/**
 * Hook for GPU-accelerated scroll performance
 */
export function useGPUScroll() {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const element = scrollRef.current
    if (!element) return
    
    // Enable GPU compositing
    element.style.transform = 'translateZ(0)'
    element.style.willChange = 'scroll-position'
    element.style.overscrollBehavior = 'contain'
    
    return () => {
      element.style.willChange = 'auto'
    }
  }, [])
  
  return scrollRef
}

/**
 * Hook for debounced values with RAF timing
 */
export function useRAFDebounce<T>(value: T, delay: number = 100): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const rafRef = useRef<number>()
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()
  
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      rafRef.current = requestAnimationFrame(() => {
        setDebouncedValue(value)
      })
    }, delay)
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value, delay])
  
  return debouncedValue
}

/**
 * Hook for smooth hover state without layout thrashing
 */
export function useHoverState() {
  const [isHovered, setIsHovered] = useState(false)
  const rafRef = useRef<number>()
  
  const handleMouseEnter = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => setIsHovered(true))
  }, [])
  
  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => setIsHovered(false))
  }, [])
  
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])
  
  return {
    isHovered,
    hoverProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    }
  }
}

/**
 * Hook for measuring element size without layout thrashing
 */
export function useResizeObserver<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    const observer = new ResizeObserver(entries => {
      // Use RAF to batch size updates
      requestAnimationFrame(() => {
        const entry = entries[0]
        if (entry) {
          setSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height
          })
        }
      })
    })
    
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  
  return { ref, size }
}

/**
 * Hook for optimized list rendering with virtualization hints
 */
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0)
  
  const { startIndex, endIndex, virtualItems } = useMemo(() => {
    const overscan = 3
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2)
    
    const virtualItems = items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      style: {
        position: 'absolute' as const,
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        width: '100%',
        transform: 'translateZ(0)',
      }
    }))
    
    return { startIndex, endIndex, virtualItems }
  }, [items, itemHeight, containerHeight, scrollTop])
  
  const totalHeight = items.length * itemHeight
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    requestAnimationFrame(() => {
      setScrollTop(e.currentTarget.scrollTop)
    })
  }, [])
  
  return {
    virtualItems,
    totalHeight,
    handleScroll,
    containerStyle: {
      position: 'relative' as const,
      height: containerHeight,
      overflow: 'auto',
      willChange: 'scroll-position',
    },
    innerStyle: {
      height: totalHeight,
      position: 'relative' as const,
    }
  }
}

/**
 * Hook for idle callback execution
 */
export function useIdleCallback(callback: () => void, deps: any[] = []) {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(callback, { timeout: 2000 })
      return () => window.cancelIdleCallback(id)
    } else {
      const id = setTimeout(callback, 1)
      return () => clearTimeout(id)
    }
  }, deps)
}

/**
 * Hook for animation frame loop
 */
export function useAnimationFrame(callback: (deltaTime: number) => void, isRunning = true) {
  const rafRef = useRef<number>()
  const previousTimeRef = useRef<number>()
  
  useEffect(() => {
    if (!isRunning) return
    
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current
        callback(deltaTime)
      }
      previousTimeRef.current = time
      rafRef.current = requestAnimationFrame(animate)
    }
    
    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [callback, isRunning])
}

/**
 * Hook for optimized image loading
 */
export function useOptimizedImage(src: string) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  
  useEffect(() => {
    if (!src) return
    
    const img = new Image()
    img.src = src
    
    img.onload = () => setLoaded(true)
    img.onerror = () => setError(true)
    
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])
  
  return { loaded, error }
}
