import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  ChartLine, 
  Briefcase,
  CurrencyDollar,
  Clock,
  CheckCircle,
  Users,
  TrendingUp,
  Calendar
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface TodaysOverviewPageProps {
  user?: User
  onNavigate?: (page: string) => void
}

export function TodaysOverviewPage({ user, onNavigate }: TodaysOverviewPageProps) {
  const todayStats = {
    jobsCompleted: 2,
    jobsInProgress: 3,
    revenue: "$1,200",
    hoursWorked: "6.5",
    efficiency: 85,
    customerSatisfaction: 4.8
  }

  const recentActivity = [
    { time: "8:30 AM", action: "Started job: Kitchen Sink Installation", type: "job" },
    { time: "10:15 AM", action: "Received payment: $450", type: "payment" },
    { time: "11:00 AM", action: "Submitted bid: Bathroom Remodel", type: "bid" },
    { time: "2:30 PM", action: "Completed job: Electrical Panel", type: "job" },
    { time: "4:00 PM", action: "Client rated 5 stars", type: "rating" },
  ]

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
              <ChartLine size={28} weight="duotone" className="text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white">Today's Overview</h1>
              <p className="text-base text-black/60 dark:text-white/60 mt-1">
                Real-time snapshot of your business performance
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4 text-center">
              <Briefcase size={24} className="mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-black dark:text-white">{todayStats.jobsCompleted}</p>
              <p className="text-xs text-black/60 dark:text-white/60">Completed</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4 text-center">
              <Clock size={24} className="mx-auto mb-2 text-amber-600 dark:text-amber-400" />
              <p className="text-2xl font-bold text-black dark:text-white">{todayStats.jobsInProgress}</p>
              <p className="text-xs text-black/60 dark:text-white/60">In Progress</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4 text-center">
              <CurrencyDollar size={24} className="mx-auto mb-2 text-green-600 dark:text-green-400" />
              <p className="text-2xl font-bold text-black dark:text-white">{todayStats.revenue}</p>
              <p className="text-xs text-black/60 dark:text-white/60">Revenue</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4 text-center">
              <Clock size={24} className="mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-black dark:text-white">{todayStats.hoursWorked}h</p>
              <p className="text-xs text-black/60 dark:text-white/60">Hours</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4 text-center">
              <TrendingUp size={24} className="mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-black dark:text-white">{todayStats.efficiency}%</p>
              <p className="text-xs text-black/60 dark:text-white/60">Efficiency</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-4 text-center">
              <Users size={24} className="mx-auto mb-2 text-yellow-600 dark:text-yellow-400" />
              <p className="text-2xl font-bold text-black dark:text-white">{todayStats.customerSatisfaction}</p>
              <p className="text-xs text-black/60 dark:text-white/60">Rating</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Chart */}
          <Card className="border-2 border-transparent dark:border-white">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Performance Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-black/60 dark:text-white/60">Efficiency</span>
                    <span className="font-semibold text-black dark:text-white">{todayStats.efficiency}%</span>
                  </div>
                  <Progress value={todayStats.efficiency} className="h-3" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-black/60 dark:text-white/60">Goal Progress</span>
                    <span className="font-semibold text-black dark:text-white">68%</span>
                  </div>
                  <Progress value={68} className="h-3" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-black/60 dark:text-white/60">Customer Satisfaction</span>
                    <span className="font-semibold text-black dark:text-white">{todayStats.customerSatisfaction}/5.0</span>
                  </div>
                  <Progress value={(todayStats.customerSatisfaction / 5) * 100} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-2 border-transparent dark:border-white">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-black dark:text-white">{activity.action}</p>
                      <p className="text-xs text-black/60 dark:text-white/60">{activity.time}</p>
                    </div>
                    <Badge variant="outline" className="border-transparent dark:border-white text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
