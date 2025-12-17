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
  Lightbulb
} from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User, Job } from "@/lib/types"
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
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { containerVariants, itemVariants } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface AdminDashboardProps {
  onNavigate: (page: string) => void
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [users] = useKV<User[]>("users", [])
  const [jobs] = useKV<Job[]>("jobs", [])
  const [currentUser] = useKV<User | null>("current-user", null)
  const [isSimRunning, setIsSimRunning] = useState(true)
  const [speed, setSpeed] = useState<number>(60)
  const [variance, setVariance] = useState<number>(35)
  
  // Comprehensive revenue simulation controls for investors
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1) // 1x, 2x, 5x, 10x
  const [timeRange, setTimeRange] = useState<number>(5) // 1, 3, or 5 years
  const [monthlyGrowthRate, setMonthlyGrowthRate] = useState<number>(10) // percentage
  const [churnRate, setChurnRate] = useState<number>(5) // percentage
  const [selectedScenario, setSelectedScenario] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate')

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
    const completedJobs = jobs?.filter(j => j.status === 'completed').length || 0
    const inProgressJobs = jobs?.filter(j => j.status === 'in-progress').length || 0
    
    const homeowners = users?.filter(u => u.role === 'homeowner').length || 0
    const contractors = users?.filter(u => u.role === 'contractor').length || 0
    const operators = users?.filter(u => u.role === 'operator').length || 0
    const proUsers = users?.filter(u => u.isPro).length || 0

    // Calculate total revenue (mock - would come from actual payment data)
    const totalRevenue = jobs?.reduce((sum, job) => {
      if (job.status === 'completed' && job.aiScope) {
        return sum + (job.aiScope.priceHigh || 0)
      }
      return sum
    }, 0) || 0

    return {
      totalUsers,
      totalJobs,
      openJobs,
      completedJobs,
      inProgressJobs,
      homeowners,
      contractors,
      operators,
      proUsers,
      totalRevenue
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
  const projectedRunRate = useMemo(() => {
    return latestRevenue * 12
  }, [latestRevenue])

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full">
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
                Platform overview and management
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Shield weight="fill" className="mr-2" size={20} />
              Admin Mode
            </Badge>
          </div>
        </motion.div>

        {/* Revenue Simulation (Admin-only) - Enhanced for Investors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-2 border-transparent dark:border-white">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                <Calculator size={20} weight="duotone" className="text-primary" />
                Revenue Simulation Controls (Investor Demo)
              </CardTitle>
              <CardDescription>
                Comprehensive controls to demonstrate revenue projections and growth scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Simulation Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Simulation Speed</Label>
                  <Select value={simulationSpeed.toString()} onValueChange={(v) => setSimulationSpeed(Number(v))}>
                    <SelectTrigger className="bg-white dark:bg-black border-transparent dark:border-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1x Speed</SelectItem>
                      <SelectItem value="2">2x Speed</SelectItem>
                      <SelectItem value="5">5x Speed</SelectItem>
                      <SelectItem value="10">10x Speed</SelectItem>
                      <SelectItem value="25">25x Speed</SelectItem>
                      <SelectItem value="50">50x Speed</SelectItem>
                      <SelectItem value="100">100x Speed ⚡</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Time Range</Label>
                  <Select value={timeRange.toString()} onValueChange={(v) => setTimeRange(Number(v))}>
                    <SelectTrigger className="bg-white dark:bg-black border-transparent dark:border-white">
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
                  <Label className="text-sm font-semibold">Monthly Growth Rate</Label>
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
                      className="w-20 bg-white dark:bg-black border-transparent dark:border-white"
                      min={1}
                      max={30}
                      step={0.5}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Churn Rate</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[churnRate]}
                      onValueChange={(v) => setChurnRate(v[0])}
                      min={0}
                      max={20}
                      step={0.5}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={churnRate}
                      onChange={(e) => setChurnRate(Number(e.target.value))}
                      className="w-20 bg-white dark:bg-black border-transparent dark:border-white"
                      min={0}
                      max={20}
                      step={0.5}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-4 p-4 bg-muted/30 rounded-lg">
                <Button
                  variant="outline"
                  onClick={() => setIsSimRunning(!isSimRunning)}
                  className="bg-white dark:bg-black border-transparent dark:border-white"
                >
                  {isSimRunning ? <Pause size={16} className="mr-2" /> : <Play size={16} className="mr-2" />}
                  {isSimRunning ? 'Pause' : 'Play'} Simulation
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMonthlyGrowthRate(10)
                    setChurnRate(5)
                    setTimeRange(5)
                    setSimulationSpeed(1)
                    setSpeed(60)
                    setVariance(35)
                  }}
                  className="bg-white dark:bg-black border-transparent dark:border-white"
                >
                  Reset to Defaults
                </Button>
              </div>

              {/* Growth Scenario Selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card 
                  className={cn(
                    "border-2 cursor-pointer transition-colors",
                    selectedScenario === 'conservative' 
                      ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                      : "border-transparent dark:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
                  )}
                  onClick={() => {
                    setSelectedScenario('conservative')
                    setMonthlyGrowthRate(5)
                  }}
                >
                  <CardContent className="p-4 text-center">
                    <h3 className="font-bold mb-2">Conservative</h3>
                    <p className="text-sm mb-2">5% monthly growth</p>
                    <p className="text-xs opacity-80">Steady, sustainable expansion</p>
                  </CardContent>
                </Card>
                <Card 
                  className={cn(
                    "border-2 cursor-pointer transition-colors",
                    selectedScenario === 'moderate' 
                      ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                      : "border-transparent dark:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
                  )}
                  onClick={() => {
                    setSelectedScenario('moderate')
                    setMonthlyGrowthRate(10)
                  }}
                >
                  <CardContent className="p-4 text-center">
                    <h3 className="font-bold mb-2">Moderate</h3>
                    <p className="text-sm mb-2">10% monthly growth</p>
                    <p className="text-xs opacity-80">Balanced growth strategy</p>
                  </CardContent>
                </Card>
                <Card 
                  className={cn(
                    "border-2 cursor-pointer transition-colors",
                    selectedScenario === 'aggressive' 
                      ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                      : "border-transparent dark:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
                  )}
                  onClick={() => {
                    setSelectedScenario('aggressive')
                    setMonthlyGrowthRate(15)
                  }}
                >
                  <CardContent className="p-4 text-center">
                    <h3 className="font-bold mb-2">Aggressive</h3>
                    <p className="text-sm mb-2">15% monthly growth</p>
                    <p className="text-xs opacity-80">Rapid market expansion</p>
                  </CardContent>
                </Card>
              </div>

              {/* Real-time Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3">
                  <ChartContainer
                    config={{
                      revenue: {
                        label: "Revenue",
                        color: "hsl(140, 80%, 45%)"
                      }
                    }}
                    className="rounded-xl border border-border bg-white/80 dark:bg-black/80 p-3"
                  >
                    <LineChart data={revenueSeries} margin={{ left: 12, right: 12, top: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={20}
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                        width={60}
                        tickLine={false}
                        axisLine={false}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            labelFormatter={(label) => <span className="font-semibold text-xs">{label}</span>}
                            formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                          />
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="var(--color-revenue)"
                        strokeWidth={3}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                    </LineChart>
                  </ChartContainer>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-lg border border-border bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Latest point</p>
                    <p className="text-2xl font-semibold">${latestRevenue.toLocaleString()}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {avgGrowth >= 0 ? "+" : ""}
                      {avgGrowth.toFixed(1)}% over window
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Projected run rate</p>
                    <p className="text-xl font-semibold">${projectedRunRate.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Assumes latest point x12</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Chart Speed</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span>Speed</span>
                        <span>{speed}</span>
                      </div>
                      <Slider
                        value={[speed]}
                        min={1}
                        max={100}
                        step={1}
                        onValueChange={([v]) => setSpeed(v)}
                      />
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Variance</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span>Variance</span>
                        <span>{variance}</span>
                      </div>
                      <Slider
                        value={[variance]}
                        min={5}
                        max={100}
                        step={1}
                        onValueChange={([v]) => setVariance(v)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Projected Revenue Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-2 border-transparent dark:border-white">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">{timeRange}-Year Total</p>
                    <p className="text-xl font-bold text-primary">
                      ${(() => {
                        const baseMRR = latestRevenue || 20000
                        const growthRate = monthlyGrowthRate / 100
                        let total = 0
                        let mrr = baseMRR
                        for (let month = 1; month <= timeRange * 12; month++) {
                          mrr *= (1 + growthRate / 12)
                          total += mrr
                        }
                        return total.toLocaleString(undefined, { maximumFractionDigits: 0 })
                      })()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Cumulative revenue</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-transparent dark:border-white">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">Year {timeRange} MRR</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      ${(() => {
                        const baseMRR = latestRevenue || 20000
                        const growthRate = monthlyGrowthRate / 100
                        let mrr = baseMRR
                        for (let month = 1; month <= timeRange * 12; month++) {
                          mrr *= (1 + growthRate / 12)
                        }
                        return mrr.toLocaleString(undefined, { maximumFractionDigits: 0 })
                      })()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Monthly recurring</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-transparent dark:border-white">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">Growth Rate</p>
                    <p className="text-xl font-bold text-black dark:text-white">
                      {monthlyGrowthRate}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Per month</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-transparent dark:border-white">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">Churn Rate</p>
                    <p className="text-xl font-bold text-black dark:text-white">
                      {churnRate}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Monthly</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Insights Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <Card className="border-2 border-transparent dark:border-white bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-blue-600 dark:bg-blue-400">
                  <Lightbulb size={24} className="text-white dark:text-black" weight="duotone" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Quick Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Platform Health</p>
                      <p className="font-bold text-lg text-green-600 dark:text-green-400">Excellent</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">All systems operational</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Growth Trend</p>
                      <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                        {avgGrowth >= 0 ? '+' : ''}{avgGrowth.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Last 30 data points</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">User Engagement</p>
                      <p className="font-bold text-lg text-purple-600 dark:text-purple-400">
                        {stats.proUsers > 0 ? ((stats.proUsers / stats.totalUsers) * 100).toFixed(1) : 0}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Pro conversion rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Users</p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info size={14} className="text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Total number of registered users across all roles (homeowners, contractors, operators)
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                  </div>
                  <Users size={32} className="text-gray-400" weight="duotone" />
                </div>
                <div className="mt-4 flex gap-4 text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Homeowners: {stats.homeowners}</span>
                  <span className="text-gray-600 dark:text-gray-400">Contractors: {stats.contractors}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Jobs</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalJobs}</p>
                  </div>
                  <Wrench size={32} className="text-gray-400" weight="duotone" />
                </div>
                <div className="mt-4 flex gap-4 text-xs">
                  <span className="text-green-600 dark:text-green-400">Open: {stats.openJobs}</span>
                  <span className="text-amber-600 dark:text-amber-400">In Progress: {stats.inProgressJobs}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info size={14} className="text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Cumulative revenue from completed jobs with AI scoping. Based on high-end price estimates.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${(stats.totalRevenue / 1000).toFixed(1)}k
                    </p>
                  </div>
                  <CurrencyDollar size={32} className="text-gray-400" weight="duotone" />
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <TrendingUp size={12} />
                  <span>Platform activity</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pro Users</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.proUsers}</p>
                  </div>
                  <Shield size={32} className="text-gray-400" weight="duotone" />
                </div>
                <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
                  {stats.totalUsers > 0 
                    ? `${((stats.proUsers / stats.totalUsers) * 100).toFixed(1)}% conversion`
                    : '0% conversion'
                  }
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity size={20} weight="duotone" />
                  Recent Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentJobs.length > 0 ? (
                    recentJobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{job.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(job.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                          {job.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                      No jobs yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={20} weight="duotone" />
                  Recent Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers.length > 0 ? (
                    recentUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{user.fullName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {user.email} • {user.role}
                          </p>
                        </div>
                        {user.isPro && (
                          <Badge variant="default">
                            <Shield size={12} className="mr-1" />
                            Pro
                          </Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                      No users yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server size={20} weight="duotone" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Database size={20} className="text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-green-900 dark:text-green-100">Database</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">Operational</p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Server size={20} className="text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-green-900 dark:text-green-100">API</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">Healthy</p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <ChartLine size={20} className="text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-green-900 dark:text-green-100">Performance</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">Optimal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

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
