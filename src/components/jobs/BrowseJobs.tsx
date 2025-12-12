import { useState, useMemo, memo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Lightbox } from "@/components/ui/Lightbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BidIntelligence } from "@/components/contractor/BidIntelligence"
import { LightningBadge } from "./LightningBadge"
import { DriveTimeWarning } from "./DriveTimeWarning"
import { useKV } from "@github/spark/hooks"
import { toast } from "sonner"
import { Wrench, CurrencyDollar, Package, Images, Funnel } from "@phosphor-icons/react"
import type { Job, Bid, User, JobSize } from "@/lib/types"
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
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isFresh ? "border-green-500 border-2 shadow-lg" : ""}`}>
      {isFresh && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 flex items-center gap-2">
          <span className="animate-pulse text-lg">⚡</span>
          <span className="font-semibold text-sm">FRESH JOB - First to bid gets featured!</span>
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge 
                variant={job.size === 'small' ? 'default' : job.size === 'medium' ? 'secondary' : 'destructive'}
                className="text-sm font-semibold"
              >
                {getJobSizeEmoji(job.size)} {getJobSizeLabel(job.size)} (≤${job.aiScope.priceHigh})
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{job.bids.length}</span>
                <span>{job.bids.length === 1 ? 'bid' : 'bids'}</span>
              </div>
            </div>
            <CardTitle className="text-xl leading-tight mb-2">{job.title}</CardTitle>
            <CardDescription className="text-sm line-clamp-2">{job.description}</CardDescription>
          </div>
          {photos.length > 0 && (
            <button
              onClick={() => onViewPhotos(photos)}
              className="relative w-24 h-24 rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all flex-shrink-0 group"
            >
              <img
                src={photos[0]}
                alt="Job preview"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
              {photos.length > 1 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Images weight="bold" size={24} className="text-white" />
                  <span className="text-white text-xs ml-1">+{photos.length - 1}</span>
                </div>
              )}
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {job.aiScope && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Wrench weight="duotone" size={18} className="text-primary" />
              <span>AI Scope</span>
            </div>
            <p className="text-sm leading-relaxed">{job.aiScope.scope}</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <CurrencyDollar weight="duotone" size={24} className="text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">Estimated</div>
                  <div className="text-lg font-bold text-primary">
                    ${job.aiScope.priceLow} - ${job.aiScope.priceHigh}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {materials.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package weight="duotone" size={18} className="text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground">Required Materials</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {materials.map((material, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {material}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {photos.length > 1 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Images weight="duotone" size={18} className="text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground">
                {photos.length} Photos Available
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {photos.slice(0, 5).map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => onViewPhotos(photos)}
                  className="relative aspect-square rounded-md overflow-hidden hover:ring-2 hover:ring-primary transition-all group"
                >
                  <img
                    src={photo}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
            {photos.length > 5 && (
              <button
                onClick={() => onViewPhotos(photos)}
                className="text-xs text-primary hover:underline mt-2"
              >
                + {photos.length - 5} more photos
              </button>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Posted {new Date(job.createdAt).toLocaleDateString()}
          </div>
          <Button onClick={() => onPlaceBid(job)} size="lg" className="font-semibold">
            Place Bid • $0 Fee
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
  const [sizeFilter, setSizeFilter] = useState<JobSize | 'all'>('all')

  const myScheduledJobs = useMemo(() => {
    return (jobs || []).filter(job =>
      job.bids.some(bid => bid.contractorId === user.id && bid.status === 'accepted')
    )
  }, [jobs, user.id])

  const sortedOpenJobs = useMemo(() => {
    if (!jobs || jobs.length === 0) return []
    
    let openJobs = jobs.filter(job => job.status === 'open')
    
    if (sizeFilter !== 'all') {
      openJobs = openJobs.filter(job => job.size === sizeFilter)
    }
    
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
  }, [jobs, sizeFilter])

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

    const jobTime = new Date(selectedJob.createdAt).getTime()
    const bidTime = Date.now()
    const responseTimeMinutes = Math.round((bidTime - jobTime) / 1000 / 60)
    const isLightning = responseTimeMinutes <= 10
    
    const newBid: Bid = {
      id: `bid-${Date.now()}`,
      jobId: selectedJob.id,
      contractorId: user.id,
      contractorName: user.fullName,
      amount,
      message: bidMessage,
      status: 'pending',
      createdAt: new Date().toISOString(),
      responseTimeMinutes,
      isLightningBid: isLightning
    }

    setJobs((currentJobs) => 
      (currentJobs || []).map(job =>
        job.id === selectedJob.id
          ? { ...job, bids: [...job.bids, newBid] }
          : job
      )
    )

    if (isLightning && selectedJob.bids.length < 3) {
      toast.success(`⚡ Lightning bid! You responded in ${responseTimeMinutes} minutes!`)
    } else {
      toast.success("Bid submitted successfully!")
    }
    
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
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Browse Jobs</h1>
            <p className="text-muted-foreground text-lg">Find your next project – bid free, keep 100%</p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Funnel weight="duotone" size={20} className="text-muted-foreground" />
              <span className="text-sm font-medium">Filter by size:</span>
            </div>
            <Tabs value={sizeFilter} onValueChange={(v) => setSizeFilter(v as JobSize | 'all')}>
              <TabsList>
                <TabsTrigger value="all">All Jobs</TabsTrigger>
                <TabsTrigger value="small">🟢 Small</TabsTrigger>
                <TabsTrigger value="medium">🟡 Medium</TabsTrigger>
                <TabsTrigger value="large">🔴 Large</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>{sortedOpenJobs.length} active {sortedOpenJobs.length === 1 ? 'job' : 'jobs'}</span>
            </div>
          </div>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Your Bid</DialogTitle>
            <DialogDescription>
              {selectedJob?.title}
            </DialogDescription>
          </DialogHeader>
          
          {selectedJob && (
            <BidIntelligence
              jobCategory={selectedJob.title}
              jobPriceLow={selectedJob.aiScope.priceLow}
              jobPriceHigh={selectedJob.aiScope.priceHigh}
              contractorWinRate={user.winRate}
            />
          )}

          {selectedJob && myScheduledJobs.length > 0 && (
            <div className="py-2">
              <DriveTimeWarning
                targetJob={selectedJob}
                scheduledJobs={myScheduledJobs}
                user={user}
              />
            </div>
          )}
          
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
