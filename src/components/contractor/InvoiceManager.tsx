import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FeeComparison } from "./FeeComparison"
import { useKV } from "@github/spark/hooks"
import { toast } from "sonner"
import { Plus, Receipt, Clock, CheckCircle, Warning, Trash, Calculator, ArrowClockwise, CurrencyDollar, Image as ImageIcon, FloppyDisk } from "@phosphor-icons/react"
import type { User, Invoice, InvoiceLineItem, Job, PartialPayment, InvoiceTemplate } from "@/lib/types"
import { InvoicePDFGenerator } from "./InvoicePDFGenerator"
import { PartialPaymentDialog } from "./PartialPaymentDialog"
import { InvoiceTemplateManager } from "./InvoiceTemplateManager"

interface InvoiceManagerProps {
  user: User
  onNavigate: (page: string) => void
}

export function InvoiceManager({ user, onNavigate }: InvoiceManagerProps) {
  const [invoices, setInvoices] = useKV<Invoice[]>("invoices", [])
  const [jobs] = useKV<Job[]>("jobs", [])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [selectedJobId, setSelectedJobId] = useState("")
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { description: '', quantity: 1, rate: 0, total: 0 }
  ])
  const [taxRate, setTaxRate] = useState(8.25)
  const [dueDate, setDueDate] = useState("")
  const [isProForma, setIsProForma] = useState(false)
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringInterval, setRecurringInterval] = useState<'monthly' | 'quarterly'>('monthly')
  const [useCompanyLogo, setUseCompanyLogo] = useState(true)
  const [customNotes, setCustomNotes] = useState("")

  const myInvoices = (invoices || []).filter(inv => inv.contractorId === user.id)
  
  const completedJobs = (jobs || []).filter(job =>
    job.bids.some(bid => bid.contractorId === user.id && bid.status === 'accepted')
  )

  const handleApplyTemplate = (template: InvoiceTemplate) => {
    setLineItems(template.lineItems.map(item => ({ ...item })))
    setTaxRate(template.taxRate)
    setCustomNotes(template.customNotes || "")
    setDialogOpen(true)
    toast.success(`Applied "${template.name}" template`)
  }

  const handleSaveAsTemplate = () => {
    if (lineItems.some(item => !item.description.trim())) {
      toast.error("All line items must have a description to save as template")
      return
    }
    setTemplateDialogOpen(true)
  }

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
      toast.error("Invoice must have at least one line item")
      return
    }
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * (taxRate / 100)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleCreateInvoice = () => {
    if (!selectedJobId) {
      toast.error("Please select a job")
      return
    }

    if (!dueDate) {
      toast.error("Please set a due date")
      return
    }

    if (lineItems.some(item => !item.description.trim() || item.total === 0)) {
      toast.error("All line items must have a description and amount")
      return
    }

    const job = completedJobs.find(j => j.id === selectedJobId)
    if (!job) return

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      contractorId: user.id,
      jobId: selectedJobId,
      jobTitle: job.title,
      lineItems: lineItems,
      subtotal: calculateSubtotal(),
      taxRate: taxRate,
      taxAmount: calculateTax(),
      total: calculateTotal(),
      status: 'sent',
      dueDate,
      sentDate: new Date().toISOString(),
      isProForma: isProForma,
      lateFeeApplied: false,
      isRecurring: isRecurring,
      recurringInterval: isRecurring ? recurringInterval : undefined,
      useCompanyLogo: useCompanyLogo,
      customNotes: customNotes.trim() || undefined,
      createdAt: new Date().toISOString()
    }

    setInvoices((current) => [...(current || []), newInvoice])
    toast.success(isProForma ? "Pro forma invoice created!" : "Invoice created and sent!")
    handleCloseDialog()
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedJobId("")
    setLineItems([{ description: '', quantity: 1, rate: 0, total: 0 }])
    setTaxRate(8.25)
    setDueDate("")
    setIsProForma(false)
    setIsRecurring(false)
    setRecurringInterval('monthly')
    setUseCompanyLogo(true)
    setCustomNotes("")
  }

  const handleOpenPaymentDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setPaymentDialogOpen(true)
  }

  const handlePaymentAdded = (invoiceId: string, payment: PartialPayment) => {
    setInvoices((current) =>
      (current || []).map((inv) => {
        if (inv.id === invoiceId) {
          const partialPayments = [...(inv.partialPayments || []), payment]
          const amountPaid = partialPayments.reduce((sum, p) => sum + p.amount, 0)
          const amountRemaining = inv.total - amountPaid
          
          const newStatus = amountRemaining <= 0 
            ? 'paid' 
            : amountPaid > 0 
              ? 'partially-paid' 
              : inv.status

          return {
            ...inv,
            partialPayments,
            amountPaid,
            amountRemaining,
            status: newStatus,
            paidDate: amountRemaining <= 0 ? new Date().toISOString() : inv.paidDate
          }
        }
        return inv
      })
    )
  }

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'default'
      case 'partially-paid':
        return 'secondary'
      case 'sent':
      case 'viewed':
        return 'secondary'
      case 'overdue':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle weight="fill" size={16} />
      case 'sent':
      case 'viewed':
        return <Clock weight="fill" size={16} />
      case 'overdue':
        return <Warning weight="fill" size={16} />
      default:
        return <Receipt weight="fill" size={16} />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Receipt weight="duotone" size={32} className="text-primary" />
            Invoice Management
          </h2>
          <p className="text-muted-foreground">Create and track professional invoices</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2" weight="bold" />
          New Invoice
        </Button>
      </div>

      {!user.isPro && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Pro Features Available</CardTitle>
            <CardDescription>
              Upgrade to Pro to unlock auto-reminders, recurring invoices, and partial payment tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => onNavigate('pro-upgrade')}>Upgrade to Pro - $39/mo</Button>
          </CardContent>
        </Card>
      )}

      <InvoiceTemplateManager user={user} onApplyTemplate={handleApplyTemplate} />

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({myInvoices.length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({myInvoices.filter(i => i.status === 'draft').length})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({myInvoices.filter(i => i.status === 'sent' || i.status === 'viewed').length})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({myInvoices.filter(i => i.status === 'paid').length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({myInvoices.filter(i => i.status === 'overdue').length})</TabsTrigger>
        </TabsList>

        {['all', 'draft', 'sent', 'paid', 'overdue'].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue}>
            {myInvoices.filter(inv => {
              if (tabValue === 'all') return true
              if (tabValue === 'sent') return inv.status === 'sent' || inv.status === 'viewed'
              return inv.status === tabValue
            }).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Receipt className="text-muted-foreground mb-4" size={64} weight="duotone" />
                  <h3 className="text-xl font-semibold mb-2">No {tabValue === 'all' ? '' : tabValue} invoices</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {tabValue === 'all' ? 'Create your first invoice to get started' : `No invoices with status: ${tabValue}`}
                  </p>
                  {tabValue === 'all' && (
                    <Button onClick={() => setDialogOpen(true)}>
                      <Plus className="mr-2" weight="bold" />
                      Create Invoice
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3 mt-4">
                {myInvoices.filter(inv => {
                  if (tabValue === 'all') return true
                  if (tabValue === 'sent') return inv.status === 'sent' || inv.status === 'viewed'
                  return inv.status === tabValue
                }).map(invoice => (
                  <Card key={invoice.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1 flex items-center gap-2 flex-wrap">
                            {invoice.jobTitle}
                            {invoice.isProForma && (
                              <Badge variant="outline">Pro Forma</Badge>
                            )}
                            {invoice.isRecurring && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <ArrowClockwise weight="fill" size={12} />
                                Recurring
                              </Badge>
                            )}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                            {invoice.sentDate && ` • Sent: ${new Date(invoice.sentDate).toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-2xl font-bold">{formatCurrency(invoice.total)}</p>
                          <Badge variant={getStatusColor(invoice.status)} className="flex items-center gap-1">
                            {getStatusIcon(invoice.status)}
                            {invoice.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {invoice.lineItems.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {item.description} ({item.quantity} × {formatCurrency(item.rate)})
                            </span>
                            <span className="font-medium">{formatCurrency(item.total)}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatCurrency(invoice.subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax ({invoice.taxRate}%)</span>
                            <span>{formatCurrency(invoice.taxAmount)}</span>
                          </div>
                          <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>{formatCurrency(invoice.total)}</span>
                          </div>
                          {invoice.amountPaid && invoice.amountPaid > 0 && (
                            <>
                              <div className="flex justify-between text-sm text-green-600">
                                <span>Amount Paid</span>
                                <span>{formatCurrency(invoice.amountPaid)}</span>
                              </div>
                              <div className="flex justify-between text-sm font-semibold text-primary">
                                <span>Remaining</span>
                                <span>{formatCurrency(invoice.amountRemaining || 0)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {invoice.status === 'paid' && (
                        <div className="mt-4">
                          <FeeComparison amount={invoice.total} variant="compact" />
                        </div>
                      )}
                      
                      <div className="mt-4 space-y-2">
                        {invoice.useCompanyLogo === false && (
                          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded flex items-center gap-2">
                            <ImageIcon size={14} weight="duotone" />
                            Using FairTradeWorker Texas generic logo
                          </div>
                        )}
                        {invoice.customNotes && (
                          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                            <strong>Notes:</strong> {invoice.customNotes}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <InvoicePDFGenerator invoice={invoice} contractor={user} />
                          {user.isPro && invoice.status !== 'paid' && invoice.status !== 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenPaymentDialog(invoice)}
                            >
                              <CurrencyDollar className="mr-2" weight="bold" />
                              Record Payment
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Build a professional invoice with line items, tax calculation, and payment terms
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job">Select Job</Label>
                <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                  <SelectTrigger id="job">
                    <SelectValue placeholder="Choose a job" />
                  </SelectTrigger>
                  <SelectContent>
                    {completedJobs.map(job => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="proforma"
                checked={isProForma}
                onChange={(e) => setIsProForma(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="proforma" className="text-sm">
                This is a Pro Forma (estimate) invoice
              </Label>
            </div>

            {user.isPro && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="recurring" className="text-sm flex items-center gap-2">
                  <ArrowClockwise weight="duotone" size={16} />
                  Recurring invoice (Pro feature)
                </Label>
              </div>
            )}

            {isRecurring && user.isPro && (
              <div className="space-y-2">
                <Label htmlFor="recurringInterval">Recurring Interval</Label>
                <Select value={recurringInterval} onValueChange={(value: 'monthly' | 'quarterly') => setRecurringInterval(value)}>
                  <SelectTrigger id="recurringInterval">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Every 3 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useCompanyLogo"
                checked={useCompanyLogo}
                onChange={(e) => setUseCompanyLogo(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="useCompanyLogo" className="text-sm flex items-center gap-2">
                <ImageIcon weight="duotone" size={16} />
                {user.companyLogo 
                  ? "Use my company logo on this invoice"
                  : "Use FairTradeWorker Texas generic logo (tax-compliant)"
                }
              </Label>
            </div>

            {!user.companyLogo && (
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                💡 <strong>Tip:</strong> Add your company logo in settings to brand your invoices professionally.
                For now, invoices will use the FairTradeWorker Texas logo to ensure tax compliance.
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="customNotes">Custom Notes (Optional)</Label>
              <Textarea
                id="customNotes"
                placeholder="Payment instructions, warranty info, or special terms..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Line Items</Label>
                <Button variant="outline" size="sm" onClick={handleAddLineItem}>
                  <Plus className="mr-2" size={16} />
                  Add Item
                </Button>
              </div>

              {lineItems.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Item {index + 1}</span>
                      {lineItems.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveLineItem(index)}
                        >
                          <Trash size={16} />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Input
                        placeholder="Description (e.g., Labor, Materials)"
                        value={item.description}
                        onChange={(e) => handleUpdateLineItem(index, 'description', e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => handleUpdateLineItem(index, 'quantity', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Rate ($)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => handleUpdateLineItem(index, 'rate', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Total</Label>
                        <div className="h-10 flex items-center px-3 bg-muted rounded-md font-medium">
                          {formatCurrency(item.total)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Calculator weight="duotone" size={20} className="text-primary" />
                  <span className="font-semibold">Invoice Summary</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Tax Rate (%)</span>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={taxRate}
                        onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                        className="w-20 h-8 text-sm"
                      />
                    </div>
                    <span className="font-medium">{formatCurrency(calculateTax())}</span>
                  </div>
                  
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <Button 
                variant="outline" 
                onClick={handleSaveAsTemplate}
                className="mr-auto"
              >
                <FloppyDisk className="mr-2" weight="bold" size={16} />
                Save as Template
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button onClick={handleCreateInvoice}>
                  <Receipt className="mr-2" weight="bold" />
                  {isProForma ? 'Create Pro Forma' : 'Create & Send'}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedInvoice && (
        <PartialPaymentDialog
          invoice={selectedInvoice}
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          onPaymentAdded={handlePaymentAdded}
        />
      )}

      <SaveTemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        lineItems={lineItems}
        taxRate={taxRate}
        customNotes={customNotes}
        user={user}
      />
    </div>
  )
}

function SaveTemplateDialog({ 
  open, 
  onOpenChange, 
  lineItems, 
  taxRate, 
  customNotes,
  user 
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  lineItems: InvoiceLineItem[]
  taxRate: number
  customNotes: string
  user: User
}) {
  const [templates, setTemplates] = useKV<InvoiceTemplate[]>("invoice-templates", [])
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")

  const handleSave = () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name")
      return
    }

    const newTemplate: InvoiceTemplate = {
      id: `tpl-${Date.now()}`,
      contractorId: user.id,
      name: templateName.trim(),
      description: templateDescription.trim() || undefined,
      lineItems: lineItems.map(item => ({ ...item })),
      taxRate,
      customNotes: customNotes.trim() || undefined,
      useCount: 0,
      createdAt: new Date().toISOString()
    }

    setTemplates((current) => [...(current || []), newTemplate])
    toast.success(`Template "${templateName}" saved!`)
    
    setTemplateName("")
    setTemplateDescription("")
    onOpenChange(false)
  }

  const handleClose = () => {
    setTemplateName("")
    setTemplateDescription("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Save these line items as a reusable template
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="save-template-name">Template Name *</Label>
            <Input
              id="save-template-name"
              placeholder="e.g., Standard Plumbing Service"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="save-template-description">Description (Optional)</Label>
            <Textarea
              id="save-template-description"
              placeholder="Brief description..."
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <strong>Included:</strong> {lineItems.length} line items, {taxRate}% tax rate
            {customNotes && ', custom notes'}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <FloppyDisk className="mr-2" weight="bold" />
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
