import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useKV } from "@github/spark/hooks"
import { toast } from "sonner"
import { Plus, Receipt, Clock, CheckCircle, Warning } from "@phosphor-icons/react"
import type { User, Invoice, Job } from "@/lib/types"

interface InvoicesProps {
  user: User
  onNavigate: (page: string) => void
}

export function Invoices({ user, onNavigate }: InvoicesProps) {
  const [invoices, setInvoices] = useKV<Invoice[]>("invoices", [])
  const [jobs] = useKV<Job[]>("jobs", [])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState("")
  const [amount, setAmount] = useState("")
  const [dueDate, setDueDate] = useState("")

  const myInvoices = (invoices || []).filter(inv => inv.contractorId === user.id)
  
  const completedJobs = (jobs || []).filter(job =>
    job.bids.some(bid => bid.contractorId === user.id && bid.status === 'accepted')
  )

  const handleCreateInvoice = () => {
    if (!selectedJobId || !amount || !dueDate) {
      toast.error("Please fill in all fields")
      return
    }

    const job = completedJobs.find(j => j.id === selectedJobId)
    if (!job) return

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      contractorId: user.id,
      jobId: selectedJobId,
      jobTitle: job.title,
      amount: parseInt(amount),
      status: 'sent',
      dueDate,
      lateFeeApplied: false,
      createdAt: new Date().toISOString()
    }

    setInvoices((current) => [...(current || []), newInvoice])
    toast.success("Invoice created and sent!")
    setDialogOpen(false)
    setSelectedJobId("")
    setAmount("")
    setDueDate("")
  }

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'default'
      case 'sent':
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
        return <Clock weight="fill" size={16} />
      case 'overdue':
        return <Warning weight="fill" size={16} />
      default:
        return <Receipt weight="fill" size={16} />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Invoices</h2>
          <p className="text-muted-foreground">Manage your billing</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2" weight="bold" />
          New Invoice
        </Button>
      </div>

      {myInvoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Receipt className="text-muted-foreground mb-4" size={64} weight="duotone" />
            <h3 className="text-xl font-semibold mb-2">No Invoices Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first invoice to get started
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2" weight="bold" />
              Create Invoice
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {myInvoices.map(invoice => (
            <Card key={invoice.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{invoice.jobTitle}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-2xl font-bold">${invoice.amount}</p>
                    <Badge variant={getStatusColor(invoice.status)} className="flex items-center gap-1">
                      {getStatusIcon(invoice.status)}
                      {invoice.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Select a job and enter invoice details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="job">Job</Label>
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger id="job">
                  <SelectValue placeholder="Select a job" />
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
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateInvoice}>
              Create & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
