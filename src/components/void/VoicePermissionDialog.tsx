import { motion, AnimatePresence } from 'framer-motion'
import { Microphone, Gear } from '@phosphor-icons/react'
import { useVoidStore } from '@/lib/void/store'
import { Button } from '@/components/ui/button'
import '@/styles/void-voice.css'

export function VoicePermissionDialog() {
  const { voiceState, setVoiceState, setVoicePermission } = useVoidStore()

  if (voiceState !== 'permission-prompt') return null

  const handleAllow = async () => {
    try {
      // Validate media devices support
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices not supported')
      }

      // Request permission with security constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      })
      
      // Validate stream
      if (!stream || stream.getAudioTracks().length === 0) {
        throw new Error('No audio track available')
      }
      
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => {
        track.stop()
        track.enabled = false
      })
      setVoicePermission('granted')
      setVoiceState('idle')
    } catch (error) {
      console.error('[Voice] Permission error:', error)
      setVoicePermission('denied')
      setVoiceState('idle')
    }
  }

  const handleDeny = () => {
    setVoicePermission('denied')
    setVoiceState('idle')
  }

  const handleSettings = () => {
    // Open browser settings (Chrome/Edge)
    if (navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('Edge')) {
      window.open('chrome://settings/content/microphone', '_blank')
    } else {
      // Fallback: Show instructions
      alert('Please enable microphone access in your browser settings.')
    }
    setVoiceState('idle')
  }

  return (
    <AnimatePresence>
      <div className="void-voice-dialog-overlay" onClick={handleDeny}>
        <motion.div
          className="void-voice-dialog"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[var(--void-accent)]/20 flex items-center justify-center">
                <Microphone className="w-8 h-8 text-[var(--void-accent)]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--void-text)] mb-1">
                  VOID Voice Access
                </h2>
                <p className="text-sm text-[var(--void-text-muted)]">
                  Allow microphone access?
                </p>
              </div>
            </div>

            <div className="mb-6 space-y-2">
              <p className="text-sm text-[var(--void-text)]">
                Audio processes in real-time.
              </p>
              <p className="text-sm text-[var(--void-text-muted)]">
                No storage without consent.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleSettings}
                className="flex items-center gap-2"
              >
                <Gear className="w-4 h-4" />
                Settings
              </Button>
              <Button variant="outline" onClick={handleDeny}>
                Deny
              </Button>
              <Button onClick={handleAllow} className="bg-[var(--void-accent)] text-[var(--void-bg)]">
                Allow
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
