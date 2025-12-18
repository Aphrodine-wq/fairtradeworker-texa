/**
 * Job Drafts for Homeowners
 * Free Feature - Save incomplete postings → resume later
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText,
  PencilSimple,
  Trash,
  Calendar
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User, Job } from "@/lib/types"
import { toast } from "sonner"

interface JobDraft {
  id: string
  homeownerId: string
  title?: string
  description?: string
  address?: string
  category?: string
  photos?: string[]
  lastSaved: string
}

interface JobDraftsProps {
  user: User
  onResume?: (draft: JobDraft) => void
}

export function JobDrafts({ user, onResume }: JobDraftsProps) {
  const [drafts, setDrafts] = useLocalKV<JobDraft[]>(`job-drafts-${user.id}`, [])

  const deleteDraft = (draftId: string) => {
    setDrafts(drafts.filter(d => d.id !== draftId))
    toast.success("Draft deleted")
  }

  const resumeDraft = (draft: JobDraft) => {
    if (onResume) {
      onResume(draft)
    }
  }

  // Auto-delete drafts older than 30 days
  const activeDrafts = drafts.filter(draft => {
    const daysSince = (Date.now() - new Date(draft.lastSaved).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSince > 30) {
      return false
    }
    return true
  })

  if (activeDrafts.length !== drafts.length) {
    setDrafts(activeDrafts)
  }

  if (activeDrafts.length === 0) {
    return (
      <Card glass={false}>
        <CardContent className="py-12 text-center">
          <FileText size={48} weight="duotone" className="mx-auto mb-4 text-black dark:text-white opacity-50" />
          <p className="text-black dark:text-white">No saved drafts</p>
          <p className="text-sm text-black dark:text-white mt-2">
            Drafts are automatically saved as you create a job
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card glass={false}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText weight="duotone" size={24} />
          Job Drafts ({activeDrafts.length})
        </CardTitle>
        <CardDescription>
          Resume your incomplete job postings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeDrafts.map((draft) => (
          <div key={draft.id} className="p-4 border-0 shadow-md hover:shadow-lg flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-black dark:text-white mb-2">
                {draft.title || "Untitled Job"}
              </h3>
              {draft.description && (
                <p className="text-sm text-black dark:text-white mb-2 line-clamp-2">
                  {draft.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-black dark:text-white">
                {draft.address && (
                  <span>{draft.address}</span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(draft.lastSaved).toLocaleDateString()}
                </span>
                {draft.photos && draft.photos.length > 0 && (
                  <Badge variant="outline">{draft.photos.length} photos</Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => resumeDraft(draft)}
              >
                <PencilSimple size={16} className="mr-2" />
                Resume
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteDraft(draft.id)}
              >
                <Trash size={16} />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
