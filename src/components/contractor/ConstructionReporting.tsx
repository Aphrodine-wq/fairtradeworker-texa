import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ChartLine, TrendingUp, Calendar, DollarSign,
  Hammer, Clock, Target, Download
} from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User, Job, Invoice, Milestone } from "@/lib/types"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle } from "@phosphor-icons/react"

interface ConstructionReportingProps {
  user: User
}

export function ConstructionReporting({ user }: ConstructionReportingProps) {
  const [jobs] = useKV<Job[]>("jobs", [])
  const [invoices] = useKV<Invoice[]>("invoices", [])
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  const myProjects = useMemo(() => {
    return jobs.filter(job =>
      job.bids.some(b => b.contractorId === user.id && b.status === 'accepted')
    )
  }, [jobs, user.id])

  const myInvoices = useMemo(() => {
    return (invoices || []).filter(inv => inv.contractorId === user.id)
  }, [invoices, user.id])

  const projectLifecycle = useMemo(() => {
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const periodProjects = myProjects.filter(job => new Date(job.createdAt) >= startDate)
    
    const avgDaysToStart = periodProjects
      .filter(j => j.status !== 'open')
      .reduce((sum, job) => {
        const bid = job.bids.find(b => b.contractorId === user.id && b.status === 'accepted')
        if (!bid) return sum
        const bidDate = new Date(bid.createdAt || job.createdAt)
        const startDate = new Date(job.createdAt)
        return sum + Math.max(0, (startDate.getTime() - bidDate.getTime()) / (1000 * 60 * 60 * 24))
      }, 0) / Math.max(1, periodProjects.filter(j => j.status !== 'open').length)

    const avgProjectDuration = periodProjects
      .filter(j => j.status === 'completed')
      .reduce((sum, job) => {
        const created = new Date(job.createdAt)
        const completed = new Date(job.createdAt) // In real app, use actual completion date
        return sum + (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      }, 0) / Math.max(1, periodProjects.filter(j => j.status === 'completed').length)

    return {
      totalProjects: periodProjects.length,
      completed: periodProjects.filter(j => j.status === 'completed').length,
      inProgress: periodProjects.filter(j => j.status === 'in-progress').length,
      avgDaysToStart: Math.round(avgDaysToStart),
      avgProjectDuration: Math.round(avgProjectDuration),
      completionRate: periodProjects.length > 0
        ? (periodProjects.filter(j => j.status === 'completed').length / periodProjects.length) * 100
        : 0
    }
  }, [myProjects, timeRange, user.id])

  const jobProfitability = useMemo(() => {
    return myProjects.map(job => {
      const bid = job.bids.find(b => b.contractorId === user.id && b.status === 'accepted')
      const contractValue = bid?.amount || 0
      
      const expenses = (job.milestones || []).reduce((sum, milestone) => {
        const milestoneExpenses = milestone.expenses || []
        return sum + milestoneExpenses.reduce((expSum, exp) => expSum + exp.amount, 0)
      }, 0)

      const jobInvoices = myInvoices.filter(inv => inv.jobId === job.id)
      const paid = jobInvoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0)

      const profit = paid - expenses
      const margin = contractValue > 0 ? (profit / contractValue) * 100 : 0

      return {
        jobId: job.id,
        jobTitle: job.title,
        contractValue,
        expenses,
        paid,
        profit,
        margin,
        status: job.status,
        completionDate: job.status === 'completed' ? job.createdAt : null
      }
    })
  }, [myProjects, myInvoices, user.id])

  const salesForecast = useMemo(() => {
    const completedProjects = myProjects.filter(j => j.status === 'completed')
    const avgProjectValue = completedProjects.length > 0
      ? completedProjects.reduce((sum, job) => {
          const bid = job.bids.find(b => b.contractorId === user.id && b.status === 'accepted')
          return sum + (bid?.amount || 0)
        }, 0) / completedProjects.length
      : 0

    const activeProjects = myProjects.filter(j => j.status === 'in-progress')
    const pipelineValue = activeProjects.reduce((sum, job) => {
      const bid = job.bids.find(b => b.contractorId === user.id && b.status === 'accepted')
      return sum + (bid?.amount || 0)
    }, 0)

    const monthlyAvg = completedProjects.length > 0
      ? completedProjects.length / Math.max(1, (new Date().getTime() - new Date(completedProjects[0]?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 30))
      : 0

    const nextMonthForecast = monthlyAvg * avgProjectValue
    const nextQuarterForecast = monthlyAvg * 3 * avgProjectValue

    return {
      avgProjectValue,
      pipelineValue,
      monthlyAvg: Math.round(monthlyAvg * 10) / 10,
      nextMonthForecast: Math.round(nextMonthForecast),
      nextQuarterForecast: Math.round(nextQuarterForecast),
      confidence: Math.min(85, 50 + (completedProjects.length * 2))
    }
  }, [myProjects, user.id])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
            <ChartLine weight="duotone" size={28} className="text-black dark:text-white" />
            Construction Reporting & Forecasting
          </h2>
          <p className="text-muted-foreground mt-1">
            Data-driven insights into sales, job profitability, and future business
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="lifecycle" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lifecycle">Project Lifecycle</TabsTrigger>
          <TabsTrigger value="profitability">Job Profitability</TabsTrigger>
          <TabsTrigger value="forecasting">Sales Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="lifecycle" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Hammer weight="duotone" size={24} className="text-black dark:text-white" />
                  <span className="text-xs text-muted-foreground">Total Projects</span>
                </div>
                <div className="text-2xl font-bold text-black dark:text-white">
                  {projectLifecycle.totalProjects}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle weight="duotone" size={24} className="text-green-500" />
                  <span className="text-xs text-muted-foreground">Completed</span>
                </div>
                <div className="text-2xl font-bold text-green-500">
                  {projectLifecycle.completed}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Clock weight="duotone" size={24} className="text-blue-500" />
                  <span className="text-xs text-muted-foreground">Avg Days to Start</span>
                </div>
                <div className="text-2xl font-bold text-blue-500">
                  {projectLifecycle.avgDaysToStart}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Calendar weight="duotone" size={24} className="text-purple-500" />
                  <span className="text-xs text-muted-foreground">Avg Duration</span>
                </div>
                <div className="text-2xl font-bold text-purple-500">
                  {projectLifecycle.avgProjectDuration}
                </div>
                <div className="text-xs text-muted-foreground mt-1">days</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
            <CardHeader>
              <CardTitle>Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Projects Completed</span>
                  <span className="text-lg font-bold text-black dark:text-white">
                    {projectLifecycle.completionRate.toFixed(1)}%
                  </span>
                </div>
                <Progress value={projectLifecycle.completionRate} className="h-3" />
                <div className="text-xs text-muted-foreground">
                  {projectLifecycle.completed} of {projectLifecycle.totalProjects} projects completed
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profitability" className="space-y-6 mt-6">
          <div className="space-y-4">
            {jobProfitability
              .sort((a, b) => b.profit - a.profit)
              .map(job => (
                <Card key={job.jobId} className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{job.jobTitle}</CardTitle>
                      <Badge
                        variant={job.margin >= 20 ? 'default' : job.margin >= 10 ? 'outline' : 'destructive'}
                      >
                        {job.margin.toFixed(1)}% margin
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Contract Value</div>
                        <div className="text-sm font-semibold text-black dark:text-white">
                          ${job.contractValue.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Expenses</div>
                        <div className="text-sm font-semibold text-red-500">
                          ${job.expenses.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Paid</div>
                        <div className="text-sm font-semibold text-green-500">
                          ${job.paid.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Profit</div>
                        <div className={`text-sm font-semibold ${job.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          ${job.profit.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Status</div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {job.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
              <CardHeader>
                <CardTitle className="text-lg">Next Month Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black dark:text-white mb-2">
                  ${salesForecast.nextMonthForecast.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Based on {salesForecast.monthlyAvg} projects/month avg
                </div>
                <Progress value={salesForecast.confidence} className="h-2 mt-3" />
                <div className="text-xs text-muted-foreground mt-1">
                  {salesForecast.confidence}% confidence
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
              <CardHeader>
                <CardTitle className="text-lg">Next Quarter Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black dark:text-white mb-2">
                  ${salesForecast.nextQuarterForecast.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Based on {salesForecast.monthlyAvg} projects/month avg
                </div>
                <Progress value={salesForecast.confidence} className="h-2 mt-3" />
                <div className="text-xs text-muted-foreground mt-1">
                  {salesForecast.confidence}% confidence
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border border-black/20 dark:border-white/20">
              <CardHeader>
                <CardTitle className="text-lg">Pipeline Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black dark:text-white mb-2">
                  ${salesForecast.pipelineValue.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active projects in progress
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Avg project value: ${salesForecast.avgProjectValue.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
