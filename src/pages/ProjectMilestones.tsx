import { useState, useMemo } from 'react'
import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  XCircle, 
  Camera, 
  Warning,
  CalendarBlank,
  CurrencyDollar,
  Upload,
  ChatCircle,
  ImageSquare,
  FileText,
  Pencil,
  Plus,
  Trash,
  Users,
  ChartLine,
  Receipt,
  CircleNotch
} from '@phosphor-icons/react'
import type { Job, Milestone, User, TradeContractor, ProjectUpdate } from '@/lib/types'
import { getMilestoneProgress } from '@/lib/milestones'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { TradeCoordination } from '@/components/projects/TradeCoordination'
import { ProjectUpdates } from '@/components/projects/ProjectUpdates'
import { ProjectScheduleView } from '@/components/projects/ProjectScheduleView'
import { BudgetTracking } from '@/components/projects/BudgetTracking'
import { GlassNav } from "@/components/ui/MarketingSections"
import { ExpenseTracking } from '@/components/projects/ExpenseTracking'

interface ProjectMilestonesProps {
  job: Job
  user: User
  onBack: () => void
}

export function ProjectMilestones({ job, user, onBack }: ProjectMilestonesProps) {
  const [jobs, setJobs] = useKV<Job[]>('jobs', [])
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
  const [selectedExpenseMilestone, setSelectedExpenseMilestone] = useState<Milestone | null>(null)
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [disputeReason, setDisputeReason] = useState('')
  const [showDisputeDialog, setShowDisputeDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    amount: 0,
    percentage: 0
  })
  
  const [newMilestone, setNewMilestone] = useState({
    name: '',
    description: '',
    amount: 0,
    percentage: 0
  })
  
  const milestones = job.milestones || []
  const progress = getMilestoneProgress(milestones)
  const isContractor = user.role === 'contractor'
  const isHomeowner = user.role === 'homeowner'
  
  const pendingMilestones = useMemo(() => 
    milestones.filter(m => m.status === 'pending' || m.status === 'in-progress'),
    [milestones]
  )
  
  const completedMilestones = useMemo(() => 
    milestones.filter(m => m.status === 'completed'),
    [milestones]
  )
  
  const paidMilestones = useMemo(() => 
    milestones.filter(m => m.status === 'paid'),
    [milestones]
  )
  
  const disputedMilestones = useMemo(() => 
    milestones.filter(m => m.status === 'disputed'),
    [milestones]
  )
  
  const updateJobMilestones = (updatedMilestones: Milestone[]) => {
    setJobs((currentJobs) => 
      (currentJobs || []).map(j => 
        j.id === job.id 
          ? { ...j, milestones: updatedMilestones } 
          : j
      )
    )
  }

  const updateJobTrades = (updatedTrades: TradeContractor[]) => {
    setJobs((currentJobs) => 
      (currentJobs || []).map(j => 
        j.id === job.id 
          ? { ...j, tradeContractors: updatedTrades } 
          : j
      )
    )
  }

  const updateJobProjectUpdates = (updatedUpdates: ProjectUpdate[]) => {
    setJobs((currentJobs) => 
      (currentJobs || []).map(j => 
        j.id === job.id 
          ? { ...j, projectUpdates: updatedUpdates } 
          : j
      )
    )
  }

  const handleUpdateMilestone = (updatedMilestone: Milestone) => {
    const updatedMilestones = milestones.map(m => 
      m.id === updatedMilestone.id ? updatedMilestone : m
    )
    updateJobMilestones(updatedMilestones)
  }
  
  const getStatusIcon = (status: Milestone['status'], size = 24) => {
    switch (status) {
      case 'pending':
        return <Circle size={size} className="text-gray-400" weight="bold" />
      case 'in-progress':
        return <Clock size={size} className="text-blue-500" weight="bold" />
      case 'completed':
        return <CheckCircle size={size} className="text-green-500" weight="bold" />
      case 'paid':
        return <CheckCircle size={size} className="text-green-600" weight="fill" />
      case 'disputed':
        return <XCircle size={size} className="text-red-500" weight="bold" />
    }
  }
  
  const getStatusBadge = (status: Milestone['status']) => {
    const variants: Record<Milestone['status'], { className: string; label: string }> = {
      'pending': { className: 'bg-gray-100 text-gray-700 border border-gray-300', label: 'Pending' },
      'in-progress': { className: 'bg-blue-100 text-blue-700 border border-blue-300', label: 'In Progress' },
      'completed': { className: 'bg-green-100 text-green-700 border border-green-300', label: 'Ready for Payment' },
      'paid': { className: 'bg-green-600 text-white', label: 'Paid' },
      'disputed': { className: 'bg-red-100 text-red-700 border border-red-300', label: 'Disputed' }
    }
    
    const { className, label } = variants[status]
    return <Badge className={className}>{label}</Badge>
  }
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }
  
  const [isRequestingPayment, setIsRequestingPayment] = useState(false)

  const handleRequestPayment = useCallback(async () => {
    if (!selectedMilestone || isRequestingPayment) return
    
    if (photos.length < 3) {
      toast.error('Please upload at least 3 photos')
      return
    }
    
    if (!notes.trim()) {
      toast.error('Please add completion notes')
      return
    } else if (notes.trim().length < 10) {
      toast.error('Completion notes must be at least 10 characters')
      return
    }

    setIsRequestingPayment(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 500))
    
    const updatedMilestones = milestones.map(m => 
      m.id === selectedMilestone.id 
        ? { 
            ...m, 
            status: 'completed' as const, 
            photos,
            notes,
            requestedAt: new Date().toISOString()
          }
        : m
    )
    
      updateJobMilestones(updatedMilestones)
      setSelectedMilestone(null)
      setPhotos([])
      setNotes('')
      toast.success('Payment request submitted successfully!')
    } catch (error) {
      console.error("Error requesting payment:", error)
      toast.error('Failed to submit payment request. Please try again.')
    } finally {
      setIsRequestingPayment(false)
    }
  }, [selectedMilestone, photos, notes, milestones, isRequestingPayment, updateJobMilestones])
  
  const handleApprove = (milestone: Milestone) => {
    const updatedMilestones = milestones.map(m => 
      m.id === milestone.id 
        ? { 
            ...m, 
            status: 'paid' as const,
            approvedAt: new Date().toISOString(),
            paidAt: new Date().toISOString()
          }
        : m
    )
    
    updateJobMilestones(updatedMilestones)
    toast.success('Milestone approved - payment released')
  }
  
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false)

  const handleDispute = useCallback(async () => {
    if (!selectedMilestone || isSubmittingDispute) return
    
    if (!disputeReason.trim()) {
      toast.error('Please explain your concern')
      return
    } else if (disputeReason.trim().length < 10) {
      toast.error('Dispute reason must be at least 10 characters')
      return
    } else if (disputeReason.trim().length > 1000) {
      toast.error('Dispute reason is too long (max 1000 characters)')
      return
    }

    setIsSubmittingDispute(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const updatedMilestones = milestones.map(m => 
        m.id === selectedMilestone.id 
          ? { 
              ...m, 
              status: 'disputed' as const,
              disputeReason: safeInput(disputeReason.trim())
            }
          : m
      )
      
      updateJobMilestones(updatedMilestones)
      setShowDisputeDialog(false)
      setDisputeReason('')
      toast.info('Dispute submitted - contractor will be notified')
    } catch (error) {
      console.error("Error submitting dispute:", error)
      toast.error('Failed to submit dispute. Please try again.')
    } finally {
      setIsSubmittingDispute(false)
    }
  }, [selectedMilestone, disputeReason, milestones, isSubmittingDispute, updateJobMilestones])
  
  const handleResolveDispute = (milestone: Milestone) => {
    const updatedMilestones = milestones.map(m => 
      m.id === milestone.id 
        ? { ...m, status: 'completed' as const, disputeReason: undefined }
        : m
    )
    
    updateJobMilestones(updatedMilestones)
    toast.success('Dispute resolved - milestone ready for approval')
  }
  
  const handleEditMilestone = () => {
    if (!selectedMilestone) return
    
    const updatedMilestones = milestones.map(m => 
      m.id === selectedMilestone.id 
        ? {
            ...m,
            name: editForm.name,
            description: editForm.description,
            amount: editForm.amount,
            percentage: editForm.percentage
          }
        : m
    )
    
    updateJobMilestones(updatedMilestones)
    setShowEditDialog(false)
    setSelectedMilestone(null)
    toast.success('Milestone updated')
  }
  
  const [isAddingMilestone, setIsAddingMilestone] = useState(false)
  const [milestoneErrors, setMilestoneErrors] = useState<{
    name?: string
    amount?: string
    percentage?: string
  }>({})

  const handleAddMilestone = useCallback(async () => {
    setMilestoneErrors({})
    
    // Validation
    if (!newMilestone.name.trim()) {
      setMilestoneErrors({ name: "Milestone name is required" })
      toast.error('Please enter a milestone name')
      return
    } else if (newMilestone.name.trim().length < 3) {
      setMilestoneErrors({ name: "Name must be at least 3 characters" })
      toast.error('Milestone name must be at least 3 characters')
      return
    }

    if (!newMilestone.amount || newMilestone.amount <= 0) {
      setMilestoneErrors({ amount: "Amount must be greater than 0" })
      toast.error('Please enter a valid amount')
      return
    } else if (newMilestone.amount > 10000000) {
      setMilestoneErrors({ amount: "Amount is too large (max $10,000,000)" })
      toast.error('Amount is too large')
      return
    }

    if (newMilestone.percentage < 0 || newMilestone.percentage > 100) {
      setMilestoneErrors({ percentage: "Percentage must be between 0 and 100" })
      toast.error('Percentage must be between 0 and 100')
      return
    }

    // Check total milestone amounts don't exceed job total
    const totalMilestoneAmounts = milestones.reduce((sum, m) => sum + m.amount, 0) + newMilestone.amount
    const jobTotal = job.bids.find(b => b.status === 'accepted')?.amount || 0
    if (jobTotal > 0 && totalMilestoneAmounts > jobTotal * 1.1) {
      const confirmed = window.confirm(
        `Total milestone amounts ($${totalMilestoneAmounts.toLocaleString()}) exceed the job total ($${jobTotal.toLocaleString()}) by $${(totalMilestoneAmounts - jobTotal).toLocaleString()}. Continue?`
      )
      if (!confirmed) return
    }

    setIsAddingMilestone(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 400))
      
      const milestone: Milestone = {
        id: `milestone-${job.id}-${Date.now()}`,
        jobId: job.id,
        name: safeInput(newMilestone.name.trim()),
        description: newMilestone.description ? safeInput(newMilestone.description.trim()) : undefined,
        amount: newMilestone.amount,
        percentage: newMilestone.percentage,
        sequence: milestones.length + 1,
        status: 'pending',
        verificationRequired: 'photos'
      }
      
      updateJobMilestones([...milestones, milestone])
      setShowAddDialog(false)
      setNewMilestone({ name: '', description: '', amount: 0, percentage: 0 })
      setMilestoneErrors({})
      toast.success(`Milestone "${milestone.name}" added!`)
    } catch (error) {
      console.error("Error adding milestone:", error)
      toast.error('Failed to add milestone. Please try again.')
    } finally {
      setIsAddingMilestone(false)
    }
  }, [newMilestone, milestones, job.id, job.bids])
  
  const handleDeleteMilestone = (milestoneId: string) => {
    const updatedMilestones = milestones.filter(m => m.id !== milestoneId)
    updateJobMilestones(updatedMilestones)
    toast.success('Milestone deleted')
  }
  
  const openEditDialog = (milestone: Milestone) => {
    setSelectedMilestone(milestone)
    setEditForm({
      name: milestone.name,
      description: milestone.description,
      amount: milestone.amount,
      percentage: milestone.percentage
    })
    setShowEditDialog(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <GlassNav
        brand={{ name: "FairTradeWorker" }}
        links={[
          { label: "Home", href: "#" },
          { label: "Project Milestones", href: "#", active: true },
          { label: "My Jobs", href: "#" },
        ]}
        primaryLabel="Post Job" />

      <div className="max-w-5xl mx-auto px-4 py-8 pt-20">
        <div className="mb-6">
          <Button variant="outline" onClick={onBack} className="mb-4">
            ← Back to Job
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
              <p className="text-muted-foreground">Milestone Management</p>
            </div>
            {isContractor && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2" size={16} />
                Add Milestone
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Progress</CardDescription>
              <CardTitle className="text-3xl">{progress.percentage}%</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progress.percentage} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                {progress.completed} of {progress.total} complete
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Amount Paid</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                ${progress.amountPaid.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {paidMilestones.length} milestone{paidMilestones.length !== 1 ? 's' : ''} paid
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Remaining Balance</CardDescription>
              <CardTitle className="text-3xl">
                ${progress.amountRemaining.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {milestones.length - paidMilestones.length} milestone{milestones.length - paidMilestones.length !== 1 ? 's' : ''} remaining
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">
              Overview
              {milestones.length > 0 && (
                <Badge variant="secondary" className="ml-2">{milestones.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="budget">
              <CurrencyDollar size={16} className="mr-1" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              {pendingMilestones.length > 0 && (
                <Badge variant="secondary" className="ml-2">{pendingMilestones.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ready">
              Ready
              {completedMilestones.length > 0 && (
                <Badge variant="secondary" className="ml-2">{completedMilestones.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="paid">
              Paid
              {paidMilestones.length > 0 && (
                <Badge variant="secondary" className="ml-2">{paidMilestones.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="disputed">
              Disputed
              {disputedMilestones.length > 0 && (
                <Badge variant="destructive" className="ml-2">{disputedMilestones.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="trades">
              <Users size={16} className="mr-1" />
              Trades
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <ChartLine size={16} className="mr-1" />
              Schedule
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
                <CardDescription>Complete milestone overview</CardDescription>
              </CardHeader>
              <CardContent>
                <MilestoneTimeline 
                  milestones={milestones}
                  onRequestPayment={(m) => setSelectedMilestone(m)}
                  onApprove={handleApprove}
                  onDispute={(m) => {
                    setSelectedMilestone(m)
                    setShowDisputeDialog(true)
                  }}
                  onEdit={openEditDialog}
                  onDelete={handleDeleteMilestone}
                  onResolveDispute={handleResolveDispute}
                  onViewExpenses={(m) => setSelectedExpenseMilestone(m)}
                  userRole={user.role as 'contractor' | 'homeowner'}
                  getStatusIcon={getStatusIcon}
                  getStatusBadge={getStatusBadge}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="budget" className="space-y-4">
            <BudgetTracking job={job} />
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4">
            <MilestoneList 
              milestones={pendingMilestones}
              emptyMessage="No pending milestones"
              onRequestPayment={(m) => setSelectedMilestone(m)}
              onEdit={openEditDialog}
              onDelete={handleDeleteMilestone}
              onViewExpenses={(m) => setSelectedExpenseMilestone(m)}
              userRole={user.role as 'contractor' | 'homeowner'}
              getStatusIcon={getStatusIcon}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>
          
          <TabsContent value="ready" className="space-y-4">
            <MilestoneList 
              milestones={completedMilestones}
              emptyMessage="No milestones ready for payment"
              onApprove={handleApprove}
              onDispute={(m) => {
                setSelectedMilestone(m)
                setShowDisputeDialog(true)
              }}
              onViewExpenses={(m) => setSelectedExpenseMilestone(m)}
              userRole={user.role as 'contractor' | 'homeowner'}
              getStatusIcon={getStatusIcon}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>
          
          <TabsContent value="paid" className="space-y-4">
            <MilestoneList 
              milestones={paidMilestones}
              emptyMessage="No milestones paid yet"
              onViewExpenses={(m) => setSelectedExpenseMilestone(m)}
              userRole={user.role as 'contractor' | 'homeowner'}
              getStatusIcon={getStatusIcon}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>
          
          <TabsContent value="disputed" className="space-y-4">
            <MilestoneList 
              milestones={disputedMilestones}
              emptyMessage="No disputed milestones"
              onResolveDispute={handleResolveDispute}
              onViewExpenses={(m) => setSelectedExpenseMilestone(m)}
              userRole={user.role as 'contractor' | 'homeowner'}
              getStatusIcon={getStatusIcon}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>

          <TabsContent value="trades" className="space-y-4">
            <TradeCoordination 
              job={job}
              onUpdate={updateJobTrades}
              isHomeowner={isHomeowner}
            />
            <ProjectUpdates 
              job={job}
              user={user}
              onUpdate={updateJobProjectUpdates}
            />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <ProjectScheduleView job={job} />
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={!!selectedMilestone && !showDisputeDialog && !showEditDialog} onOpenChange={(open) => !open && setSelectedMilestone(null)}>
        <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 h-[95vh]">
          <div className="px-8 pt-6 pb-4 border-b border-black/10 dark:border-white/10 flex-shrink-0">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl">Request Milestone Payment</DialogTitle>
              <DialogDescription>
                {selectedMilestone?.name} • ${selectedMilestone?.amount.toLocaleString()}
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="flex-1 overflow-hidden p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Photos */}
            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 text-base">
                  <Camera size={18} />
                  Upload Photos (minimum 3 required)
                </Label>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleFileUpload}
                  className="mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer h-11"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded
                  {photos.length < 3 && ` • ${3 - photos.length} more required`}
                </p>
              </div>
              
              {photos.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {photos.map((photo, i) => (
                    <div key={i} className="relative">
                      <img 
                        src={photo} 
                        alt={`Upload ${i + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                      >
                        <Trash size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Right Column - Notes */}
            <div className="space-y-4">
              <div className="flex flex-col h-full">
                <Label className="flex items-center gap-2 text-base mb-2">
                  <FileText size={18} />
                  Completion Notes
                </Label>
                <Textarea 
                  placeholder="Describe the work completed for this milestone..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="flex-1 resize-none"
                />
              </div>
            </div>
            
          </div>
          <div className="px-8 py-4 border-t border-black/10 dark:border-white/10 flex-shrink-0">
            <Button 
              onClick={handleRequestPayment}
              className="w-full h-11 border-2 border-black dark:border-white"
              disabled={photos.length < 3 || isRequestingPayment || !notes.trim()}
            >
              {isRequestingPayment ? (
                <>
                  <CircleNotch size={18} className="mr-2 animate-spin" weight="bold" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="mr-2" size={18} />
                  Submit for Approval
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 h-[95vh]">
          <div className="px-8 pt-6 pb-4 border-b border-black/10 dark:border-white/10 flex-shrink-0">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl">Question Milestone</DialogTitle>
              <DialogDescription>
                {selectedMilestone?.name} • ${selectedMilestone?.amount.toLocaleString()}
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="flex-1 overflow-hidden p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 text-base">
                  <ChatCircle size={18} />
                  What&apos;s your concern?
                </Label>
                <Textarea 
                  placeholder="Explain the issue or ask for clarification..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="mt-2 flex-1 resize-none"
                />
              </div>
            </div>
          </div>
          <div className="px-8 py-4 border-t border-black/10 dark:border-white/10 flex-shrink-0">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDisputeDialog(false)
                  setSelectedMilestone(null)
                }}
                className="flex-1 h-11"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDispute}
                className="flex-1 h-11 border-2 border-black dark:border-white"
                disabled={isSubmittingDispute || !disputeReason.trim() || disputeReason.trim().length < 10}
              >
                {isSubmittingDispute ? (
                  <>
                    <CircleNotch size={18} className="mr-2 animate-spin" weight="bold" />
                    Submitting...
                ) : (
                  <>
                    Submit Question
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 h-[95vh]">
          <div className="px-8 pt-6 pb-4 border-b border-black/10 dark:border-white/10 flex-shrink-0">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl">Edit Milestone</DialogTitle>
              <DialogDescription>Update milestone details</DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="flex-1 overflow-hidden p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base">Milestone Name</Label>
                <Input 
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g., Contract Signing"
                  className="h-11"
                />
              </div>
              
              <div>
                <Label className="text-base">Amount ($)</Label>
                <Input 
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: Number(e.target.value) })}
                  className="h-11"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-base">Description</Label>
                <Textarea 
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="e.g., Agreement executed"
                  className="flex-1 resize-none"
                />
              </div>
              
              <div>
                <Label className="text-base">Percentage (%)</Label>
                <Input 
                  type="number"
                  value={editForm.percentage}
                  onChange={(e) => setEditForm({ ...editForm, percentage: Number(e.target.value) })}
                  className="h-11"
                />
              </div>
            </div>
          </div>
          
          <div className="px-8 py-4 border-t border-black/10 dark:border-white/10 flex-shrink-0">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEditDialog(false)
                  setSelectedMilestone(null)
                }}
                className="flex-1 h-11"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditMilestone}
                className="flex-1 h-11"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 h-[95vh]">
          <div className="px-8 pt-6 pb-4 border-b border-black/10 dark:border-white/10 flex-shrink-0">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl">Add Milestone</DialogTitle>
              <DialogDescription>Create a new milestone for this project</DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="flex-1 overflow-hidden p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base">Milestone Name *</Label>
                <Input
                  value={newMilestone.name}
                  onChange={(e) => {
                    setNewMilestone({ ...newMilestone, name: safeInput(e.target.value) })
                    if (milestoneErrors.name) setMilestoneErrors(prev => ({ ...prev, name: undefined }))
                  }}
                  onBlur={() => {
                    if (newMilestone.name && newMilestone.name.trim().length < 3) {
                      setMilestoneErrors(prev => ({ ...prev, name: "Name must be at least 3 characters" }))
                    }
                  }}
                  placeholder="e.g., Contract Signing"
                  className={`h-11 ${milestoneErrors.name ? "border-[#FF0000]" : ""}`}
                  disabled={isAddingMilestone}
                  maxLength={100}
                  required
                  aria-invalid={!!milestoneErrors.name}
                  aria-describedby={milestoneErrors.name ? "milestone-name-error" : undefined}
                />
                {milestoneErrors.name && (
                  <p id="milestone-name-error" className="text-sm text-[#FF0000] font-mono mt-1" role="alert">
                    {milestoneErrors.name}
                  </p>
                )}
              </div>
              
              <div>
                <Label className="text-base">Amount ($) *</Label>
                <Input
                  type="number"
                  value={newMilestone.amount || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0
                    setNewMilestone({ ...newMilestone, amount: value })
                    if (milestoneErrors.amount) setMilestoneErrors(prev => ({ ...prev, amount: undefined }))
                  }}
                  onBlur={() => {
                    if (newMilestone.amount <= 0) {
                      setMilestoneErrors(prev => ({ ...prev, amount: "Amount must be greater than 0" }))
                    } else if (newMilestone.amount > 1000000) {
                      setMilestoneErrors(prev => ({ ...prev, amount: "Amount is too large (max $1,000,000)" }))
                    }
                  }}
                  className={`h-11 ${milestoneErrors.amount ? "border-[#FF0000]" : ""}`}
                  disabled={isAddingMilestone}
                  min="0.01"
                  max="1000000"
                  step="0.01"
                  required
                  aria-invalid={!!milestoneErrors.amount}
                  aria-describedby={milestoneErrors.amount ? "milestone-amount-error" : undefined}
                />
                {milestoneErrors.amount && (
                  <p id="milestone-amount-error" className="text-sm text-[#FF0000] font-mono mt-1" role="alert">
                    {milestoneErrors.amount}
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-base">Description</Label>
                <Textarea 
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  placeholder="e.g., Agreement executed"
                  className="flex-1 resize-none"
                />
              </div>
              
              <div>
                <Label className="text-base">Percentage (%)</Label>
                <Input
                  type="number"
                  value={newMilestone.percentage || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0
                    setNewMilestone({ ...newMilestone, percentage: value })
                    if (milestoneErrors.percentage) setMilestoneErrors(prev => ({ ...prev, percentage: undefined }))
                  }}
                  onBlur={() => {
                    if (newMilestone.percentage !== undefined && newMilestone.percentage !== 0) {
                      if (newMilestone.percentage < 0 || newMilestone.percentage > 100) {
                        setMilestoneErrors(prev => ({ ...prev, percentage: "Percentage must be between 0 and 100" }))
                      }
                    }
                  }}
                  className={`h-11 ${milestoneErrors.percentage ? "border-[#FF0000]" : ""}`}
                  disabled={isAddingMilestone}
                  min="0"
                  max="100"
                  step="0.1"
                  aria-invalid={!!milestoneErrors.percentage}
                  aria-describedby={milestoneErrors.percentage ? "milestone-percentage-error" : undefined}
                />
                {milestoneErrors.percentage && (
                  <p id="milestone-percentage-error" className="text-sm text-[#FF0000] font-mono mt-1" role="alert">
                    {milestoneErrors.percentage}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="px-8 py-4 border-t border-black/10 dark:border-white/10 flex-shrink-0">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddDialog(false)
                  setNewMilestone({ name: '', description: '', amount: 0, percentage: 0 })
                }}
                className="flex-1 h-11"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddMilestone}
                className="flex-1 h-11 border-2 border-black dark:border-white"
                disabled={isAddingMilestone}
              >
                {isAddingMilestone ? (
                  <>
                    <CircleNotch size={16} className="mr-2 animate-spin" weight="bold" />
                    Adding...
                ) : (
                  <>
                    <Plus className="mr-2" size={16} />
                    Add Milestone
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!selectedExpenseMilestone} onOpenChange={(open) => !open && setSelectedExpenseMilestone(null)}>
        <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 h-[95vh]">
          <div className="px-8 pt-6 pb-4 border-b border-black/10 dark:border-white/10 flex-shrink-0">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl">Expense Tracking - {selectedExpenseMilestone?.name}</DialogTitle>
              <DialogDescription>
                Track materials, labor, and other costs for this milestone
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-hidden p-6">
            {selectedExpenseMilestone && (
              <ExpenseTracking
                milestone={selectedExpenseMilestone}
                onUpdateMilestone={(updated) => {
                  handleUpdateMilestone(updated)
                  setSelectedExpenseMilestone(updated)
                }}
                canEdit={isContractor}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProjectMilestones

interface MilestoneTimelineProps {
  milestones: Milestone[]
  onRequestPayment?: (milestone: Milestone) => void
  onApprove?: (milestone: Milestone) => void
  onDispute?: (milestone: Milestone) => void
  onEdit?: (milestone: Milestone) => void
  onDelete?: (milestoneId: string) => void
  onResolveDispute?: (milestone: Milestone) => void
  onViewExpenses?: (milestone: Milestone) => void
  userRole: 'contractor' | 'homeowner'
  getStatusIcon: (status: Milestone['status'], size?: number) => React.ReactElement
  getStatusBadge: (status: Milestone['status']) => React.ReactElement
}

function MilestoneTimeline({ 
  milestones, 
  onRequestPayment,
  onApprove,
  onDispute,
  onEdit,
  onDelete,
  onResolveDispute,
  onViewExpenses,
  userRole,
  getStatusIcon,
  getStatusBadge
}: MilestoneTimelineProps) {
  if (milestones.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarBlank size={48} className="mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Milestones Yet</h3>
        <p className="text-muted-foreground">
          {userRole === 'contractor' 
            ? 'Add milestones to track project progress and payments'
            : 'Milestones will appear here once the contractor sets them up'}
        </p>
      </div>
    )
  }
  
  return (
    <div className="relative space-y-6">
      <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-border" />
      
      {milestones.map((milestone, index) => (
        <div key={milestone.id} className="relative pl-12">
          <div className="absolute left-0 top-0 z-10 bg-background">
            {getStatusIcon(milestone.status, 40)}
          </div>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Step {index + 1}
                    </span>
                    {getStatusBadge(milestone.status)}
                  </div>
                  <CardTitle className="text-xl mb-1">{milestone.name}</CardTitle>
                  <CardDescription>{milestone.description}</CardDescription>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold">${milestone.amount.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">{milestone.percentage}%</div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {milestone.notes && (
                <div className="mb-4 p-3 bg-muted/50 rounded">
                  <p className="text-sm font-medium mb-1 flex items-center gap-2">
                    <FileText size={16} />
                    Notes
                  </p>
                  <p className="text-sm">{milestone.notes}</p>
                </div>
              )}
              
              {milestone.photos && milestone.photos.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <ImageSquare size={16} />
                    Photos ({milestone.photos.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {milestone.photos.map((photo, i) => (
                      <img 
                        key={i} 
                        src={photo} 
                        alt={`Milestone ${index + 1} photo ${i + 1}`}
                        className="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-90 transition-opacity"
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {milestone.disputeReason && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm font-medium text-red-700 mb-1 flex items-center gap-2">
                    <Warning size={16} />
                    Dispute Reason
                  </p>
                  <p className="text-sm text-red-600">{milestone.disputeReason}</p>
                </div>
              )}
              
              {milestone.expenses && milestone.expenses.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-2">
                    <Receipt size={16} />
                    Expenses Logged
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Expenses:</span>
                      <span className="font-semibold ml-2">
                        ${milestone.expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Items:</span>
                      <span className="font-semibold ml-2">{milestone.expenses.length}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between gap-2 pt-4 border-t">
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => onViewExpenses?.(milestone)}
                  >
                    <Receipt className="mr-1" size={16} />
                    {milestone.expenses && milestone.expenses.length > 0 ? 'View Expenses' : 'Track Expenses'}
                  </Button>
                  
                  {userRole === 'contractor' && milestone.status === 'pending' && (
                    <>
                      <Button 
                        size="sm"
                        onClick={() => onRequestPayment?.(milestone)}
                      >
                        <Camera className="mr-1" size={16} />
                        Request Payment
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit?.(milestone)}
                      >
                        <Pencil className="mr-1" size={16} />
                        Edit
                      </Button>
                  )}
                  
                  {userRole === 'contractor' && milestone.status === 'disputed' && (
                    <Button 
                      size="sm"
                      onClick={() => onResolveDispute?.(milestone)}
                    >
                      Resolve & Resubmit
                    </Button>
                  )}
                  
                  {userRole === 'homeowner' && milestone.status === 'completed' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onDispute?.(milestone)}
                      >
                        <Warning className="mr-1" size={16} />
                        Question
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => onApprove?.(milestone)}
                      >
                        <CheckCircle className="mr-1" size={16} />
                        Approve & Pay
                      </Button>
                  )}
                </div>
                
                {userRole === 'contractor' && milestone.status === 'pending' && (
                  <Button 
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete?.(milestone.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash size={16} />
                  </Button>
                )}
              </div>
              
              {milestone.paidAt && (
                <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
                  <CurrencyDollar size={14} />
                  Paid on {new Date(milestone.paidAt).toLocaleDateString()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}

interface MilestoneListProps {
  milestones: Milestone[]
  emptyMessage: string
  onRequestPayment?: (milestone: Milestone) => void
  onApprove?: (milestone: Milestone) => void
  onDispute?: (milestone: Milestone) => void
  onEdit?: (milestone: Milestone) => void
  onDelete?: (milestoneId: string) => void
  onResolveDispute?: (milestone: Milestone) => void
  onViewExpenses?: (milestone: Milestone) => void
  userRole: 'contractor' | 'homeowner'
  getStatusIcon: (status: Milestone['status'], size?: number) => React.ReactElement
  getStatusBadge: (status: Milestone['status']) => React.ReactElement
}

function MilestoneList({ 
  milestones, 
  emptyMessage,
  onRequestPayment,
  onApprove,
  onDispute,
  onEdit,
  onDelete,
  onResolveDispute,
  onViewExpenses,
  userRole,
  getStatusIcon,
  getStatusBadge
}: MilestoneListProps) {
  if (milestones.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Circle size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
            <h3 className="text-lg font-semibold mb-2">{emptyMessage}</h3>
            <p className="text-muted-foreground text-sm">
              Check other tabs for milestones in different states
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="grid gap-4">
      {milestones.map((milestone, index) => (
        <Card key={milestone.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(milestone.status, 24)}
                  {getStatusBadge(milestone.status)}
                </div>
                <CardTitle>{milestone.name}</CardTitle>
                <CardDescription>{milestone.description}</CardDescription>
              </div>
              
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-bold">${milestone.amount.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">{milestone.percentage}%</div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {milestone.notes && (
              <div className="mb-4 p-3 bg-muted/50 rounded">
                <p className="text-sm font-medium mb-1">Notes</p>
                <p className="text-sm">{milestone.notes}</p>
              </div>
            )}
            
            {milestone.photos && milestone.photos.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Photos ({milestone.photos.length})</p>
                <div className="grid grid-cols-4 gap-2">
                  {milestone.photos.map((photo, i) => (
                    <img 
                      key={i} 
                      src={photo} 
                      alt={`Photo ${i + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                  ))}
                </div>
              </div>
            )}
            
            {milestone.disputeReason && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm font-medium text-red-700 mb-1">Dispute Reason</p>
                <p className="text-sm text-red-600">{milestone.disputeReason}</p>
              </div>
            )}
            
            {milestone.expenses && milestone.expenses.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-2">
                  <Receipt size={16} />
                  Expenses Logged
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Expenses:</span>
                    <span className="font-semibold ml-2">
                      ${milestone.expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Items:</span>
                    <span className="font-semibold ml-2">{milestone.expenses.length}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between gap-2 pt-4 border-t">
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => onViewExpenses?.(milestone)}
                >
                  <Receipt className="mr-1" size={16} />
                  {milestone.expenses && milestone.expenses.length > 0 ? 'View Expenses' : 'Track Expenses'}
                </Button>
                
                {userRole === 'contractor' && milestone.status === 'pending' && (
                  <>
                    <Button 
                      size="sm"
                      onClick={() => onRequestPayment?.(milestone)}
                    >
                      <Camera className="mr-1" size={16} />
                      Request Payment
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit?.(milestone)}
                    >
                      <Pencil className="mr-1" size={16} />
                      Edit
                    </Button>
                )}
                
                {userRole === 'contractor' && milestone.status === 'disputed' && (
                  <Button 
                    size="sm"
                    onClick={() => onResolveDispute?.(milestone)}
                  >
                    Resolve & Resubmit
                  </Button>
                )}
                
                {userRole === 'homeowner' && milestone.status === 'completed' && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onDispute?.(milestone)}
                    >
                      <Warning className="mr-1" size={16} />
                      Question
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => onApprove?.(milestone)}
                    >
                      <CheckCircle className="mr-1" size={16} />
                      Approve & Pay
                    </Button>
                )}
              </div>
              
              {userRole === 'contractor' && milestone.status === 'pending' && (
                <Button 
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete?.(milestone.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash size={16} />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
