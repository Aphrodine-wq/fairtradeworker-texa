import { useState, useEffect } from 'react'
import { useVoidStore } from '@/lib/void/store'
import type { BackgroundConfig, BackgroundType } from '@/lib/void/types'

export function useVoidBackground() {
  const { background, setBackground, backgroundHistory } = useVoidStore()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadBackground = async (
    file: File,
    type: BackgroundType = 'image'
  ): Promise<void> => {
    setUploading(true)
    setError(null)

    try {
      // Validate file
      if (type === 'image') {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!validTypes.includes(file.type)) {
          throw new Error('Invalid image type. Use JPG, PNG, or WebP.')
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Image must be less than 5MB.')
        }
      } else if (type === 'video') {
        const validTypes = ['video/mp4']
        if (!validTypes.includes(file.type)) {
          throw new Error('Invalid video type. Use MP4.')
        }
        if (file.size > 10 * 1024 * 1024) {
          throw new Error('Video must be less than 10MB.')
        }
      }

      // Convert to base64 for now (will use Supabase in production)
      const reader = new FileReader()
      reader.onload = (e) => {
        const url = e.target?.result as string
        
        const newBackground: BackgroundConfig = {
          type,
          url,
          brightness: background.brightness,
          contrast: background.contrast,
          overlayOpacity: background.overlayOpacity,
        }
        
        setBackground(newBackground)
        setUploading(false)
      }
      
      reader.onerror = () => {
        setError('Failed to read file')
        setUploading(false)
      }
      
      if (type === 'image') {
        reader.readAsDataURL(file)
      } else {
        // For video, create object URL
        const url = URL.createObjectURL(file)
        const newBackground: BackgroundConfig = {
          type,
          url,
          brightness: background.brightness,
          contrast: background.contrast,
          overlayOpacity: background.overlayOpacity,
        }
        setBackground(newBackground)
        setUploading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploading(false)
    }
  }

  const setDefaultBackground = () => {
    setBackground({
      type: 'default',
      brightness: 1,
      contrast: 1,
      overlayOpacity: 0.3,
    })
  }

  const updateBrightness = (brightness: number) => {
    setBackground({
      ...background,
      brightness: Math.max(0, Math.min(1, brightness)),
    })
  }

  const updateContrast = (contrast: number) => {
    setBackground({
      ...background,
      contrast: Math.max(0, Math.min(2, contrast)),
    })
  }

  const updateOverlayOpacity = (opacity: number) => {
    setBackground({
      ...background,
      overlayOpacity: Math.max(0, Math.min(1, opacity)),
    })
  }

  // Auto-adjust brightness/contrast for text legibility
  useEffect(() => {
    if (background.type === 'image' && background.url) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Calculate average brightness
        let sum = 0
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const brightness = (r + g + b) / 3 / 255
          sum += brightness
        }
        const avgBrightness = sum / (data.length / 4)

        // Auto-adjust if too bright or too dark
        if (avgBrightness > 0.7) {
          updateBrightness(0.8)
          updateOverlayOpacity(0.5)
        } else if (avgBrightness < 0.3) {
          updateBrightness(1.2)
          updateOverlayOpacity(0.2)
        }
      }
      img.src = background.url
    }
  }, [background.url, background.type])

  return {
    background,
    backgroundHistory,
    uploading,
    error,
    uploadBackground,
    setDefaultBackground,
    updateBrightness,
    updateContrast,
    updateOverlayOpacity,
  }
}
