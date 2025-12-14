import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle, Circle, Clock, XCircle, Camera, Warning } from '@phosphor-icons/react'
import type { Milestone } from '@/lib/types'
import { getMilestoneProgress } from '@/lib/milestones'
import { toast } from 'sonner'

interface MilestoneTrackerProps {
  milestones: Milestone[]
  onRequestPayment?: (milestoneId: string, photos: string[], notes: string) => void
  onApprove?: (milestoneId: string) => void
  onDispute?: (milestoneId: string, reason: string) => void
  userRole: 'contractor' | 'homeowner'
}

export function MilestoneTracker({ 
  milestones, 
  onRequestPayment, 
  onApprove, 
  onDispute,
  userRole 
}: MilestoneTrackerProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [disputeReason, setDisputeReason] = useState('')
  const [showDisputeDialog, setShowDisputeDialog] = useState(false)
  
  const progress = getMilestoneProgress(milestones)
  
  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'pending':
        return <Circle className="text-gray-400" weight="bold" />
      case 'in-progress':
        return <Clock className="text-blue-500" weight="bold" />
      case 'completed':
        return <CheckCircle className="text-green-500" weight="bold" />
      case 'paid':
        return <CheckCircle className="text-green-600" weight="fill" />
      case 'disputed':
        return <XCircle className="text-red-500" weight="bold" />
    }
  }
  
  const getStatusBadge = (status: Milestone['status']) => {
    const variants: Record<Milestone['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      'pending': { variant: 'outline', label: 'Pending' },
      'in-progress': { variant: 'default', label: 'In Progress' },
      'completed': { variant: 'secondary', label: 'Ready for Payment' },
      'paid': { variant: 'default', label: 'Paid' },
      'disputed': { variant: 'destructive', label: 'Disputed' }
    }
    
    const { variant, label } = variants[status]
    return <Badge variant={variant}>{label}</Badge>
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
    
    onRequestPayment?.(selectedMilestone.id, photos, notes)
    setSelectedMilestone(null)
    setPhotos([])
    setNotes('')
    toast.success('Payment request submitted')
  }
  
  const handleApprove = (milestone: Milestone) => {
    onApprove?.(milestone.id)
    toast.success('Milestone approved - payment released')
  }
  
  const handleDispute = () => {
    if (!selectedMilestone) return
    
    if (!disputeReason.trim()) {
      toast.error('Please explain your concern')
      return
    }
    
    onDispute?.(selectedMilestone.id, disputeReason)
    setShowDisputeDialog(false)
    setDisputeReason('')
    toast.info('Dispute submitted - contractor will be notified')
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Milestone Payments</CardTitle>
            <CardDescription>
              {progress.completed} of {progress.total} milestones complete • ${progress.amountPaid.toLocaleString()} paid
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{progress.percentage}%</div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
        </div>
        <Progress value={progress.percentage} className="mt-4" />
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div 
              key={milestone.id}
              className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(milestone.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-semibold">{index + 1}. {milestone.name}</h4>
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold">${milestone.amount.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{milestone.percentage}%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  {getStatusBadge(milestone.status)}
                  
                  {userRole === 'contractor' && milestone.status === 'pending' && (
                    <Button 
                      size="sm"
                      onClick={() => setSelectedMilestone(milestone)}
                    >
                      <Camera className="mr-1" size={16} />
                      Request Payment
                    </Button>
                  )}
                  
                  {userRole === 'homeowner' && milestone.status === 'completed' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedMilestone(milestone)
                          setShowDisputeDialog(true)
                        }}
                      >
                        <Warning className="mr-1" size={16} />
                        Question
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleApprove(milestone)}
                      >
                        <CheckCircle className="mr-1" size={16} />
                        Approve & Pay
                      </Button>
                    </div>
                  )}
                </div>
                
                {milestone.photos && milestone.photos.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {milestone.photos.map((photo, i) => (
                      <img 
                        key={i} 
                        src={photo} 
                        alt={`Milestone ${index + 1} photo ${i + 1}`}
                        className="h-20 w-20 object-cover rounded border"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {progress.amountRemaining > 0 && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Remaining Balance</span>
              <span className="text-2xl font-bold text-primary">
                ${progress.amountRemaining.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Request Payment Dialog */}
      <Dialog open={!!selectedMilestone && !showDisputeDialog} onOpenChange={(open) => !open && setSelectedMilestone(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Milestone Payment</DialogTitle>
            <DialogDescription>
              {selectedMilestone?.name} • ${selectedMilestone?.amount.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Upload Photos (minimum 3 required)</Label>
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleFileUpload}
                className="mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded
              </p>
            </div>
            
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo, i) => (
                  <img 
                    key={i} 
                    src={photo} 
                    alt={`Upload ${i + 1}`}
                    className="w-full h-32 object-cover rounded border"
                  />
                ))}
              </div>
            )}
            
            <div>
              <Label>Completion Notes</Label>
              <Textarea 
                placeholder="Describe the work completed for this milestone..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
            
            <Button 
              onClick={handleRequestPayment} 
              className="w-full"
              disabled={photos.length < 3}
            >
              Submit for Approval
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dispute Dialog */}
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
              <Label>What&apos;s your concern?</Label>
              <Textarea 
                placeholder="Explain the issue or ask for clarification..."
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDisputeDialog(false)}
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
    </Card>
  )
}
