import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartLine, TrendUp, TrendDown, Users, DollarSign, 
  Clock, Target, Award, Calendar, Tag
} from '@phosphor-icons/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLocalKV as useKV } from '@/hooks/useLocalKV'
import type { User, CRMCustomer } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CustomerAnalyticsPanelProps {
  user: User
}

export function CustomerAnalyticsPanel({ user }: CustomerAnalyticsPanelProps) {
  const [customers] = useKV<CRMCustomer[]>("crm-customers", [])
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  const analytics = useMemo(() => {
    const now = new Date()
    const timeframeMap = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      'all': Infinity
    }
    const days = timeframeMap[selectedTimeframe]
    const cutoffDate = days === Infinity ? new Date(0) : new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    const filteredCustomers = customers.filter(c => 
      new Date(c.invitedAt) >= cutoffDate
    )

    const totalCustomers = filteredCustomers.length
    const leads = filteredCustomers.filter(c => c.status === 'lead').length
    const active = filteredCustomers.filter(c => c.status === 'active').length
    const closed = filteredCustomers.filter(c => c.status === 'closed').length
    
    const totalLTV = filteredCustomers.reduce((sum, c) => sum + (c.lifetimeValue || 0), 0)
    const avgLTV = totalCustomers > 0 ? totalLTV / totalCustomers : 0
    
    const conversionRate = totalCustomers > 0 ? (closed / totalCustomers) * 100 : 0
    
    const recentCustomers = filteredCustomers
      .sort((a, b) => new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime())
      .slice(0, 5)

    const topCustomers = filteredCustomers
      .filter(c => c.lifetimeValue > 0)
      .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
      .slice(0, 5)

    const statusDistribution = {
      lead: leads,
      active: active,
      closed: closed,
      other: totalCustomers - leads - active - closed
    }

    return {
      totalCustomers,
      leads,
      active,
      closed,
      totalLTV,
      avgLTV,
      conversionRate,
      recentCustomers,
      topCustomers,
      statusDistribution
    }
  }, [customers, selectedTimeframe])

  return (
    <div className="h-full overflow-y-auto space-y-6 p-4">
      {/* Timeframe Selector */}
      <div className="flex gap-2">
        {(['7d', '30d', '90d', 'all'] as const).map((timeframe) => (
          <button
            key={timeframe}
            onClick={() => setSelectedTimeframe(timeframe)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              selectedTimeframe === timeframe
                ? "bg-black dark:bg-white text-white dark:text-black"
                : "bg-white dark:bg-black border-2 border-transparent dark:border-white text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
            )}
          >
            {timeframe === '7d' ? '7 Days' : timeframe === '30d' ? '30 Days' : timeframe === '90d' ? '90 Days' : 'All Time'}
          </button>
        ))}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-2 border-transparent dark:border-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users size={20} className="text-primary" />
              <Badge variant="outline">{analytics.totalCustomers}</Badge>
            </div>
            <p className="text-2xl font-bold text-black dark:text-white">{analytics.totalCustomers}</p>
            <p className="text-xs text-black/60 dark:text-white/60">Total Customers</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-transparent dark:border-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign size={20} className="text-green-600" />
              <TrendUp size={16} className="text-green-600" />
            </div>
            <p className="text-2xl font-bold text-black dark:text-white">
              ${analytics.totalLTV.toLocaleString()}
            </p>
            <p className="text-xs text-black/60 dark:text-white/60">Total LTV</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-transparent dark:border-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target size={20} className="text-blue-600" />
              <TrendUp size={16} className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-black dark:text-white">
              {analytics.conversionRate.toFixed(1)}%
            </p>
            <p className="text-xs text-black/60 dark:text-white/60">Conversion Rate</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-transparent dark:border-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <ChartLine size={20} className="text-purple-600" />
              <TrendUp size={16} className="text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-black dark:text-white">
              ${analytics.avgLTV.toFixed(0)}
            </p>
            <p className="text-xs text-black/60 dark:text-white/60">Avg LTV</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card className="border-2 border-transparent dark:border-white">
        <CardHeader>
          <CardTitle className="text-lg">Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-sm text-black dark:text-white">Leads</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-white dark:bg-black border border-transparent dark:border-white rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500"
                    style={{ width: `${(analytics.statusDistribution.lead / analytics.totalCustomers) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-black dark:text-white">{analytics.statusDistribution.lead}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-black dark:text-white">Active</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-white dark:bg-black border border-transparent dark:border-white rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500"
                    style={{ width: `${(analytics.statusDistribution.active / analytics.totalCustomers) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-black dark:text-white">{analytics.statusDistribution.active}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-black dark:text-white">Closed</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-white dark:bg-black border border-transparent dark:border-white rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500"
                    style={{ width: `${(analytics.statusDistribution.closed / analytics.totalCustomers) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-black dark:text-white">{analytics.statusDistribution.closed}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Customers */}
      <Card className="border-2 border-transparent dark:border-white">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award size={20} />
            Top Customers by LTV
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topCustomers.length > 0 ? (
              analytics.topCustomers.map((customer, idx) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-black border-2 border-transparent dark:border-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{idx + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-black dark:text-white">{customer.name}</p>
                      <p className="text-xs text-black/60 dark:text-white/60">{customer.email || customer.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${customer.lifetimeValue.toLocaleString()}</p>
                    <Badge variant="outline" className="text-xs">{customer.status}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-black/60 dark:text-white/60 py-4">No customers with LTV yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Customers */}
      <Card className="border-2 border-transparent dark:border-white">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock size={20} />
            Recent Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentCustomers.length > 0 ? (
              analytics.recentCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-black border-2 border-transparent dark:border-white"
                >
                  <div>
                    <p className="font-semibold text-black dark:text-white">{customer.name}</p>
                    <p className="text-xs text-black/60 dark:text-white/60">
                      {new Date(customer.invitedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline">{customer.status}</Badge>
                </div>
              ))
            ) : (
              <p className="text-center text-black/60 dark:text-white/60 py-4">No recent customers</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
