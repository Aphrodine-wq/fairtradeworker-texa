import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { useMemo } from "react"
import { motion } from "framer-motion"
import { containerVariants, itemVariants } from "@/lib/animations"

interface AdminDashboardProps {
  onNavigate: (page: string) => void
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [users] = useKV<User[]>("users", [])
  const [jobs] = useKV<Job[]>("jobs", [])
  const [currentUser] = useKV<User | null>("current-user", null)

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
                  <span className="text-blue-600 dark:text-blue-400">In Progress: {stats.inProgressJobs}</span>
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
