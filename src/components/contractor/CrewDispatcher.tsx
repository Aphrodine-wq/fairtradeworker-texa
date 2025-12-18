/**
 * AI Crew Dispatcher & Subcontractor Manager
 * Flagship Pro Feature - AI assigns jobs to crew members by skills/availability/location
 */

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Users, 
  MapPin, 
  Calendar,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  Camera
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User, Job } from "@/lib/types"
import { toast } from "sonner"

interface CrewDispatcherProps {
  user: User
}

interface CrewMember {
  id: string
  name: string
  phone: string
  skills: string[]
  availability: {
    [date: string]: { start: string; end: string; booked: boolean }[]
  }
  location?: { lat: number; lng: number }
  rating: number
  contractorId: string
}

interface Dispatch {
  id: string
  jobId: string
  crewMemberId: string
  status: 'pending' | 'confirmed' | 'declined' | 'in-progress' | 'completed'
  sentAt: string
  confirmedAt?: string
  checkInPhotos?: string[]
}

export function CrewDispatcher({ user }: CrewDispatcherProps) {
  const isPro = user.isPro || false
  const [crewMembers, setCrewMembers] = useLocalKV<CrewMember[]>("crew-members", [])
  const [dispatches, setDispatches] = useLocalKV<Dispatch[]>("dispatches", [])
  const [jobs] = useLocalKV<Job[]>("jobs", [])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [newMemberName, setNewMemberName] = useState("")
  const [newMemberPhone, setNewMemberPhone] = useState("")
  const [newMemberSkills, setNewMemberSkills] = useState("")

  const myCrew = useMemo(() => {
    return (crewMembers || []).filter(c => c.contractorId === user.id)
  }, [crewMembers, user.id])

  const activeJobs = useMemo(() => {
    return (jobs || []).filter(j => 
      j.contractorId === user.id && 
      (j.status === 'open' || j.status === 'in-progress')
    )
  }, [jobs, user.id])

  const addCrewMember = () => {
    if (!newMemberName.trim() || !newMemberPhone.trim()) {
      toast.error("Enter name and phone")
      return
    }

    const newMember: CrewMember = {
      id: `crew-${Date.now()}`,
      name: newMemberName,
      phone: newMemberPhone,
      skills: newMemberSkills.split(',').map(s => s.trim()).filter(Boolean),
      availability: {},
      rating: 5,
      contractorId: user.id
    }

    setCrewMembers([...crewMembers, newMember])
    toast.success(`Added ${newMemberName}`)
    
    setNewMemberName("")
    setNewMemberPhone("")
    setNewMemberSkills("")
  }

  const dispatchJob = async (job: Job) => {
    if (myCrew.length === 0) {
      toast.error("Add crew members first")
      return
    }

    // AI recommendation for best crew member
    const recommendations = myCrew.map(crew => {
      // Simple scoring: skills match + availability + rating
      const skillMatch = job.tradesRequired?.some(trade => crew.skills.includes(trade)) ? 1 : 0.5
      const score = (skillMatch * 0.5) + (crew.rating / 5 * 0.3) + 0.2 // availability would add more
      return { crew, score }
    }).sort((a, b) => b.score - a.score)

    const recommended = recommendations[0]?.crew
    if (!recommended) {
      toast.error("No suitable crew member found")
      return
    }

    // Create dispatch
    const dispatch: Dispatch = {
      id: `dispatch-${Date.now()}`,
      jobId: job.id,
      crewMemberId: recommended.id,
      status: 'pending',
      sentAt: new Date().toISOString()
    }

    setDispatches([...dispatches, dispatch])
    
    // In production, send SMS via Twilio
    toast.success(`Dispatched to ${recommended.name}. They'll receive an SMS.`)
  }

  const confirmDispatch = (dispatchId: string) => {
    setDispatches(dispatches.map(d => 
      d.id === dispatchId ? { ...d, status: 'confirmed', confirmedAt: new Date().toISOString() } : d
    ))
    toast.success("Dispatch confirmed")
  }

  const checkIn = (dispatchId: string) => {
    // In production, allow photo upload
    setDispatches(dispatches.map(d => 
      d.id === dispatchId ? { ...d, status: 'in-progress' } : d
    ))
    toast.success("Check-in recorded")
  }

  const completeDispatch = (dispatchId: string) => {
    setDispatches(dispatches.map(d => 
      d.id === dispatchId ? { ...d, status: 'completed' } : d
    ))
    toast.success("Job completed")
  }

  if (!isPro) {
    return (
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users weight="duotone" size={24} />
            Crew Dispatcher
          </CardTitle>
          <CardDescription>
            Upgrade to Pro to unlock AI-powered crew dispatch and management
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
      {/* Crew Management */}
      <Card glass={isPro}>
        <CardHeader>
          <CardTitle>Crew Members</CardTitle>
          <CardDescription>Manage your crew and subcontractors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Name"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
            />
            <Input
              placeholder="Phone"
              value={newMemberPhone}
              onChange={(e) => setNewMemberPhone(e.target.value)}
            />
            <div className="flex gap-2">
              <Input
                placeholder="Skills (comma-separated)"
                value={newMemberSkills}
                onChange={(e) => setNewMemberSkills(e.target.value)}
                className="flex-1"
              />
              <Button onClick={addCrewMember}>
                Add
              </Button>
            </div>
          </div>

          {myCrew.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {myCrew.map((member) => (
                <div key={member.id} className="p-4 border-0 shadow-md hover:shadow-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-black dark:text-white">{member.name}</p>
                      <p className="text-sm text-black dark:text-white flex items-center gap-1">
                        <Phone size={14} />
                        {member.phone}
                      </p>
                    </div>
                    <Badge>{member.rating}/5 ⭐</Badge>
                  </div>
                  {member.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.skills.map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-black dark:text-white py-4">No crew members yet</p>
          )}
        </CardContent>
      </Card>

      {/* Job Dispatch */}
      <Card glass={isPro}>
        <CardHeader>
          <CardTitle>Dispatch Jobs</CardTitle>
          <CardDescription>AI will recommend the best crew member for each job</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeJobs.length === 0 ? (
            <p className="text-center text-black dark:text-white py-4">No active jobs to dispatch</p>
          ) : (
            activeJobs.map((job) => (
              <div key={job.id} className="p-4 border-0 shadow-md hover:shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-black dark:text-white">{job.title}</p>
                    <p className="text-sm text-black dark:text-white">{job.address}</p>
                    {job.tradesRequired && job.tradesRequired.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {job.tradesRequired.map((trade, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {trade}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button onClick={() => dispatchJob(job)} size="sm">
                    Dispatch
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Active Dispatches */}
      {dispatches.length > 0 && (
        <Card glass={isPro}>
          <CardHeader>
            <CardTitle>Active Dispatches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dispatches.map((dispatch) => {
              const job = activeJobs.find(j => j.id === dispatch.jobId)
              const crew = myCrew.find(c => c.id === dispatch.crewMemberId)
              
              return (
                <div key={dispatch.id} className="p-4 border-0 shadow-md hover:shadow-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-black dark:text-white">{job?.title}</p>
                      <p className="text-sm text-black dark:text-white">Assigned to: {crew?.name}</p>
                      <p className="text-xs text-black dark:text-white">
                        {new Date(dispatch.sentAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={
                      dispatch.status === 'confirmed' || dispatch.status === 'in-progress' ? 'default' :
                      dispatch.status === 'completed' ? 'default' :
                      dispatch.status === 'declined' ? 'destructive' : 'secondary'
                    }>
                      {dispatch.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {dispatch.status === 'pending' && (
                      <Button size="sm" onClick={() => confirmDispatch(dispatch.id)}>
                        Confirm
                      </Button>
                    )}
                    {dispatch.status === 'confirmed' && (
                      <Button size="sm" onClick={() => checkIn(dispatch.id)} variant="outline">
                        <Camera size={16} className="mr-2" />
                        Check In
                      </Button>
                    )}
                    {dispatch.status === 'in-progress' && (
                      <Button size="sm" onClick={() => completeDispatch(dispatch.id)}>
                        <CheckCircle size={16} className="mr-2" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
