import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Download, Share } from "@phosphor-icons/react"
import { toast } from "sonner"

interface CompletionCardProps {
  jobTitle: string
  contractorName: string
  amount: number
  rating?: number
  beforePhoto?: string
  afterPhoto?: string
  createdAt: string
}

export function CompletionCard({
  jobTitle,
  contractorName,
  amount,
  rating = 5,
  beforePhoto,
  afterPhoto,
  createdAt
}: CompletionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleShare = async () => {
    try {
      // Try Web Share API first (mobile-friendly)
      if (navigator.share && cardRef.current) {
        // Create a simple text share for now
        await navigator.share({
          title: `Job Completed: ${jobTitle}`,
          text: `Check out this completed job: ${jobTitle} by ${contractorName}. Rating: ${rating}/5 stars. Amount: $${amount}`,
        })
        toast.success("Shared successfully!")
        return
      }

      // Fallback: Copy link to clipboard
      if (navigator.clipboard) {
        const shareText = `Job Completed: ${jobTitle} by ${contractorName}. Rating: ${rating}/5 stars. Amount: $${amount}`
        await navigator.clipboard.writeText(shareText)
        toast.success("Share text copied to clipboard!")
      } else {
        toast.info("Use your device's share feature to share this card")
      }
    } catch (error: any) {
      // User cancelled share
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error)
        toast.error("Share failed. Try copying the text manually.")
      }
    }
  }

  const handleDownload = async () => {
    // Use browser's native screenshot feature
    toast.info("Use your browser's screenshot feature to download this card:\n\nWindows/Linux: Ctrl+Shift+S or Print Screen\nMac: Cmd+Shift+4\n\nOr right-click the card and select 'Inspect' to use browser dev tools.")
  }

  const formattedDate = (() => {
    try {
      return new Date(createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch (error) {
      return 'Recently'
    }
  })()

  return (
    <div className="space-y-4">
      {/* Shareable Card */}
      <Card 
        ref={cardRef}
        className="overflow-hidden border-2 border-primary/20 bg-white dark:bg-black"
      >
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-white dark:bg-black text-black dark:text-white p-6 text-center border-b border-black/10 dark:border-white/10">
            <h2 className="text-2xl font-bold mb-2">✨ Job Completed!</h2>
            <p className="text-sm opacity-90">{formattedDate}</p>
          </div>

          {/* Photos */}
          {(beforePhoto || afterPhoto) && (
            <div className="grid grid-cols-2 gap-0 border-b">
              {beforePhoto && (
                <div className="relative aspect-square">
                  <img 
                    src={beforePhoto} 
                    alt="Before" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-xs">Before</Badge>
                  </div>
                </div>
              )}
              {afterPhoto && (
                <div className="relative aspect-square">
                  <img 
                    src={afterPhoto} 
                    alt="After" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className="text-xs">After</Badge>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Job Details */}
          <div className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-1">{jobTitle}</h3>
              <p className="text-sm text-muted-foreground">
                Completed by {contractorName}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    weight={i < rating ? "fill" : "regular"}
                    className={i < rating ? "text-yellow-500" : "text-gray-300"}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{rating.toFixed(1)}/5.0</span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm text-muted-foreground">Total Paid</span>
              <span className="text-2xl font-bold text-black dark:text-white">${amount}</span>
            </div>
          </div>

          {/* Watermark Footer */}
          <div className="bg-muted/50 px-6 py-3 text-center border-t">
            <p className="text-xs text-muted-foreground">
              Posted on <span className="font-semibold text-black dark:text-white">FairTradeWorker</span> • Zero fees, 100% earnings
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={handleDownload}
          className="flex items-center justify-center gap-2"
        >
          <Download size={18} weight="bold" />
          Download
        </Button>
        <Button
          onClick={handleShare}
          className="flex items-center justify-center gap-2"
        >
          <Share size={18} weight="bold" />
          Share to Social
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Share your success story and help other contractors discover FairTradeWorker!
      </p>
    </div>
  )
}
