import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { Calculator, ShieldCheck, Note, Receipt, ChartLine, FileText, CreditCard, Folder, Calendar, ChatCircleDots, Bell, ClipboardText, Package, CheckCircle, Phone, Target, Microphone, MapPin, Swap, Ruler, WifiSlash, Image, CalendarDots, Heart } from "@phosphor-icons/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SkeletonLoader } from "@/components/ui/SkeletonLoader"

import { 
  Briefcase, 
  Lightning, 
  CheckCircle, 
  Clock, 
  CurrencyDollar,
  Star,
  TrendUp,
  Users,
  Calendar,
  ChartLine,
  Wrench,
  MapPin,
  Target,
  Fire,
  Sparkle,
  Gear,
  SlidersHorizontal
} from "@phosphor-icons/react"
import type { User, Job, Invoice, Bid } from "@/lib/types"
import { useState, useMemo, useEffect } from "react"
import { DashboardCustomizer } from "@/components/dashboard/DashboardCustomizer"

interface ContractorDashboardNewProps {
  user: User
  onNavigate: (page: string) => void
}

export function ContractorDashboardNew({ user, onNavigate }: ContractorDashboardNewProps) {
  const [jobs, , jobsLoading] = useKV<Job[]>("jobs", [])
  const [invoices, , invoicesLoading] = useKV<Invoice[]>("invoices", [])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isInitializing, setIsInitializing] = useState(true)
  const [customizerOpen, setCustomizerOpen] = useState(false)
  const [pinnedTools] = useKV<Array<{ id: string; label: string; page: string; iconName: string }>>(`dashboard-pinned-tools-${user.id}`, [])
  const isPro = user.isPro || false

  // Simulate initial loading
  useEffect(() => {
    if (!jobsLoading && !invoicesLoading) {
      const timer = setTimeout(() => setIsInitializing(false), 500)
      return () => clearTimeout(timer)
    }
  }, [jobsLoading, invoicesLoading])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const myBids = useMemo(() => {
    const allBids: Array<Bid & { job: Job }> = []
    ;(jobs || []).forEach(job => {
      const myJobBids = job.bids.filter(b => b.contractorId === user.id)
      myJobBids.forEach(bid => {
        allBids.push({ ...bid, job })
      })
    })
    return allBids
  }, [jobs, user.id])

  const wonBids = useMemo(() => 
    myBids.filter(b => b.status === 'accepted'),
    [myBids]
  )

  const activeJobs = useMemo(() => 
    (jobs || []).filter(j => 
      j.status === 'in-progress' && 
      j.bids.some(b => b.contractorId === user.id && b.status === 'accepted')
    ),
    [jobs, user.id]
  )

  const completedJobs = useMemo(() => 
    (jobs || []).filter(j => 
      j.status === 'completed' && 
      j.bids.some(b => b.contractorId === user.id && b.status === 'accepted')
    ),
    [jobs, user.id]
  )

  const freshJobs = useMemo(() => {
    const now = currentTime.getTime()
    return (jobs || []).filter(j => {
      if (j.status !== 'open') return false
      const postedTime = new Date(j.createdAt).getTime()
      const ageMinutes = (now - postedTime) / (1000 * 60)
      return ageMinutes <= 60
    }).slice(0, 5)
  }, [jobs, currentTime])

  const myInvoices = useMemo(() => 
    (invoices || []).filter(inv => inv.contractorId === user.id),
    [invoices, user.id]
  )

  const monthlyEarnings = useMemo(() => {
    const now = new Date()
    const thisMonth = myInvoices.filter(inv => {
      const invDate = new Date(inv.createdAt)
      return invDate.getMonth() === now.getMonth() && 
             invDate.getFullYear() === now.getFullYear() &&
             inv.status === 'paid'
    })
    return thisMonth.reduce((sum, inv) => sum + inv.total, 0)
  }, [myInvoices])

  const pendingPayments = useMemo(() =>
    myInvoices
      .filter(inv => inv.status === 'sent' || inv.status === 'viewed')
      .reduce((sum, inv) => sum + inv.total, 0),
    [myInvoices]
  )

  const yearlyEarnings = useMemo(() => {
    const now = new Date()
    const thisYear = myInvoices.filter(inv => {
      const invDate = new Date(inv.createdAt)
      return invDate.getFullYear() === now.getFullYear() && inv.status === 'paid'
    })
    return thisYear.reduce((sum, inv) => sum + inv.total, 0)
  }, [myInvoices])

  const winRate = useMemo(() => {
    if (myBids.length === 0) return 0
    return (wonBids.length / myBids.length) * 100
  }, [myBids.length, wonBids.length])

  const avgResponseTime = useMemo(() => {
    const bidsWithTime = myBids.filter(b => b.responseTimeMinutes)
    if (bidsWithTime.length === 0) return 0
    const total = bidsWithTime.reduce((sum, b) => sum + (b.responseTimeMinutes || 0), 0)
    return Math.round(total / bidsWithTime.length)
  }, [myBids])

  const lightningBids = useMemo(() => 
    myBids.filter(b => b.isLightningBid).length,
    [myBids]
  )

  const feesAvoided = useMemo(() => {
    const totalRevenue = myInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0)
    return totalRevenue * 0.15
  }, [myInvoices])

  const todaySchedule = useMemo(() => {
    const today = currentTime.toDateString()
    return activeJobs.filter(job => {
      return job.milestones?.some(m => {
        if (!m.estimatedStartDate) return false
        return new Date(m.estimatedStartDate).toDateString() === today && 
               m.status === 'in-progress'
      })
    })
  }, [activeJobs, currentTime])

  const upcomingMilestones = useMemo(() => {
    const upcoming: Array<{ job: Job, milestone: any }> = []
    const now = currentTime.getTime()
    const weekFromNow = now + (7 * 24 * 60 * 60 * 1000)
    
    activeJobs.forEach(job => {
      job.milestones?.forEach(milestone => {
        if (milestone.status === 'pending' && milestone.estimatedStartDate) {
          const milestoneTime = new Date(milestone.estimatedStartDate).getTime()
          if (milestoneTime >= now && milestoneTime <= weekFromNow) {
            upcoming.push({ job, milestone })
          }
        }
      })
    })
    
    return upcoming.sort((a, b) => 
      new Date(a.milestone.estimatedStartDate).getTime() - 
      new Date(b.milestone.estimatedStartDate).getTime()
    ).slice(0, 5)
  }, [activeJobs, currentTime])

  const performanceScore = useMemo(() => {
    let score = 50
    
    if (winRate > 50) score += 15
    else if (winRate > 30) score += 10
    else if (winRate > 20) score += 5
    
    if (avgResponseTime < 15) score += 15
    else if (avgResponseTime < 30) score += 10
    else if (avgResponseTime < 60) score += 5
    
    if (completedJobs.length > 50) score += 10
    else if (completedJobs.length > 25) score += 7
    else if (completedJobs.length > 10) score += 5
    
    if (lightningBids > 20) score += 10
    else if (lightningBids > 10) score += 7
    else if (lightningBids > 5) score += 5
    
    return Math.min(score, 100)
  }, [winRate, avgResponseTime, completedJobs.length, lightningBids])

  if (isInitializing) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-8 pt-10 pb-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">Welcome back, {user.fullName.split(' ')[0]}</h1>
                {user.isPro && (
                  <Badge className="bg-primary">PRO</Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <Button onClick={() => onNavigate('browse-jobs')} size="lg">
              <Fire className="mr-2" />
              Browse FRESH Jobs
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6" glass={isPro}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                  <p className="text-3xl font-bold mt-1">{activeJobs.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {todaySchedule.length} scheduled today
                  </p>
                </div>
                <div className="h-12 w-12 rounded-md bg-black dark:bg-white border border-black/20 dark:border-white/20 flex items-center justify-center shadow-sm">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6" glass={isPro}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-3xl font-bold mt-1">${monthlyEarnings.toLocaleString()}</p>
                  <p className="text-xs text-accent-foreground mt-1">
                    {completedJobs.filter(j => {
                      const jobDate = new Date(j.createdAt)
                      const now = new Date()
                      return jobDate.getMonth() === now.getMonth()
                    }).length} jobs completed
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <CurrencyDollar className="h-6 w-6 text-accent-foreground" />
                </div>
              </div>
            </Card>

            <Card className="p-6" glass={isPro}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className="text-3xl font-bold mt-1">{winRate.toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {wonBids.length} of {myBids.length} bids
                  </p>
                </div>
                <div className="h-12 w-12 rounded-md bg-black dark:bg-white border border-black/20 dark:border-white/20 flex items-center justify-center shadow-sm">
                  <Target className="h-6 w-6 text-secondary-foreground" />
                </div>
              </div>
            </Card>

            <Card className="p-6" glass={isPro}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Performance</p>
                  <p className="text-3xl font-bold mt-1">{performanceScore}/100</p>
                  <Progress value={performanceScore} className="mt-2 h-1" />
                </div>
                <div className="h-12 w-12 rounded-md bg-black dark:bg-white border border-black/20 dark:border-white/20 flex items-center justify-center shadow-sm">
                  <ChartLine className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>
          </div>

          {/* Fee Savings Highlight */}
          {feesAvoided > 0 && (
            <Card className="p-6" glass={isPro}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fees Avoided on FairTradeWorker</p>
                  <p className="text-4xl font-bold mt-1 text-primary">
                    ${feesAvoided.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    That's money in your pocket. Competitors would have taken 15-20% of your ${yearlyEarnings.toLocaleString()} revenue.
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-2">Zero Platform Fees</Badge>
                  <p className="text-xs text-muted-foreground">
                    On Thumbtack: -${(feesAvoided * 0.85).toLocaleString()}<br />
                    On HomeAdvisor: -${feesAvoided.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* FRESH Jobs */}
            <Card className="lg:col-span-2 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-black dark:text-white">FRESH Jobs</h2>
                  <Badge variant="destructive" className="animate-pulse">
                    <Lightning className="h-3 w-3 mr-1" />
                    {freshJobs.length} New
                  </Badge>
                </div>
                <Button variant="outline" onClick={() => onNavigate('browse-jobs')}>
                  View All
                </Button>
              </div>

              {freshJobs.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No fresh jobs right now</p>
                  <p className="text-sm text-muted-foreground mt-1">Check back soon or browse all jobs</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {freshJobs.map(job => {
                    const ageMinutes = Math.round((currentTime.getTime() - new Date(job.createdAt).getTime()) / (1000 * 60))
                    const myBid = job.bids.find(b => b.contractorId === user.id)
                    
                    return (
                      <Card key={job.id} className="p-4 hover:border-primary/50 transition-colors border-primary/20">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{job.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {ageMinutes}m ago
                              </Badge>
                              {job.tier && (
                                <Badge variant="secondary" className="text-xs">
                                  {job.tier.replace('_', ' ')}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {job.aiScope.scope.slice(0, 120)}...
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-primary font-semibold">
                                ${job.aiScope.priceLow} - ${job.aiScope.priceHigh}
                              </span>
                              <span className="text-muted-foreground">
                                {job.bids.length} bids
                              </span>
                            </div>
                          </div>
                          {myBid ? (
                            <Badge variant="outline">Bid: ${myBid.amount}</Badge>
                          ) : (
                            <Button size="sm" onClick={() => onNavigate('browse-jobs')}>
                              <Lightning className="mr-1" />
                              Quick Bid
                            </Button>
                          )}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </Card>

            {/* Today's Focus */}
            <div className="space-y-6">
              <Card className="p-6" glass={isPro}>
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-black dark:text-white">
                  <Calendar className="h-5 w-5 text-primary" />
                  Today's Schedule
                </h3>
                {todaySchedule.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No jobs scheduled today
                  </p>
                ) : (
                  <div className="space-y-3">
                    {todaySchedule.map(job => (
                      <div key={job.id} className="flex items-start gap-3 p-3 bg-white dark:bg-black border border-black/20 dark:border-white/20 rounded-md">
                        <MapPin className="h-4 w-4 text-primary mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{job.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {job.milestones?.find(m => m.status === 'in-progress')?.name || 'In Progress'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-6" glass={isPro}>
                <h3 className="font-semibold mb-4 text-black dark:text-white">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Response Time</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{avgResponseTime}m</span>
                      {avgResponseTime < 15 && (
                        <Lightning className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Lightning Bids</span>
                    <span className="font-semibold">{lightningBids}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completed Jobs</span>
                    <span className="font-semibold">{completedJobs.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pending Payment</span>
                    <span className="font-semibold text-accent-foreground">
                      ${pendingPayments.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Card>

              {upcomingMilestones.length > 0 && (
                <Card className="p-6" glass={isPro}>
                  <h3 className="font-semibold mb-4">Upcoming Milestones</h3>
                  <div className="space-y-3">
                    {upcomingMilestones.map(({ job, milestone }) => (
                      <div key={milestone.id} className="text-sm">
                        <p className="font-medium truncate">{milestone.name}</p>
                        <p className="text-xs text-muted-foreground">{job.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(milestone.estimatedStartDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Quick Actions / Pinned Tools */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Quick Actions</h2>
              {isPro && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCustomizerOpen(true)}
                  className="gap-2"
                >
                  <SlidersHorizontal size={16} />
                  Customize Dashboard
                </Button>
              )}
            </div>
            
            {pinnedTools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pinnedTools.map((tool) => {
                  // Import icon mapping from navigation
                  const iconMap: Record<string, any> = {
                    Calculator, ShieldCheck, Note, Receipt, ChartLine, FileText, CreditCard,
                    Folder, Calendar, ChatCircleDots, Bell, Users, ClipboardText, Package,
                    CheckCircle, Gear, Phone, Target, Microphone, MapPin, Swap, Ruler,
                    WifiSlash, Image, CalendarDots, Heart, Briefcase, Sparkle, CurrencyDollar
                  }
                  const Icon = iconMap[tool.iconName] || Sparkle
                  
                  return (
                    <Card
                      key={tool.id}
                      className="p-6 hover:border-primary/50 transition-colors cursor-pointer"
                      glass={isPro}
                      onClick={() => onNavigate(tool.page)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-md bg-black dark:bg-white border border-black/20 dark:border-white/20 flex items-center justify-center shadow-sm flex-shrink-0">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold truncate">{tool.label}</p>
                          <p className="text-sm text-muted-foreground truncate">Quick access</p>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Default tools if no pinned tools */}
            <Card className="p-6 hover:border-primary/50 transition-colors cursor-pointer" glass={isPro}
              onClick={() => onNavigate('crm')}>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-md bg-black dark:bg-white border border-black/20 dark:border-white/20 flex items-center justify-center shadow-sm">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Customer CRM</p>
                  <p className="text-sm text-muted-foreground">Manage relationships</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:border-primary/50 transition-colors cursor-pointer" glass={isPro}
              onClick={() => onNavigate('invoices')}>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <CurrencyDollar className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Invoices</p>
                  <p className="text-sm text-muted-foreground">Track payments</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:border-primary/50 transition-colors cursor-pointer" glass={isPro}
              onClick={() => onNavigate('business-tools')}>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-md bg-black dark:bg-white border border-black/20 dark:border-white/20 flex items-center justify-center shadow-sm">
                  <Sparkle className="h-6 w-6 text-purple-600 dark:text-purple-400" weight="duotone" />
                </div>
                <div>
                  <p className="font-semibold">Business Tools</p>
                  <p className="text-sm text-muted-foreground">All-in-one toolkit</p>
                </div>
              </div>
            </Card>
                </div>
            )}
                </div>

          {/* Dashboard Customizer Dialog */}
          {isPro && (
            <DashboardCustomizer
              open={customizerOpen}
              onClose={() => setCustomizerOpen(false)}
              user={user}
              onNavigate={onNavigate}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default ContractorDashboardNew
