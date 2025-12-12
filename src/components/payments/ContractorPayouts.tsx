import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Bank, Lightning, Clock, CheckCircle, ArrowRight, CreditCard } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { calculateNetAmount, calculateStripeFee } from '@/lib/stripe'
import type { User } from '@/lib/types'

interface PayoutBalance {
  available: number
  pending: number
  totalEarned: number
}

interface ContractorPayoutsProps {
  user: User
}

export function ContractorPayouts({ user }: ContractorPayoutsProps) {
  const [balance, setBalance] = useState<PayoutBalance>({
    available: 8450,
    pending: 1200,
    totalEarned: 94500
  })
  const [showPayoutDialog, setShowPayoutDialog] = useState(false)
  const [showBankDialog, setShowBankDialog] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [instantPayout, setInstantPayout] = useState(false)
  const [processing, setProcessing] = useState(false)

  const [bankDetails, setBankDetails] = useState({
    accountNumber: '****6789',
    routingNumber: '****1234',
    accountType: 'checking' as 'checking' | 'savings',
    verified: true
  })

  const handleInstantPayout = async () => {
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    const amount = parseFloat(payoutAmount)
    if (amount > balance.available) {
      toast.error('Insufficient funds')
      return
    }

    setProcessing(true)

    try {
      await new Promise<void>(resolve => setTimeout(resolve, 2000))

      const fee = instantPayout ? Math.min(amount * 0.01, 5) : 0
      const netAmount = amount - fee

      setBalance(prev => ({
        ...prev,
        available: prev.available - amount
      }))

      toast.success('Payout initiated!', {
        description: `$${netAmount.toFixed(2)} will arrive in ${instantPayout ? '30 minutes' : '2-3 business days'}`
      })

      setShowPayoutDialog(false)
      setPayoutAmount('')
    } catch (error) {
      toast.error('Payout failed', {
        description: 'Please try again or contact support'
      })
    } finally {
      setProcessing(false)
    }
  }

  const instantPayoutFee = payoutAmount ? Math.min(parseFloat(payoutAmount) * 0.01, 5) : 0
  const netPayout = payoutAmount ? parseFloat(payoutAmount) - (instantPayout ? instantPayoutFee : 0) : 0

  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardDescription>Available Balance</CardDescription>
              <CardTitle className="text-3xl font-bold text-primary">
                ${balance.available.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowPayoutDialog(true)}
                className="w-full"
              >
                <ArrowRight className="mr-2" size={18} weight="bold" />
                Transfer Funds
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Clearance</CardDescription>
              <CardTitle className="text-3xl font-bold">
                ${balance.pending.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <Clock className="inline mr-1" size={16} />
              Clears in 2 hours
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Earned (2024)</CardDescription>
              <CardTitle className="text-3xl font-bold">
                ${balance.totalEarned.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.isPro && (
                <Badge variant="outline" className="text-xs">
                  <Lightning className="mr-1" size={14} weight="fill" />
                  Instant Payouts Enabled
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bank Account</CardTitle>
            <CardDescription>Manage your payout destination</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Bank size={24} weight="fill" className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold">
                    {bankDetails.accountType.charAt(0).toUpperCase() + bankDetails.accountType.slice(1)} Account
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Account ending in {bankDetails.accountNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {bankDetails.verified && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                    <CheckCircle className="mr-1" size={14} weight="fill" />
                    Verified
                  </Badge>
                )}
                <Button variant="outline" size="sm" onClick={() => setShowBankDialog(true)}>
                  Edit
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h4 className="font-semibold text-sm">Standard Payout</h4>
                <p className="text-xs text-muted-foreground">
                  Free transfers to your bank account. Arrives in 2-3 business days.
                </p>
              </div>
              {user.isPro ? (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Lightning size={18} weight="fill" className="text-primary" />
                    <h4 className="font-semibold text-sm">Instant Payout</h4>
                    <Badge variant="outline" className="text-xs">Pro</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get paid in 30 minutes. 1% fee, capped at $5 per transfer.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-muted/30 border border-dashed rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Lightning size={18} className="text-muted-foreground" />
                    <h4 className="font-semibold text-sm text-muted-foreground">Instant Payout</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Upgrade to Pro for instant payouts in 30 minutes
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Upgrade to Pro
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payouts</CardTitle>
            <CardDescription>Your payout history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { date: '2024-03-15', amount: 2450, method: 'instant', status: 'completed' },
                { date: '2024-03-10', amount: 1870, method: 'standard', status: 'completed' },
                { date: '2024-03-05', amount: 3200, method: 'instant', status: 'completed' },
              ].map((payout, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${payout.method === 'instant' ? 'bg-primary/10' : 'bg-muted'}`}>
                      {payout.method === 'instant' ? (
                        <Lightning size={18} weight="fill" className="text-primary" />
                      ) : (
                        <Bank size={18} className="text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">${payout.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payout.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                    <CheckCircle className="mr-1" size={12} weight="fill" />
                    Completed
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Funds</DialogTitle>
            <DialogDescription>
              Transfer your available balance to your bank account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="pl-7"
                  min="0"
                  max={balance.available}
                  step="0.01"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Available: ${balance.available.toLocaleString()}
              </p>
            </div>

            {user.isPro && (
              <div className="space-y-3">
                <Label>Payout Speed</Label>
                <div className="grid gap-3">
                  <button
                    type="button"
                    onClick={() => setInstantPayout(false)}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      !instantPayout ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Bank size={24} className="mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="font-semibold">Standard Transfer</p>
                          <p className="text-xs text-muted-foreground mt-1">2-3 business days • Free</p>
                        </div>
                      </div>
                      {!instantPayout && (
                        <CheckCircle size={20} weight="fill" className="text-primary" />
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInstantPayout(true)}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      instantPayout ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Lightning size={24} weight="fill" className="mt-0.5 text-primary" />
                        <div>
                          <p className="font-semibold">Instant Transfer</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            30 minutes • 1% fee (max $5)
                          </p>
                        </div>
                      </div>
                      {instantPayout && (
                        <CheckCircle size={20} weight="fill" className="text-primary" />
                      )}
                    </div>
                  </button>
                </div>
              </div>
            )}

            {payoutAmount && parseFloat(payoutAmount) > 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transfer Amount</span>
                    <span className="font-semibold">${parseFloat(payoutAmount).toFixed(2)}</span>
                  </div>
                  {instantPayout && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Instant Fee (1%)</span>
                      <span>-${instantPayoutFee.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-base font-bold">
                    <span>You Receive</span>
                    <span>${netPayout.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2">
                    {instantPayout 
                      ? 'Funds will arrive in approximately 30 minutes'
                      : 'Funds will arrive in 2-3 business days'
                    }
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPayoutDialog(false)}
                disabled={processing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInstantPayout}
                disabled={processing || !payoutAmount || parseFloat(payoutAmount) <= 0}
                className="flex-1"
              >
                {processing ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    {instantPayout ? (
                      <Lightning className="mr-2" size={18} weight="fill" />
                    ) : (
                      <ArrowRight className="mr-2" size={18} weight="bold" />
                    )}
                    Transfer ${payoutAmount || '0.00'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBankDialog} onOpenChange={setShowBankDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bank Account Details</DialogTitle>
            <DialogDescription>
              Update your payout bank account information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type</Label>
              <select
                id="accountType"
                value={bankDetails.accountType}
                onChange={(e) => setBankDetails(prev => ({ ...prev, accountType: e.target.value as 'checking' | 'savings' }))}
                className="w-full h-10 px-3 rounded-md border border-border bg-background"
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="routing">Routing Number</Label>
              <Input
                id="routing"
                placeholder="123456789"
                defaultValue="123456789"
                maxLength={9}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account">Account Number</Label>
              <Input
                id="account"
                placeholder="000123456789"
                defaultValue="000123456789"
              />
            </div>

            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="text-primary flex-shrink-0 mt-0.5" size={18} weight="fill" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">Verification Required</p>
                  <p>We'll make two small deposits (under $1) to verify your account. This takes 1-2 business days.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowBankDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success('Bank account updated')
                  setShowBankDialog(false)
                }}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
