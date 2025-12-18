import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { 
  Microphone, MicrophoneSlash, Stop, Waveform, 
  EnvelopeSimple, ChatText, Plus, Spinner, CheckCircle,
  User, Phone, At
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { useLocalKV as useKV } from '@/hooks/useLocalKV'
import type { User as UserType, CRMCustomer } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CentralVoiceHubProps {
  user: UserType
  onCustomerAdded?: (customer: CRMCustomer) => void
  position?: { x: number; y: number }
  onDragEnd?: (position: { x: number; y: number }) => void
  isDraggable?: boolean
}

type InputMode = 'voice' | 'text'
type VoiceState = 'idle' | 'listening' | 'processing' | 'success'

export function CentralVoiceHub({ user, onCustomerAdded, position, onDragEnd, isDraggable = true }: CentralVoiceHubProps) {
  const [customers, setCustomers] = useKV<CRMCustomer[]>("crm-customers", [])
  const [inputMode, setInputMode] = useState<InputMode>('voice')
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const [enableEmail, setEnableEmail] = useState(true)
  const [enableSMS, setEnableSMS] = useState(true)
  
  // Text input state
  const [textInput, setTextInput] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startListening = useCallback(async () => {
    try {
      // If already listening, don't start again
      if (voiceState === 'listening' || voiceState === 'processing') {
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000 // Optimize for speech recognition
        } 
      })
      
      streamRef.current = stream
      audioChunksRef.current = []
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm'
      })
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach(track => track.stop())
        await processAudio(blob)
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(100)
      setVoiceState('listening')
      setTranscript('')
      
    } catch (error) {
      console.error('Failed to start recording:', error)
      toast.error('Could not access microphone. Please check permissions.')
      setVoiceState('idle')
    }
  }, [])

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && voiceState === 'listening') {
      mediaRecorderRef.current.stop()
      setVoiceState('processing')
    }
  }, [voiceState])

  const processAudio = async (blob: Blob) => {
    try {
      // Convert to base64
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1]
          resolve(base64)
        }
        reader.readAsDataURL(blob)
      })
      
      const base64Audio = await base64Promise
      
      // Simulate Whisper transcription (in production, call actual API)
      // For demo, we'll simulate extracted data
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const simulatedTranscript = "New customer John Smith, phone 555-123-4567, email john@example.com, needs kitchen remodel quote"
      setTranscript(simulatedTranscript)
      
      // Extract customer data from transcript
      const extractedCustomer = extractCustomerFromTranscript(simulatedTranscript)
      
      if (extractedCustomer) {
        addCustomer(extractedCustomer)
        setVoiceState('success')
        setTimeout(() => setVoiceState('idle'), 2000)
      } else {
        toast.error('Could not extract customer info. Try again or use text input.')
        setVoiceState('idle')
      }
      
    } catch (error) {
      console.error('Audio processing error:', error)
      toast.error('Failed to process audio')
      setVoiceState('idle')
    }
  }

  const extractCustomerFromTranscript = (text: string): Partial<CRMCustomer> | null => {
    // Simple extraction patterns (in production, use AI)
    const phoneMatch = text.match(/(\d{3}[-.]?\d{3}[-.]?\d{4})/)?.[1]
    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)?.[1]
    const nameMatch = text.match(/(?:customer|client|name[:\s]+)?([A-Z][a-z]+ [A-Z][a-z]+)/)?.[1]
    
    if (!nameMatch && !phoneMatch && !emailMatch) return null
    
    return {
      name: nameMatch || 'New Customer',
      phone: phoneMatch,
      email: emailMatch,
      notes: text
    }
  }

  const addCustomer = (data: Partial<CRMCustomer>) => {
    const newCustomer: CRMCustomer = {
      id: `customer-${Date.now()}`,
      contractorId: user.id,
      name: data.name || 'New Customer',
      email: data.email || '',
      phone: data.phone || '',
      status: 'lead',
      source: 'voice-intake',
      lifetimeValue: 0,
      notes: data.notes || '',
      tags: [],
      invitedAt: new Date().toISOString(),
      lastContact: new Date().toISOString()
    }
    
    setCustomers((current) => [...(current || []), newCustomer])
    toast.success(`${newCustomer.name} added to CRM!`)
    onCustomerAdded?.(newCustomer)
  }

  const handleTextSubmit = () => {
    if (!textInput.name.trim()) {
      toast.error('Please enter a customer name')
      return
    }
    
    addCustomer({
      name: textInput.name,
      phone: textInput.phone,
      email: textInput.email,
      notes: textInput.notes
    })
    
    setTextInput({ name: '', phone: '', email: '', notes: '' })
  }

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (onDragEnd && position) {
      const newX = position.x + info.offset.x
      const newY = position.y + info.offset.y
      onDragEnd({ x: newX, y: newY })
    }
  }, [onDragEnd, position])

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        x: position?.x || 0,
        y: position?.y || 0
      }}
      transition={{ duration: 0.5, type: 'spring' }}
      drag={isDraggable}
      dragMomentum={false}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      style={{
        cursor: isDraggable ? 'grab' : 'default',
        position: position ? 'absolute' : 'relative',
        left: position ? '50%' : 'auto',
        top: position ? '50%' : 'auto',
        zIndex: 30
      }}
      whileDrag={{ 
        scale: 1.1, 
        zIndex: 40,
        cursor: 'grabbing'
      }}
    >
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 via-emerald-500/20 to-cyan-500/20 blur-3xl" />
      
      {/* Main hub container - smaller to fit better */}
      <div className="relative z-10 w-[200px] h-[200px] rounded-full border border-cyan-500/30 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center p-4 shadow-2xl shadow-cyan-500/10">
        
        {/* Mode toggle */}
        <div className="absolute top-3 flex gap-1.5">
          <Button
            size="sm"
            variant={inputMode === 'voice' ? 'default' : 'outline'}
            onClick={() => setInputMode('voice')}
            className={cn(
              "rounded-full transition-all text-xs px-2 py-1 h-7",
              inputMode === 'voice' ? 'bg-cyan-600 hover:bg-cyan-700' : 'border-cyan-500/30 hover:bg-cyan-500/10'
            )}
          >
            <Microphone size={12} className="mr-0.5" />
            Voice
          </Button>
          <Button
            size="sm"
            variant={inputMode === 'text' ? 'default' : 'outline'}
            onClick={() => setInputMode('text')}
            className={cn(
              "rounded-full transition-all text-xs px-2 py-1 h-7",
              inputMode === 'text' ? 'bg-cyan-600 hover:bg-cyan-700' : 'border-cyan-500/30 hover:bg-cyan-500/10'
            )}
          >
            <ChatText size={12} className="mr-0.5" />
            Text
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {inputMode === 'voice' ? (
            <motion.div
              key="voice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-4"
            >
              {/* Mic button - smaller */}
              <motion.button
                onClick={voiceState === 'listening' ? stopListening : startListening}
                disabled={voiceState === 'processing'}
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center transition-all",
                  voiceState === 'idle' && "bg-cyan-600 hover:bg-cyan-500 hover:scale-105",
                  voiceState === 'listening' && "bg-red-500 animate-pulse",
                  voiceState === 'processing' && "bg-yellow-600",
                  voiceState === 'success' && "bg-green-500"
                )}
                whileHover={{ scale: voiceState === 'idle' ? 1.05 : 1 }}
                whileTap={{ scale: 0.95 }}
              >
                {voiceState === 'idle' && <Microphone size={20} weight="fill" className="text-white" />}
                {voiceState === 'listening' && <Stop size={20} weight="fill" className="text-white" />}
                {voiceState === 'processing' && <Spinner size={20} className="text-white animate-spin" />}
                {voiceState === 'success' && <CheckCircle size={20} weight="fill" className="text-white" />}
              </motion.button>

              {/* Status text */}
              <p className="text-white/80 text-xs text-center">
                {voiceState === 'idle' && 'Tap to add customer by voice'}
                {voiceState === 'listening' && 'Listening... Tap to stop'}
                {voiceState === 'processing' && 'Processing with Whisper...'}
                {voiceState === 'success' && 'Customer added!'}
              </p>

              {/* Waveform visualization */}
              {voiceState === 'listening' && (
                <motion.div 
                  className="flex gap-0.5 h-6 items-end"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {[...Array(7)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-0.5 bg-cyan-400 rounded-full"
                      animate={{
                        height: [4, 16, 4],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </motion.div>
              )}

              {/* Transcript preview - smaller */}
              {transcript && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-[160px] p-1.5 rounded-lg bg-white/5 border border-white/10"
                >
                  <p className="text-white/60 text-[10px] leading-tight">{transcript}</p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full space-y-2"
            >
              <div className="space-y-1.5">
                <div className="relative">
                  <User size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/40" />
                  <Input
                    placeholder="Customer name"
                    value={textInput.name}
                    onChange={(e) => setTextInput(prev => ({ ...prev, name: e.target.value }))}
                    className="pl-7 h-8 text-xs bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="relative">
                  <Phone size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/40" />
                  <Input
                    placeholder="Phone number"
                    value={textInput.phone}
                    onChange={(e) => setTextInput(prev => ({ ...prev, phone: e.target.value }))}
                    className="pl-7 h-8 text-xs bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="relative">
                  <At size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/40" />
                  <Input
                    placeholder="Email address"
                    value={textInput.email}
                    onChange={(e) => setTextInput(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-7 h-8 text-xs bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
              </div>
              <Button 
                onClick={handleTextSubmit}
                className="w-full h-8 text-xs bg-cyan-600 hover:bg-cyan-500"
              >
                <Plus size={12} className="mr-1" />
                Add Customer
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Addon toggles */}
        <div className="absolute bottom-3 flex gap-3">
            <div className="flex items-center gap-1.5">
              <Switch
                id="email-addon"
                checked={enableEmail}
                onCheckedChange={setEnableEmail}
                className="data-[state=checked]:bg-cyan-600 scale-75"
              />
              <Label htmlFor="email-addon" className="text-white/60 text-[10px] flex items-center gap-0.5">
                <EnvelopeSimple size={10} />
                Email
              </Label>
            </div>
            <div className="flex items-center gap-1.5">
              <Switch
                id="sms-addon"
                checked={enableSMS}
                onCheckedChange={setEnableSMS}
                className="data-[state=checked]:bg-cyan-600 scale-75"
              />
              <Label htmlFor="sms-addon" className="text-white/60 text-[10px] flex items-center gap-0.5">
                <ChatText size={10} />
                SMS
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Pulsing ring effect when listening */}
      {voiceState === 'listening' && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-cyan-400/50"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.3, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-cyan-400/30"
            initial={{ scale: 1, opacity: 0.3 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
        </>
      )}
    </motion.div>
  )
}
