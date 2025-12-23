import { useState, useRef, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

export interface VoiceTranscriptionState {
  transcript: string
  interimTranscript: string
  isListening: boolean
  error: string | null
  isSupported: boolean
}

export interface VoiceTranscriptionActions {
  start: () => void
  stop: () => void
  reset: () => void
  setLanguage: (lang: string) => void
}

export function useVoiceTranscription(): VoiceTranscriptionState & VoiceTranscriptionActions {
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [language, setLanguage] = useState('en-US')
  const [isSupported, setIsSupported] = useState(false)
  
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (SpeechRecognition) {
        setIsSupported(true)
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = language

        recognitionRef.current.onstart = () => {
          setIsListening(true)
          setError(null)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current.onresult = (event: any) => {
          let final = ''
          let interim = ''

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript + ' '
            } else {
              interim += event.results[i][0].transcript
            }
          }

          if (final) {
            setTranscript(prev => prev + final)
          }
          setInterimTranscript(interim)
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          
          if (event.error === 'not-allowed') {
            setError('Microphone access denied. Please allow microphone access.')
            toast.error('Microphone access denied')
          } else if (event.error === 'no-speech') {
            // Ignore no-speech errors usually
          } else {
            setError(`Error: ${event.error}`)
          }
          setIsListening(false)
        }
      } else {
        setIsSupported(false)
        setError('Speech recognition is not supported in this browser.')
      }
    }
  }, []) // Initialize once

  // Update language dynamically
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language
    }
  }, [language])

  const start = useCallback(() => {
    if (!recognitionRef.current) return
    if (isListening) return

    try {
      setInterimTranscript('')
      recognitionRef.current.start()
    } catch (e) {
      console.error('Failed to start recognition:', e)
    }
  }, [isListening])

  const stop = useCallback(() => {
    if (!recognitionRef.current) return
    if (!isListening) return

    try {
      recognitionRef.current.stop()
    } catch (e) {
      console.error('Failed to stop recognition:', e)
    }
  }, [isListening])

  const reset = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
    setError(null)
    stop()
  }, [stop])

  return {
    transcript,
    interimTranscript,
    isListening,
    error,
    isSupported,
    start,
    stop,
    reset,
    setLanguage
  }
}
