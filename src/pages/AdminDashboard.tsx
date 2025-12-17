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
  Server
} from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User, Job } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { 
  ChartContainer, 
  ChartLegend, 
  ChartLegendContent, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { containerVariants, itemVariants } from "@/lib/animations"

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

        {/* Revenue Simulation (Admin-only) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border border-black/10 dark:border-white/10">
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                  <ChartLine size={20} weight="duotone" />
                  Revenue Simulation (Admin Demo)
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Links all outcomes into one chart. Control speed & variance for testing.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">
                  <Clock className="mr-1" size={14} />
                  {simIntervalMs} ms interval
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsSimRunning((r) => !r)}
                >
                  {isSimRunning ? "Pause" : "Resume"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
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
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Users</p>
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
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
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
