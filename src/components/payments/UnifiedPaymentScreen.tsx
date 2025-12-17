import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CreditCard, Bank, Lock, CheckCircle, Calendar, Clock, Repeat, Shield, ShieldCheck, LockKey, Check } from '@phosphor-icons/react'
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
      <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 max-w-5xl h-[96vh] bg-gradient-to-br from-background via-background to-muted/20">
        {/* Premium Header with Security Badge */}
        <div className="relative px-8 pt-8 pb-6 border-b border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 flex-shrink-0">
          <div className="absolute top-4 right-8 flex items-center gap-2 px-3 py-1.5 bg-green-500/10 dark:bg-green-500/20 border border-green-500/30 rounded-full">
            <ShieldCheck size={16} weight="fill" className="text-green-600 dark:text-green-400" />
            <span className="text-xs font-semibold text-green-700 dark:text-green-300">SSL Secured</span>
          </div>
          <DialogHeader className="text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-primary/10 dark:bg-primary/20">
                <LockKey size={24} weight="duotone" className="text-primary" />
              </div>
              <DialogTitle className="text-3xl font-extrabold">{getPaymentTypeLabel()}</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              {description || 'Enterprise-grade security powered by Stripe'}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Summary */}
          <div className="space-y-6">
            <Card className="border-2 border-border/50 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6 space-y-5">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-foreground mb-1">{title}</h3>
                      {contractorName && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                          <p className="text-sm text-muted-foreground">Contractor: <span className="font-medium text-foreground">{contractorName}</span></p>
                        </div>
                      )}
                    </div>
                    {tier && tier !== 'STANDARD' && (
                      <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold px-3 py-1">{tier.replace('_', ' ')}</Badge>
                    )}
                  </div>
                </div>

                <Separator className="bg-border/50" />

                <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground">${breakdown.jobAmount.toFixed(2)}</span>
                  </div>
                  {breakdown.platformFee > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Platform Fee</span>
                      <span className="font-semibold text-foreground">${breakdown.platformFee.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator className="bg-border/50" />
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-lg font-bold text-foreground">Total Amount</span>
                    <span className="text-2xl font-extrabold text-primary">${breakdown.homeownerTotal.toFixed(2)}</span>
                  </div>
                </div>

                {paymentType === 'service' && contractorName && (
                  <div className="p-4 bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle size={20} weight="fill" className="text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm mb-1 text-foreground">Zero-Fee Guarantee</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Contractor receives <span className="font-semibold text-foreground">${breakdown.contractorPayout.toFixed(2)}</span> in full. No platform fees deducted.
                    </p>
                      </div>
                    </div>
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
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Payment Method</h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Shield size={14} weight="fill" className="text-green-600 dark:text-green-400" />
                  <span>256-bit encryption</span>
                </div>
              </div>
              
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
                <div className="space-y-3 mb-6">
                  {userSavedMethods.map((method) => {
                    const getPaymentIcon = () => {
                      if (method.type === 'ach') {
                        return <Bank size={22} weight={selectedSavedMethod === method.id ? "fill" : "regular"} className={selectedSavedMethod === method.id ? "text-primary" : "text-muted-foreground"} />
                      }
                      // Card brand icons
                      const brand = method.card?.brand.toLowerCase() || 'card'
                      return <CreditCard size={22} weight={selectedSavedMethod === method.id ? "fill" : "regular"} className={selectedSavedMethod === method.id ? "text-primary" : "text-muted-foreground"} />
                    }
                    
                    return (
                      <Card
                        key={method.id}
                        className={`cursor-pointer border-2 transition-all hover:shadow-md ${
                          selectedSavedMethod === method.id
                            ? 'border-primary shadow-lg bg-primary/5 dark:bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedSavedMethod(method.id)}
                      >
                        <CardContent className="pt-5 pb-5 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-lg ${
                              selectedSavedMethod === method.id 
                                ? 'bg-primary/20' 
                                : 'bg-muted'
                            }`}>
                              {getPaymentIcon()}
                            </div>
                            <div>
                              <p className="font-semibold text-base text-foreground">
                                {method.type === 'ach' 
                                  ? `${method.bankAccount?.bankName || 'Bank Account'} •••• ${method.bankAccount?.last4}`
                                  : `${method.card?.brand.toUpperCase()} •••• ${method.card?.last4}`
                                }
                              </p>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {method.type === 'ach' 
                                  ? 'Bank Account'
                                  : `Expires ${String(method.card?.expMonth).padStart(2, '0')}/${String(method.card?.expYear).slice(-2)}`
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                          {method.isDefault && (
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Default</Badge>
                            )}
                            {selectedSavedMethod === method.id && (
                              <CheckCircle size={20} weight="fill" className="text-primary" />
                          )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}

              {paymentMethodType === 'new' && (
                <div className="space-y-4">
                  <div className="flex gap-2 mb-4">
                    <Button
                      variant={paymentMethodType === 'new' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPaymentMethodType('new')}
                      className="flex-1"
                    >
                      <CreditCard size={16} className="mr-2" />
                      Credit/Debit Card
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast.info('Bank transfer option coming soon')
                      }}
                      className="flex-1"
                    >
                      <Bank size={16} className="mr-2" />
                      Bank Transfer
                    </Button>
                  </div>
                  
                  <Card className="border-2 border-border bg-card/50">
                    <CardContent className="pt-6 space-y-5">
                    <div>
                        <Label htmlFor="card-number" className="text-sm font-semibold mb-2 block">Card Number</Label>
                        <div className="relative">
                      <Input
                        id="card-number"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                            className="h-12 text-base font-medium tracking-wider pl-4 pr-12"
                      />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {/* Payment method icons */}
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-semibold text-muted-foreground">VISA</span>
                              <span className="text-xs font-semibold text-muted-foreground">MC</span>
                              <span className="text-xs font-semibold text-muted-foreground">AMEX</span>
                            </div>
                            <CreditCard size={20} className="text-muted-foreground" />
                          </div>
                        </div>
                    </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="expiry" className="text-sm font-semibold mb-2 block">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={handleExpiryChange}
                        maxLength={5}
                          className="h-12 text-base font-medium"
                      />
                    </div>
                    <div>
                        <Label htmlFor="cvc" className="text-sm font-semibold mb-2 block">CVC</Label>
                      <Input
                        id="cvc"
                        placeholder="123"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                          className="h-12 text-base font-medium"
                      />
                    </div>
                  </div>
                  <div>
                      <Label htmlFor="zip" className="text-sm font-semibold mb-2 block">Billing Zip Code</Label>
                    <Input
                      id="zip"
                      placeholder="12345"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      maxLength={5}
                        className="h-12 text-base font-medium"
                    />
                  </div>
                    <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                    <input
                      type="checkbox"
                      id="save-card"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                        className="w-4 h-4 rounded border-2 border-primary text-primary focus:ring-primary"
                    />
                      <Label htmlFor="save-card" className="font-medium text-sm cursor-pointer text-foreground">
                        Save card securely for future payments
                    </Label>
                  </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Security Trust Indicators */}
            <Card className="border-2 border-green-500/20 bg-green-500/5 dark:bg-green-500/10">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <ShieldCheck size={20} weight="fill" className="text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-foreground mb-1">Bank-Level Security</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your payment information is encrypted with 256-bit SSL and processed securely through Stripe. We never store your full card details.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Lock size={14} weight="fill" className="text-green-600 dark:text-green-400" />
                      <span className="text-muted-foreground">PCI DSS Compliant</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Shield size={14} weight="fill" className="text-green-600 dark:text-green-400" />
                      <span className="text-muted-foreground">Stripe Protected</span>
                    </div>
                  </div>
            </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="px-8 py-6 border-t border-border/50 bg-muted/20 flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={processing}
            className="w-full sm:w-auto border-2"
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePayment} 
            disabled={processing} 
            className="w-full sm:w-auto min-w-[200px] h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
          >
            {processing ? (
              <>
                <Clock className="animate-spin mr-2" size={18} />
                Processing Payment...
              </>
            ) : (
              <>
                <Lock weight="fill" className="mr-2" size={18} />
                Complete Secure Payment
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
