import { useState, useRef, useCallback, useEffect } from 'react'
import { useVoidStore } from '@/lib/void/store'

export function useVoidVoice() {
  const { setVoiceState, setVoiceRecording, setVoiceTranscript } = useVoidStore()
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null) // SpeechRecognition

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
        setVoiceTranscript(transcript)
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioStreamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setVoiceRecording(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
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
      console.error('Failed to start recording:', error)
      setVoiceState('idle')
      throw error
    }
  }, [setVoiceState, setVoiceRecording])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
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
        audioStreamRef.current.getTracks().forEach(track => track.stop())
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
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop())
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
