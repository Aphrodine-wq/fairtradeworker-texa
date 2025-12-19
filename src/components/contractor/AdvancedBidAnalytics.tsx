/**
 * Advanced Bid Analytics
 * Additional Pro Feature - Win/loss ratios + response time impact
 */

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ChartBar,
  Target,
  Clock,
  TrendingUp,
  TrendingDown
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User, Job, Bid } from "@/lib/types"

interface AdvancedBidAnalyticsProps {
  user: User
}

export function AdvancedBidAnalytics({ user }: AdvancedBidAnalyticsProps) {
  const isPro = user.isPro || false
  const [jobs] = useLocalKV<Job[]>("jobs", [])
  const [bids] = useLocalKV<Bid[]>("bids", [])

  const analytics = useMemo(() => {
    const myBids = bids.filter(b => b.contractorId === user.id)
    const wonBids = myBids.filter(b => b.status === 'accepted')
    const lostBids = myBids.filter(b => b.status === 'rejected')
    const pendingBids = myBids.filter(b => b.status === 'pending')

    const winRate = myBids.length > 0 ? (wonBids.length / myBids.length) * 100 : 0

    // Response time analysis
    const bidsWithResponseTime = myBids.filter(b => b.responseTimeMinutes !== undefined)
    const avgResponseTime = bidsWithResponseTime.length > 0
      ? bidsWithResponseTime.reduce((sum, b) => sum + (b.responseTimeMinutes || 0), 0) / bidsWithResponseTime.length
      : 0

    // Win rate by response time buckets
    const fastBids = wonBids.filter(b => (b.responseTimeMinutes || 999) < 60)
    const mediumBids = wonBids.filter(b => (b.responseTimeMinutes || 999) >= 60 && (b.responseTimeMinutes || 999) < 240)
    const slowBids = wonBids.filter(b => (b.responseTimeMinutes || 999) >= 240)

    // Average bid amount
    const avgBidAmount = myBids.length > 0
      ? myBids.reduce((sum, b) => sum + b.amount, 0) / myBids.length
      : 0

    return {
      totalBids: myBids.length,
      won: wonBids.length,
      lost: lostBids.length,
      pending: pendingBids.length,
      winRate,
      avgResponseTime,
      avgBidAmount,
      fastWinRate: fastBids.length / (myBids.filter(b => (b.responseTimeMinutes || 999) < 60).length || 1) * 100,
      mediumWinRate: mediumBids.length / (myBids.filter(b => (b.responseTimeMinutes || 999) >= 60 && (b.responseTimeMinutes || 999) < 240).length || 1) * 100,
      slowWinRate: slowBids.length / (myBids.filter(b => (b.responseTimeMinutes || 999) >= 240).length || 1) * 100,
    }
  }, [bids, user.id])

  if (!isPro) {
    return (
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBar weight="duotone" size={24} />
            Advanced Bid Analytics
          </CardTitle>
          <CardDescription>
            Upgrade to Pro to see detailed win/loss analytics and insights
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
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card glass={isPro}>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-black dark:text-white">{analytics.totalBids}</div>
            <div className="text-sm text-black dark:text-white mt-1">Total Bids</div>
          </CardContent>
        </Card>
        <Card glass={isPro}>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{analytics.won}</div>
            <div className="text-sm text-black dark:text-white mt-1">Wins</div>
          </CardContent>
        </Card>
        <Card glass={isPro}>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-black dark:text-white">{analytics.winRate.toFixed(1)}%</div>
            <div className="text-sm text-black dark:text-white mt-1">Win Rate</div>
          </CardContent>
        </Card>
        <Card glass={isPro}>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-black dark:text-white">{Math.round(analytics.avgResponseTime)}m</div>
            <div className="text-sm text-black dark:text-white mt-1">Avg Response</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="response-time">Response Time</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <Card glass={isPro}>
            <CardHeader>
              <CardTitle>Win/Loss Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-black dark:text-white">Won</span>
                  <div className="flex items-center gap-4">
                    <div className="w-48 bg-white dark:bg-black border-0 shadow-sm h-6">
                      <div 
                        className="h-full bg-green-600 dark:bg-green-400"
                        style={{ width: `${(analytics.won / analytics.totalBids) * 100}%` }}
                      />
                    </div>
                    <span className="font-bold text-black dark:text-white">{analytics.won}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-black dark:text-white">Lost</span>
                  <div className="flex items-center gap-4">
                    <div className="w-48 bg-white dark:bg-black border-0 shadow-sm h-6">
                      <div 
                        className="h-full bg-red-600 dark:bg-red-400"
                        style={{ width: `${(analytics.lost / analytics.totalBids) * 100}%` }}
                      />
                    </div>
                    <span className="font-bold text-black dark:text-white">{analytics.lost}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-black dark:text-white">Pending</span>
                  <div className="flex items-center gap-4">
                    <div className="w-48 bg-white dark:bg-black border-0 shadow-sm h-6">
                      <div 
                        className="h-full bg-yellow-600 dark:bg-yellow-400"
                        style={{ width: `${(analytics.pending / analytics.totalBids) * 100}%` }}
                      />
                    </div>
                    <span className="font-bold text-black dark:text-white">{analytics.pending}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 border-0 shadow-md mt-4">
                <p className="text-sm font-semibold text-black dark:text-white mb-2">Average Bid Amount</p>
                <p className="text-2xl font-bold text-black dark:text-white">
                  ${analytics.avgBidAmount.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="response-time" className="space-y-4 mt-6">
          <Card glass={isPro}>
            <CardHeader>
              <CardTitle>Response Time Impact on Win Rate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 border-0 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-black dark:text-white flex items-center gap-2">
                      <Clock size={16} />
                      &lt; 1 hour
                    </span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {analytics.fastWinRate.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-black dark:text-white">
                    Lightning fast responses have the highest win rate
                  </p>
                </div>
                <div className="p-4 border-0 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-black dark:text-white flex items-center gap-2">
                      <Clock size={16} />
                      1-4 hours
                    </span>
                    <span className="text-lg font-bold text-black dark:text-white">
                      {analytics.mediumWinRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="p-4 border-0 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-black dark:text-white flex items-center gap-2">
                      <Clock size={16} />
                      &gt; 4 hours
                    </span>
                    <span className="text-lg font-bold text-red-600 dark:text-red-400">
                      {analytics.slowWinRate.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-black dark:text-white">
                    Slower responses significantly reduce win probability
                  </p>
                </div>
              </div>
              <div className="p-4 border-2 border-[#00FF00] dark:border-[#00FF00] bg-[#00FF00]/10 mt-4">
                <p className="text-sm font-semibold text-black dark:text-white mb-2">💡 Insight</p>
                <p className="text-sm text-black dark:text-white">
                  {analytics.fastWinRate > analytics.slowWinRate
                    ? `Bids submitted within 1 hour win ${(analytics.fastWinRate - analytics.slowWinRate).toFixed(1)}% more often. Speed matters!`
                    : 'Focus on responding quickly to increase your win rate.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4 mt-6">
          <Card glass={isPro}>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border-0 shadow-md hover:shadow-lg rounded-md">
                  <p className="text-sm text-muted-foreground">Fast Response (&lt; 1hr)</p>
                  <p className="text-2xl font-bold">{analytics.fastWinRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Win Rate</p>
                </div>
                <div className="p-4 border-0 shadow-md hover:shadow-lg rounded-md">
                  <p className="text-sm text-muted-foreground">Medium (1-4hr)</p>
                  <p className="text-2xl font-bold">{analytics.mediumWinRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Win Rate</p>
                </div>
                <div className="p-4 border-0 shadow-md hover:shadow-lg rounded-md">
                  <p className="text-sm text-muted-foreground">Slow (&gt; 4hr)</p>
                  <p className="text-2xl font-bold">{analytics.slowWinRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Win Rate</p>
                </div>
                <div className="p-4 border-0 shadow-md hover:shadow-lg rounded-md">
                  <p className="text-sm text-muted-foreground">Avg Response</p>
                  <p className="text-2xl font-bold">{Math.round(analytics.avgResponseTime)}m</p>
                  <p className="text-xs text-muted-foreground mt-1">Minutes</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 border-0 shadow-md hover:shadow-lg rounded-md bg-white dark:bg-black">
                <p className="text-sm font-semibold mb-3">Key Insights</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                    <span>Faster responses significantly improve win rates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-primary mt-0.5" />
                    <span>Average bid amount: ${analytics.avgBidAmount.toLocaleString()}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <span>Response time is a key competitive factor</span>
                  </li>
                </ul>
              </div>
              
              <div className="text-xs text-muted-foreground mt-4">
                <p>💡 Tip: Responding within 1 hour increases your win rate by {Math.round(analytics.fastWinRate - analytics.slowWinRate)}% compared to responses over 4 hours.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
