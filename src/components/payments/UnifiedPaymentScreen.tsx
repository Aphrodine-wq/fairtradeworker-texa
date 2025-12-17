import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CreditCard, Bank, Lock, CheckCircle, Calendar, Clock, Repeat } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { calculatePaymentBreakdown, calculateStripeFee, type PaymentBreakdown, type PaymentMethod } from '@/lib/stripe'
import { useLocalKV as useKV } from '@/hooks/useLocalKV'
import type { JobTier, User } from '@/lib/types'
import { format } from 'date-fns'

export type PaymentType = 'service' | 'subscription' | 'one-time' | 'invoice' | 'milestone'

interface SavedPaymentMethod {
  id: string
  userId: string
  paymentMethodId: string
  type: 'card' | 'ach'
  card?: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }
  bankAccount?: {
    bankName: string
    last4: string
  }
  isDefault: boolean
  createdAt: string
}

interface UnifiedPaymentScreenProps {
  open: boolean
  onClose: () => void
  paymentType: PaymentType
  amount: number
  title: string
  description?: string
  contractorName?: string
  tier?: JobTier
  user: User
  onPaymentComplete: (paymentId: string, metadata?: any) => void
  // For installments
  enableInstallments?: boolean
  // For scheduling
  enableScheduling?: boolean
  // For recurring
  enableRecurring?: boolean
  recurringInterval?: 'monthly' | 'quarterly' | 'yearly'
}

export function UnifiedPaymentScreen({
  open,
  onClose,
  paymentType,
  amount,
  title,
  description,
  contractorName,
  tier = 'STANDARD',
  user,
  onPaymentComplete,
  enableInstallments = false,
  enableScheduling = false,
  enableRecurring = false,
  recurringInterval = 'monthly'
}: UnifiedPaymentScreenProps) {
  const [paymentMethodType, setPaymentMethodType] = useState<'saved' | 'new'>('saved')
  const [selectedSavedMethod, setSelectedSavedMethod] = useState<string | null>(null)
  const [savedMethods, setSavedMethods] = useKV<SavedPaymentMethod[]>('payment-methods', [])
  const [processing, setProcessing] = useState(false)
  
  // New card fields
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [saveCard, setSaveCard] = useState(false)
  
  // Installments
  const [installmentCount, setInstallmentCount] = useState<number | null>(null)
  
  // Scheduling
  const [scheduleDate, setScheduleDate] = useState<string>('')
  const [scheduleTime, setScheduleTime] = useState<string>('')
  
  // Recurring
  const [isRecurring, setIsRecurring] = useState(false)

  const breakdown: PaymentBreakdown = paymentType !== 'subscription' 
    ? calculatePaymentBreakdown(amount, tier)
    : {
        jobAmount: amount,
        platformFee: 0,
        stripeFee: calculateStripeFee(amount),
        contractorPayout: amount,
        homeownerTotal: amount
      }

  // Load saved payment methods for this user
  useEffect(() => {
    if (open && savedMethods.length > 0) {
      const defaultMethod = savedMethods.find(m => m.userId === user.id && m.isDefault)
      if (defaultMethod) {
        setSelectedSavedMethod(defaultMethod.id)
      } else {
        const userMethod = savedMethods.find(m => m.userId === user.id)
        if (userMethod) {
          setSelectedSavedMethod(userMethod.id)
        }
      }
    }
  }, [open, savedMethods, user.id])

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

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value))
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiry(formatExpiry(e.target.value))
  }

  const handlePayment = async () => {
    // Validation
    if (paymentMethodType === 'new') {
      const cleanedCardNumber = cardNumber.replace(/\s/g, '')
      if (!cleanedCardNumber || cleanedCardNumber.length < 13 || cleanedCardNumber.length > 19) {
        toast.error('Please enter a valid card number')
        return
      }
      if (!expiry || expiry.length !== 5) {
        toast.error('Please enter a valid expiry date (MM/YY)')
        return
      }
      if (!cvc || cvc.length < 3) {
        toast.error('Please enter a valid CVC')
        return
      }
    } else if (!selectedSavedMethod) {
      toast.error('Please select a payment method')
      return
    }

    setProcessing(true)

    try {
      await new Promise<void>(resolve => setTimeout(resolve, 2000))

      const paymentId = `pi_${Date.now()}_${Math.random().toString(36).substring(7)}`

      // Save card if requested
      if (saveCard && paymentMethodType === 'new') {
        const newMethod: SavedPaymentMethod = {
          id: `pm_${Date.now()}`,
          userId: user.id,
          paymentMethodId: paymentId,
          type: 'card',
          card: {
            brand: 'visa', // Would be detected from card number
            last4: cardNumber.slice(-4).replace(/\s/g, ''),
            expMonth: parseInt(expiry.split('/')[0]),
            expYear: 2000 + parseInt(expiry.split('/')[1])
          },
          isDefault: savedMethods.filter(m => m.userId === user.id).length === 0,
          createdAt: new Date().toISOString()
        }
        setSavedMethods([...savedMethods, newMethod])
      }

      const metadata: any = {}
      if (installmentCount) metadata.installments = installmentCount
      if (scheduleDate) metadata.scheduledDate = scheduleDate
      if (isRecurring) {
        metadata.recurring = true
        metadata.recurringInterval = recurringInterval
      }

      toast.success('Payment processed successfully!', {
        description: `$${breakdown.homeownerTotal.toFixed(2)} ${paymentType === 'subscription' ? 'subscription started' : 'charged'}`
      })

      onPaymentComplete(paymentId, metadata)
      onClose()

      // Reset form
      setCardNumber('')
      setExpiry('')
      setCvc('')
      setZipCode('')
      setSaveCard(false)
    } catch (error) {
      toast.error('Payment failed', {
        description: 'Please check your payment details and try again.'
      })
    } finally {
      setProcessing(false)
    }
  }

  const userSavedMethods = savedMethods.filter(m => m.userId === user.id)
  const hasSavedMethods = userSavedMethods.length > 0

  const getPaymentTypeLabel = () => {
    switch (paymentType) {
      case 'service': return 'Service Booking'
      case 'subscription': return 'Subscription'
      case 'one-time': return 'One-Time Payment'
      case 'invoice': return 'Invoice Payment'
      case 'milestone': return 'Milestone Payment'
      default: return 'Payment'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 max-w-4xl h-[95vh]">
        <div className="px-8 pt-6 pb-4 border-b border-black/10 dark:border-white/10 flex-shrink-0">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl">{getPaymentTypeLabel()}</DialogTitle>
            <DialogDescription>
              {description || 'Secure payment powered by Stripe'}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Summary */}
          <div className="space-y-4">
            <Card className="border border-black/10 dark:border-white/10 bg-white dark:bg-black">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{title}</h3>
                      {contractorName && (
                        <p className="text-sm text-muted-foreground mt-1">Contractor: {contractorName}</p>
                      )}
                    </div>
                    {tier && tier !== 'STANDARD' && (
                      <Badge variant="secondary">{tier.replace('_', ' ')}</Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">${breakdown.jobAmount.toFixed(2)}</span>
                  </div>
                  {breakdown.platformFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platform Fee</span>
                      <span className="font-medium">${breakdown.platformFee.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${breakdown.homeownerTotal.toFixed(2)}</span>
                  </div>
                </div>

                {paymentType === 'service' && contractorName && (
                  <div className="p-3 bg-primary/10 rounded-md text-sm">
                    <p className="font-medium mb-1">Contractor receives full amount</p>
                    <p className="text-muted-foreground">
                      ${breakdown.contractorPayout.toFixed(2)} (zero fees deducted)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Installments */}
            {enableInstallments && (
              <Card className="border border-black/10 dark:border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Repeat size={20} />
                    <h4 className="font-semibold">Installment Plan</h4>
                  </div>
                  <RadioGroup value={installmentCount?.toString() || '1'} onValueChange={(v) => setInstallmentCount(parseInt(v))}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="install-1" />
                      <Label htmlFor="install-1" className="font-normal cursor-pointer">Pay in full (${breakdown.homeownerTotal.toFixed(2)})</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="install-2" />
                      <Label htmlFor="install-2" className="font-normal cursor-pointer">2 payments (${(breakdown.homeownerTotal / 2).toFixed(2)} each)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3" id="install-3" />
                      <Label htmlFor="install-3" className="font-normal cursor-pointer">3 payments (${(breakdown.homeownerTotal / 3).toFixed(2)} each)</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {/* Scheduling */}
            {enableScheduling && (
              <Card className="border border-black/10 dark:border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar size={20} />
                    <h4 className="font-semibold">Schedule Payment</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="schedule-date">Date</Label>
                      <Input
                        id="schedule-date"
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        min={format(new Date(), 'yyyy-MM-dd')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="schedule-time">Time</Label>
                      <Input
                        id="schedule-time"
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recurring */}
            {enableRecurring && (
              <Card className="border border-black/10 dark:border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Repeat size={20} />
                      <div>
                        <h4 className="font-semibold">Recurring Payment</h4>
                        <p className="text-sm text-muted-foreground">Automatically charge every {recurringInterval}</p>
                      </div>
                    </div>
                    <Button
                      variant={isRecurring ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsRecurring(!isRecurring)}
                    >
                      {isRecurring ? 'Enabled' : 'Enable'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Payment Method */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold mb-4">Payment Method</h3>
              
              {hasSavedMethods && (
                <RadioGroup value={paymentMethodType} onValueChange={(v) => setPaymentMethodType(v as 'saved' | 'new')}>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="saved" id="method-saved" />
                      <Label htmlFor="method-saved" className="font-normal cursor-pointer">Use saved payment method</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="new" id="method-new" />
                      <Label htmlFor="method-new" className="font-normal cursor-pointer">Add new payment method</Label>
                    </div>
                  </div>
                </RadioGroup>
              )}

              {paymentMethodType === 'saved' && hasSavedMethods && (
                <div className="space-y-2 mb-4">
                  {userSavedMethods.map((method) => (
                    <Card
                      key={method.id}
                      className={`cursor-pointer border-2 transition-all ${
                        selectedSavedMethod === method.id
                          ? 'border-primary'
                          : 'border-black/10 dark:border-white/10'
                      }`}
                      onClick={() => setSelectedSavedMethod(method.id)}
                    >
                      <CardContent className="pt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard size={24} />
                          <div>
                            <p className="font-medium">
                              {method.card?.brand.toUpperCase()} •••• {method.card?.last4}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Expires {method.card?.expMonth}/{method.card?.expYear}
                            </p>
                          </div>
                        </div>
                        {method.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {paymentMethodType === 'new' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry (MM/YY)</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={handleExpiryChange}
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        placeholder="123"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="zip">Zip Code</Label>
                    <Input
                      id="zip"
                      placeholder="12345"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      maxLength={5}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="save-card"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="save-card" className="font-normal cursor-pointer">
                      Save card for future payments
                    </Label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock size={16} />
              <span>Your payment information is encrypted and secure</span>
            </div>
          </div>
        </div>

        <div className="px-8 py-4 border-t border-black/10 dark:border-white/10 flex-shrink-0 flex items-center justify-between">
          <Button variant="outline" onClick={onClose} disabled={processing}>
            Cancel
          </Button>
          <Button onClick={handlePayment} disabled={processing} className="min-w-[120px]">
            {processing ? (
              <>
                <Clock className="animate-spin mr-2" size={16} />
                Processing...
              </>
            ) : (
              <>
                Complete Payment
                <Lock className="ml-2" size={16} />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
