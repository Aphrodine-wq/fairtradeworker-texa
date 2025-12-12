export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeMB?: number
  mimeType?: string
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  maxSizeMB: 2,
  mimeType: 'image/jpeg',
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  if (file.size <= opts.maxSizeMB * 1024 * 1024) {
    return file
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onerror = () => reject(new Error('Failed to load image'))
      
      img.onload = () => {
        try {
          let { width, height } = img
          
          if (width > opts.maxWidth || height > opts.maxHeight) {
            const aspectRatio = width / height
            
            if (width > height) {
              width = Math.min(width, opts.maxWidth)
              height = width / aspectRatio
            } else {
              height = Math.min(height, opts.maxHeight)
              width = height * aspectRatio
            }
          }
          
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }
          
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          
          ctx.drawImage(img, 0, 0, width, height)
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'))
                return
              }
              
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, '.jpg'),
                {
                  type: opts.mimeType,
                  lastModified: Date.now(),
                }
              )
              
              resolve(compressedFile)
            },
            opts.mimeType,
            opts.quality
          )
        } catch (error) {
          reject(error)
        }
      }
      
      img.src = e.target?.result as string
    }
    
    reader.readAsDataURL(file)
  })
}

export async function compressMultipleImages(
  files: File[],
  options: CompressionOptions = {},
  onProgress?: (current: number, total: number) => void
): Promise<File[]> {
  const compressed: File[] = []
  
  for (let i = 0; i < files.length; i++) {
    try {
      const compressedFile = await compressImage(files[i], options)
      compressed.push(compressedFile)
      onProgress?.(i + 1, files.length)
    } catch (error) {
      console.error(`Failed to compress ${files[i].name}:`, error)
      compressed.push(files[i])
    }
  }
  
  return compressed
}

export function getCompressionStats(original: File, compressed: File) {
  const originalSize = original.size / 1024 / 1024
  const compressedSize = compressed.size / 1024 / 1024
  const savings = ((original.size - compressed.size) / original.size) * 100
  
  return {
    originalSize: originalSize.toFixed(2),
    compressedSize: compressedSize.toFixed(2),
    savings: savings.toFixed(1),
    ratio: (compressed.size / original.size).toFixed(2),
  }
}

export async function generateThumbnail(
  file: File,
  size: number = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onerror = () => reject(new Error('Failed to load image'))
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const aspectRatio = img.width / img.height
        
        let width = size
        let height = size
        
        if (aspectRatio > 1) {
          height = size / aspectRatio
        } else {
          width = size * aspectRatio
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        
        ctx.drawImage(img, 0, 0, width, height)
        
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      
      img.src = e.target?.result as string
    }
    
    reader.readAsDataURL(file)
  })
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onerror = () => reject(new Error('Failed to load image'))
      
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      
      img.src = e.target?.result as string
    }
    
    reader.readAsDataURL(file)
  })
}
