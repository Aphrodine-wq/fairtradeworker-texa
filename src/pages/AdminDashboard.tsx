import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { 
  Users, 
  Wrench, 
  CurrencyDollar, 
  ChartLine, 
  Shield,
  Clock,
  TrendingUp,
  Activity,
  Database,
  Server,
  Timer,
  Play,
  Pause,
  Calculator,
  Download,
  Info,
  Lightbulb,
  House,
  Hammer,
  MapTrifold,
  Receipt,
  Brain,
  FileText,
  Megaphone,
  Calendar,
  Target,
  CheckCircle,
  XCircle,
  Warning,
  Crown,
  ChartBar,
  PieChart,
  Building,
  Globe,
  Wallet,
  Graph
} from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User, Job, Invoice } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { 
  ChartContainer, 
  ChartLegend, 
  ChartLegendContent, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, BarChart, Bar } from "recharts"
import { containerVariants, itemVariants } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface AdminDashboardProps {
  onNavigate: (page: string) => void
}

// Platform features organized by category
const platformFeatures = {
  core: [
    { name: "Job Posting", icon: Wrench, description: "Multi-method job posting (voice, photo, video, text)" },
    { name: "AI Scoping", icon: Brain, description: "Smart Claude-powered job scoping and estimation" },
    { name: "Bidding System", icon: Target, description: "Real-time bidding and contractor matching" },
    { name: "Messaging", icon: FileText, description: "Direct homeowner-contractor communication" },
  ],
  contractor: [
    { name: "CRM Suite", icon: Users, description: "Full customer relationship management" },
    { name: "Smart Invoicing", icon: Receipt, description: "Automated invoicing with late fees" },
    { name: "Revenue Dashboard", icon: ChartLine, description: "Advanced analytics and projections" },
    { name: "Route Optimization", icon: MapTrifold, description: "Efficient job routing and scheduling" },
    { name: "Expense Tracking", icon: Wallet, description: "Track business expenses" },
    { name: "Document Management", icon: FileText, description: "Store and manage project documents" },
    { name: "Calendar Sync", icon: Calendar, description: "Sync with external calendars" },
    { name: "Bid Templates", icon: Target, description: "Save and reuse bid templates" },
    { name: "Quote Builder", icon: FileText, description: "Professional quote generation" },
    { name: "Change Orders", icon: FileText, description: "Manage project change orders" },
    { name: "Crew Dispatcher", icon: Users, description: "Dispatch crews to jobs" },
    { name: "Lead Import", icon: Download, description: "Import leads from external sources" },
    { name: "Seasonal Forecasting", icon: ChartBar, description: "Predict seasonal demand" },
    { name: "Priority Alerts", icon: Warning, description: "Get alerts for priority jobs" },
    { name: "Multi-Job Invoicing", icon: Receipt, description: "Invoice multiple jobs at once" },
    { name: "Profit Calculator", icon: Calculator, description: "Calculate job profitability" },
    { name: "Insurance Verification", icon: Shield, description: "Verify contractor insurance" },
    { name: "Pro Filters", icon: Target, description: "Advanced job filtering (Pro only)" },
    { name: "Custom Branding", icon: Building, description: "Brand your contractor profile" },
    { name: "AI Receptionist", icon: Brain, description: "AI-powered call handling" },
  ],
  homeowner: [
    { name: "Project Tracking", icon: ChartLine, description: "Track project progress" },
    { name: "Milestone Management", icon: Target, description: "Manage project milestones" },
    { name: "Photo Scoping", icon: Wrench, description: "AI-powered photo analysis" },
    { name: "Project Stories", icon: FileText, description: "Share project stories" },
    { name: "Seasonal Clubs", icon: Calendar, description: "Join seasonal maintenance clubs" },
  ],
  platform: [
    { name: "Territory Management", icon: MapTrifold, description: "Manage service territories" },
    { name: "Referral System", icon: Users, description: "User referral program" },
    { name: "Certification Wallet", icon: Shield, description: "Store and verify certifications" },
    { name: "Payment Processing", icon: CurrencyDollar, description: "Stripe payment integration" },
    { name: "Offline Mode", icon: Database, description: "Work offline, sync when online" },
    { name: "SMS Scoping", icon: FileText, description: "Scope jobs via SMS" },
  ]
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [users] = useKV<User[]>("users", [])
  const [jobs] = useKV<Job[]>("jobs", [])
  const [invoices] = useKV<Invoice[]>("invoices", [])
  const [currentUser] = useKV<User | null>("current-user", null)
  const [isSimRunning, setIsSimRunning] = useState(true)
  const [speed, setSpeed] = useState<number>(60)
  const [variance, setVariance] = useState<number>(35)
  
  // Simplified revenue simulation
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1)
  const [timeRange, setTimeRange] = useState<number>(5)
  const [monthlyGrowthRate, setMonthlyGrowthRate] = useState<number>(10)
  const [churnRate, setChurnRate] = useState<number>(5)

  const generateInitialSeries = useMemo(() => {
    const base = Date.now() - 29 * 1000
    let current = 20000
    return Array.from({ length: 30 }).map((_, idx) => {
      current = Math.max(8000, current + (Math.random() - 0.4) * 1500)
      return {
        time: new Date(base + idx * 1000).toLocaleTimeString("en-US", {
          minute: "2-digit",
          second: "2-digit"
        }),
        value: Math.round(current)
      }
    })
  }, [])
  const [revenueSeries, setRevenueSeries] = useState(generateInitialSeries)

  const stats = useMemo(() => {
    const totalUsers = users?.length || 0
    const totalJobs = jobs?.length || 0
    const openJobs = jobs?.filter(j => j.status === 'open').length || 0
    const completedJobsArray = jobs?.filter(j => j.status === 'completed') || []
    const completedJobs = completedJobsArray.length
    const inProgressJobs = jobs?.filter(j => j.status === 'in-progress').length || 0
    const cancelledJobs = jobs?.filter(j => j.status === 'cancelled').length || 0
    
    const homeowners = users?.filter(u => u.role === 'homeowner').length || 0
    const contractors = users?.filter(u => u.role === 'contractor').length || 0
    const operators = users?.filter(u => u.role === 'operator').length || 0
    const proUsers = users?.filter(u => u.isPro).length || 0
    const homeownerPro = users?.filter(u => u.isHomeownerPro).length || 0

    // Calculate revenue breakdown
    const totalRevenue = jobs?.reduce((sum, job) => {
      if (job.status === 'completed' && job.aiScope) {
        return sum + (job.aiScope.priceHigh || 0)
      }
      return sum
    }, 0) || 0

    // Platform fees (homeowner posting fees)
    const platformFees = completedJobsArray.reduce((sum, job) => {
      if (job.tier === 'QUICK_FIX') return sum + 15
      if (job.tier === 'STANDARD') return sum + (job.aiScope?.priceHigh || 0) * 0.03
      if (job.tier === 'MAJOR_PROJECT') return sum + (job.aiScope?.priceHigh || 0) * 0.025
      return sum + 15
    }, 0)

    // Pro subscription revenue
    const contractorProRevenue = contractors * 59 // Monthly
    const homeownerProRevenue = homeownerPro * 25 // Monthly
    const proRevenue = (contractorProRevenue + homeownerProRevenue) * 12 // Annual

    // Job statistics
    const jobsWithBids = jobs?.filter(j => j.bids && j.bids.length > 0).length || 0
    const avgBidsPerJob = totalJobs > 0 ? jobs?.reduce((sum, j) => sum + (j.bids?.length || 0), 0) / totalJobs : 0
    const jobsWithMultipleServices = jobs?.filter(j => j.selectedServices && j.selectedServices.length > 1).length || 0

    // Feature usage (simulated - would come from analytics)
    const crmUsage = contractors * 0.35 // 35% of contractors use CRM
    const invoicingUsage = contractors * 0.60 // 60% use invoicing
    const aiScopingUsage = totalJobs * 0.85 // 85% of jobs use AI scoping

    return {
      totalUsers,
      totalJobs,
      openJobs,
      completedJobs,
      inProgressJobs,
      cancelledJobs,
      homeowners,
      contractors,
      operators,
      proUsers,
      homeownerPro,
      totalRevenue,
      platformFees,
      proRevenue,
      jobsWithBids,
      avgBidsPerJob,
      jobsWithMultipleServices,
      crmUsage,
      invoicingUsage,
      aiScopingUsage
    }
  }, [users, jobs])

  const simIntervalMs = useMemo(() => {
    const minMs = 350
    const maxMs = 2000
    return Math.round(maxMs - ((speed / 100) * (maxMs - minMs)))
  }, [speed])

  useEffect(() => {
    if (!isSimRunning) return
    const id = setInterval(() => {
      setRevenueSeries((prev) => {
        const last = prev[prev.length - 1]?.value ?? 20000
        const baseDrift = 300
        const noise = (Math.random() - 0.5) * variance * 40
        const nextValue = Math.max(5000, last + baseDrift + noise)
        const nextPoint = {
          time: new Date().toLocaleTimeString("en-US", {
            minute: "2-digit",
            second: "2-digit"
          }),
          value: Math.round(nextValue)
        }
        return [...prev.slice(-29), nextPoint]
      })
    }, simIntervalMs)
    return () => clearInterval(id)
  }, [isSimRunning, variance, simIntervalMs])

  const latestRevenue = revenueSeries[revenueSeries.length - 1]?.value ?? 0
  const avgGrowth = useMemo(() => {
    if (revenueSeries.length < 2) return 0
    const first = revenueSeries[0].value
    const last = revenueSeries[revenueSeries.length - 1].value
    return ((last - first) / Math.max(first, 1)) * 100
  }, [revenueSeries])

  const recentJobs = useMemo(() => {
    return jobs?.slice(0, 5).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ) || []
  }, [jobs])

  const recentUsers = useMemo(() => {
    return users?.slice(0, 5).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    ) || []
  }, [users])

  // Calculate projected revenue
  const projectedRevenue = useMemo(() => {
    const baseMRR = latestRevenue || 20000
    const growthRate = monthlyGrowthRate / 100
    let total = 0
    let mrr = baseMRR
    for (let month = 1; month <= timeRange * 12; month++) {
      mrr *= (1 + growthRate / 12)
      total += mrr
    }
    return {
      total: total,
      yearEndMRR: (() => {
        let mrr = baseMRR
        for (let month = 1; month <= timeRange * 12; month++) {
          mrr *= (1 + growthRate / 12)
        }
        return mrr
      })()
    }
  }, [latestRevenue, timeRange, monthlyGrowthRate])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Complete platform overview and management
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Shield weight="fill" className="mr-2" size={20} />
              Admin Mode
            </Badge>
          </div>
        </motion.div>

        {/* Key Metrics - Simplified Overview */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8"
        >
          <motion.div variants={itemVariants}>
            <Card className="border-0">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users size={24} className="text-gray-400 mx-auto mb-2" weight="duotone" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Users</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-0">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Wrench size={24} className="text-gray-400 mx-auto mb-2" weight="duotone" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalJobs}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Jobs</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-0">
              <CardContent className="pt-6">
                <div className="text-center">
                  <CurrencyDollar size={24} className="text-gray-400 mx-auto mb-2" weight="duotone" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${(stats.totalRevenue / 1000).toFixed(0)}k
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Job Value</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-0">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Crown size={24} className="text-gray-400 mx-auto mb-2" weight="duotone" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.proUsers}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Pro Users</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-0">
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle size={24} className="text-green-500 mx-auto mb-2" weight="duotone" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedJobs}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Completed</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-0">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Target size={24} className="text-gray-400 mx-auto mb-2" weight="duotone" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.avgBidsPerJob.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Avg Bids</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-0">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <House size={20} />
                    Homeowners
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                      <span className="font-bold">{stats.homeowners}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Pro Members</span>
                      <span className="font-bold">{stats.homeownerPro}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Conversion</span>
                      <span className="font-bold">
                        {stats.homeowners > 0 ? ((stats.homeownerPro / stats.homeowners) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Hammer size={20} />
                    Contractors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                      <span className="font-bold">{stats.contractors}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Pro Members</span>
                      <span className="font-bold">{stats.proUsers - stats.homeownerPro}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Conversion</span>
                      <span className="font-bold">
                        {stats.contractors > 0 ? (((stats.proUsers - stats.homeownerPro) / stats.contractors) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapTrifold size={20} />
                    Operators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                      <span className="font-bold">{stats.operators}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Pro Members</span>
                      <span className="font-bold">
                        {users?.filter(u => u.role === 'operator' && u.isPro).length || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Job Status Breakdown */}
            <Card className="border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity size={20} />
                  Job Status Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.openJobs}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Open</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.inProgressJobs}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">In Progress</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completedJobs}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Completed</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.cancelledJobs}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Cancelled</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Simulation - Simplified */}
            <Card className="border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator size={20} />
                  Revenue Projections
                </CardTitle>
                <CardDescription>
                  Simplified revenue simulation and growth projections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Growth Rate</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[monthlyGrowthRate]}
                        onValueChange={(v) => setMonthlyGrowthRate(v[0])}
                        min={1}
                        max={30}
                        step={0.5}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={monthlyGrowthRate}
                        onChange={(e) => setMonthlyGrowthRate(Number(e.target.value))}
                        className="w-20"
                        min={1}
                        max={30}
                      />
                      <span className="text-sm">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Time Range</Label>
                    <Select value={timeRange.toString()} onValueChange={(v) => setTimeRange(Number(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Year</SelectItem>
                        <SelectItem value="3">3 Years</SelectItem>
                        <SelectItem value="5">5 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Simulation Speed</Label>
                    <Select value={simulationSpeed.toString()} onValueChange={(v) => setSimulationSpeed(Number(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1x</SelectItem>
                        <SelectItem value="10">10x</SelectItem>
                        <SelectItem value="25">25x</SelectItem>
                        <SelectItem value="50">50x</SelectItem>
                        <SelectItem value="100">100x ⚡</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-0 bg-muted/50">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">{timeRange}-Year Total</p>
                      <p className="text-2xl font-bold">
                        ${projectedRevenue.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 bg-muted/50">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">Year {timeRange} MRR</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${projectedRevenue.yearEndMRR.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 bg-muted/50">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">Growth Rate</p>
                      <p className="text-2xl font-bold">{monthlyGrowthRate}%</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="h-64">
                  <ChartContainer
                    config={{
                      revenue: {
                        label: "Revenue",
                        color: "hsl(140, 80%, 45%)"
                      }
                    }}
                    className="h-full w-full"
                  >
                    <LineChart data={revenueSeries}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                        tickLine={false}
                        axisLine={false}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                          />
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(140, 80%, 45%)"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0">
                <CardHeader>
                  <CardTitle>User Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <House size={20} />
                        <span>Homeowners</span>
                      </div>
                      <Badge>{stats.homeowners}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <Hammer size={20} />
                        <span>Contractors</span>
                      </div>
                      <Badge>{stats.contractors}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <MapTrifold size={20} />
                        <span>Operators</span>
                      </div>
                      <Badge>{stats.operators}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                      <div className="flex items-center gap-3">
                        <Crown size={20} />
                        <span>Pro Users</span>
                      </div>
                      <Badge variant="default">{stats.proUsers}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0">
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentUsers.length > 0 ? (
                      recentUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                        >
                          <div>
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {user.email} • {user.role}
                            </p>
                          </div>
                          {user.isPro && (
                            <Badge><Crown size={12} className="mr-1" />Pro</Badge>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-600 dark:text-gray-400 py-4">No users yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0">
                <CardHeader>
                  <CardTitle>Job Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Jobs</span>
                      <span className="font-bold">{stats.totalJobs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Jobs with Bids</span>
                      <span className="font-bold">{stats.jobsWithBids}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Avg Bids per Job</span>
                      <span className="font-bold">{stats.avgBidsPerJob.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Multi-Service Jobs</span>
                      <span className="font-bold">{stats.jobsWithMultipleServices}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                      <span className="font-bold">
                        {stats.totalJobs > 0 ? ((stats.completedJobs / stats.totalJobs) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0">
                <CardHeader>
                  <CardTitle>Recent Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentJobs.length > 0 ? (
                      recentJobs.map((job) => (
                        <div
                          key={job.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{job.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(job.createdAt).toLocaleDateString()} • {job.bids?.length || 0} bids
                            </p>
                          </div>
                          <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-600 dark:text-gray-400 py-4">No jobs yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CurrencyDollar size={20} />
                    Platform Fees
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">${stats.platformFees.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    From {stats.completedJobs} completed jobs
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown size={20} />
                    Pro Subscriptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">${stats.proRevenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Annual recurring revenue
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChartLine size={20} />
                    Total Job Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">${(stats.totalRevenue / 1000).toFixed(0)}k</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Estimated value of completed jobs
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Core Platform Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {platformFeatures.core.map((feature) => {
                    const Icon = feature.icon
                    return (
                      <Card key={feature.name} className="border-0">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Icon size={24} className="text-gray-400 mt-0.5" />
                            <div>
                              <p className="font-semibold">{feature.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Contractor Features ({platformFeatures.contractor.length} total)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {platformFeatures.contractor.map((feature) => {
                    const Icon = feature.icon
                    return (
                      <Card key={feature.name} className="border-0">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Icon size={24} className="text-gray-400 mt-0.5" />
                            <div>
                              <p className="font-semibold">{feature.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Homeowner Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {platformFeatures.homeowner.map((feature) => {
                    const Icon = feature.icon
                    return (
                      <Card key={feature.name} className="border-0">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Icon size={24} className="text-gray-400 mt-0.5" />
                            <div>
                              <p className="font-semibold">{feature.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Platform Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {platformFeatures.platform.map((feature) => {
                    const Icon = feature.icon
                    return (
                      <Card key={feature.name} className="border-0">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Icon size={24} className="text-gray-400 mt-0.5" />
                            <div>
                              <p className="font-semibold">{feature.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              <Card className="border-0 bg-blue-50 dark:bg-blue-950/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Info size={24} className="text-blue-600 dark:text-blue-400 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-2">Total Platform Features</h4>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {platformFeatures.core.length + 
                         platformFeatures.contractor.length + 
                         platformFeatures.homeowner.length + 
                         platformFeatures.platform.length} Features
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Comprehensive platform covering job posting, contractor management, homeowner tools, and business operations
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 bg-green-50 dark:bg-green-950/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Database size={24} className="text-green-600 dark:text-green-400" />
                    <span className="font-semibold">Database</span>
                  </div>
                  <Badge className="bg-green-600">Operational</Badge>
                </CardContent>
              </Card>

              <Card className="border-0 bg-green-50 dark:bg-green-950/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Server size={24} className="text-green-600 dark:text-green-400" />
                    <span className="font-semibold">API</span>
                  </div>
                  <Badge className="bg-green-600">Healthy</Badge>
                </CardContent>
              </Card>

              <Card className="border-0 bg-green-50 dark:bg-green-950/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <ChartLine size={24} className="text-green-600 dark:text-green-400" />
                    <span className="font-semibold">Performance</span>
                  </div>
                  <Badge className="bg-green-600">Optimal</Badge>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0">
              <CardHeader>
                <CardTitle>Platform Capabilities Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="font-semibold">User Management</p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• 3 user types (Homeowner, Contractor, Operator)</li>
                      <li>• Pro subscription tiers</li>
                      <li>• Referral system</li>
                      <li>• Territory management</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold">Job Management</p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Multi-method job posting</li>
                      <li>• AI-powered scoping</li>
                      <li>• Multi-service selection</li>
                      <li>• Bidding system</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold">Business Tools</p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Full CRM suite</li>
                      <li>• Smart invoicing</li>
                      <li>• Expense tracking</li>
                      <li>• Route optimization</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold">AI Features</p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• AI scoping (Claude-powered)</li>
                      <li>• AI Receptionist</li>
                      <li>• Smart bid suggestions</li>
                      <li>• Demand forecasting</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => onNavigate('home')}
            className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  )
}
