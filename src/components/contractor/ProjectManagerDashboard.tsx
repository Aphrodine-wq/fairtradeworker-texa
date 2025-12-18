import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { 
  Calendar, Clock, WarningCircle, CheckCircle, 
  Users, FileText, CurrencyDollar, TrendUp
} from "@phosphor-icons/react"
import type { User, Job } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface ProjectManagerDashboardProps {
  user: User
}

export function ProjectManagerDashboard({ user }: ProjectManagerDashboardProps) {
  const [jobs] = useKV<Job[]>("jobs", [])
  const [scopeChanges] = useKV<any[]>("scope-changes", [])
  const [scheduledJobs] = useKV<any[]>("scheduled-jobs", [])
  const [crews] = useKV<any[]>("crews", [])

  // Get assigned jobs (for now, all jobs for the contractor)
  const assignedJobs = useMemo(() => 
    jobs?.filter(j => 
      j.contractorId === user.id && 
      (j.status === 'in-progress' || j.status === 'open')
    ) || [],
    [jobs, user.id]
  )

  // Upcoming deadlines
  const upcomingDeadlines = useMemo(() => {
    const jobsWithDeadlines = assignedJobs
      .filter(j => j.preferredStartDate || j.milestones?.some(m => m.estimatedEndDate))
      .map(job => {
        const deadline = job.milestones?.find(m => m.status !== 'completed')?.estimatedEndDate 
                        || job.preferredStartDate
        return { job, deadline: deadline || '' }
      })
      .filter(({ deadline }) => deadline)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 5)
    
    return jobsWithDeadlines
  }, [assignedJobs])

  // Pending change orders
  const pendingChangeOrders = useMemo(() => 
    scopeChanges?.filter(sc => 
      sc.status === 'pending' && 
      assignedJobs.some(j => j.id === sc.jobId)
    ) || [],
    [scopeChanges, assignedJobs]
  )

  // Crew assignments
  const crewAssignments = useMemo(() => {
    const assignments = scheduledJobs?.filter(sj => {
      const job = assignedJobs.find(j => j.id === sj.jobId)
      return job && sj.crewId
    }).map(sj => ({
      ...sj,
      job: assignedJobs.find(j => j.id === sj.jobId),
      crew: crews?.find(c => c.id === sj.crewId)
    })) || []
    
    return assignments
  }, [scheduledJobs, assignedJobs, crews])

  // Project statistics
  const stats = useMemo(() => {
    const total = assignedJobs.length
    const inProgress = assignedJobs.filter(j => j.status === 'in-progress').length
    const onHold = assignedJobs.filter(j => j.metadata?.onHold).length
    const behindSchedule = assignedJobs.filter(j => {
      if (!j.preferredStartDate) return false
      return new Date(j.preferredStartDate) < new Date() && j.status !== 'completed'
    }).length

    return { total, inProgress, onHold, behindSchedule }
  }, [assignedJobs])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Manager Dashboard</h1>
          <p className="text-gray-500">Your assigned jobs and pending actions</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Assigned Jobs</p>
                <p className="text-3xl font-bold mt-2">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-3xl font-bold mt-2 text-green-600">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Behind Schedule</p>
                <p className="text-3xl font-bold mt-2 text-orange-600">{stats.behindSchedule}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <WarningCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Changes</p>
                <p className="text-3xl font-bold mt-2 text-yellow-600">{pendingChangeOrders.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>Jobs requiring attention soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.map(({ job, deadline }) => {
                const daysUntil = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                const isUrgent = daysUntil <= 3
                
                return (
                  <div key={job.id} className={`p-3 rounded-lg ${isUrgent ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{job.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Due: {new Date(deadline).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={isUrgent ? 'destructive' : 'default'}>
                        {daysUntil} days
                      </Badge>
                    </div>
                  </div>
                )
              })}
              {upcomingDeadlines.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No upcoming deadlines
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Change Orders */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Pending Change Orders
            </CardTitle>
            <CardDescription>Awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingChangeOrders.map(change => {
                const job = assignedJobs.find(j => j.id === change.jobId)
                
                return (
                  <div key={change.id} className="p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{job?.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{change.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Discovered {formatDistanceToNow(new Date(change.discoveredAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">
                          +${change.additionalCost.toLocaleString()}
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Review
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
              {pendingChangeOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No pending change orders
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Crew Assignments */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Crew Assignments
            </CardTitle>
            <CardDescription>Current and upcoming crew schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {crewAssignments.map(assignment => (
                <div key={assignment.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{assignment.job?.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {assignment.crew?.name || 'Unassigned'}
                      </p>
                    </div>
                    <Badge variant={assignment.status === 'confirmed' ? 'default' : 'secondary'}>
                      {assignment.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600 mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(assignment.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {assignment.time}
                    </div>
                  </div>
                </div>
              ))}
              {crewAssignments.length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  No crew assignments yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
