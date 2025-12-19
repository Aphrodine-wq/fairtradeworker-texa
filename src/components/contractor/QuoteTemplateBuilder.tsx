/**
 * Quote Template Builder
 * Additional Pro Feature - Drag-and-drop professional PDFs with logo/terms
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  FileText,
  Upload,
  Download,
  Plus,
  Trash,
  GripVertical
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User } from "@/lib/types"
import { toast } from "sonner"

interface QuoteTemplate {
  id: string
  name: string
  logo?: string
  sections: { type: 'header' | 'scope' | 'line-items' | 'terms' | 'signature'; content: any }[]
  colors: { primary: string; secondary: string }
  contractorId: string
}

interface QuoteTemplateBuilderProps {
  user: User
}

export function QuoteTemplateBuilder({ user }: QuoteTemplateBuilderProps) {
  const isPro = user.isPro || false
  const [templates, setTemplates] = useLocalKV<QuoteTemplate[]>("quote-templates", [])
  const [currentTemplate, setCurrentTemplate] = useState<QuoteTemplate | null>(null)

  const createTemplate = () => {
    const newTemplate: QuoteTemplate = {
      id: `template-${Date.now()}`,
      name: 'New Template',
      sections: [
        { type: 'header', content: { title: 'Quote', showLogo: true } },
        { type: 'scope', content: { description: '{{description}}' } },
        { type: 'line-items', content: { items: [] } },
        { type: 'terms', content: { text: 'Payment terms: 50% deposit, 50% on completion' } },
        { type: 'signature', content: { showDate: true } }
      ],
      colors: { primary: '#000000', secondary: '#FFFFFF' },
      contractorId: user.id
    }

    setTemplates([...templates, newTemplate])
    setCurrentTemplate(newTemplate)
    toast.success("Template created!")
  }

  const generatePDF = async (template: QuoteTemplate) => {
    try {
      const { generateQuotePDF } = await import('@/lib/pdf')
      
      // Convert template to quote format
      const quote = {
        id: template.id,
        customerName: 'Customer Name', // Would be filled from job
        customerAddress: '',
        items: template.sections
          .filter(s => s.type === 'line-items')
          .flatMap(s => s.content.items || []),
        total: template.sections
          .filter(s => s.type === 'line-items')
          .flatMap(s => s.content.items || [])
          .reduce((sum, item) => sum + (item.total || 0), 0),
        terms: template.sections
          .find(s => s.type === 'terms')
          ?.content?.text || '',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }

      await generateQuotePDF(quote, user)
      toast.success("Quote PDF generated!")
    } catch (error: any) {
      console.error('PDF generation failed:', error)
      if (error.message?.includes('jsPDF')) {
        toast.error("PDF generation requires jsPDF. Install with: npm install jspdf")
      } else {
        toast.error("PDF generation failed")
      }
    }
  }

  if (!isPro) {
    return (
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText weight="duotone" size={24} />
            Quote Template Builder
          </CardTitle>
          <CardDescription>
            Upgrade to Pro to create custom quote templates
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText weight="duotone" size={32} />
            Quote Templates
          </h2>
          <p className="text-black dark:text-white mt-1">
            Create professional PDF quotes with your branding
          </p>
        </div>
        <Button onClick={createTemplate}>
          <Plus size={16} className="mr-2" />
          New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card glass={isPro}>
          <CardContent className="py-12 text-center">
            <FileText size={48} weight="duotone" className="mx-auto mb-4 text-black dark:text-white opacity-50" />
            <p className="text-black dark:text-white mb-4">No templates yet</p>
            <Button onClick={createTemplate}>Create First Template</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card key={template.id} glass={isPro}>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>
                  {template.sections.length} sections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border-0 shadow-md hover:shadow-lg bg-white dark:bg-black">
                  <div className="space-y-2">
                    {template.sections.map((section, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-black dark:text-white">
                        <GripVertical size={16} />
                        <Badge variant="outline">{section.type}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCurrentTemplate(template)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => generatePDF(template)}
                  >
                    <Download size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {currentTemplate && (
        <Card glass={isPro}>
          <CardHeader>
            <CardTitle>Edit Template: {currentTemplate.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Template Name</Label>
              <Input
                value={currentTemplate.name}
                onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Logo</Label>
              <Button variant="outline" className="mt-2">
                <Upload size={16} className="mr-2" />
                Upload Logo
              </Button>
            </div>
            <div>
              <Label>Primary Color</Label>
              <Input
                type="color"
                value={currentTemplate.colors.primary}
                onChange={(e) => setCurrentTemplate({
                  ...currentTemplate,
                  colors: { ...currentTemplate.colors, primary: e.target.value }
                })}
                className="mt-2 w-20 h-10"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => {
                setTemplates(templates.map(t =>
                  t.id === currentTemplate.id ? currentTemplate : t
                ))
                setCurrentTemplate(null)
                toast.success("Template saved!")
              }}>
                Save
              </Button>
              <Button variant="outline" onClick={() => setCurrentTemplate(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
