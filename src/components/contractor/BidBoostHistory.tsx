/**
 * Bid Boost History
 * Additional Pro Feature - Track ROI of past boosts
 */

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Rocket,
  TrendingUp,
  DollarSign
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User, Bid, Job } from "@/lib/types"

interface BidBoost {
  id: string
  bidId: string
  jobId: string
  amount: number
  createdAt: string
  result: 'won' | 'lost' | 'pending'
  jobValue?: number
}

interface BidBoostHistoryProps {
  user: User
}

export function BidBoostHistory({ user }: BidBoostHistoryProps) {
  const isPro = user?.isPro || false
  const [boosts] = useLocalKV<BidBoost[]>(`bid-boosts-${user?.id}`, [])
  const [bids] = useLocalKV<Bid[]>("bids", [])
  const [jobs] = useLocalKV<Job[]>("jobs", [])

  const analytics = useMemo(() => {
    const totalSpent = boosts.reduce((sum, b) => sum + b.amount, 0)
    const wonBoosts = boosts.filter(b => b.result === 'won')
    const totalWonValue = wonBoosts.reduce((sum, b) => sum + (b.jobValue || 0), 0)
    const totalBoostSpent = wonBoosts.reduce((sum, b) => sum + b.amount, 0)
    const roi = totalBoostSpent > 0 ? ((totalWonValue - totalBoostSpent) / totalBoostSpent) * 100 : 0
    
    return {
      totalSpent,
      totalBoosts: boosts.length,
      wonBoosts: wonBoosts.length,
      winRate: boosts.length > 0 ? (wonBoosts.length / boosts.length) * 100 : 0,
      totalWonValue,
      roi,
      avgBoostAmount: boosts.length > 0 ? totalSpent / boosts.length : 0
    }
  }, [boosts])

  if (!isPro) {
    return (
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket weight="duotone" size={24} />
            Bid Boost History
          </CardTitle>
          <CardDescription>
            Upgrade to Pro to track ROI of your bid boosts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.href = '/pro-upgrade'}>
            Upgrade to Pro - $50/mo
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card glass={isPro}>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-black dark:text-white">{analytics.totalBoosts}</div>
            <div className="text-sm text-black dark:text-white mt-1">Total Boosts</div>
          </CardContent>
        </Card>
        <Card glass={isPro}>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{analytics.wonBoosts}</div>
            <div className="text-sm text-black dark:text-white mt-1">Wins</div>
          </CardContent>
        </Card>
        <Card glass={isPro}>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-black dark:text-white">${analytics.totalSpent.toLocaleString()}</div>
            <div className="text-sm text-black dark:text-white mt-1">Total Spent</div>
          </CardContent>
        </Card>
        <Card glass={isPro}>
          <CardContent className="p-6 text-center">
            <div className={`text-3xl font-bold ${analytics.roi >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {analytics.roi >= 0 ? '+' : ''}{analytics.roi.toFixed(0)}%
            </div>
            <div className="text-sm text-black dark:text-white mt-1">ROI</div>
          </CardContent>
        </Card>
      </div>

      <Card glass={isPro}>
        <CardHeader>
          <CardTitle>Boost History</CardTitle>
          <CardDescription>
            Track all your bid boosts and their results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {boosts.length === 0 ? (
            <p className="text-center text-black dark:text-white py-8">
              No bid boosts yet. Use bid boosts to increase visibility and win more jobs.
            </p>
          ) : (
            <div className="space-y-4">
              {boosts.map((boost) => {
                const job = jobs.find(j => j.id === boost.jobId)
                return (
                  <div
                    key={boost.id}
                    className="p-4 border border-black/20 dark:border-white/20 flex items-start justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-black dark:text-white">
                          {job?.title || 'Job'}
                        </h3>
                        <Badge variant={boost.result === 'won' ? 'default' : boost.result === 'lost' ? 'destructive' : 'secondary'}>
                          {boost.result}
                        </Badge>
                      </div>
                      <div className="text-sm text-black dark:text-white space-y-1">
                        <p>Boost Amount: ${boost.amount.toLocaleString()}</p>
                        {boost.jobValue && (
                          <p>Job Value: ${boost.jobValue.toLocaleString()}</p>
                        )}
                        <p>Date: {new Date(boost.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {boost.result === 'won' && boost.jobValue && (
                      <div className="text-right">
                        <p className="text-sm text-black dark:text-white">ROI</p>
                        <p className={`text-lg font-bold ${((boost.jobValue - boost.amount) / boost.amount) * 100 >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {((boost.jobValue - boost.amount) / boost.amount * 100).toFixed(0)}%
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
