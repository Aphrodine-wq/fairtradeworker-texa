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
            Upgrade to Pro - $50/mo
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-shrink-0">
        <Card glass={isPro}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-black dark:text-white">{calls.length}</div>
            <div className="text-xs text-black dark:text-white mt-1">Total Calls</div>
          </CardContent>
        </Card>
        <Card glass={isPro}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-black dark:text-white">{newCalls.length}</div>
            <div className="text-xs text-black dark:text-white mt-1">New Calls</div>
          </CardContent>
        </Card>
        <Card glass={isPro}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-black dark:text-white">{voicemailCalls.length}</div>
            <div className="text-xs text-black dark:text-white mt-1">Voicemails</div>
          </CardContent>
        </Card>
        <Card glass={isPro}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-black dark:text-white">{totalCount}</div>
            <div className="text-xs text-black dark:text-white mt-1">Private Jobs</div>
          </CardContent>
        </Card>
      </div>

      {/* Calls & Jobs Tabs */}
      <Tabs defaultValue="calls" className="w-full flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
          <TabsTrigger value="calls">
            <Phone className="mr-2" size={16} />
            Calls ({calls.length})
          </TabsTrigger>
          <TabsTrigger value="jobs">
            <CheckCircle className="mr-2" size={16} />
            Private Jobs ({totalCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calls" className="flex-1 overflow-y-auto mt-4 space-y-3">
          {calls.length === 0 ? (
            <Card glass={isPro}>
              <CardContent className="py-8 text-center">
                <Phone size={40} weight="duotone" className="mx-auto mb-3 text-black dark:text-white opacity-50" />
                <p className="text-black dark:text-white text-sm">No calls yet</p>
                <p className="text-xs text-black dark:text-white mt-1">
                  Calls from your Twilio number will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            calls.map((call) => (
              <Card key={call.id} glass={isPro} className="cursor-pointer hover:shadow-[4px_4px_0_#000] dark:hover:shadow-[4px_4px_0_#fff] transition-all"
                onClick={() => setSelectedCall(call)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <span className="truncate">{call.callerName || 'Unknown Caller'}</span>
                        <Badge className={getUrgencyColor(call.extraction.urgency)}>
                          {call.extraction.urgency.toUpperCase()}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-3 flex-wrap text-xs">
                        <span className="flex items-center gap-1">
                          <Phone size={12} weight="duotone" />
                          {call.callerPhone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} weight="duotone" />
                          {formatDate(call.createdAt)}
                        </span>
                        {call.extraction.propertyAddress && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin size={12} weight="duotone" />
                            <span className="truncate">{call.extraction.propertyAddress}</span>
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {call.status === 'new' && (
                        <Button size="sm" className="text-xs h-7 px-2" onClick={(e) => {
                          e.stopPropagation()
                          handleCreateJob(call)
                        }}>
                          Create Job
                        </Button>
                      )}
                      {call.recordingUrl && (
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={(e) => {
                          e.stopPropagation()
                          window.open(call.recordingUrl, '_blank')
                        }}>
                          <Play size={14} />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={(e) => {
                        e.stopPropagation()
                        handleCallBack(call.callerPhone)
                      }}>
                        <Phone size={14} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-semibold text-black dark:text-white">Issue:</span>
                      <p className="text-xs text-black dark:text-white mt-0.5 line-clamp-2">{call.extraction.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="jobs" className="flex-1 overflow-y-auto mt-4 space-y-3">
          {privateJobs.length === 0 ? (
            <Card glass={isPro}>
              <CardContent className="py-8 text-center">
                <CheckCircle size={40} weight="duotone" className="mx-auto mb-3 text-black dark:text-white opacity-50" />
                <p className="text-black dark:text-white text-sm">No private jobs yet</p>
                <p className="text-xs text-black dark:text-white mt-1">
                  Private jobs created from calls will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            privateJobs.map((job) => (
              <Card key={job.id} glass={isPro} className="cursor-pointer hover:shadow-[4px_4px_0_#000] dark:hover:shadow-[4px_4px_0_#fff] transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{job.title}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Created from AI Receptionist call
                    {job.metadata?.callerPhone && ` • ${job.metadata.callerPhone}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-black dark:text-white line-clamp-2">{job.description}</p>
                  {job.address && (
                    <p className="text-xs text-black dark:text-white mt-1 flex items-center gap-1 truncate">
                      <MapPin size={10} weight="duotone" />
                      <span className="truncate">{job.address}</span>
                    </p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="text-xs h-7">View Job</Button>
                    <Button size="sm" variant="outline" className="text-xs h-7">Call Client</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Call Detail Modal */}
      {selectedCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card glass={isPro} className="w-full max-w-2xl max-h-[90vh] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle>Call Details</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedCall(null)}>
                  <XCircle size={20} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-3 text-sm">
              <div>
                <h3 className="font-semibold mb-1 text-sm">Caller Information</h3>
                <p className="text-xs">Name: {selectedCall.callerName || 'Unknown'}</p>
                <p className="text-xs">Phone: {selectedCall.callerPhone}</p>
                {selectedCall.extraction.propertyAddress && (
                  <p className="text-xs">Address: {selectedCall.extraction.propertyAddress}</p>
                )}
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-sm">Extraction</h3>
                <p className="text-xs">Issue Type: {selectedCall.extraction.issueType}</p>
                <p className="text-xs">Urgency: {selectedCall.extraction.urgency}</p>
                <p className="text-xs">Description: {selectedCall.extraction.description}</p>
                <p className="text-xs">Confidence: {(selectedCall.extraction.confidence * 100).toFixed(0)}%</p>
              </div>
              {selectedCall.transcript && (
                <div>
                  <h3 className="font-semibold mb-1 text-sm">Full Transcript</h3>
                  <p className="text-xs text-black dark:text-white p-3 bg-white dark:bg-black border border-black/20 dark:border-white/20 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {selectedCall.transcript}
                  </p>
                </div>
              )}
            </CardContent>
            <div className="flex-shrink-0 p-4 border-t border-black/10 dark:border-white/10 flex gap-2">
              <Button size="sm" onClick={() => handleCreateJob(selectedCall)}>
                Create Private Job
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleCallBack(selectedCall.callerPhone)}>
                <Phone size={14} className="mr-1" />
                Call Back
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
