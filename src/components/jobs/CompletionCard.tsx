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
    // In a real implementation, this would:
    // 1. Convert the card to a canvas/image
    // 2. Use Web Share API or download
    // For now, we'll just show a success message
    toast.success("Share feature coming soon! Screenshot this card to share.")
  }

  const handleDownload = async () => {
    // In a real implementation, this would download the card as an image
    toast.success("Download feature coming soon! Screenshot this card for now.")
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
        className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-white to-primary/5 dark:from-gray-950 dark:to-primary/10"
      >
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-6 text-center">
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
              <span className="text-2xl font-bold text-primary">${amount}</span>
            </div>
          </div>

          {/* Watermark Footer */}
          <div className="bg-muted/50 px-6 py-3 text-center border-t">
            <p className="text-xs text-muted-foreground">
              Posted on <span className="font-semibold text-primary">FairTradeWorker</span> • Zero fees, 100% earnings
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
