import { Copy, Share, CurrencyDollar } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { useState } from "react"

interface ReferralCodeCardProps {
  code: string
  userName: string
  earnings: number
  usedCount: number
}

export function ReferralCodeCard({ code, userName, earnings, usedCount }: ReferralCodeCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success("Referral code copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    const message = `Hey! I just posted a job on FairTradeWorker Texas – zero fees, lightning fast. Use my code "${code}" and we both get $20! https://fairtradeworker.com?ref=${code}`
    
    if (navigator.share) {
      navigator.share({
        title: 'FairTradeWorker Texas Referral',
        text: message,
      }).catch(() => {
        navigator.clipboard.writeText(message)
        toast.success("Share message copied to clipboard!")
      })
    } else {
      navigator.clipboard.writeText(message)
      toast.success("Share message copied to clipboard!")
    }
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-heading text-lg font-semibold">Your Referral Code</h3>
            <p className="text-sm text-muted-foreground mt-1">Share with neighbors and earn $20 each</p>
          </div>
          <div className="flex items-center gap-2 text-accent-foreground bg-accent px-3 py-1 rounded-full">
            <CurrencyDollar size={16} weight="bold" />
            <span className="font-bold">${earnings}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-background border-2 border-primary rounded-lg px-4 py-3">
            <p className="text-2xl font-heading font-bold tracking-wider text-primary">{code}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleCopy}
            variant="secondary"
            className="flex-1"
          >
            <Copy size={18} className="mr-2" weight="bold" />
            {copied ? "Copied!" : "Copy Code"}
          </Button>
          <Button 
            onClick={handleShare}
            className="flex-1"
          >
            <Share size={18} className="mr-2" weight="bold" />
            Share SMS
          </Button>
        </div>

        <div className="text-center pt-2 border-t">
          <p className="text-sm text-muted-foreground">
            Used <span className="font-bold text-foreground">{usedCount}</span> times
          </p>
        </div>
      </div>
    </Card>
  )
}
