import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  Gift, 
  Trophy,
  Star,
  CheckCircle,
  Clock,
  TrendingUp,
  Sparkle
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface EarnRewardsPageProps {
  user?: User
  onNavigate?: (page: string) => void
}

export function EarnRewardsPage({ user, onNavigate }: EarnRewardsPageProps) {
  const rewards = [
    { 
      id: 1, 
      name: "Complete 10 Jobs", 
      description: "Earn $50 credit", 
      progress: 7, 
      target: 10, 
      reward: "$50",
      status: "in-progress"
    },
    { 
      id: 2, 
      name: "Get 5 Five-Star Reviews", 
      description: "Unlock Pro features for 1 month", 
      progress: 3, 
      target: 5, 
      reward: "1 Month Pro",
      status: "in-progress"
    },
    { 
      id: 3, 
      name: "Refer 3 Friends", 
      description: "Get $75 bonus", 
      progress: 2, 
      target: 3, 
      reward: "$75",
      status: "in-progress"
    },
    { 
      id: 4, 
      name: "Complete 50 Jobs", 
      description: "Earn $200 credit + badge", 
      progress: 45, 
      target: 50, 
      reward: "$200 + Badge",
      status: "in-progress"
    },
  ]

  const completedRewards = [
    { id: 5, name: "First Job Completed", reward: "$10", completedDate: "2024-12-15" },
    { id: 6, name: "First 5-Star Review", reward: "Badge", completedDate: "2024-12-20" },
  ]

  const totalEarned = "$60"
  const points = 1250

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate?.('home')}
            className="mb-4 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-black dark:bg-white">
              <Gift size={28} weight="duotone" className="text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white">Earn Rewards</h1>
              <p className="text-base text-black/60 dark:text-white/60 mt-1">
                Complete challenges and unlock rewards for your business
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-2 border-transparent dark:border-white bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Gift size={32} className="text-primary" />
                <Trophy size={24} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Total Earned</p>
              <p className="text-3xl font-bold text-black dark:text-white">{totalEarned}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Star size={32} className="text-primary" />
                <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Reward Points</p>
              <p className="text-3xl font-bold text-black dark:text-white">{points.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
                <Sparkle size={24} className="text-primary" />
              </div>
              <p className="text-sm text-black/60 dark:text-white/60 mb-1">Completed</p>
              <p className="text-3xl font-bold text-black dark:text-white">{completedRewards.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Challenges */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Active Challenges</h2>
          <div className="space-y-4">
            {rewards.map((reward) => (
              <Card key={reward.id} className="border-2 border-transparent dark:border-white">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-black dark:text-white">{reward.name}</h3>
                        <Badge variant="outline" className="border-transparent dark:border-white">
                          {reward.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-black/60 dark:text-white/60 mb-3">{reward.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-black/60 dark:text-white/60">Progress</span>
                          <span className="font-semibold text-black dark:text-white">
                            {reward.progress} / {reward.target}
                          </span>
                        </div>
                        <Progress value={(reward.progress / reward.target) * 100} className="h-2" />
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-2xl font-bold text-primary mb-1">{reward.reward}</p>
                      <p className="text-xs text-black/60 dark:text-white/60">Reward</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Completed Rewards */}
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Completed Rewards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedRewards.map((reward) => (
              <Card key={reward.id} className="border-2 border-transparent dark:border-white bg-green-50 dark:bg-green-950/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                        <h3 className="font-bold text-black dark:text-white">{reward.name}</h3>
                      </div>
                      <p className="text-sm text-black/60 dark:text-white/60 mb-2">
                        Completed: {reward.completedDate}
                      </p>
                      <Badge className="bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300">
                        {reward.reward}
                      </Badge>
                    </div>
                    <Trophy size={32} className="text-yellow-600 dark:text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
