import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Microphone, MicrophoneSlash, Stop, Spinner, CheckCircle,
  User, Phone, At, Building, Note, FloppyDisk, ArrowsClockwise, List
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useLocalKV as useKV } from '@/hooks/useLocalKV'
import type { User as UserType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CapturedLead {
  id: string
  name: string
  phone?: string
  email?: string
  company?: string
  notes?: string
  source: string
  priority: 'low' | 'medium' | 'high'
  status: 'new' | 'contacted' | 'qualified' | 'converted'
  capturedAt: string
  syncedToCRM: boolean
}

interface LeadCaptureMenuProps {
  user: UserType
  onLeadCaptured?: (lead: CapturedLead) => void
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'success'
type ViewMode = 'capture' | 'list'

export function LeadCaptureMenu({ user, onLeadCaptured }: LeadCaptureMenuProps) {
  const [leads, setLeads] = useKV<CapturedLead[]>("captured-leads", [])
  const [viewMode, setViewMode] = useState<ViewMode>('capture')
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    notes: '',
    source: 'voice',
    priority: 'medium' as 'low' | 'medium' | 'high'
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
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
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const simulatedTranscript = "New lead John Smith, phone 555-123-4567, email john@example.com, company ABC Construction, needs roofing quote"
      setTranscript(simulatedTranscript)
      
      const extracted = extractLeadFromTranscript(simulatedTranscript)
      if (extracted) {
        setFormData(prev => ({
          ...prev,
          name: extracted.name || prev.name,
          phone: extracted.phone || prev.phone,
          email: extracted.email || prev.email,
          company: extracted.company || prev.company,
          notes: extracted.notes || prev.notes,
        }))
        setVoiceState('success')
        setTimeout(() => setVoiceState('idle'), 2000)
      } else {
        toast.error('Could not extract lead info. Please use manual entry.')
        setVoiceState('idle')
      }
    } catch (error) {
      console.error('Audio processing error:', error)
      toast.error('Failed to process audio')
      setVoiceState('idle')
    }
  }

  const extractLeadFromTranscript = (text: string): Partial<CapturedLead> | null => {
    const phoneMatch = text.match(/(\d{3}[-.]?\d{3}[-.]?\d{4})/)?.[1]
    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)?.[1]
    const nameMatch = text.match(/(?:lead|customer|name[:\s]+)?([A-Z][a-z]+ [A-Z][a-z]+)/)?.[1]
    const companyMatch = text.match(/(?:company[:\s]+)?([A-Z][a-zA-Z\s]+(?:Construction|Inc|LLC|Corp)?)/)?.[1]
    
    if (!nameMatch && !phoneMatch && !emailMatch) return null
    
    return {
      name: nameMatch || 'New Lead',
      phone: phoneMatch,
      email: emailMatch,
      company: companyMatch,
      notes: text
    }
  }

  const handleSave = useCallback(() => {
    if (!formData.name.trim()) {
      toast.error('Please enter a lead name')
      return
    }
    
    const newLead: CapturedLead = {
      id: `lead-${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      company: formData.company,
      notes: formData.notes,
      source: formData.source,
      priority: formData.priority,
      status: 'new',
      capturedAt: new Date().toISOString(),
      syncedToCRM: false
    }
    
    setLeads((current) => [...(current || []), newLead])
    toast.success('Lead captured successfully!')
    onLeadCaptured?.(newLead)
    
    // Reset form
    setFormData({
      name: '',
      phone: '',
      email: '',
      company: '',
      notes: '',
      source: 'voice',
      priority: 'medium'
    })
  }, [formData, setLeads, onLeadCaptured])

  const handleSyncToCRM = useCallback(() => {
    const unsyncedLeads = (leads || []).filter(lead => !lead.syncedToCRM)
    if (unsyncedLeads.length === 0) {
      toast.info('All leads are already synced')
      return
    }
    
    // Simulate sync
    setLeads((current) => 
      (current || []).map(lead => 
        unsyncedLeads.some(u => u.id === lead.id) 
          ? { ...lead, syncedToCRM: true }
          : lead
      )
    )
    toast.success(`Synced ${unsyncedLeads.length} lead(s) to CRM`)
  }, [leads, setLeads])

  return (
    <motion.div
      className="relative w-full max-w-2xl mx-auto p-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* Glass morphism container */}
      <div className={cn(
        "glass-card rounded-2xl p-6 space-y-6",
        "backdrop-blur-[12px]",
        "shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(255,255,255,0.04)]"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black dark:text-white">Lead Capture</h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(viewMode === 'capture' ? 'list' : 'capture')}
              className="text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10"
            >
              {viewMode === 'capture' ? <List size={20} /> : <Microphone size={20} />}
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === 'capture' ? (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Voice Record Button */}
              <motion.button
                onClick={voiceState === 'listening' ? stopListening : startListening}
                disabled={voiceState === 'processing'}
                className={cn(
                  "w-full py-4 rounded-xl flex items-center justify-center gap-3 transition-all",
                  "bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20",
                  voiceState === 'listening' && "bg-red-500/20 animate-pulse",
                  voiceState === 'processing' && "bg-yellow-500/20",
                  voiceState === 'success' && "bg-green-500/20"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {voiceState === 'idle' && <Microphone size={24} className="text-black dark:text-white" />}
                {voiceState === 'listening' && <Stop size={24} className="text-red-500" />}
                {voiceState === 'processing' && <Spinner size={24} className="text-yellow-500 animate-spin" />}
                {voiceState === 'success' && <CheckCircle size={24} className="text-green-500" weight="fill" />}
                <span className="text-black dark:text-white font-medium">
                  {voiceState === 'idle' && 'Tap to Record Lead'}
                  {voiceState === 'listening' && 'Listening... Tap to Stop'}
                  {voiceState === 'processing' && 'Processing...'}
                  {voiceState === 'success' && 'Lead Captured!'}
                </span>
              </motion.button>

              {/* Transcript */}
              {transcript && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-black/5 dark:bg-white/5"
                >
                  <p className="text-sm text-black/70 dark:text-white/70">{transcript}</p>
                </motion.div>
              )}

              {/* Form Fields - Tighter, organized layout */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileFocus={{ scale: 1.01 }}
                  className="space-y-2"
                >
                  <Label htmlFor="name" className="text-black dark:text-white flex items-center gap-2">
                    <User size={16} />
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Lead name"
                    className="bg-white/50 dark:bg-black/50 border-0 focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-all"
                  />
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="space-y-2"
                >
                  <Label htmlFor="phone" className="text-black dark:text-white flex items-center gap-2">
                    <Phone size={16} />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone number"
                    className="bg-white/50 dark:bg-black/50 border-0 focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-all"
                  />
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="space-y-2"
                >
                  <Label htmlFor="email" className="text-black dark:text-white flex items-center gap-2">
                    <At size={16} />
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email address"
                    className="bg-white/50 dark:bg-black/50 border-0 focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-all"
                  />
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="space-y-2"
                >
                  <Label htmlFor="company" className="text-black dark:text-white flex items-center gap-2">
                    <Building size={16} />
                    Company
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Company name"
                    className="bg-white/50 dark:bg-black/50 border-0 focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-all"
                  />
                </motion.div>
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                className="space-y-2"
              >
                <Label htmlFor="notes" className="text-black dark:text-white flex items-center gap-2">
                  <Note size={16} />
                  Notes
                </Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  rows={3}
                  className={cn(
                    "w-full p-3 rounded-lg resize-none transition-all",
                    "bg-white/50 dark:bg-black/50",
                    "border-0 focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20",
                    "text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40"
                  )}
                />
              </motion.div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 transition-all"
                  >
                    <FloppyDisk size={18} className="mr-2" />
                    Save Lead
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    onClick={handleSyncToCRM}
                    className="flex-1 bg-white/50 dark:bg-black/50 border-0 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white transition-all"
                  >
                    <ArrowsClockwise size={18} className="mr-2" />
                    Sync to CRM
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  Captured Leads ({leads?.length || 0})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSyncToCRM}
                  className="text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10"
                >
                  <ArrowsClockwise size={16} className="mr-1" />
                  Sync All
                </Button>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(!leads || leads.length === 0) ? (
                  <p className="text-center text-black/60 dark:text-white/60 py-8">
                    No leads captured yet
                  </p>
                ) : (
                  leads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      className={cn(
                        "p-4 rounded-lg transition-all",
                        "bg-white/50 dark:bg-black/50",
                        "hover:bg-white/70 dark:hover:bg-black/70"
                      )}
                      whileHover={{ scale: 1.02, y: -2 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-black dark:text-white">{lead.name}</h4>
                          <div className="text-sm text-black/70 dark:text-white/70 mt-1 space-y-1">
                            {lead.phone && <div>📞 {lead.phone}</div>}
                            {lead.email && <div>✉️ {lead.email}</div>}
                            {lead.company && <div>🏢 {lead.company}</div>}
                          </div>
                          {lead.notes && (
                            <p className="text-xs text-black/60 dark:text-white/60 mt-2">{lead.notes}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={cn(
                            "text-xs px-2 py-1 rounded",
                            lead.syncedToCRM 
                              ? "bg-green-500/20 text-green-700 dark:text-green-400"
                              : "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                          )}>
                            {lead.syncedToCRM ? 'Synced' : 'Pending'}
                          </span>
                          <span className="text-xs text-black/50 dark:text-white/50">
                            {new Date(lead.capturedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
