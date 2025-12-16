import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SkeletonLoader } from "@/components/ui/SkeletonLoader"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { toast } from "sonner"
import { 
  Briefcase, 
  User, 
  ChatCircle, 
  CheckCircle, 
  Clock,
  CreditCard,
  Package,
  ChartBar,
  CircleNotch,
  Sparkle
} from "@phosphor-icons/react"
import { Lightbox } from "@/components/ui/Lightbox"
import { CompletionCard } from "@/components/jobs/CompletionCard"
import type { Job, Bid, User as UserType, Invoice } from "@/lib/types"
import { getJobSizeEmoji, getJobSizeLabel } from "@/lib/types"
import { getMilestoneProgress } from "@/lib/milestones"
import { Progress } from "@/components/ui/progress"
import { GlassNav } from "@/components/ui/MarketingSections"

interface MyJobsProps {
  user: UserType
  onNavigate?: (page: string, role?: string, jobId?: string) => void
}

export function MyJobs({ user, onNavigate }: MyJobsProps) {
  const [jobs, setJobs] = useKV<Job[]>("jobs", [])
  const [, setInvoices] = useKV<Invoice[]>("invoices", [])
  const jobsLoading = false
  const [isInitializing, setIsInitializing] = useState(true)
  // Homeowner pages don't use glass (free tier)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  // Simulate initial loading
  useEffect(() => {
    if (!jobsLoading) {
      const timer = setTimeout(() => setIsInitializing(false), 500)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [jobsLoading])
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [cardNumber, setCardNumber] = useState("")
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [completionCardOpen, setCompletionCardOpen] = useState(false)
  const [completedJob, setCompletedJob] = useState<Job | null>(null)

  const myJobs = (jobs || []).filter(job => job.homeownerId === user.id)
  const openJobs = myJobs.filter(job => job.status === 'open')
  const inProgressJobs = myJobs.filter(job => job.status === 'in-progress')
  const completedJobs = myJobs.filter(job => job.status === 'completed')

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background p-[1pt]">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <SkeletonLoader variant="text" className="h-10 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonLoader key={i} variant="card" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleViewBids = (job: Job) => {
    setSelectedJob(job)
  }

  const handlePhotoClick = (photos: string[], index: number) => {
    setLightboxImages(photos)
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const handleAcceptBid = (job: Job, bid: Bid) => {
    setSelectedJob(job)
    setSelectedBid(bid)
    setPaymentDialogOpen(true)
  }

  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const handlePayment = useCallback(async () => {
    if (!selectedJob || !selectedBid || isProcessingPayment) return

    // Enhanced validation
    const cleanedCardNumber = cardNumber.replace(/\s/g, '')
    if (!cleanedCardNumber || cleanedCardNumber.length < 13 || cleanedCardNumber.length > 19) {
      toast.error("Please enter a valid card number (13-19 digits)")
      return
    }

    // Basic Luhn check
    const luhnCheck = (num: string): boolean => {
      let sum = 0
      let isEven = false
      for (let i = num.length - 1; i >= 0; i--) {
        let digit = parseInt(num[i])
        if (isEven) {
          digit *= 2
          if (digit > 9) digit -= 9
        }
        sum += digit
        isEven = !isEven
      }
      return sum % 10 === 0
    }

    if (!luhnCheck(cleanedCardNumber)) {
      toast.error("Invalid card number. Please check and try again.")
      return
    }

    setIsProcessingPayment(true)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1000))

      const platformFee = 20
      const totalAmount = selectedBid.amount + platformFee

      setJobs((currentJobs) =>
        (currentJobs || []).map(job => {
          if (job.id === selectedJob.id) {
            return {
              ...job,
              status: 'in-progress' as const,
              bids: job.bids.map(b =>
                b.id === selectedBid.id
                  ? { ...b, status: 'accepted' as const }
                  : { ...b, status: 'rejected' as const }
              )
            }
          }
          return job
        })
      )

      const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        contractorId: selectedBid.contractorId,
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        lineItems: [
          { description: selectedJob.title, quantity: 1, rate: selectedBid.amount, total: selectedBid.amount }
        ],
        subtotal: selectedBid.amount,
        taxRate: 0,
        taxAmount: 0,
        total: selectedBid.amount,
        status: 'paid',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        sentDate: new Date().toISOString(),
        paidDate: new Date().toISOString(),
        isProForma: false,
        lateFeeApplied: false,
        createdAt: new Date().toISOString()
      }

      setInvoices((current) => [...(current || []), newInvoice])

      toast.success(`Payment processed! ${selectedBid.contractorName} has been notified.`, {
        description: `Total: $${totalAmount.toLocaleString()} ($${selectedBid.amount.toLocaleString()} + $${platformFee} platform fee)`
      })

      setPaymentDialogOpen(false)
      setSelectedJob(null)
      setSelectedBid(null)
      setCardNumber("")
    } catch (error) {
      console.error("Payment processing error:", error)
      toast.error("Payment processing failed. Please try again.")
    } finally {
      setIsProcessingPayment(false)
    }
  }, [selectedJob, selectedBid, cardNumber, isProcessingPayment, setJobs, setInvoices])

  const handleMarkComplete = (job: Job) => {
    setJobs((currentJobs) =>
      (currentJobs || []).map(j =>
        j.id === job.id ? { ...j, status: 'completed' as const } : j
      )
    )
    
    // Show completion card
    setCompletedJob(job)
    setCompletionCardOpen(true)
    
    toast.success("Job marked as complete! Thank you for using FairTradeWorker.")
  }

  const sortedBids = (job: Job) => {
    return [...job.bids].sort((a, b) => {
      // Accepted bids always first
      if (a.status === 'accepted') return -1
      if (b.status === 'accepted') return 1
      
      // Boosted bids come next (within 24 hours)
      const aIsBoosted = a.isBoosted && a.boostedUntil && new Date(a.boostedUntil) > new Date()
      const bIsBoosted = b.isBoosted && b.boostedUntil && new Date(b.boostedUntil) > new Date()
      
      if (aIsBoosted && !bIsBoosted) return -1
      if (!aIsBoosted && bIsBoosted) return 1
      
      // Then sort by amount (lowest first)
      return a.amount - b.amount
    })
  }

  const JobCard = ({ job }: { job: Job }) => {
    // Find the accepted contractor for completed jobs
    const acceptedBid = job.bids.find(bid => bid.status === 'accepted')
    
    return (
    <Card className="hover:shadow-md transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-sm">
                {getJobSizeEmoji(job.size)} {getJobSizeLabel(job.size)}
              </Badge>
              <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>
                {job.status === 'open' && <Clock weight="fill" className="mr-1" size={14} />}
                {job.status === 'completed' && <CheckCircle weight="fill" className="mr-1" size={14} />}
                {job.status.charAt(0).toUpperCase() + job.status.slice(1).replace('-', ' ')}
              </Badge>
            </div>
            <CardTitle className="text-xl">{job.title}</CardTitle>
            <CardDescription className="mt-2 line-clamp-2">
              {job.aiScope.scope}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Re-Hire Prompt for Completed Jobs */}
        {job.status === 'completed' && acceptedBid && (
          <Card className="border-2 border-accent/30 bg-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Need {acceptedBid.contractorName} again?</h4>
                  <p className="text-xs text-muted-foreground">
                    Tap to request another quote from the same contractor
                  </p>
                </div>
                <Button 
                  size="sm"
                  onClick={() => {
                    toast.success(`Request sent to ${acceptedBid.contractorName}!`)
                    // In a real app, this would create a direct quote request
                  }}
                >
                  Re-Hire
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Estimated Price:</span>
          <span className="font-semibold">
            ${job.aiScope.priceLow} - ${job.aiScope.priceHigh}
          </span>
        </div>

        {job.photos && job.photos.length > 0 && (
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Photos ({job.photos.length})</Label>
            <div className="grid grid-cols-4 gap-2">
              {job.photos.slice(0, 4).map((photo, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-md border border-black/20 dark:border-white/20 overflow-hidden cursor-pointer hover:shadow-md transition-all"
                  onClick={() => handlePhotoClick(job.photos || [], idx)}
                >
                  <img
                    src={photo || 'https://via.placeholder.com/400x400/cccccc/666666?text=Photo'}
                    alt={`Job photo ${idx + 1}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      if (!target.src.includes('placeholder')) {
                        target.src = 'https://via.placeholder.com/400x400/cccccc/666666?text=Photo'
                        target.onerror = null
                      }
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {job.aiScope.materials && job.aiScope.materials.length > 0 && (
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block flex items-center gap-1">
              <Package size={14} weight="fill" />
              Materials Needed
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {job.aiScope.materials.slice(0, 3).map((material, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {material}
                </Badge>
              ))}
              {job.aiScope.materials.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{job.aiScope.materials.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {job.milestones && job.milestones.length > 0 && (
          <div className="p-3 bg-white dark:bg-black border border-black/20 dark:border-white/20 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm text-muted-foreground flex items-center gap-1">
                <ChartBar size={14} weight="fill" />
                Project Progress
              </Label>
              <span className="text-xs font-medium">
                {getMilestoneProgress(job.milestones).percentage}%
              </span>
            </div>
            <Progress value={getMilestoneProgress(job.milestones).percentage} className="h-2 mb-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{getMilestoneProgress(job.milestones).completed} of {job.milestones.length} milestones</span>
              <span>${getMilestoneProgress(job.milestones).amountPaid.toLocaleString()} paid</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t gap-2">
          <div className="flex items-center gap-2">
            <ChatCircle weight="fill" className="text-primary" size={18} />
            <span className="text-sm font-medium">{job.bids.length} bid{job.bids.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex gap-2">
            {job.tier === 'MAJOR_PROJECT' && job.milestones && job.milestones.length > 0 && onNavigate && (
              <Button 
                onClick={() => onNavigate('project-milestones', undefined, job.id)} 
                size="sm"
                variant="outline"
              >
                <ChartBar weight="fill" className="mr-2" size={16} />
                Milestones
              </Button>
            )}
            {job.status === 'open' && (
              <Button onClick={() => handleViewBids(job)} size="sm">
                View Bids
              </Button>
            )}
            {job.status === 'in-progress' && (
              <Button onClick={() => handleMarkComplete(job)} size="sm">
                <CheckCircle weight="fill" className="mr-2" size={16} />
                Mark Complete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )}

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <GlassNav
        brand={{ name: "FairTradeWorker" }}
        links={[
          { label: "Home", href: "#" },
          { label: "My Jobs", href: "#", active: true },
          { label: "Free Tools", href: "#" },
        ]}
        primaryLabel="Post Job" />

      <div className="container mx-auto px-4 md:px-8 pt-20 pb-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">My Jobs</h1>
            <p className="text-muted-foreground mt-1">Manage your posted jobs and contractor bids</p>
          </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Open Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{openJobs.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Waiting for bids</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{inProgressJobs.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Work underway</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{completedJobs.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Jobs finished</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="open" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="open">Open ({openJobs.length})</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress ({inProgressJobs.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedJobs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="space-y-4 mt-6">
            {openJobs.length === 0 ? (
              <Card className="p-12 text-center">
                <Briefcase size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
                <h3 className="font-semibold text-lg mb-2 text-black dark:text-white">No open jobs</h3>
                <p className="text-muted-foreground">Post a job to get started!</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {openJobs.map(job => <JobCard key={job.id} job={job} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="in-progress" className="space-y-4 mt-6">
            {inProgressJobs.length === 0 ? (
              <Card className="p-12 text-center">
                <Clock size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
                <h3 className="font-semibold text-lg mb-2 text-black dark:text-white">No jobs in progress</h3>
                <p className="text-muted-foreground">Accept a bid to get work started</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {inProgressJobs.map(job => <JobCard key={job.id} job={job} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-6">
            {completedJobs.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
                <h3 className="font-semibold text-lg mb-2 text-black dark:text-white">No completed jobs</h3>
                <p className="text-muted-foreground">Completed jobs will appear here</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {completedJobs.map(job => <JobCard key={job.id} job={job} />)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedJob && !paymentDialogOpen} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 h-[95vh]">
          <div className="px-8 pt-6 pb-4 border-b border-black/10 dark:border-white/10 flex-shrink-0">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl">Bids for {selectedJob?.title}</DialogTitle>
              <DialogDescription>
                Review and accept the best bid for your job
              </DialogDescription>
            </DialogHeader>
          </div>

          {selectedJob && (
            <div className="flex-1 overflow-hidden p-6">
              {sortedBids(selectedJob).length === 0 ? (
                <div className="text-center py-16">
                  <ChatCircle size={64} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
                  <p className="text-lg text-muted-foreground">No bids yet. Check back soon!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full overflow-hidden">
                  {sortedBids(selectedJob).map((bid) => {
                    const isBoosted = bid.isBoosted && bid.boostedUntil && new Date(bid.boostedUntil) > new Date()
                    
                    return (
                    <Card key={bid.id} className={bid.status === 'accepted' ? 'border-2 border-primary' : isBoosted ? 'border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20' : 'flex flex-col'}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-md bg-black dark:bg-white border border-black/20 dark:border-white/20 flex items-center justify-center shadow-sm">
                              <User weight="fill" className="text-primary" size={20} />
                            </div>
                            <CardTitle className="text-base">{bid.contractorName}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            {isBoosted && (
                              <Badge variant="secondary" className="text-xs bg-yellow-400 text-black border-yellow-500">
                                <Sparkle weight="fill" className="mr-1" size={10} />
                                Boosted
                              </Badge>
                            )}
                            {bid.status === 'accepted' && (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle weight="fill" className="mr-1" size={10} />
                                Accepted
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="text-xl font-bold text-primary">${bid.amount}</div>
                          <div className="text-xs text-muted-foreground">+ $20 platform fee</div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <p className="text-sm mb-4 line-clamp-4 flex-1">{bid.message}</p>
                        {bid.status === 'pending' && selectedJob.status === 'open' && (
                          <Button 
                            onClick={() => handleAcceptBid(selectedJob, bid)} 
                            className="w-full"
                            size="sm"
                          >
                            <CreditCard weight="fill" className="mr-2" size={16} />
                            Accept & Pay ${bid.amount + 20}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 h-[95vh]">
          <div className="px-8 pt-6 pb-4 border-b border-black/10 dark:border-white/10 flex-shrink-0">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl">Complete Payment</DialogTitle>
              <DialogDescription>
                Pay contractor/subcontractor and $20 platform fee. Contractor/Subcontractor keeps 100% of their bid.
              </DialogDescription>
            </DialogHeader>
          </div>

          {selectedBid && (
            <div className="flex-1 overflow-hidden p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Payment Summary */}
              <div className="space-y-4">
                <Card className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex justify-between text-base">
                      <span className="text-muted-foreground">Contractor/Subcontractor bid:</span>
                      <span className="font-semibold">${selectedBid.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-muted-foreground">Platform fee:</span>
                      <span className="font-semibold">$20</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t text-lg">
                      <span className="font-bold">Total:</span>
                      <span className="font-bold text-primary text-xl">${(selectedBid.amount + 20).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Payment Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-number" className="text-base">Card Number (Simulated)</Label>
                  <Input
                    id="card-number"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => {
                      // Format card number with spaces
                      const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '')
                      const formatted = value.match(/.{1,4}/g)?.join(' ') || value
                      setCardNumber(formatted.slice(0, 19))
                    }}
                    disabled={isProcessingPayment}
                    className="text-lg"
                    maxLength={19}
                    aria-label="Card number"
                  />
                  {cardNumber && cardNumber.replace(/\s/g, '').length < 13 && (
                    <p className="text-sm text-muted-foreground">
                      Card number must be 13-19 digits
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="px-8 py-4 border-t border-black/10 dark:border-white/10 flex-shrink-0">
            <DialogFooter className="gap-3">
              <Button variant="outline" onClick={() => setPaymentDialogOpen(false)} className="h-11">
                Cancel
              </Button>
              <Button 
                onClick={handlePayment} 
                className="h-11 border-2 border-black dark:border-white"
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <CircleNotch size={18} className="mr-2 animate-spin" weight="bold" />
                    Processing...
                ) : (
                  <>
                    <CreditCard weight="fill" className="mr-2" size={18} />
                    Complete Payment
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Lightbox
        images={lightboxImages}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        initialIndex={lightboxIndex}
      />

      {/* Completion Card Dialog */}
      <Dialog open={completionCardOpen} onOpenChange={setCompletionCardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🎉 Job Complete!</DialogTitle>
            <DialogDescription>Share your success story on social media</DialogDescription>
          </DialogHeader>

          {completedJob && (() => {
            const acceptedBid = completedJob.bids.find(b => b.status === 'accepted')
            return (
              <CompletionCard
                jobTitle={completedJob.title}
                contractorName={acceptedBid?.contractorName || 'Contractor'}
                amount={acceptedBid?.amount || 0}
                rating={(completedJob as any).rating || 5}
                beforePhoto={completedJob.beforePhotos?.[0]}
                afterPhoto={completedJob.afterPhotos?.[0]}
                createdAt={completedJob.createdAt}
              />
            )
          })()}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}

export default MyJobs
