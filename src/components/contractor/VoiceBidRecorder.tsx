import { useState, useRef, useCallback, useEffect } from 'react'
import { Microphone, Stop, Play, Pause, ArrowClockwise, PaperPlaneTilt, Waveform, Clock, CheckCircle, Warning } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface VoiceBidProps {
  jobId: string
  jobTitle: string
  jobDescription: string
  onBidSubmit?: (bid: VoiceBidData) => void
  maxDurationSeconds?: number
}

export interface VoiceBidData {
  audioBlob: Blob
  audioUrl: string
  duration: number
  transcript?: string
  extractedData?: ExtractedBidData
  sentiment?: BidSentiment
}

interface ExtractedBidData {
  price?: number
  priceRange?: { min: number; max: number }
  timeline?: string
  approach?: string
  materials?: string[]
  warranties?: string
  confidence: number
}

interface BidSentiment {
  overall: 'confident' | 'neutral' | 'hesitant'
  priceConfidence: number
  timelineConfidence: number
  keywords: string[]
}

type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped' | 'processing' | 'ready'

export function VoiceBidRecorder({ 
  jobId, 
  jobTitle, 
  jobDescription, 
  onBidSubmit,
  maxDurationSeconds = 90 
}: VoiceBidProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcript, setTranscript] = useState<string>('')
  const [extractedData, setExtractedData] = useState<ExtractedBidData | null>(null)
  const [sentiment, setSentiment] = useState<BidSentiment | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackProgress, setPlaybackProgress] = useState(0)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      
      streamRef.current = stream
      audioChunksRef.current = []
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm'
      })
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioBlob(blob)
        setAudioUrl(url)
        setRecordingState('stopped')
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(100) // Collect data every 100ms
      
      setRecordingState('recording')
      setDuration(0)
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDurationSeconds) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
      
    } catch (error) {
      console.error('Failed to start recording:', error)
      toast.error('Could not access microphone. Please check permissions.')
    }
  }, [maxDurationSeconds])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop()
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [recordingState])

  const resetRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl(null)
    setAudioBlob(null)
    setDuration(0)
    setTranscript('')
    setExtractedData(null)
    setSentiment(null)
    setRecordingState('idle')
    setPlaybackProgress(0)
  }, [audioUrl])

  const playAudio = useCallback(() => {
    if (!audioUrl) return
    
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl)
      audioRef.current.onended = () => {
        setIsPlaying(false)
        setPlaybackProgress(0)
      }
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          setPlaybackProgress((audioRef.current.currentTime / audioRef.current.duration) * 100)
        }
      }
    }
    
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }, [audioUrl, isPlaying])

  const processAudio = useCallback(async () => {
    if (!audioBlob) return
    
    setRecordingState('processing')
    
    try {
      // Convert blob to base64 for API
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1]
          resolve(base64)
        }
        reader.readAsDataURL(audioBlob)
      })
      
      const base64Audio = await base64Promise
      
      // Call transcription API (Whisper)
      const transcriptResult = await transcribeAudio(base64Audio)
      setTranscript(transcriptResult)
      
      // Extract bid data using AI
      const extracted = await extractBidData(transcriptResult, jobDescription)
      setExtractedData(extracted)
      
      // Analyze sentiment
      const sentimentResult = analyzeSentiment(transcriptResult)
      setSentiment(sentimentResult)
      
      setRecordingState('ready')
      toast.success('Voice bid processed successfully!')
      
    } catch (error) {
      console.error('Processing error:', error)
      toast.error('Failed to process audio. Please try again.')
      setRecordingState('stopped')
    }
  }, [audioBlob, jobDescription])

  const submitBid = useCallback(() => {
    if (!audioBlob || !audioUrl) return
    
    const bidData: VoiceBidData = {
      audioBlob,
      audioUrl,
      duration,
      transcript: transcript || undefined,
      extractedData: extractedData || undefined,
      sentiment: sentiment || undefined
    }
    
    onBidSubmit?.(bidData)
    toast.success('Voice bid submitted!')
  }, [audioBlob, audioUrl, duration, transcript, extractedData, sentiment, onBidSubmit])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waveform className="h-5 w-5 text-primary" />
          Voice Bid
        </CardTitle>
        <CardDescription>
          Record a 30-90 second voice proposal for "{jobTitle}"
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Recording Tips */}
        {recordingState === 'idle' && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Tips for a great voice bid:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• State your price clearly ("I can do this for $X")</li>
              <li>• Mention your timeline ("Available next Tuesday")</li>
              <li>• Briefly explain your approach</li>
              <li>• Share relevant experience if applicable</li>
            </ul>
          </div>
        )}
        
        {/* Recording UI */}
        <div className="flex flex-col items-center space-y-4">
          {/* Timer Display */}
          <div className="text-4xl font-mono font-bold tabular-nums">
            {formatTime(duration)}
            {recordingState === 'recording' && (
              <span className="text-sm text-muted-foreground ml-2">
                / {formatTime(maxDurationSeconds)}
              </span>
            )}
          </div>
          
          {/* Progress Ring */}
          {recordingState === 'recording' && (
            <Progress value={(duration / maxDurationSeconds) * 100} className="w-full h-2" />
          )}
          
          {/* Recording Indicator */}
          {recordingState === 'recording' && (
            <div className="flex items-center gap-2 text-red-500">
              <span className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Recording...</span>
            </div>
          )}
          
          {/* Control Buttons */}
          <div className="flex items-center gap-4">
            {recordingState === 'idle' && (
              <Button 
                size="lg" 
                onClick={startRecording}
                className="h-16 w-16 rounded-full"
              >
                <Microphone className="h-8 w-8" />
              </Button>
            )}
            
            {recordingState === 'recording' && (
              <Button 
                size="lg" 
                variant="destructive"
                onClick={stopRecording}
                className="h-16 w-16 rounded-full"
              >
                <Stop className="h-8 w-8" />
              </Button>
            )}
            
            {(recordingState === 'stopped' || recordingState === 'ready') && (
              <>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={resetRecording}
                  className="h-12 w-12 rounded-full"
                >
                  <ArrowClockwise className="h-5 w-5" />
                </Button>
                
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={playAudio}
                  className="h-16 w-16 rounded-full"
                >
                  {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                </Button>
                
                {recordingState === 'stopped' && (
                  <Button 
                    size="lg"
                    onClick={processAudio}
                    className="h-12 px-6"
                  >
                    Process
                  </Button>
                )}
              </>
            )}
            
            {recordingState === 'processing' && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Processing audio...</span>
              </div>
            )}
          </div>
          
          {/* Playback Progress */}
          {(recordingState === 'stopped' || recordingState === 'ready') && audioUrl && (
            <Progress value={playbackProgress} className="w-full h-1" />
          )}
        </div>
        
        {/* Transcript */}
        {transcript && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Transcript</h4>
            <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
              {transcript}
            </p>
          </div>
        )}
        
        {/* Extracted Data */}
        {extractedData && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">AI Analysis</h4>
            
            <div className="grid grid-cols-2 gap-3">
              {extractedData.price && (
                <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    ${extractedData.price.toLocaleString()}
                  </p>
                </div>
              )}
              
              {extractedData.priceRange && !extractedData.price && (
                <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Price Range</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    ${extractedData.priceRange.min.toLocaleString()} - ${extractedData.priceRange.max.toLocaleString()}
                  </p>
                </div>
              )}
              
              {extractedData.timeline && (
                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Timeline</p>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {extractedData.timeline}
                  </p>
                </div>
              )}
            </div>
            
            {extractedData.approach && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Approach</p>
                <p className="text-sm">{extractedData.approach}</p>
              </div>
            )}
          </div>
        )}
        
        {/* Sentiment Analysis */}
        {sentiment && (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={
              sentiment.overall === 'confident' ? 'default' :
              sentiment.overall === 'hesitant' ? 'destructive' : 'secondary'
            }>
              {sentiment.overall === 'confident' && <CheckCircle className="h-3 w-3 mr-1" />}
              {sentiment.overall === 'hesitant' && <Warning className="h-3 w-3 mr-1" />}
              {sentiment.overall.charAt(0).toUpperCase() + sentiment.overall.slice(1)} tone
            </Badge>
            
            {sentiment.keywords.map((keyword, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Submit Button */}
        {recordingState === 'ready' && (
          <Button 
            className="w-full" 
            size="lg"
            onClick={submitBid}
          >
            <PaperPlaneTilt className="h-5 w-5 mr-2" />
            Submit Voice Bid
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Transcribe audio using Whisper API
 */
async function transcribeAudio(base64Audio: string): Promise<string> {
  // In production, this would call your backend which calls Whisper
  // For demo, return a simulated transcript
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  return "Hi, I can definitely help with this project. Looking at the description, I'd estimate around $450 to $550 depending on what we find once we get started. I've done about 20 similar jobs this year and I'm confident I can have this wrapped up within 3 to 4 days. I'd start by assessing the full scope, then order materials, and get to work. Happy to discuss further if you have questions."
}

/**
 * Extract structured bid data from transcript
 */
async function extractBidData(transcript: string, jobDescription: string): Promise<ExtractedBidData> {
  // In production, this would call GPT-4 to extract structured data
  // For demo, parse the transcript with regex
  
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const priceMatch = transcript.match(/\$?(\d{1,3}(?:,?\d{3})*)/g)
  const prices = priceMatch?.map(p => parseInt(p.replace(/[$,]/g, ''))).filter(p => p > 50 && p < 100000)
  
  const timelineMatches = transcript.match(/(\d+)\s*(?:to|-)?\s*(\d+)?\s*(days?|weeks?|hours?)/i)
  
  let price: number | undefined
  let priceRange: { min: number; max: number } | undefined
  
  if (prices && prices.length >= 2) {
    priceRange = { min: Math.min(...prices), max: Math.max(...prices) }
  } else if (prices && prices.length === 1) {
    price = prices[0]
  }
  
  let timeline: string | undefined
  if (timelineMatches) {
    timeline = timelineMatches[2] 
      ? `${timelineMatches[1]}-${timelineMatches[2]} ${timelineMatches[3]}`
      : `${timelineMatches[1]} ${timelineMatches[3]}`
  }
  
  // Extract approach (sentences mentioning process/method)
  const approachWords = ['start', 'begin', 'first', 'then', 'assess', 'order', 'materials']
  const sentences = transcript.split(/[.!?]+/)
  const approachSentence = sentences.find(s => 
    approachWords.some(w => s.toLowerCase().includes(w))
  )
  
  return {
    price,
    priceRange,
    timeline,
    approach: approachSentence?.trim(),
    confidence: 0.85
  }
}

/**
 * Analyze sentiment of voice bid
 */
function analyzeSentiment(transcript: string): BidSentiment {
  const lower = transcript.toLowerCase()
  
  const confidentWords = ['definitely', 'confident', 'absolutely', 'certainly', 'guarantee', 'sure', 'will']
  const hesitantWords = ['maybe', 'might', 'probably', 'could be', 'depends', 'not sure', 'estimate']
  
  const confidentCount = confidentWords.filter(w => lower.includes(w)).length
  const hesitantCount = hesitantWords.filter(w => lower.includes(w)).length
  
  let overall: 'confident' | 'neutral' | 'hesitant'
  if (confidentCount > hesitantCount + 1) {
    overall = 'confident'
  } else if (hesitantCount > confidentCount + 1) {
    overall = 'hesitant'
  } else {
    overall = 'neutral'
  }
  
  // Extract notable keywords
  const keywords: string[] = []
  if (lower.includes('experience')) keywords.push('Experienced')
  if (lower.includes('similar')) keywords.push('Similar jobs done')
  if (lower.includes('quality')) keywords.push('Quality focused')
  if (lower.includes('fast') || lower.includes('quick')) keywords.push('Fast turnaround')
  if (lower.includes('warranty') || lower.includes('guarantee')) keywords.push('Warranty offered')
  
  return {
    overall,
    priceConfidence: overall === 'confident' ? 0.9 : overall === 'hesitant' ? 0.6 : 0.75,
    timelineConfidence: overall === 'confident' ? 0.85 : overall === 'hesitant' ? 0.55 : 0.7,
    keywords
  }
}

export default VoiceBidRecorder
