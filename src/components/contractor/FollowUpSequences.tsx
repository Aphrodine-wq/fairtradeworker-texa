import { useState } from "react"
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
import { Plus, Calendar, EnvelopeSimple, DeviceMobile, Trash, Play, Pause } from "@phosphor-icons/react"
import { toast } from "sonner"
import type { User, FollowUpSequence, FollowUpStep } from "@/lib/types"

interface FollowUpSequencesProps {
  user: User
}

export function FollowUpSequences({ user }: FollowUpSequencesProps) {
  const [sequences, setSequences] = useKV<FollowUpSequence[]>("follow-up-sequences", [])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSequence, setEditingSequence] = useState<FollowUpSequence | null>(null)
  
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

  const handleSave = () => {
    if (!sequenceName.trim()) {
      toast.error("Please enter a sequence name")
      return
    }

    if (steps.length === 0) {
      toast.error("Add at least one follow-up step")
      return
    }

    if (steps.some(s => !s.message.trim())) {
      toast.error("All steps must have a message")
      return
    }

    const newSequence: FollowUpSequence = {
      id: `seq-${Date.now()}`,
      contractorId: user.id,
      name: sequenceName,
      steps: steps.map((step, i) => ({
        ...step,
        id: `step-${Date.now()}-${i}`
      })),
      active: true,
      createdAt: new Date().toISOString()
    }

    setSequences((current) => [...(current || []), newSequence])
    toast.success(`Sequence "${sequenceName}" created!`)
    setDialogOpen(false)
  }

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
        <Card className="border-primary/50 bg-primary/5">
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
            <Card key={sequence.id} className={!sequence.active ? 'opacity-60' : ''}>
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
                      className="flex items-start gap-3 p-3 bg-muted rounded-lg text-sm"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Follow-Up Sequence</DialogTitle>
            <DialogDescription>
              Build an automated sequence that runs when customers are added to your CRM
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="sequence-name">Sequence Name</Label>
              <Input
                id="sequence-name"
                placeholder="e.g., Post-Job Follow-Up"
                value={sequenceName}
                onChange={(e) => setSequenceName(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Follow-Up Steps</Label>
                <Button variant="outline" size="sm" onClick={handleAddStep}>
                  <Plus className="mr-2" size={16} />
                  Add Step
                </Button>
              </div>

              {steps.map((step, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Step {index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveStep(index)}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Day</Label>
                        <Input
                          type="number"
                          min="1"
                          value={step.day}
                          onChange={(e) => handleUpdateStep(index, 'day', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Action</Label>
                        <Select
                          value={step.action}
                          onValueChange={(value) => handleUpdateStep(index, 'action', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sms">SMS</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Message</Label>
                      <Textarea
                        placeholder="Enter your message..."
                        value={step.message}
                        onChange={(e) => handleUpdateStep(index, 'message', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </Card>
              ))}

              {steps.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Click "Add Step" to create your first follow-up step
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Create Sequence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
