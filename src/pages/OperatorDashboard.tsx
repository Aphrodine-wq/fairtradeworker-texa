import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SkeletonLoader } from "@/components/ui/SkeletonLoader"
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
  Check,
  Wrench,
  BarChart
} from "@phosphor-icons/react"
import type { User, Job, Territory } from "@/lib/types"
import { useMemo, useState, useEffect } from "react"
import { OperatorProductivityDashboard } from "@/components/operator/OperatorProductivityDashboard"
import { OperatorCRM } from "@/components/operator/OperatorCRM"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


interface OperatorDashboardProps {
  user: User
  onNavigate: (page: string) => void
}

export function OperatorDashboard({ user, onNavigate }: OperatorDashboardProps) {
  const [jobs, , jobsLoading] = useKV<Job[]>("jobs", [])
  const [territories, , territoriesLoading] = useKV<Territory[]>("territories", [])
  const [isInitializing, setIsInitializing] = useState(true)

  // Simulate initial loading
  useEffect(() => {
    if (!jobsLoading && !territoriesLoading) {
      const timer = setTimeout(() => setIsInitializing(false), 500)
      return () => clearTimeout(timer)
    }
  }, [jobsLoading, territoriesLoading])
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

  if (isInitializing) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full px-4 md:px-8 pt-10 pb-12">
        <Tabs defaultValue="overview" className="w-full">
          <div className="flex items-center justify-between mb-6">
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

          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="productivity">Productivity Tools</TabsTrigger>
            <TabsTrigger value="crm">Operator CRM</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="flex flex-col gap-6">
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

              {/* Quick Actions */}
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-black dark:text-white">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <Card className="p-6 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => onNavigate('browse-jobs')}>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-md bg-black dark:bg-white border border-black/20 dark:border-white/20 flex items-center justify-center shadow-sm">
                        <Wrench className="h-6 w-6 text-primary" weight="duotone" />
                      </div>
                      <div>
                        <p className="font-semibold">Browse Jobs</p>
                        <p className="text-sm text-muted-foreground">Find opportunities</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => onNavigate('territory-map')}>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-md bg-black dark:bg-white border border-black/20 dark:border-white/20 flex items-center justify-center shadow-sm">
                        <MapTrifold className="h-6 w-6 text-primary" weight="duotone" />
                      </div>
                      <div>
                        <p className="font-semibold">Territory Map</p>
                        <p className="text-sm text-muted-foreground">View coverage</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => {
                      const tabs = document.querySelector('[value="productivity"]') as HTMLElement
                      if (tabs) tabs.click()
                    }}>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-md bg-black dark:bg-white border border-black/20 dark:border-white/20 flex items-center justify-center shadow-sm">
                        <Target className="h-6 w-6 text-primary" weight="duotone" />
                      </div>
                      <div>
                        <p className="font-semibold">Productivity Tools</p>
                        <p className="text-sm text-muted-foreground">Optimize workflow</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => setReferralDialogOpen(true)}>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-md bg-black dark:bg-white border border-black/20 dark:border-white/20 flex items-center justify-center shadow-sm">
                        <UserPlus className="h-6 w-6 text-primary" weight="duotone" />
                      </div>
                      <div>
                        <p className="font-semibold">Referral Link</p>
                        <p className="text-sm text-muted-foreground">Grow network</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => onNavigate('dashboard')}>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-md bg-black dark:bg-white border border-black/20 dark:border-white/20 flex items-center justify-center shadow-sm">
                        <BarChart className="h-6 w-6 text-primary" weight="duotone" />
                      </div>
                      <div>
                        <p className="font-semibold">Analytics</p>
                        <p className="text-sm text-muted-foreground">View insights</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
              </div>
          </TabsContent>

          <TabsContent value="productivity">
            <OperatorProductivityDashboard 
              user={user} 
              jobs={territoryJobs}
              contractors={territoryContractors}
            />
          </TabsContent>

          <TabsContent value="crm">
            <OperatorCRM 
              jobs={territoryJobs}
              contractors={territoryContractors}
              homeowners={territoryHomeowners}
            />
          </TabsContent>
        </Tabs>
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
