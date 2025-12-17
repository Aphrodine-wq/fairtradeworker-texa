import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Heart, TrendingUp, Users, CheckCircle, Repeat } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { UnifiedPaymentScreen } from '@/components/payments/UnifiedPaymentScreen'
import type { User } from '@/lib/types'

interface DonationInterfaceProps {
  user?: User
  onNavigate?: (page: string) => void
  compact?: boolean
}

export function DonationInterface({ user, onNavigate, compact = false }: DonationInterfaceProps) {
  const [amount, setAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringInterval, setRecurringInterval] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly')
  const [paymentOpen, setPaymentOpen] = useState(false)

  const suggestedAmounts = [10, 25, 50, 100, 250]

  // Mock funding goal - in real app, this would come from backend
  const fundingGoal = 50000
  const currentFunding = 32450
  const fundingProgress = (currentFunding / fundingGoal) * 100

  const handleAmountSelect = (value: number) => {
    setAmount(value)
    setCustomAmount('')
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    const numValue = parseFloat(value.replace(/[^0-9.]/g, ''))
    if (!isNaN(numValue) && numValue > 0) {
      setAmount(numValue)
    } else {
      setAmount(null)
    }
  }

  const handleDonate = () => {
    if (!amount || amount <= 0) {
      toast.error('Please select or enter a donation amount')
      return
    }

    if (!user) {
      toast.info('Please sign in to make a donation', {
        action: {
          label: 'Sign In',
          onClick: () => onNavigate?.('login')
        }
      })
      return
    }

    setPaymentOpen(true)
  }

  const handlePaymentComplete = (paymentId: string) => {
    toast.success('Thank you for your donation! 🎉', {
      description: `Your $${amount?.toFixed(2)} donation helps support our mission.`
    })
    setPaymentOpen(false)
    setAmount(null)
    setCustomAmount('')
    setIsRecurring(false)
  }

  const getImpactMessage = () => {
    if (!amount) return null
    if (amount >= 250) return "Your donation helps fund a complete home renovation project for a family in need."
    if (amount >= 100) return "Your donation helps provide essential home repairs for multiple families."
    if (amount >= 50) return "Your donation helps cover critical home maintenance for a family."
    if (amount >= 25) return "Your donation helps fund emergency home repairs."
    return "Your donation helps support our mission to provide quality home services."
  }

  if (compact) {
    return (
      <Card className="border-2 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart size={24} className="text-red-600" weight="fill" />
              <h3 className="font-bold text-lg">Support Our Mission</h3>
            </div>
            <Badge variant="secondary">Donate</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Help us continue providing zero-fee home services to families across Texas.
          </p>
          <div className="flex gap-2 mb-4">
            {suggestedAmounts.slice(0, 4).map((amt) => (
              <Button
                key={amt}
                variant={amount === amt ? "default" : "outline"}
                size="sm"
                onClick={() => handleAmountSelect(amt)}
                className="flex-1"
              >
                ${amt}
              </Button>
            ))}
          </div>
          <Button className="w-full" onClick={handleDonate} disabled={!amount}>
            Donate ${amount?.toFixed(2) || '0.00'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Heart size={32} className="text-red-600" weight="fill" />
            <CardTitle className="text-2xl">Support Our Mission</CardTitle>
          </div>
          <CardDescription className="text-base">
            Help us continue providing zero-fee home services to families across Texas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Impact Visualization */}
          <div className="p-4 bg-primary/10 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Funding Goal Progress</span>
              <span className="text-sm font-bold">${currentFunding.toLocaleString()} / ${fundingGoal.toLocaleString()}</span>
            </div>
            <Progress value={fundingProgress} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {((fundingGoal - currentFunding) / 1000).toFixed(0)}k more needed to reach our goal
            </p>
          </div>

          {/* Amount Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Select Amount</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
              {suggestedAmounts.map((amt) => (
                <Button
                  key={amt}
                  variant={amount === amt ? "default" : "outline"}
                  onClick={() => handleAmountSelect(amt)}
                  className="h-auto py-3"
                >
                  <div>
                    <div className="font-bold text-lg">${amt}</div>
                    {amt === 50 && <Badge variant="secondary" className="text-xs mt-1">Popular</Badge>}
                  </div>
                </Button>
              ))}
            </div>
            <div>
              <Label htmlFor="custom-amount">Or enter custom amount</Label>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl font-bold">$</span>
                <Input
                  id="custom-amount"
                  type="text"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="text-lg"
                />
              </div>
            </div>
          </div>

          {/* Impact Message */}
          {amount && getImpactMessage() && (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle size={20} className="text-green-600 dark:text-green-400 mt-0.5" weight="fill" />
                <p className="text-sm text-green-900 dark:text-green-100">{getImpactMessage()}</p>
              </div>
            </div>
          )}

          {/* Recurring Option */}
          <div className="p-4 border border-black/10 dark:border-white/10 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Repeat size={20} />
                <Label className="font-semibold cursor-pointer">Make it recurring</Label>
              </div>
              <Button
                variant={isRecurring ? "default" : "outline"}
                size="sm"
                onClick={() => setIsRecurring(!isRecurring)}
              >
                {isRecurring ? 'Enabled' : 'Enable'}
              </Button>
            </div>
            {isRecurring && (
              <RadioGroup value={recurringInterval} onValueChange={(v) => setRecurringInterval(v as any)}>
                <div className="flex gap-4 mt-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly" className="font-normal cursor-pointer">Monthly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="quarterly" id="quarterly" />
                    <Label htmlFor="quarterly" className="font-normal cursor-pointer">Quarterly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yearly" id="yearly" />
                    <Label htmlFor="yearly" className="font-normal cursor-pointer">Yearly</Label>
                  </div>
                </div>
              </RadioGroup>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users size={16} />
              </div>
              <p className="text-2xl font-bold">1,247</p>
              <p className="text-xs text-muted-foreground">Families Helped</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp size={16} />
              </div>
              <p className="text-2xl font-bold">$324k</p>
              <p className="text-xs text-muted-foreground">Raised</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Heart size={16} />
              </div>
              <p className="text-2xl font-bold">892</p>
              <p className="text-xs text-muted-foreground">Donors</p>
            </div>
          </div>

          {/* Donate Button */}
          <Button 
            size="lg" 
            className="w-full text-lg h-14"
            onClick={handleDonate}
            disabled={!amount || amount <= 0}
          >
            <Heart weight="fill" className="mr-2" size={24} />
            Donate ${amount?.toFixed(2) || '0.00'}
            {isRecurring && ` / ${recurringInterval}`}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Your donation is tax-deductible. We'll send you a receipt via email.
          </p>
        </CardContent>
      </Card>

      {user && (
        <UnifiedPaymentScreen
          open={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          paymentType="one-time"
          amount={amount || 0}
          title={`Donation to FairTradeWorker`}
          description="Support our mission to provide zero-fee home services"
          user={user}
          onPaymentComplete={handlePaymentComplete}
          enableRecurring={isRecurring}
          recurringInterval={recurringInterval}
        />
      )}
    </>
  )
}
