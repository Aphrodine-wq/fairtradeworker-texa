import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartLine, TrendingUp, CurrencyDollar, FileText, Download } from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User, Job, Invoice } from "@/lib/types"

export function ReportingSuite({ user }: { user: User }) {
  const [jobs] = useKV<Job[]>("jobs", [])
  const [invoices] = useKV<Invoice[]>("invoices", [])
  const [reportType, setReportType] = useState<'financial' | 'performance' | 'operational'>('financial')
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  const myJobs = useMemo(() => 
    (jobs || []).filter(j => 
      j.bids.some(b => b.contractorId === user.id && b.status === 'accepted')
    ),
    [jobs, user.id]
  )

  const myInvoices = useMemo(() => 
    (invoices || []).filter(inv => inv.contractorId === user.id),
    [invoices, user.id]
  )

  const financialReport = useMemo(() => {
    const now = new Date()
    const startDate = new Date()
    if (period === 'week') startDate.setDate(now.getDate() - 7)
    else if (period === 'month') startDate.setMonth(now.getMonth() - 1)
    else if (period === 'quarter') startDate.setMonth(now.getMonth() - 3)
    else startDate.setFullYear(now.getFullYear() - 1)

    const periodInvoices = myInvoices.filter(inv => 
      new Date(inv.createdAt) >= startDate
    )

    const totalRevenue = periodInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0)

    const pendingRevenue = periodInvoices
      .filter(inv => inv.status !== 'paid')
      .reduce((sum, inv) => sum + inv.total, 0)

    const invoiceCount = periodInvoices.length
    const paidCount = periodInvoices.filter(inv => inv.status === 'paid').length

    return {
      totalRevenue,
      pendingRevenue,
      invoiceCount,
      paidCount,
      avgInvoiceValue: invoiceCount > 0 ? totalRevenue / paidCount : 0
    }
  }, [myInvoices, period])

  const performanceReport = useMemo(() => {
    const completedJobs = myJobs.filter(j => j.status === 'completed')
    const activeJobs = myJobs.filter(j => j.status === 'in-progress')
    const totalBids = (jobs || []).reduce((sum, job) => 
      sum + job.bids.filter(b => b.contractorId === user.id).length, 0
    )
    const acceptedBids = myJobs.length

    return {
      completedJobs: completedJobs.length,
      activeJobs: activeJobs.length,
      totalBids,
      acceptedBids,
      winRate: totalBids > 0 ? (acceptedBids / totalBids) * 100 : 0,
      avgJobValue: completedJobs.length > 0
        ? completedJobs.reduce((sum, job) => {
            const bid = job.bids.find(b => b.contractorId === user.id && b.status === 'accepted')
            return sum + (bid?.amount || 0)
          }, 0) / completedJobs.length
        : 0
    }
  }, [jobs, myJobs, user.id])

  const operationalReport = useMemo(() => {
    const avgResponseTime = (() => {
      const bidsWithTime = (jobs || []).flatMap(job =>
        job.bids.filter(b => b.contractorId === user.id && b.responseTimeMinutes)
      )
      if (bidsWithTime.length === 0) return 0
      const total = bidsWithTime.reduce((sum, b) => sum + (b.responseTimeMinutes || 0), 0)
      return Math.round(total / bidsWithTime.length)
    })()

    return {
      avgResponseTime,
      totalCustomers: new Set(myJobs.map(j => j.homeownerId)).size,
      repeatCustomers: (() => {
        const customerCounts = new Map<string, number>()
        myJobs.forEach(job => {
          const count = customerCounts.get(job.homeownerId) || 0
          customerCounts.set(job.homeownerId, count + 1)
        })
        return Array.from(customerCounts.values()).filter(c => c > 1).length
      })()
    }
  }, [jobs, myJobs, user.id])

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
                <ChartLine weight="duotone" size={40} className="text-black dark:text-white" />
                <span className="text-black dark:text-white">Reporting Suite</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Comprehensive business analytics and insights
              </p>
            </div>
            <div className="flex gap-3">
              <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
                <SelectTrigger className="w-32 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Download size={18} className="mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Report Tabs */}
          <Tabs value={reportType} onValueChange={(v: any) => setReportType(v)}>
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 bg-white dark:bg-black border-2 border-black dark:border-white">
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="operational">Operational</TabsTrigger>
            </TabsList>

            <TabsContent value="financial" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white dark:bg-black border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <CurrencyDollar size={24} weight="duotone" className="text-green-600 dark:text-green-400" />
                      <TrendingUp size={20} weight="duotone" className="text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-black dark:text-white">
                      ${financialReport.totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Revenue</div>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:bg-black border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <FileText size={24} className="text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="text-2xl font-bold text-black dark:text-white">
                      ${financialReport.pendingRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Pending Revenue</div>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:bg-black border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-black dark:text-white">
                      {financialReport.invoiceCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Invoices</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {financialReport.paidCount} paid
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:bg-black border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-black dark:text-white">
                      ${financialReport.avgInvoiceValue.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Invoice Value</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white dark:bg-black border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-black dark:text-white">
                      {performanceReport.winRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Win Rate</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {performanceReport.acceptedBids} of {performanceReport.totalBids} bids
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:bg-black border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-black dark:text-white">
                      {performanceReport.completedJobs}
                    </div>
                    <div className="text-sm text-muted-foreground">Completed Jobs</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {performanceReport.activeJobs} active
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:bg-black border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-black dark:text-white">
                      ${performanceReport.avgJobValue.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Job Value</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="operational" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white dark:bg-black border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-black dark:text-white">
                      {operationalReport.avgResponseTime}m
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Response Time</div>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:bg-black border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-black dark:text-white">
                      {operationalReport.totalCustomers}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Customers</div>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:bg-black border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-black dark:text-white">
                      {operationalReport.repeatCustomers}
                    </div>
                    <div className="text-sm text-muted-foreground">Repeat Customers</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}