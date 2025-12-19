import { useState, useRef, useCallback, useEffect } from 'react'
import { useVoidStore } from '@/lib/void/store'
import { sanitizeString } from '@/lib/void/validation'

const MAX_RECORDING_DURATION = 5 * 60 * 1000 // 5 minutes
const MAX_BLOB_SIZE = 10 * 1024 * 1024 // 10MB

export function useVoidVoice() {
  const { setVoiceState, setVoiceRecording, setVoiceTranscript } = useVoidStore()
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null) // SpeechRecognition
  const recordingStartTimeRef = useRef<number>(0)
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        // Sanitize transcript to prevent XSS
        const sanitized = sanitizeString(transcript, 10000)
        setVoiceTranscript(sanitized)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'no-speech') {
          // Ignore no-speech errors
          return
        }
        stopRecording()
      }
    }
  }, [setVoiceTranscript])

  const startRecording = useCallback(async () => {
    try {
      // Validate permission first
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices not supported')
      }

      // Request permission with constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Limit sample rate for security
        },
      })
      
      // Validate stream
      if (!stream || stream.getAudioTracks().length === 0) {
        throw new Error('No audio track available')
      }
      
      audioStreamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      recordingStartTimeRef.current = Date.now()

      // Set duration limit
      durationTimerRef.current = setTimeout(() => {
        if (isRecording) {
          stopRecording()
        }
      }, MAX_RECORDING_DURATION)

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
          
          // Check total size
          const totalSize = chunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0)
          if (totalSize > MAX_BLOB_SIZE) {
            console.warn('[Voice] Recording size limit reached')
            stopRecording()
          }
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        
        // Validate blob size
        if (blob.size > MAX_BLOB_SIZE) {
          console.error('[Voice] Recording too large, discarding')
          setVoiceRecording(null)
        } else {
          setVoiceRecording(blob)
        }
        
        stream.getTracks().forEach(track => track.stop())
        
        if (durationTimerRef.current) {
          clearTimeout(durationTimerRef.current)
          durationTimerRef.current = null
        }
      }

      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      setIsPaused(false)

      // Start speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch (e) {
          // Already started, ignore
        }
      }

      setVoiceState('recording')
    } catch (error) {
      console.error('[Voice] Failed to start recording:', error)
      setVoiceState('idle')
      
      // Clean up on error
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop())
        audioStreamRef.current = null
      }
      if (durationTimerRef.current) {
        clearTimeout(durationTimerRef.current)
        durationTimerRef.current = null
      }
      
      throw error
    }
  }, [setVoiceState, setVoiceRecording, isRecording])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      // Clear duration timer
      if (durationTimerRef.current) {
        clearTimeout(durationTimerRef.current)
        durationTimerRef.current = null
      }
      
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)

      // Stop speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // Already stopped, ignore
        }
      }

      // Stop audio stream
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => {
          track.stop()
          track.enabled = false
        })
        audioStreamRef.current = null
      }

      setVoiceState('processing')
    }
  }, [isRecording, setVoiceState])

  // Listen for global stop event (from Spacebar release)
  useEffect(() => {
    const handleStop = () => {
      if (isRecording) {
        stopRecording()
      }
    }

    window.addEventListener('void-voice-stop', handleStop)
    return () => window.removeEventListener('void-voice-stop', handleStop)
  }, [isRecording, stopRecording])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isRecording, isPaused])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }
    }
  }, [isRecording, isPaused])

  const cancelRecording = useCallback(() => {
    stopRecording()
    setVoiceRecording(null)
    setVoiceTranscript('')
    setVoiceState('idle')
  }, [stopRecording, setVoiceRecording, setVoiceTranscript, setVoiceState])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationTimerRef.current) {
        clearTimeout(durationTimerRef.current)
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => {
          track.stop()
          track.enabled = false
        })
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // Ignore
        }
      }
    }
  }, [isRecording])

  return {
    isRecording,
    isPaused,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
  }
}
