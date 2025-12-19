import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CurrencyDollar, TrendingUp, TrendingDown, Calculator,
  Receipt, CreditCard, ChartLine, AlertCircle
} from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User, Job, Invoice, Milestone } from "@/lib/types"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ConstructionFinancialsProps {
  user: User
}

export function ConstructionFinancials({ user }: ConstructionFinancialsProps) {
  const [jobs] = useKV<Job[]>("jobs", [])
  const [invoices] = useKV<Invoice[]>("invoices", [])

  const myProjects = useMemo(() => {
    return jobs.filter(job =>
      job.bids.some(b => b.contractorId === user.id && b.status === 'accepted')
    )
  }, [jobs, user.id])

  const myInvoices = useMemo(() => {
    return (invoices || []).filter(inv => inv.contractorId === user.id)
  }, [invoices, user.id])

  const financialMetrics = useMemo(() => {
    const activeProjects = myProjects.filter(j => j.status === 'in-progress')
    const completedProjects = myProjects.filter(j => j.status === 'completed')

    // Calculate total contract value
    const totalContractValue = myProjects.reduce((sum, job) => {
      const bid = job.bids.find(b => b.contractorId === user.id && b.status === 'accepted')
      return sum + (bid?.amount || 0)
    }, 0)

    // Calculate total invoiced
    const totalInvoiced = myInvoices.reduce((sum, inv) => sum + inv.total, 0)

    // Calculate total paid
    const totalPaid = myInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0)

    // Calculate outstanding
    const outstanding = totalInvoiced - totalPaid

    // Calculate expenses (from milestones)
    const totalExpenses = myProjects.reduce((sum, job) => {
      if (!job.milestones) return sum
      return sum + job.milestones.reduce((milestoneSum, milestone) => {
        const expenses = milestone.expenses || []
        return milestoneSum + expenses.reduce((expenseSum, exp) => expenseSum + exp.amount, 0)
      }, 0)
    }, 0)

    // Calculate profit
    const profit = totalPaid - totalExpenses
    const profitMargin = totalPaid > 0 ? (profit / totalPaid) * 100 : 0

    // Calculate job profitability
    const jobProfitability = myProjects.map(job => {
      const bid = job.bids.find(b => b.contractorId === user.id && b.status === 'accepted')
      const contractValue = bid?.amount || 0
      
      const jobExpenses = (job.milestones || []).reduce((sum, milestone) => {
        const expenses = milestone.expenses || []
        return sum + expenses.reduce((expSum, exp) => expSum + exp.amount, 0)
      }, 0)

      const jobInvoices = myInvoices.filter(inv => inv.jobId === job.id)
      const jobPaid = jobInvoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0)

      const jobProfit = jobPaid - jobExpenses
      const jobMargin = contractValue > 0 ? (jobProfit / contractValue) * 100 : 0

      return {
        jobId: job.id,
        jobTitle: job.title,
        contractValue,
        expenses: jobExpenses,
        paid: jobPaid,
        profit: jobProfit,
        margin: jobMargin,
        status: job.status
      }
    })

    return {
      totalContractValue,
      totalInvoiced,
      totalPaid,
      outstanding,
      totalExpenses,
      profit,
      profitMargin,
      activeProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      jobProfitability
    }
  }, [myProjects, myInvoices, user.id])

  const overdueInvoices = useMemo(() => {
    return myInvoices.filter(inv => {
      if (inv.status === 'paid') return false
      const dueDate = new Date(inv.dueDate)
      return dueDate < new Date()
    })
  }, [myInvoices])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
          <Calculator weight="duotone" size={28} className="text-black dark:text-white" />
          Construction Financial Tools
        </h2>
        <p className="text-muted-foreground mt-1">
          Track job profitability, budgets, payments, and financial performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CurrencyDollar weight="duotone" size={24} className="text-black dark:text-white" />
              <span className="text-xs text-muted-foreground">Total Contract Value</span>
            </div>
            <div className="text-2xl font-bold text-black dark:text-white">
              ${financialMetrics.totalContractValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp weight="duotone" size={24} className="text-green-500" />
              <span className="text-xs text-muted-foreground">Total Paid</span>
            </div>
            <div className="text-2xl font-bold text-green-500">
              ${financialMetrics.totalPaid.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Receipt weight="duotone" size={24} className="text-orange-500" />
              <span className="text-xs text-muted-foreground">Outstanding</span>
            </div>
            <div className="text-2xl font-bold text-orange-500">
              ${financialMetrics.outstanding.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              {financialMetrics.profitMargin >= 20 ? (
                <TrendingUp weight="duotone" size={24} className="text-green-500" />
              ) : (
                <TrendingDown weight="duotone" size={24} className="text-red-500" />
              )}
              <span className="text-xs text-muted-foreground">Profit Margin</span>
            </div>
            <div className={`text-2xl font-bold ${financialMetrics.profitMargin >= 20 ? 'text-green-500' : 'text-red-500'}`}>
              {financialMetrics.profitMargin.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profitability" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profitability">Job Profitability</TabsTrigger>
          <TabsTrigger value="budgets">Budget Tracking</TabsTrigger>
          <TabsTrigger value="payments">Payment Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="profitability" className="space-y-4 mt-6">
          <div className="space-y-3">
            {financialMetrics.jobProfitability.map(job => (
              <Card key={job.jobId} className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{job.jobTitle}</CardTitle>
                    <Badge variant={job.margin >= 20 ? 'default' : job.margin >= 10 ? 'outline' : 'destructive'}>
                      {job.margin.toFixed(1)}% margin
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
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
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Profit Margin</span>
                        <span className="text-black dark:text-white">{job.margin.toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={Math.max(0, Math.min(100, job.margin))} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4 mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Budget Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Total Budget</span>
                      <span className="font-semibold text-black dark:text-white">
                        ${financialMetrics.totalContractValue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Spent</span>
                      <span className="font-semibold text-red-500">
                        ${financialMetrics.totalExpenses.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className="font-semibold text-green-500">
                        ${(financialMetrics.totalContractValue - financialMetrics.totalExpenses).toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={(financialMetrics.totalExpenses / financialMetrics.totalContractValue) * 100} 
                      className="h-3 mt-3"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Financial Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Profit Margin</span>
                    <Badge variant={financialMetrics.profitMargin >= 20 ? 'default' : 'outline'}>
                      {financialMetrics.profitMargin.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Projects</span>
                    <span className="text-sm font-semibold text-black dark:text-white">
                      {financialMetrics.activeProjects}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <span className="text-sm font-semibold text-black dark:text-white">
                      {financialMetrics.completedProjects}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4 mt-6">
          {overdueInvoices.length > 0 && (
            <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle size={20} className="text-red-500" />
                  <div>
                    <div className="font-semibold text-red-700 dark:text-red-300">
                      {overdueInvoices.length} Overdue Invoice{overdueInvoices.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-sm text-red-600 dark:text-red-400">
                      Total: ${overdueInvoices.reduce((sum, inv) => sum + inv.total, 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-black dark:text-white">Recent Payments</h3>
            {myInvoices
              .filter(inv => inv.status === 'paid')
              .slice(0, 10)
              .map(invoice => (
                <Card key={invoice.id} className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-black dark:text-white">
                          {invoice.jobTitle}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Paid: {invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-500">
                          ${invoice.total.toLocaleString()}
                        </div>
                        <Badge variant="default" className="text-xs">Paid</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
