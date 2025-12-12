import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CurrencyDollar, CheckCircle } from "@phosphor-icons/react"
import { toast } from "sonner"
import type { Invoice, PartialPayment } from "@/lib/types"

interface PartialPaymentDialogProps {
  invoice: Invoice
  open: boolean
  onOpenChange: (open: boolean) => void
  onPaymentAdded: (invoiceId: string, payment: PartialPayment) => void
}

export function PartialPaymentDialog({
  invoice,
  open,
  onOpenChange,
  onPaymentAdded
}: PartialPaymentDialogProps) {
  const [amount, setAmount] = useState("")

  const amountPaid = invoice.amountPaid || 0
  const amountRemaining = invoice.total - amountPaid

  const handleAddPayment = () => {
    const paymentAmount = parseFloat(amount)

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (paymentAmount > amountRemaining) {
      toast.error(`Payment cannot exceed remaining amount of $${amountRemaining.toFixed(2)}`)
      return
    }

    const payment: PartialPayment = {
      id: `payment-${Date.now()}`,
      amount: paymentAmount,
      paidAt: new Date().toISOString(),
      method: "Simulated"
    }

    onPaymentAdded(invoice.id, payment)
    toast.success(`Payment of $${paymentAmount.toFixed(2)} recorded!`)
    setAmount("")
    onOpenChange(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CurrencyDollar weight="duotone" className="text-primary" />
            Record Partial Payment
          </DialogTitle>
          <DialogDescription>
            Add a partial payment for invoice #{invoice.id.slice(-8)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Invoice Total</p>
                <p className="text-2xl font-bold">{formatCurrency(invoice.total)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(amountPaid)}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Amount Remaining</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(amountRemaining)}</p>
            </CardContent>
          </Card>

          {invoice.partialPayments && invoice.partialPayments.length > 0 && (
            <div>
              <Label className="mb-2">Previous Payments</Label>
              <div className="space-y-2">
                {invoice.partialPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle weight="fill" className="text-green-600" />
                      <span className="text-sm">
                        {new Date(payment.paidAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="payment-amount">Payment Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="payment-amount"
                type="number"
                min="0"
                max={amountRemaining}
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum: {formatCurrency(amountRemaining)}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddPayment}>
            <CurrencyDollar className="mr-2" weight="bold" />
            Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
