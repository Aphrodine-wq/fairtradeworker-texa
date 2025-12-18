import { useState, useMemo, memo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { MapPin, Clock, NavigationArrow, Lightning, TrendUp, Star, CalendarBlank } from "@phosphor-icons/react"
import type { User, Job, Bid } from "@/lib/types"
import { calculateRouteEfficiency, clusterJobsByProximity, calculateDriveTime, type JobCluster } from "@/lib/routing"
import { toast } from "sonner"

interface RouteBuilderProps {
  user: User
}

export const RouteBuilder = memo(function RouteBuilder({ user }: RouteBuilderProps) {
  const [jobs] = useKV<Job[]>("jobs", [])
  const [selectedDay, setSelectedDay] = useState<string>('today')
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null)
  const isPro = user.isPro || false

  const availableJobs = useMemo(() => {
    return (jobs || []).filter(job => 
      job.status === 'open' && 
      !job.bids.some(bid => bid.contractorId === user.id)
    )
  }, [jobs, user.id])

  const myScheduledJobs = useMemo(() => {
    return (jobs || []).filter(job =>
      job.bids.some(bid => bid.contractorId === user.id && bid.status === 'accepted')
    )
  }, [jobs, user.id])

  const jobClusters = useMemo(() => {
    return clusterJobsByProximity(availableJobs, 8)
  }, [availableJobs])

  const topClusters = useMemo(() => {
    return jobClusters
      .sort((a, b) => b.efficiencyScore - a.efficiencyScore)
      .slice(0, 5)
  }, [jobClusters])

  const anchorJobs = useMemo(() => {
    return myScheduledJobs.filter(job => (job as any).isAnchor)
  }, [myScheduledJobs])

  const handleBidOnCluster = (cluster: JobCluster) => {
    toast.success(`Opening bids for ${cluster.jobs.length} nearby jobs`, {
      description: `Save ${Math.round(cluster.driveTimeSaved)} minutes of driving`
    })
  }

  const handleSetAnchor = (jobId: string) => {
    toast.success('Job marked as anchor', {
      description: 'We\'ll suggest nearby jobs that fit before or after this one'
    })
  }

  const getEfficiencyColor = (score: number) => {
    if (score >= 75) return 'text-green-600 bg-green-50'
    if (score >= 50) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getEfficiencyLabel = (score: number) => {
    if (score >= 75) return 'Excellent'
    if (score >= 50) return 'Good'
    return 'Needs Improvement'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Route Builder</h2>
        <p className="text-muted-foreground">
          Cluster nearby jobs to maximize efficiency and minimize drive time
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card glass={isPro}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-primary">
              <MapPin weight="duotone" size={24} />
              <CardTitle className="text-base">Available Clusters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{jobClusters.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {availableJobs.length} total jobs
            </p>
          </CardContent>
        </Card>

        <Card glass={isPro}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-green-600">
              <Clock weight="duotone" size={24} />
              <CardTitle className="text-base">Potential Savings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(topClusters.reduce((sum, c) => sum + c.driveTimeSaved, 0))} min
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Top 5 clusters this week
            </p>
          </CardContent>
        </Card>

        <Card glass={isPro}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-accent">
              <TrendUp weight="duotone" size={24} />
              <CardTitle className="text-base">Avg Efficiency</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {jobClusters.length > 0 
                ? Math.round(jobClusters.reduce((sum, c) => sum + c.efficiencyScore, 0) / jobClusters.length)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Route efficiency score
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="clusters" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="clusters">
            <MapPin className="mr-2" size={16} />
            Job Clusters
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            <CalendarBlank className="mr-2" size={16} />
            Scheduled Routes
          </TabsTrigger>
          <TabsTrigger value="anchor">
            <Star className="mr-2" size={16} />
            Anchor Jobs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clusters" className="space-y-4 mt-6">
          {topClusters.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MapPin size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No job clusters available at the moment
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Check back soon for nearby jobs you can group together
                </p>
              </CardContent>
            </Card>
          ) : (
            topClusters.map((cluster) => (
              <Card 
                key={cluster.id}
                className={`transition-all cursor-pointer hover:shadow-[6px_6px_0_#000] dark:hover:shadow-[6px_6px_0_#fff] ${
                  selectedCluster === cluster.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedCluster(cluster.id)}
                glass={isPro}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">
                          {cluster.jobs.length} Jobs in {cluster.centerArea}
                        </CardTitle>
                        <Badge className={getEfficiencyColor(cluster.efficiencyScore)}>
                          {cluster.efficiencyScore}/100 - {getEfficiencyLabel(cluster.efficiencyScore)}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} weight="duotone" />
                          {cluster.radius.toFixed(1)} mi radius
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} weight="duotone" />
                          Save {Math.round(cluster.driveTimeSaved)} min driving
                        </span>
                        <span className="flex items-center gap-1">
                          <NavigationArrow size={14} weight="duotone" />
                          {cluster.totalDriveTime} min total
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {cluster.jobs.map((job, index) => {
                      const isFirst = index === 0
                      const driveTo = isFirst ? 0 : calculateDriveTime(
                        cluster.jobs[index - 1],
                        job
                      )

                      return (
                        <div key={job.id} className="flex items-start gap-3 p-3 rounded-md border-0 shadow-md hover:shadow-lg bg-muted shadow-sm">
                          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-black dark:bg-white text-white dark:text-black border-0 shadow-md hover:shadow-lg text-xs font-semibold flex-shrink-0 shadow-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{job.title}</div>
                            <div className="text-sm text-muted-foreground">
                              ${job.aiScope.priceLow}-${job.aiScope.priceHigh}
                              {!isFirst && (
                                <span className="ml-2 text-green-600">
                                  • {driveTo} min from previous
                                </span>
                              )}
                            </div>
                          </div>
                          {index < 3 && job.createdAt > new Date(Date.now() - 15 * 60 * 1000).toISOString() && (
                            <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                              <Lightning weight="fill" size={12} />
                              FRESH
                            </Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className="pt-3 border-t flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Potential earnings: </span>
                      <span className="font-bold text-green-600">
                        ${cluster.jobs.reduce((sum, job) => 
                          sum + ((job.aiScope.priceLow + job.aiScope.priceHigh) / 2), 0
                        ).toFixed(0)}
                      </span>
                    </div>
                    <Button onClick={() => handleBidOnCluster(cluster)}>
                      Bid on All {cluster.jobs.length}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4 mt-6">
          {myScheduledJobs.length === 0 ? (
            <Card glass={isPro}>
              <CardContent className="py-12 text-center">
                <CalendarBlank size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No scheduled jobs yet
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Win some bids to see your routes here
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card glass={isPro}>
              <CardHeader>
                <CardTitle>Your Scheduled Jobs</CardTitle>
                <CardDescription>
                  Optimize your route by adding nearby jobs between stops
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {myScheduledJobs.map((job, index) => {
                  const driveTo = index === 0 ? 0 : calculateDriveTime(
                    myScheduledJobs[index - 1],
                    job
                  )
                  
                  return (
                    <div key={job.id} className="p-4 rounded-md border-0 shadow-md hover:shadow-lg shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-medium">{job.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {index > 0 && (
                              <span className="text-amber-600">
                                {driveTo} min drive • 
                              </span>
                            )}
                            {' '}Est. ${(job.aiScope.priceLow + job.aiScope.priceHigh) / 2}
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSetAnchor(job.id)}
                        >
                          <Star size={16} className="mr-1" />
                          Set Anchor
                        </Button>
                      </div>
                    </div>
                  )
                })}

                <div className="pt-4 mt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total drive time:</span>
                    <span className="font-bold">
                      {myScheduledJobs.reduce((sum, job, idx) => {
                        if (idx === 0) return 0
                        return sum + calculateDriveTime(myScheduledJobs[idx - 1], job)
                      }, 0)} minutes
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="anchor" className="space-y-4 mt-6">
          <Card glass={isPro}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star weight="duotone" size={24} className="text-accent" />
                Anchor Job System
              </CardTitle>
              <CardDescription>
                Mark big jobs as "anchors" and we'll suggest smaller jobs nearby
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {anchorJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Star size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No anchor jobs set</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Set an anchor job from your scheduled routes to see nearby opportunities
                  </p>
                </div>
              ) : (
                anchorJobs.map(job => (
                  <div key={job.id} className="p-4 rounded-md border-0 shadow-md hover:shadow-lg bg-white dark:bg-black shadow-sm">
                    <div className="flex items-start gap-3">
                      <Star weight="fill" size={24} className="text-accent flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="font-medium mb-1">{job.title}</div>
                        <div className="text-sm text-muted-foreground mb-3">
                          Big job anchoring your schedule
                        </div>
                        <div className="bg-[#00FF00] border-0 shadow-md hover:shadow-lg rounded-md p-3 shadow-sm">
                          <div className="text-sm font-medium text-green-800 mb-2">
                            3 nearby jobs found within 10 minutes
                          </div>
                          <Button size="sm" variant="outline">
                            View Opportunities
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">How Anchor Jobs Work</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-accent">•</span>
                    <span>Mark any scheduled job as an "anchor" - typically a longer job that locks your location</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">•</span>
                    <span>System automatically surfaces smaller jobs nearby that fit before or after</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">•</span>
                    <span>Fill gaps in your schedule without extra driving</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
})
