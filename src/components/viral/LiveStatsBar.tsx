import { Card } from "@/components/ui/card"
import { Lightning, TrendUp, Clock } from "@phosphor-icons/react"
import type { Job } from "@/lib/types"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

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
    const duration = 300
    const steps = 15
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
    const duration = 300
    const steps = 15
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
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      label: "Avg Bid Time",
      value: `${avgBidTime}m`,
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100"
    },
    {
      label: "Completed This Week",
      value: displayCompleted,
      icon: TrendUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    }
  ]

  return (
    <div className="rounded-2xl mx-auto max-w-2xl my-8 bg-white dark:bg-black">
      <div className="flex flex-col md:flex-row gap-4 justify-center py-4 px-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <motion.div 
              key={stat.label} 
              className={cn(
                "flex-1 px-6 py-3 rounded-xl bg-card border-0 flex items-center gap-3"
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.3 }}
            >
              <div className={cn("p-2 rounded-lg bg-primary/20", stat.color)}>
                <Icon size={24} weight="bold" className="text-primary" />
              </div>
              <div>
                <motion.div 
                  className={cn(
                    "text-2xl font-bold text-black dark:text-white"
                  )}
                  key={stat.value}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-black/70 dark:text-white/70">{stat.label}</div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
