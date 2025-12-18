
import { useState, useMemo, memo, useCallback, useEffect, lazy, Suspense, useRef, createContext, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { universalCardHover } from "@/lib/animations"
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
import { Skeleton } from "@/components/ui/skeleton"
import { BidIntelligence } from "@/components/contractor/BidIntelligence"
import { DriveTimeWarning } from "./DriveTimeWarning"
const JobMap = lazy(() => import("./JobMap").then(mod => ({ default: mod.JobMap })))
import { JobQA } from "./JobQA"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { toast } from "sonner"
import { Wrench, CurrencyDollar, Package, Images, Funnel, MapTrifold, List, Timer, Eye, Users, CircleNotch, Sparkle, CaretLeft, CaretRight, Microphone, VideoCamera, Camera, Notebook, X, Rows } from "@phosphor-icons/react"
import type { Job, Bid, User, JobSize, BidTemplate, JobInputType } from "@/lib/types"
import { getJobSizeEmoji, getJobSizeLabel } from "@/lib/types"
import { revenueConfig } from "@/lib/revenueConfig"
import { cn } from "@/lib/utils"
import { useOutsideClick } from "@/hooks/use-outside-click"

// Media type badge configuration
const MEDIA_TYPE_CONFIG: Record<JobInputType, { icon: typeof Microphone; label: string; color: string; bgColor: string }> = {
  audio: { icon: Microphone, label: 'Voice', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800' },
  video: { icon: VideoCamera, label: 'Video', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800' },
  photo: { icon: Camera, label: 'Photo', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' },
  text: { icon: Notebook, label: 'Notes', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800' },
}

// Media type badge component
function MediaTypeBadge({ type, size = 'sm' }: { type?: JobInputType; size?: 'sm' | 'lg' }) {
  if (!type) return null
  const config = MEDIA_TYPE_CONFIG[type]
  if (!config) return null
  const Icon = config.icon
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "flex items-center gap-1 font-medium",
        config.bgColor,
        size === 'lg' ? 'text-sm py-1 px-3' : 'text-xs py-0.5 px-2'
      )}
    >
      <Icon size={size === 'lg' ? 16 : 12} weight="duotone" className={config.color} />
      <span className={config.color}>{config.label}</span>
    </Badge>
  )
}

// Apple Cards Carousel Context
const AppleCarouselContext = createContext<{
  onCardClose: (index: number) => void
  currentIndex: number
}>({
  onCardClose: () => {},
  currentIndex: 0,
})

// Apple Cards Carousel Component
function AppleCarousel({ children, initialScroll = 0 }: { children: React.ReactNode[]; initialScroll?: number }) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll
      checkScrollability()
    }
  }, [initialScroll])

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth)
    }
  }

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -350, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 350, behavior: "smooth" })
    }
  }

  const handleCardClose = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = window.innerWidth < 768 ? 280 : 400
      const gap = 16
      const scrollPosition = (cardWidth + gap) * index
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      })
      setCurrentIndex(index)
    }
  }

  return (
    <AppleCarouselContext.Provider value={{ onCardClose: handleCardClose, currentIndex }}>
      <div className="relative w-full">
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto py-6 md:py-10 scroll-smooth [scrollbar-width:none]"
          ref={carouselRef}
          onScroll={checkScrollability}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex flex-row justify-start gap-4 pl-4 pr-[20%]">
            {children.map((child, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: Math.min(0.1 * index, 0.5),
                    ease: "easeOut",
                  },
                }}
                key={index}
                className="rounded-3xl flex-shrink-0"
              >
                {child}
              </motion.div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 mr-6 mt-2">
          <button
            className="relative z-40 h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center disabled:opacity-50 transition-all hover:scale-105"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <CaretLeft className="h-6 w-6 text-gray-500 dark:text-gray-300" weight="bold" />
          </button>
          <button
            className="relative z-40 h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center disabled:opacity-50 transition-all hover:scale-105"
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <CaretRight className="h-6 w-6 text-gray-500 dark:text-gray-300" weight="bold" />
          </button>
        </div>
      </div>
    </AppleCarouselContext.Provider>
  )
}

// Apple Card Component for Jobs
const AppleJobCard = memo(function AppleJobCard({
  job,
  index,
  onPlaceBid,
  userRole
}: {
  job: Job
  index: number
  onPlaceBid: (job: Job) => void
  userRole?: 'contractor' | 'operator' | 'homeowner'
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { onCardClose } = useContext(AppleCarouselContext)

  const photos = useMemo(() => {
    const jobPhotos = job.photos || []
    return jobPhotos.filter((photo): photo is string => 
      Boolean(photo && typeof photo === 'string' && photo.trim() && (photo.startsWith('http') || photo.startsWith('data:') || photo.startsWith('/'))
    ))
  }, [job.photos])

  const heroImage = photos[0] || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=60'

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose()
      }
    }

    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  useOutsideClick(containerRef, () => handleClose())

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    onCardClose(index)
  }

  const sizeConfig = {
    small: { label: 'Small Job', color: 'text-green-400', bg: 'bg-green-500/20' },
    medium: { label: 'Medium Job', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    large: { label: 'Large Job', color: 'text-red-400', bg: 'bg-red-500/20' }
  }

  const size = sizeConfig[job.size] || sizeConfig.small

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 h-screen z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-black/80 backdrop-blur-lg h-full w-full fixed inset-0"
            />
            <div className="flex items-start justify-center min-h-screen py-10 px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                ref={containerRef}
                className="max-w-5xl w-full bg-white dark:bg-neutral-900 h-fit z-[60] p-4 md:p-10 rounded-3xl font-sans relative"
              >
              <button
                className="sticky top-4 h-8 w-8 right-0 ml-auto bg-black dark:bg-white rounded-full flex items-center justify-center z-10"
                onClick={handleClose}
              >
                <X className="h-5 w-5 text-white dark:text-black" weight="bold" />
              </button>
              
              {/* Hero Image */}
              <div className="relative h-64 md:h-80 -mx-4 md:-mx-10 -mt-4 md:-mt-10 mb-6 rounded-t-3xl overflow-hidden">
                <img src={heroImage} alt={job.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
                  <Badge className={cn(size.bg, size.color, "border-0 mb-2")}>
                    {getJobSizeEmoji(job.size)} {size.label}
                  </Badge>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {job.title}
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <CurrencyDollar size={16} weight="duotone" />
                      ${job.aiScope.priceLow.toLocaleString()} - ${job.aiScope.priceHigh.toLocaleString()}
                    </span>
                    <span>•</span>
                    <span>{job.bids.length} {job.bids.length === 1 ? 'bid' : 'bids'}</span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {job.description}
                </p>

                {job.aiScope?.scope && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Sparkle size={18} weight="duotone" className="text-primary" />
                      AI Scope Analysis
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{job.aiScope.scope}</p>
                  </div>
                )}

                {job.aiScope?.materials && job.aiScope.materials.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Materials Needed</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.aiScope.materials.map((material, idx) => (
                        <Badge key={idx} variant="outline" className="text-sm">
                          <Package size={14} className="mr-1" weight="duotone" />
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {photos.length > 1 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Job Photos</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {photos.slice(0, 8).map((photo, idx) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                          <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button 
                    onClick={() => {
                      handleClose()
                      onPlaceBid(job)
                    }}
                    size="lg" 
                    className="w-full h-14 text-lg font-bold bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                  >
                    Place Bid • $0 Fee
                  </Button>
                </div>
              </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
      
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleOpen}
        className="rounded-3xl bg-gray-100 dark:bg-neutral-900 h-80 w-72 md:h-[32rem] md:w-96 overflow-hidden flex flex-col items-start justify-start relative z-10 group"
      >
        <div className="absolute h-full top-0 inset-x-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-30 pointer-events-none" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 z-40">
          <Badge className={cn(size.bg, size.color, "border-0 backdrop-blur-sm")}>
            {getJobSizeEmoji(job.size)} {size.label}
          </Badge>
          {job.mediaType && (
            <div className="mt-2">
              <MediaTypeBadge type={job.mediaType} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 z-40 p-5 md:p-6">
          <p className="text-white/80 text-xs md:text-sm font-medium mb-1">
            ${job.aiScope.priceLow.toLocaleString()} - ${job.aiScope.priceHigh.toLocaleString()}
          </p>
          <h3 className="text-white text-lg md:text-2xl font-bold max-w-xs text-left [text-wrap:balance] mb-3 line-clamp-2">
            {job.title}
          </h3>
          <div className="flex items-center gap-3 text-white/70 text-xs md:text-sm mb-4">
            <span>{job.bids.length} {job.bids.length === 1 ? 'bid' : 'bids'}</span>
            <span>•</span>
            <span>{Math.round((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60))}h ago</span>
          </div>
          
          {/* Place Bid Button */}
          <Button 
            onClick={(e) => {
              e.stopPropagation()
              onPlaceBid(job)
            }}
            className="w-full bg-white/90 hover:bg-white text-black font-bold group-hover:bg-[#00FF00] transition-colors"
          >
            Place Bid • $0 Fee
          </Button>
        </div>

        {/* Background Image */}
        <img
          className="object-cover absolute z-10 inset-0 w-full h-full transition duration-300 group-hover:scale-105"
          src={heroImage}
          alt={job.title}
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=60'
          }}
        />
      </motion.button>
    </>
  )
})

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
  onNavigate?: (page: string) => void
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
    // Filter out empty/null/undefined photos and ensure they're valid URLs
    return jobPhotos.filter((photo): photo is string => 
      Boolean(photo && typeof photo === 'string' && photo.trim() && (photo.startsWith('http') || photo.startsWith('data:') || photo.startsWith('/'))
    ))
  }, [job.photos])
  
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({})
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
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
    <motion.div
      whileHover={universalCardHover.hover}
      whileTap={{ scale: 0.98 }}
      style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      className="h-full"
    >
      <Card className={`overflow-hidden border-0 hover:shadow-xl transition-shadow group h-full flex flex-col relative ${isFresh ? "ring-2 ring-green-500/50 ring-offset-2" : ""}`}>
      {/* Priority Lead Banner for Operators */}
      {isPriorityLead && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-[#FFFF00] text-black px-4 py-2 flex items-center gap-2 border-b-2 border-transparent dark:border-black shadow-[0_2px_0_#000]">
          <span className="font-black text-lg">⚡</span>
          <span className="font-black text-sm uppercase">PRIORITY LEAD - 10 MIN EARLY ACCESS</span>
        </div>
      )}
      
      {/* Fresh Job Banner */}
      {isFresh && !isPriorityLead && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-green-400 dark:bg-green-500 text-black px-4 py-2 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="font-black text-lg">⚡</span>
          <span className="font-black text-sm uppercase">FRESH JOB - FIRST TO BID GETS FEATURED!</span>
        </div>
      )}

      {/* Hero Image Section - Improved Layout */}
      {photos.length > 0 && photos[0] ? (
        <div className="relative h-72 md:h-80 overflow-hidden bg-muted group/image-container">
          <button
            onClick={() => onViewPhotos(photos)}
            className="relative w-full h-full block"
          >
            {imageLoading[0] && !imageErrors[0] && (
              <Skeleton className="absolute inset-0 w-full h-full" />
            )}
            <img
              src={photos[0]}
              alt={`${job.title} - Job photo`}
              className={cn(
                "w-full h-full object-cover transition-all duration-500",
                "group-hover/image-container:scale-105",
                imageLoading[0] && !imageErrors[0] && "opacity-0",
                imageErrors[0] && "hidden"
              )}
              loading="lazy"
              decoding="async"
              onLoadStart={() => setImageLoading(prev => ({ ...prev, 0: true }))}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                setImageLoading(prev => ({ ...prev, 0: false }))
                setImageErrors(prev => ({ ...prev, 0: true }))
                // Try fallback image
                if (!target.src.includes('placeholder') && !target.src.includes('data:') && !target.dataset.fallback) {
                  target.dataset.fallback = 'true'
                  target.src = 'https://via.placeholder.com/800x600/cccccc/666666?text=Job+Photo'
                }
              }}
              onLoad={(e) => {
                const target = e.target as HTMLImageElement
                setImageLoading(prev => ({ ...prev, 0: false }))
                target.style.opacity = '1'
              }}
            />
            {imageErrors[0] && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <div className="text-center p-4">
                  <Images size={48} weight="duotone" className="mx-auto mb-2 text-muted-foreground" />
                  <div className="text-xs text-muted-foreground">Photo unavailable</div>
                </div>
              </div>
            )}
            {/* Gradient Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
            
            {/* Overlay Info */}
            <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
              {/* Top Section - Badges */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={job.size === 'small' ? 'success' : job.size === 'medium' ? 'warning' : 'destructive'}
                    className="backdrop-blur-sm bg-white/20 text-white border-white/30 text-sm py-1 px-3"
                  >
                    {getJobSizeEmoji(job.size)} {getJobSizeLabel(job.size)}
                  </Badge>
                  {/* Media Type Badge */}
                  {job.mediaType && (
                    <MediaTypeBadge type={job.mediaType} size="lg" />
                  )}
                </div>
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
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/image-container:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onPlaceBid(job)
                }}
                className="bg-white text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#00FF00] transition-colors shadow-2xl pointer-events-auto"
              >
                Place Bid • $0 Fee
              </button>
            </div>
          </button>
        </div>
      ) : (
        <div className="relative h-48 md:h-56 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
          {/* Show appropriate icon based on media type */}
          <div className="text-center p-4">
            {job.mediaType === 'audio' ? (
              <>
                <Microphone size={48} weight="duotone" className="mx-auto mb-2 text-purple-500" />
                <div className="text-xs text-muted-foreground">Voice Recording Job</div>
              </>
            ) : job.mediaType === 'video' ? (
              <>
                <VideoCamera size={48} weight="duotone" className="mx-auto mb-2 text-red-500" />
                <div className="text-xs text-muted-foreground">Video Description Job</div>
              </>
            ) : job.mediaType === 'text' ? (
              <>
                <Notebook size={48} weight="duotone" className="mx-auto mb-2 text-emerald-500" />
                <div className="text-xs text-muted-foreground">Text Description Job</div>
              </>
            ) : (
              <>
                <Wrench size={48} weight="duotone" className="mx-auto mb-2 text-muted-foreground" />
                <div className="text-xs text-muted-foreground">No photos available</div>
              </>
            )}
          </div>
          {/* Badge Overlay on No Photo */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge 
              variant={job.size === 'small' ? 'success' : job.size === 'medium' ? 'warning' : 'destructive'}
              className="shadow-sm"
            >
              {getJobSizeEmoji(job.size)} {getJobSizeLabel(job.size)}
            </Badge>
            {job.mediaType && <MediaTypeBadge type={job.mediaType} />}
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
              <Badge variant="outline" className="text-xs animate-pulse bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
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
              {photos.slice(1, 5).map((photo, idx) => {
                const photoIndex = idx + 1
                return (
                <button
                  key={idx}
                  onClick={() => onViewPhotos(photos)}
                  className="relative aspect-square rounded-md overflow-hidden hover:ring-2 hover:ring-primary transition-all group/thumb"
                >
                    {imageLoading[photoIndex] && !imageErrors[photoIndex] && (
                      <Skeleton className="absolute inset-0 w-full h-full" />
                    )}
                  <img
                    src={photo || 'https://via.placeholder.com/400x400/cccccc/666666?text=Photo'}
                    alt={`Photo ${idx + 2}`}
                      className={cn(
                        "w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-200",
                        imageLoading[photoIndex] && !imageErrors[photoIndex] && "opacity-0",
                        imageErrors[photoIndex] && "hidden"
                      )}
                    loading="lazy"
                      onLoadStart={() => setImageLoading(prev => ({ ...prev, [photoIndex]: true }))}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                        setImageLoading(prev => ({ ...prev, [photoIndex]: false }))
                        setImageErrors(prev => ({ ...prev, [photoIndex]: true }))
                        if (!target.src.includes('placeholder') && !target.src.includes('data:')) {
                        target.src = 'https://via.placeholder.com/400x400/cccccc/666666?text=Photo'
                        target.onerror = null
                      }
                    }}
                      onLoad={() => setImageLoading(prev => ({ ...prev, [photoIndex]: false }))}
                  />
                    {imageErrors[photoIndex] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted">
                        <Images size={20} weight="duotone" className="text-muted-foreground" />
                      </div>
                    )}
                </button>
                )
              })}
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
    </motion.div>
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
  const [mediaTypeFilter, setMediaTypeFilter] = useState<JobInputType | 'all'>('all')
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'table' | 'carousel'>('carousel')
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
    
    // Filter by media type
    if (mediaTypeFilter !== 'all') {
      openJobs = openJobs.filter(job => job.mediaType === mediaTypeFilter)
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
  }, [jobs, sizeFilter, mediaTypeFilter, user.role])

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
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-sm font-semibold text-foreground">
                      <span className="font-bold text-amber-700 dark:text-amber-400">{sortedOpenJobs.filter(j => j.bids.length === 0).length}</span> no bids
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
                <Card className="px-5 py-4 min-w-[140px] lg:min-w-[180px] border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                      <Wrench size={18} weight="duotone" className="text-primary" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-foreground">{sortedOpenJobs.length}</div>
                  </div>
                  <div className="text-xs md:text-sm font-medium text-muted-foreground">Active Jobs</div>
                </Card>
                <Card className="px-5 py-4 min-w-[140px] lg:min-w-[180px] border-border hover:border-emerald-500/50 transition-colors">
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                      <Eye size={18} weight="duotone" className="text-emerald-600 dark:text-emerald-400" />
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
              <div className="flex flex-col gap-4">
                {/* First Row: Size Filters + View Mode */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Job Size Filters */}
                  <div className="flex items-center gap-3 md:gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <Funnel weight="duotone" size={18} className="text-primary" />
                      <span className="font-semibold text-xs md:text-sm text-muted-foreground hidden sm:inline">Size:</span>
                    </div>
                    
                    <Tabs value={sizeFilter} onValueChange={(v) => setSizeFilter(v as JobSize | 'all')} className="flex-1">
                      <TabsList className="grid grid-cols-4 w-full md:w-auto bg-muted/50 h-auto p-1">
                        <TabsTrigger value="all" className="text-xs md:text-sm py-2 px-3 transition-colors hover:bg-black/5 dark:hover:bg-white/10 data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black">All</TabsTrigger>
                        <TabsTrigger value="small" className="text-xs md:text-sm py-2 px-3 transition-colors hover:bg-green-100 dark:hover:bg-green-900/30 data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black">🟢 Small</TabsTrigger>
                        <TabsTrigger value="medium" className="text-xs md:text-sm py-2 px-3 transition-colors hover:bg-yellow-100 dark:hover:bg-yellow-900/30 data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black">🟡 Medium</TabsTrigger>
                        <TabsTrigger value="large" className="text-xs md:text-sm py-2 px-3 transition-colors hover:bg-red-100 dark:hover:bg-red-900/30 data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black">🔴 Large</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-3 md:border-l md:pl-4">
                    <span className="text-xs md:text-sm font-medium text-muted-foreground hidden sm:inline">View:</span>
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'map' | 'table' | 'carousel')}>
                      <TabsList className="bg-muted/50 h-auto p-1">
                        <TabsTrigger value="carousel" className="gap-2 py-2 px-3 text-xs md:text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/10 data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black" aria-label="View jobs as carousel">
                          <Rows weight="duotone" size={16} />
                          <span className="hidden sm:inline">Cards</span>
                        </TabsTrigger>
                        <TabsTrigger value="list" className="gap-2 py-2 px-3 text-xs md:text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/10 data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black" aria-label="View jobs as grid">
                          <List weight="duotone" size={16} />
                          <span className="hidden sm:inline">Grid</span>
                        </TabsTrigger>
                        <TabsTrigger value="table" className="gap-2 py-2 px-3 text-xs md:text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/10 data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black" aria-label="View jobs as table">
                          <Eye weight="duotone" size={16} />
                          <span className="hidden sm:inline">Table</span>
                        </TabsTrigger>
                        <TabsTrigger value="map" className="gap-2 py-2 px-3 text-xs md:text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/10 data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black" aria-label="View jobs on map">
                          <MapTrifold weight="duotone" size={16} />
                          <span className="hidden sm:inline">Map</span>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
                
                {/* Second Row: Media Type Filters */}
                <div className="flex items-center gap-3 md:gap-4 border-t border-border/50 pt-4">
                  <div className="flex items-center gap-2">
                    <Camera weight="duotone" size={18} className="text-primary" />
                    <span className="font-semibold text-xs md:text-sm text-muted-foreground hidden sm:inline">Type:</span>
                  </div>
                  
                  <Tabs value={mediaTypeFilter} onValueChange={(v) => setMediaTypeFilter(v as JobInputType | 'all')} className="flex-1">
                    <TabsList className="grid grid-cols-5 w-full md:w-auto bg-muted/50 h-auto p-1">
                      <TabsTrigger value="all" className="text-xs md:text-sm py-2 px-3 transition-colors hover:bg-black/5 dark:hover:bg-white/10 data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black">
                        All
                      </TabsTrigger>
                      <TabsTrigger value="photo" className="text-xs md:text-sm py-2 px-3 gap-1 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/30 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                        <Camera weight="duotone" size={14} className="hidden sm:inline" />
                        📸 Photo
                      </TabsTrigger>
                      <TabsTrigger value="video" className="text-xs md:text-sm py-2 px-3 gap-1 transition-colors hover:bg-red-100 dark:hover:bg-red-900/30 data-[state=active]:bg-red-600 data-[state=active]:text-white">
                        <VideoCamera weight="duotone" size={14} className="hidden sm:inline" />
                        🎬 Video
                      </TabsTrigger>
                      <TabsTrigger value="audio" className="text-xs md:text-sm py-2 px-3 gap-1 transition-colors hover:bg-purple-100 dark:hover:bg-purple-900/30 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                        <Microphone weight="duotone" size={14} className="hidden sm:inline" />
                        🎙️ Voice
                      </TabsTrigger>
                      <TabsTrigger value="text" className="text-xs md:text-sm py-2 px-3 gap-1 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-900/30 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                        <Notebook weight="duotone" size={14} className="hidden sm:inline" />
                        📝 Notes
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </Card>
          </div>

          {/* Jobs Grid/List/Table Section */}
          <div className="space-y-4">
            {viewMode === 'map' ? (
              <div className="rounded-xl overflow-hidden border border-border shadow-lg">
                <Suspense fallback={<Card className="p-8 text-center">Loading map…</Card>}>
                  <JobMap jobs={sortedOpenJobs} onJobClick={handleBidClick} />
                </Suspense>
              </div>
            ) : viewMode === 'table' ? (
              /* Compact Table View - Maximum Information Density */
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30 border-b border-border">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-foreground">Job</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-foreground">Size</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-foreground">Price Range</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-foreground">Bids</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-foreground">Posted</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedOpenJobs.slice(0, visibleCount).map((job, idx) => {
                        const jobAge = Date.now() - new Date(job.createdAt).getTime()
                        const isFresh = jobAge <= 15 * 60 * 1000 && job.bids.length === 0
                        return (
                          <tr 
                            key={job.id} 
                            className={cn(
                              "border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer",
                              idx % 2 === 0 && "bg-muted/10"
                            )}
                            onClick={() => handleBidClick(job)}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-start gap-3">
                                {job.photos && job.photos[0] && job.photos[0].trim() ? (
                                  <img 
                                    src={job.photos[0]} 
                                    alt={job.title}
                                    className="w-16 h-16 rounded object-cover flex-shrink-0"
                                    loading="lazy"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      if (!target.src.includes('placeholder') && !target.src.includes('data:')) {
                                        target.src = 'https://via.placeholder.com/64x64/cccccc/666666?text=Photo'
                                        target.onerror = null
                                      }
                                    }}
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                    <Images size={24} weight="duotone" className="text-muted-foreground" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-sm text-foreground line-clamp-1">{job.title}</h3>
                                    {isFresh && (
                                      <Badge variant="success" className="text-xs px-1.5 py-0">Fresh</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2">{job.description}</p>
                                  {job.location && (
                                    <p className="text-xs text-muted-foreground mt-1">{job.location}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={job.size === 'small' ? 'success' : job.size === 'medium' ? 'warning' : 'destructive'} className="text-xs">
                                {getJobSizeEmoji(job.size)} {getJobSizeLabel(job.size)}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm font-semibold text-foreground">
                                ${job.aiScope.priceLow.toLocaleString()} - ${job.aiScope.priceHigh.toLocaleString()}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Users size={14} weight="duotone" className="text-muted-foreground" />
                                <span className="text-sm font-medium text-foreground">{job.bids.length}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-xs text-muted-foreground">
                                {new Date(job.createdAt).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {Math.round(jobAge / (1000 * 60))}m ago
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Button
                                size="sm"
                                className="w-full text-xs h-8"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleBidClick(job)
                                }}
                              >
                                Bid Now
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {sortedOpenJobs.length > visibleCount && (
                  <div className="p-4 border-t border-border text-center">
                    <Button
                      variant="outline"
                      onClick={() => setVisibleCount(prev => prev + 50)}
                      className="text-sm"
                    >
                      Load More ({sortedOpenJobs.length - visibleCount} remaining)
                    </Button>
                  </div>
                )}
              </Card>
            ) : sortedOpenJobs.length === 0 ? (
              <Card className="p-12 md:p-16 text-center border-border bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                <div className="max-w-md mx-auto space-y-6">
                  <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto">
                    <Wrench size={64} weight="duotone" className="mx-auto text-muted-foreground/50" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">No Jobs Available</h2>
                    <p className="text-muted-foreground text-base md:text-lg">
                      {sizeFilter === 'all' && mediaTypeFilter === 'all'
                        ? "We'll notify you when new opportunities arrive!"
                        : sizeFilter !== 'all' && mediaTypeFilter !== 'all'
                        ? `No ${getJobSizeLabel(sizeFilter as JobSize).toLowerCase()} ${MEDIA_TYPE_CONFIG[mediaTypeFilter as JobInputType]?.label || ''} jobs match your filters.`
                        : sizeFilter !== 'all'
                        ? `No ${getJobSizeLabel(sizeFilter as JobSize).toLowerCase()} jobs match your filters.`
                        : `No ${MEDIA_TYPE_CONFIG[mediaTypeFilter as JobInputType]?.label || ''} jobs match your filters.`
                      }
                    </p>
                  </div>
                  {(sizeFilter !== 'all' || mediaTypeFilter !== 'all') && (
                    <Button 
                      onClick={() => { setSizeFilter('all'); setMediaTypeFilter('all'); }}
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
            ) : viewMode === 'carousel' ? (
              /* Apple Cards Carousel View */
              <div className="w-full overflow-hidden -mx-4 md:-mx-6 lg:-mx-8">
                <AppleCarousel>
                  {sortedOpenJobs.slice(0, 20).map((job, index) => (
                    <AppleJobCard
                      key={job.id}
                      job={job}
                      index={index}
                      onPlaceBid={handleBidClick}
                      userRole={user.role}
                    />
                  ))}
                </AppleCarousel>
                {sortedOpenJobs.length > 20 && (
                  <div className="text-center pb-6">
                    <Button
                      variant="outline"
                      onClick={() => setViewMode('list')}
                      className="text-sm"
                    >
                      View All {sortedOpenJobs.length} Jobs in Grid View
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Compact Grid View - More Jobs Per Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sortedOpenJobs.slice(0, visibleCount).map(job => (
                    <div key={job.id} className="h-full">
                            <JobCard
                              userRole={user.role}
                              job={job}
                              onViewPhotos={handlePhotoClick}
                              onPlaceBid={handleBidClick}
                            />
                          </div>
                        ))}
                    </div>
                {sortedOpenJobs.length > visibleCount && (
                  <div className="text-center pt-6">
                    <Button
                      variant="outline"
                      onClick={() => setVisibleCount(prev => prev + 50)}
                      className="text-sm"
                    >
                      Load More ({sortedOpenJobs.length - visibleCount} remaining)
                    </Button>
                        </div>
                )}
              </>
            )}
                      </div>
                          </div>
                    </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 h-[98vh] max-w-[98vw] lg:max-w-[1800px] xl:max-w-[95vw]">
          {/* Header Section - Fixed */}
          <div className="px-10 pt-8 pb-6 border-b border-transparent dark:border-white/10 bg-white dark:bg-black flex-shrink-0">
            <DialogHeader className="text-left">
              <DialogTitle className="text-4xl md:text-5xl font-extrabold text-black dark:text-white mb-3">
                Submit Your Bid
              </DialogTitle>
              <DialogDescription className="text-xl text-muted-foreground">
                {selectedJob?.title}
              </DialogDescription>
              {selectedJob && (
                <div className="flex items-center gap-4 mt-4">
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {getJobSizeEmoji(selectedJob.size)} {getJobSizeLabel(selectedJob.size)}
                  </Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    <CurrencyDollar size={14} className="mr-1" weight="duotone" />
                    ${selectedJob.aiScope.priceLow.toLocaleString()} - ${selectedJob.aiScope.priceHigh.toLocaleString()}
                  </Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    <Users size={14} className="mr-1" weight="duotone" />
                    {selectedJob.bids.length} {selectedJob.bids.length === 1 ? 'bid' : 'bids'}
                  </Badge>
                        </div>
              )}
            </DialogHeader>
                      </div>

          {/* Main Content Area - Column Layout - Scrollable */}
          <div className="flex-1 overflow-y-auto px-10 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Job Info & Intelligence (4 columns) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Job Photos Preview */}
              {selectedJob && selectedJob.photos && selectedJob.photos.length > 0 && (
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Images size={20} weight="duotone" className="text-primary" />
                      Job Photos ({selectedJob.photos.filter(p => p && p.trim()).length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedJob.photos.filter(p => p && p.trim()).slice(0, 4).map((photo, idx) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden border-0 shadow-md hover:shadow-lg relative group cursor-pointer" onClick={() => handlePhotoClick(selectedJob.photos?.filter(p => p && p.trim()) || [])}>
                          <img 
                            src={photo} 
                            alt={`Job photo ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              if (!target.src.includes('placeholder') && !target.src.includes('data:')) {
                                target.src = 'https://via.placeholder.com/400x400/cccccc/666666?text=Photo'
                                target.onerror = null
                              }
                            }}
                            />
                          </div>
                        ))}
                    </div>
                    {selectedJob.photos.filter(p => p && p.trim()).length > 4 && (
                        <Button
                          variant="outline"
                        className="w-full mt-3"
                        onClick={() => handlePhotoClick(selectedJob.photos?.filter(p => p && p.trim()) || [])}
                        >
                        View All {selectedJob.photos.filter(p => p && p.trim()).length} Photos
                        </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Expanded Job Details */}
              {selectedJob && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Wrench size={20} weight="duotone" className="text-primary" />
                      Job Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-1">Description</h4>
                      <p className="text-sm text-foreground leading-relaxed">{selectedJob.description}</p>
                    </div>
                    {selectedJob.aiScope?.scope && (
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-1">AI Scope Analysis</h4>
                        <p className="text-sm text-foreground leading-relaxed">{selectedJob.aiScope.scope}</p>
                      </div>
                    )}
                    {selectedJob.location && (
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-1">Location</h4>
                        <p className="text-sm text-foreground">{selectedJob.location}</p>
                  </div>
                )}
                    {selectedJob.aiScope?.materials && selectedJob.aiScope.materials.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2">Materials Needed</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.aiScope.materials.map((material, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              <Package size={12} className="mr-1" weight="duotone" />
                              {material}
                            </Badge>
                          ))}
          </div>
        </div>
                    )}
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-1">Posted</h4>
                      <p className="text-sm text-foreground">
                        {new Date(selectedJob.createdAt).toLocaleDateString()} at {new Date(selectedJob.createdAt).toLocaleTimeString()}
                      </p>
      </div>
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Bid Intelligence */}
              {selectedJob && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Bid Intelligence</CardTitle>
                  </CardHeader>
                  <CardContent>
                  <BidIntelligence
                    jobCategory={selectedJob.title}
                    jobPriceLow={selectedJob.aiScope.priceLow}
                    jobPriceHigh={selectedJob.aiScope.priceHigh}
                    contractorWinRate={user.winRate}
                  />
                    <div className="mt-4 pt-4 border-t border-transparent dark:border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Your Win Rate</span>
                        <span className="font-semibold text-foreground">{(user.winRate || 0).toFixed(1)}%</span>
                </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Competition Level</span>
                        <span className="font-semibold text-foreground">
                          {selectedJob.bids.length === 0 ? 'Low' : selectedJob.bids.length < 3 ? 'Medium' : 'High'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Recommended Bid Range</span>
                        <span className="font-semibold text-foreground">
                          ${Math.round(selectedJob.aiScope.priceLow * 0.95).toLocaleString()} - ${Math.round(selectedJob.aiScope.priceHigh * 0.98).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Drive Time Warning */}
              {selectedJob && myScheduledJobs.length > 0 && (
                <Card>
                  <CardContent className="p-5">
                  <DriveTimeWarning
                    targetJob={selectedJob}
                    scheduledJobs={myScheduledJobs}
                    user={user}
                  />
                  </CardContent>
                </Card>
              )}

              {/* Questions & Answers */}
              {selectedJob && (
                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Questions & Answers</CardTitle>
                    <CardDescription>Review questions from other contractors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <JobQA job={selectedJob} currentUser={user} isContractor={true} />
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Right Column - Bid Form (8 columns) */}
            <div className="lg:col-span-8 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-black dark:text-white">Your Bid Details</CardTitle>
                  <CardDescription className="text-base">Fill out the form below to submit your bid</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side of Form */}
                <div className="space-y-5">
                  {/* Bid Templates Dropdown */}
                  {user.role === 'contractor' && bidTemplates.filter(t => t.contractorId === user.id).length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-medium text-black dark:text-white">Load Template (Optional)</Label>
                      <Select onValueChange={handleTemplateSelect}>
                        <SelectTrigger className="h-12 text-base bg-white dark:bg-black border-transparent dark:border-white/20">
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
                      className="h-12 text-lg bg-white dark:bg-black border-transparent dark:border-white/20"
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
                    <div className="space-y-3 p-5 rounded-lg border border-transparent dark:border-white/20 bg-white dark:bg-black">
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
                            className="h-11 text-base bg-white dark:bg-black border-0 shadow-md"
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
                    className="flex-1 text-base bg-white dark:bg-black border-transparent dark:border-white/20 resize-none min-h-[200px]"
                  />
                  <p className="text-sm text-muted-foreground">
                    💬 A compelling message helps you stand out
                  </p>
                </div>
              </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer Section - Fixed */}
          <div className="px-10 py-6 border-t border-transparent dark:border-white/10 bg-white dark:bg-black flex-shrink-0">
            <DialogFooter className="flex-col sm:flex-row gap-6 sm:justify-between items-start sm:items-center">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-lg font-semibold text-black dark:text-white">
                  <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                <span>Free bidding • $0 fee • Keep 100%</span>
              </div>
                <p className="text-sm text-muted-foreground">
                  No hidden fees. No commission. You keep every dollar you earn.
                </p>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  className="h-14 px-10 text-lg font-semibold border-transparent dark:border-white/20 flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitBid}
                  disabled={isSubmittingBid}
                  className="h-14 px-12 text-lg font-bold bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 border-0 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
                >
                  {isSubmittingBid ? (
                    <>
                      <CircleNotch size={20} className="mr-2 animate-spin" weight="bold" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      {bidBoost && <Sparkle weight="fill" size={20} className="mr-2 text-yellow-400" />}
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
