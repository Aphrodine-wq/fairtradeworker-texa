/**
 * Proactive Business Intelligence
 * AI-powered analytics that proactively identify trends and provide actionable insights
 */

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { 
  Sparkle, TrendUp, TrendDown, Users, CurrencyDollar, 
  ChartLine, Lightbulb, Calendar
} from "@phosphor-icons/react"
import type { User, Job } from "@/lib/types"

interface Insight {
  id: string
  type: 'profit' | 'crew' | 'vendor' | 'seasonal' | 'opportunity'
  severity: 'info' | 'success' | 'warning' | 'critical'
  title: string
  description: string
  recommendation: string
  impact: 'high' | 'medium' | 'low'
  data?: any
}

interface BusinessIntelligenceProps {
  user: User
}

export function ProactiveBusinessIntelligence({ user }: BusinessIntelligenceProps) {
  const [jobs] = useKV<Job[]>("jobs", [])
  const [expenses] = useKV<any[]>("expenses", [])
  const [invoices] = useKV<any[]>("invoices", [])
  const [crews] = useKV<any[]>("crews", [])

  // Analyze data and generate insights
  const insights = useMemo(() => {
    const insights: Insight[] = []
    
    // Filter contractor's completed jobs
    const completedJobs = jobs?.filter(j => 
      j.contractorId === user.id && j.status === 'completed'
    ) || []

    // 1. PROFIT MARGIN ANALYSIS BY JOB TYPE
    const jobTypeMargins: Record<string, { revenue: number; expenses: number; count: number }> = {}
    
    completedJobs.forEach(job => {
      const jobType = job.title.toLowerCase().includes('bathroom') ? 'bathroom' :
                      job.title.toLowerCase().includes('kitchen') ? 'kitchen' :
                      job.title.toLowerCase().includes('roof') ? 'roofing' :
                      job.title.toLowerCase().includes('floor') ? 'flooring' : 'other'
      
      if (!jobTypeMargins[jobType]) {
        jobTypeMargins[jobType] = { revenue: 0, expenses: 0, count: 0 }
      }
      
      const jobInvoices = invoices?.filter(inv => inv.jobId === job.id) || []
      const jobExpenses = expenses?.filter(exp => exp.jobId === job.id) || []
      
      jobTypeMargins[jobType].revenue += jobInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
      jobTypeMargins[jobType].expenses += jobExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
      jobTypeMargins[jobType].count += 1
    })

    // Find highest and lowest margin job types
    // Minimum jobs required for reliable analysis
    const MIN_JOBS_FOR_ANALYSIS = 3
    
    const marginAnalysis = Object.entries(jobTypeMargins)
      .filter(([_, data]) => data.count >= MIN_JOBS_FOR_ANALYSIS)
      .map(([type, data]) => ({
        type,
        margin: data.revenue > 0 ? ((data.revenue - data.expenses) / data.revenue) * 100 : 0,
        revenue: data.revenue,
        expenses: data.expenses,
        count: data.count
      }))
      .sort((a, b) => b.margin - a.margin)

    if (marginAnalysis.length >= 2) {
      const best = marginAnalysis[0]
      const worst = marginAnalysis[marginAnalysis.length - 1]
      
      if (best.margin - worst.margin >= 10) {
        insights.push({
          id: 'profit-margin-analysis',
          type: 'profit',
          severity: 'success',
          title: `${best.type} jobs are ${(best.margin - worst.margin).toFixed(1)}% more profitable`,
          description: `Your ${best.type} remodels have a ${best.margin.toFixed(1)}% margin vs ${worst.margin.toFixed(1)}% for ${worst.type} jobs.`,
          recommendation: `Focus marketing efforts on ${best.type} projects. Consider raising prices or reducing costs on ${worst.type} jobs.`,
          impact: 'high',
          data: { best, worst, analysis: marginAnalysis }
        })
      }
    }

    // 2. CREW PERFORMANCE ANALYSIS
    if (crews && crews.length > 0) {
      const crewPerformance = crews.map(crew => {
        const crewJobs = completedJobs.filter(j => j.metadata?.crewId === crew.id)
        if (crewJobs.length === 0) return null
        
        const avgDuration = crewJobs.reduce((sum, j) => {
          const start = new Date(j.createdAt)
          const end = j.metadata?.completedAt ? new Date(j.metadata.completedAt) : new Date()
          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        }, 0) / crewJobs.length
        
        return {
          crew,
          avgDuration,
          jobCount: crewJobs.length
        }
      }).filter(Boolean) as any[]

      if (crewPerformance.length >= 2) {
        crewPerformance.sort((a, b) => a.avgDuration - b.avgDuration)
        const fastest = crewPerformance[0]
        const slowest = crewPerformance[crewPerformance.length - 1]
        
        if (slowest.avgDuration - fastest.avgDuration >= 2) {
          const percentFaster = ((slowest.avgDuration - fastest.avgDuration) / slowest.avgDuration * 100).toFixed(0)
          insights.push({
            id: 'crew-performance',
            type: 'crew',
            severity: 'info',
            title: `Crew ${fastest.crew.name} completes jobs ${percentFaster}% faster`,
            description: `${fastest.crew.name} averages ${fastest.avgDuration.toFixed(1)} days per job vs ${slowest.avgDuration.toFixed(1)} days for ${slowest.crew.name}.`,
            recommendation: `Analyze ${fastest.crew.name}'s processes and share best practices. Consider additional training for ${slowest.crew.name}.`,
            impact: 'medium',
            data: { fastest, slowest, performance: crewPerformance }
          })
        }
      }
    }

    // 3. VENDOR COST OPTIMIZATION
    const vendorSpending: Record<string, number> = {}
    expenses?.forEach(expense => {
      if (expense.category === 'materials') {
        vendorSpending[expense.vendor] = (vendorSpending[expense.vendor] || 0) + expense.amount
      }
    })

    const totalMaterialCost = Object.values(vendorSpending).reduce((sum, amt) => sum + amt, 0)
    const topVendors = Object.entries(vendorSpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)

    if (topVendors.length >= 3 && totalMaterialCost > 0) {
      const top3Percentage = (topVendors.reduce((sum, [, amt]) => sum + amt, 0) / totalMaterialCost * 100)
      
      if (top3Percentage >= 60) {
        insights.push({
          id: 'vendor-concentration',
          type: 'vendor',
          severity: 'warning',
          title: `Top 3 vendors account for ${top3Percentage.toFixed(0)}% of material costs`,
          description: `You spend $${topVendors.reduce((sum, [, amt]) => sum + amt, 0).toLocaleString()} with ${topVendors.map(([v]) => v).join(', ')}.`,
          recommendation: 'Negotiate bulk discounts or better payment terms. Consider diversifying suppliers to reduce dependency.',
          impact: 'high',
          data: { topVendors, totalMaterialCost, concentration: top3Percentage }
        })
      }
    }

    // 4. SEASONAL TRENDS
    const monthlyJobs: Record<string, number> = {}
    const currentMonth = new Date().getMonth()
    
    completedJobs.forEach(job => {
      const month = new Date(job.createdAt).getMonth()
      const monthName = new Date(2024, month).toLocaleString('en-US', { month: 'long' })
      monthlyJobs[monthName] = (monthlyJobs[monthName] || 0) + 1
    })

    // Check if next month historically has higher demand
    const nextMonth = (currentMonth + 1) % 12
    const nextMonthName = new Date(2024, nextMonth).toLocaleString('en-US', { month: 'long' })
    const currentMonthName = new Date(2024, currentMonth).toLocaleString('en-US', { month: 'long' })
    
    if (monthlyJobs[nextMonthName] && monthlyJobs[currentMonthName]) {
      const increase = ((monthlyJobs[nextMonthName] - monthlyJobs[currentMonthName]) / monthlyJobs[currentMonthName] * 100)
      
      if (increase >= 20) {
        insights.push({
          id: 'seasonal-forecast',
          type: 'seasonal',
          severity: 'success',
          title: `${nextMonthName} typically sees ${increase.toFixed(0)}% more jobs`,
          description: `Historical data shows increased demand in ${nextMonthName}. Plan ahead for higher workload.`,
          recommendation: `Start marketing campaigns now. Ensure adequate inventory and crew availability for ${nextMonthName}.`,
          impact: 'medium',
          data: { currentMonth: currentMonthName, nextMonth: nextMonthName, increase }
        })
      }
    }

    // 5. OPPORTUNITY IDENTIFICATION
    const avgJobValue = completedJobs.length > 0
      ? invoices.reduce((sum, inv) => sum + (inv.total || 0), 0) / completedJobs.length
      : 0

    if (avgJobValue > 5000 && completedJobs.length >= 10) {
      const highValueJobs = completedJobs.filter(j => {
        const jobInvoices = invoices.filter(inv => inv.jobId === j.id)
        const totalValue = jobInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
        return totalValue > avgJobValue * 1.5
      })

      if (highValueJobs.length >= 3) {
        insights.push({
          id: 'high-value-opportunity',
          type: 'opportunity',
          severity: 'success',
          title: `${highValueJobs.length} high-value projects completed`,
          description: `You've completed ${highValueJobs.length} jobs worth ${(avgJobValue * 1.5).toLocaleString()} or more.`,
          recommendation: 'Target similar high-value projects in your marketing. These jobs typically have better margins and serious buyers.',
          impact: 'high',
          data: { count: highValueJobs.length, threshold: avgJobValue * 1.5 }
        })
      }
    }

    return insights.sort((a, b) => {
      const impactOrder = { high: 0, medium: 1, low: 2 }
      return impactOrder[a.impact] - impactOrder[b.impact]
    })
  }, [jobs, expenses, invoices, crews, user.id])

  const getSeverityColor = (severity: Insight['severity']) => {
    switch (severity) {
      case 'success': return 'bg-green-50 border-green-200'
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      case 'critical': return 'bg-red-50 border-red-200'
      default: return 'bg-blue-50 border-blue-200'
    }
  }

  const getSeverityBadge = (severity: Insight['severity']) => {
    switch (severity) {
      case 'success': return 'default'
      case 'warning': return 'secondary'
      case 'critical': return 'destructive'
      default: return 'outline'
    }
  }

  const getImpactIcon = (impact: Insight['impact']) => {
    switch (impact) {
      case 'high': return <TrendUp className="w-5 h-5 text-green-600" />
      case 'medium': return <ChartLine className="w-5 h-5 text-blue-600" />
      default: return <Lightbulb className="w-5 h-5 text-gray-600" />
    }
  }

  const getTypeIcon = (type: Insight['type']) => {
    switch (type) {
      case 'profit': return <CurrencyDollar className="w-5 h-5" />
      case 'crew': return <Users className="w-5 h-5" />
      case 'vendor': return <CurrencyDollar className="w-5 h-5" />
      case 'seasonal': return <Calendar className="w-5 h-5" />
      case 'opportunity': return <Sparkle className="w-5 h-5" />
    }
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkle className="w-5 h-5 text-purple-500" />
                AI Business Intelligence
              </CardTitle>
              <CardDescription>
                Proactive insights and recommendations based on your business data
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-purple-50">
              {insights.length} insights
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map(insight => (
              <Card 
                key={insight.id} 
                className={`border-l-4 ${getSeverityColor(insight.severity)} shadow-sm hover:shadow-md transition-shadow duration-200`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(insight.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityBadge(insight.severity)} className="text-xs">
                            {insight.type}
                          </Badge>
                          {getImpactIcon(insight.impact)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                      <div className="bg-white/50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-1">Recommendation</p>
                            <p className="text-sm text-gray-600">{insight.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {insights.length === 0 && (
              <div className="text-center py-12">
                <Sparkle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Not enough data yet to generate insights</p>
                <p className="text-sm text-gray-400 mt-1">
                  Complete more jobs to unlock AI-powered business intelligence
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
