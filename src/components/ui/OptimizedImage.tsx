import { useState, useEffect, memo } from 'react'
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

  useEffect(() => {
    const img = new Image()
    
    img.onload = () => {
      setLoaded(true)
      setCurrentSrc(src)
      onLoad?.()
    }
    
    img.onerror = () => {
      setError(true)
      onError?.()
    }

    if (priority) {
      img.src = src
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              img.src = src
              observer.disconnect()
            }
          })
        },
        { rootMargin: '50px' }
      )

      const placeholder = document.createElement('div')
      document.body.appendChild(placeholder)
      observer.observe(placeholder)

      return () => {
        observer.disconnect()
        document.body.removeChild(placeholder)
      }
    }
  }, [src, priority, onLoad, onError])

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
    <div className={cn('relative overflow-hidden', className)} style={{ width, height }}>
      {!loaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          loading={priority ? 'eager' : 'lazy'}
          width={width}
          height={height}
        />
      )}
    </div>
  )
})
