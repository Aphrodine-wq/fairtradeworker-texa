import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CurrencyDollar, 
  TrendUp, 
  TrendDown,
  Warning,
  CheckCircle,
  Users,
  Wrench,
  ChartBar
} from '@phosphor-icons/react'
import type { Job, Milestone, TradeContractor, ScopeChange } from '@/lib/types'

interface BudgetTrackingProps {
  job: Job
}

interface TradeBudget {
  trade: string
  contractorName?: string
  budgeted: number
  spent: number
  remaining: number
  percentage: number
  status: 'under' | 'on-track' | 'over' | 'complete'
  milestones: number
  paidMilestones: number
}

export function BudgetTracking({ job }: BudgetTrackingProps) {
  const milestones = job.milestones || []
  const tradeContractors = job.tradeContractors || []
  const scopeChanges = job.scopeChanges || []
  
  const budgetData = useMemo(() => {
    const originalBudget = job.aiScope.priceHigh || 0
    
    const approvedScopeChanges = scopeChanges
      .filter(sc => sc.status === 'approved')
      .reduce((sum, sc) => sum + sc.additionalCost, 0)
    
    const totalBudget = originalBudget + approvedScopeChanges
    
    const totalSpent = milestones
      .filter(m => m.status === 'paid')
      .reduce((sum, m) => sum + m.amount, 0)
    
    const totalCommitted = milestones
      .filter(m => m.status === 'completed' || m.status === 'in-progress')
      .reduce((sum, m) => sum + m.amount, 0)
    
    const totalRemaining = totalBudget - totalSpent
    
    const percentSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
    const percentCommitted = totalBudget > 0 ? (totalCommitted / totalBudget) * 100 : 0
    
    return {
      originalBudget,
      scopeChangeAmount: approvedScopeChanges,
      totalBudget,
      totalSpent,
      totalCommitted,
      totalRemaining,
      percentSpent,
      percentCommitted
    }
  }, [job, milestones, scopeChanges])
  
  const tradeBreakdown = useMemo((): TradeBudget[] => {
    if (tradeContractors.length === 0) {
      const totalMilestones = milestones.length
      const paidMilestones = milestones.filter(m => m.status === 'paid').length
      const spent = milestones
        .filter(m => m.status === 'paid')
        .reduce((sum, m) => sum + m.amount, 0)
      
      return [{
        trade: 'General Contracting',
        budgeted: budgetData.totalBudget,
        spent,
        remaining: budgetData.totalBudget - spent,
        percentage: budgetData.totalBudget > 0 ? (spent / budgetData.totalBudget) * 100 : 0,
        status: paidMilestones === totalMilestones ? 'complete' : 'on-track',
        milestones: totalMilestones,
        paidMilestones
      }]
    }
    
    return tradeContractors.map(tc => {
      const tradeMilestones = milestones.filter(m => 
        tc.assignedMilestones.includes(m.id)
      )
      
      const spent = tradeMilestones
        .filter(m => m.status === 'paid')
        .reduce((sum, m) => sum + m.amount, 0)
      
      const paidCount = tradeMilestones.filter(m => m.status === 'paid').length
      const totalCount = tradeMilestones.length
      
      const percentage = tc.totalAmount > 0 ? (spent / tc.totalAmount) * 100 : 0
      
      let status: 'under' | 'on-track' | 'over' | 'complete' = 'on-track'
      if (paidCount === totalCount && totalCount > 0) {
        status = 'complete'
      } else if (percentage > 95 && paidCount < totalCount) {
        status = 'over'
      } else if (percentage < 50 && paidCount > totalCount * 0.6) {
        status = 'under'
      }
      
      return {
        trade: tc.trade,
        contractorName: tc.contractorName,
        budgeted: tc.totalAmount,
        spent,
        remaining: tc.totalAmount - spent,
        percentage,
        status,
        milestones: totalCount,
        paidMilestones: paidCount
      }
    })
  }, [tradeContractors, milestones, budgetData.totalBudget])
  
  const getStatusColor = (status: TradeBudget['status']) => {
    switch (status) {
      case 'complete':
        return 'bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white'
      case 'under':
        return 'bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white'
      case 'on-track':
        return 'bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white'
      case 'over':
        return 'bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white'
    }
  }
  
  const getStatusIcon = (status: TradeBudget['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4" weight="fill" />
      case 'under':
        return <TrendDown className="w-4 h-4" />
      case 'on-track':
        return <ChartBar className="w-4 h-4" />
      case 'over':
        return <Warning className="w-4 h-4" weight="fill" />
    }
  }
  
  const getStatusLabel = (status: TradeBudget['status']) => {
    switch (status) {
      case 'complete':
        return 'Complete'
      case 'under':
        return 'Under Budget'
      case 'on-track':
        return 'On Track'
      case 'over':
        return 'Over Budget'
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-none bg-white dark:bg-black border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
              <CurrencyDollar className="w-6 h-6 text-black dark:text-white" weight="bold" />
            </div>
            <div>
              <CardTitle className="text-xl">Budget Overview</CardTitle>
              <CardDescription>Track spending across all project phases</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-none bg-white dark:bg-black border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
              <div className="text-sm text-muted-foreground mb-1">Total Budget</div>
              <div className="text-2xl font-bold">
                ${budgetData.totalBudget.toLocaleString()}
              </div>
              {budgetData.scopeChangeAmount > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  +${budgetData.scopeChangeAmount.toLocaleString()} scope changes
                </div>
              )}
            </div>
            
            <div className="p-4 rounded-none bg-white dark:bg-black border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
              <div className="text-sm text-muted-foreground mb-1">Total Spent</div>
              <div className="text-2xl font-bold text-black dark:text-white">
                ${budgetData.totalSpent.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {budgetData.percentSpent.toFixed(1)}% of budget
              </div>
            </div>
            
            <div className="p-4 rounded-none bg-white dark:bg-black border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
              <div className="text-sm text-muted-foreground mb-1">Remaining</div>
              <div className="text-2xl font-bold text-black dark:text-white">
                ${budgetData.totalRemaining.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {(100 - budgetData.percentSpent).toFixed(1)}% available
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Budget Progress</span>
              <span className="font-medium">{budgetData.percentSpent.toFixed(1)}%</span>
            </div>
            <Progress value={budgetData.percentSpent} className="h-3" />
            {budgetData.totalCommitted > budgetData.totalSpent && (
              <div className="text-xs text-muted-foreground mt-2">
                ${budgetData.totalCommitted.toLocaleString()} committed (includes in-progress milestones)
              </div>
            )}
          </div>
          
          {budgetData.percentSpent > 90 && budgetData.totalRemaining > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-none bg-white dark:bg-black border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
              <Warning className="w-5 h-5 text-black dark:text-white shrink-0" weight="fill" />
              <div className="text-sm text-black dark:text-white">
                <span className="font-medium">Budget Alert:</span> You've spent {budgetData.percentSpent.toFixed(1)}% of the total budget
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-none bg-white dark:bg-black border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
              <Wrench className="w-6 h-6 text-black dark:text-white" weight="bold" />
            </div>
            <div>
              <CardTitle className="text-xl">Cost Breakdown by Trade</CardTitle>
              <CardDescription>
                {tradeContractors.length > 0 
                  ? `${tradeContractors.length} trades working on this project`
                  : 'Single contractor project'
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {tradeBreakdown.map((trade, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-none border-2 border-black dark:border-white bg-white dark:bg-black hover:shadow-[4px_4px_0_#000] dark:hover:shadow-[4px_4px_0_#fff] transition-all shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-base">{trade.trade}</h4>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(trade.status)}
                    >
                      <span className="flex items-center gap-1">
                        {getStatusIcon(trade.status)}
                        {getStatusLabel(trade.status)}
                      </span>
                    </Badge>
                  </div>
                  {trade.contractorName && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {trade.contractorName}
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="text-xl font-bold">
                    ${trade.spent.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    of ${trade.budgeted.toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {trade.paidMilestones} of {trade.milestones} milestones paid
                  </span>
                  <span className="font-medium">{trade.percentage.toFixed(1)}%</span>
                </div>
                <Progress value={trade.percentage} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-border">
                <div>
                  <div className="text-xs text-muted-foreground">Spent</div>
                  <div className="text-sm font-medium text-black dark:text-white">
                    ${trade.spent.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Remaining</div>
                  <div className="text-sm font-medium text-black dark:text-white">
                    ${trade.remaining.toLocaleString()}
                  </div>
                </div>
              </div>
              
              {trade.status === 'over' && (
                <div className="mt-3 flex items-center gap-2 p-2 rounded-none bg-white dark:bg-black border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff] font-mono">
                  <Warning className="w-4 h-4 text-black dark:text-white shrink-0" weight="fill" />
                  <span className="text-xs text-black dark:text-white">
                    This trade is approaching budget limit
                  </span>
                </div>
              )}
              
              {trade.status === 'complete' && (
                <div className="mt-3 flex items-center gap-2 p-2 rounded-none bg-white dark:bg-black border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff] font-mono">
                  <CheckCircle className="w-4 h-4 text-black dark:text-white shrink-0" weight="fill" />
                  <span className="text-xs text-black dark:text-white">
                    All payments complete for this trade
                  </span>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {scopeChanges.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-none bg-white dark:bg-black border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                <TrendUp className="w-6 h-6 text-black dark:text-white" weight="bold" />
              </div>
              <div>
                <CardTitle className="text-xl">Scope Changes</CardTitle>
                <CardDescription>
                  Additional work discovered during the project
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {scopeChanges.map((sc) => (
              <div 
                key={sc.id}
                className="p-3 rounded-lg border border-border bg-card"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{sc.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Discovered {new Date(sc.discoveredAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-black dark:text-white">
                      +${sc.additionalCost.toLocaleString()}
                    </div>
                    <Badge 
                      variant="outline"
                      className="bg-white dark:bg-black text-black dark:text-white border border-black/10 dark:border-white/10"
                    >
                      {sc.status === 'approved' && '✓ Approved'}
                      {sc.status === 'rejected' && '✗ Rejected'}
                      {sc.status === 'pending' && '⏳ Pending'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
