import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { 
  Users, Plus, Gear, Layout, Tag, FileText, Calendar, 
  Funnel, Eye, EyeSlash, DotsThreeVertical, Trash, PencilSimple, FloppyDisk, X
} from "@phosphor-icons/react"
import { toast } from "sonner"
import type { User, CRMCustomer } from "@/lib/types"

interface CustomField {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox'
  options?: string[] // For select type
  required: boolean
  visible: boolean
  order: number
}

interface CustomView {
  id: string
  name: string
  fields: string[] // Field IDs to show
  filters: {
    status?: string[]
    tags?: string[]
    customFields?: Record<string, any>
  }
  sortBy: string
  sortOrder: 'asc' | 'desc'
  layout: 'list' | 'grid' | 'table'
}

interface CustomWorkflow {
  id: string
  name: string
  trigger: 'status_change' | 'new_customer' | 'interaction' | 'date'
  conditions: Record<string, any>
  actions: Array<{
    type: 'set_status' | 'add_tag' | 'send_email' | 'create_task' | 'set_field'
    value: any
  }>
  active: boolean
}

interface CustomizableCRMProps {
  user: User
}

export function CustomizableCRM({ user }: CustomizableCRMProps) {
  const [customFields, setCustomFields] = useKV<CustomField[]>("crm-custom-fields", [])
  const [customViews, setCustomViews] = useKV<CustomView[]>("crm-custom-views", [])
  const [customWorkflows, setCustomWorkflows] = useKV<CustomWorkflow[]>("crm-custom-workflows", [])
  const [activeTab, setActiveTab] = useState<'fields' | 'views' | 'workflows'>('fields')
  const [editingField, setEditingField] = useState<CustomField | null>(null)
  const [editingView, setEditingView] = useState<CustomView | null>(null)
  const [editingWorkflow, setEditingWorkflow] = useState<CustomWorkflow | null>(null)
  const [showFieldDialog, setShowFieldDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false)

  // Default fields
  const defaultFields: CustomField[] = [
    { id: 'name', name: 'Name', type: 'text', required: true, visible: true, order: 0 },
    { id: 'email', name: 'Email', type: 'text', required: false, visible: true, order: 1 },
    { id: 'phone', name: 'Phone', type: 'text', required: false, visible: true, order: 2 },
    { id: 'status', name: 'Status', type: 'select', options: ['lead', 'active', 'completed', 'advocate'], required: true, visible: true, order: 3 },
    { id: 'lifetimeValue', name: 'Lifetime Value', type: 'number', required: false, visible: true, order: 4 },
    { id: 'notes', name: 'Notes', type: 'textarea', required: false, visible: true, order: 5 },
  ]

  const allFields = useMemo(() => {
    return [...defaultFields, ...(customFields || [])].sort((a, b) => a.order - b.order)
  }, [customFields])

  const handleCreateField = (field: Omit<CustomField, 'id'>) => {
    const newField: CustomField = {
      ...field,
      id: `field-${Date.now()}`,
    }
    setCustomFields((current) => [...(current || []), newField])
    toast.success(`Field "${field.name}" created!`)
    setShowFieldDialog(false)
    setEditingField(null)
  }

  const handleUpdateField = (id: string, updates: Partial<CustomField>) => {
    setCustomFields((current) =>
      (current || []).map((f) => (f.id === id ? { ...f, ...updates } : f))
    )
    toast.success("Field updated!")
    setEditingField(null)
  }

  const handleDeleteField = (id: string) => {
    setCustomFields((current) => (current || []).filter((f) => f.id !== id))
    toast.success("Field deleted!")
  }

  const handleCreateView = (view: Omit<CustomView, 'id'>) => {
    const newView: CustomView = {
      ...view,
      id: `view-${Date.now()}`,
    }
    setCustomViews((current) => [...(current || []), newView])
    toast.success(`View "${view.name}" created!`)
    setShowViewDialog(false)
    setEditingView(null)
  }

  const handleCreateWorkflow = (workflow: Omit<CustomWorkflow, 'id'>) => {
    const newWorkflow: CustomWorkflow = {
      ...workflow,
      id: `workflow-${Date.now()}`,
    }
    setCustomWorkflows((current) => [...(current || []), newWorkflow])
    toast.success(`Workflow "${workflow.name}" created!`)
    setShowWorkflowDialog(false)
    setEditingWorkflow(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Gear weight="duotone" size={32} className="text-black dark:text-white" />
            Customizable CRM
          </h1>
          <p className="text-muted-foreground mt-2">
            Customize fields, views, and workflows to match your business needs
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="fields">
            <FileText weight="duotone" size={18} className="mr-2" />
            Custom Fields
          </TabsTrigger>
          <TabsTrigger value="views">
            <Layout weight="duotone" size={18} className="mr-2" />
            Custom Views
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <Calendar weight="duotone" size={18} className="mr-2" />
            Workflows
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fields" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Custom Fields</h2>
            <Button onClick={() => {
              setEditingField(null)
              setShowFieldDialog(true)
            }}>
              <Plus size={18} className="mr-2" />
              Add Custom Field
            </Button>
          </div>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Default Fields</CardTitle>
                <CardDescription>System fields that are always available</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {defaultFields.map((field) => (
                    <div key={field.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <DotsThreeVertical size={20} className="text-muted-foreground" />
                        <div>
                          <div className="font-medium">{field.name}</div>
                          <div className="text-sm text-muted-foreground capitalize">{field.type}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {field.visible ? (
                          <Eye size={18} className="text-green-600" />
                        ) : (
                          <EyeSlash size={18} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {customFields && customFields.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Custom Fields</CardTitle>
                  <CardDescription>Fields you've created</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {customFields.map((field) => (
                      <div key={field.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <DotsThreeVertical size={20} className="text-muted-foreground" />
                          <div>
                            <div className="font-medium">{field.name}</div>
                            <div className="text-sm text-muted-foreground capitalize">{field.type}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingField(field)
                              setShowFieldDialog(true)
                            }}
                          >
                            <PencilSimple size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteField(field.id)}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="views" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Custom Views</h2>
            <Button onClick={() => {
              setEditingView(null)
              setShowViewDialog(true)
            }}>
              <Plus size={18} className="mr-2" />
              Create View
            </Button>
          </div>

          {customViews && customViews.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {customViews.map((view) => (
                <Card key={view.id}>
                  <CardHeader>
                    <CardTitle>{view.name}</CardTitle>
                    <CardDescription>
                      {view.fields.length} fields • {view.layout} layout
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye size={16} className="mr-2" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingView(view)
                          setShowViewDialog(true)
                        }}
                      >
                        <PencilSimple size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Layout size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No custom views yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create custom views to organize your customer data exactly how you need it
                </p>
                <Button onClick={() => {
                  setEditingView(null)
                  setShowViewDialog(true)
                }}>
                  <Plus size={18} className="mr-2" />
                  Create Your First View
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="workflows" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Automation Workflows</h2>
            <Button onClick={() => {
              setEditingWorkflow(null)
              setShowWorkflowDialog(true)
            }}>
              <Plus size={18} className="mr-2" />
              Create Workflow
            </Button>
          </div>

          {customWorkflows && customWorkflows.length > 0 ? (
            <div className="space-y-4">
              {customWorkflows.map((workflow) => (
                <Card key={workflow.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{workflow.name}</CardTitle>
                        <CardDescription>
                          Trigger: {workflow.trigger.replace('_', ' ')} • {workflow.actions.length} actions
                        </CardDescription>
                      </div>
                      <Switch checked={workflow.active} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <PencilSimple size={16} className="mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No workflows yet</h3>
                <p className="text-muted-foreground mb-4">
                  Automate repetitive tasks and save time with custom workflows
                </p>
                <Button onClick={() => {
                  setEditingWorkflow(null)
                  setShowWorkflowDialog(true)
                }}>
                  <Plus size={18} className="mr-2" />
                  Create Your First Workflow
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Field Dialog */}
      <Dialog open={showFieldDialog} onOpenChange={setShowFieldDialog}>
        <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 h-[95vh]">
          <div className="px-8 pt-6 pb-4 border-b border-black/10 dark:border-white/10 flex-shrink-0">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl">{editingField ? 'Edit Field' : 'Create Custom Field'}</DialogTitle>
              <DialogDescription>
                Add custom fields to track additional customer information
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-hidden p-6">
            <FieldForm
            field={editingField}
            onSave={(field) => {
              if (editingField) {
                handleUpdateField(editingField.id, field)
              } else {
                handleCreateField(field as Omit<CustomField, 'id'>)
              }
            }}
            onCancel={() => {
              setShowFieldDialog(false)
              setEditingField(null)
            }}
          />
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 h-[95vh]">
          <div className="px-8 pt-6 pb-4 border-b border-black/10 dark:border-white/10 flex-shrink-0">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl">{editingView ? 'Edit View' : 'Create Custom View'}</DialogTitle>
              <DialogDescription>
                Create custom views to organize and filter your customers
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-hidden p-6">
            <ViewForm
            view={editingView}
            availableFields={allFields}
            onSave={(view) => {
              if (editingView) {
                // Handle update
                setCustomViews((current) =>
                  (current || []).map((v) => (v.id === editingView.id ? { ...v, ...view } : v))
                )
                toast.success("View updated!")
              } else {
                handleCreateView(view as Omit<CustomView, 'id'>)
              }
              setShowViewDialog(false)
              setEditingView(null)
            }}
            onCancel={() => {
              setShowViewDialog(false)
              setEditingView(null)
            }}
          />
          </div>
        </DialogContent>
      </Dialog>

      {/* Workflow Dialog */}
      <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
        <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 h-[95vh]">
          <div className="px-8 pt-6 pb-4 border-b border-black/10 dark:border-white/10 flex-shrink-0">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl">{editingWorkflow ? 'Edit Workflow' : 'Create Automation Workflow'}</DialogTitle>
              <DialogDescription>
                Automate actions based on triggers and conditions
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-hidden p-6">
            <WorkflowForm
            workflow={editingWorkflow}
            onSave={(workflow) => {
              if (editingWorkflow) {
                setCustomWorkflows((current) =>
                  (current || []).map((w) => (w.id === editingWorkflow.id ? { ...w, ...workflow } : w))
                )
                toast.success("Workflow updated!")
              } else {
                handleCreateWorkflow(workflow as Omit<CustomWorkflow, 'id'>)
              }
              setShowWorkflowDialog(false)
              setEditingWorkflow(null)
            }}
            onCancel={() => {
              setShowWorkflowDialog(false)
              setEditingWorkflow(null)
            }}
          />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Field Form Component
function FieldForm({ 
  field, 
  onSave, 
  onCancel 
}: { 
  field: CustomField | null
  onSave: (field: Partial<CustomField>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(field?.name || '')
  const [type, setType] = useState<CustomField['type']>(field?.type || 'text')
  const [options, setOptions] = useState<string[]>(field?.options || [])
  const [required, setRequired] = useState(field?.required || false)
  const [visible, setVisible] = useState(field?.visible ?? true)
  const [newOption, setNewOption] = useState('')

  const handleAddOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()])
      setNewOption('')
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base">Field Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Company Name, Industry, etc."
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base">Field Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as CustomField['type'])}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="select">Dropdown</SelectItem>
                <SelectItem value="textarea">Text Area</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={required} onCheckedChange={setRequired} />
              <Label>Required Field</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={visible} onCheckedChange={setVisible} />
              <Label>Visible by Default</Label>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {type === 'select' && (
            <div className="space-y-2">
              <Label className="text-base">Options</Label>
              <div className="flex gap-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Add option..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
                  className="h-11"
                />
                <Button type="button" onClick={handleAddOption} className="h-11">
                  <Plus size={16} />
                </Button>
              </div>
              {options.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
                      <span className="text-sm">{opt}</span>
                      <button
                        onClick={() => setOptions(options.filter((_, i) => i !== idx))}
                        className="text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-6 border-t border-black/10 dark:border-white/10 mt-6">
        <Button variant="outline" onClick={onCancel} className="h-11">
          Cancel
        </Button>
        <Button onClick={() => onSave({
          name,
          type,
          options: type === 'select' ? options : undefined,
          required,
          visible,
          order: field?.order || 100,
        })} className="h-11">
          <FloppyDisk size={16} className="mr-2" />
          {field ? 'Update' : 'Create'} Field
        </Button>
      </div>
    </div>
  )
}

// View Form Component
function ViewForm({
  view,
  availableFields,
  onSave,
  onCancel
}: {
  view: CustomView | null
  availableFields: CustomField[]
  onSave: (view: Partial<CustomView>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(view?.name || '')
  const [selectedFields, setSelectedFields] = useState<string[]>(view?.fields || [])
  const [layout, setLayout] = useState<CustomView['layout']>(view?.layout || 'list')

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base">View Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Active Leads, High Value Customers"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base">Layout</Label>
            <Select value={layout} onValueChange={(v) => setLayout(v as CustomView['layout'])}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="list">List</SelectItem>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="table">Table</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base">Fields to Display</Label>
            <div className="h-full space-y-2 border rounded-lg p-3 grid grid-cols-2 gap-2">
              {availableFields.map((field) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFields([...selectedFields, field.id])
                      } else {
                        setSelectedFields(selectedFields.filter(id => id !== field.id))
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <Label className="font-normal text-sm">{field.name}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-6 border-t border-black/10 dark:border-white/10 mt-6">
        <Button variant="outline" onClick={onCancel} className="h-11">
          Cancel
        </Button>
        <Button onClick={() => onSave({
          name,
          fields: selectedFields,
          layout,
          filters: view?.filters || {},
          sortBy: view?.sortBy || 'createdAt',
          sortOrder: view?.sortOrder || 'desc',
        })} className="h-11">
          <FloppyDisk size={16} className="mr-2" />
          {view ? 'Update' : 'Create'} View
        </Button>
      </div>
    </div>
  )
}

// Workflow Form Component
function WorkflowForm({
  workflow,
  onSave,
  onCancel
}: {
  workflow: CustomWorkflow | null
  onSave: (workflow: Partial<CustomWorkflow>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(workflow?.name || '')
  const [trigger, setTrigger] = useState<CustomWorkflow['trigger']>(workflow?.trigger || 'status_change')
  const [active, setActive] = useState(workflow?.active ?? true)

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base">Workflow Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Auto-follow up on new leads"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base">Trigger</Label>
            <Select value={trigger} onValueChange={(v) => setTrigger(v as CustomWorkflow['trigger'])}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status_change">Status Change</SelectItem>
                <SelectItem value="new_customer">New Customer Added</SelectItem>
                <SelectItem value="interaction">New Interaction</SelectItem>
                <SelectItem value="date">Date-based</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={active} onCheckedChange={setActive} />
            <Label>Active</Label>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
            Advanced workflow configuration coming soon. For now, basic triggers are available.
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-6 border-t border-black/10 dark:border-white/10 mt-6">
        <Button variant="outline" onClick={onCancel} className="h-11">
          Cancel
        </Button>
        <Button onClick={() => onSave({
          name,
          trigger,
          active,
          conditions: workflow?.conditions || {},
          actions: workflow?.actions || [],
        })} className="h-11">
          <FloppyDisk size={16} className="mr-2" />
          {workflow ? 'Update' : 'Create'} Workflow
        </Button>
      </div>
    </div>
  )
}

