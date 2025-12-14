
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
import { Wrench, CurrencyDollar, Package, Images, Funnel, MapTrifold, List, Timer, Eye, Users } from "@phosphor-icons/react"
import type { Job, Bid, User, JobSize, BidTemplate } from "@/lib/types"
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
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group h-full flex flex-col ${isFresh ? "border-black dark:border-white border-2 shadow-lg" : ""}`}>
      {/* Accent line on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-black dark:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {isFresh && (
        <div className="bg-white dark:bg-black text-black dark:text-white border-b-2 border-black dark:border-white px-4 py-2 flex items-center gap-2">
          <span className="animate-pulse text-lg">⚡</span>
          <span className="font-semibold text-sm">FRESH JOB - First to bid gets featured!</span>
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge 
                variant={job.size === 'small' ? 'success' : job.size === 'medium' ? 'warning' : 'destructive'}
                className="text-sm font-semibold"
              >
                {getJobSizeEmoji(job.size)} {getJobSizeLabel(job.size)} (≤${job.aiScope.priceHigh})
              </Badge>
              <div className="flex items-center gap-1 text-xs text-black dark:text-white/70">
                <span>{job.bids.length}</span>
                <span>{job.bids.length === 1 ? 'bid' : 'bids'}</span>
              </div>
              
              {/* Social Proof Indicators */}
              {viewingCount > 0 && (
                <Badge variant="outline" className="text-xs bg-white dark:bg-black text-black dark:text-white border border-black/10 dark:border-white/10 animate-pulse">
                  <Eye size={12} className="mr-1" weight="duotone" />
                  {viewingCount} viewing
                </Badge>
              )}
              {recentBidsCount > 0 && (
                <Badge variant="outline" className="text-xs bg-white dark:bg-black text-black dark:text-white border border-black/10 dark:border-white/10 animate-pulse">
                  <Users size={12} className="mr-1" weight="duotone" />
                  {recentBidsCount} {recentBidsCount === 1 ? 'bid' : 'bids'} in 5 min
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl leading-tight mb-2 text-black dark:text-white">{job.title}</CardTitle>
            <CardDescription className="text-sm line-clamp-2 text-black dark:text-white/80">{job.description}</CardDescription>
          </div>
          {photos.length > 0 && (
            <button
              onClick={() => onViewPhotos(photos)}
                  className="relative w-40 h-40 rounded-lg overflow-hidden hover:ring-2 hover:ring-black dark:hover:ring-white transition-all flex-shrink-0 group"
            >
              <img
                src={photos[0]}
                alt="Job preview"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Images size={32} className="text-white" weight="duotone" />
              </div>
            </button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-0 flex-grow">
        {job.aiScope && (
          <div className="glass-subtle rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-black dark:text-white">
              <Wrench weight="duotone" size={18} />
              <span>AI Scope</span>
            </div>
            <p className="text-sm leading-relaxed text-black dark:text-white/80">{job.aiScope.scope}</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <CurrencyDollar weight="duotone" size={24} className="text-black dark:text-white" />
                <div>
                  <div className="text-xs text-black dark:text-white/70">Estimated</div>
                  <div className="text-lg font-bold text-black dark:text-white">
                    ${job.aiScope.priceLow} - ${job.aiScope.priceHigh}
                  </div>
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
                  className="relative aspect-square rounded-md overflow-hidden hover:ring-2 hover:ring-black dark:hover:ring-white transition-all group"
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
                className="text-xs text-black dark:text-white hover:underline mt-2"
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
  const [bidTemplates, setBidTemplates] = useKV<BidTemplate[]>("bidTemplates", [])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [bidAmount, setBidAmount] = useState("")
  const [bidMessage, setBidMessage] = useState("")
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
  const [templateName, setTemplateName] = useState("")
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

    // Sort by: 1) Fresh jobs first, 2) Sticky jobs, 3) Job size (small, medium, large), 4) Most recent
    return [...openJobs].sort((a, b) => {
      const aFresh = isJobFresh(a)
      const bFresh = isJobFresh(b)
      const aSticky = hasFirstBidSticky(a)
      const bSticky = hasFirstBidSticky(b)
      
      // Fresh jobs first
      if (aFresh && !bFresh) return -1
      if (!aFresh && bFresh) return 1
      
      // Sticky jobs second
      if (aSticky && !bSticky) return -1
      if (!aSticky && bSticky) return 1
      
      // Then by job size: small, medium, large
      const sizeOrder = { small: 0, medium: 1, large: 2 }
      const sizeDiff = sizeOrder[a.size] - sizeOrder[b.size]
      if (sizeDiff !== 0) return sizeDiff
      
      // Finally by most recent
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Modern Header Section */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3 text-primary">
                  Browse Jobs
                </h1>
                <p className="text-lg text-muted-foreground">
                  Find your next project – bid free, keep 100%
                </p>
              </div>
              
              {/* Stats Cards */}
              <div className="flex gap-4">
                <Card className="px-6 py-4 min-w-[140px]">
                  <div className="text-2xl font-bold text-black dark:text-white">{sortedOpenJobs.length}</div>
                  <div className="text-sm text-muted-foreground">Active Jobs</div>
                </Card>
                <Card className="px-6 py-4 min-w-[140px]">
                  <div className="text-2xl font-bold text-black dark:text-white">
                    {sortedOpenJobs.filter(j => j.bids.length === 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground">No Bids Yet</div>
                </Card>
              </div>
            </div>

            {/* Enhanced Filter Bar */}
            <Card className="p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <Funnel weight="duotone" size={20} className="text-primary" />
                  <span className="font-semibold">Filters:</span>
                </div>
                
                <Tabs value={sizeFilter} onValueChange={(v) => setSizeFilter(v as JobSize | 'all')}>
                  <TabsList className="bg-muted">
                    <TabsTrigger value="all">All Jobs</TabsTrigger>
                    <TabsTrigger value="small">🟢 Small</TabsTrigger>
                    <TabsTrigger value="medium">🟡 Medium</TabsTrigger>
                    <TabsTrigger value="large">🔴 Large</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="flex-1" />
                
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'map')}>
                  <TabsList className="bg-muted">
                    <TabsTrigger value="list">
                      <List weight="duotone" size={18} className="mr-2" />
                      List View
                    </TabsTrigger>
                    <TabsTrigger value="map">
                      <MapTrifold weight="duotone" size={18} className="mr-2" />
                      Map View
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </Card>
          </div>

          {/* Jobs Grid/List */}
          <div className={viewMode === 'map' ? '' : 'grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch'}>
            {viewMode === 'map' ? (
              <JobMap jobs={sortedOpenJobs} onJobClick={handleBidClick} />
            ) : sortedOpenJobs.length === 0 ? (
              <div className="col-span-full">
                <Card className="p-12 text-center">
                  <Wrench size={64} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-2xl font-bold mb-2">No Jobs Available</h2>
                  <p className="text-muted-foreground">Check back soon for new opportunities!</p>
                </Card>
              </div>
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
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 h-[95vh]">
          {/* Header Section - Fixed */}
          <div className="px-8 pt-6 pb-4 border-b border-black/10 dark:border-white/10 bg-white dark:bg-black flex-shrink-0">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl md:text-3xl font-bold text-black dark:text-white mb-1">
                Submit Your Bid
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {selectedJob?.title}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Main Content Area - Column Layout - No Scroll */}
          <div className="flex-1 overflow-hidden px-8 py-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column - Job Info & Intelligence */}
            <div className="lg:col-span-1 space-y-4 overflow-hidden flex flex-col">
              {selectedJob && (
                <div className="bg-white dark:bg-black rounded-lg border border-black/10 dark:border-white/10 p-4 flex-shrink-0">
                  <BidIntelligence
                    jobCategory={selectedJob.title}
                    jobPriceLow={selectedJob.aiScope.priceLow}
                    jobPriceHigh={selectedJob.aiScope.priceHigh}
                    contractorWinRate={user.winRate}
                  />
                </div>
              )}

              {selectedJob && myScheduledJobs.length > 0 && (
                <div className="bg-white dark:bg-black rounded-lg border border-black/10 dark:border-white/10 p-3 flex-shrink-0">
                  <DriveTimeWarning
                    targetJob={selectedJob}
                    scheduledJobs={myScheduledJobs}
                    user={user}
                  />
                </div>
              )}

              {selectedJob && (
                <div className="bg-white dark:bg-black rounded-lg border border-black/10 dark:border-white/10 p-4 flex-1 overflow-hidden flex flex-col">
                  <div className="mb-2 flex-shrink-0">
                    <h3 className="text-base font-semibold text-black dark:text-white">Questions & Answers</h3>
                    <p className="text-xs text-muted-foreground">Review questions from other contractors</p>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <JobQA job={selectedJob} currentUser={user} isContractor={true} />
                  </div>
                </div>
              )}
            </div>
            
            {/* Right Column - Bid Form (2/3 width) */}
            <div className="lg:col-span-2 bg-white dark:bg-black rounded-lg border border-black/10 dark:border-white/10 p-6 overflow-hidden flex flex-col">
              <h3 className="text-xl font-semibold text-black dark:text-white mb-4 flex-shrink-0">Your Bid Details</h3>
              
              <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Side of Form */}
                <div className="space-y-4">
                  {/* Bid Templates Dropdown */}
                  {user.role === 'contractor' && bidTemplates.filter(t => t.contractorId === user.id).length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-black dark:text-white">Load Template (Optional)</Label>
                      <Select onValueChange={handleTemplateSelect}>
                        <SelectTrigger className="h-10 text-sm bg-white dark:bg-black border-black/10 dark:border-white/20">
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
                    <Label htmlFor="bidAmount" className="text-sm font-medium text-black dark:text-white">
                      Bid Amount ($)
                    </Label>
                    <Input
                      id="bidAmount"
                      type="number"
                      placeholder="Enter your bid amount"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="h-10 text-base bg-white dark:bg-black border-black/10 dark:border-white/20"
                    />
                    {selectedJob && (
                      <p className="text-xs text-muted-foreground">
                        💡 Range: <span className="font-semibold">${selectedJob.aiScope.priceLow.toLocaleString()}</span> - <span className="font-semibold">${selectedJob.aiScope.priceHigh.toLocaleString()}</span>
                      </p>
                    )}
                  </div>

                  {/* Save as Template Option */}
                  {user.role === 'contractor' && bidMessage.trim() && (
                    <div className="space-y-3 p-4 rounded-lg border-2 border-black/10 dark:border-white/20 bg-white dark:bg-black">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="saveTemplate"
                          checked={saveAsTemplate}
                          onChange={(e) => setSaveAsTemplate(e.target.checked)}
                          className="w-4 h-4 rounded cursor-pointer"
                        />
                        <Label htmlFor="saveTemplate" className="text-sm font-medium cursor-pointer text-black dark:text-white">
                          Save as template
                        </Label>
                      </div>
                      {saveAsTemplate && (
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Template Name</Label>
                          <Input
                            placeholder="e.g., 'My standard intro'"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            className="h-9 text-sm bg-white dark:bg-black border-black/10 dark:border-white/20"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Side of Form - Message */}
                <div className="space-y-2 flex flex-col">
                  <Label htmlFor="bidMessage" className="text-sm font-medium text-black dark:text-white">
                    Message to Homeowner
                  </Label>
                  <Textarea
                    id="bidMessage"
                    placeholder="Tell the homeowner about your experience, approach, and why you're the best fit..."
                    value={bidMessage}
                    onChange={(e) => setBidMessage(e.target.value)}
                    className="flex-1 text-sm bg-white dark:bg-black border-black/10 dark:border-white/20 resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    💬 A compelling message helps you stand out
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Section - Fixed */}
          <div className="px-8 py-4 border-t border-black/10 dark:border-white/10 bg-white dark:bg-black flex-shrink-0">
            <DialogFooter className="flex-col sm:flex-row gap-3 sm:justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-black dark:text-white">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Free bidding • $0 fee • Keep 100%</span>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  className="h-10 px-6 text-sm border-black/10 dark:border-white/20"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitBid}
                  className="h-10 px-8 text-sm font-semibold bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
                >
                  Submit Bid – $0 Fee
                </Button>
              </div>
            </DialogFooter>
          </div>
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
