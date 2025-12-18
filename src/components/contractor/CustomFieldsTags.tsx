/**
 * Custom Fields & Tags
 * Additional Pro Feature - Add unlimited fields to jobs/leads
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Tag,
  Plus,
  Trash
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User } from "@/lib/types"
import { toast } from "sonner"

interface CustomField {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'select'
  options?: string[]
  applyTo: 'jobs' | 'leads' | 'both'
}

interface CustomFieldsTagsProps {
  user: User
}

export function CustomFieldsTags({ user }: CustomFieldsTagsProps) {
  const isPro = user.isPro || false
  const [customFields, setCustomFields] = useLocalKV<CustomField[]>(`custom-fields-${user.id}`, [])
  const [tags, setTags] = useLocalKV<string[]>(`tags-${user.id}`, [])

  const [newFieldName, setNewFieldName] = useState("")
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'date' | 'select'>('text')
  const [newTag, setNewTag] = useState("")

  const addCustomField = () => {
    if (!newFieldName.trim()) {
      toast.error("Enter a field name")
      return
    }

    const newField: CustomField = {
      id: `field-${Date.now()}`,
      name: newFieldName,
      type: newFieldType,
      applyTo: 'both'
    }

    setCustomFields([...customFields, newField])
    setNewFieldName("")
    toast.success("Custom field added!")
  }

  const deleteCustomField = (fieldId: string) => {
    setCustomFields(customFields.filter(f => f.id !== fieldId))
    toast.success("Field deleted")
  }

  const addTag = () => {
    if (!newTag.trim()) {
      toast.error("Enter a tag name")
      return
    }

    if (tags.includes(newTag)) {
      toast.error("Tag already exists")
      return
    }

    setTags([...tags, newTag])
    setNewTag("")
    toast.success("Tag added!")
  }

  const deleteTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  if (!isPro) {
    return (
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag weight="duotone" size={24} />
            Custom Fields & Tags
          </CardTitle>
          <CardDescription>
            Upgrade to Pro to add custom fields and tags to jobs and leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.href = '/pro-upgrade'}>
            Upgrade to Pro - $59/mo
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Custom Fields */}
      <Card glass={isPro}>
        <CardHeader>
          <CardTitle>Custom Fields</CardTitle>
          <CardDescription>
            Add unlimited custom fields to jobs and leads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Field name"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              className="md:col-span-2"
            />
            <Select value={newFieldType} onValueChange={(v: any) => setNewFieldType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="select">Select</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addCustomField}>
              <Plus size={16} className="mr-2" />
              Add Field
            </Button>
          </div>

          {customFields.length > 0 && (
            <div className="space-y-2">
              {customFields.map((field) => (
                <div
                  key={field.id}
                  className="p-4 border-0 shadow-md hover:shadow-lg flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-black dark:text-white">{field.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{field.type}</Badge>
                      <Badge variant="outline">{field.applyTo}</Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteCustomField(field.id)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      <Card glass={isPro}>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
          <CardDescription>
            Create and manage tags for organizing jobs and leads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Tag name"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
              className="flex-1"
            />
            <Button onClick={addTag}>
              <Plus size={16} className="mr-2" />
              Add Tag
            </Button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="flex items-center gap-2 px-3 py-1"
                >
                  {tag}
                  <button onClick={() => deleteTag(tag)}>
                    <Trash size={12} />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
