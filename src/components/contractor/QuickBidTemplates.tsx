/**
 * Quick Bid Templates
 * Free Feature - Save common bid structures
 */

import { useState, useCallback } from "react"
import { CircleNotch } from "@phosphor-icons/react"
import { safeInput } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  FileText,
  Plus,
  Trash,
  Copy
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User } from "@/lib/types"
import { toast } from "sonner"

interface BidTemplate {
  id: string
  name: string
  sections: { title: string; content: string }[]
  defaultPrice?: number
  contractorId: string
  createdAt: string
}

interface QuickBidTemplatesProps {
  user: User
  onUseTemplate?: (template: BidTemplate) => void
}

export function QuickBidTemplates({ user, onUseTemplate }: QuickBidTemplatesProps) {
  const [templates, setTemplates] = useLocalKV<BidTemplate[]>(`bid-templates-${user.id}`, [])
  const [showForm, setShowForm] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [defaultPrice, setDefaultPrice] = useState<number>(0)
  const [sections, setSections] = useState<{ title: string; content: string }[]>([
    { title: "Introduction", content: "" },
    { title: "Scope of Work", content: "" },
    { title: "Materials", content: "" },
    { title: "Timeline", content: "" },
    { title: "Terms", content: "" }
  ])

  const [isCreating, setIsCreating] = useState(false)
  const [errors, setErrors] = useState<{
    templateName?: string
    sections?: string
  }>({})

  const createTemplate = useCallback(async () => {
    setErrors({})

    // Validation
    if (!templateName.trim()) {
      setErrors({ templateName: "Template name is required" })
      toast.error("Enter a template name")
      return
    } else if (templateName.trim().length < 3) {
      setErrors({ templateName: "Template name must be at least 3 characters" })
      toast.error("Template name must be at least 3 characters")
      return
    } else if (templateName.trim().length > 100) {
      setErrors({ templateName: "Template name must be less than 100 characters" })
      toast.error("Template name must be less than 100 characters")
      return
    }

    const validSections = sections.filter(s => s.title.trim() || s.content.trim())
    if (validSections.length === 0) {
      setErrors({ sections: "At least one section with content is required" })
      toast.error("Add at least one section with content")
      return
    }

    if (defaultPrice < 0) {
      toast.error("Default price cannot be negative")
      return
    }

    setIsCreating(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      const newTemplate: BidTemplate = {
        id: `template-${Date.now()}`,
        name: safeInput(templateName.trim()),
        sections: validSections.map(s => ({
          title: safeInput(s.title.trim()),
          content: safeInput(s.content.trim())
        })),
        defaultPrice: defaultPrice || undefined,
        contractorId: user.id,
        createdAt: new Date().toISOString()
      }

      setTemplates([...templates, newTemplate])
      toast.success(`Template "${templateName}" created!`)
      setShowForm(false)
      setTemplateName("")
      setDefaultPrice(0)
      setSections([
        { title: "Introduction", content: "" },
        { title: "Scope of Work", content: "" },
        { title: "Materials", content: "" },
        { title: "Timeline", content: "" },
        { title: "Terms", content: "" }
      ])
    } catch (error) {
      console.error("Error creating template:", error)
      toast.error("Failed to create template. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }, [templateName, sections, defaultPrice, templates, user.id, setTemplates])

  const deleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId))
    toast.success("Template deleted")
  }

  const useTemplate = (template: BidTemplate) => {
    if (onUseTemplate) {
      onUseTemplate(template)
    } else {
      toast.info("Template ready to use")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText weight="duotone" size={32} />
            Bid Templates
          </h2>
          <p className="text-black dark:text-white mt-1">
            Save and reuse common bid structures
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-2" />
          New Template
        </Button>
      </div>

      {showForm && (
        <Card glass={false}>
          <CardHeader>
            <CardTitle>Create New Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => {
                  setTemplateName(safeInput(e.target.value))
                  if (errors.templateName) setErrors(prev => ({ ...prev, templateName: undefined }))
                }}
                onBlur={() => {
                  if (templateName.trim() && templateName.trim().length < 3) {
                    setErrors(prev => ({ ...prev, templateName: "Template name must be at least 3 characters" }))
                  }
                }}
                placeholder="e.g., Kitchen Remodel Standard"
                className={`mt-2 ${errors.templateName ? "border-[#FF0000]" : ""}`}
                disabled={isCreating}
                maxLength={100}
                required
                aria-invalid={!!errors.templateName}
                aria-describedby={errors.templateName ? "template-name-error" : undefined}
              />
              {errors.templateName && (
                <p id="template-name-error" className="text-sm text-[#FF0000] font-mono mt-1" role="alert">
                  {errors.templateName}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="default-price">Default Price (optional)</Label>
              <Input
                id="default-price"
                type="number"
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(Number(e.target.value))}
                placeholder="0.00"
                className="mt-2"
              />
            </div>

            <div className="space-y-4">
              <Label>Sections</Label>
              {sections.map((section, idx) => (
                <div key={idx} className="space-y-2">
                  <Input
                    value={section.title}
                    onChange={(e) => {
                      const newSections = [...sections]
                      newSections[idx].title = e.target.value
                      setSections(newSections)
                    }}
                    placeholder="Section title"
                  />
                  <Textarea
                    value={section.content}
                    onChange={(e) => {
                      const newSections = [...sections]
                      newSections[idx].content = e.target.value
                      setSections(newSections)
                    }}
                    placeholder="Section content (can use {{variables}})"
                    className="min-h-[100px]"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={createTemplate} className="flex-1">
                Create Template
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {templates.length === 0 && !showForm ? (
        <Card glass={false}>
          <CardContent className="py-12 text-center">
            <FileText size={48} weight="duotone" className="mx-auto mb-4 text-black dark:text-white opacity-50" />
            <p className="text-black dark:text-white mb-4">No templates yet</p>
            <Button onClick={() => setShowForm(true)}>
              Create First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card key={template.id} glass={false}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>{template.name}</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteTemplate(template.id)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
                <CardDescription>
                  {template.sections.length} sections
                  {template.defaultPrice && ` • Default: $${template.defaultPrice.toLocaleString()}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {template.sections.map((section, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="font-semibold text-black dark:text-white">{section.title}:</span>
                      <span className="text-black dark:text-white ml-2">
                        {section.content.substring(0, 50)}...
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full"
                  onClick={() => useTemplate(template)}
                >
                  <Copy size={16} className="mr-2" />
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
