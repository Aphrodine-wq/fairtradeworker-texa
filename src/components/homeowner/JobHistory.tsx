/**
 * Homeowner Job History
 * Free Feature - Past jobs + re-post similar with one click
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Clock,
  Copy,
  Star,
  ArrowClockwise
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User, Job } from "@/lib/types"
import { toast } from "sonner"

interface JobHistoryProps {
  user: User
  onRepost?: (job: Job) => void
}

export function JobHistory({ user, onRepost }: JobHistoryProps) {
  const [jobs] = useLocalKV<Job[]>("jobs", [])

  const completedJobs = jobs.filter(j => 
    j.homeownerId === user.id && 
    (j.status === 'completed' || j.status === 'cancelled')
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const repostSimilar = (job: Job) => {
    if (onRepost) {
      onRepost(job)
    } else {
      // Create a new job based on the old one
      toast.info("Repost feature - will create new job based on this one")
    }
  }

  if (completedJobs.length === 0) {
    return (
      <Card glass={false}>
        <CardContent className="py-12 text-center">
          <Clock size={48} weight="duotone" className="mx-auto mb-4 text-black dark:text-white opacity-50" />
          <p className="text-black dark:text-white">No job history yet</p>
          <p className="text-sm text-black dark:text-white mt-2">
            Your completed jobs will appear here
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card glass={false}>
      <CardHeader>
        <CardTitle>Job History</CardTitle>
        <CardDescription>
          Your past jobs - repost similar jobs with one click
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {completedJobs.map((job) => (
          <div key={job.id} className="p-4 border border-black/20 dark:border-white/20">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-black dark:text-white">{job.title}</h3>
                <p className="text-sm text-black dark:text-white mt-1 line-clamp-2">
                  {job.description}
                </p>
              </div>
              <Badge variant={job.status === 'completed' ? 'default' : 'destructive'}>
                {job.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4 text-xs text-black dark:text-white">
                <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                {job.bids?.[0] && (
                  <span>Final: ${job.bids[0].amount.toLocaleString()}</span>
                )}
                {job.contractorId && (
                  <span>Contractor: {job.contractorId.substring(0, 8)}...</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => repostSimilar(job)}
                >
                  <ArrowClockwise size={16} className="mr-2" />
                  Repost Similar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
