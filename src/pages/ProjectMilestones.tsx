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
  ChartLine
} from '@phosphor-icons/react'
import type { Job, Milestone, User, TradeContractor, ProjectUpdate } from '@/lib/types'
import { getMilestoneProgress } from '@/lib/milestones'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { TradeCoordination } from '@/components/projects/TradeCoordination'
import { ProjectUpdates } from '@/components/projects/ProjectUpdates'
import { ProjectScheduleView } from '@/components/projects/ProjectScheduleView'

interface ProjectMilestonesProps {
  job: Job
  user: User
  onBack: () => void
}

export function ProjectMilestones({ job, user, onBack }: ProjectMilestonesProps) {
  const [jobs, setJobs] = useKV<Job[]>('jobs', [])
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
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
  
  const handleRequestPayment = () => {
    if (!selectedMilestone) return
    
    if (photos.length < 3) {
      toast.error('Please upload at least 3 photos')
      return
    }
    
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
    toast.success('Payment request submitted')
  }
  
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
  
  const handleDispute = () => {
    if (!selectedMilestone) return
    
    if (!disputeReason.trim()) {
      toast.error('Please explain your concern')
      return
    }
    
    const updatedMilestones = milestones.map(m => 
      m.id === selectedMilestone.id 
        ? { 
            ...m, 
            status: 'disputed' as const,
            disputeReason
          }
        : m
    )
    
    updateJobMilestones(updatedMilestones)
    setShowDisputeDialog(false)
    setDisputeReason('')
    toast.info('Dispute submitted - contractor will be notified')
  }
  
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
  
  const handleAddMilestone = () => {
    if (!newMilestone.name || !newMilestone.amount) {
      toast.error('Please fill in all required fields')
      return
    }
    
    const milestone: Milestone = {
      id: `milestone-${job.id}-${Date.now()}`,
      jobId: job.id,
      name: newMilestone.name,
      description: newMilestone.description,
      amount: newMilestone.amount,
      percentage: newMilestone.percentage,
      sequence: milestones.length + 1,
      status: 'pending',
      verificationRequired: 'photos'
    }
    
    updateJobMilestones([...milestones, milestone])
    setShowAddDialog(false)
    setNewMilestone({ name: '', description: '', amount: 0, percentage: 0 })
    toast.success('Milestone added')
  }
  
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
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-5xl mx-auto px-4 py-8">
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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">
              Overview
              {milestones.length > 0 && (
                <Badge variant="secondary" className="ml-2">{milestones.length}</Badge>
              )}
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
                  userRole={user.role as 'contractor' | 'homeowner'}
                  getStatusIcon={getStatusIcon}
                  getStatusBadge={getStatusBadge}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4">
            <MilestoneList 
              milestones={pendingMilestones}
              emptyMessage="No pending milestones"
              onRequestPayment={(m) => setSelectedMilestone(m)}
              onEdit={openEditDialog}
              onDelete={handleDeleteMilestone}
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
              userRole={user.role as 'contractor' | 'homeowner'}
              getStatusIcon={getStatusIcon}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>
          
          <TabsContent value="paid" className="space-y-4">
            <MilestoneList 
              milestones={paidMilestones}
              emptyMessage="No milestones paid yet"
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Milestone Payment</DialogTitle>
            <DialogDescription>
              {selectedMilestone?.name} • ${selectedMilestone?.amount.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="flex items-center gap-2">
                <Camera size={18} />
                Upload Photos (minimum 3 required)
              </Label>
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleFileUpload}
                className="mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded
                {photos.length < 3 && ` • ${3 - photos.length} more required`}
              </p>
            </div>
            
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo, i) => (
                  <div key={i} className="relative">
                    <img 
                      src={photo} 
                      alt={`Upload ${i + 1}`}
                      className="w-full h-32 object-cover rounded border"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <div>
              <Label className="flex items-center gap-2">
                <FileText size={18} />
                Completion Notes
              </Label>
              <Textarea 
                placeholder="Describe the work completed for this milestone..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
            
            <Button 
              onClick={handleRequestPayment} 
              className="w-full"
              disabled={photos.length < 3}
            >
              <Upload className="mr-2" size={18} />
              Submit for Approval
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Question Milestone</DialogTitle>
            <DialogDescription>
              {selectedMilestone?.name} • ${selectedMilestone?.amount.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="flex items-center gap-2">
                <ChatCircle size={18} />
                What&apos;s your concern?
              </Label>
              <Textarea 
                placeholder="Explain the issue or ask for clarification..."
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDisputeDialog(false)
                  setSelectedMilestone(null)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDispute}
                className="flex-1"
              >
                Submit Question
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Milestone</DialogTitle>
            <DialogDescription>Update milestone details</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Milestone Name</Label>
              <Input 
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="e.g., Contract Signing"
              />
            </div>
            
            <div>
              <Label>Description</Label>
              <Textarea 
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="e.g., Agreement executed"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount ($)</Label>
                <Input 
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: Number(e.target.value) })}
                />
              </div>
              
              <div>
                <Label>Percentage (%)</Label>
                <Input 
                  type="number"
                  value={editForm.percentage}
                  onChange={(e) => setEditForm({ ...editForm, percentage: Number(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEditDialog(false)
                  setSelectedMilestone(null)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditMilestone}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Milestone</DialogTitle>
            <DialogDescription>Create a new milestone for this project</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Milestone Name *</Label>
              <Input 
                value={newMilestone.name}
                onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                placeholder="e.g., Contract Signing"
              />
            </div>
            
            <div>
              <Label>Description</Label>
              <Textarea 
                value={newMilestone.description}
                onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                placeholder="e.g., Agreement executed"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount ($) *</Label>
                <Input 
                  type="number"
                  value={newMilestone.amount || ''}
                  onChange={(e) => setNewMilestone({ ...newMilestone, amount: Number(e.target.value) })}
                />
              </div>
              
              <div>
                <Label>Percentage (%)</Label>
                <Input 
                  type="number"
                  value={newMilestone.percentage || ''}
                  onChange={(e) => setNewMilestone({ ...newMilestone, percentage: Number(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddDialog(false)
                  setNewMilestone({ name: '', description: '', amount: 0, percentage: 0 })
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddMilestone}
                className="flex-1"
              >
                <Plus className="mr-2" size={16} />
                Add Milestone
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface MilestoneTimelineProps {
  milestones: Milestone[]
  onRequestPayment?: (milestone: Milestone) => void
  onApprove?: (milestone: Milestone) => void
  onDispute?: (milestone: Milestone) => void
  onEdit?: (milestone: Milestone) => void
  onDelete?: (milestoneId: string) => void
  onResolveDispute?: (milestone: Milestone) => void
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
              
              <div className="flex items-center justify-between gap-2 pt-4 border-t">
                <div className="flex gap-2">
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
                    </>
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
                    </>
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
            
            <div className="flex items-center justify-between gap-2 pt-4 border-t">
              <div className="flex gap-2">
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
                  </>
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
                  </>
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
