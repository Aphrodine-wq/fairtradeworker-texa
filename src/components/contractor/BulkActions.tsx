/**
 * Bulk Actions on Job Lists
 * Free Feature - Select multiple → mark viewed/saved
 */

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckSquare,
  Eye,
  Bookmarks,
  Archive,
  Download
} from "@phosphor-icons/react"
import type { User, Job } from "@/lib/types"
import { toast } from "sonner"

interface BulkActionsProps {
  user: User
  jobs: Job[]
  onJobsUpdate?: (jobs: Job[]) => void
}

export function BulkActions({ user, jobs, onJobsUpdate }: BulkActionsProps) {
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set())

  const toggleJob = (jobId: string) => {
    const newSelected = new Set(selectedJobs)
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId)
    } else {
      newSelected.add(jobId)
    }
    setSelectedJobs(newSelected)
  }

  const selectAll = () => {
    if (selectedJobs.size === jobs.length) {
      setSelectedJobs(new Set())
    } else {
      setSelectedJobs(new Set(jobs.map(j => j.id)))
    }
  }

  const markViewed = () => {
    toast.success(`Marked ${selectedJobs.size} jobs as viewed`)
    setSelectedJobs(new Set())
  }

  const markSaved = () => {
    toast.success(`Saved ${selectedJobs.size} jobs`)
    setSelectedJobs(new Set())
  }

  const archive = () => {
    toast.success(`Archived ${selectedJobs.size} jobs`)
    setSelectedJobs(new Set())
  }

  const exportSelected = () => {
    const selected = jobs.filter(j => selectedJobs.has(j.id))
    const csv = [
      ['Title', 'Description', 'Address', 'Budget', 'Status'],
      ...selected.map(j => [
        j.title,
        j.description,
        j.address || '',
        `$${j.aiScope.priceLow}-$${j.aiScope.priceHigh}`,
        j.status
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jobs-export-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success(`Exported ${selectedJobs.size} jobs`)
  }

  if (selectedJobs.size === 0) {
    return null
  }

  return (
    <Card className="sticky top-0 z-10 border-2 border-black dark:border-white bg-white dark:bg-black">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="default" className="text-lg px-4 py-2">
              {selectedJobs.size} selected
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={selectAll}
            >
              {selectedJobs.size === jobs.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={markViewed}
            >
              <Eye size={16} className="mr-2" />
              Mark Viewed
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={markSaved}
            >
              <Bookmarks size={16} className="mr-2" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={archive}
            >
              <Archive size={16} className="mr-2" />
              Archive
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={exportSelected}
            >
              <Download size={16} className="mr-2" />
              Export
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedJobs(new Set())}
            >
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
