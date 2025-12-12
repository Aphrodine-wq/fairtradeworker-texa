import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  CalendarBlank,
  Clock,
  CheckCircle,
  Warning,
  TrendUp,
  TrendDown
} from '@phosphor-icons/react'
import type { Job, TradeSequence, Milestone } from '@/lib/types'

interface ProjectScheduleViewProps {
  job: Job
}

const KITCHEN_SEQUENCE: TradeSequence[] = [
  { id: 'demo', name: 'Demolition', order: 1, estimatedDays: 2, dependencies: [], criticalPath: true },
  { id: 'rough-plumb', name: 'Rough Plumbing', order: 2, estimatedDays: 2, dependencies: ['demo'], criticalPath: true },
  { id: 'rough-elec', name: 'Rough Electrical', order: 3, estimatedDays: 2, dependencies: ['demo'], criticalPath: true },
  { id: 'drywall', name: 'Drywall Repair', order: 4, estimatedDays: 3, dependencies: ['rough-plumb', 'rough-elec'], criticalPath: true },
  { id: 'cabinets', name: 'Cabinet Installation', order: 5, estimatedDays: 4, dependencies: ['drywall'], criticalPath: true },
  { id: 'counters', name: 'Countertop Install', order: 6, estimatedDays: 2, dependencies: ['cabinets'], criticalPath: true },
  { id: 'backsplash', name: 'Backsplash Tile', order: 7, estimatedDays: 3, dependencies: ['counters'], criticalPath: false },
  { id: 'final-plumb', name: 'Final Plumbing', order: 8, estimatedDays: 1, dependencies: ['counters'], criticalPath: true },
  { id: 'final-elec', name: 'Final Electrical', order: 9, estimatedDays: 1, dependencies: ['cabinets'], criticalPath: true },
  { id: 'paint', name: 'Painting', order: 10, estimatedDays: 2, dependencies: ['backsplash'], criticalPath: false },
  { id: 'cleanup', name: 'Final Cleanup', order: 11, estimatedDays: 1, dependencies: ['paint', 'final-plumb', 'final-elec'], criticalPath: true }
]

const BATHROOM_SEQUENCE: TradeSequence[] = [
  { id: 'demo', name: 'Demolition', order: 1, estimatedDays: 1, dependencies: [], criticalPath: true },
  { id: 'rough', name: 'Rough-In (Plumb/Elec)', order: 2, estimatedDays: 2, dependencies: ['demo'], criticalPath: true },
  { id: 'waterproof', name: 'Waterproofing', order: 3, estimatedDays: 1, dependencies: ['rough'], criticalPath: true },
  { id: 'tile', name: 'Tile Installation', order: 4, estimatedDays: 4, dependencies: ['waterproof'], criticalPath: true },
  { id: 'fixtures', name: 'Fixtures/Vanity', order: 5, estimatedDays: 2, dependencies: ['tile'], criticalPath: true },
  { id: 'final', name: 'Final Touches', order: 6, estimatedDays: 1, dependencies: ['fixtures'], criticalPath: true }
]

export function ProjectScheduleView({ job }: ProjectScheduleViewProps) {
  const milestones = job.milestones || []
  const trades = job.tradeContractors || []

  const sequence = useMemo(() => {
    if (job.title.toLowerCase().includes('kitchen')) return KITCHEN_SEQUENCE
    if (job.title.toLowerCase().includes('bathroom')) return BATHROOM_SEQUENCE
    return []
  }, [job.title])

  const totalDays = sequence.reduce((sum, s) => sum + s.estimatedDays, 0)
  
  const projectStartDate = job.preferredStartDate 
    ? new Date(job.preferredStartDate)
    : new Date()

  const calculatePhaseProgress = (phase: TradeSequence): number => {
    const relatedMilestone = milestones.find(m => 
      m.name.toLowerCase().includes(phase.name.toLowerCase().split(' ')[0])
    )
    if (!relatedMilestone) return 0
    if (relatedMilestone.status === 'paid') return 100
    if (relatedMilestone.status === 'completed') return 90
    if (relatedMilestone.status === 'in-progress') return 50
    return 0
  }

  const overallProgress = sequence.length > 0
    ? Math.round(sequence.reduce((sum, s) => sum + calculatePhaseProgress(s), 0) / sequence.length)
    : 0

  const completedPhases = sequence.filter(s => calculatePhaseProgress(s) === 100).length
  const daysElapsed = Math.floor((Date.now() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24))
  const estimatedEndDate = new Date(projectStartDate.getTime() + totalDays * 24 * 60 * 60 * 1000)
  const daysRemaining = Math.max(0, Math.floor((estimatedEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
  const onTrack = daysElapsed <= totalDays

  const getPhaseStatus = (phase: TradeSequence): 'completed' | 'active' | 'pending' | 'blocked' => {
    const progress = calculatePhaseProgress(phase)
    if (progress === 100) return 'completed'
    if (progress > 0) return 'active'
    
    const allDepsComplete = phase.dependencies.every(depId => {
      const dep = sequence.find(s => s.id === depId)
      return dep && calculatePhaseProgress(dep) === 100
    })
    
    return allDepsComplete ? 'pending' : 'blocked'
  }

  const getStatusBadge = (status: ReturnType<typeof getPhaseStatus>) => {
    const variants = {
      completed: { className: 'bg-green-100 text-green-700', label: 'Complete' },
      active: { className: 'bg-blue-100 text-blue-700', label: 'In Progress' },
      pending: { className: 'bg-yellow-100 text-yellow-700', label: 'Ready' },
      blocked: { className: 'bg-gray-100 text-gray-700', label: 'Blocked' }
    }
    const variant = variants[status]
    return <Badge className={variant.className}>{variant.label}</Badge>
  }

  if (sequence.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <CalendarBlank size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Schedule Available</h3>
            <p className="text-muted-foreground">
              Project schedule will appear for supported project types
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarBlank size={24} />
            Project Schedule
          </CardTitle>
          <CardDescription>Trade sequencing and timeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{overallProgress}%</div>
                  <p className="text-sm text-muted-foreground">Complete</p>
                  <Progress value={overallProgress} className="mt-2 h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{completedPhases}/{sequence.length}</div>
                  <p className="text-sm text-muted-foreground">Phases Done</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{daysElapsed}</div>
                  <p className="text-sm text-muted-foreground">Days Elapsed</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold flex items-center justify-center gap-2">
                    {daysRemaining}
                    {onTrack ? (
                      <TrendUp size={20} className="text-green-500" />
                    ) : (
                      <TrendDown size={20} className="text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Days Remaining</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            {sequence.map((phase, index) => {
              const status = getPhaseStatus(phase)
              const progress = calculatePhaseProgress(phase)
              const startDay = sequence.slice(0, index).reduce((sum, s) => sum + s.estimatedDays, 0)
              const endDay = startDay + phase.estimatedDays

              return (
                <Card key={phase.id} className={phase.criticalPath ? 'border-l-4 border-l-primary' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            Phase {phase.order}
                          </span>
                          {getStatusBadge(status)}
                          {phase.criticalPath && (
                            <Badge variant="outline" className="text-xs">Critical Path</Badge>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-1">{phase.name}</h3>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Clock size={16} />
                            <span>{phase.estimatedDays} day{phase.estimatedDays !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarBlank size={16} />
                            <span>Day {startDay + 1} - {endDay}</span>
                          </div>
                        </div>

                        {phase.dependencies.length > 0 && (
                          <div className="text-xs text-muted-foreground mb-2">
                            <span className="font-medium">Depends on:</span>{' '}
                            {phase.dependencies.map(depId => {
                              const dep = sequence.find(s => s.id === depId)
                              return dep?.name
                            }).join(', ')}
                          </div>
                        )}

                        <Progress value={progress} className="h-2" />
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold">{progress}%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              {onTrack ? (
                <>
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" weight="bold" />
                  <div>
                    <p className="font-medium text-sm">Project On Track</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Estimated completion: {estimatedEndDate.toLocaleDateString()}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Warning size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" weight="bold" />
                  <div>
                    <p className="font-medium text-sm">Schedule Attention Needed</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Project timeline may need adjustment
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
