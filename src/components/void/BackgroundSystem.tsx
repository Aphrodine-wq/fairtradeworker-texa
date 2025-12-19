import { useEffect, useRef, useState } from 'react'
import { useVoidStore } from '@/lib/void/store'

interface BackgroundSystemProps {
  className?: string
}

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const IDLE_TIMEOUT = 5 * 60 * 1000 // 5 minutes

export function BackgroundSystem({ className = '' }: BackgroundSystemProps) {
  const { desktopBackground, setDesktopBackground } = useVoidStore()
  const [overlayOpacity, setOverlayOpacity] = useState(0.3)
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-adjust overlay opacity based on image contrast
  const analyzeContrast = async (imageUrl: string): Promise<number> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
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
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          totalBrightness += (r + g + b) / 3
        }

        const avgBrightness = totalBrightness / (data.length / 4)
        // Darker images need less overlay, brighter images need more
        const opacity = avgBrightness > 128 ? 0.4 : 0.2
        resolve(opacity)
      }
      img.onerror = () => resolve(0.3)
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
      if (!file.type.startsWith('image/')) return
      if (file.size > MAX_FILE_SIZE) {
        alert('File size must be less than 2MB')
        return
      }

      // Convert to WebP/AVIF if possible, otherwise use original
      const reader = new FileReader()
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string
        const opacity = await analyzeContrast(dataUrl)
        setOverlayOpacity(opacity)
        setDesktopBackground(dataUrl)
        
        // Store in IndexedDB
        await storeBackgroundInIndexedDB(dataUrl)
      }
      reader.readAsDataURL(file)
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
