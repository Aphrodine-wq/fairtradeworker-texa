import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  FlowArrow, Plus, Play, Pause, Trash,
  CheckCircle, Clock, AlertCircle, Settings
} from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User, Workflow } from "@/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface AdvancedWorkflowsProps {
  user: User
}

export function AdvancedWorkflows({ user }: AdvancedWorkflowsProps) {
  const [workflows, setWorkflows] = useKV<Workflow[]>("crm-workflows", [])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    trigger: { type: 'event' as const, event: 'customer.created' },
    steps: [] as Workflow['steps'],
    approvals: [] as Workflow['approvals'],
    active: true
  })

  const handleCreateWorkflow = () => {
    if (!newWorkflow.name) {
      toast.error("Please enter a workflow name")
      return
    }

    const workflow: Workflow = {
      id: `workflow-${Date.now()}`,
      contractorId: user.id,
      name: newWorkflow.name,
      trigger: newWorkflow.trigger,
      steps: newWorkflow.steps,
      approvals: newWorkflow.approvals,
      active: newWorkflow.active,
      createdAt: new Date().toISOString()
    }

    setWorkflows((current) => [...(current || []), workflow])
    setShowCreateDialog(false)
    setNewWorkflow({
      name: '',
      trigger: { type: 'event', event: 'customer.created' },
      steps: [],
      approvals: [],
      active: true
    })
    toast.success("Workflow created successfully")
  }

  const handleToggleWorkflow = (workflowId: string) => {
    setWorkflows((current) =>
      (current || []).map(w =>
        w.id === workflowId ? { ...w, active: !w.active } : w
      )
    )
    toast.success("Workflow status updated")
  }

  const handleDeleteWorkflow = (workflowId: string) => {
    setWorkflows((current) => (current || []).filter(w => w.id !== workflowId))
    toast.success("Workflow deleted")
  }

  const getTriggerLabel = (trigger: Workflow['trigger']) => {
    if (trigger.type === 'event') {
      return `Event: ${trigger.event}`
    } else if (trigger.type === 'schedule') {
      return `Schedule: ${trigger.schedule}`
    } else {
      return 'Condition-based'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
            <FlowArrow weight="duotone" size={28} className="text-black dark:text-white" />
            Advanced Workflow Automation
          </h2>
          <p className="text-muted-foreground mt-1">
            Multi-level approvals, complex conditional logic, and cross-departmental automation
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
              <DialogDescription>
                Build automated workflows with conditions, approvals, and actions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Workflow Name</Label>
                <Input
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                  placeholder="e.g., High-Value Customer Onboarding"
                />
              </div>
              <div>
                <Label>Trigger Type</Label>
                <Select
                  value={newWorkflow.trigger.type}
                  onValueChange={(v: any) =>
                    setNewWorkflow({
                      ...newWorkflow,
                      trigger: { ...newWorkflow.trigger, type: v }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event">Event-Based</SelectItem>
                    <SelectItem value="schedule">Scheduled</SelectItem>
                    <SelectItem value="condition">Condition-Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newWorkflow.trigger.type === 'event' && (
                <div>
                  <Label>Event</Label>
                  <Select
                    value={newWorkflow.trigger.event || ''}
                    onValueChange={(v) =>
                      setNewWorkflow({
                        ...newWorkflow,
                        trigger: { ...newWorkflow.trigger, event: v }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer.created">Customer Created</SelectItem>
                      <SelectItem value="customer.updated">Customer Updated</SelectItem>
                      <SelectItem value="interaction.created">Interaction Created</SelectItem>
                      <SelectItem value="invoice.paid">Invoice Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={newWorkflow.active}
                  onCheckedChange={(checked) =>
                    setNewWorkflow({ ...newWorkflow, active: checked })
                  }
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateWorkflow}>
                  Create Workflow
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {workflows.length === 0 ? (
        <Card className="p-12 text-center border-0 shadow-lg hover:shadow-xl">
          <FlowArrow size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
          <p className="text-muted-foreground mb-4">No workflows created yet</p>
          <Button onClick={() => setShowCreateDialog(true)}>Create Your First Workflow</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {workflows.map(workflow => (
            <Card key={workflow.id} className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FlowArrow weight="duotone" size={24} className="text-black dark:text-white" />
                    <div>
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <CardDescription>{getTriggerLabel(workflow.trigger)}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={workflow.active ? 'default' : 'outline'}>
                      {workflow.active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleWorkflow(workflow.id)}
                    >
                      {workflow.active ? <Pause size={16} /> : <Play size={16} />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteWorkflow(workflow.id)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Steps</div>
                      <div className="text-lg font-semibold text-black dark:text-white">
                        {workflow.steps.length}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Approvals</div>
                      <div className="text-lg font-semibold text-black dark:text-white">
                        {workflow.approvals.length}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Created</div>
                      <div className="text-sm text-black dark:text-white">
                        {new Date(workflow.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {workflow.steps.length === 0 && (
                    <div className="p-4 bg-black/5 dark:bg-white/5 rounded-md text-center">
                      <p className="text-sm text-muted-foreground">
                        No steps configured. Add steps to build your workflow.
                      </p>
                    </div>
                  )}

                  {workflow.approvals.length > 0 && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                      <div className="text-xs text-muted-foreground mb-2">Approval Requirements</div>
                      <div className="space-y-1">
                        {workflow.approvals.map((approval, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle size={14} className="text-green-500" />
                            <span className="text-black dark:text-white">
                              {approval.requiredApprovals} of {approval.approvers.length} approvers required
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings size={16} className="mr-2" />
                      Configure
                    </Button>
                    <Button size="sm" variant="outline">
                      View Logs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
