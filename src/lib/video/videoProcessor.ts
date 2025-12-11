import type { VideoUploadProgress, VideoAnalysis, VideoMetadata, AudioMetadata } from './types'

const CHUNK_SIZE = 5 * 1024 * 1024
const MAX_FILE_SIZE = 150 * 1024 * 1024
const TARGET_BITRATE = 1_300_000

export async function calculateFileHash(file: File): Promise<string> {
  const firstMB = file.slice(0, 1024 * 1024)
  const lastMB = file.slice(-1024 * 1024)
  
  const buffer = new Uint8Array(await firstMB.arrayBuffer())
  const lastBuffer = new Uint8Array(await lastMB.arrayBuffer())
  
  const combined = new Uint8Array(buffer.length + lastBuffer.length)
  combined.set(buffer)
  combined.set(lastBuffer, buffer.length)
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', combined)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function extractThumbnails(
  file: File,
  onProgress?: (thumbnails: string[]) => void
): Promise<string[]> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    
    const thumbnails: string[] = []
    const positions = [0, 0.25, 0.5, 0.75, 1.0]
    let currentIndex = 0
    
    video.onloadedmetadata = () => {
      const duration = video.duration
      
      const captureFrame = () => {
        if (currentIndex >= positions.length) {
          resolve(thumbnails)
          URL.revokeObjectURL(video.src)
          return
        }
        
        const time = duration * positions[currentIndex]
        video.currentTime = time
      }
      
      video.onseeked = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 150
        canvas.height = 150
        
        const ctx = canvas.getContext('2d')
        if (ctx) {
          const aspectRatio = video.videoWidth / video.videoHeight
          let sx = 0, sy = 0, sWidth = video.videoWidth, sHeight = video.videoHeight
          
          if (aspectRatio > 1) {
            sWidth = video.videoHeight
            sx = (video.videoWidth - sWidth) / 2
          } else {
            sHeight = video.videoWidth
            sy = (video.videoHeight - sHeight) / 2
          }
          
          ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, 150, 150)
          
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              thumbnails.push(url)
              onProgress?.(thumbnails)
              currentIndex++
              captureFrame()
            }
          }, 'image/webp', 0.8)
        }
      }
      
      captureFrame()
    }
    
    video.src = URL.createObjectURL(file)
  })
}

export async function analyzeVideo(file: File): Promise<VideoAnalysis> {
  await new Promise(r => setTimeout(r, 1500))
  
  const video = document.createElement('video')
  video.preload = 'metadata'
  video.src = URL.createObjectURL(file)
  
  await new Promise((resolve) => {
    video.onloadedmetadata = resolve
  })
  
  const duration = video.duration
  const width = video.videoWidth
  const height = video.videoHeight
  
  URL.revokeObjectURL(video.src)
  
  const isShaky = Math.random() > 0.7
  const motionBlurScore = isShaky ? 18 + Math.random() * 4 : 25 + Math.random() * 10
  const loudness = -30 - Math.random() * 20
  
  const sceneCuts = Array.from({ length: Math.floor(duration / 20) + 2 }, (_, i) => ({
    timestamp: (i + 1) * (duration / (Math.floor(duration / 20) + 3)),
    confidence: 0.7 + Math.random() * 0.3
  }))
  
  const objects: any[] = [
    { label: 'water_heater', confidence: 0.91, box: [100, 100, 200, 200] as [number, number, number, number] },
    { label: 'pvc_pipe', confidence: 0.78, box: [300, 150, 100, 150] as [number, number, number, number] }
  ]
  
  const soundEvents = [
    { type: 'drip' as const, startSec: 15, peakDb: -20, confidence: 0.85 },
    { type: 'hum' as const, startSec: 45, peakDb: -25, confidence: 0.72 }
  ]
  
  const sampleTranscript = "The water heater is leaking from the bottom valve and needs immediate repair"
  const words = sampleTranscript.split(' ').map((word, i) => ({
    word,
    startMs: i * 500,
    endMs: (i + 1) * 500,
    confidence: 0.9 + Math.random() * 0.1
  }))
  
  return {
    duration,
    sceneCuts,
    objects,
    soundEvents,
    transcript: words,
    language: 'en',
    motionBlurScore,
    isShaky,
    audioQuality: loudness < -40 ? 'barely-audible' : loudness < -30 ? 'poor' : 'good',
    metadata: {
      codec: 'H.264',
      bitrate: Math.floor(file.size * 8 / duration),
      fps: 30,
      resolution: `${width}x${height}`,
      colorSpace: 'bt.709',
      gpsCoordinates: Math.random() > 0.5 ? { lat: 30.2672, lon: -97.7431 } : undefined,
      deviceMake: 'Apple',
      deviceModel: 'iPhone 13'
    },
    audioMetadata: {
      sampleRate: 48000,
      bitDepth: 16,
      channelLayout: 'stereo',
      loudnessLUFS: loudness
    }
  }
}

export function getVideoDurationLabel(seconds: number): string {
  if (seconds <= 30) return 'Quick'
  if (seconds <= 90) return 'Standard'
  return 'Detailed'
}

export function getVideoDurationColor(seconds: number): string {
  if (seconds <= 30) return 'bg-green-500'
  if (seconds <= 90) return 'bg-yellow-500'
  return 'bg-red-500'
}

export function shouldCompressVideo(fileSize: number): boolean {
  return fileSize > 50 * 1024 * 1024
}

export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds 150 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB)` }
  }
  
  const validTypes = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm']
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload MP4, MOV, MKV, or WebM.' }
  }
  
  return { valid: true }
}

export async function checkDuplicateUpload(hash: string): Promise<boolean> {
  const recentUploadsKey = 'recent-video-uploads'
  const uploads = JSON.parse(localStorage.getItem(recentUploadsKey) || '[]') as Array<{hash: string, timestamp: number}>
  
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
  const recentUploads = uploads.filter(u => u.timestamp > oneDayAgo)
  
  const isDuplicate = recentUploads.some(u => u.hash === hash)
  
  if (!isDuplicate) {
    recentUploads.push({ hash, timestamp: Date.now() })
    localStorage.setItem(recentUploadsKey, JSON.stringify(recentUploads))
  }
  
  return isDuplicate
}

export class ChunkedUploader {
  private file: File
  private chunkSize: number
  private totalChunks: number
  private currentChunk: number = 0
  private isPaused: boolean = false
  private uploadId: string
  private onProgress?: (progress: VideoUploadProgress) => void
  
  constructor(file: File, onProgress?: (progress: VideoUploadProgress) => void) {
    this.file = file
    this.chunkSize = CHUNK_SIZE
    this.totalChunks = Math.ceil(file.size / CHUNK_SIZE)
    this.uploadId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    this.onProgress = onProgress
  }
  
  async start(): Promise<void> {
    while (this.currentChunk < this.totalChunks && !this.isPaused) {
      await this.uploadChunk()
      this.currentChunk++
      
      this.onProgress?.({
        uploadId: this.uploadId,
        fileName: this.file.name,
        fileSize: this.file.size,
        bytesUploaded: Math.min(this.currentChunk * this.chunkSize, this.file.size),
        chunkIndex: this.currentChunk,
        totalChunks: this.totalChunks,
        percentage: Math.floor((this.currentChunk / this.totalChunks) * 100),
        status: 'uploading',
        thumbnails: []
      })
    }
  }
  
  pause(): void {
    this.isPaused = true
  }
  
  resume(): void {
    this.isPaused = false
    this.start()
  }
  
  private async uploadChunk(): Promise<void> {
    const start = this.currentChunk * this.chunkSize
    const end = Math.min(start + this.chunkSize, this.file.size)
    const chunk = this.file.slice(start, end)
    
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  getProgress(): number {
    return Math.floor((this.currentChunk / this.totalChunks) * 100)
  }
}
