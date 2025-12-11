import { Card } from "@/components/ui/card"
import { Lightning, TrendUp, Clock } from "@phosphor-icons/react"
import type { Job } from "@/lib/types"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface LiveStatsBarProps {
  jobs: Job[]
}

export function LiveStatsBar({ jobs }: LiveStatsBarProps) {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const [displayJobsToday, setDisplayJobsToday] = useState(0)
  const [displayCompleted, setDisplayCompleted] = useState(0)
  
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

  useEffect(() => {
    const duration = 500
    const steps = 20
    const increment = jobsPostedToday / steps
    let current = 0
    const interval = setInterval(() => {
      current += increment
      if (current >= jobsPostedToday) {
        setDisplayJobsToday(jobsPostedToday)
        clearInterval(interval)
      } else {
        setDisplayJobsToday(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(interval)
  }, [jobsPostedToday])

  useEffect(() => {
    const duration = 500
    const steps = 20
    const increment = completedThisWeek / steps
    let current = 0
    const interval = setInterval(() => {
      current += increment
      if (current >= completedThisWeek) {
        setDisplayCompleted(completedThisWeek)
        clearInterval(interval)
      } else {
        setDisplayCompleted(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(interval)
  }, [completedThisWeek])

  const stats = [
    {
      label: "Jobs Posted Today",
      value: displayJobsToday,
      icon: Lightning,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      label: "Avg Bid Time",
      value: `${avgBidTime}m`,
      icon: Clock,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      label: "Completed This Week",
      value: displayCompleted,
      icon: TrendUp,
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    }
  ]

  return (
    <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border-y border-border">
      <div className="container mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <motion.div 
                key={stat.label} 
                className="flex items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
              >
                <div className={`p-3 rounded-lg ${stat.bgColor} ${stat.color}`}>
                  <Icon size={28} weight="bold" />
                </div>
                <div>
                  <motion.div 
                    className="text-2xl font-heading font-bold"
                    key={stat.value}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
