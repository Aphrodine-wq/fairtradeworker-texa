/**
 * Create Invoice From Context Dialog
 * 
 * Enhanced Invoice & Payment System - "Instant Invoice"
 * Allows creating invoices directly from completed milestones or approved change orders
 */

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Receipt, CircleNotch } from '@phosphor-icons/react'
import type { Invoice, InvoiceLineItem, Milestone, ScopeChange, Job, User } from '@/lib/types'
import { useKV } from '@github/spark/hooks'

interface CreateInvoiceFromContextDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  context: {
    type: 'milestone' | 'changeOrder'
    milestone?: Milestone
    changeOrder?: ScopeChange
    job: Job
  }
  user: User
  onNavigate?: (page: string) => void
}

export function CreateInvoiceFromContextDialog({
  open,
  onOpenChange,
  context,
  user,
  onNavigate
}: CreateInvoiceFromContextDialogProps) {
  const [invoices, setInvoices] = useKV<Invoice[]>('invoices', [])
  const [taxRate, setTaxRate] = useState(8.25)
  const [dueDate, setDueDate] = useState('')
  const [customNotes, setCustomNotes] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([])

  // Initialize line items from context
  useEffect(() => {
    if (open && context) {
      if (context.type === 'milestone' && context.milestone) {
        const milestone = context.milestone
        setLineItems([{
          description: `${milestone.name}${milestone.description ? ` - ${milestone.description}` : ''}`,
          quantity: 1,
          rate: milestone.amount,
          total: milestone.amount
        }])
      } else if (context.type === 'changeOrder' && context.changeOrder) {
        const changeOrder = context.changeOrder
        setLineItems([{
          description: `Change Order: ${changeOrder.description}`,
          quantity: 1,
          rate: changeOrder.additionalCost,
          total: changeOrder.additionalCost
        }])
      }

      // Set due date to 30 days from now
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30)
      setDueDate(futureDate.toISOString().split('T')[0])
    }
  }, [open, context])

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * (taxRate / 100)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleCreateInvoice = async () => {
    if (!dueDate) {
      toast.error('Please set a due date')
      return
    }

    const dueDateObj = new Date(dueDate)
    if (dueDateObj < new Date()) {
      toast.error('Due date cannot be in the past')
      return
    }

    if (lineItems.length === 0 || calculateSubtotal() <= 0) {
      toast.error('Invoice must have valid line items')
      return
    }

    setIsCreating(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      const subtotal = calculateSubtotal()
      const taxAmount = calculateTax()
      const total = calculateTotal()

      const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        contractorId: user.id,
        jobId: context.job.id,
        jobTitle: context.job.title,
        lineItems: lineItems.map(item => ({ ...item })),
        subtotal,
        taxRate,
        taxAmount,
        total,
        status: 'sent',
        dueDate,
        sentDate: new Date().toISOString(),
        isProForma: false,
        lateFeeApplied: false,
        useCompanyLogo: true,
        customNotes: customNotes.trim() || undefined,
        createdAt: new Date().toISOString()
      }

      setInvoices((current) => [...(current || []), newInvoice])

      toast.success(
        `Invoice for $${total.toLocaleString()} created and sent!`,
        {
          description: `Due date: ${new Date(dueDate).toLocaleDateString()}`
        }
      )

      onOpenChange(false)

      // Optionally navigate to invoice manager
      if (onNavigate) {
        setTimeout(() => {
          onNavigate('invoices')
        }, 1000)
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast.error('Failed to create invoice. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const contextLabel = context.type === 'milestone' 
    ? `Milestone: ${context.milestone?.name}`
    : `Change Order: ${context.changeOrder?.description.substring(0, 50)}...`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt size={20} weight="bold" />
            Create Invoice
          </DialogTitle>
          <DialogDescription>
            {contextLabel} • {context.job.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Pre-filled Line Items */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">Line Items</Label>
            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium">{item.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-lg">
                        ${item.total.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × ${item.rate.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax Rate */}
          <div>
            <Label htmlFor="tax-rate">Tax Rate (%)</Label>
            <Input
              id="tax-rate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Totals Preview */}
          <div className="p-4 border rounded-lg bg-muted/30">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">${calculateSubtotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax ({taxRate}%):</span>
                <span className="font-medium">${calculateTax().toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-bold text-lg">
                <span>Total:</span>
                <span>${calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <Label htmlFor="due-date">Due Date *</Label>
            <Input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Custom Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <textarea
              id="notes"
              className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-md"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Add any additional notes for this invoice..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateInvoice}
            disabled={isCreating || !dueDate}
          >
            {isCreating ? (
              <>
                <CircleNotch size={16} className="mr-2 animate-spin" weight="bold" />
                Creating...
              </>
            ) : (
              <>
                <Receipt size={16} className="mr-2" weight="bold" />
                Create Invoice
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
