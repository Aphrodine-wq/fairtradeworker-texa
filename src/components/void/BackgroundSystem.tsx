import { useEffect, useRef, useState } from 'react'
import { useVoidStore } from '@/lib/void/store'
import { sanitizeFileName } from '@/lib/void/validation'

interface BackgroundSystemProps {
  className?: string
}

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const IDLE_TIMEOUT = 5 * 60 * 1000 // 5 minutes
const IMAGE_PROCESSING_TIMEOUT = 10000 // 10 seconds
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
const MAX_IMAGE_DIMENSIONS = { width: 4096, height: 4096 }
const MIN_IMAGE_DIMENSIONS = { width: 100, height: 100 }

export function BackgroundSystem({ className = '' }: BackgroundSystemProps) {
  const { desktopBackground, setDesktopBackground } = useVoidStore()
  const [overlayOpacity, setOverlayOpacity] = useState(0.3)
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Validate image file
  const validateImageFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only images are allowed.' }
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB` }
    }
    
    // Check file name
    const sanitizedName = sanitizeFileName(file.name)
    if (sanitizedName !== file.name) {
      return { valid: false, error: 'Invalid file name' }
    }
    
    return { valid: true }
  }

  // Validate image dimensions
  const validateImageDimensions = (img: HTMLImageElement): { valid: boolean; error?: string } => {
    if (img.width < MIN_IMAGE_DIMENSIONS.width || img.height < MIN_IMAGE_DIMENSIONS.height) {
      return { valid: false, error: 'Image too small' }
    }
    
    if (img.width > MAX_IMAGE_DIMENSIONS.width || img.height > MAX_IMAGE_DIMENSIONS.height) {
      return { valid: false, error: 'Image too large' }
    }
    
    return { valid: true }
  }

  // Auto-adjust overlay opacity based on image contrast
  const analyzeContrast = async (imageUrl: string): Promise<number> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Image processing timeout'))
      }, IMAGE_PROCESSING_TIMEOUT)
      
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        clearTimeout(timeout)
        
        // Validate dimensions
        const dimValidation = validateImageDimensions(img)
        if (!dimValidation.valid) {
          reject(new Error(dimValidation.error))
          return
        }
        
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve(0.3)
            return
          }

          ctx.drawImage(img, 0, 0)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data

          let totalBrightness = 0
          // Sample every 100th pixel for performance
          for (let i = 0; i < data.length; i += 400) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            totalBrightness += (r + g + b) / 3
          }

          const sampleCount = data.length / 400
          const avgBrightness = totalBrightness / sampleCount
          // Darker images need less overlay, brighter images need more
          const opacity = avgBrightness > 128 ? 0.4 : 0.2
          resolve(opacity)
        } catch (error) {
          console.error('[BackgroundSystem] Error analyzing contrast:', error)
          resolve(0.3)
        }
      }
      
      img.onerror = () => {
        clearTimeout(timeout)
        reject(new Error('Failed to load image'))
      }
      
      img.src = imageUrl
    })
  }

  // Handle drag and drop
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const files = e.dataTransfer?.files
      if (!files || files.length === 0) return

      const file = files[0]
      
      // Validate file
      const validation = validateImageFile(file)
      if (!validation.valid) {
        console.warn('[BackgroundSystem] File validation failed:', validation.error)
        alert(validation.error || 'Invalid file')
        return
      }

      // Convert to data URL with timeout
      const reader = new FileReader()
      const readPromise = new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('File read timeout'))
        }, IMAGE_PROCESSING_TIMEOUT)
        
        reader.onload = (event) => {
          clearTimeout(timeout)
          const result = event.target?.result
          if (typeof result === 'string') {
            resolve(result)
          } else {
            reject(new Error('Failed to read file'))
          }
        }
        
        reader.onerror = () => {
          clearTimeout(timeout)
          reject(new Error('File read error'))
        }
      })
      
      try {
        reader.readAsDataURL(file)
        const dataUrl = await readPromise
        
        // Analyze contrast with timeout
        const opacity = await analyzeContrast(dataUrl).catch(() => 0.3)
        setOverlayOpacity(opacity)
        setDesktopBackground(dataUrl)
        
        // Store in IndexedDB
        await storeBackgroundInIndexedDB(dataUrl).catch((error) => {
          console.error('[BackgroundSystem] Failed to store background:', error)
        })
      } catch (error) {
        console.error('[BackgroundSystem] Error processing file:', error)
        alert('Failed to process image. Please try again.')
      }
    }

    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('drop', handleDrop)

    return () => {
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('drop', handleDrop)
    }
  }, [setDesktopBackground])

  // Right-click context menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('.void-desktop')) {
        e.preventDefault()
        // Show context menu with "Set as Background" option
        // Simplified: just set a default background for now
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  // Idle timeout - unload background after 5 minutes
  useEffect(() => {
    if (!desktopBackground) return

    const resetTimer = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
      }
      idleTimerRef.current = setTimeout(() => {
        setDesktopBackground(null)
      }, IDLE_TIMEOUT)
    }

    resetTimer()
    window.addEventListener('mousemove', resetTimer)
    window.addEventListener('keydown', resetTimer)

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
      }
      window.removeEventListener('mousemove', resetTimer)
      window.removeEventListener('keydown', resetTimer)
    }
  }, [desktopBackground, setDesktopBackground])

  // Load background from IndexedDB on mount
  useEffect(() => {
    loadBackgroundFromIndexedDB().then((bg) => {
      if (bg) {
        setDesktopBackground(bg)
      }
    })
  }, [setDesktopBackground])

  if (!desktopBackground) {
    return null
  }

  return (
    <div
      className={`fixed inset-0 -z-10 ${className}`}
      style={{
        backgroundImage: `url(${desktopBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
          transition: 'background-color 0.3s ease',
        }}
      />
    </div>
  )
}

// IndexedDB helpers
async function storeBackgroundInIndexedDB(dataUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('void-desktop', 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['backgrounds'], 'readwrite')
      const store = transaction.objectStore('backgrounds')
      store.put({ id: 'current', data: dataUrl, timestamp: Date.now() })
      resolve()
    }
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('backgrounds')) {
        db.createObjectStore('backgrounds', { keyPath: 'id' })
      }
    }
  })
}

async function loadBackgroundFromIndexedDB(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('void-desktop', 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('backgrounds')) {
        resolve(null)
        return
      }
      const transaction = db.transaction(['backgrounds'], 'readonly')
      const store = transaction.objectStore('backgrounds')
      const getRequest = store.get('current')
      getRequest.onsuccess = () => {
        const result = getRequest.result
        resolve(result?.data || null)
      }
      getRequest.onerror = () => resolve(null)
    }
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('backgrounds')) {
        db.createObjectStore('backgrounds', { keyPath: 'id' })
      }
    }
  })
}
