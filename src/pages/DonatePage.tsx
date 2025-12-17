import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, CurrencyDollar, CheckCircle, ArrowLeft } from "@phosphor-icons/react"
import { toast } from "sonner"

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500]

interface DonatePageProps {
  onNavigate: (page: string) => void
}

export function DonatePage({ onNavigate }: DonatePageProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount("")
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setSelectedAmount(null)
  }

  const getDonationAmount = (): number | null => {
    if (selectedAmount) return selectedAmount
    if (customAmount) {
      const parsed = parseFloat(customAmount)
      if (!isNaN(parsed) && parsed > 0) return parsed
    }
    return null
  }

  const handleDonate = async () => {
    const amount = getDonationAmount()
    
    if (!amount || amount <= 0) {
      toast.error("Please select or enter a donation amount")
      return
    }

    if (amount < 1) {
      toast.error("Minimum donation amount is $1")
      return
    }

    setIsProcessing(true)

    try {
      // In production, integrate with Stripe or PayPal here
      // For now, simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success(`Thank you for your $${amount.toFixed(2)} donation!`, {
        description: "Your support helps us keep the platform free for everyone.",
        duration: 5000,
      })
      
      // Reset form
      setSelectedAmount(null)
      setCustomAmount("")
    } catch (error) {
      toast.error("Payment processing failed. Please try again.")
      console.error("Donation error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const amount = getDonationAmount()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('home')} 
          className="mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-[#00FF00]/20 flex items-center justify-center">
              <Heart size={32} weight="fill" className="text-[#00FF00]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Support FairTradeWorker</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your donation helps us keep the platform free for everyone. We never charge platform fees to contractors or homeowners.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Donation Form */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Make a Donation</CardTitle>
              <CardDescription>
                Choose an amount or enter a custom donation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preset Amounts */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">Select Amount</Label>
                <div className="grid grid-cols-3 gap-3">
                  {PRESET_AMOUNTS.map((preset) => (
                    <Button
                      key={preset}
                      variant={selectedAmount === preset ? "default" : "outline"}
                      onClick={() => handleAmountSelect(preset)}
                      className="h-12"
                    >
                      ${preset}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <Label htmlFor="custom-amount" className="text-sm font-semibold mb-2 block">
                  Or Enter Custom Amount
                </Label>
                <div className="relative">
                  <CurrencyDollar 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
                    size={20} 
                  />
                  <Input
                    id="custom-amount"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    className="pl-10 text-lg"
                  />
                </div>
              </div>

              <Button 
                onClick={handleDonate} 
                disabled={!amount || amount <= 0 || isProcessing}
                className="w-full h-12 text-lg"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Heart size={20} className="mr-2" weight="fill" />
                    Donate ${amount?.toFixed(2) || "0.00"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Info Card */}
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Why Donate?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} weight="fill" className="text-[#00FF00] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Zero Fees Forever</p>
                    <p className="text-sm text-muted-foreground">
                      We never charge contractors or homeowners platform fees. Donations help us maintain this promise.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} weight="fill" className="text-[#00FF00] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">100% Transparent</p>
                    <p className="text-sm text-muted-foreground">
                      All donations go directly to platform development, maintenance, and improvements.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} weight="fill" className="text-[#00FF00] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Keep It Free</p>
                    <p className="text-sm text-muted-foreground">
                      Your support ensures we can continue offering free tools and features to everyone.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card bg-primary/5">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground text-center">
                  <strong>Secure Payment:</strong> All donations are processed securely through industry-standard payment processors.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
