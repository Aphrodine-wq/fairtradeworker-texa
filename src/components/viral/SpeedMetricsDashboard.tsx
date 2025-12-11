import { memo } from "react"
import { Card } from "@/components/ui/card"
import { Clock, TrendUp, CurrencyDollar } from "@phosphor-icons/react"
import type { Job, ContractorReferral } from "@/lib/types"
import { calculateJobToFirstBidTime } from "@/lib/viral"

interface SpeedMetricsDashboardProps {
  jobs: Job[]
  referrals: ContractorReferral[]
}

type MetricStatus = 'success' | 'warning' | 'danger'

interface Metric {
  label: string
  value: string | number
  target: string
  status: MetricStatus
  icon: typeof Clock
}

export const SpeedMetricsDashboard = memo(function SpeedMetricsDashboard({ jobs, referrals }: SpeedMetricsDashboardProps) {
  const avgBidTime = jobs.length > 0
    ? Math.round(
        jobs
          .filter(j => j.bids.length > 0)
          .reduce((sum, job) => {
            const firstBid = job.bids.sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )[0]
            return sum + calculateJobToFirstBidTime(job.createdAt, firstBid?.createdAt)
          }, 0) / jobs.filter(j => j.bids.length > 0).length
      )
    : 0

  const inviteConversion = referrals.length > 0
    ? Math.round((referrals.filter(r => r.status !== 'sent').length / referrals.length) * 100)
    : 0

  const sameDayPayouts = jobs.filter(j => j.status === 'completed').length

  const getStatus = (value: number, target: number, reverse = false): MetricStatus => {
    const percentage = (value / target) * 100
    if (reverse) {
      if (percentage <= 100) return 'success'
      if (percentage <= 150) return 'warning'
      return 'danger'
    } else {
      if (percentage >= 100) return 'success'
      if (percentage >= 70) return 'warning'
      return 'danger'
    }
  }

  const metrics: Metric[] = [
    {
      label: "Job-to-First-Bid Time",
      value: `${avgBidTime} min`,
      target: "< 15 min",
      status: getStatus(avgBidTime, 15, true),
      icon: Clock,
    },
    {
      label: "Invite-to-Signup Conversion",
      value: `${inviteConversion}%`,
      target: "> 35%",
      status: getStatus(inviteConversion, 35),
      icon: TrendUp,
    },
    {
      label: "Same-Day Payout Count",
      value: sameDayPayouts,
      target: "> 100/day",
      status: getStatus(sameDayPayouts, 100),
      icon: CurrencyDollar,
    },
  ]

  const getStatusColor = (status: MetricStatus) => {
    switch (status) {
      case 'success':
        return 'bg-primary text-primary-foreground'
      case 'warning':
        return 'bg-accent text-accent-foreground'
      case 'danger':
        return 'bg-destructive text-destructive-foreground'
    }
  }

  const getStatusLight = (status: MetricStatus) => {
    switch (status) {
      case 'success':
        return 'bg-primary'
      case 'warning':
        return 'bg-accent'
      case 'danger':
        return 'bg-destructive'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Speed Metrics</h2>
        <p className="text-muted-foreground">Real-time performance tracking</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${getStatusColor(metric.status)}`}>
                  <Icon size={24} weight="bold" />
                </div>
                <div className={`h-3 w-3 rounded-full ${getStatusLight(metric.status)} animate-pulse`} />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">{metric.label}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-heading font-bold">{metric.value}</span>
                  <span className="text-sm text-muted-foreground">{metric.target}</span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="p-6">
        <h3 className="font-heading text-lg font-semibold mb-4">Status Key</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-primary" />
            <span className="text-sm">Green - On Target</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-accent" />
            <span className="text-sm">Yellow - Needs Attention</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-destructive" />
            <span className="text-sm">Red - Action Required</span>
          </div>
        </div>
      </Card>
    </div>
  )
})
