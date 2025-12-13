import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useKV } from '@github/spark/hooks'
import {
  CalendarCheck,
  CurrencyDollar,
  CloudRain,
  ChatCircle,
  MapPin,
  TrendUp,
  TrendDown,
  Clock,
  Star,
  Warning,
  CheckCircle,
  Info,
  Sparkle,
  Shield
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { Job, Invoice, User, Certification } from '@/lib/types'

interface EnhancedDailyBriefingProps {
  user: User
  scheduledJobs: Job[]
  onNavigate: (page: string) => void
}

export function EnhancedDailyBriefing({ user, scheduledJobs, onNavigate }: EnhancedDailyBriefingProps) {
  const [jobs] = useKV<Job[]>('jobs', [])
  const [invoices] = useKV<Invoice[]>('invoices', [])
  const [certifications] = useKV<Certification[]>(`certifications-${user.id}`, [])
  
  const currentHour = new Date().getHours()
  const greeting =
    currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening'

  const todayStats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayJobs = scheduledJobs.filter(job => {
      const jobDate = new Date(job.createdAt)
      return jobDate >= today && jobDate < tomorrow
    })

    const expectedEarnings = todayJobs.reduce((sum, job) => {
      return sum + ((job.aiScope.priceLow + job.aiScope.priceHigh) / 2)
    }, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const yesterdayJobs = (jobs || []).filter(job => {
      const jobDate = new Date(job.createdAt)
      return jobDate >= yesterday && jobDate < today && job.status === 'completed'
    })

    const yesterdayInvoices = (invoices || []).filter(inv => {
      const invDate = new Date(inv.createdAt)
      return invDate >= yesterday && invDate < today && inv.contractorId === user.id
    })

    const yesterdayEarnings = yesterdayInvoices.reduce((sum, inv) => sum + inv.total, 0)

    return {
      todayJobs,
      expectedEarnings,
      yesterdayJobs: yesterdayJobs.length,
      yesterdayEarnings
    }
  }, [scheduledJobs, jobs, invoices, user.id])

  const weekCalendar = useMemo(() => {
    const days: Array<{ date: Date; jobCount: number; density: 'empty' | 'light' | 'busy' | 'overbooked' }> = []
    
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      date.setHours(0, 0, 0, 0)
      
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)
      
      const dayJobs = (jobs || []).filter(job => {
        const jobDate = new Date(job.createdAt)
        return jobDate >= date && jobDate < nextDay
      }).length
      
      let density: 'empty' | 'light' | 'busy' | 'overbooked' = 'empty'
      if (dayJobs === 0) density = 'empty'
      else if (dayJobs <= 2) density = 'light'
      else if (dayJobs <= 4) density = 'busy'
      else density = 'overbooked'
      
      days.push({ date, jobCount: dayJobs, density })
    }
    
    return days
  }, [jobs])

  const thisDayLastYear = useMemo(() => {
    const today = new Date()
    const lastYear = new Date(today)
    lastYear.setFullYear(lastYear.getFullYear() - 1)
    lastYear.setHours(0, 0, 0, 0)
    
    const lastYearTomorrow = new Date(lastYear)
    lastYearTomorrow.setDate(lastYearTomorrow.getDate() + 1)
    
    const lastYearJobs = (jobs || []).filter(job => {
      const jobDate = new Date(job.createdAt)
      return jobDate >= lastYear && jobDate < lastYearTomorrow && job.status === 'completed'
    })
    
    const lastYearInvoices = (invoices || []).filter(inv => {
      const invDate = new Date(inv.createdAt)
      return invDate >= lastYear && invDate < lastYearTomorrow && inv.contractorId === user.id
    })
    
    const earnings = lastYearInvoices.reduce((sum, inv) => sum + inv.total, 0)
    
    return {
      jobCount: lastYearJobs.length,
      earnings
    }
  }, [jobs, invoices, user.id])

  const smartAlerts = useMemo(() => {
    const alerts: Array<{
      priority: 'critical' | 'important' | 'info' | 'positive'
      message: string
      action?: string
      icon: React.ReactNode
    }> = []

    const overdueInvoices = (invoices || []).filter(inv => {
      const invDate = new Date(inv.createdAt)
      const daysSince = (Date.now() - invDate.getTime()) / (1000 * 60 * 60 * 24)
      return inv.status === 'overdue' && daysSince > 14 && inv.contractorId === user.id
    })

    if (overdueInvoices.length > 0) {
      const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0)
      alerts.push({
        priority: 'important',
        message: `Invoice overdue 14+ days - $${totalOverdue.toFixed(0)}`,
        action: 'View Invoices',
        icon: <Warning size={20} weight="fill" className="text-black dark:text-white" />
      })
    }

    (certifications || []).forEach(cert => {
      if (cert.neverExpires || !cert.expirationDate) return
      
      const expDate = new Date(cert.expirationDate)
      const daysUntil = Math.ceil((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      
      if (daysUntil < 0) {
        alerts.push({
          priority: 'critical',
          message: `${cert.name} expired ${Math.abs(daysUntil)} days ago`,
          action: 'Update Cert',
          icon: <Shield size={20} weight="fill" className="text-black dark:text-white" />
        })
      } else if (daysUntil <= 7) {
        alerts.push({
          priority: 'critical',
          message: `${cert.name} expires in ${daysUntil} days`,
          action: 'Renew Now',
          icon: <Shield size={20} weight="fill" className="text-black dark:text-white" />
        })
      } else if (daysUntil <= 30) {
        alerts.push({
          priority: 'important',
          message: `${cert.name} expires in ${daysUntil} days`,
          action: 'View Certs',
          icon: <Shield size={20} weight="fill" className="text-black dark:text-white" />
        })
      } else if (daysUntil <= 60) {
        alerts.push({
          priority: 'info',
          message: `${cert.name} expires in ${daysUntil} days`,
          icon: <Shield size={20} weight="duotone" className="text-black dark:text-white" />
        })
      }
    })

    const recentReviews = 3
    if (recentReviews > 0) {
      alerts.push({
        priority: 'positive',
        message: `New review received - 5 stars!`,
        icon: <Star size={20} weight="fill" className="text-black dark:text-white" />
      })
    }

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    return alerts.sort((a, b) => {
      const priorityOrder = { critical: 0, important: 1, info: 2, positive: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }, [invoices, certifications, user.id])

  const personalBests = useMemo(() => {
    const myInvoices = (invoices || []).filter(inv => inv.contractorId === user.id && inv.status === 'paid')
    
    const thisWeekStart = new Date()
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay())
    thisWeekStart.setHours(0, 0, 0, 0)
    
    const thisWeekJobs = (jobs || []).filter(job => {
      const jobDate = new Date(job.createdAt)
      return jobDate >= thisWeekStart && job.status === 'completed'
    }).length
    
    const bestWeekJobs = 8
    const jobsToRecord = bestWeekJobs - thisWeekJobs
    
    if (jobsToRecord > 0 && jobsToRecord <= 2) {
      return `You're ${jobsToRecord} job${jobsToRecord === 1 ? '' : 's'} away from your best week ever!`
    }
    
    const paymentTimes = myInvoices
      .filter(inv => inv.paidDate)
      .map(inv => {
        const created = new Date(inv.createdAt)
        const paid = new Date(inv.paidDate!)
        return (paid.getTime() - created.getTime()) / (1000 * 60 * 60)
      })
    
    if (paymentTimes.length > 0) {
      const fastest = Math.min(...paymentTimes)
      if (fastest < 24) {
        return `Your fastest invoice payment this month: ${fastest.toFixed(1)} hours`
      }
    }
    
    return null
  }, [jobs, invoices, user.id])

  const getDensityColor = (density: string) => {
    switch (density) {
      case 'empty': return 'bg-white dark:bg-black border border-black/10 dark:border-white/10'
      case 'light': return 'bg-white dark:bg-black border-2 border-black dark:border-white'
      case 'busy': return 'bg-white dark:bg-black border-2 border-black dark:border-white'
      case 'overbooked': return 'bg-white dark:bg-black border-2 border-black dark:border-white'
      default: return 'bg-white dark:bg-black border border-black/10 dark:border-white/10'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-white dark:bg-black border-2 border-black dark:border-white'
      case 'important': return 'bg-white dark:bg-black border-2 border-black dark:border-white'
      case 'info': return 'bg-white dark:bg-black border-2 border-black dark:border-white'
      case 'positive': return 'bg-white dark:bg-black border-2 border-black dark:border-white'
      default: return 'bg-white dark:bg-black border border-black/10 dark:border-white/10'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">{greeting}, {user.fullName.split(' ')[0]}!</h2>
          <p className="text-muted-foreground mt-1">Here's your day at a glance</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Expected earnings</p>
          <p className="text-4xl font-bold text-black dark:text-white">
            ${todayStats.expectedEarnings.toLocaleString()}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendUp weight="duotone" size={24} className="text-black dark:text-white" />
            Yesterday Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Yesterday</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{todayStats.yesterdayJobs}</p>
                <p className="text-sm text-muted-foreground">jobs</p>
                <p className="text-2xl font-bold ml-4">${todayStats.yesterdayEarnings.toFixed(0)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Today (scheduled)</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-black dark:text-white">{todayStats.todayJobs.length}</p>
                <p className="text-sm text-muted-foreground">jobs</p>
                <p className="text-2xl font-bold text-black dark:text-white ml-4">${todayStats.expectedEarnings.toFixed(0)}</p>
              </div>
            </div>
          </div>
          {todayStats.expectedEarnings > todayStats.yesterdayEarnings && (
            <Badge className="mt-4 bg-green-500">
              <TrendUp size={16} weight="bold" className="mr-1" />
              {((todayStats.expectedEarnings / todayStats.yesterdayEarnings - 1) * 100).toFixed(0)}% increase
            </Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck weight="duotone" size={24} className="text-primary" />
            Week at a Glance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekCalendar.map((day, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="text-center"
              >
                <p className="text-xs text-muted-foreground mb-2">
                  {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <div 
                  className={`h-16 rounded-lg ${getDensityColor(day.density)} flex items-center justify-center cursor-pointer transition-transform hover:scale-105`}
                  onClick={() => {}}
                >
                  <p className="text-sm font-bold text-white">{day.jobCount || '-'}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{day.date.getDate()}</p>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-white dark:bg-black border border-black/10 dark:border-white/10" />
              <span className="text-muted-foreground">Empty</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-400" />
              <span className="text-muted-foreground">Light</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-muted-foreground">Busy</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-muted-foreground">Overbooked</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {thisDayLastYear.jobCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock weight="duotone" size={24} className="text-primary" />
              This Day Last Year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).replace(new Date().getFullYear().toString(), (new Date().getFullYear() - 1).toString())}
            </p>
            <div className="flex items-baseline gap-4 mt-2">
              <div>
                <p className="text-3xl font-bold">{thisDayLastYear.jobCount}</p>
                <p className="text-sm text-muted-foreground">jobs completed</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">${thisDayLastYear.earnings.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {smartAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkle weight="duotone" size={24} className="text-primary" />
              Smart Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {smartAlerts.map((alert, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-lg border ${getPriorityColor(alert.priority)} flex items-start gap-3`}
              >
                {alert.icon}
                <div className="flex-1">
                  <p className="font-medium">{alert.message}</p>
                  {alert.action && (
                    <Button size="sm" variant="link" className="px-0 mt-1">
                      {alert.action} →
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {personalBests && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendUp weight="duotone" size={32} className="text-primary" />
              <p className="text-lg font-semibold">{personalBests}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {todayStats.todayJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin weight="duotone" size={24} className="text-primary" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayStats.todayJobs.map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{job.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{job.description.substring(0, 100)}...</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-primary font-semibold">
                        ${job.aiScope.priceLow} - ${job.aiScope.priceHigh}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
