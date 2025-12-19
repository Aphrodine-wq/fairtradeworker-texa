import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Clock, CreditCard, Calendar } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { calculatePaymentBreakdown, type PaymentBreakdown } from '@/lib/stripe'
import type { Milestone, JobTier } from '@/lib/types'

interface MilestonePaymentDialogProps {
  open: boolean
  onClose: () => void
  milestone: Milestone
  jobTitle: string
  jobId: string
  contractorName: string
  tier?: JobTier
  onPaymentComplete: (milestoneId: string, paymentId: string) => void
}

export function MilestonePaymentDialog({
  open,
  onClose,
  milestone,
  jobTitle,
  jobId,
  contractorName,
  tier = 'MAJOR_PROJECT',
  onPaymentComplete
}: MilestonePaymentDialogProps) {
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'saved' | 'new'>('saved')

  const breakdown: PaymentBreakdown = calculatePaymentBreakdown(milestone.amount, tier)

  const handlePayment = async () => {
    setProcessing(true)

    try {
      await new Promise<void>(resolve => setTimeout(resolve, 2000))

      const paymentId = `pi_${Date.now()}_${Math.random().toString(36).substring(7)}`
      
      toast.success('Milestone payment processed!', {
        description: `$${breakdown.homeownerTotal.toFixed(2)} paid for "${milestone.name}"`
      })

      onPaymentComplete(milestone.id, paymentId)
      onClose()
    } catch (error) {
      toast.error('Payment failed', {
        description: 'Please try again or use a different payment method'
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 h-[95vh]">
        <div className="px-8 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl">Pay Milestone</DialogTitle>
            <DialogDescription>
              Approve and pay for completed work
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-hidden p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Summary */}
          <div className="space-y-4">
            <Card className="border-0 shadow-lg hover:shadow-xl bg-white dark:bg-black">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-base">{milestone.name}</h3>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    </div>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {milestone.percentage}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Job: {jobTitle} • Contractor: {contractorName}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  {milestone.photos && milestone.photos.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="text-black dark:text-white" size={16} weight="fill" />
                      <span>{milestone.photos.length} verification photos attached</span>
                    </div>
                  )}
                  {milestone.notes && (
                    <div className="p-3 bg-white dark:bg-black rounded-md border-0 shadow-md hover:shadow-lg text-xs font-mono shadow-sm">
                      <p className="text-muted-foreground mb-1 font-medium">Completion Notes:</p>
                      <p>{milestone.notes}</p>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Milestone Amount</span>
                    <span className="font-semibold">${breakdown.jobAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Platform Fee</span>
                    <span className="text-sm">${breakdown.platformFee.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-base font-bold">
                    <span>Total Payment</span>
                    <span>${breakdown.homeownerTotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-white dark:bg-black border-0 shadow-md hover:shadow-lg rounded-md space-y-2 shadow-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="text-primary flex-shrink-0 mt-0.5" size={16} weight="fill" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">Payment Protection</p>
                  <p>
                    Funds are held securely and only released to the contractor after you approve the milestone completion.
                    You have 48 hours to dispute if work doesn't meet expectations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Method */}
          <div className="space-y-4">
            <p className="text-base font-medium">Payment Method</p>
            
            <button
              type="button"
              onClick={() => setPaymentMethod('saved')}
              className={`w-full p-4 border rounded-lg text-left transition-colors ${
                paymentMethod === 'saved' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard size={20} className="text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-sm">Visa •••• 4242</p>
                    <p className="text-xs text-muted-foreground">Expires 12/25</p>
                  </div>
                </div>
                {paymentMethod === 'saved' && (
                  <CheckCircle size={18} weight="fill" className="text-primary" />
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('new')}
              className={`w-full p-4 border-0 shadow-md hover:shadow-lg rounded-md text-left transition-all shadow-sm ${
                paymentMethod === 'new' ? 'bg-black dark:bg-white text-white dark:text-black' : 'hover:shadow-[4px_4px_0_#000] dark:hover:shadow-[4px_4px_0_#fff]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard size={20} className="text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-sm">Use a different card</p>
                    <p className="text-xs text-muted-foreground">Add new payment method</p>
                  </div>
                </div>
                {paymentMethod === 'new' && (
                  <CheckCircle size={18} weight="fill" className="text-primary" />
                )}
              </div>
            </button>
          </div>
        </div>

        <div className="px-8 py-4 border-t border-black/10 dark:border-white/10 flex-shrink-0">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={processing}
              className="flex-1 h-11"
            >
              Review Later
            </Button>
            <Button
              onClick={handlePayment}
              disabled={processing}
              className="flex-1 h-11"
            >
              {processing ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2" size={18} weight="fill" />
                  Approve & Pay ${breakdown.homeownerTotal.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface PaymentPlanSetupProps {
  jobAmount: number
  jobTitle: string
  tier?: JobTier
  onComplete: (plan: PaymentPlan) => void
}

export interface PaymentPlan {
  numberOfPayments: number
  paymentAmount: number
  frequency: 'biweekly' | 'monthly'
  startDate: string
  payments: Array<{
    dueDate: string
    amount: number
  }>
}

export function PaymentPlanSetup({ jobAmount, jobTitle, tier = 'STANDARD', onComplete }: PaymentPlanSetupProps) {
  const [numberOfPayments, setNumberOfPayments] = useState(2)
  const [frequency, setFrequency] = useState<'biweekly' | 'monthly'>('biweekly')

  const breakdown = calculatePaymentBreakdown(jobAmount, tier)
  const paymentAmount = breakdown.homeownerTotal / numberOfPayments

  const generatePaymentSchedule = (): PaymentPlan['payments'] => {
    const payments: PaymentPlan['payments'] = []
    const startDate = new Date()
    
    for (let i = 0; i < numberOfPayments; i++) {
      const dueDate = new Date(startDate)
      if (frequency === 'biweekly') {
        dueDate.setDate(dueDate.getDate() + (i * 14))
      } else {
        dueDate.setMonth(dueDate.getMonth() + i)
      }
      
      payments.push({
        dueDate: dueDate.toISOString(),
        amount: paymentAmount
      })
    }
    
    return payments
  }

  const handleSetup = () => {
    const plan: PaymentPlan = {
      numberOfPayments,
      paymentAmount,
      frequency,
      startDate: new Date().toISOString(),
      payments: generatePaymentSchedule()
    }
    
    onComplete(plan)
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-2">Set Up Payment Plan</h3>
          <p className="text-sm text-muted-foreground">
            Split your payment into installments with 0% interest
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-3 block">Number of Payments</label>
            <div className="grid grid-cols-3 gap-3">
              {[2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setNumberOfPayments(num)}
                  className={`p-3 border-0 shadow-md hover:shadow-lg rounded-md text-center transition-all shadow-sm ${
                    numberOfPayments === num 
                      ? 'bg-black dark:bg-white text-white dark:text-black font-semibold' 
                      : 'hover:shadow-[4px_4px_0_#000] dark:hover:shadow-[4px_4px_0_#fff]'
                  }`}
                >
                  {num} payments
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Payment Frequency</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFrequency('biweekly')}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  frequency === 'biweekly' 
                    ? 'border-primary bg-primary/5 font-semibold' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                Every 2 weeks
              </button>
              <button
                type="button"
                onClick={() => setFrequency('monthly')}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  frequency === 'monthly' 
                    ? 'border-primary bg-primary/5 font-semibold' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-md hover:shadow-lg bg-white dark:bg-black">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Job Amount</span>
              <span className="font-semibold">${jobAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee</span>
              <span>${breakdown.platformFee.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold">${breakdown.homeownerTotal.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold">{numberOfPayments} payments of</span>
              <span className="font-bold text-primary">${paymentAmount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <p className="text-sm font-medium">Payment Schedule</p>
          {generatePaymentSchedule().map((payment, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border-0 shadow-md hover:shadow-lg rounded-md shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black dark:bg-white border-0 shadow-md hover:shadow-lg rounded-md shadow-sm">
                  <Calendar size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Payment {idx + 1}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(payment.dueDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <p className="font-semibold">${payment.amount.toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 p-4 bg-muted/50 rounded-lg">
          <CheckCircle className="text-primary flex-shrink-0 mt-0.5" size={18} weight="fill" />
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">0% Interest</p>
            <p>
              Payment plans are completely free. The contractor receives the full job amount upfront while you pay over time.
            </p>
          </div>
        </div>

        <Button onClick={handleSetup} className="w-full">
          <CheckCircle className="mr-2" size={18} weight="fill" />
          Set Up Payment Plan
        </Button>
      </CardContent>
    </Card>
  )
}
