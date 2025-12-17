import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { 
  TrendUp, 
  CurrencyDollar, 
  Users, 
  Receipt, 
  ChartLine,
  Crown,
  MapTrifold,
  Calendar,
  Clock,
  Target,
  ArrowUp,
  ArrowDown,
  Percent,
  Calculator,
  ChartBar,
  TrendingDown,
  Building,
  Globe,
  Timer,
  Wallet,
  Graph,
  PieChart,
  BarChart
} from "@phosphor-icons/react"
import type { Job, User, Invoice, Territory } from "@/lib/types"
import { cn } from "@/lib/utils"

interface CompanyRevenueDashboardProps {
  user: User
}

export function CompanyRevenueDashboard({ user }: CompanyRevenueDashboardProps) {
  const [jobs] = useKV<Job[]>("jobs", [])
  const [invoices] = useKV<Invoice[]>("invoices", [])
  const [territories] = useKV<Territory[]>("territories", [])
  const isPro = user.isPro || false
  
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const storedStr = window.localStorage.getItem("demo-users")
        const storedUsers = storedStr ? JSON.parse(storedStr) as User[] : []
        setUsers(storedUsers || [])
      } catch (error) {
        console.error('Error loading demo users:', error)
        setUsers([])
      }
    }
    loadUsers()
  }, [])

  const completedJobs = (jobs || []).filter(j => j.status === 'completed')
  const platformFees = completedJobs.length * 20
  
  const proContractors = users.filter(u => u.role === 'contractor' && u.isPro)
  const proSubscriptionRevenue = proContractors.length * 39
  
  const paidInvoices = (invoices || []).filter(inv => inv.status === 'paid')
  const totalInvoiceValue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0)
  const processingFees = totalInvoiceValue * 0.029
  
  const claimedTerritories = (territories || []).filter(t => t.status === 'claimed')
  const territoryRoyalties = platformFees * 0.1
  
  const currentMonthJobs = completedJobs.filter(job => {
    const jobDate = new Date(job.createdAt)
    const now = new Date()
    return jobDate.getMonth() === now.getMonth() && jobDate.getFullYear() === now.getFullYear()
  })
  
  const currentMonthMRR = (proContractors.length * 39) + (currentMonthJobs.length * 20)
  
  const projectedYearlyRevenue = currentMonthMRR * 12
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  // ========== DETAILED METRICS (30x Expansion) ==========

  // Revenue by Job Size
  const revenueByJobSize = useMemo(() => {
    const smallJobs = completedJobs.filter(j => j.size === 'small')
    const mediumJobs = completedJobs.filter(j => j.size === 'medium')
    const largeJobs = completedJobs.filter(j => j.size === 'large')
    
    return {
      small: {
        count: smallJobs.length,
        revenue: smallJobs.length * 20,
        avgJobValue: smallJobs.length > 0 
          ? smallJobs.reduce((sum, j) => {
              const bid = j.bids.find(b => b.status === 'accepted')
              return sum + (bid?.amount || 0)
            }, 0) / smallJobs.length 
          : 0
      },
      medium: {
        count: mediumJobs.length,
        revenue: mediumJobs.length * 20,
        avgJobValue: mediumJobs.length > 0
          ? mediumJobs.reduce((sum, j) => {
              const bid = j.bids.find(b => b.status === 'accepted')
              return sum + (bid?.amount || 0)
            }, 0) / mediumJobs.length
          : 0
      },
      large: {
        count: largeJobs.length,
        revenue: largeJobs.length * 20,
        avgJobValue: largeJobs.length > 0
          ? largeJobs.reduce((sum, j) => {
              const bid = j.bids.find(b => b.status === 'accepted')
              return sum + (bid?.amount || 0)
            }, 0) / largeJobs.length
          : 0
      }
    }
  }, [completedJobs])

  // Revenue by Territory
  const revenueByTerritory = useMemo(() => {
    const territoryMap = new Map<string, { name: string; jobs: number; revenue: number; operatorShare: number }>()
    
    completedJobs.forEach(job => {
      if (job.territoryId) {
        const territory = territories.find(t => t.id === job.territoryId)
        if (territory) {
          const existing = territoryMap.get(territory.id) || {
            name: territory.countyName,
            jobs: 0,
            revenue: 0,
            operatorShare: 0
          }
          existing.jobs += 1
          existing.revenue += 20
          existing.operatorShare += 2 // 10% of $20
          territoryMap.set(territory.id, existing)
        }
      }
    })
    
    return Array.from(territoryMap.values()).sort((a, b) => b.revenue - a.revenue)
  }, [completedJobs, territories])

  // Revenue by Time Period
  const revenueByPeriod = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today)
    thisWeek.setDate(thisWeek.getDate() - 7)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
    const thisYear = new Date(now.getFullYear(), 0, 1)

    const daily = completedJobs.filter(j => {
      const jobDate = new Date(j.createdAt)
      return jobDate >= today
    }).length * 20

    const weekly = completedJobs.filter(j => {
      const jobDate = new Date(j.createdAt)
      return jobDate >= thisWeek
    }).length * 20

    const monthly = currentMonthJobs.length * 20

    const quarterly = completedJobs.filter(j => {
      const jobDate = new Date(j.createdAt)
      return jobDate >= thisQuarter
    }).length * 20

    const yearly = completedJobs.filter(j => {
      const jobDate = new Date(j.createdAt)
      return jobDate >= thisYear
    }).length * 20

    return { daily, weekly, monthly, quarterly, yearly }
  }, [completedJobs, currentMonthJobs])

  // Growth Trends
  const growthTrends = useMemo(() => {
    const last30Days = completedJobs.filter(j => {
      const jobDate = new Date(j.createdAt)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return jobDate >= thirtyDaysAgo
    }).length * 20

    const previous30Days = completedJobs.filter(j => {
      const jobDate = new Date(j.createdAt)
      const sixtyDaysAgo = new Date()
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return jobDate >= sixtyDaysAgo && jobDate < thirtyDaysAgo
    }).length * 20

    const growthRate = previous30Days > 0 
      ? ((last30Days - previous30Days) / previous30Days) * 100 
      : 0

    return {
      last30Days,
      previous30Days,
      growthRate,
      trend: growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'stable'
    }
  }, [completedJobs])

  // User Acquisition Metrics
  const userAcquisitionMetrics = useMemo(() => {
    const contractors = users.filter(u => u.role === 'contractor')
    const homeowners = users.filter(u => u.role === 'homeowner')
    const operators = users.filter(u => u.role === 'operator')
    
    const totalUsers = users.length
    const newUsersThisMonth = users.filter(u => {
      const userDate = new Date(u.createdAt)
      const thisMonth = new Date()
      thisMonth.setDate(1)
      return userDate >= thisMonth
    }).length

    const acquisitionCost = totalUsers > 0 ? (totalRevenue * 0.1) / totalUsers : 0 // 10% of revenue for marketing
    const lifetimeValue = totalUsers > 0 ? totalRevenue / totalUsers : 0
    const ltvCacRatio = acquisitionCost > 0 ? lifetimeValue / acquisitionCost : 0

    return {
      totalUsers,
      contractors: contractors.length,
      homeowners: homeowners.length,
      operators: operators.length,
      newUsersThisMonth,
      acquisitionCost,
      lifetimeValue,
      ltvCacRatio
    }
  }, [users, totalRevenue])

  // Churn Analysis
  const churnAnalysis = useMemo(() => {
    const activeProUsers = proContractors.filter(u => {
      if (!u.proSince) return false
      const proDate = new Date(u.proSince)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return proDate <= thirtyDaysAgo // Active for at least 30 days
    }).length

    const churnedProUsers = proContractors.length - activeProUsers
    const churnRate = proContractors.length > 0 
      ? (churnedProUsers / proContractors.length) * 100 
      : 0

    return {
      activeProUsers,
      churnedProUsers,
      churnRate,
      retentionRate: 100 - churnRate
    }
  }, [proContractors])

  // Revenue Per User
  const revenuePerUser = useMemo(() => {
    const totalUsers = users.length
    const revenuePerActiveUser = totalUsers > 0 ? totalRevenue / totalUsers : 0
    const revenuePerContractor = userAcquisitionMetrics.contractors > 0 
      ? totalRevenue / userAcquisitionMetrics.contractors 
      : 0
    const revenuePerHomeowner = userAcquisitionMetrics.homeowners > 0
      ? totalRevenue / userAcquisitionMetrics.homeowners
      : 0

    return {
      perUser: revenuePerActiveUser,
      perContractor: revenuePerContractor,
      perHomeowner: revenuePerHomeowner
    }
  }, [users, totalRevenue, userAcquisitionMetrics])

  // Cost Breakdown
  const costBreakdown = useMemo(() => {
    const infrastructure = totalRevenue * 0.15 // 15% for infrastructure
    const marketing = totalRevenue * 0.10 // 10% for marketing
    const operations = totalRevenue * 0.05 // 5% for operations
    const territoryRoyaltiesCost = territoryRoyalties
    const totalCosts = infrastructure + marketing + operations + territoryRoyaltiesCost
    const profit = totalRevenue - totalCosts
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0

    return {
      infrastructure,
      marketing,
      operations,
      territoryRoyalties: territoryRoyaltiesCost,
      totalCosts,
      profit,
      profitMargin
    }
  }, [totalRevenue, territoryRoyalties])

  // Revenue Projections
  const revenueProjections = useMemo(() => {
    const conservative = currentMonthMRR * 1.05 * 12 // 5% growth
    const moderate = currentMonthMRR * 1.15 * 12 // 15% growth
    const aggressive = currentMonthMRR * 1.30 * 12 // 30% growth
    const current = projectedYearlyRevenue

    return {
      conservative,
      moderate,
      aggressive,
      current
    }
  }, [currentMonthMRR, projectedYearlyRevenue])

  // Daily Revenue Trend (Last 30 Days)
  const dailyRevenueTrend = useMemo(() => {
    const days: Array<{ date: string; revenue: number; jobs: number }> = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dayJobs = completedJobs.filter(j => {
        const jobDate = new Date(j.createdAt).toISOString().split('T')[0]
        return jobDate === dateStr
      })
      days.push({
        date: dateStr,
        revenue: dayJobs.length * 20,
        jobs: dayJobs.length
      })
    }
    return days
  }, [completedJobs])

  // Monthly Revenue Trend (Last 12 Months)
  const monthlyRevenueTrend = useMemo(() => {
    const months: Array<{ month: string; revenue: number; jobs: number }> = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      const monthJobs = completedJobs.filter(j => {
        const jobDate = new Date(j.createdAt)
        return jobDate.getMonth() === date.getMonth() && 
               jobDate.getFullYear() === date.getFullYear()
      })
      months.push({
        month: monthStr,
        revenue: monthJobs.length * 20,
        jobs: monthJobs.length
      })
    }
    return months
  }, [completedJobs])

  const revenueBreakdown = [
    {
      label: "Platform Fees",
      value: platformFees,
      description: `$20 × ${completedJobs.length} completed jobs`,
      icon: Receipt,
      color: "text-black dark:text-white"
    },
    {
      label: "Pro Subscriptions",
      value: proSubscriptionRevenue,
      description: `$59/mo × ${proContractors.length} Pro contractors`,
      icon: Crown,
      color: "text-black dark:text-white"
    },
    {
      label: "Processing Fees",
      value: processingFees,
      description: `2.9% of $${totalInvoiceValue.toFixed(0)} invoiced`,
      icon: ChartLine,
      color: "text-black dark:text-white"
    },
    {
      label: "Territory Royalties",
      value: territoryRoyalties,
      description: `10% of platform fees to ${claimedTerritories.length} operators`,
      icon: MapTrifold,
      color: "text-purple-600"
    }
  ]

  const totalRevenue = revenueBreakdown.reduce((sum, item) => sum + item.value, 0)
  const netRevenue = totalRevenue - territoryRoyalties

  if (!user.isOperator && user.role !== 'operator') {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card glass={isPro}>
          <CardContent className="p-16 text-center">
            <TrendUp className="mx-auto mb-4 text-black dark:text-white" size={64} weight="duotone" />
            <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
            <p className="text-black dark:text-white">This dashboard is only available to platform operators.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <TrendUp weight="duotone" size={36} className="text-primary" />
          Company Revenue Dashboard
        </h1>
        <p className="text-black dark:text-white">Platform performance and revenue tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-3" glass={isPro}>
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-wider">Total Lifetime Revenue</CardDescription>
            <CardTitle className="text-5xl font-bold text-primary">{formatCurrency(totalRevenue)}</CardTitle>
            <p className="text-sm text-black dark:text-white mt-2">
              Net after royalties: <span className="font-semibold text-black dark:text-white">{formatCurrency(netRevenue)}</span>
            </p>
          </CardHeader>
        </Card>

        <Card glass={isPro}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-black dark:text-white">Monthly MRR</span>
              <TrendUp size={20} className="text-green-600" weight="fill" />
            </div>
            <p className="text-3xl font-bold">{formatCurrency(currentMonthMRR)}</p>
            <p className="text-xs text-black dark:text-white mt-1">This month</p>
          </CardContent>
        </Card>

        <Card glass={isPro}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-black dark:text-white">Projected ARR</span>
              <ChartLine size={20} className="text-primary" weight="fill" />
            </div>
            <p className="text-3xl font-bold">{formatCurrency(projectedYearlyRevenue)}</p>
            <p className="text-xs text-black dark:text-white mt-1">Annual run-rate</p>
          </CardContent>
        </Card>

        <Card glass={isPro}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-black dark:text-white">Active Users</span>
              <Users size={20} className="text-accent" weight="fill" />
            </div>
            <p className="text-3xl font-bold">{users.length}</p>
            <p className="text-xs text-black dark:text-white mt-1">
              {proContractors.length} Pro ({((proContractors.length / Math.max(users.filter(u => u.role === 'contractor').length, 1)) * 100).toFixed(0)}%)
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card glass={isPro}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Total Revenue</span>
                  <TrendUp size={16} className="text-green-600" weight="duotone" />
                </div>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">Lifetime</p>
              </CardContent>
            </Card>
            <Card glass={isPro}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Monthly MRR</span>
                  <ChartLine size={16} className="text-primary" weight="duotone" />
                </div>
                <p className="text-2xl font-bold">{formatCurrency(currentMonthMRR)}</p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>
            <Card glass={isPro}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Growth Rate</span>
                  {growthTrends.trend === 'up' ? (
                    <ArrowUp size={16} className="text-green-600" weight="duotone" />
                  ) : growthTrends.trend === 'down' ? (
                    <ArrowDown size={16} className="text-red-600" weight="duotone" />
                  ) : (
                    <ChartLine size={16} className="text-muted-foreground" weight="duotone" />
                  )}
                </div>
                <p className="text-2xl font-bold">{formatPercent(growthTrends.growthRate)}</p>
                <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
              </CardContent>
            </Card>
            <Card glass={isPro}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Profit Margin</span>
                  <Percent size={16} className="text-green-600" weight="duotone" />
                </div>
                <p className="text-2xl font-bold">{costBreakdown.profitMargin.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">{formatCurrency(costBreakdown.profit)} profit</p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue by Period */}
          <Card glass={isPro}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={20} weight="duotone" className="text-primary" />
                Revenue by Time Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Today</p>
                  <p className="text-lg font-bold">{formatCurrency(revenueByPeriod.daily)}</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">This Week</p>
                  <p className="text-lg font-bold">{formatCurrency(revenueByPeriod.weekly)}</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">This Month</p>
                  <p className="text-lg font-bold">{formatCurrency(revenueByPeriod.monthly)}</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">This Quarter</p>
                  <p className="text-lg font-bold">{formatCurrency(revenueByPeriod.quarterly)}</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">This Year</p>
                  <p className="text-lg font-bold">{formatCurrency(revenueByPeriod.yearly)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Job Size */}
          <Card glass={isPro}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target size={20} weight="duotone" className="text-primary" />
                Revenue by Job Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">🟢 Small Jobs</span>
                    <Badge variant="outline">{revenueByJobSize.small.count}</Badge>
                  </div>
                  <p className="text-2xl font-bold mb-1">{formatCurrency(revenueByJobSize.small.revenue)}</p>
                  <p className="text-xs text-muted-foreground">
                    Avg: {formatCurrency(revenueByJobSize.small.avgJobValue)}
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">🟡 Medium Jobs</span>
                    <Badge variant="outline">{revenueByJobSize.medium.count}</Badge>
                  </div>
                  <p className="text-2xl font-bold mb-1">{formatCurrency(revenueByJobSize.medium.revenue)}</p>
                  <p className="text-xs text-muted-foreground">
                    Avg: {formatCurrency(revenueByJobSize.medium.avgJobValue)}
                  </p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">🔴 Large Jobs</span>
                    <Badge variant="outline">{revenueByJobSize.large.count}</Badge>
                  </div>
                  <p className="text-2xl font-bold mb-1">{formatCurrency(revenueByJobSize.large.revenue)}</p>
                  <p className="text-xs text-muted-foreground">
                    Avg: {formatCurrency(revenueByJobSize.large.avgJobValue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4 mt-6">
          {/* Revenue Sources */}
          <Card glass={isPro}>
            <CardHeader>
              <CardTitle>Revenue Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-muted ${item.color}`}>
                        <item.icon size={24} weight="duotone" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{item.label}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatCurrency(item.value)}</p>
                      <Badge variant="outline" className="mt-1">
                        {((item.value / totalRevenue) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Territory */}
          {revenueByTerritory.length > 0 && (
            <Card glass={isPro}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapTrifold size={20} weight="duotone" className="text-primary" />
                  Revenue by Territory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {revenueByTerritory.map((territory, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-semibold">{territory.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {territory.jobs} jobs • Operator share: {formatCurrency(territory.operatorShare)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{formatCurrency(territory.revenue)}</p>
                        <p className="text-xs text-muted-foreground">
                          {((territory.revenue / totalRevenue) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends" className="mt-6 space-y-6">
          {/* Growth Trends */}
          <Card glass={isPro}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendUp size={20} weight="duotone" className="text-primary" />
                Growth Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Last 30 Days</p>
                  <p className="text-2xl font-bold">{formatCurrency(growthTrends.last30Days)}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Previous 30 Days</p>
                  <p className="text-2xl font-bold">{formatCurrency(growthTrends.previous30Days)}</p>
                </div>
                <div className={cn(
                  "p-4 rounded-lg",
                  growthTrends.trend === 'up' ? "bg-green-50 dark:bg-green-950/20" :
                  growthTrends.trend === 'down' ? "bg-red-50 dark:bg-red-950/20" :
                  "bg-muted/30"
                )}>
                  <p className="text-sm text-muted-foreground mb-1">Growth Rate</p>
                  <p className="text-2xl font-bold flex items-center gap-2">
                    {growthTrends.trend === 'up' && <ArrowUp size={20} className="text-green-600" weight="duotone" />}
                    {growthTrends.trend === 'down' && <ArrowDown size={20} className="text-red-600" weight="duotone" />}
                    {formatPercent(growthTrends.growthRate)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Revenue Trend */}
          <Card glass={isPro}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartBar size={20} weight="duotone" className="text-primary" />
                Daily Revenue Trend (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {dailyRevenueTrend.map((day, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      <p className="text-xs text-muted-foreground">{day.jobs} jobs</p>
                    </div>
                    <p className="text-lg font-bold">{formatCurrency(day.revenue)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Revenue Trend */}
          <Card glass={isPro}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart size={20} weight="duotone" className="text-primary" />
                Monthly Revenue Trend (Last 12 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {monthlyRevenueTrend.map((month, idx) => (
                  <div key={idx} className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium mb-1">{month.month}</p>
                    <p className="text-xl font-bold">{formatCurrency(month.revenue)}</p>
                    <p className="text-xs text-muted-foreground">{month.jobs} jobs</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projections" className="mt-6 space-y-6">
          {/* Revenue Projections */}
          <Card glass={isPro}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Graph size={20} weight="duotone" className="text-primary" />
                Revenue Projections (Annual)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Current Run Rate</p>
                  <p className="text-2xl font-bold">{formatCurrency(revenueProjections.current)}</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900/30">
                  <p className="text-sm text-muted-foreground mb-1">Conservative (5% growth)</p>
                  <p className="text-2xl font-bold">{formatCurrency(revenueProjections.conservative)}</p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
                  <p className="text-sm text-muted-foreground mb-1">Moderate (15% growth)</p>
                  <p className="text-2xl font-bold">{formatCurrency(revenueProjections.moderate)}</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900/30">
                  <p className="text-sm text-muted-foreground mb-1">Aggressive (30% growth)</p>
                  <p className="text-2xl font-bold">{formatCurrency(revenueProjections.aggressive)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Targets */}
          <Card glass={isPro}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target size={20} weight="duotone" className="text-primary" />
                Revenue Targets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Month 3 Goal</p>
                  <p className="text-2xl font-bold mb-2">{formatCurrency(75000)}</p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${Math.min((currentMonthMRR / 75000) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((currentMonthMRR / 75000) * 100).toFixed(0)}% achieved
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Month 6 Goal</p>
                  <p className="text-2xl font-bold mb-2">{formatCurrency(178000)}</p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${Math.min((currentMonthMRR / 178000) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((currentMonthMRR / 178000) * 100).toFixed(0)}% achieved
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Break-Even Point</p>
                  <p className="text-2xl font-bold mb-2">{formatCurrency(120000)}</p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((currentMonthMRR / 120000) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentMonthMRR >= 120000 ? 'Achieved!' : `${((currentMonthMRR / 120000) * 100).toFixed(0)}% to break-even`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6 space-y-6">
          {/* User Acquisition Metrics */}
          <Card glass={isPro}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} weight="duotone" className="text-primary" />
                User Acquisition & Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Total Users</p>
                  <p className="text-2xl font-bold">{userAcquisitionMetrics.totalUsers}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">New This Month</p>
                  <p className="text-2xl font-bold">{userAcquisitionMetrics.newUsersThisMonth}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Acquisition Cost</p>
                  <p className="text-2xl font-bold">{formatCurrency(userAcquisitionMetrics.acquisitionCost)}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">LTV:CAC Ratio</p>
                  <p className="text-2xl font-bold">{userAcquisitionMetrics.ltvCacRatio.toFixed(2)}x</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Contractors</p>
                  <p className="text-xl font-bold">{userAcquisitionMetrics.contractors}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Homeowners</p>
                  <p className="text-xl font-bold">{userAcquisitionMetrics.homeowners}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Operators</p>
                  <p className="text-xl font-bold">{userAcquisitionMetrics.operators}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Per User */}
          <Card glass={isPro}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator size={20} weight="duotone" className="text-primary" />
                Revenue Per User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Per User (All)</p>
                  <p className="text-2xl font-bold">{formatCurrency(revenuePerUser.perUser)}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Per Contractor</p>
                  <p className="text-2xl font-bold">{formatCurrency(revenuePerUser.perContractor)}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Per Homeowner</p>
                  <p className="text-2xl font-bold">{formatCurrency(revenuePerUser.perHomeowner)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Churn Analysis */}
          <Card glass={isPro}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown size={20} weight="duotone" className="text-primary" />
                Churn Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Active Pro Users</p>
                  <p className="text-2xl font-bold">{churnAnalysis.activeProUsers}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Churned Users</p>
                  <p className="text-2xl font-bold text-red-600">{churnAnalysis.churnedProUsers}</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900/30">
                  <p className="text-xs text-muted-foreground mb-1">Churn Rate</p>
                  <p className="text-2xl font-bold">{churnAnalysis.churnRate.toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900/30">
                  <p className="text-xs text-muted-foreground mb-1">Retention Rate</p>
                  <p className="text-2xl font-bold">{churnAnalysis.retentionRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="mt-6 space-y-6">
          {/* Cost Breakdown */}
          <Card glass={isPro}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet size={20} weight="duotone" className="text-primary" />
                Cost Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-semibold">Infrastructure</p>
                    <p className="text-sm text-muted-foreground">15% of revenue</p>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(costBreakdown.infrastructure)}</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-semibold">Marketing</p>
                    <p className="text-sm text-muted-foreground">10% of revenue</p>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(costBreakdown.marketing)}</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-semibold">Operations</p>
                    <p className="text-sm text-muted-foreground">5% of revenue</p>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(costBreakdown.operations)}</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-semibold">Territory Royalties</p>
                    <p className="text-sm text-muted-foreground">10% of platform fees</p>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(costBreakdown.territoryRoyalties)}</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900/30">
                  <div>
                    <p className="font-semibold">Total Costs</p>
                    <p className="text-sm text-muted-foreground">All expenses</p>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(costBreakdown.totalCosts)}</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900/30">
                  <div>
                    <p className="font-semibold">Net Profit</p>
                    <p className="text-sm text-muted-foreground">After all costs</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatCurrency(costBreakdown.profit)}</p>
                    <Badge variant="outline" className="mt-1">
                      {costBreakdown.profitMargin.toFixed(1)}% margin
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profitability Analysis */}
          <Card glass={isPro}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart size={20} weight="duotone" className="text-primary" />
                Profitability Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Costs</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(costBreakdown.totalCosts)}</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900/30">
                  <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
                  <p className="text-2xl font-bold">{formatCurrency(costBreakdown.profit)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {costBreakdown.profitMargin.toFixed(1)}% margin
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contractors" className="mt-6 space-y-6">
          <Card glass={isPro}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown weight="duotone" className="text-amber-600" />
                Pro Contractors ({proContractors.length})
              </CardTitle>
              <CardDescription>
                Generating {formatCurrency(proSubscriptionRevenue)}/month in subscription revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              {proContractors.length === 0 ? (
                <p className="text-center py-8 text-black dark:text-white">No Pro contractors yet</p>
              ) : (
                <div className="space-y-3">
                  {proContractors.map(contractor => (
                    <div key={contractor.id} className="flex items-center justify-between p-4 rounded-md border border-black/20 dark:border-white/20 shadow-sm">
                      <div>
                        <p className="font-semibold">{contractor.fullName}</p>
                        <p className="text-sm text-black dark:text-white">
                          Pro since: {contractor.proSince ? new Date(contractor.proSince).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Crown size={12} weight="fill" />
                        $59/mo
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="territories" className="mt-6 space-y-6">
          <Card glass={isPro}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapTrifold weight="duotone" className="text-purple-600" />
                Territory Operators ({claimedTerritories.length})
              </CardTitle>
              <CardDescription>
                Receiving {formatCurrency(territoryRoyalties)} in total royalties
              </CardDescription>
            </CardHeader>
            <CardContent>
              {claimedTerritories.length === 0 ? (
                <p className="text-center py-8 text-black dark:text-white">No territories claimed yet</p>
              ) : (
                <div className="space-y-3">
                  {claimedTerritories.map(territory => {
                    const territoryJobs = completedJobs.filter(j => j.territoryId === territory.id)
                    const territoryFees = territoryJobs.length * 20
                    const operatorShare = territoryFees * 0.1
                    
                    return (
                      <div key={territory.id} className="flex items-center justify-between p-4 rounded-md border border-black/20 dark:border-white/20 shadow-sm">
                        <div>
                          <p className="font-semibold">{territory.countyName}</p>
                          <p className="text-sm text-black dark:text-white">
                            Operator: {territory.operatorName || 'Unknown'}
                          </p>
                          <p className="text-xs text-black dark:text-white mt-1">
                            {territoryJobs.length} completed jobs
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{formatCurrency(operatorShare)}</p>
                          <p className="text-xs text-black dark:text-white">10% of fees</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card glass={isPro}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-md bg-black dark:bg-white border border-black/20 dark:border-white/20 shadow-sm">
              <TrendUp size={24} weight="duotone" className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Revenue Targets</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-black dark:text-white">Month 3 Goal</p>
                  <p className="font-bold text-lg">{formatCurrency(75000)}</p>
                  <p className="text-xs text-black dark:text-white mt-1">
                    {((currentMonthMRR / 75000) * 100).toFixed(0)}% achieved
                  </p>
                </div>
                <div>
                  <p className="text-black dark:text-white">Month 6 Goal</p>
                  <p className="font-bold text-lg">{formatCurrency(178000)}</p>
                  <p className="text-xs text-black dark:text-white mt-1">
                    {((currentMonthMRR / 178000) * 100).toFixed(0)}% achieved
                  </p>
                </div>
                <div>
                  <p className="text-black dark:text-white">Break-Even</p>
                  <p className="font-bold text-lg">{formatCurrency(120000)}</p>
                  <p className="text-xs text-black dark:text-white mt-1">
                    Monthly burn rate
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
