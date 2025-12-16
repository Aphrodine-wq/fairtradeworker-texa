/**
 * Quick Notes System
 * Field-to-office notes that tag to specific jobs and integrate with timeline
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { Note, Plus, CheckCircle, Clock, Tag } from "@phosphor-icons/react"
import { toast } from "sonner"
import type { User, Job, CRMInteraction } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface QuickNote {
  id: string
  contractorId: string
  jobId?: string
  customerId?: string
  title: string
  content: string
  tags: string[]
  priority: 'low' | 'medium' | 'high'
  followUpRequired: boolean
  followUpDate?: string
  createdAt: string
  createdBy: string
}

interface QuickNotesProps {
  user: User
}

export function QuickNotes({ user }: QuickNotesProps) {
  const [notes, setNotes] = useKV<QuickNote[]>("quick-notes", [])
  const [jobs] = useKV<Job[]>("jobs", [])
  const [customers] = useKV<any[]>("crm-customers", [])
  const [interactions, setInteractions] = useKV<CRMInteraction[]>("crm-interactions", [])
  
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [noteContent, setNoteContent] = useState("")
  const [noteTitle, setNoteTitle] = useState("")
  const [selectedJobId, setSelectedJobId] = useState<string>("")
  const [selectedPriority, setSelectedPriority] = useState<QuickNote['priority']>('medium')
  const [followUpRequired, setFollowUpRequired] = useState(false)
  const [followUpDate, setFollowUpDate] = useState("")
  const [noteTags, setNoteTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  // Get contractor's jobs
  const myJobs = jobs?.filter(j => j.contractorId === user.id) || []

  // Get contractor's notes
  const myNotes = notes?.filter(n => n.contractorId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || []

  const handleAddNote = () => {
    if (!noteContent.trim()) {
      toast.error("Please enter note content")
      return
    }

    const newNote: QuickNote = {
      id: `note-${Date.now()}`,
      contractorId: user.id,
      jobId: selectedJobId || undefined,
      title: noteTitle.trim() || "Quick Note",
      content: noteContent.trim(),
      tags: noteTags,
      priority: selectedPriority,
      followUpRequired,
      followUpDate: followUpRequired ? followUpDate : undefined,
      createdAt: new Date().toISOString(),
      createdBy: user.fullName
    }

    setNotes(prev => [...(prev || []), newNote])

    // If note is tagged to a job, add it to CRM interactions timeline
    if (selectedJobId) {
      const job = myJobs.find(j => j.id === selectedJobId)
      const customerId = job?.metadata?.customerId || job?.homeownerId
      
      if (customerId) {
        const interaction: CRMInteraction = {
          id: `interaction-${Date.now()}`,
          customerId,
          type: 'note',
          title: noteTitle.trim() || "Quick Note",
          description: noteContent.trim(),
          date: new Date().toISOString(),
          outcome: selectedPriority === 'high' ? 'negative' : 'neutral',
          nextAction: followUpRequired ? 'Follow-up required' : undefined,
          nextActionDate: followUpDate || undefined
        }
        setInteractions(prev => [...(prev || []), interaction])
      }

      // Create follow-up task if required
      if (followUpRequired && followUpDate) {
        toast.success("Note saved and follow-up task created", {
          description: `Follow-up scheduled for ${new Date(followUpDate).toLocaleDateString()}`
        })
      } else {
        toast.success("Note saved to job timeline")
      }
    } else {
      toast.success("Note saved")
    }

    // Reset form
    setNoteContent("")
    setNoteTitle("")
    setSelectedJobId("")
    setSelectedPriority('medium')
    setFollowUpRequired(false)
    setFollowUpDate("")
    setNoteTags([])
    setShowAddDialog(false)
  }

  const addTag = () => {
    if (newTag.trim() && !noteTags.includes(newTag.trim())) {
      setNoteTags([...noteTags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setNoteTags(noteTags.filter(t => t !== tag))
  }

  const getPriorityColor = (priority: QuickNote['priority']) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      default: return 'outline'
    }
  }

  const getPriorityBg = (priority: QuickNote['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200'
      case 'medium': return 'bg-yellow-50 border-yellow-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Note className="w-5 h-5" />
                Quick Notes
              </CardTitle>
              <CardDescription>
                Field-to-office notes with job tagging and timeline integration
              </CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Quick Note</DialogTitle>
                  <DialogDescription>
                    Capture important information from the field
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title (Optional)</label>
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="e.g., Client asked about hardwood floor option"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Note</label>
                    <Textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Enter your note..."
                      rows={4}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tag to Job (Optional)</label>
                      <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a job" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No job</SelectItem>
                          {myJobs.map(job => (
                            <SelectItem key={job.id} value={job.id}>
                              {job.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Priority</label>
                      <Select value={selectedPriority} onValueChange={(v: any) => setSelectedPriority(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Tags</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Add tag..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <Button type="button" variant="outline" onClick={addTag}>
                        Add
                      </Button>
                    </div>
                    {noteTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {noteTags.map(tag => (
                          <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="followUp"
                      checked={followUpRequired}
                      onChange={(e) => setFollowUpRequired(e.target.checked)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label htmlFor="followUp" className="text-sm font-medium block cursor-pointer">
                        Follow-up required
                      </label>
                      {followUpRequired && (
                        <input
                          type="date"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                          className="mt-2 px-3 py-2 border border-gray-300 rounded-md w-full"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddNote}>
                      Save Note
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myNotes.map(note => {
              const job = note.jobId ? myJobs.find(j => j.id === note.jobId) : null
              
              return (
                <Card 
                  key={note.id}
                  className={`border-l-4 ${getPriorityBg(note.priority)} shadow-sm hover:shadow-md transition-shadow duration-200`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{note.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })} by {note.createdBy}
                        </p>
                      </div>
                      <Badge variant={getPriorityColor(note.priority)}>
                        {note.priority}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">{note.content}</p>

                    {job && (
                      <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
                        <Tag className="w-3 h-3" />
                        Tagged to: <span className="font-medium">{job.title}</span>
                      </div>
                    )}

                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {note.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {note.followUpRequired && (
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded text-xs text-blue-700 mt-2">
                        <Clock className="w-3 h-3" />
                        Follow-up: {note.followUpDate ? new Date(note.followUpDate).toLocaleDateString() : 'TBD'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
            {myNotes.length === 0 && (
              <div className="text-center py-12">
                <Note className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notes yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Create quick notes to capture important information from the field
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
