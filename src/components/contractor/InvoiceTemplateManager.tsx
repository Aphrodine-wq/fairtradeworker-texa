import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { toast } from "sonner"
import { Plus, FloppyDisk, Trash, PencilSimple, Copy, Clock, CheckCircle } from "@phosphor-icons/react"
import type { User, InvoiceTemplate, InvoiceLineItem } from "@/lib/types"

interface InvoiceTemplateManagerProps {
  user: User
  onApplyTemplate?: (template: InvoiceTemplate) => void
}

export function InvoiceTemplateManager({ user, onApplyTemplate }: InvoiceTemplateManagerProps) {
  const [templates, setTemplates] = useKV<InvoiceTemplate[]>("invoice-templates", [])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplate | null>(null)
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { description: '', quantity: 1, rate: 0, total: 0 }
  ])
  const [taxRate, setTaxRate] = useState(8.25)
  const [customNotes, setCustomNotes] = useState("")

  const myTemplates = (templates || []).filter(t => t.contractorId === user.id)

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, rate: 0, total: 0 }])
  }

  const handleUpdateLineItem = (index: number, field: keyof InvoiceLineItem, value: any) => {
    const newLineItems = [...lineItems]
    newLineItems[index] = { ...newLineItems[index], [field]: value }
    
    if (field === 'quantity' || field === 'rate') {
      const qty = field === 'quantity' ? parseFloat(value) || 0 : newLineItems[index].quantity
      const rate = field === 'rate' ? parseFloat(value) || 0 : newLineItems[index].rate
      newLineItems[index].total = qty * rate
    }
    
    setLineItems(newLineItems)
  }

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) {
      toast.error("Template must have at least one line item")
      return
    }
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name")
      return
    }

    if (lineItems.some(item => !item.description.trim())) {
      toast.error("All line items must have a description")
      return
    }

    if (editingTemplate) {
      setTemplates((current) =>
        (current || []).map((t) =>
          t.id === editingTemplate.id
            ? {
                ...t,
                name: templateName,
                description: templateDescription.trim() || undefined,
                lineItems,
                taxRate,
                customNotes: customNotes.trim() || undefined,
              }
            : t
        )
      )
      toast.success("Template updated!")
    } else {
      const newTemplate: InvoiceTemplate = {
        id: `tpl-${Date.now()}`,
        contractorId: user.id,
        name: templateName,
        description: templateDescription.trim() || undefined,
        lineItems,
        taxRate,
        customNotes: customNotes.trim() || undefined,
        useCount: 0,
        createdAt: new Date().toISOString()
      }

      setTemplates((current) => [...(current || []), newTemplate])
      toast.success("Template saved!")
    }

    handleCloseDialog()
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingTemplate(null)
    setTemplateName("")
    setTemplateDescription("")
    setLineItems([{ description: '', quantity: 1, rate: 0, total: 0 }])
    setTaxRate(8.25)
    setCustomNotes("")
  }

  const handleEditTemplate = (template: InvoiceTemplate) => {
    setEditingTemplate(template)
    setTemplateName(template.name)
    setTemplateDescription(template.description || "")
    setLineItems(template.lineItems)
    setTaxRate(template.taxRate)
    setCustomNotes(template.customNotes || "")
    setDialogOpen(true)
  }

  const handleDuplicateTemplate = (template: InvoiceTemplate) => {
    const duplicated: InvoiceTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      name: `${template.name} (Copy)`,
      useCount: 0,
      lastUsed: undefined,
      createdAt: new Date().toISOString()
    }

    setTemplates((current) => [...(current || []), duplicated])
    toast.success("Template duplicated!")
  }

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates((current) => (current || []).filter(t => t.id !== templateId))
    toast.success("Template deleted")
  }

  const handleApplyTemplate = (template: InvoiceTemplate) => {
    setTemplates((current) =>
      (current || []).map((t) =>
        t.id === template.id
          ? {
              ...t,
              useCount: t.useCount + 1,
              lastUsed: new Date().toISOString()
            }
          : t
      )
    )

    if (onApplyTemplate) {
      onApplyTemplate(template)
    }

    toast.success(`Applied "${template.name}" template`)
  }

  const calculateSubtotal = (items: InvoiceLineItem[]) => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FloppyDisk weight="duotone" size={24} className="text-primary" />
            Invoice Templates
          </h3>
          <p className="text-sm text-muted-foreground">Save and reuse common line-item configurations</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="mr-2" weight="bold" size={16} />
          New Template
        </Button>
      </div>

      {myTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FloppyDisk size={48} weight="duotone" className="text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Create reusable invoice templates for common services. Save time by applying them to new invoices.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2" weight="bold" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {myTemplates.map((template) => {
            const subtotal = calculateSubtotal(template.lineItems)
            const taxAmount = subtotal * (template.taxRate / 100)
            const total = subtotal + taxAmount

            return (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{template.name}</CardTitle>
                      {template.description && (
                        <CardDescription className="line-clamp-2 mt-1">
                          {template.description}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant="outline" className="ml-2 shrink-0">
                      {template.lineItems.length} {template.lineItems.length === 1 ? 'item' : 'items'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground space-y-1">
                      {template.lineItems.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="truncate pr-2">{item.description}</span>
                          <span className="shrink-0">{formatCurrency(item.total)}</span>
                        </div>
                      ))}
                      {template.lineItems.length > 2 && (
                        <div className="text-muted-foreground/60">
                          +{template.lineItems.length - 2} more...
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax ({template.taxRate}%):</span>
                        <span>{formatCurrency(taxAmount)}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span className="text-primary">{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>Used {template.useCount} times</span>
                    </div>
                    {template.lastUsed && (
                      <div className="flex items-center gap-1">
                        <CheckCircle size={14} />
                        <span>Last: {formatDate(template.lastUsed)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApplyTemplate(template)}
                      className="flex-1"
                      size="sm"
                    >
                      Apply Template
                    </Button>
                    <Button
                      onClick={() => handleEditTemplate(template)}
                      variant="outline"
                      size="sm"
                    >
                      <PencilSimple size={16} />
                    </Button>
                    <Button
                      onClick={() => handleDuplicateTemplate(template)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy size={16} />
                    </Button>
                    <Button
                      onClick={() => handleDeleteTemplate(template.id)}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create Invoice Template'}
            </DialogTitle>
            <DialogDescription>
              Save common line-item configurations for quick invoice creation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name *</Label>
                <Input
                  id="template-name"
                  placeholder="e.g., Standard Plumbing Service, HVAC Maintenance, etc."
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-description">Description (Optional)</Label>
                <Textarea
                  id="template-description"
                  placeholder="Brief description of when to use this template..."
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Line Items</Label>
                <Button onClick={handleAddLineItem} variant="outline" size="sm">
                  <Plus className="mr-2" size={16} />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Description (e.g., Labor, Faucet Cartridge)"
                            value={item.description}
                            onChange={(e) => handleUpdateLineItem(index, 'description', e.target.value)}
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-xs">Quantity</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="1"
                                value={item.quantity}
                                onChange={(e) => handleUpdateLineItem(index, 'quantity', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Rate ($)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={item.rate}
                                onChange={(e) => handleUpdateLineItem(index, 'rate', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Total</Label>
                              <Input
                                type="text"
                                value={formatCurrency(item.total)}
                                disabled
                                className="bg-muted"
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleRemoveLineItem(index)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash size={18} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="8.25"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-notes">Custom Notes (Optional)</Label>
              <Textarea
                id="custom-notes"
                placeholder="Any default notes to include on invoices using this template..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatCurrency(calculateSubtotal(lineItems))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax ({taxRate}%):</span>
                  <span>{formatCurrency(calculateSubtotal(lineItems) * (taxRate / 100))}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-primary">
                    {formatCurrency(calculateSubtotal(lineItems) + (calculateSubtotal(lineItems) * (taxRate / 100)))}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              <FloppyDisk className="mr-2" weight="bold" />
              {editingTemplate ? 'Update Template' : 'Save Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
