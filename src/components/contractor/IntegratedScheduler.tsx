import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { Calendar, Users, MapPin, Phone, Clock, CheckCircle } from "@phosphor-icons/react"
import { toast } from "sonner"
import type { User, Job } from "@/lib/types"

interface Crew {
  id: string
  name: string
  phone: string
  skills: string[]
  availability: { date: string; available: boolean }[]
  location: { lat: number; lng: number }
  rating: number
  currentJobs: number
}

interface ScheduledJob {
  id: string
  jobId: string
  date: string
  time: string
  crewId?: string
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
}

interface IntegratedSchedulerProps {
  user: User
}

export function IntegratedScheduler({ user }: IntegratedSchedulerProps) {
  const [jobs] = useKV<Job[]>("jobs", [])
  const [crews, setCrews] = useKV<Crew[]>("crews", [])
  const [scheduledJobs, setScheduledJobs] = useKV<ScheduledJob[]>("scheduled-jobs", [])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [selectedCrew, setSelectedCrew] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("09:00")

  // Filter jobs that belong to this contractor
  const myJobs = useMemo(() => 
    jobs?.filter(j => j.contractorId === user.id && (j.status === 'open' || j.status === 'in-progress')) || [],
    [jobs, user.id]
  )

  // Get scheduled jobs for selected date
  const jobsForDate = useMemo(() => 
    scheduledJobs?.filter(sj => sj.date === selectedDate) || [],
    [scheduledJobs, selectedDate]
  )

  // Get available crews for a job
  const getAvailableCrews = (jobDate: string) => {
    return crews?.filter(crew => {
      const availability = crew.availability?.find(a => a.date === jobDate)
      return availability?.available !== false && crew.currentJobs < 3 // Max 3 jobs per crew
    }) || []
  }

  const handleDragStart = (e: React.DragEvent, job: Job) => {
    e.dataTransfer.setData('jobId', job.id)
  }

  const handleDrop = (e: React.DragEvent, date: string) => {
    e.preventDefault()
    const jobId = e.dataTransfer.getData('jobId')
    const job = myJobs.find(j => j.id === jobId)
    
    if (job) {
      setSelectedJob(job)
      setSelectedDate(date)
      setShowAssignDialog(true)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleAssignCrew = async () => {
    if (!selectedJob || !selectedCrew) {
      toast.error("Please select a crew")
      return
    }

    const crew = crews?.find(c => c.id === selectedCrew)
    if (!crew) {
      toast.error("Crew not found")
      return
    }

    // Create scheduled job
    const newScheduledJob: ScheduledJob = {
      id: `sched-${Date.now()}`,
      jobId: selectedJob.id,
      date: selectedDate,
      time: selectedTime,
      crewId: selectedCrew,
      status: 'scheduled'
    }

    setScheduledJobs(prev => [...(prev || []), newScheduledJob])

    // Update crew workload
    setCrews(prev => 
      (prev || []).map(c => 
        c.id === selectedCrew 
          ? { ...c, currentJobs: c.currentJobs + 1 }
          : c
      )
    )

    // Send SMS notification to crew lead
    sendCrewNotification(crew, selectedJob, selectedDate, selectedTime)

    toast.success(`Job assigned to ${crew.name}`)
    setShowAssignDialog(false)
    setSelectedJob(null)
    setSelectedCrew("")
  }

  const sendCrewNotification = async (crew: Crew, job: Job, date: string, time: string) => {
    // This would integrate with Communication Hub (Twilio SMS)
    const message = `
New Job Assignment:
Job: ${job.title}
Date: ${new Date(date).toLocaleDateString()}
Time: ${time}
Location: ${job.metadata?.callerName || 'See job details'}

Reply CONFIRM to accept or DECLINE to reject.

Job Details: https://fairtradeworker.com/job/${job.id}
    `.trim()

    console.log(`SMS to ${crew.phone}:`, message)
    
    // In production, this would call Twilio API via Communication Hub
    // await sendSMS(crew.phone, message)
    
    toast.info(`SMS sent to ${crew.name}`)
  }

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: string[] = []
    
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d).toISOString().split('T')[0])
    }
    
    return days
  }, [])

  return (
    <div className="space-y-6">
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader>
          <CardTitle>Integrated Scheduler</CardTitle>
          <CardDescription>
            Drag and drop jobs to schedule and assign crews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Unscheduled Jobs */}
            <div className="lg:col-span-1">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Unscheduled Jobs
              </h3>
              <div className="space-y-2">
                {myJobs
                  .filter(job => !scheduledJobs?.some(sj => sj.jobId === job.id))
                  .map(job => (
                    <Card
                      key={job.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, job)}
                      className="cursor-move hover:shadow-md transition-shadow duration-200 border-l-4 border-l-blue-500"
                    >
                      <CardContent className="p-3">
                        <div className="font-medium text-sm mb-1">{job.title}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.metadata?.callerName || 'Location TBD'}
                        </div>
                        {job.isUrgent && (
                          <Badge variant="destructive" className="mt-2 text-xs">
                            Urgent
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                {myJobs.filter(job => !scheduledJobs?.some(sj => sj.jobId === job.id)).length === 0 && (
                  <div className="text-sm text-gray-500 text-center py-4">
                    No unscheduled jobs
                  </div>
                )}
              </div>
            </div>

            {/* Calendar View */}
            <div className="lg:col-span-3">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-xs font-semibold text-gray-500 text-center py-2">
                    {day}
                  </div>
                ))}
                {calendarDays.map(date => {
                  const jobsOnDate = scheduledJobs?.filter(sj => sj.date === date) || []
                  const isToday = date === new Date().toISOString().split('T')[0]
                  const isPast = new Date(date) < new Date(new Date().setHours(0, 0, 0, 0))
                  
                  return (
                    <div
                      key={date}
                      onDrop={(e) => handleDrop(e, date)}
                      onDragOver={handleDragOver}
                      className={`
                        min-h-24 p-2 rounded-lg border-2 border-dashed
                        ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'}
                        ${isPast ? 'opacity-50' : 'hover:border-blue-400'}
                        transition-colors duration-200
                      `}
                    >
                      <div className="text-xs font-medium mb-1">
                        {new Date(date).getDate()}
                      </div>
                      <div className="space-y-1">
                        {jobsOnDate.map(sj => {
                          const job = myJobs.find(j => j.id === sj.jobId)
                          const crew = crews?.find(c => c.id === sj.crewId)
                          
                          return (
                            <div
                              key={sj.id}
                              className="bg-white rounded p-1 text-xs border border-gray-200 shadow-sm"
                            >
                              <div className="font-medium truncate">{job?.title}</div>
                              <div className="text-gray-500 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" />
                                {sj.time}
                              </div>
                              {crew && (
                                <div className="text-gray-500 flex items-center gap-1 mt-0.5">
                                  <Users className="w-3 h-3" />
                                  {crew.name}
                                </div>
                              )}
                              <Badge 
                                variant={sj.status === 'confirmed' ? 'default' : 'secondary'}
                                className="mt-1 text-xs"
                              >
                                {sj.status}
                              </Badge>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assign Crew Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Crew</DialogTitle>
            <DialogDescription>
              Select a crew for {selectedJob?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Time</label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Crew</label>
              <Select value={selectedCrew} onValueChange={setSelectedCrew}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a crew" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableCrews(selectedDate).map(crew => (
                    <SelectItem key={crew.id} value={crew.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{crew.name}</span>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant="outline" className="text-xs">
                            {crew.currentJobs} active
                          </Badge>
                          <span className="text-xs text-gray-500">
                            ⭐ {crew.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignCrew}>
                Assign & Send SMS
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
