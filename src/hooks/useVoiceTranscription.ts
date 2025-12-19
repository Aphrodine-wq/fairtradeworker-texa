import { useState, useRef, useEffect } from 'react'

export function useVoiceTranscription() {
  const [transcript, setTranscript] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [language, setLanguage] = useState('en-US')
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = language

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''
        let maxConfidence = 0

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcript = result[0].transcript
          const resultConfidence = result[0].confidence || 0

          if (result.isFinal) {
            finalTranscript += transcript + ' '
            maxConfidence = Math.max(maxConfidence, resultConfidence)
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript(finalTranscript || interimTranscript)
        setConfidence(maxConfidence || 0.9) // Default to 0.9 if no confidence provided
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
      }
    }
  }, [language])

  const start = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
      } catch (e) {
        // Already started
      }
    }
  }

  const stop = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        // Already stopped
      }
    }
  }

  const setLang = (lang: string) => {
    setLanguage(lang)
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang
    }
  }

  return {
    transcript,
    confidence,
    language,
    setLanguage: setLang,
    start,
    stop,
  }
}
