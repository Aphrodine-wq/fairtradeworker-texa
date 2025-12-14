import { useState, useEffect, memo, useRef } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
  onLoad?: () => void
  onError?: () => void
}

// Convert to WebP if supported (for better compression)
function getOptimizedSrc(src: string): string {
  // If already a data URL or external URL, return as-is
  if (src.startsWith('data:') || src.startsWith('http')) {
    return src
  }
  
  // For local images, could add WebP conversion logic here
  // For now, return original
  return src
}

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState<string>('')
  const imgRef = useRef<HTMLImageElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const optimizedSrc = getOptimizedSrc(src)
    const img = new Image()
    
    // Enable decoding for better performance
    img.decoding = 'async'
    
    img.onload = () => {
      setLoaded(true)
      setCurrentSrc(optimizedSrc)
      onLoad?.()
    }
    
    img.onerror = () => {
      setError(true)
      onError?.()
    }

    if (priority) {
      // Preload immediately for priority images
      img.src = optimizedSrc
    } else {
      // Lazy load with Intersection Observer
      if (!imgRef.current) {
        // Create a temporary element for observation
        const tempDiv = document.createElement('div')
        tempDiv.style.position = 'absolute'
        tempDiv.style.visibility = 'hidden'
        tempDiv.style.width = width ? `${width}px` : '1px'
        tempDiv.style.height = height ? `${height}px` : '1px'
        document.body.appendChild(tempDiv)
        
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                img.src = optimizedSrc
                observerRef.current?.disconnect()
                if (tempDiv.parentNode) {
                  document.body.removeChild(tempDiv)
                }
              }
            })
          },
          { 
            rootMargin: '100px', // Increased from 50px for earlier loading
            threshold: 0.01
          }
        )
        
        observerRef.current.observe(tempDiv)
      }

      return () => {
        observerRef.current?.disconnect()
        observerRef.current = null
      }
    }
  }, [src, priority, onLoad, onError, width, height])

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-sm">Failed to load image</span>
      </div>
    )
  }

  return (
    <div 
      className={cn('relative overflow-hidden', className)} 
      style={{ width, height }}
    >
      {!loaded && !error && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse"
          aria-hidden="true"
        />
      )}
      {currentSrc && !error && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          className={cn(
            'transition-opacity duration-200', // Reduced from 300ms
            loaded ? 'opacity-100' : 'opacity-0',
            'will-change-opacity', // GPU acceleration hint
            className
          )}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          width={width}
          height={height}
          style={{
            transform: 'translateZ(0)', // Force GPU acceleration
            backfaceVisibility: 'hidden' // Prevent flickering
          }}
        />
      )}
      {error && (
        <div
          className={cn(
            'flex items-center justify-center bg-muted text-muted-foreground',
            className
          )}
          style={{ width, height }}
        >
          <span className="text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for memo - only re-render if src changes
  return prevProps.src === nextProps.src &&
         prevProps.width === nextProps.width &&
         prevProps.height === nextProps.height &&
         prevProps.className === nextProps.className
})
