import { useState, useMemo, memo, useCallback, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lightbox } from "@/components/ui/Lightbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BidIntelligence } from "@/components/contractor/BidIntelligence"
import { LightningBadge } from "./LightningBadge"
import { DriveTimeWarning } from "./DriveTimeWarning"
import { JobMap } from "./JobMap"
import { JobQA } from "./JobQA"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { toast } from "sonner"
import { Wrench, CurrencyDollar, Package, Images, Funnel, MapTrifold, List, Timer } from "@phosphor-icons/react"
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
  const [timeRemaining, setTimeRemaining] = useState<string>("")
  
  const isFresh = useMemo(() => {
    const jobAge = Date.now() - new Date(job.createdAt).getTime()
    const fifteenMinutes = 15 * 60 * 1000
    return jobAge <= fifteenMinutes && job.size === 'small' && job.bids.length === 0
  }, [job.createdAt, job.size, job.bids.length])

  const isUrgent = job.isUrgent && job.urgentDeadline
  const isExpired = isUrgent && new Date(job.urgentDeadline!) < new Date()

  useEffect(() => {
    if (!isUrgent || isExpired) return

    const updateTimer = () => {
      const now = Date.now()
      const deadline = new Date(job.urgentDeadline!).getTime()
      const diff = deadline - now

      if (diff <= 0) {
        setTimeRemaining("EXPIRED")
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [isUrgent, isExpired, job.urgentDeadline])

  const photos = useMemo(() => job.photos || [], [job.photos])
  const materials = useMemo(() => job.aiScope?.materials || [], [job.aiScope?.materials])

  // Calculate recent bids (last 5 minutes)
  const recentBidsCount = useMemo(() => {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
    return job.bids.filter(bid => {
      const bidTime = new Date(bid.createdAt).getTime()
      return bidTime >= fiveMinutesAgo
    }).length
  }, [job.bids])

  // Get viewing contractors count
  const viewingCount = useMemo(() => {
    return job.viewingContractors?.length || 0
  }, [job.viewingContractors])

  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isFresh ? "border-green-500 border-2 shadow-lg" : ""} ${isUrgent && !isExpired ? "border-orange-500 border-2" : ""}`}>
      {isUrgent && !isExpired && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer weight="fill" size={20} className="animate-pulse" />
            <span className="font-semibold text-sm">URGENT - Need it today!</span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
            <Timer size={16} />
            <span className="font-mono text-sm font-bold">{timeRemaining}</span>
          </div>
        </div>
      )}
      {isFresh && !isUrgent && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 flex items-center gap-2">
          <span className="animate-pulse text-lg">⚡</span>
          <span className="font-semibold text-sm">FRESH JOB - First to bid gets featured!</span>
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
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
              
              {/* Social Proof Indicators */}
              {viewingCount > 0 && (
                <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 animate-pulse">
                  <Eye size={12} className="mr-1" weight="duotone" />
                  {viewingCount} viewing
                </Badge>
              )}
              {recentBidsCount > 0 && (
                <Badge variant="outline" className="text-xs bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 animate-pulse">
                  <Users size={12} className="mr-1" weight="duotone" />
                  {recentBidsCount} {recentBidsCount === 1 ? 'bid' : 'bids'} in 5 min
                </Badge>
              )}
            </div>
          )}
          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            <Images weight="bold" size={14} className="inline mr-1" />
            {photos.length}
          </div>
        </button>
      )}

      <CardHeader className="pb-3 flex-grow">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
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
          <CardTitle className="text-lg leading-tight">{job.title}</CardTitle>
          <CardDescription className="text-sm line-clamp-2">{job.description}</CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-0 flex-grow">
        {job.aiScope && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Wrench weight="duotone" size={16} className="text-primary" />
              <span>AI Scope</span>
            </div>
            <p className="text-xs leading-relaxed line-clamp-2">{job.aiScope.scope}</p>
            <div className="flex items-center gap-2">
              <CurrencyDollar weight="duotone" size={20} className="text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Estimated</div>
                <div className="text-base font-bold text-primary">
                  ${job.aiScope.priceLow} - ${job.aiScope.priceHigh}
                </div>
              </div>
            </div>
          </div>
        )}

        {materials.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package weight="duotone" size={14} className="text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground">Materials</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {materials.slice(0, 3).map((material, idx) => (
                <Badge key={idx} variant="outline" className="text-xs py-0">
                  {material}
                </Badge>
              ))}
              {materials.length > 3 && (
                <Badge variant="outline" className="text-xs py-0">
                  +{materials.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Bid Now button at bottom */}
      <CardContent className="pt-0 pb-4">
        <Button onClick={() => onPlaceBid(job)} className="w-full font-semibold" size="lg">
          Bid Now • $0 Fee
        </Button>
        <div className="text-xs text-center text-muted-foreground mt-2">
          Posted {new Date(job.createdAt).toLocaleDateString()}
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
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

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
    setSaveAsTemplate(false)
    setTemplateName("")
    setDialogOpen(true)
  }, [])

  const handlePhotoClick = useCallback((photos: string[]) => {
    setLightboxImages(photos)
    setLightboxIndex(0)
    setLightboxOpen(true)
  }, [])

  const handleTemplateSelect = useCallback((templateId: string) => {
    const template = bidTemplates.find(t => t.id === templateId)
    if (template) {
      setBidMessage(template.message)
      toast.success(`Template "${template.name}" loaded`)
    }
  }, [bidTemplates])

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

    // Save as template if requested
    if (saveAsTemplate && templateName.trim()) {
      const newTemplate: BidTemplate = {
        id: `template-${Date.now()}`,
        contractorId: user.id,
        name: templateName.trim(),
        message: bidMessage,
        useCount: 0,
        createdAt: new Date().toISOString()
      }
      setBidTemplates((current) => [...(current || []), newTemplate])
      toast.success(`Template "${templateName}" saved!`)
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
        <div className="max-w-7xl mx-auto">
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
      <div className="max-w-7xl mx-auto space-y-6">
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
            
            <div className="flex-1" />
            
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'map')}>
              <TabsList>
                <TabsTrigger value="list">
                  <List weight="duotone" size={18} className="mr-2" />
                  List
                </TabsTrigger>
                <TabsTrigger value="map">
                  <MapTrifold weight="duotone" size={18} className="mr-2" />
                  Map
                </TabsTrigger>
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
          {viewMode === 'map' ? (
            <JobMap jobs={sortedOpenJobs} onJobClick={handleBidClick} />
          ) : (
            sortedOpenJobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onViewPhotos={handlePhotoClick}
                onPlaceBid={handleBidClick}
              />
            ))
          )}
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

          {selectedJob && (
            <div className="py-2 max-h-[300px] overflow-y-auto">
              <JobQA job={selectedJob} currentUser={user} isContractor={true} />
            </div>
          )}
          
          <div className="space-y-4 py-4">
            {/* Bid Templates Dropdown */}
            {user.role === 'contractor' && bidTemplates.filter(t => t.contractorId === user.id).length > 0 && (
              <div className="space-y-2">
                <Label>Load Template (Optional)</Label>
                <Select onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a saved template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {bidTemplates
                      .filter(t => t.contractorId === user.id)
                      .map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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

            {/* Save as Template Option */}
            {user.role === 'contractor' && bidMessage.trim() && (
              <div className="space-y-3 p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="saveTemplate"
                    checked={saveAsTemplate}
                    onChange={(e) => setSaveAsTemplate(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="saveTemplate" className="text-sm font-normal cursor-pointer">
                    Save this message as a template
                  </Label>
                </div>
                {saveAsTemplate && (
                  <div className="space-y-2">
                    <Input
                      placeholder="Template name (e.g., 'My standard intro')"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}
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
