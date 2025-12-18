import { useState, useCallback } from 'react'
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
  ImageSquare,
  CircleNotch
} from '@phosphor-icons/react'
import type { ProjectUpdate, Job, User } from '@/lib/types'
import { toast } from 'sonner'
import { safeInput } from '@/lib/utils'

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{
    title?: string
    description?: string
  }>({})

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
      progress: { className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', label: 'Progress' },
      issue: { className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', label: 'Issue' },
      milestone: { className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', label: 'Milestone' },
      general: { className: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300', label: 'General' }
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

  const handleAdd = useCallback(async () => {
    setErrors({})
    
    // Validation
    if (!formData.title.trim()) {
      setErrors({ title: "Title is required" })
      toast.error('Please enter a title')
      return
    } else if (formData.title.trim().length < 3) {
      setErrors({ title: "Title must be at least 3 characters" })
      toast.error('Title must be at least 3 characters')
      return
    } else if (formData.title.trim().length > 100) {
      setErrors({ title: "Title is too long (max 100 characters)" })
      toast.error('Title is too long')
      return
    }

    if (!formData.description.trim()) {
      setErrors({ description: "Description is required" })
      toast.error('Please enter a description')
      return
    } else if (formData.description.trim().length < 10) {
      setErrors({ description: "Description must be at least 10 characters" })
      toast.error('Description must be at least 10 characters')
      return
    } else if (formData.description.trim().length > 2000) {
      setErrors({ description: "Description is too long (max 2000 characters)" })
      toast.error('Description is too long')
      return
    }

    if (photos.length > 10) {
      toast.error('Maximum 10 photos allowed')
      return
    }

    setIsSubmitting(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      const newUpdate: ProjectUpdate = {
        id: `update-${Date.now()}`,
        jobId: job.id,
        contractorId: user.id,
        contractorName: user.fullName,
        type: formData.type,
        title: safeInput(formData.title.trim()),
        description: safeInput(formData.description.trim()),
        photos: photos.length > 0 ? photos : undefined,
        createdAt: new Date().toISOString(),
        visibility: formData.visibility
      }

      onUpdate([...updates, newUpdate])
      setShowAddDialog(false)
      resetForm()
      setErrors({})
      toast.success('Update posted successfully!')
    } catch (error) {
      console.error("Error posting update:", error)
      toast.error('Failed to post update. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, photos, updates, job.id, user.id, user.fullName, onUpdate])

  const [deletingUpdateId, setDeletingUpdateId] = useState<string | null>(null)

  const handleDelete = useCallback(async (updateId: string) => {
    if (deletingUpdateId) return

    const update = updates.find(u => u.id === updateId)
    const confirmed = window.confirm(
      update
        ? `Are you sure you want to delete the update "${update.title}"? This action cannot be undone.`
        : "Are you sure you want to delete this update? This action cannot be undone."
    )
    if (!confirmed) return

    setDeletingUpdateId(updateId)

    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const updatedUpdates = updates.filter(u => u.id !== updateId)
      onUpdate({
        ...job,
        projectUpdates: updatedUpdates
      })
      toast.success("Update deleted successfully")
    } catch (error) {
      console.error("Error deleting update:", error)
      toast.error('Failed to delete update. Please try again.')
    } finally {
      setDeletingUpdateId(null)
    }
  }, [updates, deletingUpdateId, job, onUpdate])

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
                            disabled={deletingUpdateId === update.id}
                          >
                            {deletingUpdateId === update.id ? (
                              <CircleNotch size={16} className="animate-spin" />
                            ) : (
                              <Trash size={16} />
                            )}
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
          <div className="px-8 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
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
                  onChange={(e) => {
                    setFormData({ ...formData, title: safeInput(e.target.value) })
                    if (errors.title) setErrors(prev => ({ ...prev, title: undefined }))
                  }}
                  onBlur={() => {
                    if (formData.title && formData.title.trim().length < 3) {
                      setErrors(prev => ({ ...prev, title: "Title must be at least 3 characters" }))
                    } else if (formData.title && formData.title.trim().length > 100) {
                      setErrors(prev => ({ ...prev, title: "Title is too long (max 100 characters)" }))
                    }
                  }}
                  placeholder="e.g., Framing Complete"
                  className={`h-11 ${errors.title ? "border-[#FF0000]" : ""}`}
                  disabled={isSubmitting}
                  maxLength={100}
                  required
                  aria-invalid={!!errors.title}
                  aria-describedby={errors.title ? "title-error" : undefined}
                />
                {errors.title && (
                  <p id="title-error" className="text-sm text-[#FF0000] font-mono mt-1" role="alert">
                    {errors.title}
                  </p>
                )}
                {!errors.title && formData.title.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.title.length}/100 characters
                  </p>
                )}
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
                  onChange={(e) => {
                    setFormData({ ...formData, description: safeInput(e.target.value) })
                    if (errors.description) setErrors(prev => ({ ...prev, description: undefined }))
                  }}
                  onBlur={() => {
                    if (formData.description && formData.description.trim().length < 10) {
                      setErrors(prev => ({ ...prev, description: "Description must be at least 10 characters" }))
                    } else if (formData.description && formData.description.trim().length > 2000) {
                      setErrors(prev => ({ ...prev, description: "Description is too long (max 2000 characters)" }))
                    }
                  }}
                  placeholder="Provide details about this update..."
                  className={`flex-1 resize-none ${errors.description ? "border-[#FF0000]" : ""}`}
                  disabled={isSubmitting}
                  maxLength={2000}
                  required
                  rows={6}
                  aria-invalid={!!errors.description}
                  aria-describedby={errors.description ? "description-error" : undefined}
                />
                {errors.description && (
                  <p id="description-error" className="text-sm text-[#FF0000] font-mono mt-1" role="alert">
                    {errors.description}
                  </p>
                )}
                {!errors.description && formData.description.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.description.length}/2000 characters
                  </p>
                )}
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
          <div className="px-8 py-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
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
              <Button 
                onClick={handleAdd} 
                className="flex-1 h-11 border-0 shadow-md hover:shadow-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <CircleNotch size={16} className="mr-2 animate-spin" weight="bold" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2" size={16} />
                    Post Update
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
