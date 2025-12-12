import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  Upload, 
  Pause, 
  Play, 
  X, 
  Check,
  VideoCamera,
  WarningCircle,
  Info
} from "@phosphor-icons/react"
import { toast } from "sonner"
import {
  validateVideoFile,
  calculateFileHash,
  checkDuplicateUpload,
  extractThumbnails,
  analyzeVideo,
  ChunkedUploader,
  getVideoDurationLabel,
  getVideoDurationColor,
  shouldCompressVideo
} from "@/lib/video/videoProcessor"
import type { VideoUploadProgress, VideoAnalysis } from "@/lib/video/types"

interface VideoUploaderProps {
  onUploadComplete: (file: File, analysis: VideoAnalysis) => void
  onCancel?: () => void
}

export function VideoUploader({ onUploadComplete, onCancel }: VideoUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<VideoUploadProgress | null>(null)
  const [thumbnails, setThumbnails] = useState<string[]>([])
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState(0)
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploaderRef = useRef<ChunkedUploader | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      await handleFileSelection(droppedFile)
    }
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      await handleFileSelection(selectedFile)
    }
  }

  const handleFileSelection = async (selectedFile: File) => {
    const validation = validateVideoFile(selectedFile)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    if (shouldCompressVideo(selectedFile.size)) {
      toast.info("Large file detected - compression recommended", {
        description: "This will reduce file size by ~60% while maintaining quality"
      })
    }

    const hash = await calculateFileHash(selectedFile)
    const isDuplicate = await checkDuplicateUpload(hash)
    
    if (isDuplicate) {
      toast.error("Duplicate video detected", {
        description: "Looks like you already posted this video. Check My Jobs."
      })
      return
    }

    setFile(selectedFile)
    startUpload(selectedFile, hash)
  }

  const startUpload = async (uploadFile: File, hash: string) => {
    const uploader = new ChunkedUploader(uploadFile, (progress) => {
      setUploadProgress(progress)
    })
    
    uploaderRef.current = uploader
    
    setUploadProgress({
      uploadId: `upload-${Date.now()}`,
      fileName: uploadFile.name,
      fileSize: uploadFile.size,
      bytesUploaded: 0,
      chunkIndex: 0,
      totalChunks: Math.ceil(uploadFile.size / (5 * 1024 * 1024)),
      percentage: 0,
      status: 'uploading',
      thumbnails: [],
      hash
    })

    extractThumbnails(uploadFile, (thumbs) => {
      setThumbnails(thumbs)
      setUploadProgress(prev => prev ? { ...prev, thumbnails: thumbs } : null)
    })

    await uploader.start()
    
    setUploadProgress(prev => prev ? { ...prev, status: 'processing' } : null)
    
    const videoAnalysis = await analyzeVideo(uploadFile)
    setAnalysis(videoAnalysis)
    
    setUploadProgress(prev => prev ? { ...prev, status: 'completed' } : null)
    
    if (videoAnalysis.isShaky) {
      toast.warning("Shaky footage detected", {
        description: "Consider retaking with a steadier hand for best results"
      })
    }
    
    if (videoAnalysis.audioQuality === 'barely-audible') {
      toast.warning("Audio is barely audible", {
        description: "We can't hear you well – want to add a voice note?"
      })
    }
    
    toast.success("Upload complete!", {
      description: `Analyzed ${videoAnalysis.duration.toFixed(0)}s video with ${videoAnalysis.sceneCuts.length} scene changes`
    })
  }

  const handlePause = () => {
    uploaderRef.current?.pause()
    setIsPaused(true)
    setUploadProgress(prev => prev ? { ...prev, status: 'paused' } : null)
  }

  const handleResume = () => {
    uploaderRef.current?.resume()
    setIsPaused(false)
    setUploadProgress(prev => prev ? { ...prev, status: 'uploading' } : null)
  }

  const handleCancel = () => {
    uploaderRef.current?.pause()
    setFile(null)
    setUploadProgress(null)
    setThumbnails([])
    setAnalysis(null)
    onCancel?.()
  }

  const handleComplete = () => {
    if (file && analysis) {
      onUploadComplete(file, analysis)
    }
  }

  if (uploadProgress?.status === 'completed' && analysis && file) {
    return (
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="text-white" size={24} weight="bold" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Upload Complete!</h3>
              <p className="text-sm text-muted-foreground">{file.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Duration</p>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs text-white font-medium ${getVideoDurationColor(analysis.duration)}`}>
                  {getVideoDurationLabel(analysis.duration)}
                </span>
                <span className="font-semibold">{analysis.duration.toFixed(0)}s</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Resolution</p>
              <p className="font-semibold">{analysis.metadata.resolution}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Scene Cuts</p>
              <p className="font-semibold">{analysis.sceneCuts.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Objects Detected</p>
              <p className="font-semibold">{analysis.objects.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Audio Quality</p>
              <p className="font-semibold capitalize">{analysis.audioQuality}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Language</p>
              <p className="font-semibold uppercase">{analysis.language}</p>
            </div>
          </div>

          {analysis.transcript.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Transcript</p>
              <p className="text-sm text-muted-foreground italic">
                "{analysis.transcript.map(w => w.word).join(' ')}"
              </p>
            </div>
          )}

          {thumbnails.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Select Cover Image</p>
              <div className="flex gap-2">
                {thumbnails.map((thumb, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedThumbnailIndex(index)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                      selectedThumbnailIndex === index
                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img src={thumb} alt={`Frame ${index + 1}`} className="w-20 h-20 object-cover" />
                    {selectedThumbnailIndex === index && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Check className="text-white" size={24} weight="bold" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {analysis.metadata.gpsCoordinates && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <Info className="text-blue-600 flex-shrink-0" size={20} />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Location detected</p>
                <p className="text-blue-700">GPS coordinates found in video metadata</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleComplete} className="flex-1">
              Continue with This Video
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (uploadProgress && file) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - uploadProgress.percentage / 100)}`}
                  className="text-primary transition-all duration-300"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">{uploadProgress.percentage}%</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {uploadProgress.status === 'uploading' && 'Uploading...'}
                {uploadProgress.status === 'paused' && 'Paused'}
                {uploadProgress.status === 'processing' && 'Processing video...'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {(uploadProgress.bytesUploaded / 1024 / 1024).toFixed(1)} MB / {(uploadProgress.fileSize / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          </div>

          <Progress value={uploadProgress.percentage} className="h-2" />

          {thumbnails.length > 0 && (
            <div className="flex gap-2">
              {thumbnails.map((thumb, index) => (
                <img 
                  key={index} 
                  src={thumb} 
                  alt={`Preview ${index + 1}`}
                  className="w-16 h-16 rounded object-cover border border-border"
                />
              ))}
            </div>
          )}

          <div className="flex gap-2">
            {uploadProgress.status === 'uploading' && (
              <Button variant="outline" onClick={handlePause} size="sm">
                <Pause size={16} className="mr-2" />
                Pause Upload
              </Button>
            )}
            {uploadProgress.status === 'paused' && (
              <Button variant="outline" onClick={handleResume} size="sm">
                <Play size={16} className="mr-2" />
                Resume Upload
              </Button>
            )}
            <Button variant="ghost" onClick={handleCancel} size="sm">
              <X size={16} className="mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer
            ${isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary hover:bg-muted/50'
            }
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <VideoCamera className="text-primary" size={40} weight="fill" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-heading font-semibold text-xl">Upload Your Video</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Film as long as you like – up to 150 MB. That's ~10 min of crisp video. 
                Walk around, zoom in, talk it out.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <Button type="button">
                <Upload size={20} className="mr-2" />
                Choose File
              </Button>
              <span className="text-sm text-muted-foreground">or drag and drop</span>
            </div>

            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg max-w-md">
              <Info className="text-muted-foreground flex-shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-muted-foreground text-left">
                Supported: MP4, MOV, MKV, WebM • Max 150 MB • Recommended bitrate: 1.3 Mbps
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/x-matroska,video/webm"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  )
}
