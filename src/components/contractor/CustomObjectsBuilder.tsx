import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  PuzzlePiece, Plus, Trash, Settings, Database,
  TextT, Hash, Calendar, ToggleLeft, List, Link
} from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User, CustomObject, CustomField } from "@/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface CustomObjectsBuilderProps {
  user: User
}

export function CustomObjectsBuilder({ user }: CustomObjectsBuilderProps) {
  const [customObjects, setCustomObjects] = useKV<CustomObject[]>("crm-custom-objects", [])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showFieldDialog, setShowFieldDialog] = useState(false)
  const [selectedObject, setSelectedObject] = useState<string | null>(null)
  const [newObject, setNewObject] = useState({
    name: '',
    label: '',
    fields: [] as CustomField[]
  })
  const [newField, setNewField] = useState({
    name: '',
    label: '',
    type: 'text' as CustomField['type'],
    required: false,
    defaultValue: ''
  })

  const fieldTypes = [
    { value: 'text', label: 'Text', icon: TextT },
    { value: 'number', label: 'Number', icon: Hash },
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'boolean', label: 'Boolean', icon: ToggleLeft },
    { value: 'select', label: 'Select', icon: List },
    { value: 'multiselect', label: 'Multi-Select', icon: List },
    { value: 'relationship', label: 'Relationship', icon: Link }
  ]

  const handleCreateObject = () => {
    if (!newObject.name || !newObject.label) {
      toast.error("Please enter object name and label")
      return
    }

    const customObject: CustomObject = {
      id: `object-${Date.now()}`,
      contractorId: user.id,
      name: newObject.name,
      label: newObject.label,
      fields: newObject.fields,
      relationships: [],
      permissions: {
        read: [user.id],
        write: [user.id],
        delete: [user.id]
      },
      createdAt: new Date().toISOString()
    }

    setCustomObjects((current) => [...(current || []), customObject])
    setShowCreateDialog(false)
    setNewObject({ name: '', label: '', fields: [] })
    toast.success("Custom object created successfully")
  }

  const handleAddField = (objectId: string) => {
    if (!newField.name || !newField.label) {
      toast.error("Please enter field name and label")
      return
    }

    const field: CustomField = {
      id: `field-${Date.now()}`,
      name: newField.name,
      label: newField.label,
      type: newField.type,
      required: newField.required,
      defaultValue: newField.defaultValue
    }

    setCustomObjects((current) =>
      (current || []).map(obj =>
        obj.id === objectId
          ? { ...obj, fields: [...obj.fields, field] }
          : obj
      )
    )

    setShowFieldDialog(false)
    setNewField({ name: '', label: '', type: 'text', required: false, defaultValue: '' })
    toast.success("Field added successfully")
  }

  const handleDeleteObject = (objectId: string) => {
    setCustomObjects((current) => (current || []).filter(obj => obj.id !== objectId))
    toast.success("Custom object deleted")
  }

  const getFieldIcon = (type: CustomField['type']) => {
    const fieldType = fieldTypes.find(ft => ft.value === type)
    return fieldType?.icon || TextT
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
            <PuzzlePiece weight="duotone" size={28} className="text-black dark:text-white" />
            Custom Objects Builder
          </h2>
          <p className="text-muted-foreground mt-1">
            Build custom objects, fields, workflows, and user interfaces
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Create Object
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Object</DialogTitle>
              <DialogDescription>
                Define a new object type with custom fields
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Object Name (API Name)</Label>
                <Input
                  value={newObject.name}
                  onChange={(e) => setNewObject({ ...newObject, name: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                  placeholder="e.g., project, equipment, vendor"
                />
              </div>
              <div>
                <Label>Display Label</Label>
                <Input
                  value={newObject.label}
                  onChange={(e) => setNewObject({ ...newObject, label: e.target.value })}
                  placeholder="e.g., Project, Equipment, Vendor"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateObject}>
                  Create Object
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {customObjects.length === 0 ? (
        <Card className="p-12 text-center border-0 shadow-lg hover:shadow-xl">
          <PuzzlePiece size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
          <p className="text-muted-foreground mb-4">No custom objects created yet</p>
          <Button onClick={() => setShowCreateDialog(true)}>Create Your First Custom Object</Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {customObjects.map(obj => (
            <Card key={obj.id} className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database weight="duotone" size={24} className="text-black dark:text-white" />
                    <div>
                      <CardTitle className="text-lg">{obj.label}</CardTitle>
                      <CardDescription>{obj.name}</CardDescription>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteObject(obj.id)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Fields</span>
                      <Badge variant="outline">{obj.fields.length}</Badge>
                    </div>
                    {obj.fields.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No fields defined</p>
                    ) : (
                      <div className="space-y-2">
                        {obj.fields.map((field, idx) => {
                          const Icon = getFieldIcon(field.type)
                          return (
                            <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-black/5 dark:bg-white/5 rounded">
                              <Icon size={16} className="text-black dark:text-white" />
                              <span className="font-medium text-black dark:text-white">{field.label}</span>
                              <Badge variant="secondary" className="text-xs capitalize">
                                {field.type}
                              </Badge>
                              {field.required && (
                                <Badge variant="destructive" className="text-xs">
                                  Required
                                </Badge>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <Dialog open={showFieldDialog && selectedObject === obj.id} onOpenChange={(open) => {
                    setShowFieldDialog(open)
                    if (!open) setSelectedObject(null)
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setSelectedObject(obj.id)
                          setShowFieldDialog(true)
                        }}
                      >
                        <Plus size={14} className="mr-2" />
                        Add Field
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Field to {obj.label}</DialogTitle>
                        <DialogDescription>
                          Define a new field for this object
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Field Name (API Name)</Label>
                          <Input
                            value={newField.name}
                            onChange={(e) => setNewField({ ...newField, name: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                            placeholder="e.g., project_name, cost, start_date"
                          />
                        </div>
                        <div>
                          <Label>Display Label</Label>
                          <Input
                            value={newField.label}
                            onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                            placeholder="e.g., Project Name, Cost, Start Date"
                          />
                        </div>
                        <div>
                          <Label>Field Type</Label>
                          <Select
                            value={newField.type}
                            onValueChange={(v: any) => setNewField({ ...newField, type: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {fieldTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Required Field</Label>
                          <Switch
                            checked={newField.required}
                            onCheckedChange={(checked) => setNewField({ ...newField, required: checked })}
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                          <Button variant="outline" onClick={() => setShowFieldDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={() => obj.id && handleAddField(obj.id)}>
                            Add Field
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings size={16} className="mr-2" />
                      Configure
                    </Button>
                    <Button size="sm" variant="outline">
                      View Data
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
