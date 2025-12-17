/**
 * AI Receptionist CRM Component
 * Displays calls and private jobs created from receptionist system
 * Glassmorphism design for Pro users
 */

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Phone, 
  EnvelopeSimple, 
  Clock, 
  Alert, 
  Play, 
  CheckCircle,
  XCircle,
  MessageText,
  MapPin
} from "@phosphor-icons/react"
import { useReceptionistCalls, useReceptionistJobs, type ReceptionistCall, createPrivateJobFromCall } from "@/lib/receptionist"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User, Job } from "@/lib/types"
import { toast } from "sonner"

interface ReceptionistCRMProps {
  user: User
}

export function ReceptionistCRM({ user }: ReceptionistCRMProps) {
  const isPro = user.isPro || false
  const { calls, newCalls, voicemailCalls, updateCall } = useReceptionistCalls(user.id)
  const { privateJobs, totalCount, newCount } = useReceptionistJobs(user.id)
  const [selectedCall, setSelectedCall] = useState<ReceptionistCall | null>(null)
  const [jobs] = useKV<Job[]>("jobs", [])

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-[#FF0000] text-white'
      case 'high': return 'bg-[#FFFF00] text-black'
      case 'medium': return 'bg-white dark:bg-black border border-black/20 dark:border-white/20'
      default: return 'bg-white dark:bg-black border border-black/20 dark:border-white/20'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const [, setJobsState] = useKV<Job[]>("jobs", [])

  const handleCreateJob = (call: ReceptionistCall) => {
    // Create private job from call using helper function
    const newJob = createPrivateJobFromCall(call, user.id)

    // Save to jobs
    const currentJobs = jobs || []
    setJobsState([...currentJobs, newJob])

    // Update call status
    updateCall(call.id, { status: 'processed', jobId: newJob.id })

    toast.success('Private job created!')
  }

  const handleCallBack = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`
  }

  if (!isPro) {
    return (
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone weight="duotone" size={24} />
            AI Receptionist
          </CardTitle>
          <CardDescription>
            Upgrade to Pro to unlock AI Receptionist - never miss a call again
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.href = '/pro-upgrade'}>
            Upgrade to Pro - $59/mo
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card glass={isPro}>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-black dark:text-white">{calls.length}</div>
            <div className="text-sm text-black dark:text-white mt-1">Total Calls</div>
          </CardContent>
        </Card>
        <Card glass={isPro}>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-black dark:text-white">{newCalls.length}</div>
            <div className="text-sm text-black dark:text-white mt-1">New Calls</div>
          </CardContent>
        </Card>
        <Card glass={isPro}>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-black dark:text-white">{voicemailCalls.length}</div>
            <div className="text-sm text-black dark:text-white mt-1">Voicemails</div>
          </CardContent>
        </Card>
        <Card glass={isPro}>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-black dark:text-white">{totalCount}</div>
            <div className="text-sm text-black dark:text-white mt-1">Private Jobs</div>
          </CardContent>
        </Card>
      </div>

      {/* Calls & Jobs Tabs */}
      <Tabs defaultValue="calls" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calls">
            <Phone className="mr-2" size={16} />
            Calls ({calls.length})
          </TabsTrigger>
          <TabsTrigger value="jobs">
            <CheckCircle className="mr-2" size={16} />
            Private Jobs ({totalCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calls" className="space-y-4 mt-6">
          {calls.length === 0 ? (
            <Card glass={isPro}>
              <CardContent className="py-12 text-center">
                <Phone size={48} weight="duotone" className="mx-auto mb-4 text-black dark:text-white opacity-50" />
                <p className="text-black dark:text-white">No calls yet</p>
                <p className="text-sm text-black dark:text-white mt-2">
                  Calls from your Twilio number will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            calls.map((call) => (
              <Card key={call.id} glass={isPro} className="cursor-pointer hover:shadow-[6px_6px_0_#000] dark:hover:shadow-[6px_6px_0_#fff] transition-all"
                onClick={() => setSelectedCall(call)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {call.callerName || 'Unknown Caller'}
                        <Badge className={getUrgencyColor(call.extraction.urgency)}>
                          {call.extraction.urgency.toUpperCase()}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Phone size={14} weight="duotone" />
                          {call.callerPhone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} weight="duotone" />
                          {formatDate(call.createdAt)}
                        </span>
                        {call.extraction.propertyAddress && (
                          <span className="flex items-center gap-1">
                            <MapPin size={14} weight="duotone" />
                            {call.extraction.propertyAddress}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {call.status === 'new' && (
                        <Button size="sm" onClick={(e) => {
                          e.stopPropagation()
                          handleCreateJob(call)
                        }}>
                          Create Job
                        </Button>
                      )}
                      {call.recordingUrl && (
                        <Button size="sm" variant="outline" onClick={(e) => {
                          e.stopPropagation()
                          window.open(call.recordingUrl, '_blank')
                        }}>
                          <Play size={16} />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={(e) => {
                        e.stopPropagation()
                        handleCallBack(call.callerPhone)
                      }}>
                        <Phone size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-semibold text-black dark:text-white">Issue:</span>
                      <p className="text-sm text-black dark:text-white mt-1">{call.extraction.description}</p>
                    </div>
                    {call.transcript && (
                      <details className="mt-2">
                        <summary className="text-xs font-semibold text-black dark:text-white cursor-pointer">
                          View Transcript
                        </summary>
                        <p className="text-xs text-black dark:text-white mt-2 p-2 bg-white dark:bg-black border border-black/20 dark:border-white/20">
                          {call.transcript}
                        </p>
                      </details>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4 mt-6">
          {privateJobs.length === 0 ? (
            <Card glass={isPro}>
              <CardContent className="py-12 text-center">
                <CheckCircle size={48} weight="duotone" className="mx-auto mb-4 text-black dark:text-white opacity-50" />
                <p className="text-black dark:text-white">No private jobs yet</p>
                <p className="text-sm text-black dark:text-white mt-2">
                  Private jobs created from calls will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            privateJobs.map((job) => (
              <Card key={job.id} glass={isPro} className="cursor-pointer hover:shadow-[6px_6px_0_#000] dark:hover:shadow-[6px_6px_0_#fff] transition-all">
                <CardHeader>
                  <CardTitle>{job.title}</CardTitle>
                  <CardDescription className="mt-2">
                    Created from AI Receptionist call
                    {job.metadata?.callerPhone && ` • ${job.metadata.callerPhone}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-black dark:text-white">{job.description}</p>
                  {job.address && (
                    <p className="text-xs text-black dark:text-white mt-2 flex items-center gap-1">
                      <MapPin size={12} weight="duotone" />
                      {job.address}
                    </p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Button size="sm">View Job</Button>
                    <Button size="sm" variant="outline">Call Client</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Call Detail Modal */}
      {selectedCall && (
        <Card glass={isPro} className="fixed inset-4 z-50 overflow-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Call Details</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setSelectedCall(null)}>
                <XCircle size={20} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Caller Information</h3>
              <p>Name: {selectedCall.callerName || 'Unknown'}</p>
              <p>Phone: {selectedCall.callerPhone}</p>
              {selectedCall.extraction.propertyAddress && (
                <p>Address: {selectedCall.extraction.propertyAddress}</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Extraction</h3>
              <p>Issue Type: {selectedCall.extraction.issueType}</p>
              <p>Urgency: {selectedCall.extraction.urgency}</p>
              <p>Description: {selectedCall.extraction.description}</p>
              <p>Confidence: {(selectedCall.extraction.confidence * 100).toFixed(0)}%</p>
            </div>
            {selectedCall.transcript && (
              <div>
                <h3 className="font-semibold mb-2">Full Transcript</h3>
                <p className="text-sm text-black dark:text-white p-4 bg-white dark:bg-black border border-black/20 dark:border-white/20 whitespace-pre-wrap">
                  {selectedCall.transcript}
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={() => handleCreateJob(selectedCall)}>
                Create Private Job
              </Button>
              <Button variant="outline" onClick={() => handleCallBack(selectedCall.callerPhone)}>
                <Phone size={16} className="mr-2" />
                Call Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
