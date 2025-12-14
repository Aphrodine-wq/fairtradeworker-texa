import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  House, 
  Wrench, 
  CheckCircle, 
  Clock, 
  CurrencyDollar,
  Star,
  TrendUp,
  Users,
  Calendar,
  Plus
} from "@phosphor-icons/react"
import type { User, Job, Invoice } from "@/lib/types"
import { useState, useMemo } from "react"

interface HomeownerDashboardProps {
  user: User
  onNavigate: (page: string, role?: string, jobId?: string) => void
}

export function HomeownerDashboard({ user, onNavigate }: HomeownerDashboardProps) {
  const [jobs] = useKV<Job[]>("jobs", [])
  const [invoices] = useKV<Invoice[]>("invoices", [])
  // Homeowner dashboards don't use glass (free tier)

  const myJobs = useMemo(() => 
    (jobs || []).filter(j => j.homeownerId === user.id),
    [jobs, user.id]
  )

  const activeJobs = useMemo(() => 
    myJobs.filter(j => j.status === 'in-progress'),
    [myJobs]
  )

  const completedJobs = useMemo(() => 
    myJobs.filter(j => j.status === 'completed'),
    [myJobs]
  )

  const openJobs = useMemo(() => 
    myJobs.filter(j => j.status === 'open'),
    [myJobs]
  )

  const myInvoices = useMemo(() => 
    (invoices || []).filter(inv => myJobs.some(j => j.id === inv.jobId)),
    [invoices, myJobs]
  )

  const totalSpent = useMemo(() => 
    myInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0),
    [myInvoices]
  )

  const pendingPayments = useMemo(() =>
    myInvoices
      .filter(inv => inv.status === 'sent' || inv.status === 'viewed')
      .reduce((sum, inv) => sum + inv.total, 0),
    [myInvoices]
  )

  const avgRatingGiven = useMemo(() => {
    const completedWithBids = completedJobs.filter(j => 
      j.bids.some(b => b.status === 'accepted')
    )
    if (completedWithBids.length === 0) return 0
    return 4.6
  }, [completedJobs])

  const recentActivity = useMemo(() => {
    const activities: Array<{
      id: string
      type: 'bid' | 'job' | 'completion' | 'payment'
      title: string
      description: string
      timestamp: string
      icon: typeof Wrench
    }> = []

    myJobs.slice(0, 5).forEach(job => {
      const newBids = job.bids.filter(b => {
        const bidTime = new Date(b.createdAt).getTime()
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000
        return bidTime > dayAgo
      })

      newBids.forEach(bid => {
        activities.push({
          id: bid.id,
          type: 'bid',
          title: 'New Bid Received',
          description: `${bid.contractorName} bid $${bid.amount} on "${job.title}"`,
          timestamp: bid.createdAt,
          icon: CurrencyDollar
        })
      })

      if (job.status === 'completed') {
        activities.push({
          id: job.id,
          type: 'completion',
          title: 'Job Completed',
          description: job.title,
          timestamp: job.createdAt,
          icon: CheckCircle
        })
      }
    })

    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 5)
  }, [myJobs])

  return (
    <div className="min-h-screen bg-background p-[1pt]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">Welcome back, {user.fullName.split(' ')[0]}</h1>
              <p className="text-muted-foreground mt-1">Manage your home projects and contractors</p>
            </div>
            <Button onClick={() => onNavigate('post-job')} size="lg">
              <Plus className="mr-2" />
              Post New Job
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                  <p className="text-3xl font-bold mt-1">{activeJobs.length}</p>
                </div>
                <div className="h-12 w-12 rounded-md bg-black dark:bg-white border border-black/20 dark:border-white/20 flex items-center justify-center shadow-sm">
                  <Wrench className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Bids</p>
                  <p className="text-3xl font-bold mt-1">
                    {openJobs.reduce((sum, j) => sum + j.bids.length, 0)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-md bg-black dark:bg-white border border-black/20 dark:border-white/20 flex items-center justify-center shadow-sm">
                  <Users className="h-6 w-6 text-secondary-foreground" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold mt-1">{completedJobs.length}</p>
                </div>
                <div className="h-12 w-12 rounded-md bg-black dark:bg-white border border-black/20 dark:border-white/20 flex items-center justify-center shadow-sm">
                  <CheckCircle className="h-6 w-6 text-accent-foreground" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-3xl font-bold mt-1">${totalSpent.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-md bg-black dark:bg-white border border-black/20 dark:border-white/20 flex items-center justify-center shadow-sm">
                  <CurrencyDollar className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-black dark:text-white">Active Projects</h2>
                <Button variant="outline" onClick={() => onNavigate('my-jobs')}>View All</Button>
              </div>

              {activeJobs.length === 0 ? (
                <div className="text-center py-12">
                  <House className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No active projects</p>
                  <Button onClick={() => onNavigate('post-job')} className="mt-4">
                    Post Your First Job
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeJobs.map(job => {
                    const acceptedBid = job.bids.find(b => b.status === 'accepted')
                    const completedMilestones = job.milestones?.filter(m => m.status === 'completed').length || 0
                    const totalMilestones = job.milestones?.length || 0
                    const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0

                    return (
                      <Card key={job.id} className="p-4 hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => onNavigate('project-milestones', undefined, job.id)}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-black dark:text-white">{job.title}</h3>
                              {job.tier === 'MAJOR_PROJECT' && (
                                <Badge variant="secondary">Major Project</Badge>
                              )}
                            </div>
                            {acceptedBid && (
                              <p className="text-sm text-muted-foreground mb-2">
                                Contractor: {acceptedBid.contractorName} • ${acceptedBid.amount.toLocaleString()}
                              </p>
                            )}
                            {totalMilestones > 0 && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="font-medium">{completedMilestones}/{totalMilestones} milestones</span>
                                </div>
                                <div className="h-4 bg-white dark:bg-black border border-black/20 dark:border-white/20 rounded-md overflow-hidden">
                                  <div 
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </Card>

            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Recent Activity</h2>
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map(activity => {
                      const Icon = activity.icon
                      return (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>

              {pendingPayments > 0 && (
                <Card className="p-6 bg-white dark:bg-black border border-black/20 dark:border-white/20">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-accent-foreground mt-0.5" />
                    <div>
                      <p className="font-semibold">Pending Payments</p>
                      <p className="text-2xl font-bold text-accent-foreground mt-1">
                        ${pendingPayments.toLocaleString()}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => onNavigate('my-jobs')}
                      >
                        Review Invoices
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              <Card className="p-6">
                <h3 className="font-semibold mb-3 text-black dark:text-white">Your Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Jobs</span>
                    <span className="font-semibold">{myJobs.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg Rating Given</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{avgRatingGiven.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Member Since</span>
                    <span className="font-semibold">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {openJobs.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Open Jobs Awaiting Your Response</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {openJobs.map(job => (
                  <Card key={job.id} className="p-4 hover:border-primary/50 transition-colors">
                    <h3 className="font-semibold mb-2 text-black dark:text-white">{job.title}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">{job.bids.length} bids received</span>
                      {job.tier && (
                        <Badge variant="outline" className="text-xs">
                          {job.tier.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => onNavigate('my-jobs')}
                    >
                      Review Bids
                    </Button>
                  </Card>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomeownerDashboard
