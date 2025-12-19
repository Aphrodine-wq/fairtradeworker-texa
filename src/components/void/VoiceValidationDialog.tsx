import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVoidStore } from '@/lib/void/store'
import { useVoiceExtraction } from '@/hooks/useVoiceExtraction'
import { VoiceEntityEditor } from './VoiceEntityEditor'
import { useLocalKV } from '@/hooks/useLocalKV'
import type { CRMCustomer } from '@/lib/types'
import { toast } from 'sonner'
import type { User } from '@/lib/types'

interface VoiceValidationDialogProps {
  user: User
}

export function VoiceValidationDialog({ user }: VoiceValidationDialogProps) {
  const {
    voiceState,
    voiceTranscript,
    extractedEntities,
    setVoiceState,
    setExtractedEntities,
    voiceRecording,
  } = useVoidStore()
  const { extractEntities, isExtracting } = useVoiceExtraction()
  const [customers, setCustomers] = useLocalKV<CRMCustomer[]>('crm-customers', [])

  // Auto-extract entities when processing
  useEffect(() => {
    if (voiceState === 'processing' && voiceTranscript && !extractedEntities) {
      extractEntities(voiceTranscript, 'en-US').then((entities) => {
        setExtractedEntities(entities)
        setVoiceState('validation')
      })
    }
  }, [voiceState, voiceTranscript, extractedEntities, extractEntities, setExtractedEntities, setVoiceState])

  if (voiceState !== 'validation' && voiceState !== 'extracting') return null

  const handleSave = async (entities: ExtractedEntities) => {
    try {
      // Create lead from extracted entities
      const newCustomer: CRMCustomer = {
        id: `customer-${Date.now()}-${Math.random()}`,
        contractorId: user.id,
        name: String(entities.name?.value || 'Unknown'),
        email: entities.email?.value ? String(entities.email.value) : undefined,
        phone: entities.phone?.value ? String(entities.phone.value) : undefined,
        invitedVia: 'email',
        invitedAt: new Date().toISOString(),
        status: 'lead',
        source: 'voice_capture' as any,
        lifetimeValue: 0,
        lastContact: new Date().toISOString(),
        tags: entities.urgency?.value ? [entities.urgency.value] : [],
        notes: entities.project?.value
          ? `Project: ${entities.project.value}${entities.budget?.value ? ` | Budget: $${entities.budget.value}` : ''}`
          : undefined,
        createdAt: new Date().toISOString(),
      }

      // TODO: Upload voice recording to Supabase Storage
      // For now, just store in local state
      setCustomers([...customers, newCustomer])

      // Show success
      toast.success('Lead added successfully!', {
        description: `${newCustomer.name} has been added to your leads.`,
      })

      // Reset voice state
      setVoiceState('complete')
      setTimeout(() => {
        setVoiceState('idle')
        setExtractedEntities(null)
        useVoidStore.getState().setVoiceTranscript('')
        useVoidStore.getState().setVoiceRecording(null)
      }, 1000)
    } catch (error) {
      console.error('Failed to save lead:', error)
      toast.error('Failed to save lead. Please try again.')
    }
  }

  const handleCancel = () => {
    setVoiceState('idle')
    setExtractedEntities(null)
    useVoidStore.getState().setVoiceTranscript('')
    useVoidStore.getState().setVoiceRecording(null)
  }

  const handleAddMore = () => {
    setVoiceState('idle')
    setExtractedEntities(null)
    useVoidStore.getState().setVoiceTranscript('')
    // Keep recording state so user can record again
  }

  if (voiceState === 'extracting' || isExtracting) {
    return (
      <div className="void-voice-dialog-overlay">
        <motion.div
          className="void-voice-dialog"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-[var(--void-accent)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[var(--void-text-muted)]">
              Extracting entities...
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!extractedEntities) return null

  return (
    <div className="void-voice-dialog-overlay" onClick={handleCancel}>
      <div onClick={(e) => e.stopPropagation()}>
        <VoiceEntityEditor
          entities={extractedEntities}
          onSave={handleSave}
          onCancel={handleCancel}
          onAddMore={handleAddMore}
        />
      </div>
    </div>
  )
}
