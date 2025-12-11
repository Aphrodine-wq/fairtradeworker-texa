import { useState, useMemo, memo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Lightbox } from "@/components/ui/Lightbox"
import { useKV } from "@github/spark/hooks"
import { toast } from "sonner"
import { Wrench, CurrencyDollar, Package, Images } from "@phosphor-icons/react"
import type { Job, Bid, User } from "@/lib/types"
import { getJobSizeEmoji, getJobSizeLabel } from "@/lib/types"

interface BrowseJobsProps {
  user: User
}

const JobCard = memo(function JobCard({ 
  job, 
  onViewPhotos, 
  onPlaceBid 
}: { 
  job: Job
  onViewPhotos: (photos: string[]) => void
  onPlaceBid: (job: Job) => void
}) {
  const isFresh = useMemo(() => {
    const jobAge = Date.now() - new Date(job.createdAt).getTime()
    const fifteenMinutes = 15 * 60 * 1000
    return jobAge <= fifteenMinutes && job.size === 'small' && job.bids.length === 0
  }, [job.createdAt, job.size, job.bids.length])

  const photos = useMemo(() => job.photos || [], [job.photos])
  const materials = useMemo(() => job.aiScope?.materials || [], [job.aiScope?.materials])

  return (
    <Card className={isFresh ? "border-green-500 border-2 shadow-md" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={job.size === 'small' ? 'default' : job.size === 'medium' ? 'secondary' : 'destructive'}>
                {getJobSizeEmoji(job.size)} {getJobSizeLabel(job.size)}
              </Badge>
              {isFresh && (
                <Badge variant="outline" className="border-green-500 text-green-700 animate-pulse">
                  🟢 FRESH
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl">{job.title}</CardTitle>
            <CardDescription className="mt-2">{job.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {photos.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Images weight="duotone" size={20} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Photos ({photos.length})</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {photos.slice(0, 4).map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => onViewPhotos(photos)}
                  className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                >
                  <img
                    src={photo}
                    alt={`Job photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {job.aiScope && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wrench weight="duotone" size={18} />
              <span>AI Scope</span>
            </div>
            <p className="text-sm">{job.aiScope.scope}</p>
            <div className="flex items-center gap-2 text-primary font-semibold">
              <CurrencyDollar weight="duotone" size={20} />
              <span>${job.aiScope.priceLow} - ${job.aiScope.priceHigh}</span>
            </div>
          </div>
        )}

        {materials.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package weight="duotone" size={18} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Materials</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {materials.map((material, idx) => (
                <Badge key={idx} variant="outline">{material}</Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {job.bids.length} {job.bids.length === 1 ? 'bid' : 'bids'}
          </div>
          <Button onClick={() => onPlaceBid(job)}>
            Place Bid - $0 fee
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})

export function BrowseJobs({ user }: BrowseJobsProps) {
  const [jobs, setJobs] = useKV<Job[]>("jobs", [])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [bidAmount, setBidAmount] = useState("")
  const [bidMessage, setBidMessage] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const sortedOpenJobs = useMemo(() => {
    if (!jobs || jobs.length === 0) return []
    
    const openJobs = jobs.filter(job => job.status === 'open')
    
    const isJobFresh = (job: Job) => {
      const jobAge = Date.now() - new Date(job.createdAt).getTime()
      const fifteenMinutes = 15 * 60 * 1000
      return jobAge <= fifteenMinutes && job.size === 'small' && job.bids.length === 0
    }

    const hasFirstBidSticky = (job: Job) => {
      if (job.bids.length === 0) return false
      const firstBid = job.bids.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )[0]
      const bidAge = Date.now() - new Date(firstBid.createdAt).getTime()
      const jobAge = Date.now() - new Date(job.createdAt).getTime()
      const firstBidWindow = 15 * 60 * 1000
      const stickyDuration = 2 * 60 * 60 * 1000
      return jobAge <= firstBidWindow && bidAge <= stickyDuration
    }

    return [...openJobs].sort((a, b) => {
      const aFresh = isJobFresh(a)
      const bFresh = isJobFresh(b)
      const aSticky = hasFirstBidSticky(a)
      const bSticky = hasFirstBidSticky(b)
      
      if (aFresh && !bFresh) return -1
      if (!aFresh && bFresh) return 1
      if (aSticky && !bSticky) return -1
      if (!aSticky && bSticky) return 1
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [jobs])

  const handleBidClick = useCallback((job: Job) => {
    setSelectedJob(job)
    setBidAmount("")
    setBidMessage("")
    setDialogOpen(true)
  }, [])

  const handlePhotoClick = useCallback((photos: string[]) => {
    setLightboxImages(photos)
    setLightboxIndex(0)
    setLightboxOpen(true)
  }, [])

  const handleSubmitBid = () => {
    if (!selectedJob) return

    const amount = parseInt(bidAmount)
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid bid amount")
      return
    }

    if (!bidMessage.trim()) {
      toast.error("Please add a message with your bid")
      return
    }

    const newBid: Bid = {
      id: `bid-${Date.now()}`,
      jobId: selectedJob.id,
      contractorId: user.id,
      contractorName: user.fullName,
      amount,
      message: bidMessage,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    setJobs((currentJobs) => 
      (currentJobs || []).map(job =>
        job.id === selectedJob.id
          ? { ...job, bids: [...job.bids, newBid] }
          : job
      )
    )

    toast.success("Bid submitted successfully!")
    setDialogOpen(false)
    setSelectedJob(null)
  }

  if (sortedOpenJobs.length === 0) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <Wrench className="mx-auto mb-4 text-muted-foreground" size={64} weight="duotone" />
            <h2 className="text-2xl font-bold mb-2">No Jobs Available</h2>
            <p className="text-muted-foreground">Check back soon for new opportunities!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Browse Jobs</h1>
          <p className="text-muted-foreground">Find your next project – bid free, keep 100%</p>
        </div>

        <div className="space-y-6">
          {sortedOpenJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onViewPhotos={handlePhotoClick}
              onPlaceBid={handleBidClick}
            />
          ))}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Your Bid</DialogTitle>
            <DialogDescription>
              {selectedJob?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bidAmount">Bid Amount ($)</Label>
              <Input
                id="bidAmount"
                type="number"
                placeholder="Enter your bid"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
              />
              {selectedJob && (
                <p className="text-xs text-muted-foreground">
                  Estimated range: ${selectedJob.aiScope.priceLow} - ${selectedJob.aiScope.priceHigh}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bidMessage">Message</Label>
              <Textarea
                id="bidMessage"
                placeholder="Tell the homeowner about your experience and approach..."
                value={bidMessage}
                onChange={(e) => setBidMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex items-center text-xs text-muted-foreground mr-auto">
              Free bidding • $0 fee
            </div>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitBid}>
              Submit Bid – $0
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Lightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  )
}
