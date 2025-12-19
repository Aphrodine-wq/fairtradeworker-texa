import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pause, X } from '@phosphor-icons/react'
import { useVoidStore } from '@/lib/void/store'
import { useVoidVoice } from '@/hooks/useVoidVoice'
import { useVoiceTranscription } from '@/hooks/useVoiceTranscription'
import { VoiceWaveform } from './VoiceWaveform'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { sanitizeString } from '@/lib/void/validation'
import '@/styles/void-voice.css'

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English' },
  { code: 'es-ES', name: 'Español' },
  { code: 'fr-FR', name: 'Français' },
  { code: 'de-DE', name: 'Deutsch' },
  { code: 'pt-BR', name: 'Português' },
  { code: 'it-IT', name: 'Italiano' },
]

export function VoiceRecordingDialog() {
  const { voiceState, setVoiceState, voiceTranscript } = useVoidStore()
  const { isRecording, isPaused, stopRecording, pauseRecording, resumeRecording, cancelRecording, startRecording } = useVoidVoice()
  const { transcript, confidence, language, setLanguage, start, stop } = useVoiceTranscription()

  // Auto-start recording when dialog opens
  useEffect(() => {
    if (voiceState === 'recording' && !isRecording) {
      startRecording()
      start()
    }
  }, [voiceState, isRecording, startRecording, start])

  // Update store transcript
  useEffect(() => {
    if (transcript) {
      useVoidStore.getState().setVoiceTranscript(transcript)
    }
  }, [transcript])

  // Stop transcription when recording stops
  useEffect(() => {
    if (!isRecording && voiceState !== 'recording') {
      stop()
    }
  }, [isRecording, voiceState, stop])

  if (voiceState !== 'recording' && voiceState !== 'processing') return null

  const handlePause = () => {
    if (isPaused) {
      resumeRecording()
      start()
    } else {
      pauseRecording()
      stop()
    }
  }

  const handleCancel = () => {
    stop()
    cancelRecording()
  }

  const handleStop = () => {
    stop()
    stopRecording()
    // State will change to 'processing' in the hook
  }

  return (
    <AnimatePresence>
      <div className="void-voice-dialog-overlay" onClick={handleCancel}>
        <motion.div
          className="void-voice-dialog"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <h2 className="text-xl font-semibold text-[var(--void-text)] mb-4">
              Voice Capture
            </h2>

            {/* Waveform Visualization */}
            <div className="mb-6">
              <VoiceWaveform isActive={isRecording && !isPaused} />
            </div>

            {/* Transcript Display */}
            <div className="mb-4 min-h-[60px] p-4 bg-[var(--void-surface-hover)] rounded-lg">
              <p className="text-sm text-[var(--void-text-muted)] mb-2">
                {isRecording && !isPaused ? 'Speaking... (release when done)' : isPaused ? 'Paused' : 'Processing...'}
              </p>
              <p className="text-sm text-[var(--void-text)]">
                {sanitizeString(transcript || voiceTranscript || 'Waiting for speech...', 10000)}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--void-text-muted)]">Confidence:</span>
                  <span className="text-xs font-semibold text-[var(--void-accent)]">
                    {Math.round(confidence * 100)}%
                  </span>
                </div>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                {isRecording && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePause}
                    className="flex items-center gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            </div>

            {/* Stop button (release to stop) */}
            {isRecording && (
              <Button
                onClick={handleStop}
                className="w-full bg-[var(--void-error)] text-white hover:bg-[var(--void-error)]/90"
              >
                Stop Recording
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
