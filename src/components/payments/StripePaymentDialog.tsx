import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CreditCard, Bank, Lock, CheckCircle, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { calculatePaymentBreakdown, type PaymentBreakdown } from '@/lib/stripe'
import type { JobTier } from '@/lib/types'

interface StripePaymentDialogProps {
  open: boolean
  onClose: () => void
  amount: number
  jobTitle: string
  jobId: string
  contractorName: string
  tier?: JobTier
  onPaymentComplete: (paymentId: string) => void
}

export function StripePaymentDialog({
  open,
  onClose,
  amount,
  jobTitle,
  jobId,
  contractorName,
  tier = 'STANDARD',
  onPaymentComplete
}: StripePaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'ach'>('card')
  const [processing, setProcessing] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [saveCard, setSaveCard] = useState(false)

  const breakdown: PaymentBreakdown = calculatePaymentBreakdown(amount, tier)

  const handlePayment = async () => {
    setProcessing(true)

    try {
      await new Promise<void>(resolve => setTimeout(resolve, 2000))

      const paymentId = `pi_${Date.now()}_${Math.random().toString(36).substring(7)}`
      
      toast.success('Payment processed successfully!', {
        description: `$${breakdown.homeownerTotal.toFixed(2)} charged to your card`
      })

      onPaymentComplete(paymentId)
      onClose()
    } catch (error) {
      toast.error('Payment failed', {
        description: 'Please check your card details and try again.'
      })
    } finally {
      setProcessing(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts: string[] = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return value
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '')
    }
    return v
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Complete Payment</DialogTitle>
          <DialogDescription>
            Secure payment powered by Stripe
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{jobTitle}</h3>
                  <p className="text-sm text-muted-foreground">Job ID: {jobId}</p>
                  <p className="text-sm text-muted-foreground mt-1">Contractor: {contractorName}</p>
                </div>
                <Badge variant="outline" className="text-base px-3 py-1">
                  {tier === 'QUICK_FIX' && '🟢 Quick Fix'}
                  {tier === 'STANDARD' && '🟡 Standard'}
                  {tier === 'MAJOR_PROJECT' && '🔵 Major Project'}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Job Amount</span>
                  <span className="font-semibold">${breakdown.jobAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="text-sm">${breakdown.platformFee.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${breakdown.homeownerTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-background rounded-lg border">
                <CheckCircle className="text-primary flex-shrink-0 mt-0.5" size={18} weight="fill" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Contractor receives full amount</p>
                  <p>The contractor will receive ${breakdown.contractorPayout.toFixed(2)} - we don't take a cut from their earnings.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setPaymentMethod('card')}
              >
                <CreditCard className="mr-2" size={18} weight="fill" />
                Credit/Debit Card
              </Button>
              <Button
                type="button"
                variant={paymentMethod === 'ach' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setPaymentMethod('ach')}
              >
                <Bank className="mr-2" size={18} weight="fill" />
                Bank Transfer (ACH)
              </Button>
            </div>

            {paymentMethod === 'card' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                    />
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
                      maxLength={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      placeholder="12345"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').substring(0, 5))}
                      maxLength={5}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="saveCard"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="rounded border-border"
                  />
                  <Label htmlFor="saveCard" className="text-sm cursor-pointer">
                    Save card for future payments
                  </Label>
                </div>
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center space-y-4">
                  <Bank size={48} className="mx-auto text-muted-foreground" weight="fill" />
                  <div className="space-y-2">
                    <h4 className="font-semibold">Bank Transfer (ACH)</h4>
                    <p className="text-sm text-muted-foreground">
                      Connect your bank account for lower fees (0.8% vs 2.9%)
                    </p>
                  </div>
                  <Button variant="outline" className="w-full">
                    Connect Bank Account
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Bank transfers take 3-5 business days to process
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex items-start gap-2 p-4 bg-muted/50 rounded-lg">
            <Lock className="text-muted-foreground flex-shrink-0 mt-0.5" size={18} weight="fill" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Secure Payment</p>
              <p>Your payment information is encrypted and secure. We never store your full card details.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={processing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={processing || (paymentMethod === 'card' && (!cardNumber || !expiry || !cvc || !zipCode))}
              className="flex-1"
            >
              {processing ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="mr-2" size={18} weight="fill" />
                  Pay ${breakdown.homeownerTotal.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
