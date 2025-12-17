import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Lightning, Plus, Trash, Play, Pause, 
  Envelope, ChatText, Calendar, Tag, Bell
} from '@phosphor-icons/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useLocalKV as useKV } from '@/hooks/useLocalKV'
import type { User } from '@/lib/types'
import { cn } from '@/lib/utils'

interface AutomationPanelProps {
  user: User
}

interface Automation {
  id: string
  name: string
  trigger: string
  action: string
  enabled: boolean
  createdAt: string
}

export function AutomationPanel({ user }: AutomationPanelProps) {
  const [automations, setAutomations] = useKV<Automation[]>("crm-automations", [])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newAutomation, setNewAutomation] = useState({
    name: '',
    trigger: '',
    action: ''
  })

  const triggers = [
    { value: 'new-customer', label: 'New Customer Added', icon: <Plus size={16} /> },
    { value: 'status-change', label: 'Status Changed', icon: <Tag size={16} /> },
    { value: 'no-contact', label: 'No Contact (7 days)', icon: <Calendar size={16} /> },
    { value: 'high-value', label: 'High Value Customer', icon: <Plus size={16} /> },
  ]

  const actions = [
    { value: 'send-email', label: 'Send Email', icon: <Envelope size={16} /> },
    { value: 'send-sms', label: 'Send SMS', icon: <ChatText size={16} /> },
    { value: 'add-tag', label: 'Add Tag', icon: <Tag size={16} /> },
    { value: 'create-task', label: 'Create Task', icon: <Calendar size={16} /> },
    { value: 'notify', label: 'Send Notification', icon: <Bell size={16} /> },
  ]

  const handleCreateAutomation = () => {
    if (!newAutomation.name || !newAutomation.trigger || !newAutomation.action) return

    const automation: Automation = {
      id: `auto-${Date.now()}`,
      name: newAutomation.name,
      trigger: newAutomation.trigger,
      action: newAutomation.action,
      enabled: true,
      createdAt: new Date().toISOString()
    }

    setAutomations([...automations, automation])
    setNewAutomation({ name: '', trigger: '', action: '' })
    setShowCreateForm(false)
  }

  const toggleAutomation = (id: string) => {
    setAutomations(automations.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    ))
  }

  const deleteAutomation = (id: string) => {
    setAutomations(automations.filter(a => a.id !== id))
  }

  return (
    <div className="h-full overflow-y-auto space-y-6 p-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-black dark:text-white">Workflow Automation</h3>
          <p className="text-sm text-black/60 dark:text-white/60">
            Automate repetitive tasks and workflows
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
        >
          <Plus size={16} className="mr-2" />
          Create Automation
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-white dark:bg-black border-2 border-transparent dark:border-white"
        >
          <h4 className="font-semibold text-black dark:text-white mb-4">New Automation</h4>
          <div className="space-y-4">
            <div>
              <Label className="text-black dark:text-white">Automation Name</Label>
              <Input
                value={newAutomation.name}
                onChange={(e) => setNewAutomation({ ...newAutomation, name: e.target.value })}
                placeholder="e.g., Welcome New Customers"
                className="bg-white dark:bg-black border-transparent dark:border-white"
              />
            </div>
            <div>
              <Label className="text-black dark:text-white">Trigger</Label>
              <Select value={newAutomation.trigger} onValueChange={(v) => setNewAutomation({ ...newAutomation, trigger: v })}>
                <SelectTrigger className="bg-white dark:bg-black border-transparent dark:border-white">
                  <SelectValue placeholder="Select trigger" />
                </SelectTrigger>
                <SelectContent>
                  {triggers.map(trigger => (
                    <SelectItem key={trigger.value} value={trigger.value}>
                      <div className="flex items-center gap-2">
                        {trigger.icon}
                        {trigger.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-black dark:text-white">Action</Label>
              <Select value={newAutomation.action} onValueChange={(v) => setNewAutomation({ ...newAutomation, action: v })}>
                <SelectTrigger className="bg-white dark:bg-black border-transparent dark:border-white">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  {actions.map(action => (
                    <SelectItem key={action.value} value={action.value}>
                      <div className="flex items-center gap-2">
                        {action.icon}
                        {action.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateAutomation}
                className="flex-1 bg-black dark:bg-white text-white dark:text-black"
              >
                Create
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false)
                  setNewAutomation({ name: '', trigger: '', action: '' })
                }}
                className="border-transparent dark:border-white"
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Automation List */}
      <div className="space-y-3">
        {automations.length === 0 ? (
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-8 text-center">
              <Lightning size={48} className="mx-auto mb-4 text-black/40 dark:text-white/40" />
              <p className="text-black dark:text-white font-semibold mb-2">No Automations Yet</p>
              <p className="text-sm text-black/60 dark:text-white/60 mb-4">
                Create your first automation to save time and streamline workflows
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-black dark:bg-white text-white dark:text-black"
              >
                <Plus size={16} className="mr-2" />
                Create Automation
              </Button>
            </CardContent>
          </Card>
        ) : (
          automations.map((automation) => {
            const trigger = triggers.find(t => t.value === automation.trigger)
            const action = actions.find(a => a.value === automation.action)

            return (
              <Card
                key={automation.id}
                className={cn(
                  "border-2 transition-all",
                  automation.enabled
                    ? "border-transparent dark:border-white bg-white dark:bg-black"
                    : "border-transparent dark:border-white/30 bg-white/50 dark:bg-black/50 opacity-60"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Lightning
                          size={20}
                          className={automation.enabled ? "text-yellow-500" : "text-black/40 dark:text-white/40"}
                        />
                        <h4 className="font-semibold text-black dark:text-white">{automation.name}</h4>
                        <Badge variant={automation.enabled ? "default" : "outline"}>
                          {automation.enabled ? "Active" : "Paused"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-black/60 dark:text-white/60 ml-8">
                        <div className="flex items-center gap-2">
                          <span>When:</span>
                          <Badge variant="outline" className="text-xs">
                            {trigger?.label || automation.trigger}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Then:</span>
                          <Badge variant="outline" className="text-xs">
                            {action?.label || automation.action}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-black/40 dark:text-white/40 mt-2 ml-8">
                        Created {new Date(automation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleAutomation(automation.id)}
                        className="text-black dark:text-white"
                      >
                        {automation.enabled ? <Pause size={18} /> : <Play size={18} />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAutomation(automation.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash size={18} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Quick Templates */}
      <Card className="border-2 border-transparent dark:border-white">
        <CardHeader>
          <CardTitle className="text-lg">Quick Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { name: 'Welcome New Customers', trigger: 'new-customer', action: 'send-email' },
              { name: 'Follow Up After 7 Days', trigger: 'no-contact', action: 'send-sms' },
              { name: 'Tag High Value', trigger: 'high-value', action: 'add-tag' },
            ].map((template) => (
              <Button
                key={template.name}
                variant="outline"
                onClick={() => {
                  setNewAutomation({
                    name: template.name,
                    trigger: template.trigger,
                    action: template.action
                  })
                  setShowCreateForm(true)
                }}
                className="justify-start border-transparent dark:border-white"
              >
                <Plus size={16} className="mr-2" />
                {template.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
