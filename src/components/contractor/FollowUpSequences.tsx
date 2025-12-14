import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { Plus, Calendar, EnvelopeSimple, DeviceMobile, Trash, Play, Pause, CircleNotch } from "@phosphor-icons/react"
import { toast } from "sonner"
import { safeInput } from "@/lib/utils"
import type { User, FollowUpSequence, FollowUpStep } from "@/lib/types"

interface FollowUpSequencesProps {
  user: User
}

export function FollowUpSequences({ user }: FollowUpSequencesProps) {
  const [sequences, setSequences] = useKV<FollowUpSequence[]>("follow-up-sequences", [])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSequence, setEditingSequence] = useState<FollowUpSequence | null>(null)
  const isPro = user.isPro || false
  
  const [sequenceName, setSequenceName] = useState("")
  const [steps, setSteps] = useState<Omit<FollowUpStep, 'id'>[]>([])

  const mySequences = (sequences || []).filter(s => s.contractorId === user.id)

  const handleOpenNew = () => {
    setEditingSequence(null)
    setSequenceName("")
    setSteps([])
    setDialogOpen(true)
  }

  const handleAddStep = () => {
    setSteps([...steps, {
      day: steps.length + 1,
      action: 'sms',
      message: '',
      delay: `${steps.length + 1}_days`
    }])
  }

  const handleUpdateStep = (index: number, field: keyof Omit<FollowUpStep, 'id'>, value: any) => {
    const newSteps = [...steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setSteps(newSteps)
  }

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index))
  }

  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    steps?: string
  }>({})

  const handleSave = useCallback(async () => {
    setErrors({})
    
    // Validation
    if (!sequenceName.trim()) {
      setErrors({ name: "Sequence name is required" })
      toast.error("Please enter a sequence name")
      return
    } else if (sequenceName.trim().length < 3) {
      setErrors({ name: "Sequence name must be at least 3 characters" })
      toast.error("Sequence name must be at least 3 characters")
      return
    }

    if (steps.length === 0) {
      setErrors({ steps: "Add at least one follow-up step" })
      toast.error("Add at least one follow-up step")
      return
    }

    const invalidSteps = steps.filter(s => !s.message.trim())
    if (invalidSteps.length > 0) {
      setErrors({ steps: "All steps must have a message" })
      toast.error("All steps must have a message")
      return
    }

    // Validate step delays
    const invalidDelays = steps.filter(s => {
      const delayNum = parseInt(s.delay.replace(/\D/g, ''))
      return isNaN(delayNum) || delayNum <= 0
    })
    if (invalidDelays.length > 0) {
      setErrors({ steps: "All steps must have valid delays" })
      toast.error("All steps must have valid delays")
      return
    }

    setIsSaving(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      const newSequence: FollowUpSequence = {
        id: `seq-${Date.now()}`,
        contractorId: user.id,
        name: safeInput(sequenceName.trim()),
        steps: steps.map((step, i) => ({
          ...step,
          id: `step-${Date.now()}-${i}`,
          message: safeInput(step.message.trim())
        })),
        active: true,
        createdAt: new Date().toISOString()
      }

      setSequences((current) => [...(current || []), newSequence])
      toast.success(`Sequence "${sequenceName}" created!`)
      setDialogOpen(false)
      setSequenceName("")
      setSteps([])
      setErrors({})
    } catch (error) {
      console.error("Error saving sequence:", error)
      toast.error("Failed to save sequence. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }, [sequenceName, steps, setSequences, user.id])

  const toggleSequenceActive = (sequenceId: string) => {
    setSequences((current) =>
      (current || []).map((s) =>
        s.id === sequenceId ? { ...s, active: !s.active } : s
      )
    )
  }

  const deleteSequence = (sequenceId: string, name: string) => {
    setSequences((current) => (current || []).filter((s) => s.id !== sequenceId))
    toast.success(`Sequence "${name}" deleted`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar weight="duotone" size={32} className="text-primary" />
            Automated Follow-Ups
          </h2>
          <p className="text-muted-foreground mt-1">
            {user.isPro ? 'Create sequences that run automatically' : 'Upgrade to Pro to unlock automated follow-ups'}
          </p>
        </div>
        {user.isPro && (
          <Button onClick={handleOpenNew}>
            <Plus className="mr-2" weight="bold" />
            New Sequence
          </Button>
        )}
      </div>

      {!user.isPro && (
        <Card glass={isPro}>
          <CardHeader>
            <CardTitle className="text-lg">Pro Feature</CardTitle>
            <CardDescription>
              Automated follow-ups help you stay in touch with customers without lifting a finger.
              Upgrade to Pro to unlock this feature.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Upgrade to Pro - $39/mo</Button>
          </CardContent>
        </Card>
      )}

      {user.isPro && mySequences.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar size={64} weight="duotone" className="text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No sequences yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Create your first automated follow-up sequence to stay connected with customers
            </p>
            <Button onClick={handleOpenNew}>
              <Plus className="mr-2" weight="bold" />
              Create Sequence
            </Button>
          </CardContent>
        </Card>
      )}

      {user.isPro && mySequences.length > 0 && (
        <div className="grid gap-4">
          {mySequences.map((sequence) => (
            <Card key={sequence.id} className={!sequence.active ? 'opacity-60' : ''} glass={isPro}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {sequence.name}
                      {sequence.active ? (
                        <Badge variant="default" className="bg-green-500">
                          <Play size={12} weight="fill" className="mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Pause size={12} weight="fill" className="mr-1" />
                          Paused
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {sequence.steps.length} steps • Created {new Date(sequence.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSequenceActive(sequence.id)}
                    >
                      {sequence.active ? <Pause weight="bold" /> : <Play weight="bold" />}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteSequence(sequence.id, sequence.name)}
                    >
                      <Trash weight="bold" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sequence.steps.map((step, i) => (
                    <div
                      key={step.id}
                      className="flex items-start gap-3 p-3 bg-white dark:bg-black border border-black/20 dark:border-white/20 rounded-md text-sm font-mono shadow-sm"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {step.action === 'sms' ? (
                            <DeviceMobile weight="duotone" size={16} />
                          ) : (
                            <EnvelopeSimple weight="duotone" size={16} />
                          )}
                          <span className="font-medium">Day {step.day} • {step.action.toUpperCase()}</span>
                        </div>
                        <div className="text-muted-foreground">{step.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 h-[95vh]">
          <div className="px-8 pt-6 pb-4 border-b border-black/10 dark:border-white/10 flex-shrink-0">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl">Create Follow-Up Sequence</DialogTitle>
              <DialogDescription>
                Build an automated sequence that runs when customers are added to your CRM
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="flex-1 overflow-hidden p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Sequence Info */}
            <div className="lg:col-span-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sequence-name" className="text-base">Sequence Name *</Label>
                <Input
                  id="sequence-name"
                  placeholder="e.g., Post-Job Follow-Up"
                  value={sequenceName}
                  onChange={(e) => {
                    setSequenceName(safeInput(e.target.value))
                    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }))
                  }}
                  onBlur={() => {
                    if (sequenceName && sequenceName.trim().length < 3) {
                      setErrors(prev => ({ ...prev, name: "Sequence name must be at least 3 characters" }))
                    }
                  }}
                  className={`h-11 ${errors.name ? "border-[#FF0000]" : ""}`}
                  disabled={isSaving}
                  required
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "sequence-name-error" : undefined}
                />
                {errors.name && (
                  <p id="sequence-name-error" className="text-sm text-[#FF0000] font-mono" role="alert">
                    {errors.name}
                  </p>
                )}
                {errors.steps && (
                  <p className="text-sm text-[#FF0000] font-mono" role="alert">
                    {errors.steps}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center">
                <Button variant="outline" size="lg" onClick={handleAddStep} className="w-full">
                  <Plus className="mr-2" size={18} />
                  Add Step
                </Button>
              </div>
            </div>

            {/* Right Columns - Steps Grid */}
            <div className="lg:col-span-2 overflow-hidden">
              {steps.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Calendar size={48} weight="duotone" className="mx-auto mb-4 text-black dark:text-white" />
                  <p className="text-lg">Click "Add Step" to create your first follow-up step</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full overflow-hidden">
                  {steps.map((step, index) => (
                    <Card key={index} className="p-4 flex flex-col" glass={isPro}>
                      <div className="flex items-center justify-between mb-3 flex-shrink-0">
                        <span className="font-semibold text-base">Step {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveStep(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash size={14} />
                        </Button>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Day</Label>
                            <Input
                              type="number"
                              min="1"
                              value={step.day}
                              onChange={(e) => handleUpdateStep(index, 'day', parseInt(e.target.value))}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Action</Label>
                            <Select
                              value={step.action}
                              onValueChange={(value) => handleUpdateStep(index, 'action', value)}
                            >
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sms">SMS</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-1 flex-1 flex flex-col">
                          <Label className="text-xs">Message</Label>
                          <Textarea
                            placeholder="Enter your message..."
                            value={step.message}
                            onChange={(e) => handleUpdateStep(index, 'message', e.target.value)}
                            className="flex-1 text-sm resize-none"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="px-8 py-4 border-t border-black/10 dark:border-white/10 flex-shrink-0">
            <DialogFooter className="gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-11">
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                className="h-11 border-2 border-black dark:border-white"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <CircleNotch size={18} className="mr-2 animate-spin" weight="bold" />
                    Creating...
                  </>
                ) : (
                  "Create Sequence"
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
