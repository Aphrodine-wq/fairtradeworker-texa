/**
 * VOID Analytics Window - Analytics and reporting dashboard
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, Users, Target } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Metric {
  id: string
  label: string
  value: string | number
  change: number
  icon: React.ReactNode
  color: string
}

export function AnalyticsWindow() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  const metrics: Metric[] = [
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: '$125,450',
      change: 12.5,
      icon: <DollarSign size={24} weight="duotone" />,
      color: 'text-[#00f0ff]',
    },
    {
      id: 'customers',
      label: 'Active Customers',
      value: 142,
      change: 8.3,
      icon: <Users size={24} weight="duotone" />,
      color: 'text-[#10b981]',
    },
    {
      id: 'deals',
      label: 'Won Deals',
      value: 23,
      change: -2.1,
      icon: <Target size={24} weight="duotone" />,
      color: 'text-[#8b5cf6]',
    },
    {
      id: 'conversion',
      label: 'Conversion Rate',
      value: '34.2%',
      change: 5.7,
      icon: <TrendingUp size={24} weight="duotone" />,
      color: 'text-[#f59e0b]',
    },
  ]

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="p-6 border-b border-[#00f0ff]/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Analytics</h2>
            <p className="text-sm text-gray-400">Business insights and metrics</p>
          </div>
          <div className="flex items-center gap-2">
            {(['week', 'month', 'quarter', 'year'] as const).map(period => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className={cn(
                  selectedPeriod === period
                    ? 'bg-[#00f0ff] text-black'
                    : 'border-[#00f0ff]/30 text-white hover:bg-[#00f0ff]/10',
                  'capitalize'
                )}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-6 rounded-xl border border-[#00f0ff]/20 bg-black/30",
                "hover:bg-[#00f0ff]/5 hover:border-[#00f0ff]/40 transition-all"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-lg bg-black/50", metric.color)}>
                  {metric.icon}
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-sm font-semibold",
                  metric.change >= 0 ? "text-[#10b981]" : "text-[#f59e0b]"
                )}>
                  {metric.change >= 0 ? (
                    <TrendingUp size={16} weight="bold" />
                  ) : (
                    <TrendingDown size={16} weight="bold" />
                  )}
                  {Math.abs(metric.change)}%
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">{metric.label}</p>
                <p className={cn("text-2xl font-bold", metric.color)}>
                  {metric.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 rounded-xl border border-[#00f0ff]/20 bg-black/30">
            <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>Chart visualization coming soon</p>
            </div>
          </div>
          <div className="p-6 rounded-xl border border-[#00f0ff]/20 bg-black/30">
            <h3 className="text-lg font-semibold mb-4">Deal Pipeline</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>Chart visualization coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
