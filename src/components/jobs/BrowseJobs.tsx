
import { useState, useMemo, memo, useCallback, useEffect, lazy, Suspense, useRef } from "react"
import { SkeletonGrid } from "@/components/ui/SkeletonLoader"
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
import { DriveTimeWarning } from "./DriveTimeWarning"
const JobMap = lazy(() => import("./JobMap").then(mod => ({ default: mod.JobMap })))
import { JobQA } from "./JobQA"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { toast } from "sonner"
import { Wrench, CurrencyDollar, Package, Images, Funnel, MapTrifold, List, Timer, Eye, Users, CircleNotch, Sparkle, CaretLeft, CaretRight } from "@phosphor-icons/react"
import type { Job, Bid, User, JobSize, BidTemplate } from "@/lib/types"
import { getJobSizeEmoji, getJobSizeLabel } from "@/lib/types"
import { revenueConfig } from "@/lib/revenueConfig"

// Carousel Lane component with scroll arrows
function CarouselLane({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', checkScroll)
    checkScroll()
    return () => el.removeEventListener('scroll', checkScroll)
  }, [checkScroll])

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const scrollAmount = 380 // Width of one card + gap
    el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
  }

  return (
    <div className="relative group">
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 -translate-x-4"
          aria-label="Scroll left"
        >
          <CaretLeft size={28} weight="bold" className="text-gray-800 dark:text-white" />
        </button>
      )}
      
      {/* Scrollable Content */}
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory scrollbar-hide" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
      
      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 translate-x-4"
          aria-label="Scroll right"
        >
          <CaretRight size={28} weight="bold" className="text-gray-800 dark:text-white" />
        </button>
      )}
    </div>
  )
}

interface BrowseJobsProps {
  user: User
}

const JobCard = memo(function JobCard({ 
  job, 
  onViewPhotos, 
  onPlaceBid,
  userRole
}: { 
  job: Job
  onViewPhotos: (photos: string[]) => void
  onPlaceBid: (job: Job) => void
  userRole?: 'contractor' | 'operator' | 'homeowner'
}) {
  const [timeRemaining, setTimeRemaining] = useState<string>("")
  
  const isFresh = useMemo(() => {
    const jobAge = Date.now() - new Date(job.createdAt).getTime()
    const fifteenMinutes = 15 * 60 * 1000
    return jobAge <= fifteenMinutes && job.size === 'small' && job.bids.length === 0
  }, [job.createdAt, job.size, job.bids.length])

  const isPriorityLead = useMemo(() => {
    // Priority leads for operators: jobs less than 10 minutes old
    if (userRole !== 'operator') return false
    const jobAge = Date.now() - new Date(job.createdAt).getTime()
    const tenMinutes = 10 * 60 * 1000
    return jobAge <= tenMinutes
  }, [job.createdAt, userRole])

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

  const photos = useMemo(() => {
    const jobPhotos = job.photos || []
    // Filter out empty/null/undefined photos
    return jobPhotos.filter((photo): photo is string => Boolean(photo && photo.trim()))
  }, [job.photos])
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
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg group h-full flex flex-col relative ${isFresh ? "ring-2 ring-green-500/50 ring-offset-2" : ""}`}>
      {/* Priority Lead Banner for Operators */}
      {isPriorityLead && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-[#FFFF00] text-black px-4 py-2 flex items-center gap-2 border-b-2 border-black shadow-[0_2px_0_#000]">
          <span className="font-black text-lg">⚡</span>
          <span className="font-black text-sm uppercase">PRIORITY LEAD - 10 MIN EARLY ACCESS</span>
        </div>
      )}
      
      {/* Fresh Job Banner */}
      {isFresh && !isPriorityLead && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-[#00FF00] text-black px-4 py-2 flex items-center gap-2 border-b-2 border-black shadow-[0_2px_0_#000]">
          <span className="font-black text-lg">⚡</span>
          <span className="font-black text-sm uppercase">FRESH JOB - FIRST TO BID GETS FEATURED!</span>
        </div>
      )}

      {/* Hero Image Section */}
      {photos.length > 0 && photos[0] ? (
        <div className="relative h-64 overflow-hidden bg-muted">
          <button
            onClick={() => onViewPhotos(photos)}
            className="relative w-full h-full group/image"
          >
            <img
              src={photos[0]}
              alt="Job preview"
              className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                if (!target.src.includes('placeholder') && !target.src.includes('data:')) {
                  target.src = 'https://via.placeholder.com/800x600/cccccc/666666?text=Job+Photo'
                  target.onerror = null
                }
              }}
              onLoad={(e) => {
                // Image loaded successfully
                const target = e.target as HTMLImageElement
                target.style.opacity = '1'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            
            {/* Overlay Info */}
            <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
              {/* Top Section - Badges */}
              <div className="flex items-center justify-between">
                <Badge 
                  variant={job.size === 'small' ? 'success' : job.size === 'medium' ? 'warning' : 'destructive'}
                  className="backdrop-blur-sm bg-white/20 text-white border-white/30 text-sm py-1 px-3"
                >
                  {getJobSizeEmoji(job.size)} {getJobSizeLabel(job.size)}
                </Badge>
                {photos.length > 1 && (
                  <Badge variant="outline" className="backdrop-blur-sm bg-white/20 text-white border-white/30 text-sm py-1 px-3">
                    <Images size={14} className="mr-1" weight="duotone" />
                    {photos.length} photos
                  </Badge>
                )}
              </div>
              
              {/* Bottom Section - Title, Price, and Bid Button */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white line-clamp-2 drop-shadow-lg">
                  {job.title}
                </h3>
                <div className="flex items-center gap-3 text-sm font-medium">
                  <div className="flex items-center gap-1 backdrop-blur-sm bg-white/20 px-3 py-1.5 rounded-md">
                    <CurrencyDollar size={16} weight="duotone" />
                    <span>${job.aiScope.priceLow.toLocaleString()}-${job.aiScope.priceHigh.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 backdrop-blur-sm bg-white/20 px-3 py-1.5 rounded-md">
                    <span>{job.bids.length}</span>
                    <span>{job.bids.length === 1 ? 'bid' : 'bids'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Hover Overlay with Bid Button */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onPlaceBid(job)
                }}
                className="bg-white text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#00FF00] transition-colors shadow-2xl"
              >
                Place Bid • $0 Fee
              </button>
            </div>
          </button>
        </div>
      ) : (
        <div className="relative h-48 bg-muted flex items-center justify-center">
          <div className="text-center">
            <Wrench size={48} weight="duotone" className="mx-auto mb-2 text-muted-foreground" />
            <div className="text-xs text-muted-foreground">No photos available</div>
          </div>
          {/* Badge Overlay on No Photo */}
          <div className="absolute top-3 left-3">
            <Badge 
              variant={job.size === 'small' ? 'success' : job.size === 'medium' ? 'warning' : 'destructive'}
              className="shadow-sm"
            >
              {getJobSizeEmoji(job.size)} {getJobSizeLabel(job.size)}
            </Badge>
          </div>
        </div>
      )}

      <CardHeader className="pb-3 pt-4">
        <div className="space-y-3">
          {/* Title Section */}
          <div>
            <CardTitle className="text-xl leading-tight mb-2 text-black dark:text-white line-clamp-2 group-hover:text-primary transition-colors">
              {job.title}
            </CardTitle>
            <CardDescription className="text-sm line-clamp-2 text-muted-foreground">
              {job.description}
            </CardDescription>
          </div>

          {/* Badges and Stats Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {!photos.length && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                <CurrencyDollar size={12} weight="duotone" />
                <span className="font-semibold">${job.aiScope.priceLow.toLocaleString()}-${job.aiScope.priceHigh.toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              <span className="font-semibold">{job.bids.length}</span>
              <span>{job.bids.length === 1 ? 'bid' : 'bids'}</span>
            </div>
            
            {/* Social Proof Indicators */}
            {viewingCount > 0 && (
              <Badge variant="outline" className="text-xs animate-pulse bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <Eye size={12} className="mr-1" weight="duotone" />
                {viewingCount} viewing
              </Badge>
            )}
            {recentBidsCount > 0 && (
              <Badge variant="outline" className="text-xs animate-pulse bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
                <Users size={12} className="mr-1" weight="duotone" />
                {recentBidsCount} recent
              </Badge>
            )}
            
            {/* Urgent Badge */}
            {isUrgent && !isExpired && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                <Timer size={12} className="mr-1" weight="duotone" />
                {timeRemaining}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-0 flex-grow flex flex-col">
        {/* AI Scope Section */}
        {job.aiScope && (
          <div className="rounded-lg p-4 bg-gray-50 dark:bg-gray-900 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 rounded-lg bg-primary/10">
                <Wrench weight="bold" size={18} className="text-primary" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">AI SCOPE</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{job.aiScope.scope}</p>
            <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <CurrencyDollar weight="bold" size={20} className="text-green-600 dark:text-green-400" />
              <div>
                <div className="text-xs uppercase text-gray-500 dark:text-gray-400">ESTIMATED RANGE</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ${job.aiScope.priceLow.toLocaleString()} - ${job.aiScope.priceHigh.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Materials Section */}
        {materials.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package weight="duotone" size={14} className="text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground">Materials Needed</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {materials.slice(0, 4).map((material, idx) => (
                <Badge key={idx} variant="outline" className="text-xs py-0.5 px-2 bg-background">
                  {material}
                </Badge>
              ))}
              {materials.length > 4 && (
                <Badge variant="outline" className="text-xs py-0.5 px-2 bg-background">
                  +{materials.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Photo Grid - Only if more than 1 photo and main photo shown */}
        {photos.length > 1 && photos.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Images weight="duotone" size={14} className="text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground">Additional Photos</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {photos.slice(1, 5).map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => onViewPhotos(photos)}
                  className="relative aspect-square rounded-md overflow-hidden hover:ring-2 hover:ring-primary transition-all group/thumb"
                >
                  <img
                    src={photo || 'https://via.placeholder.com/400x400/cccccc/666666?text=Photo'}
                    alt={`Photo ${idx + 2}`}
                    className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-200"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      if (!target.src.includes('placeholder')) {
                        target.src = 'https://via.placeholder.com/400x400/cccccc/666666?text=Photo'
                        target.onerror = null
                      }
                    }}
                  />
                </button>
              ))}
            </div>
            {photos.length > 5 && (
              <button
                onClick={() => onViewPhotos(photos)}
                className="text-xs text-primary hover:underline font-medium"
              >
                View all {photos.length} photos →
              </button>
            )}
          </div>
        )}

        {/* Footer Section */}
        <div className="mt-auto pt-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>Posted {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span>•</span>
              <span>{Math.round((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60))}h ago</span>
            </div>
          </div>
          <Button 
            onClick={() => onPlaceBid(job)} 
            size="lg" 
            className="w-full font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
          >
            Place Bid • $0 Fee
          </Button>
          {revenueConfig.premiumLead.enabled && revenueConfig.premiumLead.ctaUrl && userRole === 'contractor' && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full justify-center text-xs"
            >
              <a href={revenueConfig.premiumLead.ctaUrl} target="_blank" rel="noreferrer">
                Premium lead access {revenueConfig.premiumLead.priceHint ? `• ${revenueConfig.premiumLead.priceHint}` : ''}
              </a>
            </Button>
          )}
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
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [sizeFilter, setSizeFilter] = useState<JobSize | 'all'>('all')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [visibleCount, setVisibleCount] = useState(50)

  const myScheduledJobs = useMemo(() => {
    return (jobs || []).filter(job =>
      job.bids.some(bid => bid.contractorId === user.id && bid.status === 'accepted')
    )
  }, [jobs, user.id])

  const sortedOpenJobs = useMemo(() => {
    if (!jobs || jobs.length === 0) return []
    
    let openJobs = jobs.filter(job => job.status === 'open')
    
    // Priority leads for operators: operators see jobs 10 minutes before contractors
    if (user.role === 'contractor') {
      const tenMinutesAgo = Date.now() - (10 * 60 * 1000)
      openJobs = openJobs.filter(job => {
        const jobCreatedAt = new Date(job.createdAt).getTime()
        // Contractors only see jobs older than 10 minutes (operators get priority)
        return jobCreatedAt <= tenMinutesAgo
      })
    }
    // Operators see all jobs immediately (priority access)
    
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
  }, [jobs, sizeFilter, user.role])

  const visibleJobs = useMemo(() => {
    return sortedOpenJobs.slice(0, visibleCount)
  }, [sortedOpenJobs, visibleCount])

  const handleBidClick = useCallback((job: Job) => {
    setSelectedJob(job)
      setBidAmount("")
      setBidMessage("")
      setSaveAsTemplate(false)
      setTemplateName("")
      setBidBoost(false)
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

  const [isSubmittingBid, setIsSubmittingBid] = useState(false)
  const [bidBoost, setBidBoost] = useState(false)

  const handleSubmitBid = useCallback(async () => {
    if (!selectedJob || isSubmittingBid) return

    const amount = parseFloat(bidAmount.replace(/[^0-9.]/g, ''))
    if (!amount || amount <= 0 || isNaN(amount)) {
      toast.error("Please enter a valid bid amount")
      return
    }

    if (amount < selectedJob.aiScope.priceLow * 0.5) {
      toast.error(`Bid seems too low. Estimated range is $${selectedJob.aiScope.priceLow}-${selectedJob.aiScope.priceHigh}`)
      return
    }

    if (amount > selectedJob.aiScope.priceHigh * 3) {
      toast.error(`Bid seems too high. Estimated range is $${selectedJob.aiScope.priceLow}-${selectedJob.aiScope.priceHigh}`)
      return
    }

    if (!bidMessage.trim()) {
      toast.error("Please add a message with your bid")
      return
    }

    if (bidMessage.trim().length < 10) {
      toast.error("Please provide a more detailed message (at least 10 characters)")
      return
    }

    setIsSubmittingBid(true)

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

    try {
      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const jobTime = new Date(selectedJob.createdAt).getTime()
      const bidTime = Date.now()
      const responseTimeMinutes = Math.round((bidTime - jobTime) / 1000 / 60)
      const isLightning = responseTimeMinutes <= 10
    
    // Check existing boosts on this job (max 2 per job)
    const existingBoosts = selectedJob.bids.filter(b => b.isBoosted && b.boostedUntil && new Date(b.boostedUntil) > new Date()).length
    const canBoost = bidBoost && existingBoosts < 2
    
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
      isLightningBid: isLightning,
      isBoosted: canBoost,
      boostedUntil: canBoost ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : undefined,
      boostCount: canBoost ? existingBoosts + 1 : 0
    }

    setJobs((currentJobs) => 
      (currentJobs || []).map(job =>
        job.id === selectedJob.id
          ? { ...job, bids: [...job.bids, newBid] }
          : job
      )
    )

      if (canBoost) {
        toast.success("Bid boosted! Your bid will appear at the top for 24 hours. $5 charge will be processed.")
      } else if (isLightning && selectedJob.bids.length < 3) {
        toast.success(`⚡ Lightning bid! You responded in ${responseTimeMinutes} minutes!`)
      } else {
        toast.success("Bid submitted successfully!")
      }
      
      setDialogOpen(false)
      setSelectedJob(null)
      setBidAmount("")
      setBidMessage("")
      setBidBoost(false)
    } catch (error) {
      console.error("Error submitting bid:", error)
      toast.error("Failed to submit bid. Please try again.")
    } finally {
      setIsSubmittingBid(false)
    }
  }, [selectedJob, bidAmount, bidMessage, saveAsTemplate, templateName, user, setJobs, setBidTemplates, bidTemplates])

  if (sortedOpenJobs.length === 0) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <Wrench className="mx-auto mb-4 text-muted-foreground" size={64} weight="duotone" />
            <h2 className="text-2xl font-bold mb-2 text-black dark:text-white">No Jobs Available</h2>
            <p className="text-muted-foreground">Check back soon for new opportunities!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          {/* Modernized Hero Header Section */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-8">
              <div className="space-y-3 md:space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 dark:bg-primary/20">
                    <Wrench size={28} weight="duotone" className="text-primary" />
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-foreground tracking-tight">
                    Browse Jobs
                  </h1>
                </div>
                <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                  Find your next project – <span className="font-bold text-primary">bid free</span>, keep <span className="font-bold text-green-600 dark:text-green-400">100%</span>
                </p>
                
                {/* Modernized Quick Stats */}
                <div className="flex flex-wrap items-center gap-4 md:gap-6 pt-1">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-semibold text-foreground">
                      <span className="font-bold text-green-600 dark:text-green-400">{sortedOpenJobs.length}</span> active
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-sm font-semibold text-foreground">
                      <span className="font-bold text-blue-600 dark:text-blue-400">{sortedOpenJobs.filter(j => j.bids.length === 0).length}</span> no bids
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-sm font-semibold text-foreground">
                      <span className="font-bold text-orange-600 dark:text-orange-400">{sortedOpenJobs.filter(j => {
                        const jobAge = Date.now() - new Date(j.createdAt).getTime()
                        const fifteenMinutes = 15 * 60 * 1000
                        return jobAge <= fifteenMinutes && j.size === 'small' && j.bids.length === 0
                      }).length}</span> fresh
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Stats Cards */}
              <div className="flex gap-3 lg:flex-col lg:gap-3">
                <Card className="px-5 py-4 min-w-[140px] lg:min-w-[180px] border-border hover:border-primary/50 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                      <Wrench size={18} weight="duotone" className="text-primary" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-foreground">{sortedOpenJobs.length}</div>
                  </div>
                  <div className="text-xs md:text-sm font-medium text-muted-foreground">Active Jobs</div>
                </Card>
                <Card className="px-5 py-4 min-w-[140px] lg:min-w-[180px] border-border hover:border-blue-500/50 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                      <Eye size={18} weight="duotone" className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-foreground">
                      {sortedOpenJobs.filter(j => j.bids.length === 0).length}
                    </div>
                  </div>
                  <div className="text-xs md:text-sm font-medium text-muted-foreground">No Bids Yet</div>
                </Card>
              </div>
            </div>
          </div>

          {/* Modernized Filter & View Controls */}
          <div className="space-y-3">
            <Card className="p-4 md:p-5 border-border bg-white/50 dark:bg-black/50 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Job Size Filters */}
                <div className="flex items-center gap-3 md:gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    <Funnel weight="duotone" size={18} className="text-primary" />
                    <span className="font-semibold text-xs md:text-sm text-muted-foreground hidden sm:inline">Filter:</span>
                  </div>
                  
                  <Tabs value={sizeFilter} onValueChange={(v) => setSizeFilter(v as JobSize | 'all')} className="flex-1">
                    <TabsList className="grid grid-cols-4 w-full md:w-auto bg-muted/50 h-auto p-1">
                      <TabsTrigger value="all" className="text-xs md:text-sm py-2 px-3 data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black">All</TabsTrigger>
                      <TabsTrigger value="small" className="text-xs md:text-sm py-2 px-3 data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black">🟢 Small</TabsTrigger>
                      <TabsTrigger value="medium" className="text-xs md:text-sm py-2 px-3 data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black">🟡 Medium</TabsTrigger>
                      <TabsTrigger value="large" className="text-xs md:text-sm py-2 px-3 data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black">🔴 Large</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex items-center gap-3 md:border-l md:pl-4">
                  <span className="text-xs md:text-sm font-medium text-muted-foreground hidden sm:inline">View:</span>
                  <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'map')}>
                    <TabsList className="bg-muted/50 h-auto p-1">
                      <TabsTrigger value="list" className="gap-2 py-2 px-3 text-xs md:text-sm data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black" aria-label="View jobs as list">
                        <List weight="duotone" size={16} />
                        <span className="hidden sm:inline">List</span>
                      </TabsTrigger>
                      <TabsTrigger value="map" className="gap-2 py-2 px-3 text-xs md:text-sm data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black" aria-label="View jobs on map">
                        <MapTrifold weight="duotone" size={16} />
                        <span className="hidden sm:inline">Map</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </Card>
          </div>

          {/* Jobs Grid/List Section */}
          <div className="space-y-8">
            {viewMode === 'map' ? (
              <div className="rounded-xl overflow-hidden border border-border shadow-lg">
                <Suspense fallback={<Card className="p-8 text-center">Loading map…</Card>}>
                  <JobMap jobs={sortedOpenJobs} onJobClick={handleBidClick} />
                </Suspense>
              </div>
            ) : sortedOpenJobs.length === 0 ? (
              <Card className="p-12 md:p-16 text-center border-border bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                <div className="max-w-md mx-auto space-y-6">
                  <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto">
                    <Wrench size={64} weight="duotone" className="mx-auto text-muted-foreground/50" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">No Jobs Available</h2>
                    <p className="text-muted-foreground text-base md:text-lg">
                      {sizeFilter === 'all' 
                        ? "We'll notify you when new opportunities arrive!"
                        : `No ${getJobSizeLabel(sizeFilter as JobSize).toLowerCase()} jobs match your filters. Try a different size.`
                      }
                    </p>
                  </div>
                  {sizeFilter !== 'all' && (
                    <Button 
                      onClick={() => setSizeFilter('all')}
                      variant="outline"
                      className="mt-4"
                    >
                      View All Jobs
                    </Button>
                  )}
                </div>
              </Card>
            ) : isLoadingJobs && sortedOpenJobs.length === 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <SkeletonGrid count={6} columns={3} />
              </div>
            ) : (
              <>
                {/* Netflix-style Horizontal Lanes with Better Visual Separation */}
                {/* Fresh Jobs Lane */}
                {(() => {
                  const freshJobs = sortedOpenJobs.filter(j => {
                    const jobAge = Date.now() - new Date(j.createdAt).getTime()
                    return jobAge <= 15 * 60 * 1000 && j.bids.length === 0
                  })
                  if (freshJobs.length === 0) return null
                  return (
                    <div className="space-y-4 pb-6 border-b border-border/50">
                      <div className="flex items-center gap-3 px-2">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                          <Sparkle size={20} weight="fill" className="text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-foreground">🔥 Fresh Jobs — Be First to Bid</h3>
                        <Badge variant="success" className="ml-2 text-xs">{freshJobs.length} new</Badge>
                      </div>
                      <CarouselLane>
                        {freshJobs.map(job => (
                          <div key={job.id} className="snap-start shrink-0 w-[320px] md:w-[360px]">
                            <JobCard
                              userRole={user.role}
                              job={job}
                              onViewPhotos={handlePhotoClick}
                              onPlaceBid={handleBidClick}
                            />
                          </div>
                        ))}
                      </CarouselLane>
                    </div>
                  )
                })()}

                {/* Small Jobs Lane */}
                {(() => {
                  const smallJobs = sortedOpenJobs.filter(j => j.size === 'small')
                  if (smallJobs.length === 0 || sizeFilter !== 'all') return null
                  return (
                    <div className="space-y-4 pb-6 border-b border-border/50">
                      <div className="flex items-center gap-3 px-2">
                        <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
                          <span className="text-xl">🟢</span>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-foreground">Quick Jobs</h3>
                        <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">Under $500 • Fast turnaround</span>
                      </div>
                      <CarouselLane>
                        {smallJobs.slice(0, 10).map(job => (
                          <div key={job.id} className="snap-start shrink-0 w-[320px] md:w-[360px]">
                            <JobCard
                              userRole={user.role}
                              job={job}
                              onViewPhotos={handlePhotoClick}
                              onPlaceBid={handleBidClick}
                            />
                          </div>
                        ))}
                      </CarouselLane>
                    </div>
                  )
                })()}

                {/* Medium Jobs Lane */}
                {(() => {
                  const mediumJobs = sortedOpenJobs.filter(j => j.size === 'medium')
                  if (mediumJobs.length === 0 || sizeFilter !== 'all') return null
                  return (
                    <div className="space-y-4 pb-6 border-b border-border/50">
                      <div className="flex items-center gap-3 px-2">
                        <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                          <span className="text-xl">🟡</span>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-foreground">Standard Projects</h3>
                        <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">$500 - $2,000</span>
                      </div>
                      <CarouselLane>
                        {mediumJobs.slice(0, 10).map(job => (
                          <div key={job.id} className="snap-start shrink-0 w-[320px] md:w-[360px]">
                            <JobCard
                              userRole={user.role}
                              job={job}
                              onViewPhotos={handlePhotoClick}
                              onPlaceBid={handleBidClick}
                            />
                          </div>
                        ))}
                      </CarouselLane>
                    </div>
                  )
                })()}

                {/* Large Jobs Lane */}
                {(() => {
                  const largeJobs = sortedOpenJobs.filter(j => j.size === 'large')
                  if (largeJobs.length === 0 || sizeFilter !== 'all') return null
                  return (
                    <div className="space-y-4 pb-6">
                      <div className="flex items-center gap-3 px-2">
                        <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
                          <span className="text-xl">🔴</span>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-foreground">Major Projects</h3>
                        <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">$2,000+ • Multi-day</span>
                      </div>
                      <CarouselLane>
                        {largeJobs.slice(0, 10).map(job => (
                          <div key={job.id} className="snap-start shrink-0 w-[320px] md:w-[360px]">
                            <JobCard
                              userRole={user.role}
                              job={job}
                              onViewPhotos={handlePhotoClick}
                              onPlaceBid={handleBidClick}
                            />
                          </div>
                        ))}
                      </CarouselLane>
                    </div>
                  )
                })()}

                {/* Filtered View - Grid */}
                {sizeFilter !== 'all' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-foreground">
                        {getJobSizeLabel(sizeFilter as JobSize)} Jobs
                      </h3>
                      <span className="text-sm text-muted-foreground">{sortedOpenJobs.length} results</span>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {visibleJobs.map(job => (
                        <JobCard
                          userRole={user.role}
                          key={job.id}
                          job={job}
                          onViewPhotos={handlePhotoClick}
                          onPlaceBid={handleBidClick}
                        />
                      ))}
                    </div>
                    {visibleCount < sortedOpenJobs.length && (
                      <div className="flex justify-center pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setVisibleCount((c) => c + 50)}
                          className="h-10 px-6 text-sm"
                        >
                          Load more ({sortedOpenJobs.length - visibleCount} remaining)
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 h-[95vh] max-w-[95vw] lg:max-w-[1400px]">
          {/* Header Section - Fixed */}
          <div className="px-8 pt-6 pb-4 border-b border-black/10 dark:border-white/10 bg-white dark:bg-black flex-shrink-0">
            <DialogHeader className="text-left">
              <DialogTitle className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-2">
                Submit Your Bid
              </DialogTitle>
              <DialogDescription className="text-lg text-muted-foreground">
                {selectedJob?.title}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Main Content Area - Column Layout - No Scroll */}
          <div className="flex-1 overflow-hidden px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Job Info & Intelligence */}
            <div className="lg:col-span-1 space-y-5 overflow-hidden flex flex-col">
              {selectedJob && (
                <div className="bg-white dark:bg-black rounded-lg border border-black/10 dark:border-white/10 p-5 flex-shrink-0">
                  <BidIntelligence
                    jobCategory={selectedJob.title}
                    jobPriceLow={selectedJob.aiScope.priceLow}
                    jobPriceHigh={selectedJob.aiScope.priceHigh}
                    contractorWinRate={user.winRate}
                  />
                </div>
              )}

              {selectedJob && myScheduledJobs.length > 0 && (
                <div className="bg-white dark:bg-black rounded-lg border border-black/10 dark:border-white/10 p-4 flex-shrink-0">
                  <DriveTimeWarning
                    targetJob={selectedJob}
                    scheduledJobs={myScheduledJobs}
                    user={user}
                  />
                </div>
              )}

              {selectedJob && (
                <div className="bg-white dark:bg-black rounded-lg border border-black/10 dark:border-white/10 p-5 flex-1 overflow-hidden flex flex-col">
                  <div className="mb-3 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-black dark:text-white">Questions & Answers</h3>
                    <p className="text-sm text-muted-foreground">Review questions from other contractors</p>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <JobQA job={selectedJob} currentUser={user} isContractor={true} />
                  </div>
                </div>
              )}
            </div>
            
            {/* Right Column - Bid Form (2/3 width) */}
            <div className="lg:col-span-2 bg-white dark:bg-black rounded-lg border border-black/10 dark:border-white/10 p-8 overflow-hidden flex flex-col">
              <h3 className="text-2xl font-semibold text-black dark:text-white mb-6 flex-shrink-0">Your Bid Details</h3>
              
              <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side of Form */}
                <div className="space-y-5">
                  {/* Bid Templates Dropdown */}
                  {user.role === 'contractor' && bidTemplates.filter(t => t.contractorId === user.id).length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-medium text-black dark:text-white">Load Template (Optional)</Label>
                      <Select onValueChange={handleTemplateSelect}>
                        <SelectTrigger className="h-12 text-base bg-white dark:bg-black border-black/10 dark:border-white/20">
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
                    <Label htmlFor="bidAmount" className="text-base font-medium text-black dark:text-white">
                      Bid Amount ($)
                    </Label>
                    <Input
                      id="bidAmount"
                      type="number"
                      placeholder="Enter your bid amount"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="h-12 text-lg bg-white dark:bg-black border-black/10 dark:border-white/20"
                    />
                    {selectedJob && (
                      <p className="text-sm text-muted-foreground">
                        💡 Range: <span className="font-semibold">${selectedJob.aiScope.priceLow.toLocaleString()}</span> - <span className="font-semibold">${selectedJob.aiScope.priceHigh.toLocaleString()}</span>
                      </p>
                    )}
                  </div>

                  {/* Bid Boost Option */}
                  {user.role === 'contractor' && selectedJob && (
                    (() => {
                      const existingBoosts = selectedJob.bids.filter(b => b.isBoosted && b.boostedUntil && new Date(b.boostedUntil) > new Date()).length
                      const canBoost = existingBoosts < 2
                      
                      return (
                        <div className="space-y-3 p-5 rounded-lg border-2 border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-950/20">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="bidBoost"
                              checked={bidBoost}
                              onChange={(e) => setBidBoost(e.target.checked)}
                              disabled={!canBoost}
                              className="w-5 h-5 rounded cursor-pointer disabled:opacity-50"
                            />
                            <Label htmlFor="bidBoost" className="text-base font-medium cursor-pointer text-black dark:text-white flex items-center gap-2">
                              <Sparkle weight="fill" size={18} className="text-yellow-600 dark:text-yellow-400" />
                              Boost this bid - $5
                            </Label>
                          </div>
                          {bidBoost && (
                            <p className="text-sm text-black dark:text-white">
                              ⭐ Your bid will appear at the top of the list for 24 hours. Max 2 boosts per job.
                            </p>
                          )}
                          {!canBoost && (
                            <p className="text-sm text-muted-foreground">
                              This job already has 2 boosted bids. Boost unavailable.
                            </p>
                          )}
                        </div>
                      )
                    })()
                  )}

                  {/* Save as Template Option */}
                  {user.role === 'contractor' && bidMessage.trim() && (
                    <div className="space-y-3 p-5 rounded-lg border border-black/20/10 dark:border-white/20 bg-white dark:bg-black">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="saveTemplate"
                          checked={saveAsTemplate}
                          onChange={(e) => setSaveAsTemplate(e.target.checked)}
                          className="w-5 h-5 rounded cursor-pointer"
                        />
                        <Label htmlFor="saveTemplate" className="text-base font-medium cursor-pointer text-black dark:text-white">
                          Save as template
                        </Label>
                      </div>
                      {saveAsTemplate && (
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Template Name</Label>
                          <Input
                            placeholder="e.g., 'My standard intro'"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            className="h-11 text-base bg-white dark:bg-black border-black/10 dark:border-white/20"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Side of Form - Message */}
                <div className="space-y-2 flex flex-col">
                  <Label htmlFor="bidMessage" className="text-base font-medium text-black dark:text-white">
                    Message to Homeowner
                  </Label>
                  <Textarea
                    id="bidMessage"
                    placeholder="Tell the homeowner about your experience, approach, and why you're the best fit..."
                    value={bidMessage}
                    onChange={(e) => setBidMessage(e.target.value)}
                    className="flex-1 text-base bg-white dark:bg-black border-black/10 dark:border-white/20 resize-none min-h-[200px]"
                  />
                  <p className="text-sm text-muted-foreground">
                    💬 A compelling message helps you stand out
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Section - Fixed */}
          <div className="px-8 py-5 border-t border-black/10 dark:border-white/10 bg-white dark:bg-black flex-shrink-0">
            <DialogFooter className="flex-col sm:flex-row gap-4 sm:justify-between">
              <div className="flex items-center gap-2 text-base font-medium text-black dark:text-white">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Free bidding • $0 fee • Keep 100%</span>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  className="h-12 px-8 text-base border-black/10 dark:border-white/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitBid}
                  disabled={isSubmittingBid}
                  className="h-12 px-10 text-base font-semibold bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 border-2 border-black dark:border-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingBid ? (
                    <>
                      <CircleNotch size={18} className="mr-2 animate-spin" weight="bold" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      {bidBoost && <Sparkle weight="fill" size={18} className="mr-2 text-yellow-400" />}
                      Submit Bid{bidBoost ? ' + Boost ($5)' : ' – $0 Fee'}
                    </>
                  )}
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
