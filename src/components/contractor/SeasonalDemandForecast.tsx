/**
 * Seasonal Demand Forecast
 * Additional Pro Feature - Platform data → "Roofing spikes 35% in March"
 */

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ChartLine,
  TrendingUp,
  TrendingDown
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User, Job } from "@/lib/types"

interface SeasonalDemandForecastProps {
  user: User
}

interface Forecast {
  category: string
  currentMonth: number
  nextMonth: number
  change: number
  trend: 'up' | 'down' | 'stable'
}

export function SeasonalDemandForecast({ user }: SeasonalDemandForecastProps) {
  const isPro = user.isPro || false
  const [jobs] = useLocalKV<Job[]>("jobs", [])

  const forecasts = useMemo(() => {
    // Analyze jobs by category and month
    const now = new Date()
    const currentMonth = now.getMonth()
    
    const categories = Array.from(new Set(jobs.map(j => j.category || 'general')))
    
    return categories.map(category => {
      const categoryJobs = jobs.filter(j => (j.category || 'general') === category)
      
      // Count jobs by month (simplified - in production, use actual dates)
      const thisMonth = categoryJobs.filter(j => {
        const jobDate = new Date(j.createdAt)
        return jobDate.getMonth() === currentMonth
      }).length

      const lastMonth = categoryJobs.filter(j => {
        const jobDate = new Date(j.createdAt)
        return jobDate.getMonth() === (currentMonth - 1 + 12) % 12
      }).length

      const change = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0

      return {
        category,
        currentMonth: thisMonth,
        nextMonth: Math.round(thisMonth * (1 + change / 100)),
        change: Math.abs(change),
        trend: change > 10 ? 'up' : change < -10 ? 'down' : 'stable'
      } as Forecast
    }).sort((a, b) => b.change - a.change).slice(0, 10)
  }, [jobs])

  if (!isPro) {
    return (
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLine weight="duotone" size={24} />
            Seasonal Demand Forecast
          </CardTitle>
          <CardDescription>
            Upgrade to Pro to see demand trends and seasonal forecasts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.href = '/pro-upgrade'}>
            Upgrade to Pro - $59/mo
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card glass={isPro}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartLine weight="duotone" size={24} />
          Seasonal Demand Forecast
        </CardTitle>
        <CardDescription>
          Platform data insights on job demand trends
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {forecasts.length === 0 ? (
          <p className="text-center text-black dark:text-white py-8">
            Not enough data yet. Check back after more jobs are posted.
          </p>
        ) : (
          forecasts.map((forecast) => (
            <div key={forecast.category} className="p-4 border border-black/20 dark:border-white/20">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-black dark:text-white capitalize">
                    {forecast.category}
                  </h3>
                  <p className="text-sm text-black dark:text-white">
                    {forecast.currentMonth} jobs this month
                  </p>
                </div>
                <div className="text-right">
                  {forecast.trend === 'up' ? (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <TrendingUp size={20} weight="fill" />
                      <span className="font-bold">+{forecast.change.toFixed(0)}%</span>
                    </div>
                  ) : forecast.trend === 'down' ? (
                    <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                      <TrendingDown size={20} weight="fill" />
                      <span className="font-bold">-{forecast.change.toFixed(0)}%</span>
                    </div>
                  ) : (
                    <span className="text-black dark:text-white">Stable</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-black dark:text-white mt-2">
                Projected next month: ~{forecast.nextMonth} jobs
              </p>
              {forecast.trend === 'up' && forecast.change > 20 && (
                <Badge variant="default" className="mt-2">
                  High Demand - Consider increasing prices
                </Badge>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
