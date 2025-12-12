import { useRef } from 'react'
import { Camera, X, Warning, ArrowClockwise, Check, CircleNotch } from '@phosphor-icons/react'
import { usePhotoUpload, type UploadedPhoto } from '@/hooks/usePhotoUpload'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface PhotoUploaderProps {
  maxPhotos?: number
  maxSize?: number
  onPhotosChange?: (photos: UploadedPhoto[]) => void
  className?: string
  compact?: boolean
}

export function PhotoUploader({ 
  maxPhotos = 20, 
  maxSize = 10 * 1024 * 1024,
  onPhotosChange,
  className,
  compact = false,
}: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { 
    photos, 
    isUploading, 
    addPhotos, 
    removePhoto, 
    retryPhoto,
    getUploadStats 
  } = usePhotoUpload({
    maxFiles: maxPhotos,
    maxSize,
    onComplete: () => {
      if (onPhotosChange) {
        onPhotosChange(photos)
      }
    },
  })

  const stats = getUploadStats()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      addPhotos(files)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    addPhotos(files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const getStatusIcon = (photo: UploadedPhoto) => {
    switch (photo.status) {
      case 'uploading':
        return <CircleNotch className="w-4 h-4 animate-spin text-primary" />
      case 'complete':
        return <Check className="w-4 h-4 text-green-600" />
      case 'error':
        return <Warning className="w-4 h-4 text-destructive" />
      default:
        return null
    }
  }

  if (compact) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || photos.length >= maxPhotos}
          >
            <Camera className="w-4 h-4" />
            Add Photos ({photos.length}/{maxPhotos})
          </Button>
          
          {stats.total > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{stats.completed}/{stats.total} uploaded</span>
              {stats.uploading > 0 && (
                <CircleNotch className="w-4 h-4 animate-spin text-primary" />
              )}
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {photos.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group aspect-square">
                <img
                  src={photo.preview}
                  alt="Upload preview"
                  className="w-full h-full object-cover rounded-lg"
                />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    onClick={() => removePhoto(photo.id)}
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {photo.status === 'uploading' && (
                  <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <CircleNotch className="w-6 h-6 animate-spin mx-auto mb-1" />
                      <div className="text-xs">{Math.round(photo.progress)}%</div>
                    </div>
                  </div>
                )}

                {photo.status === 'error' && (
                  <div className="absolute inset-0 bg-destructive/80 rounded-lg flex items-center justify-center">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => retryPhoto(photo.id)}
                      className="text-white hover:bg-white/20"
                    >
                      <ArrowClockwise className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-primary/10 p-4">
            <Camera className="w-8 h-8 text-primary" />
          </div>
          
          <div>
            <p className="text-sm font-medium text-foreground">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, or WebP up to {Math.round(maxSize / 1024 / 1024)}MB
            </p>
            <p className="text-xs text-muted-foreground">
              {photos.length}/{maxPhotos} photos uploaded
            </p>
          </div>

          {stats.total > 0 && stats.uploading > 0 && (
            <div className="w-full max-w-xs">
              <Progress value={stats.totalProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Uploading {stats.uploading} photo{stats.uploading !== 1 ? 's' : ''}...
              </p>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {photos.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              Uploaded Photos ({stats.completed}/{stats.total})
            </h4>
            {stats.errors > 0 && (
              <p className="text-xs text-destructive">
                {stats.errors} failed
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={photo.preview}
                    alt="Upload preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="absolute top-2 right-2 flex gap-1">
                  <div className="rounded-full bg-background/90 p-1.5 backdrop-blur-sm">
                    {getStatusIcon(photo)}
                  </div>
                  
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    onClick={() => removePhoto(photo.id)}
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {photo.status === 'uploading' && (
                  <div className="absolute inset-0 bg-black/60 rounded-lg flex flex-col items-center justify-center text-white">
                    <CircleNotch className="w-6 h-6 animate-spin mb-2" />
                    <div className="text-sm font-medium">{Math.round(photo.progress)}%</div>
                    <Progress 
                      value={photo.progress} 
                      className="h-1 w-3/4 mt-2"
                    />
                  </div>
                )}

                {photo.status === 'error' && (
                  <div className="absolute inset-0 bg-destructive/90 rounded-lg flex flex-col items-center justify-center text-white">
                    <Warning className="w-6 h-6 mb-2" />
                    <p className="text-xs mb-2">Upload failed</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => retryPhoto(photo.id)}
                    >
                      <ArrowClockwise className="w-3 h-3" />
                      Retry
                    </Button>
                  </div>
                )}

                {photo.metadata && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex justify-between">
                      <span>{photo.metadata.width}×{photo.metadata.height}</span>
                      <span>{(photo.metadata.size / 1024).toFixed(0)}KB</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
