/**
 * Hook for Buddy voice commands using Web Speech API
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useVoidStore } from '@/lib/void/store'

interface VoiceCommand {
  pattern: RegExp
  action: (matches: RegExpMatchArray) => void
  description: string
}

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onstart: ((event: Event) => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult
  length: number
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
  length: number
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

export function useBuddyVoiceCommands(onCommandRecognized?: (command: string) => void) {
  const [isListening, setIsListening] = useState(false)
  const [recognizedText, setRecognizedText] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const { openWindow, addBuddyMessage, setBuddyEmotion } = useVoidStore()

  // Define voice command patterns
  const commands: VoiceCommand[] = [
    {
      pattern: /open\s+(.+)/i,
      action: (matches) => {
        const moduleName = matches[1].toLowerCase()
        const moduleMap: Record<string, string> = {
          'livewire': 'livewire',
          'face link': 'facelink',
          'blueprint': 'blueprint',
          'scope': 'scope',
          'dispatch': 'dispatch',
          'reputation': 'reputation',
          'cashflow': 'cashflow',
          'vault': 'vault',
          'funnel': 'funnel',
          'milestones': 'milestones',
          'settings': 'settings',
          'filesystem': 'filesystem',
        }
        const moduleId = moduleMap[moduleName] || moduleName
        openWindow(moduleId)
        addBuddyMessage({
          id: `voice-${Date.now()}`,
          message: `Opening ${moduleName}...`,
          emotion: 'happy',
          timestamp: Date.now(),
          priority: 'low',
        })
      },
      description: 'Open [module name]',
    },
    {
      pattern: /show\s+(.+)/i,
      action: (matches) => {
        const infoType = matches[1].toLowerCase()
        addBuddyMessage({
          id: `voice-${Date.now()}`,
          message: `Showing ${infoType} information...`,
          emotion: 'thinking',
          timestamp: Date.now(),
          priority: 'low',
        })
      },
      description: 'Show [information type]',
    },
    {
      pattern: /what'?s?\s+my\s+(.+)/i,
      action: (matches) => {
        const statType = matches[1].toLowerCase()
        addBuddyMessage({
          id: `voice-${Date.now()}`,
          message: `Checking your ${statType}...`,
          emotion: 'thinking',
          timestamp: Date.now(),
          priority: 'low',
        })
      },
      description: "What's my [stat type]",
    },
    {
      pattern: /help\s+me\s+with\s+(.+)/i,
      action: (matches) => {
        const task = matches[1]
        addBuddyMessage({
          id: `voice-${Date.now()}`,
          message: `I'll help you with ${task}. Let me think...`,
          emotion: 'thinking',
          timestamp: Date.now(),
          priority: 'medium',
        })
      },
      description: 'Help me with [task]',
    },
  ]

  const processCommand = useCallback((text: string) => {
    setRecognizedText(text)
    
    // Try to match against command patterns
    for (const command of commands) {
      const match = text.match(command.pattern)
      if (match) {
        command.action(match)
        onCommandRecognized?.(text)
        return true
      }
    }
    
    // No command matched
    addBuddyMessage({
      id: `voice-${Date.now()}`,
      message: `I heard "${text}" but didn't understand that command. Try "Open [module]" or "Help me with [task]"`,
      emotion: 'thinking',
      timestamp: Date.now(),
      priority: 'low',
    })
    return false
  }, [commands, onCommandRecognized, addBuddyMessage])

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      addBuddyMessage({
        id: `voice-error-${Date.now()}`,
        message: 'Voice recognition is not supported in your browser.',
        emotion: 'error',
        timestamp: Date.now(),
        priority: 'high',
      })
      return
    }

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognitionClass) {
      addBuddyMessage({
        id: `voice-error-${Date.now()}`,
        message: 'Voice recognition is not supported in your browser.',
        emotion: 'error',
        timestamp: Date.now(),
        priority: 'high',
      })
      return
    }
    const recognition = new SpeechRecognitionClass() as SpeechRecognition
    
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setBuddyEmotion('thinking')
      addBuddyMessage({
        id: `voice-start-${Date.now()}`,
        message: '🎤 Listening...',
        emotion: 'thinking',
        timestamp: Date.now(),
        priority: 'low',
      })
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      processCommand(transcript)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      setBuddyEmotion('error')
      addBuddyMessage({
        id: `voice-error-${Date.now()}`,
        message: `Voice recognition error: ${event.error}`,
        emotion: 'error',
        timestamp: Date.now(),
        priority: 'high',
      })
      setTimeout(() => setBuddyEmotion('neutral'), 3000)
    }

    recognition.onend = () => {
      setIsListening(false)
      setBuddyEmotion('neutral')
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [processCommand, addBuddyMessage, setBuddyEmotion])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
    setBuddyEmotion('neutral')
  }, [setBuddyEmotion])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  return {
    isListening,
    recognizedText,
    startListening,
    stopListening,
    commands: commands.map(c => c.description),
  }
}
