import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { compressImage, getCompressionStats } from '@/lib/imageCompression'

export interface UploadedPhoto {
  id: string
  file: File
  originalFile?: File
  preview: string
  progress: number
  status: 'pending' | 'compressing' | 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
  url?: string
  metadata?: {
    width: number
    height: number
    size: number
    type: string
    originalSize?: number
    compressionRatio?: number
  }
}

interface UploadOptions {
  maxSize?: number
  maxFiles?: number
  acceptedTypes?: string[]
  autoUpload?: boolean
  enableCompression?: boolean
  compressionQuality?: number
  maxWidth?: number
  maxHeight?: number
  onComplete?: (photo: UploadedPhoto) => void
  onError?: (photo: UploadedPhoto, error: string) => void
}

const DEFAULT_OPTIONS: Required<UploadOptions> = {
  maxSize: 10 * 1024 * 1024,
  maxFiles: 20,
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
  autoUpload: true,
  enableCompression: true,
  compressionQuality: 0.85,
  maxWidth: 1920,
  maxHeight: 1920,
  onComplete: () => {},
  onError: () => {},
}

export function usePhotoUpload(options: UploadOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > opts.maxSize) {
      return `File size exceeds ${Math.round(opts.maxSize / 1024 / 1024)}MB limit`
    }
    if (!opts.acceptedTypes.includes(file.type)) {
      return 'Invalid file type. Please upload JPG, PNG, or WebP images'
    }
    return null
  }, [opts.maxSize, opts.acceptedTypes])

  const extractMetadata = useCallback(async (file: File, originalFile?: File): Promise<UploadedPhoto['metadata']> => {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve({
          width: img.width,
          height: img.height,
          size: file.size,
          type: file.type,
          originalSize: originalFile?.size,
          compressionRatio: originalFile ? file.size / originalFile.size : undefined,
        })
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve({
          width: 0,
          height: 0,
          size: file.size,
          type: file.type,
          originalSize: originalFile?.size,
        })
      }
      
      img.src = url
    })
  }, [])

  const compressPhoto = useCallback(async (file: File, photoId: string): Promise<File> => {
    if (!opts.enableCompression) {
      return file
    }

    try {
      setPhotos(prev => prev.map(p => 
        p.id === photoId ? { ...p, status: 'compressing' as const } : p
      ))

      const compressed = await compressImage(file, {
        quality: opts.compressionQuality,
        maxWidth: opts.maxWidth,
        maxHeight: opts.maxHeight,
        maxSizeMB: opts.maxSize / 1024 / 1024,
      })

      if (compressed.size < file.size) {
        const stats = getCompressionStats(file, compressed)
        console.log(`Compressed ${file.name}: ${stats.originalSize}MB → ${stats.compressedSize}MB (${stats.savings}% savings)`)
        return compressed
      }

      return file
    } catch (error) {
      console.error('Compression failed, using original:', error)
      return file
    }
  }, [opts.enableCompression, opts.compressionQuality, opts.maxWidth, opts.maxHeight, opts.maxSize])

  const simulateUpload = useCallback((photoId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const duration = 1000 + Math.random() * 2000
      const steps = 20
      const stepDuration = duration / steps
      let currentStep = 0

      const interval = setInterval(() => {
        currentStep++
        const progress = Math.min((currentStep / steps) * 100, 95)
        
        setPhotos(prev => prev.map(p => 
          p.id === photoId ? { ...p, progress } : p
        ))

        if (currentStep >= steps) {
          clearInterval(interval)
          
          setPhotos(prev => prev.map(p => 
            p.id === photoId 
              ? { ...p, progress: 100, status: 'complete', url: p.preview } 
              : p
          ))
          
          resolve(photoId)
        }
      }, stepDuration)

      setTimeout(() => {
        if (Math.random() < 0.05) {
          clearInterval(interval)
          reject(new Error('Upload failed'))
        }
      }, duration / 2)
    })
  }, [])

  const uploadPhoto = useCallback(async (photo: UploadedPhoto) => {
    try {
      const compressedFile = await compressPhoto(photo.file, photo.id)
      
      const finalMetadata = await extractMetadata(compressedFile, photo.file !== compressedFile ? photo.file : undefined)
      
      setPhotos(prev => prev.map(p => 
        p.id === photo.id 
          ? { 
              ...p, 
              file: compressedFile, 
              originalFile: photo.file !== compressedFile ? photo.file : undefined,
              status: 'uploading' as const, 
              progress: 0,
              metadata: finalMetadata 
            } 
          : p
      ))

      await simulateUpload(photo.id)

      setPhotos(prev => prev.map(p => 
        p.id === photo.id ? { ...p, status: 'complete' as const, progress: 100 } : p
      ))

      const completedPhoto = photos.find(p => p.id === photo.id)
      if (completedPhoto) {
        opts.onComplete(completedPhoto)
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      
      setPhotos(prev => prev.map(p => 
        p.id === photo.id 
          ? { ...p, status: 'error' as const, error: errorMessage } 
          : p
      ))

      opts.onError(photo, errorMessage)
      toast.error(`Failed to upload ${photo.file.name}`)
    }
  }, [compressPhoto, extractMetadata, simulateUpload, photos, opts])

  const addPhotos = useCallback(async (files: File[]) => {
    if (photos.length + files.length > opts.maxFiles) {
      toast.error(`Maximum ${opts.maxFiles} photos allowed`)
      return
    }

    const validFiles: File[] = []
    
    for (const file of files) {
      const error = validateFile(file)
      if (error) {
        toast.error(error)
        continue
      }
      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    setIsUploading(true)

    const newPhotos = await Promise.all(
      validFiles.map(async (file) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const preview = URL.createObjectURL(file)
        const metadata = await extractMetadata(file)

        return {
          id,
          file,
          preview,
          progress: 0,
          status: 'pending' as const,
          metadata,
        }
      })
    )

    setPhotos(prev => [...prev, ...newPhotos])

    if (opts.autoUpload) {
      for (const photo of newPhotos) {
        await uploadPhoto(photo)
      }
    }

    setIsUploading(false)
  }, [photos.length, opts.maxFiles, opts.autoUpload, validateFile, extractMetadata, uploadPhoto])

  const removePhoto = useCallback((photoId: string) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === photoId)
      if (photo) {
        URL.revokeObjectURL(photo.preview)
      }
      return prev.filter(p => p.id !== photoId)
    })
  }, [])

  const retryPhoto = useCallback(async (photoId: string) => {
    const photo = photos.find(p => p.id === photoId)
    if (!photo) return

    setPhotos(prev => prev.map(p => 
      p.id === photoId ? { ...p, status: 'pending' as const, error: undefined } : p
    ))

    await uploadPhoto(photo)
  }, [photos, uploadPhoto])

  const clearPhotos = useCallback(() => {
    photos.forEach(photo => {
      URL.revokeObjectURL(photo.preview)
    })
    setPhotos([])
  }, [photos])

  const uploadAll = useCallback(async () => {
    const pendingPhotos = photos.filter(p => p.status === 'pending' || p.status === 'error')
    if (pendingPhotos.length === 0) return

    setIsUploading(true)

    for (const photo of pendingPhotos) {
      await uploadPhoto(photo)
    }

    setIsUploading(false)
  }, [photos, uploadPhoto])

  const getUploadStats = useCallback(() => {
    return {
      total: photos.length,
      completed: photos.filter(p => p.status === 'complete').length,
      uploading: photos.filter(p => p.status === 'uploading').length,
      pending: photos.filter(p => p.status === 'pending').length,
      errors: photos.filter(p => p.status === 'error').length,
      totalProgress: photos.length > 0 
        ? photos.reduce((sum, p) => sum + p.progress, 0) / photos.length 
        : 0,
    }
  }, [photos])

  return {
    photos,
    isUploading,
    addPhotos,
    removePhoto,
    retryPhoto,
    clearPhotos,
    uploadAll,
    getUploadStats,
  }
}
