import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, CurrencyDollar, CheckCircle } from "@phosphor-icons/react"
import { toast } from "sonner"

interface DonationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500]

export function DonationDialog({ open, onOpenChange }: DonationDialogProps) {
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
      onOpenChange(false)
    } catch (error) {
      toast.error("Payment processing failed. Please try again.")
      console.error("Donation error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const amount = getDonationAmount()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-[#00FF00]/20 flex items-center justify-center">
              <Heart size={24} weight="fill" className="text-[#00FF00]" />
            </div>
            <DialogTitle className="text-2xl font-bold">Donate to Platform</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Your donation helps us keep FairTradeWorker free for everyone. We never charge platform fees.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
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

          {/* Info */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <CheckCircle size={20} weight="fill" className="text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">100% of donations go to platform development</p>
                <p className="text-muted-foreground">
                  Donations help us maintain and improve the platform while keeping it free for contractors and homeowners.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handleDonate} 
            disabled={!amount || amount <= 0 || isProcessing}
            className="min-w-[120px]"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Heart size={16} className="mr-2" weight="fill" />
                Donate ${amount?.toFixed(2) || "0.00"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
