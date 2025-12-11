import { Card } from "@/components/ui/card"
import { Lightning, TrendUp, Clock } from "@phosphor-icons/react"
import type { Job } from "@/lib/types"

interface LiveStatsBarProps {
  jobs: Job[]
}

export function LiveStatsBar({ jobs }: LiveStatsBarProps) {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const jobsPostedToday = jobs.filter(j => new Date(j.createdAt) >= todayStart).length
  
  const avgBidTime = jobs.length > 0
    ? Math.round(
        jobs
          .filter(j => j.bids.length > 0)
          .reduce((sum, job) => {
            const firstBid = job.bids.sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )[0]
            const jobTime = new Date(job.createdAt).getTime()
            const bidTime = new Date(firstBid.createdAt).getTime()
            return sum + (bidTime - jobTime) / 1000 / 60
          }, 0) / jobs.filter(j => j.bids.length > 0).length
      )
    : 0

  const completedThisWeek = jobs.filter(j => {
    const jobDate = new Date(j.createdAt)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return j.status === 'completed' && jobDate >= weekAgo
  }).length

  const stats = [
    {
      label: "Jobs Posted Today",
      value: jobsPostedToday,
      icon: Lightning,
      color: "text-primary"
    },
    {
      label: "Avg Bid Time",
      value: `${avgBidTime}m`,
      icon: Clock,
      color: "text-accent"
    },
    {
      label: "Completed This Week",
      value: completedThisWeek,
      icon: TrendUp,
      color: "text-secondary"
    }
  ]

  return (
    <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border-y border-border">
      <div className="container mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-background ${stat.color}`}>
                  <Icon size={28} weight="bold" />
                </div>
                <div>
                  <div className="text-2xl font-heading font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
