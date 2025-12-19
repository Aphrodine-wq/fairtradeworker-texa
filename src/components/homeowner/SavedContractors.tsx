import { useState, useMemo } from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { 
  Heart, 
  Star, 
  Clock,
  CurrencyDollar,
  Hammer,
  Phone,
  EnvelopeSimple,
  Trash,
  Lightning,
  CheckCircle,
  X
} from "@phosphor-icons/react"
import { toast } from "sonner"
import type { User, Job } from "@/lib/types"

interface SavedContractor {
  id: string
  contractorId: string
  contractorName: string
  savedAt: string
  notes?: string
  lastJobDate?: string
  lastJobAmount?: number
  totalJobsCompleted: number
  averageRating?: number
  specialty?: string
}

interface SavedContractorsProps {
  user: User
  onNavigate?: (page: string) => void
}

export function SavedContractors({ user, onNavigate }: SavedContractorsProps) {
  const [savedContractors, setSavedContractors] = useKV<SavedContractor[]>(
    `saved-contractors-${user.id}`, 
    []
  )
  const [jobs] = useKV<Job[]>("jobs", [])
  const [users] = useKV<User[]>("users", [])
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [selectedContractor, setSelectedContractor] = useState<{ contractorId: string; contractorName: string } | null>(null)

  const enrichedContractors = useMemo(() => {
    if (!savedContractors || !jobs) return []

    return savedContractors.map(saved => {
      // Find all jobs with this contractor
      const contractorJobs = jobs.filter(job => 
        job.bids.some(bid => 
          bid.contractorId === saved.contractorId && 
          bid.status === 'accepted' &&
          job.homeownerId === user.id
        )
      )

      const completedJobs = contractorJobs.filter(j => j.status === 'completed')
      const lastJob = completedJobs.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]

      return {
        ...saved,
        totalJobsCompleted: completedJobs.length,
        lastJobDate: lastJob?.createdAt,
        lastJobAmount: lastJob?.bids.find(b => 
          b.contractorId === saved.contractorId && b.status === 'accepted'
        )?.amount
      }
    }).sort((a, b) => 
      new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    )
  }, [savedContractors, jobs, user.id])

  const recentlyUsed = useMemo(() => 
    enrichedContractors
      .filter(c => c.lastJobDate)
      .sort((a, b) => 
        new Date(b.lastJobDate!).getTime() - new Date(a.lastJobDate!).getTime()
      )
      .slice(0, 3),
    [enrichedContractors]
  )

  const handleRemoveContractor = (contractorId: string) => {
    if (confirm("Remove this contractor from your saved list?")) {
      setSavedContractors(savedContractors.filter(c => c.contractorId !== contractorId))
      toast.success("Contractor removed from saved list")
    }
  }

  const handleQuickRehire = (contractor: SavedContractor) => {
    toast.success(`Opening job posting for ${contractor.contractorName}`)
    // In a real app, this would navigate to job posting with contractor pre-selected
    onNavigate?.('post-job')
  }

  const getTimeSinceLastJob = (lastJobDate?: string) => {
    if (!lastJobDate) return "Never hired"
    
    const now = new Date()
    const lastJob = new Date(lastJobDate)
    const daysDiff = Math.floor((now.getTime() - lastJob.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff === 0) return "Today"
    if (daysDiff === 1) return "Yesterday"
    if (daysDiff < 7) return `${daysDiff} days ago`
    if (daysDiff < 30) return `${Math.floor(daysDiff / 7)} weeks ago`
    if (daysDiff < 365) return `${Math.floor(daysDiff / 30)} months ago`
    return `${Math.floor(daysDiff / 365)} years ago`
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white dark:bg-black border-0 shadow-md hover:shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-black border-0 shadow-md hover:shadow-lg flex items-center justify-center">
              <Heart weight="fill" className="text-black dark:text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Saved Contractors</h2>
              <p className="text-sm text-muted-foreground">
                Quick access to your trusted contractors
              </p>
            </div>
          </div>
          
          <Badge variant="outline" className="text-lg px-3 py-1">
            {enrichedContractors.length} saved
          </Badge>
        </div>

        {recentlyUsed.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Lightning size={16} className="text-black dark:text-white" />
              Recently Hired
            </h3>
            <div className="grid gap-3 md:grid-cols-3">
              {recentlyUsed.map(contractor => (
                <Card 
                  key={contractor.id}
                  className="p-3 bg-white dark:bg-black border-0 shadow-md hover:shadow-lg hover:shadow-lg transition-colors cursor-pointer"
                  onClick={() => handleQuickRehire(contractor)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{contractor.contractorName}</span>
                    <CheckCircle size={16} className="text-black dark:text-white" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getTimeSinceLastJob(contractor.lastJobDate)}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Card>

      {enrichedContractors.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2">
          <Heart size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">No saved contractors yet</p>
          <p className="text-muted-foreground mb-4">
            When you find contractors you trust, save them here for quick re-hiring
          </p>
          <Button onClick={() => onNavigate?.('browse-jobs')}>
            <Hammer size={16} className="mr-2" />
            Browse Contractors
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {enrichedContractors.map(contractor => (
            <Card key={contractor.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-white dark:bg-black border-0 shadow-md hover:shadow-lg flex items-center justify-center">
                      <Hammer size={20} className="text-black dark:text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{contractor.contractorName}</h3>
                      {contractor.specialty && (
                        <p className="text-sm text-muted-foreground">{contractor.specialty}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-black dark:text-white" />
                      <div>
                        <p className="text-xs text-muted-foreground">Jobs Done</p>
                        <p className="font-semibold">{contractor.totalJobsCompleted}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-black dark:text-white" />
                      <div>
                        <p className="text-xs text-muted-foreground">Last Job</p>
                        <p className="font-semibold text-sm">
                          {getTimeSinceLastJob(contractor.lastJobDate)}
                        </p>
                      </div>
                    </div>

                    {contractor.lastJobAmount && (
                      <div className="flex items-center gap-2">
                        <CurrencyDollar size={16} className="text-black dark:text-white" />
                        <div>
                          <p className="text-xs text-muted-foreground">Last Amount</p>
                          <p className="font-semibold">${contractor.lastJobAmount}</p>
                        </div>
                      </div>
                    )}

                    {contractor.averageRating && (
                      <div className="flex items-center gap-2">
                        <Star size={16} className="text-black dark:text-white" weight="fill" />
                        <div>
                          <p className="text-xs text-muted-foreground">Rating</p>
                          <p className="font-semibold">{contractor.averageRating.toFixed(1)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {contractor.notes && (
                    <p className="text-sm text-muted-foreground italic mb-3">
                      "{contractor.notes}"
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => handleQuickRehire(contractor)}
                    >
                      <Lightning size={16} className="mr-2" />
                      Quick Hire
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedContractor({
                          contractorId: contractor.contractorId,
                          contractorName: contractor.contractorName
                        })
                        setContactDialogOpen(true)
                      }}
                    >
                      <Phone size={16} className="mr-2" />
                      Contact
                    </Button>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveContractor(contractor.contractorId)}
                >
                  <Trash size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-4 bg-white dark:bg-black border-0 shadow-md hover:shadow-lg">
        <p className="text-sm text-muted-foreground">
          <strong>💡 Pro Tip:</strong> Save contractors who did great work so you can hire them again instantly. 
          No need to browse bids - just click "Quick Hire" and they'll see your new job first!
        </p>
      </Card>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact {selectedContractor?.contractorName}</DialogTitle>
            <DialogDescription>
              Contact information for this contractor
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedContractor && (() => {
              const contractorUser = users?.find(u => u.id === selectedContractor.contractorId)
              
              if (!contractorUser) {
                return (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Contact information not available. Use Quick Hire to reach out through the platform.</p>
                  </div>
                )
              }

              return (
                <div className="space-y-4">
                  {contractorUser.companyEmail && (
                    <div className="p-4 border-0 shadow-md hover:shadow-lg rounded-md">
                      <div className="flex items-center gap-3 mb-2">
                        <EnvelopeSimple size={20} className="text-black dark:text-white" />
                        <span className="font-semibold">Email</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <a 
                          href={`mailto:${contractorUser.companyEmail}`}
                          className="text-primary hover:underline"
                        >
                          {contractorUser.companyEmail}
                        </a>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            window.location.href = `mailto:${contractorUser.companyEmail}`
                          }}
                        >
                          Send Email
                        </Button>
                      </div>
                    </div>
                  )}

                  {contractorUser.companyPhone && (
                    <div className="p-4 border-0 shadow-md hover:shadow-lg rounded-md">
                      <div className="flex items-center gap-3 mb-2">
                        <Phone size={20} className="text-black dark:text-white" />
                        <span className="font-semibold">Phone</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <a 
                          href={`tel:${contractorUser.companyPhone}`}
                          className="text-primary hover:underline"
                        >
                          {contractorUser.companyPhone}
                        </a>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            window.location.href = `tel:${contractorUser.companyPhone}`
                          }}
                        >
                          Call
                        </Button>
                      </div>
                    </div>
                  )}

                  {!contractorUser.companyEmail && !contractorUser.companyPhone && (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>No contact information available.</p>
                      <p className="text-sm mt-2">Use Quick Hire to reach out through the platform.</p>
                    </div>
                  )}

                  {contractorUser.companyAddress && (
                    <div className="p-4 border-0 shadow-md hover:shadow-lg rounded-md">
                      <div className="flex items-center gap-3 mb-2">
                        <Hammer size={20} className="text-black dark:text-white" />
                        <span className="font-semibold">Business Address</span>
                      </div>
                      <p className="text-sm">{contractorUser.companyAddress}</p>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
