/**
 * AI-Enhanced Follow-Up Automator
 * Intelligent follow-up sequences based on AI Receptionist transcript analysis
 */

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { 
  Sparkle, DeviceMobile, EnvelopeSimple, Clock, 
  CheckCircle, Play, Pause, Plus, TrendUp
} from "@phosphor-icons/react"
import { toast } from "sonner"
import type { User, Job } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface FollowUpSequence {
  id: string
  contractorId: string
  name: string
  trigger: 'ai_call' | 'bid_submitted' | 'bid_lost' | 'job_completed' | 'no_response' | 'custom'
  filters?: {
    urgency?: ('low' | 'medium' | 'high' | 'emergency')[]
    keywords?: string[]
    minValue?: number
  }
  steps: FollowUpStep[]
  active: boolean
  stats: {
    triggered: number
    sent: number
    opened: number
    replied: number
    converted: number
  }
  createdAt: string
}

interface FollowUpStep {
  id: string
  delay: number // hours after trigger
  channel: 'sms' | 'email' | 'notification'
  templateType: 'standard' | 'ai_personalized'
  subject?: string
  message: string
  useTranscriptContext: boolean
}

interface ActiveFollowUp {
  id: string
  sequenceId: string
  jobId: string
  customerId: string
  currentStep: number
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  nextSendAt?: string
  history: {
    stepId: string
    sentAt: string
    channel: string
    opened?: boolean
    replied?: boolean
  }[]
  createdAt: string
}

interface AIEnhancedFollowUpProps {
  user: User
}

export function AIEnhancedFollowUp({ user }: AIEnhancedFollowUpProps) {
  const [sequences, setSequences] = useKV<FollowUpSequence[]>("follow-up-sequences", [])
  const [activeFollowUps, setActiveFollowUps] = useKV<ActiveFollowUp[]>("active-follow-ups", [])
  const [jobs] = useKV<Job[]>("jobs", [])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newSequence, setNewSequence] = useState<Partial<FollowUpSequence>>({
    name: '',
    trigger: 'ai_call',
    steps: [],
    active: true
  })

  // Get contractor's sequences
  const mySequences = useMemo(() => 
    sequences?.filter(s => s.contractorId === user.id) || [],
    [sequences, user.id]
  )

  // Get active follow-ups
  const myActiveFollowUps = useMemo(() => 
    activeFollowUps?.filter(af => {
      const sequence = mySequences.find(s => s.id === af.sequenceId)
      return sequence && af.status === 'active'
    }) || [],
    [activeFollowUps, mySequences]
  )

  // Analyze AI Receptionist calls to trigger sequences
  const analyzeAndTriggerSequences = () => {
    const recentCalls = jobs?.filter(j => 
      j.contractorId === user.id &&
      j.source === 'ai_receptionist' &&
      j.metadata?.transcript
    ) || []

    recentCalls.forEach(job => {
      const transcript = job.metadata?.transcript || ''
      const urgency = job.metadata?.urgency || 'medium'
      
      // Find matching sequences
      const matchingSequences = mySequences.filter(seq => {
        if (!seq.active) return false
        if (seq.trigger !== 'ai_call') return false
        
        // Check urgency filter
        if (seq.filters?.urgency && !seq.filters.urgency.includes(urgency)) {
          return false
        }
        
        // Check keyword filter
        if (seq.filters?.keywords && seq.filters.keywords.length > 0) {
          const hasKeyword = seq.filters.keywords.some(keyword => 
            transcript.toLowerCase().includes(keyword.toLowerCase())
          )
          if (!hasKeyword) return false
        }
        
        return true
      })

      // Trigger sequences
      matchingSequences.forEach(sequence => {
        triggerSequence(sequence.id, job.id, job.metadata?.customerId || job.homeownerId)
      })
    })
  }

  const triggerSequence = (sequenceId: string, jobId: string, customerId: string) => {
    const sequence = mySequences.find(s => s.id === sequenceId)
    if (!sequence || sequence.steps.length === 0) return

    const newFollowUp: ActiveFollowUp = {
      id: crypto?.randomUUID?.() || `followup-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      sequenceId,
      jobId,
      customerId,
      currentStep: 0,
      status: 'active',
      nextSendAt: new Date(Date.now() + sequence.steps[0].delay * 60 * 60 * 1000).toISOString(),
      history: [],
      createdAt: new Date().toISOString()
    }

    setActiveFollowUps(prev => [...(prev || []), newFollowUp])
    
    // Update sequence stats
    setSequences(prev => 
      (prev || []).map(s => 
        s.id === sequenceId 
          ? { ...s, stats: { ...s.stats, triggered: s.stats.triggered + 1 } }
          : s
      )
    )

    toast.success(`Follow-up sequence "${sequence.name}" triggered`)
  }

  const createSequence = () => {
    if (!newSequence.name || !newSequence.steps || newSequence.steps.length === 0) {
      toast.error("Please add at least one step to the sequence")
      return
    }

    const sequence: FollowUpSequence = {
      id: crypto?.randomUUID?.() || `seq-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      contractorId: user.id,
      name: newSequence.name,
      trigger: newSequence.trigger || 'ai_call',
      filters: newSequence.filters,
      steps: newSequence.steps,
      active: true,
      stats: {
        triggered: 0,
        sent: 0,
        opened: 0,
        replied: 0,
        converted: 0
      },
      createdAt: new Date().toISOString()
    }

    setSequences(prev => [...(prev || []), sequence])
    toast.success("Follow-up sequence created")
    setShowCreateDialog(false)
    setNewSequence({
      name: '',
      trigger: 'ai_call',
      steps: [],
      active: true
    })
  }

  const addStep = () => {
    const newStep: FollowUpStep = {
      id: crypto?.randomUUID?.() || `step-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      delay: 1,
      channel: 'sms',
      templateType: 'ai_personalized',
      message: '',
      useTranscriptContext: true
    }

    setNewSequence(prev => ({
      ...prev,
      steps: [...(prev.steps || []), newStep]
    }))
  }

  const toggleSequence = (sequenceId: string) => {
    setSequences(prev => 
      (prev || []).map(s => 
        s.id === sequenceId 
          ? { ...s, active: !s.active }
          : s
      )
    )
  }

  const getTriggerLabel = (trigger: FollowUpSequence['trigger']) => {
    switch (trigger) {
      case 'ai_call': return 'AI Receptionist Call'
      case 'bid_submitted': return 'Bid Submitted'
      case 'bid_lost': return 'Bid Lost'
      case 'job_completed': return 'Job Completed'
      case 'no_response': return 'No Response'
      default: return 'Custom Trigger'
    }
  }

  const getChannelIcon = (channel: FollowUpStep['channel']) => {
    switch (channel) {
      case 'sms': return <DeviceMobile className="w-4 h-4" />
      case 'email': return <EnvelopeSimple className="w-4 h-4" />
      default: return <Sparkle className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkle className="w-5 h-5 text-purple-500" />
                AI-Enhanced Follow-Up Automator
              </CardTitle>
              <CardDescription>
                Intelligent follow-up sequences triggered by AI analysis
              </CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Sequence
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Follow-Up Sequence</DialogTitle>
                  <DialogDescription>
                    Build an automated follow-up sequence with AI personalization
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sequence Name</label>
                    <input
                      type="text"
                      value={newSequence.name}
                      onChange={(e) => setNewSequence(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Urgent Lead Follow-Up"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Trigger</label>
                    <Select 
                      value={newSequence.trigger} 
                      onValueChange={(v: any) => setNewSequence(prev => ({ ...prev, trigger: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ai_call">AI Receptionist Call</SelectItem>
                        <SelectItem value="bid_submitted">Bid Submitted</SelectItem>
                        <SelectItem value="bid_lost">Bid Lost</SelectItem>
                        <SelectItem value="job_completed">Job Completed</SelectItem>
                        <SelectItem value="no_response">No Response</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Sequence Steps</h3>
                      <Button variant="outline" size="sm" onClick={addStep}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Step
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {(newSequence.steps || []).map((step, index) => (
                        <Card key={step.id} className="bg-gray-50">
                          <CardContent className="p-3">
                            <div className="text-sm font-medium mb-2">Step {index + 1}</div>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <div>
                                <label className="text-xs text-gray-500">Delay (hours)</label>
                                <input
                                  type="number"
                                  value={step.delay}
                                  onChange={(e) => {
                                    const updated = [...(newSequence.steps || [])]
                                    updated[index] = { ...step, delay: Number(e.target.value) }
                                    setNewSequence(prev => ({ ...prev, steps: updated }))
                                  }}
                                  min={0}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500">Channel</label>
                                <Select 
                                  value={step.channel}
                                  onValueChange={(v: any) => {
                                    const updated = [...(newSequence.steps || [])]
                                    updated[index] = { ...step, channel: v }
                                    setNewSequence(prev => ({ ...prev, steps: updated }))
                                  }}
                                >
                                  <SelectTrigger className="text-sm h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="sms">SMS</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <Textarea
                              value={step.message}
                              onChange={(e) => {
                                const updated = [...(newSequence.steps || [])]
                                updated[index] = { ...step, message: e.target.value }
                                setNewSequence(prev => ({ ...prev, steps: updated }))
                              }}
                              placeholder="Message template (AI will personalize based on call context)"
                              rows={3}
                              className="text-sm"
                            />
                            <div className="flex items-center gap-2 mt-2">
                              <input
                                type="checkbox"
                                id={`transcript-${step.id}`}
                                checked={step.useTranscriptContext}
                                onChange={(e) => {
                                  const updated = [...(newSequence.steps || [])]
                                  updated[index] = { ...step, useTranscriptContext: e.target.checked }
                                  setNewSequence(prev => ({ ...prev, steps: updated }))
                                }}
                              />
                              <label htmlFor={`transcript-${step.id}`} className="text-xs text-gray-600">
                                Use AI to personalize with call transcript context
                              </label>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createSequence}>
                      Create Sequence
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mySequences.map(sequence => (
              <Card 
                key={sequence.id}
                className={`shadow-sm hover:shadow-md transition-shadow duration-200 ${
                  sequence.active ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-300'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{sequence.name}</h3>
                        {sequence.active ? (
                          <Badge variant="default" className="bg-green-500">
                            <Play className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Pause className="w-3 h-3 mr-1" />
                            Paused
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Trigger: {getTriggerLabel(sequence.trigger)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {sequence.steps.length} step(s)
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSequence(sequence.id)}
                    >
                      {sequence.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-5 gap-2 mt-3 pt-3 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Triggered</p>
                      <p className="font-semibold text-sm">{sequence.stats.triggered}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Sent</p>
                      <p className="font-semibold text-sm">{sequence.stats.sent}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Opened</p>
                      <p className="font-semibold text-sm">{sequence.stats.opened}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Replied</p>
                      <p className="font-semibold text-sm">{sequence.stats.replied}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Converted</p>
                      <p className="font-semibold text-sm text-green-600">{sequence.stats.converted}</p>
                    </div>
                  </div>

                  {/* Steps Preview */}
                  <div className="mt-3 space-y-1">
                    {sequence.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-2 text-xs text-gray-600">
                        {getChannelIcon(step.channel)}
                        <Clock className="w-3 h-3" />
                        <span>+{step.delay}h</span>
                        <span className="text-gray-400">→</span>
                        <span className="truncate">{step.message.substring(0, 50)}...</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            {mySequences.length === 0 && (
              <div className="text-center py-12">
                <Sparkle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No follow-up sequences yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Create intelligent sequences to automatically follow up with leads
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Follow-Ups */}
      {myActiveFollowUps.length > 0 && (
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendUp className="w-5 h-5" />
              Active Follow-Ups
            </CardTitle>
            <CardDescription>
              Currently running sequences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {myActiveFollowUps.map(followUp => {
                const sequence = mySequences.find(s => s.id === followUp.sequenceId)
                const job = jobs?.find(j => j.id === followUp.jobId)
                
                return (
                  <div key={followUp.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{sequence?.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{job?.title}</p>
                        <p className="text-xs text-gray-500">
                          Next: {followUp.nextSendAt ? formatDistanceToNow(new Date(followUp.nextSendAt), { addSuffix: true }) : 'N/A'}
                        </p>
                      </div>
                      <Badge variant="outline">
                        Step {followUp.currentStep + 1}/{sequence?.steps.length || 0}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
