/**
 * VOID Voice Hub - Voice onboarding system with 4-step animation
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Microphone, CheckCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { VoidParticles } from './VoidParticles'
import type { VoiceRecordingState, ExtractedEntity } from '@/lib/void/types'

interface VoidVoiceHubProps {
  onComplete: (entities: ExtractedEntity[]) => void
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'syncing' | 'complete'

export function VoidVoiceHub({ onComplete }: VoidVoiceHubProps) {
  const [state, setState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const [entities, setEntities] = useState<ExtractedEntity[]>([])
  const [waveform, setWaveform] = useState<number[]>([])
  const [showParticles, setShowParticles] = useState(false)
  const [particlePosition, setParticlePosition] = useState({ x: 0, y: 0 })
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const hubRef = useRef<HTMLDivElement>(null)

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      // Audio visualization
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      analyser.fftSize = 256
      audioContextRef.current = audioContext
      analyserRef.current = analyser

      // Update waveform
      const updateWaveform = () => {
        if (analyserRef.current && state === 'listening') {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
          analyserRef.current.getByteFrequencyData(dataArray)
          setWaveform(Array.from(dataArray.slice(0, 20)))
          requestAnimationFrame(updateWaveform)
        }
      }
      updateWaveform()

      setState('listening')

      // Simulate speech recognition (replace with actual Whisper API)
      setTimeout(() => {
        setTranscript("John Smith, phone number 555-123-4567, needs a bathroom remodel, budget around 15K")
        setState('processing')
        
        // Simulate entity extraction
        setTimeout(() => {
          setEntities([
            { type: 'name', value: 'John Smith', confidence: 0.95 },
            { type: 'phone', value: '555-123-4567', confidence: 0.98 },
            { type: 'project_type', value: 'bathroom remodel', confidence: 0.92 },
            { type: 'budget', value: '15000', confidence: 0.88 },
          ])
          setState('syncing')
          
          // Simulate sync
          setTimeout(() => {
            setState('complete')
            // Trigger particle burst
            if (hubRef.current) {
              const rect = hubRef.current.getBoundingClientRect()
              setParticlePosition({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
              })
              setShowParticles(true)
            }
            setTimeout(() => {
              onComplete(entities)
              // Reset after delay
              setTimeout(() => {
                setState('idle')
                setTranscript('')
                setEntities([])
                setShowParticles(false)
                stream.getTracks().forEach(track => track.stop())
              }, 2000)
            }, 1500)
          }, 1000)
        }, 1500)
      }, 2000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopListening = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    setState('idle')
    setTranscript('')
    setEntities([])
  }

  return (
    <>
      <VoidParticles
        trigger={showParticles}
        x={particlePosition.x}
        y={particlePosition.y}
        onComplete={() => setShowParticles(false)}
      />
      <motion.div
        ref={hubRef}
        className="fixed bottom-8 right-8 z-40"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
      <div className={cn(
        "bg-black/90 backdrop-blur-xl rounded-2xl border border-[#00f0ff]/30 p-6 shadow-2xl",
        "min-w-[320px]"
      )}>
        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-4"
            >
              <motion.div
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#00f0ff] to-[#8b5cf6] flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Microphone size={32} weight="fill" className="text-white" />
              </motion.div>
              <div>
                <p className="text-white font-medium mb-2">Voice Onboarding</p>
                <p className="text-gray-400 text-sm">Tell me about your new client</p>
              </div>
              <Button
                onClick={startListening}
                className="bg-gradient-to-r from-[#00f0ff] to-[#8b5cf6] hover:from-[#00d0df] hover:to-[#7b4ce6] text-white"
              >
                Start Listening
              </Button>
            </motion.div>
          )}

          {state === 'listening' && (
            <motion.div
              key="listening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-4"
            >
              <motion.div
                className="relative w-20 h-20 mx-auto"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="absolute inset-0 rounded-full bg-[#00f0ff] opacity-30" />
                <div className="absolute inset-2 rounded-full bg-[#00f0ff] opacity-50" />
                <div className="absolute inset-4 rounded-full bg-[#00f0ff] flex items-center justify-center">
                  <Microphone size={24} weight="fill" className="text-white" />
                </div>
              </motion.div>
              <p className="text-white font-medium">Listening...</p>
              {/* Waveform */}
              <div className="flex items-end justify-center gap-1 h-12">
                {waveform.map((value, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-[#00f0ff] rounded-full"
                    style={{ height: `${(value / 255) * 40 + 4}px` }}
                    animate={{ height: `${(value / 255) * 40 + 4}px` }}
                    transition={{ duration: 0.1 }}
                  />
                ))}
              </div>
              <Button variant="outline" onClick={stopListening} className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                Stop
              </Button>
            </motion.div>
          )}

          {state === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-4"
            >
              <motion.div
                className="w-20 h-20 mx-auto rounded-full bg-[#00f0ff]/20 flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <div className="w-12 h-12 rounded-full border-4 border-[#00f0ff] border-t-transparent" />
              </motion.div>
              <p className="text-white font-medium">Analyzing conversation...</p>
              {transcript && (
                <p className="text-gray-400 text-sm italic">"{transcript}"</p>
              )}
            </motion.div>
          )}

          {state === 'syncing' && (
            <motion.div
              key="syncing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#00f0ff]/20 flex items-center justify-center">
                  <Microphone size={20} weight="fill" className="text-[#00f0ff]" />
                </div>
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ════►
                </motion.div>
                <div className="w-12 h-12 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
              </div>
              <p className="text-white font-medium text-center">Creating lead: {entities.find(e => e.type === 'name')?.value || 'Customer'}</p>
              <div className="space-y-2">
                {entities.map((entity, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <CheckCircle size={16} weight="fill" className="text-[#10b981]" />
                    <span className="text-gray-400 capitalize">{entity.type.replace('_', ' ')}:</span>
                    <span className="text-white">{entity.value}</span>
                  </motion.div>
                ))}
              </div>
              <p className="text-gray-500 text-xs text-center">Syncing to CRM...</p>
            </motion.div>
          )}

          {state === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center space-y-4"
            >
              <motion.div
                className="w-20 h-20 mx-auto rounded-full bg-[#10b981]/20 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <CheckCircle size={40} weight="fill" className="text-[#10b981]" />
              </motion.div>
              <div>
                <p className="text-white font-bold text-lg">
                  {entities.find(e => e.type === 'name')?.value || 'Customer'} added to Leads!
                </p>
                <p className="text-gray-400 text-sm mt-1">Successfully synced to CRM</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-[#00f0ff]/30 text-white hover:bg-[#00f0ff]/10"
                  onClick={() => {
                    // Navigate to lead
                  }}
                >
                  View Lead
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-[#00f0ff]/30 text-white hover:bg-[#00f0ff]/10"
                  onClick={() => {
                    setState('idle')
                    setTranscript('')
                    setEntities([])
                  }}
                >
                  Add Another
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
    </>
  )
}
