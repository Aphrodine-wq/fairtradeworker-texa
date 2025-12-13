import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  Plus, 
  CheckCircle, 
  Clock, 
  Wrench,
  Phone,
  Envelope,
  Trash,
  Pencil
} from '@phosphor-icons/react'
import type { TradeContractor, Job } from '@/lib/types'
import { toast } from 'sonner'

interface TradeCoordinationProps {
  job: Job
  onUpdate: (trades: TradeContractor[]) => void
  isHomeowner: boolean
}

const TRADE_TYPES = [
  'General Contractor',
  'Demolition',
  'Electrician',
  'Plumber',
  'HVAC',
  'Carpenter',
  'Drywall',
  'Painter',
  'Tile Setter',
  'Flooring',
  'Cabinet Installer',
  'Countertop Fabricator',
  'Roofer',
  'Concrete',
  'Framing',
  'Inspector',
  'Other'
]

export function TradeCoordination({ job, onUpdate, isHomeowner }: TradeCoordinationProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingTrade, setEditingTrade] = useState<TradeContractor | null>(null)
  const [formData, setFormData] = useState({
    contractorName: '',
    trade: '',
    role: 'sub' as 'lead' | 'sub',
    contactPhone: '',
    contactEmail: '',
    notes: ''
  })

  const trades = job.tradeContractors || []

  const getStatusBadge = (status: TradeContractor['status']) => {
    const variants = {
      'invited': { className: 'bg-white dark:bg-black text-black dark:text-white border border-black/10 dark:border-white/10', label: 'Invited' },
      'accepted': { className: 'bg-blue-100 text-blue-700', label: 'Accepted' },
      'active': { className: 'bg-green-100 text-green-700', label: 'Active' },
      'completed': { className: 'bg-green-600 text-white', label: 'Completed' }
    }
    const variant = variants[status]
    return <Badge className={variant.className}>{variant.label}</Badge>
  }

  const getRoleBadge = (role: TradeContractor['role']) => {
    return role === 'lead' 
      ? <Badge className="bg-white dark:bg-black text-black dark:text-white border border-black/10 dark:border-white/10">Contractor</Badge>
      : <Badge variant="outline">Subcontractor</Badge>
  }

  const handleAdd = () => {
    if (!formData.contractorName || !formData.trade) {
      toast.error('Please fill in required fields')
      return
    }

    const newTrade: TradeContractor = {
      id: `trade-${Date.now()}`,
      jobId: job.id,
      contractorId: `contractor-${Date.now()}`,
      contractorName: formData.contractorName,
      trade: formData.trade,
      role: formData.role,
      status: 'invited',
      assignedMilestones: [],
      totalAmount: 0,
      amountPaid: 0,
      contactPhone: formData.contactPhone,
      contactEmail: formData.contactEmail,
      notes: formData.notes,
      invitedAt: new Date().toISOString()
    }

    onUpdate([...trades, newTrade])
    setShowAddDialog(false)
    resetForm()
    toast.success(`${formData.contractorName} added to project`)
  }

  const handleUpdate = () => {
    if (!editingTrade) return

    const updated = trades.map(t =>
      t.id === editingTrade.id
        ? {
            ...t,
            contractorName: formData.contractorName,
            trade: formData.trade,
            role: formData.role,
            contactPhone: formData.contactPhone,
            contactEmail: formData.contactEmail,
            notes: formData.notes
          }
        : t
    )

    onUpdate(updated)
    setEditingTrade(null)
    resetForm()
    toast.success('Trade contractor updated')
  }

  const handleDelete = (tradeId: string) => {
    const updated = trades.filter(t => t.id !== tradeId)
    onUpdate(updated)
    toast.success('Trade contractor removed')
  }

  const handleStatusChange = (tradeId: string, newStatus: TradeContractor['status']) => {
    const updated = trades.map(t => {
      if (t.id === tradeId) {
        const updatedTrade = { ...t, status: newStatus }
        if (newStatus === 'accepted') updatedTrade.acceptedAt = new Date().toISOString()
        if (newStatus === 'completed') updatedTrade.completedAt = new Date().toISOString()
        return updatedTrade
      }
      return t
    })
    onUpdate(updated)
    toast.success('Status updated')
  }

  const openEditDialog = (trade: TradeContractor) => {
    setEditingTrade(trade)
    setFormData({
      contractorName: trade.contractorName,
      trade: trade.trade,
      role: trade.role,
      contactPhone: trade.contactPhone || '',
      contactEmail: trade.contactEmail || '',
      notes: trade.notes || ''
    })
  }

  const resetForm = () => {
    setFormData({
      contractorName: '',
      trade: '',
      role: 'sub',
      contactPhone: '',
      contactEmail: '',
      notes: ''
    })
  }

  const activeTrades = trades.filter(t => t.status === 'active' || t.status === 'accepted')
  const completedTrades = trades.filter(t => t.status === 'completed')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users size={24} />
                Trade Coordination
              </CardTitle>
              <CardDescription>
                Manage multiple contractors working on this project
              </CardDescription>
            </div>
            {!isHomeowner && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2" size={16} />
                Add Trade
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{trades.length}</div>
                  <p className="text-sm text-muted-foreground">Total Trades</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{activeTrades.length}</div>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{completedTrades.length}</div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {trades.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
              <h3 className="text-lg font-semibold mb-2">No Contractors/Subcontractors Yet</h3>
              <p className="text-muted-foreground mb-4">
                {isHomeowner
                  ? 'Contractors/Subcontractors will appear here once assigned'
                  : 'Add contractors/subcontractors to coordinate multiple specialists on this project'}
              </p>
              {!isHomeowner && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="mr-2" size={16} />
                  Add First Trade
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {trades.map((trade) => (
                <Card key={trade.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Wrench size={20} className="text-muted-foreground" />
                          <h3 className="font-semibold text-lg">{trade.contractorName}</h3>
                          {getRoleBadge(trade.role)}
                          {getStatusBadge(trade.status)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">{trade.trade}</p>
                        
                        <div className="grid gap-2 text-sm">
                          {trade.contactPhone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone size={16} />
                              <span>{trade.contactPhone}</span>
                            </div>
                          )}
                          {trade.contactEmail && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Envelope size={16} />
                              <span>{trade.contactEmail}</span>
                            </div>
                          )}
                        </div>

                        {trade.notes && (
                          <div className="mt-3 p-3 bg-muted/50 rounded text-sm">
                            {trade.notes}
                          </div>
                        )}

                        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock size={14} />
                          <span>
                            Added {new Date(trade.invitedAt).toLocaleDateString()}
                          </span>
                          {trade.completedAt && (
                            <>
                              <span>•</span>
                              <span>
                                Completed {new Date(trade.completedAt).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {!isHomeowner && (
                        <div className="flex flex-col gap-2">
                          {trade.status !== 'completed' && (
                            <Select
                              value={trade.status}
                              onValueChange={(value) => handleStatusChange(trade.id, value as TradeContractor['status'])}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="invited">Invited</SelectItem>
                                <SelectItem value="accepted">Accepted</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(trade)}
                          >
                            <Pencil size={14} className="mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(trade.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog || !!editingTrade} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false)
          setEditingTrade(null)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTrade ? 'Edit Contractor/Subcontractor' : 'Add Contractor/Subcontractor'}</DialogTitle>
            <DialogDescription>
              {editingTrade ? 'Update contractor/subcontractor details' : 'Add a new contractor/subcontractor to this project'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contractor Name *</Label>
                <Input
                  value={formData.contractorName}
                  onChange={(e) => setFormData({ ...formData, contractorName: e.target.value })}
                  placeholder="e.g., Mike's Electric"
                />
              </div>
              <div>
                <Label>Trade *</Label>
                <Select value={formData.trade} onValueChange={(value) => setFormData({ ...formData, trade: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trade" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRADE_TYPES.map(trade => (
                      <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Role</Label>
              <Select value={formData.role} onValueChange={(value: 'lead' | 'sub') => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead Contractor (manages project and subcontractors)</SelectItem>
                  <SelectItem value="sub">Subcontractor (specialty work)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="contractor@example.com"
                />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes about this contractor..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false)
                  setEditingTrade(null)
                  resetForm()
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={editingTrade ? handleUpdate : handleAdd}
                className="flex-1"
              >
                {editingTrade ? 'Save Changes' : 'Add Trade'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
