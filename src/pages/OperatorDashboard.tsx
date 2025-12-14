import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { 
  MapTrifold, 
  Users, 
  CheckCircle, 
  Clock, 
  CurrencyDollar,
  Star,
  TrendUp,
  ChartLine,
  Briefcase,
  Target,
  Fire,
  UserPlus,
  Buildings,
  Copy,
  Check
} from "@phosphor-icons/react"
import type { User, Job, Territory } from "@/lib/types"
import { useMemo, useState } from "react"

interface OperatorDashboardProps {
  user: User
  onNavigate: (page: string) => void
}

export function OperatorDashboard({ user, onNavigate }: OperatorDashboardProps) {
  const [jobs] = useKV<Job[]>("jobs", [])
  const [territories] = useKV<Territory[]>("territories", [])
  const [users] = useKV<User[]>("users", [])
  const [referralDialogOpen, setReferralDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const referralLink = `https://fairtradeworker.com?operator-ref=${user.id}`
  
  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success("Referral link copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  // Operators can only control one territory
  const myTerritory = useMemo(() => {
    if (!user.territoryId) return null
    return (territories || []).find(t => t.id === user.territoryId) || null
  }, [territories, user.territoryId])

  const territoryJobs = useMemo(() => 
    (jobs || []).filter(j => j.territoryId === user.territoryId),
    [jobs, user.territoryId]
  )

  const territoryContractors = useMemo(() => 
    (users || []).filter(u => u.role === 'contractor' && u.territoryId === user.territoryId),
    [users, user.territoryId]
  )

  const territoryHomeowners = useMemo(() => 
    (users || []).filter(u => u.role === 'homeowner' && u.territoryId === user.territoryId),
    [users, user.territoryId]
  )

  const activeJobs = useMemo(() => 
    territoryJobs.filter(j => j.status === 'in-progress'),
    [territoryJobs]
  )

  const completedJobs = useMemo(() => 
    territoryJobs.filter(j => j.status === 'completed'),
    [territoryJobs]
  )

  const freshJobs = useMemo(() => {
    const now = Date.now()
    return territoryJobs.filter(j => {
      if (j.status !== 'open') return false
      const postedTime = new Date(j.createdAt).getTime()
      const ageMinutes = (now - postedTime) / (1000 * 60)
      return ageMinutes <= 60
    }).slice(0, 5)
  }, [territoryJobs])

  const totalVolume = useMemo(() => {
    return completedJobs.reduce((sum, job) => {
      const acceptedBid = job.bids.find(b => b.status === 'accepted')
      return sum + (acceptedBid?.amount || 0)
    }, 0)
  }, [completedJobs])

  const operatorRevenue = useMemo(() => {
    const revenueSharePercentage = 12
    return totalVolume * (revenueSharePercentage / 100)
  }, [totalVolume])

  const growthRate = useMemo(() => {
    const now = new Date()
    const thisMonth = territoryJobs.filter(j => {
      const jobDate = new Date(j.createdAt)
      return jobDate.getMonth() === now.getMonth() && 
             jobDate.getFullYear() === now.getFullYear()
    })
    
    const lastMonth = territoryJobs.filter(j => {
      const jobDate = new Date(j.createdAt)
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1)
      return jobDate.getMonth() === lastMonthDate.getMonth() && 
             jobDate.getFullYear() === lastMonthDate.getFullYear()
    })

    if (lastMonth.length === 0) return 0
    return ((thisMonth.length - lastMonth.length) / lastMonth.length) * 100
  }, [territoryJobs])

  const avgResponseTime = useMemo(() => {
    const bidsWithTime = territoryJobs.flatMap(j => j.bids)
      .filter(b => b.responseTimeMinutes)
    if (bidsWithTime.length === 0) return 0
    const total = bidsWithTime.reduce((sum, b) => sum + (b.responseTimeMinutes || 0), 0)
    return Math.round(total / bidsWithTime.length)
  }, [territoryJobs])

  const avgJobValue = useMemo(() => {
    if (completedJobs.length === 0) return 0
    return totalVolume / completedJobs.length
  }, [totalVolume, completedJobs.length])

  const contractorsByTier = useMemo(() => {
    return {
      pro: territoryContractors.filter(c => c.isPro).length,
      verified: territoryContractors.filter(c => !c.isPro && c.performanceScore >= 70).length,
      standard: territoryContractors.filter(c => !c.isPro && c.performanceScore < 70).length
    }
  }, [territoryContractors])

  const topContractors = useMemo(() => {
    return territoryContractors
      .map(contractor => {
        const contractorJobs = completedJobs.filter(j => 
          j.bids.some(b => b.contractorId === contractor.id && b.status === 'accepted')
        )
        const revenue = contractorJobs.reduce((sum, job) => {
          const bid = job.bids.find(b => b.contractorId === contractor.id)
          return sum + (bid?.amount || 0)
        }, 0)
        return { ...contractor, jobCount: contractorJobs.length, revenue }
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }, [territoryContractors, completedJobs])

  const recentActivity = useMemo(() => {
    const activities: Array<{
      id: string
      type: 'job' | 'contractor' | 'completion'
      title: string
      description: string
      timestamp: string
    }> = []

    freshJobs.forEach(job => {
      activities.push({
        id: job.id,
        type: 'job',
        title: 'New Job Posted',
        description: job.title,
        timestamp: job.createdAt
      })
    })

    const recentContractors = territoryContractors
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
    
    recentContractors.forEach(contractor => {
      activities.push({
        id: contractor.id,
        type: 'contractor',
        title: 'New Contractor Joined',
        description: contractor.fullName,
        timestamp: contractor.createdAt
      })
    })

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
  }, [freshJobs, territoryContractors])

  const territoryHealth = useMemo(() => {
    let health = 50

    if (territoryContractors.length > 20) health += 15
    else if (territoryContractors.length > 10) health += 10
    else if (territoryContractors.length > 5) health += 5

    if (avgResponseTime < 30) health += 15
    else if (avgResponseTime < 60) health += 10
    else if (avgResponseTime < 120) health += 5

    if (completedJobs.length > 50) health += 10
    else if (completedJobs.length > 25) health += 7
    else if (completedJobs.length > 10) health += 5

    if (growthRate > 20) health += 10
    else if (growthRate > 10) health += 7
    else if (growthRate > 0) health += 5

    return Math.min(health, 100)
  }, [territoryContractors.length, avgResponseTime, completedJobs.length, growthRate])

  return (
    <div className="min-h-screen bg-background p-[1pt]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-black dark:text-white">Territory Operator Dashboard</h1>
                {myTerritory && (
                  <Badge variant="outline" className="text-base">
                    {myTerritory.countyName}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">
                Operators are contractors who perform well in their zip code. You get priority access to leads in your territory.
              </p>
            </div>
            <Button onClick={() => onNavigate('territory-map')} size="lg">
              <MapTrifold className="mr-2" />
              View Territory Map
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Jobs</p>
                  <p className="text-3xl font-bold mt-1">{territoryJobs.length}</p>
                  <p className="text-xs text-accent-foreground mt-1">
                    {activeJobs.length} active
                  </p>
                </div>
                <div className="h-12 w-12 rounded-md bg-black dark:bg-white border border-black/20 dark:border-white/20 flex items-center justify-center shadow-sm">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contractors</p>
                  <p className="text-3xl font-bold mt-1">{territoryContractors.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {contractorsByTier.pro} PRO members
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
                  <p className="text-sm text-muted-foreground">Territory Volume</p>
                  <p className="text-3xl font-bold mt-1">${(totalVolume / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-accent-foreground mt-1">
                    Your share: ${operatorRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <CurrencyDollar className="h-6 w-6 text-accent-foreground" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Territory Health</p>
                  <p className="text-3xl font-bold mt-1">{territoryHealth}/100</p>
                  <Progress value={territoryHealth} className="mt-2 h-1" />
                </div>
                <div className="h-12 w-12 rounded-md bg-black dark:bg-white border border-black/20 dark:border-white/20 flex items-center justify-center shadow-sm">
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>
          </div>

          {/* Revenue Share Highlight */}
          {operatorRevenue > 0 && (
            <Card className="p-6 bg-white dark:bg-black border border-black/20 dark:border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Your Territory Earnings</p>
                  <p className="text-4xl font-bold mt-1 text-primary">
                    ${operatorRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    12% of ${totalVolume.toLocaleString()} territory volume • {completedJobs.length} completed jobs
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-2">
                    BRONZE TIER
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Avg job: ${avgJobValue.toFixed(0)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Territory Activity */}
            <Card className="lg:col-span-2 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-black dark:text-white">Territory Activity</h2>
                  {growthRate > 0 && (
                    <Badge variant="secondary">
                      <TrendUp className="h-3 w-3 mr-1" />
                      +{growthRate.toFixed(0)}% growth
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4 bg-white dark:bg-black border border-black/20 dark:border-white/20">
                  <p className="text-sm text-muted-foreground mb-1">Homeowners</p>
                  <p className="text-2xl font-bold">{territoryHomeowners.length}</p>
                </Card>
                <Card className="p-4 bg-white dark:bg-black border border-black/20 dark:border-white/20">
                  <p className="text-sm text-muted-foreground mb-1">Avg Response</p>
                  <p className="text-2xl font-bold">{avgResponseTime}m</p>
                </Card>
                <Card className="p-4 bg-white dark:bg-black border border-black/20 dark:border-white/20">
                  <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
                  <p className="text-2xl font-bold">
                    {territoryJobs.length > 0 
                      ? ((completedJobs.length / territoryJobs.length) * 100).toFixed(0)
                      : 0}%
                  </p>
                </Card>
              </div>

              {freshJobs.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-black dark:text-white">
                    <Fire className="h-5 w-5 text-primary" />
                    FRESH Jobs in Your Territory
                  </h3>
                  <div className="space-y-3">
                    {freshJobs.map(job => (
                      <Card key={job.id} className="p-4 hover:border-primary/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{job.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {job.bids.length} bids • Posted {Math.round((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60))}m ago
                            </p>
                          </div>
                          <Badge variant="outline">
                            ${job.aiScope.priceLow}-${job.aiScope.priceHigh}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4 text-black dark:text-white">Top Contractors</h3>
                {topContractors.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No contractor data yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {topContractors.map((contractor, index) => (
                      <div key={contractor.id} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-md bg-black dark:bg-white border border-black/20 dark:border-white/20 flex items-center justify-center font-semibold text-sm shadow-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{contractor.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {contractor.jobCount} jobs • ${(contractor.revenue / 1000).toFixed(1)}K
                          </p>
                        </div>
                        {contractor.isPro && (
                          <Badge variant="outline" className="text-xs">PRO</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4 text-black dark:text-white">Contractor Tiers</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">PRO</span>
                    <Badge variant="default">{contractorsByTier.pro}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Verified</span>
                    <Badge variant="secondary">{contractorsByTier.verified}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Standard</span>
                    <Badge variant="outline">{contractorsByTier.standard}</Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4 text-black dark:text-white">Recent Activity</h3>
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No recent activity
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map(activity => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {activity.type === 'job' && <Briefcase className="h-4 w-4 text-primary" />}
                          {activity.type === 'contractor' && <UserPlus className="h-4 w-4 text-primary" />}
                          {activity.type === 'completion' && <CheckCircle className="h-4 w-4 text-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Growth Opportunities */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Growth Opportunities</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-muted/50">
                <UserPlus className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold mb-1 text-black dark:text-white">Recruit Contractors</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Grow your network to increase coverage
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setReferralDialogOpen(true)}
                >
                  Get Referral Link
                </Button>
              </Card>

              <Card className="p-4 bg-muted/50">
                <Buildings className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold mb-1 text-black dark:text-white">Partner with Local Businesses</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Build relationships with hardware stores
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => onNavigate('business-tools')}
                >
                  View Toolkit
                </Button>
              </Card>

              <Card className="p-4 bg-muted/50">
                <ChartLine className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold mb-1 text-black dark:text-white">Upgrade Territory Tier</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Increase your revenue share percentage
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => onNavigate('territory-map')}
                >
                  View Requirements
                </Button>
              </Card>
            </div>
          </Card>
        </div>
      </div>

      {/* Referral Link Dialog */}
      <Dialog open={referralDialogOpen} onOpenChange={setReferralDialogOpen}>
        <DialogContent className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
          <DialogHeader>
            <DialogTitle className="text-black dark:text-white">Your Operator Referral Link</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Share this link with contractors in your territory. When they sign up using your link, they'll be connected to your territory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="referral-link" className="text-black dark:text-white">Referral Link</Label>
              <div className="flex gap-2">
                <Input
                  id="referral-link"
                  value={referralLink}
                  readOnly
                  className="font-mono text-sm bg-white dark:bg-black border border-black/20 dark:border-white/20 text-black dark:text-white"
                />
                <Button
                  onClick={handleCopyReferral}
                  variant="outline"
                  size="icon"
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <Check size={16} className="text-green-600 dark:text-green-400" weight="bold" />
                  ) : (
                    <Copy size={16} className="text-black dark:text-white" />
                  )}
                </Button>
              </div>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-900/50">
              <p className="text-sm text-black dark:text-white">
                <strong>How it works:</strong> Contractors who sign up using your referral link will be automatically assigned to your territory. This helps grow your network and increases coverage in your area.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default OperatorDashboard
