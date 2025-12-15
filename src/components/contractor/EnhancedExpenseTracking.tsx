import { useState, useMemo, useEffect } from "react"
import { SkeletonLoader } from "@/components/ui/SkeletonLoader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartLine, FileText, Download, TrendUp } from "@phosphor-icons/react"
import { ExpenseTracking } from "@/components/projects/ExpenseTracking"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User, Milestone, MilestoneExpense } from "@/lib/types"

export function EnhancedExpenseTracking({ user }: { user: User }) {
  const [jobs] = useKV<any[]>("jobs", [])
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month')
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
  const isPro = user.isPro || false

  // Get all expenses from all milestones
  const allExpenses = useMemo(() => {
    const expenses: (MilestoneExpense & { milestoneName: string; jobName: string })[] = []
    ;(jobs || []).forEach(job => {
      job.milestones?.forEach((milestone: Milestone) => {
        ;(milestone.expenses || []).forEach(expense => {
          expenses.push({
            ...expense,
            milestoneName: milestone.name,
            jobName: job.title
          })
        })
      })
    })
    return expenses
  }, [jobs])

  const expensesByCategory = useMemo(() => {
    const categories: Record<string, number> = {}
    allExpenses.forEach(exp => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount
    })
    return categories
  }, [allExpenses])

  const totalExpenses = useMemo(() => 
    allExpenses.reduce((sum, exp) => sum + exp.amount, 0),
    [allExpenses]
  )

  const taxDeductibleTotal = useMemo(() => {
    // Most business expenses are tax deductible
    const deductibleCategories = ['materials', 'labor', 'equipment', 'permits', 'travel', 'other']
    return allExpenses
      .filter(exp => deductibleCategories.includes(exp.category))
      .reduce((sum, exp) => sum + exp.amount, 0)
  }, [allExpenses])

  // Get unique milestones from all jobs
  const milestones = useMemo(() => {
    const all: Milestone[] = []
    ;(jobs || []).forEach(job => {
      ;(job.milestones || []).forEach((milestone: Milestone) => {
        all.push(milestone)
      })
    })
    return all
  }, [jobs])

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3 mb-2">
              <ChartLine weight="duotone" size={40} className="text-black dark:text-white" />
              <span className="text-black dark:text-white">Expense Tracker</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Categories, reports, and tax integration
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card glass={isPro}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-black dark:text-white">
                  ${totalExpenses.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Total Expenses</div>
              </CardContent>
            </Card>
            <Card glass={isPro}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  ${taxDeductibleTotal.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Tax Deductible</div>
              </CardContent>
            </Card>
            <Card glass={isPro}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {allExpenses.length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Total Expenses</div>
              </CardContent>
            </Card>
            <Card glass={isPro}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {Object.keys(expensesByCategory).length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Categories</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="expenses" className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 bg-white dark:bg-black border border-black/20 dark:border-white/20">
              <TabsTrigger value="expenses">Track Expenses</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="tax">Tax Integration</TabsTrigger>
            </TabsList>

            <TabsContent value="expenses" className="mt-6">
              <Card glass={isPro}>
                <CardHeader>
                  <CardTitle>Select Milestone</CardTitle>
                  <CardDescription>Choose a milestone to track expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  {milestones.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No milestones available</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {milestones.map(milestone => (
                        <Card
                          key={milestone.id}
                          className="cursor-pointer hover:shadow-[6px_6px_0_#000] dark:hover:shadow-[6px_6px_0_#fff] transition-all"
                          onClick={() => setSelectedMilestone(milestone)}
                        >
                          <CardHeader>
                            <CardTitle className="text-lg">{milestone.name}</CardTitle>
                            <CardDescription>
                              ${milestone.amount.toLocaleString()}
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  )}
                  {selectedMilestone && (
                    <div className="mt-6">
                      <ExpenseTracking
                        milestone={selectedMilestone}
                        onUpdateMilestone={(updated) => {
                          // Update milestone in jobs
                        }}
                        canEdit={true}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              <Card glass={isPro}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Expense Reports</CardTitle>
                      <CardDescription>Detailed expense breakdowns and analysis</CardDescription>
                    </div>
                    <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-4">By Category</h3>
                      <div className="space-y-3">
                        {Object.entries(expensesByCategory).map(([category, amount]) => (
                          <div key={category} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <span className="capitalize font-medium text-black dark:text-white">{category}</span>
                            <span className="font-bold text-black dark:text-white">
                              ${amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <Button>
                        <Download size={18} className="mr-2" />
                        Export Report (CSV)
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tax" className="mt-6">
              <Card glass={isPro}>
                <CardHeader>
                  <CardTitle>Tax Integration</CardTitle>
                  <CardDescription>Export expenses for tax filing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-white dark:bg-black border border-black/20 dark:border-white/20 rounded-md shadow-sm">
                    <h3 className="font-semibold mb-2">Tax Deductible Expenses</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Most business expenses are tax deductible. Track them here and export for your tax professional.
                    </p>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${taxDeductibleTotal.toLocaleString()} deductible
                    </div>
                  </div>
                  <Button className="w-full">
                    <FileText size={18} className="mr-2" />
                    Export for Tax Filing
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    💡 Tip: Keep all receipts organized. Export this report quarterly for estimated tax payments.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}