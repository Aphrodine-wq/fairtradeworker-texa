export interface VideoMetadata {
  codec: string
  bitrate: number
  fps: number
  resolution: string
  colorSpace: string
  gpsCoordinates?: { lat: number; lon: number }
  deviceMake?: string
  deviceModel?: string
}

export interface AudioMetadata {
  sampleRate: number
  bitDepth: number
  channelLayout: 'stereo' | 'mono'
  loudnessLUFS: number
}

export interface SceneCut {
  timestamp: number
  confidence: number
}

export interface VideoObject {
  label: string
  confidence: number
  box?: [number, number, number, number]
  timestamp?: number
}

export interface SoundEvent {
  type: 'grinding' | 'drip' | 'hiss' | 'click' | 'hum' | 'squeal'
  startSec: number
  peakDb: number
  confidence: number
}

export interface TranscriptWord {
  word: string
  startMs: number
  endMs: number
  confidence: number
}

export interface VideoAnalysis {
  duration: number
  sceneCuts: SceneCut[]
  objects: VideoObject[]
  soundEvents: SoundEvent[]
  transcript: TranscriptWord[]
  language: string
  motionBlurScore: number
  isShaky: boolean
  audioQuality: 'good' | 'poor' | 'barely-audible'
  metadata: VideoMetadata
  audioMetadata: AudioMetadata
}

export interface VideoUploadProgress {
  uploadId: string
  fileName: string
  fileSize: number
  bytesUploaded: number
  chunkIndex: number
  totalChunks: number
  percentage: number
  status: 'uploading' | 'paused' | 'processing' | 'completed' | 'error'
  thumbnails: string[]
  coverTimeSec?: number
  hash?: string
  error?: string
}

export type VideoPrivacyMode = 'public' | 'private'

export interface VideoUploadMetrics {
  uploadId: string
  userId: string
  fileName: string
  fileSize: number
  chunkSize: number
  totalChunks: number
  uploadStartTime: number
  uploadEndTime?: number
  durationSeconds?: number
  success: boolean
  failReason?: string
  averageSpeedMbps?: number
}
