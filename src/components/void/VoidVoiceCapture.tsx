import { AnimatePresence } from 'framer-motion'
import { useVoidStore } from '@/lib/void/store'
import { VoicePermissionDialog } from './VoicePermissionDialog'
import { VoiceRecordingDialog } from './VoiceRecordingDialog'
import { VoiceValidationDialog } from './VoiceValidationDialog'
import type { User } from '@/lib/types'

interface VoidVoiceCaptureProps {
  user: User
}

export function VoidVoiceCapture({ user }: VoidVoiceCaptureProps) {
  const { voiceState } = useVoidStore()

  return (
    <AnimatePresence>
      {voiceState === 'permission-prompt' && <VoicePermissionDialog />}
      {(voiceState === 'recording' || voiceState === 'processing') && <VoiceRecordingDialog />}
      {(voiceState === 'validation' || voiceState === 'extracting') && (
        <VoiceValidationDialog user={user} />
      )}
    </AnimatePresence>
  )
}
