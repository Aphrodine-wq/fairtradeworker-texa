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
      <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 max-w-5xl h-[96vh] max-h-[96vh]">
        {/* Premium Header */}
        <div className="px-10 pt-8 pb-6 border-b border-border/50 bg-gradient-to-b from-background to-muted/20 flex-shrink-0">
          <DialogHeader className="text-left space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-3xl font-extrabold tracking-tight">{getPaymentTypeLabel()}</DialogTitle>
                <DialogDescription className="text-base mt-2 flex items-center gap-2">
                  <Lock size={16} weight="fill" className="text-primary" />
                  {description || 'Secure payment powered by Stripe'}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle size={16} weight="fill" className="text-green-600 dark:text-green-400" />
                <span>SSL Encrypted</span>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-10 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Summary */}
          <div className="space-y-6">
            <Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-bold text-xl text-foreground">{title}</h3>
                      {contractorName && (
                        <p className="text-sm text-muted-foreground">Contractor: <span className="font-medium text-foreground">{contractorName}</span></p>
                      )}
                    </div>
                    {tier && tier !== 'STANDARD' && (
                      <Badge variant="secondary" className="text-xs px-3 py-1">{tier.replace('_', ' ')}</Badge>
                    )}
                  </div>
                </div>

                <Separator className="bg-border/50" />

                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-base text-muted-foreground">Amount</span>
                      <span className="font-semibold text-lg text-foreground">${breakdown.jobAmount.toFixed(2)}</span>
                    </div>
                    {breakdown.platformFee > 0 && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-base text-muted-foreground">Platform Fee</span>
                        <span className="font-semibold text-base text-foreground">${breakdown.platformFee.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xl font-bold text-foreground">Total</span>
                    <span className="text-3xl font-extrabold text-primary">${breakdown.homeownerTotal.toFixed(2)}</span>
                  </div>
                </div>

                {paymentType === 'service' && contractorName && (
                  <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={18} weight="fill" className="text-primary" />
                      <p className="font-semibold text-sm">Contractor receives full amount</p>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      ${breakdown.contractorPayout.toFixed(2)} (zero fees deducted)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Installments */}
            {enableInstallments && (
              <Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <Repeat size={22} weight="duotone" className="text-primary" />
                    <h4 className="font-bold text-lg">Installment Plan</h4>
                  </div>
                  <RadioGroup value={installmentCount?.toString() || '1'} onValueChange={(v) => setInstallmentCount(parseInt(v))}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="1" id="install-1" />
                        <Label htmlFor="install-1" className="font-medium cursor-pointer flex-1">Pay in full (${breakdown.homeownerTotal.toFixed(2)})</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="2" id="install-2" />
                        <Label htmlFor="install-2" className="font-medium cursor-pointer flex-1">2 payments (${(breakdown.homeownerTotal / 2).toFixed(2)} each)</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="3" id="install-3" />
                        <Label htmlFor="install-3" className="font-medium cursor-pointer flex-1">3 payments (${(breakdown.homeownerTotal / 3).toFixed(2)} each)</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {/* Scheduling */}
            {enableScheduling && (
              <Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <Calendar size={22} weight="duotone" className="text-primary" />
                    <h4 className="font-bold text-lg">Schedule Payment</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="schedule-date" className="text-sm font-semibold">Date</Label>
                      <Input
                        id="schedule-date"
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        min={format(new Date(), 'yyyy-MM-dd')}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="schedule-time" className="text-sm font-semibold">Time</Label>
                      <Input
                        id="schedule-time"
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="h-12"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recurring */}
            {enableRecurring && (
              <Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Repeat size={22} weight="duotone" className="text-primary" />
                      <div>
                        <h4 className="font-bold text-lg">Recurring Payment</h4>
                        <p className="text-sm text-muted-foreground mt-0.5">Automatically charge every {recurringInterval}</p>
                      </div>
                    </div>
                    <Button
                      variant={isRecurring ? "default" : "outline"}
                      size="default"
                      onClick={() => setIsRecurring(!isRecurring)}
                      className="h-10"
                    >
                      {isRecurring ? 'Enabled' : 'Enable'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Payment Method */}
          <div className="space-y-6">
            <Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <CreditCard size={24} weight="duotone" className="text-primary" />
                    Payment Method
                  </h3>
                  <p className="text-sm text-muted-foreground">Choose how you'd like to pay</p>
                </div>
                
                {hasSavedMethods && (
                  <RadioGroup value={paymentMethodType} onValueChange={(v) => setPaymentMethodType(v as 'saved' | 'new')}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="saved" id="method-saved" />
                        <Label htmlFor="method-saved" className="font-medium cursor-pointer flex-1">Use saved payment method</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="new" id="method-new" />
                        <Label htmlFor="method-new" className="font-medium cursor-pointer flex-1">Add new payment method</Label>
                      </div>
                    </div>
                  </RadioGroup>
                )}

                {paymentMethodType === 'saved' && hasSavedMethods && (
                  <div className="space-y-3">
                    {userSavedMethods.map((method) => (
                      <Card
                        key={method.id}
                        className={`cursor-pointer border-2 transition-all hover:shadow-md ${
                          selectedSavedMethod === method.id
                            ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-md'
                            : 'border-border/50 hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedSavedMethod(method.id)}
                      >
                        <CardContent className="p-5 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-muted">
                              <CreditCard size={24} weight="duotone" className="text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-base">
                                {method.card?.brand.toUpperCase()} •••• {method.card?.last4}
                              </p>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                Expires {method.card?.expMonth}/{method.card?.expYear}
                              </p>
                            </div>
                          </div>
                          {method.isDefault && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {paymentMethodType === 'new' && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="card-number" className="text-sm font-semibold">Card Number</Label>
                      <Input
                        id="card-number"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                        className="h-12 text-base"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry" className="text-sm font-semibold">Expiry (MM/YY)</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={handleExpiryChange}
                          maxLength={5}
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvc" className="text-sm font-semibold">CVC</Label>
                        <Input
                          id="cvc"
                          placeholder="123"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          maxLength={4}
                          className="h-12"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip" className="text-sm font-semibold">Zip Code</Label>
                      <Input
                        id="zip"
                        placeholder="12345"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                        maxLength={5}
                        className="h-12"
                      />
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                      <input
                        type="checkbox"
                        id="save-card"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="w-5 h-5 rounded border-2"
                      />
                      <Label htmlFor="save-card" className="font-medium cursor-pointer text-sm">
                        Save card for future payments
                      </Label>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                  <Lock size={18} weight="fill" className="text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Your payment information is encrypted and secure</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Premium Footer */}
        <div className="px-10 py-6 border-t border-border/50 bg-gradient-to-b from-muted/20 to-background flex-shrink-0 flex items-center justify-between">
          <Button variant="outline" onClick={onClose} disabled={processing} className="h-12 px-6">
            Cancel
          </Button>
          <Button 
            onClick={handlePayment} 
            disabled={processing} 
            className="min-w-[180px] h-12 px-8 text-base font-semibold shadow-lg"
          >
            {processing ? (
              <>
                <Clock className="animate-spin mr-2" size={18} />
                Processing...
              </>
            ) : (
              <>
                Complete Payment
                <Lock className="ml-2" size={18} weight="fill" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
