import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ChatCircleDots,
  Plus,
  Camera,
  Warning,
  CheckCircle,
  Clock,
  Trash,
  ImageSquare
} from '@phosphor-icons/react'
import type { ProjectUpdate, Job, User } from '@/lib/types'
import { toast } from 'sonner'

interface ProjectUpdatesProps {
  job: Job
  user: User
  onUpdate: (updates: ProjectUpdate[]) => void
}

export function ProjectUpdates({ job, user, onUpdate }: ProjectUpdatesProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [formData, setFormData] = useState({
    type: 'progress' as ProjectUpdate['type'],
    title: '',
    description: '',
    visibility: 'all' as ProjectUpdate['visibility']
  })
  const [photos, setPhotos] = useState<string[]>([])

  const updates = job.projectUpdates || []
  const isContractor = user.role === 'contractor'

  const getUpdateIcon = (type: ProjectUpdate['type']) => {
    switch (type) {
      case 'progress':
        return <CheckCircle size={20} className="text-green-500" weight="bold" />
      case 'issue':
        return <Warning size={20} className="text-red-500" weight="bold" />
      case 'milestone':
        return <Clock size={20} className="text-blue-500" weight="bold" />
      case 'general':
        return <ChatCircleDots size={20} className="text-gray-500" weight="bold" />
    }
  }

  const getTypeBadge = (type: ProjectUpdate['type']) => {
    const variants = {
      progress: { className: 'bg-green-100 text-green-700', label: 'Progress' },
      issue: { className: 'bg-red-100 text-red-700', label: 'Issue' },
      milestone: { className: 'bg-blue-100 text-blue-700', label: 'Milestone' },
      general: { className: 'bg-gray-100 text-gray-700', label: 'General' }
    }
    const variant = variants[type]
    return <Badge className={variant.className}>{variant.label}</Badge>
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

  const handleAdd = () => {
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    const newUpdate: ProjectUpdate = {
      id: `update-${Date.now()}`,
      jobId: job.id,
      contractorId: user.id,
      contractorName: user.fullName,
      type: formData.type,
      title: formData.title,
      description: formData.description,
      photos: photos.length > 0 ? photos : undefined,
      createdAt: new Date().toISOString(),
      visibility: formData.visibility
    }

    onUpdate([...updates, newUpdate])
    setShowAddDialog(false)
    resetForm()
    toast.success('Update posted')
  }

  const handleDelete = (updateId: string) => {
    const filtered = updates.filter(u => u.id !== updateId)
    onUpdate(filtered)
    toast.success('Update deleted')
  }

  const resetForm = () => {
    setFormData({
      type: 'progress',
      title: '',
      description: '',
      visibility: 'all'
    })
    setPhotos([])
  }

  const filteredUpdates = updates.filter(update => {
    if (update.visibility === 'all') return true
    if (update.visibility === 'homeowner' && user.role === 'homeowner') return true
    if (update.visibility === 'contractors' && user.role === 'contractor') return true
    return false
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ChatCircleDots size={24} />
              Project Updates
            </CardTitle>
            <CardDescription>
              Share progress, issues, and important information
            </CardDescription>
          </div>
          {isContractor && (
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2" size={16} />
              Post Update
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filteredUpdates.length === 0 ? (
          <div className="text-center py-12">
            <ChatCircleDots size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
            <h3 className="text-lg font-semibold mb-2">No Updates Yet</h3>
            <p className="text-muted-foreground mb-4">
              {isContractor
                ? 'Post your first update to keep everyone informed'
                : 'Updates from contractors will appear here'}
            </p>
            {isContractor && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2" size={16} />
                Post First Update
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute left-[19px] top-6 bottom-0 w-0.5 bg-border" />

              {filteredUpdates.map((update, index) => (
                <div key={update.id} className="relative pl-12 pb-8 last:pb-0">
                  <div className="absolute left-0 top-0 z-10 bg-background p-1">
                    {getUpdateIcon(update.type)}
                  </div>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeBadge(update.type)}
                            {update.visibility !== 'all' && (
                              <Badge variant="outline" className="text-xs">
                                {update.visibility === 'homeowner' ? 'Homeowner Only' : 'Contractors Only'}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-lg">{update.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            By {update.contractorName} • {new Date(update.createdAt).toLocaleString()}
                          </p>
                        </div>

                        {isContractor && update.contractorId === user.id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(update.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash size={16} />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{update.description}</p>

                      {update.photos && update.photos.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2 flex items-center gap-2">
                            <ImageSquare size={16} />
                            Photos ({update.photos.length})
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {update.photos.map((photo, i) => (
                              <img
                                key={i}
                                src={photo}
                                alt={`Update photo ${i + 1}`}
                                className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-90 transition-opacity"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 h-[95vh]">
          <div className="px-8 pt-6 pb-4 border-b border-black/10 dark:border-white/10 flex-shrink-0">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl">Post Project Update</DialogTitle>
              <DialogDescription>
                Share progress, issues, or general information about the project
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-hidden p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label className="text-base">Update Type *</Label>
                <Select value={formData.type} onValueChange={(value: ProjectUpdate['type']) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="progress">Progress Update</SelectItem>
                    <SelectItem value="issue">Issue/Problem</SelectItem>
                    <SelectItem value="milestone">Milestone Reached</SelectItem>
                    <SelectItem value="general">General Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base">Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Framing Complete"
                  className="h-11"
                />
              </div>

              <div>
                <Label className="text-base">Visibility</Label>
                <Select value={formData.visibility} onValueChange={(value: ProjectUpdate['visibility']) => setFormData({ ...formData, visibility: value })}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="homeowner">Homeowner Only</SelectItem>
                    <SelectItem value="contractors">Contractors Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="flex items-center gap-2 text-base">
                  <Camera size={18} />
                  Photos (optional)
                </Label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer h-11"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label className="text-base">Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide details about this update..."
                  className="flex-1 resize-none"
                />
              </div>

              {photos.length > 0 && (
                <div>
                  <Label className="text-base mb-2 block">Uploaded Photos</Label>
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
                </div>
              )}
            </div>

          </div>
          <div className="px-8 py-4 border-t border-black/10 dark:border-white/10 flex-shrink-0">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false)
                  resetForm()
                }}
                className="flex-1 h-11"
              >
                Cancel
              </Button>
              <Button onClick={handleAdd} className="flex-1 h-11">
                <Plus className="mr-2" size={16} />
                Post Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
