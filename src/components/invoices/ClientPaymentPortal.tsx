/**
 * Client Payment Portal
 * 
 * Enhanced Invoice & Payment System - "Polite Collections Agent"
 * Self-service portal for clients to view all invoices, status, payment history, and make payments
 */

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Receipt, CheckCircle, Clock, AlertCircle, DollarSign, Calendar, Download, Eye } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Invoice, User } from '@/lib/types'
import { useKV } from '@github/spark/hooks'
import { InvoicePDFGenerator } from '@/components/contractor/InvoicePDFGenerator'
import { generatePaymentPortalUrl } from '@/lib/invoiceHelpers'

interface ClientPaymentPortalProps {
  user: User
  homeownerId: string // Client's ID
}

export function ClientPaymentPortal({ user, homeownerId }: ClientPaymentPortalProps) {
  const [invoices, setInvoices] = useKV<Invoice[]>('invoices', [])
  // In production, would fetch contractors from API. For now, get from jobs
  const [jobs] = useKV<import('@/lib/types').Job[]>('jobs', [])
  
  // Get contractor info from jobs
  const getContractor = (contractorId: string) => {
    // Try to find contractor from job bids
    const job = jobs?.find(j => j.bids.some(b => b.contractorId === contractorId))
    if (job) {
      const bid = job.bids.find(b => b.contractorId === contractorId)
      if (bid) {
        return {
          id: contractorId,
          fullName: bid.contractorName,
          companyName: bid.contractorName
        } as User
      }
    }
    return { id: contractorId, fullName: 'Contractor', companyName: 'Contractor' } as User
  }
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [partialPaymentAmount, setPartialPaymentAmount] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  // Get all invoices for this homeowner
  const clientInvoices = useMemo(() => {
    return (invoices || []).filter(inv => inv.homeownerId === homeownerId)
  }, [invoices, homeownerId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (invoice: Invoice) => {
    switch (invoice.status) {
      case 'paid':
        return <Badge className="bg-green-600 text-white"><CheckCircle size={14} className="mr-1" weight="fill" /> Paid</Badge>
      case 'partially-paid':
        return <Badge className="bg-blue-600 text-white"><Clock size={14} className="mr-1" weight="fill" /> Partial</Badge>
      case 'overdue':
        return <Badge variant="destructive"><AlertCircle size={14} className="mr-1" weight="fill" /> Overdue</Badge>
      case 'sent':
      case 'viewed':
        return <Badge variant="secondary"><Clock size={14} className="mr-1" weight="fill" /> Pending</Badge>
      default:
        return <Badge variant="outline">{invoice.status}</Badge>
    }
  }

  const getFilteredInvoices = () => {
    switch (activeTab) {
      case 'pending':
        return clientInvoices.filter(inv => inv.status === 'sent' || inv.status === 'viewed')
      case 'overdue':
        return clientInvoices.filter(inv => inv.status === 'overdue')
      case 'paid':
        return clientInvoices.filter(inv => inv.status === 'paid')
      default:
        return clientInvoices
    }
  }

  const totalOwed = useMemo(() => {
    return clientInvoices
      .filter(inv => inv.status !== 'paid')
      .reduce((sum, inv) => sum + (inv.amountRemaining || inv.total), 0)
  }, [clientInvoices])

  const handlePayFull = (invoice: Invoice) => {
    const contractor = getContractor(invoice.contractorId)
    if (!contractor) {
      toast.error('Contractor information not found')
      return
    }
    const paymentUrl = generatePaymentPortalUrl(invoice, contractor)
    window.open(paymentUrl, '_blank')
  }

  const handlePartialPayment = () => {
    if (!selectedInvoice) return

    const amount = parseFloat(partialPaymentAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    const remaining = selectedInvoice.amountRemaining || selectedInvoice.total
    if (amount > remaining) {
      toast.error(`Amount cannot exceed remaining balance of ${formatCurrency(remaining)}`)
      return
    }

    // In production, this would process the payment
    toast.success(`Partial payment of ${formatCurrency(amount)} processed!`)
    
    // Update invoice
    const newPartialPayments = [
      ...(selectedInvoice.partialPayments || []),
      {
        id: `partial-${Date.now()}`,
        amount,
        paidAt: new Date().toISOString()
      }
    ]

    const amountPaid = newPartialPayments.reduce((sum, p) => sum + p.amount, 0)
    const amountRemaining = selectedInvoice.total - amountPaid

    setInvoices((current) =>
      current.map(inv =>
        inv.id === selectedInvoice.id
          ? {
              ...inv,
              partialPayments: newPartialPayments,
              amountPaid,
              amountRemaining,
              status: amountRemaining > 0 ? 'partially-paid' : 'paid'
            }
          : inv
      )
    )

    setPaymentDialogOpen(false)
    setPartialPaymentAmount('')
    setSelectedInvoice(null)
  }

  const filteredInvoices = getFilteredInvoices()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Receipt weight="duotone" size={32} className="text-primary" />
          My Invoices
        </h2>
        <p className="text-muted-foreground">View and manage all your invoices in one place</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Owed</CardDescription>
            <CardTitle className="text-3xl text-primary">{formatCurrency(totalOwed)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Invoices</CardDescription>
            <CardTitle className="text-3xl">
              {clientInvoices.filter(inv => inv.status === 'sent' || inv.status === 'viewed').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Overdue</CardDescription>
            <CardTitle className="text-3xl text-destructive">
              {clientInvoices.filter(inv => inv.status === 'overdue').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({clientInvoices.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({clientInvoices.filter(inv => inv.status === 'sent' || inv.status === 'viewed').length})</TabsTrigger>
              <TabsTrigger value="overdue">Overdue ({clientInvoices.filter(inv => inv.status === 'overdue').length})</TabsTrigger>
              <TabsTrigger value="paid">Paid ({clientInvoices.filter(inv => inv.status === 'paid').length})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <Receipt size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Invoices</h3>
              <p className="text-muted-foreground">
                {activeTab === 'all' 
                  ? 'You don\'t have any invoices yet'
                  : `No ${activeTab} invoices found`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => {
                const contractor = getContractor(invoice.contractorId)
                const amountRemaining = invoice.amountRemaining ?? invoice.total
                const amountPaid = invoice.amountPaid ?? 0

                return (
                  <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-lg">{invoice.jobTitle}</h4>
                            {getStatusBadge(invoice)}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                            <div>
                              <span className="block font-medium text-foreground">Invoice #</span>
                              <span className="font-mono">{invoice.id.slice(0, 8).toUpperCase()}</span>
                            </div>
                            <div>
                              <span className="block font-medium text-foreground">Contractor</span>
                              <span>{contractor?.fullName || contractor?.companyName || 'Unknown'}</span>
                            </div>
                            <div>
                              <span className="block font-medium text-foreground">Due Date</span>
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>{formatDate(invoice.dueDate)}</span>
                              </div>
                            </div>
                            <div>
                              <span className="block font-medium text-foreground">Total</span>
                              <span className="font-bold text-foreground text-lg">{formatCurrency(invoice.total)}</span>
                            </div>
                          </div>

                          {invoice.status === 'partially-paid' && (
                            <div className="bg-muted p-3 rounded-md mb-4">
                              <div className="flex justify-between text-sm">
                                <span>Amount Paid:</span>
                                <span className="font-medium">{formatCurrency(amountPaid)}</span>
                              </div>
                              <div className="flex justify-between text-sm mt-1">
                                <span>Remaining:</span>
                                <span className="font-bold">{formatCurrency(amountRemaining)}</span>
                              </div>
                            </div>
                          )}

                          {invoice.partialPayments && invoice.partialPayments.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground mb-1">Payment History:</p>
                              <div className="space-y-1">
                                {invoice.partialPayments.map((payment) => (
                                  <div key={payment.id} className="flex justify-between text-xs">
                                    <span>{formatDate(payment.paidAt)}</span>
                                    <span className="font-medium">{formatCurrency(payment.amount)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          {invoice.status !== 'paid' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handlePayFull(invoice)}
                                className="whitespace-nowrap"
                              >
                                <DollarSign size={16} className="mr-1" weight="bold" />
                                Pay Full Amount
                              </Button>
                              {invoice.total > 100 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedInvoice(invoice)
                                    setPaymentDialogOpen(true)
                                  }}
                                  className="whitespace-nowrap"
                                >
                                  Pay Partial
                                </Button>
                              )}
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              // In production, would open PDF viewer
                              const contractor = getContractor(invoice.contractorId)
                              if (contractor) {
                                // Would use InvoicePDFGenerator here
                                toast.info('PDF preview feature coming soon')
                              }
                            }}
                          >
                            <Eye size={16} className="mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Partial Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make Partial Payment</DialogTitle>
            <DialogDescription>
              {selectedInvoice?.jobTitle} • Remaining: {selectedInvoice && formatCurrency(selectedInvoice.amountRemaining || selectedInvoice.total)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="partial-amount">Payment Amount</Label>
              <Input
                id="partial-amount"
                type="number"
                min="0.01"
                max={selectedInvoice?.amountRemaining || selectedInvoice?.total || 0}
                step="0.01"
                value={partialPaymentAmount}
                onChange={(e) => setPartialPaymentAmount(e.target.value)}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum: {selectedInvoice && formatCurrency(selectedInvoice.amountRemaining || selectedInvoice.total)}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePartialPayment}>
              <DollarSign size={16} className="mr-2" weight="bold" />
              Process Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
