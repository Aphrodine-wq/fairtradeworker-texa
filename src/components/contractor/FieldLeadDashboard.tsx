import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { 
  Calendar, MapPin, CheckCircle, FileText, 
  Phone, Note, WarningCircle, NavigationArrow
} from "@phosphor-icons/react"
import type { User, Job } from "@/lib/types"

interface FieldLeadDashboardProps {
  user: User
  crewId?: string // If user is part of a crew
}

export function FieldLeadDashboard({ user, crewId }: FieldLeadDashboardProps) {
  const [scheduledJobs] = useKV<any[]>("scheduled-jobs", [])
  const [jobs] = useKV<Job[]>("jobs", [])
  const [notes] = useKV<any[]>("quick-notes", [])
  const [qaChecklists] = useKV<any[]>("qa-checklists", [])

  const today = new Date().toISOString().split('T')[0]

  // Get today's schedule
  const todaySchedule = useMemo(() => {
    return scheduledJobs?.filter(sj => 
      sj.date === today && 
      (sj.crewId === crewId || !crewId) &&
      sj.status !== 'cancelled'
    ).map(sj => ({
      ...sj,
      job: jobs?.find(j => j.id === sj.jobId)
    })).sort((a, b) => a.time.localeCompare(b.time)) || []
  }, [scheduledJobs, jobs, today, crewId])

  // Get pending notes/issues for today's jobs
  const todayNotes = useMemo(() => {
    const jobIds = todaySchedule.map(s => s.jobId)
    return notes?.filter(n => 
      jobIds.includes(n.jobId) && 
      !n.resolved
    ) || []
  }, [notes, todaySchedule])

  // Get pending QA checklists
  const pendingChecklists = useMemo(() => {
    const jobIds = todaySchedule.map(s => s.jobId)
    return qaChecklists?.filter(qa => 
      jobIds.includes(qa.jobId) && 
      qa.status !== 'completed'
    ) || []
  }, [qaChecklists, todaySchedule])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Field Lead Dashboard</h1>
          <p className="text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <Button>
          <NavigationArrow className="w-4 h-4 mr-2" />
          View Route
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Jobs Today</p>
                <p className="text-3xl font-bold mt-2">{todaySchedule.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Notes</p>
                <p className="text-3xl font-bold mt-2 text-orange-600">{todayNotes.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Note className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">QA Checklists</p>
                <p className="text-3xl font-bold mt-2 text-green-600">{pendingChecklists.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Schedule
          </CardTitle>
          <CardDescription>Jobs scheduled for {new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todaySchedule.map((schedule, index) => {
              const job = schedule.job
              const hasNotes = todayNotes.some(n => n.jobId === job?.id)
              const hasChecklist = pendingChecklists.some(qa => qa.jobId === job?.id)
              
              return (
                <Card 
                  key={schedule.id} 
                  className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{job?.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{job?.description}</p>
                        </div>
                      </div>
                      <Badge variant={schedule.status === 'confirmed' ? 'default' : 'secondary'}>
                        {schedule.time}
                      </Badge>
                    </div>

                    {/* Location */}
                    {job?.metadata?.callerName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        {job.metadata.callerName}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                      <Button variant="outline" size="sm" className="w-full">
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        <NavigationArrow className="w-4 h-4 mr-2" />
                        Navigate
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        <FileText className="w-4 h-4 mr-2" />
                        Specs
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        <Note className="w-4 h-4 mr-2" />
                        Log Note
                      </Button>
                    </div>

                    {/* Alerts */}
                    <div className="mt-3 space-y-2">
                      {hasNotes && (
                        <div className="flex items-center gap-2 p-2 bg-orange-50 rounded text-xs text-orange-700">
                          <WarningCircle className="w-4 h-4" />
                          <span>Unresolved notes - check before starting</span>
                        </div>
                      )}
                      {hasChecklist && (
                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                          <CheckCircle className="w-4 h-4" />
                          <span>QA checklist available</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            {todaySchedule.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No jobs scheduled for today</p>
                <p className="text-sm text-gray-400 mt-1">
                  Enjoy your day off!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common field tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Note className="w-6 h-6" />
              <span className="text-xs">Log Issue</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <CheckCircle className="w-6 h-6" />
              <span className="text-xs">Complete Checklist</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Phone className="w-6 h-6" />
              <span className="text-xs">Call Office</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <FileText className="w-6 h-6" />
              <span className="text-xs">Upload Photos</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
