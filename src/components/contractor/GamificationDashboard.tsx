import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Trophy, Lightning, Star, Fire, Target, Medal } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { User, Job, Bid } from '@/lib/types'

interface Achievement {
  id: string
  title: string
  description: string
  icon: typeof Trophy
  progress: number
  total: number
  unlocked: boolean
  unlockedAt?: string
}

interface GamificationProps {
  user: User
  jobs: Job[]
  bids: Bid[]
}

export function GamificationDashboard({ user, jobs, bids }: GamificationProps) {
  const completedJobs = jobs.filter(job => 
    job.status === 'completed' && 
    job.bids.some(bid => bid.contractorId === user.id && bid.status === 'accepted')
  ).length

  const myBids = bids.filter(b => b.contractorId === user.id)
  const wins = myBids.filter(b => b.status === 'accepted').length
  const avgResponseTime = myBids.reduce((acc, b) => acc + (b.responseTimeMinutes || 60), 0) / (myBids.length || 1)
  const fastBids = myBids.filter(b => (b.responseTimeMinutes || 60) < 15).length

  const currentStreak = calculateJobStreak(jobs, user.id)
  const longestStreak = 7

  const achievements: Achievement[] = [
    {
      id: 'speed-demon',
      title: 'Speed Demon',
      description: '10 bids under 15 minutes',
      icon: Lightning,
      progress: fastBids,
      total: 10,
      unlocked: fastBids >= 10,
      unlockedAt: fastBids >= 10 ? new Date().toISOString() : undefined
    },
    {
      id: 'customer-favorite',
      title: 'Customer Favorite',
      description: '5 repeat customers',
      icon: Star,
      progress: 0,
      total: 5,
      unlocked: false
    },
    {
      id: 'early-bird',
      title: 'Early Bird',
      description: '20 jobs completed before 10am',
      icon: Target,
      progress: 0,
      total: 20,
      unlocked: false
    },
    {
      id: 'perfect-week',
      title: 'Perfect Week',
      description: '5-star reviews all week',
      icon: Trophy,
      progress: 0,
      total: 7,
      unlocked: false
    },
    {
      id: 'century-club',
      title: 'Century Club',
      description: 'Complete 100 jobs',
      icon: Medal,
      progress: completedJobs,
      total: 100,
      unlocked: completedJobs >= 100
    },
    {
      id: 'streak-master',
      title: 'Streak Master',
      description: '30-day job streak',
      icon: Fire,
      progress: currentStreak,
      total: 30,
      unlocked: currentStreak >= 30
    }
  ]

  const level = calculateLevel(completedJobs)
  const nextLevel = level + 1
  const jobsForNextLevel = (nextLevel * nextLevel) * 5
  const progressToNextLevel = (completedJobs / jobsForNextLevel) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Progress</h2>
          <p className="text-muted-foreground">Achievements and milestones</p>
        </div>
        <Badge variant="default" className="text-2xl py-3 px-6">
          Level {level}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level {level}</span>
              <span className="text-muted-foreground">
                {completedJobs} / {jobsForNextLevel} jobs
              </span>
              <span>Level {nextLevel}</span>
            </div>
            <Progress value={progressToNextLevel} className="h-3" />
            <p className="text-xs text-muted-foreground text-center">
              {jobsForNextLevel - completedJobs} jobs until Level {nextLevel}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fire className="h-5 w-5 text-orange-500" />
            Current Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-orange-500/10 rounded-lg">
              <div className="text-3xl font-bold text-orange-500">{currentStreak}</div>
              <div className="text-sm text-muted-foreground">Day Job Streak</div>
            </div>
            <div className="text-center p-4 bg-blue-500/10 rounded-lg">
              <div className="text-3xl font-bold text-blue-500">{longestStreak}</div>
              <div className="text-sm text-muted-foreground">Longest Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-4">Achievements</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {achievements.map((achievement) => {
            const Icon = achievement.icon
            const progressPercent = (achievement.progress / achievement.total) * 100

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={achievement.unlocked ? 'border-primary bg-primary/5' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`
                        p-3 rounded-lg
                        ${achievement.unlocked 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                        }
                      `}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{achievement.title}</h4>
                          {achievement.unlocked && (
                            <Badge variant="default" className="text-xs">
                              Unlocked
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {achievement.description}
                        </p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{achievement.progress} / {achievement.total}</span>
                            <span>{Math.round(progressPercent)}%</span>
                          </div>
                          <Progress 
                            value={progressPercent} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-primary">{completedJobs}</div>
              <div className="text-sm text-muted-foreground">Jobs Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{wins}</div>
              <div className="text-sm text-muted-foreground">Bids Won</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {Math.round(avgResponseTime)}m
              </div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{currentStreak}</div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function calculateLevel(completedJobs: number): number {
  if (completedJobs < 5) return 1
  if (completedJobs < 20) return 2
  if (completedJobs < 50) return 3
  if (completedJobs < 100) return 4
  if (completedJobs < 200) return 5
  if (completedJobs < 500) return 6
  return 7
}

function calculateJobStreak(jobs: Job[], contractorId: string): number {
  const completedJobs = jobs
    .filter(job => 
      job.status === 'completed' && 
      job.bids.some(bid => bid.contractorId === contractorId && bid.status === 'accepted')
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  if (completedJobs.length === 0) return 0

  let streak = 1
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastJobDate = new Date(completedJobs[0].createdAt)
  lastJobDate.setHours(0, 0, 0, 0)

  const daysSinceLastJob = Math.floor((today.getTime() - lastJobDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysSinceLastJob > 1) return 0

  for (let i = 1; i < completedJobs.length; i++) {
    const currentDate = new Date(completedJobs[i - 1].createdAt)
    const previousDate = new Date(completedJobs[i].createdAt)
    
    currentDate.setHours(0, 0, 0, 0)
    previousDate.setHours(0, 0, 0, 0)
    
    const dayDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (dayDiff === 1) {
      streak++
    } else if (dayDiff > 1) {
      break
    }
  }

  return streak
}
