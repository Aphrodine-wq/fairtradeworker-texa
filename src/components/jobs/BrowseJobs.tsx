import { useState } from "react"
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

interface BrowseJobsProps {
  user: User
}

export function BrowseJobs({ user }: BrowseJobsProps) {
  const [jobs, setJobs] = useKV<Job[]>("jobs", [])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [bidAmount, setBidAmount] = useState("")
  const [bidMessage, setBidMessage] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const openJobs = (jobs || []).filter(job => job.status === 'open')

  const handleBidClick = (job: Job) => {
    setSelectedJob(job)
    setBidAmount("")
    setBidMessage("")
    setDialogOpen(true)
  }

  const handlePhotoClick = (photos: string[], index: number) => {
    setLightboxImages(photos)
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

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

  if (openJobs.length === 0) {
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
          <p className="text-muted-foreground">Find your next project</p>
        </div>

        <div className="space-y-6">
          {openJobs.map(job => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                    <CardDescription className="text-base">
                      {job.aiScope.scope}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {job.bids.length} {job.bids.length === 1 ? 'bid' : 'bids'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.photos && job.photos.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Images size={18} weight="duotone" />
                      <span>Photos ({job.photos.length})</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {job.photos.map((photo, idx) => (
                        <button
                          key={idx} 
                          onClick={() => handlePhotoClick(job.photos || [], idx)}
                          className="relative aspect-video rounded-lg overflow-hidden bg-muted group cursor-pointer transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          <img 
                            src={photo} 
                            alt={`Job photo ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Images 
                              size={32} 
                              weight="duotone" 
                              className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {job.aiScope.materials && job.aiScope.materials.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Package size={18} weight="duotone" />
                      <span>Materials Needed</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.aiScope.materials.map((material, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary"
                          className="text-xs px-3 py-1"
                        >
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <CurrencyDollar weight="fill" className="text-accent" size={24} />
                    <span className="text-secondary">${job.aiScope.priceLow}</span>
                    <span className="text-muted-foreground">-</span>
                    <span className="text-primary">${job.aiScope.priceHigh}</span>
                  </div>
                  <Button onClick={() => handleBidClick(job)}>
                    Bid Now
                  </Button>
                </div>
              </CardContent>
            </Card>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitBid}>
              Submit Bid
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
