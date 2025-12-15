/**
 * Client Portal Link
 * Additional Pro Feature - Branded link for homeowners to view progress
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Link,
  Copy,
  Eye,
  CheckCircle
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User, Job } from "@/lib/types"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { toast } from "sonner"

interface ClientPortalProps {
  user: User
  job?: Job
}

export function ClientPortal({ user, job }: ClientPortalProps) {
  const isPro = user.isPro || false
  const [portalLinks, setPortalLinks] = useLocalKV<Record<string, string>>("portal-links", {})
  const [jobs] = useLocalKV<Job[]>("jobs", [])
  
  // If no job provided, use first in-progress job or first job
  const selectedJob = job || jobs.find(j => j.status === 'in-progress') || jobs[0]
  
  if (!selectedJob) {
    return (
      <div className="min-h-screen w-full bg-white dark:bg-black flex items-center justify-center">
        <Card glass={isPro}>
          <CardHeader>
            <CardTitle>Client Portal</CardTitle>
            <CardDescription>No jobs available. Create a job first to generate portal links.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const portalToken = portalLinks[selectedJob.id] || `token-${selectedJob.id}-${Date.now()}`
  const portalUrl = `https://fairtradeworker.com/client/${portalToken}`

  const generateLink = () => {
    setPortalLinks({ ...portalLinks, [selectedJob.id]: portalToken })
    toast.success("Portal link generated!")
  }

  const copyLink = () => {
    navigator.clipboard.writeText(portalUrl)
    toast.success("Link copied!")
  }

  if (!isPro) {
    return (
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link weight="duotone" size={24} />
            Client Portal
          </CardTitle>
          <CardDescription>
            Upgrade to Pro to create branded client portal links
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.href = '/pro-upgrade'}>
            Upgrade to Pro - $50/mo
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card glass={isPro}>
      <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link weight="duotone" size={24} />
            Client Portal for {selectedJob.title}
          </CardTitle>
        <CardDescription>
          Share this link with your client to view job progress, milestones, and invoices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 border border-black/20 dark:border-white/20 bg-white dark:bg-black">
          <Label>Portal URL</Label>
          <div className="flex gap-2 mt-2">
            <Input value={portalUrl} readOnly className="flex-1 font-mono text-sm" />
            <Button onClick={copyLink} variant="outline">
              <Copy size={16} />
            </Button>
            <Button onClick={() => window.open(portalUrl, '_blank')} variant="outline">
              <Eye size={16} />
            </Button>
          </div>
        </div>

        <div className="p-4 border-2 border-[#00FF00] dark:border-[#00FF00] bg-[#00FF00]/10">
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="text-[#00FF00] dark:text-[#00FF00]" weight="fill" />
            <div>
              <p className="font-semibold text-black dark:text-white mb-2">What clients can see:</p>
              <ul className="text-sm text-black dark:text-white space-y-1 list-disc list-inside">
                <li>Job status and progress</li>
                <li>Completed milestones</li>
                <li>Invoices and payment status</li>
                <li>Project photos and updates</li>
                <li>Message thread</li>
              </ul>
            </div>
          </div>
        </div>

        <Button onClick={generateLink} className="w-full">
          Generate New Link
        </Button>
      </CardContent>
    </Card>
  )
}
