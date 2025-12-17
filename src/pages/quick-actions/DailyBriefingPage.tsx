import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Newspaper, 
  Calendar,
  Briefcase,
  CurrencyDollar,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface DailyBriefingPageProps {
  user?: User
  onNavigate?: (page: string) => void
}

export function DailyBriefingPage({ user, onNavigate }: DailyBriefingPageProps) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  
  const todaySchedule = [
    { time: "9:00 AM", job: "Kitchen Sink Installation", client: "John Smith", location: "Downtown", status: "upcoming" },
    { time: "11:30 AM", job: "Bathroom Tile Repair", client: "Sarah Johnson", location: "Northside", status: "upcoming" },
    { time: "2:00 PM", job: "Electrical Panel Upgrade", client: "Mike Davis", location: "Eastside", status: "upcoming" },
  ]

  const alerts = [
    { type: "warning", message: "2 invoices due today", action: "View Invoices" },
    { type: "info", message: "3 new job opportunities in your area", action: "Browse Jobs" },
    { type: "success", message: "Payment received: $450", action: "View Payment" },
  ]

  const metrics = [
    { label: "Jobs Today", value: "3", icon: Briefcase, color: "text-primary" },
    { label: "Expected Revenue", value: "$1,200", icon: CurrencyDollar, color: "text-green-600 dark:text-green-400" },
    { label: "Avg. Response Time", value: "4.2m", icon: Clock, color: "text-primary" },
    { label: "Win Rate", value: "68%", icon: TrendingUp, color: "text-green-600 dark:text-green-400" },
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
              <Newspaper size={28} weight="duotone" className="text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white">Daily Briefing</h1>
              <p className="text-base text-black/60 dark:text-white/60 mt-1">
                {today}
              </p>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <Card key={metric.label} className="border-2 border-transparent dark:border-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-black/60 dark:text-white/60">{metric.label}</span>
                    <Icon size={16} className={metric.color} />
                  </div>
                  <p className="text-2xl font-bold text-black dark:text-white">{metric.value}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <Card className="border-2 border-transparent dark:border-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                <Calendar size={20} />
                Today's Schedule
              </CardTitle>
              <CardDescription className="text-black/60 dark:text-white/60">
                {todaySchedule.length} jobs scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaySchedule.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm font-bold text-black dark:text-white">{item.time}</p>
                      <Badge variant="outline" className="mt-1 border-transparent dark:border-white">
                        {item.status}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-black dark:text-white mb-1">{item.job}</h4>
                      <p className="text-sm text-black/60 dark:text-white/60 mb-1">Client: {item.client}</p>
                      <p className="text-xs text-black/60 dark:text-white/60">📍 {item.location}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts & Notifications */}
          <Card className="border-2 border-transparent dark:border-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                <AlertCircle size={20} />
                Alerts & Notifications
              </CardTitle>
              <CardDescription className="text-black/60 dark:text-white/60">
                Important updates for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "p-4 rounded-lg border-2",
                      alert.type === "warning" ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30" :
                      alert.type === "info" ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30" :
                      "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-black dark:text-white mb-1">{alert.message}</p>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-primary"
                          onClick={() => onNavigate?.(alert.action.toLowerCase().replace(/\s+/g, '-'))}
                        >
                          {alert.action} →
                        </Button>
                      </div>
                      {alert.type === "success" && (
                        <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6 border-2 border-transparent dark:border-white">
          <CardHeader>
            <CardTitle className="text-black dark:text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col border-transparent dark:border-white text-black dark:text-white"
                onClick={() => onNavigate?.('browse-jobs')}
              >
                <Briefcase size={24} className="mb-2" />
                <span className="text-sm">Browse Jobs</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col border-transparent dark:border-white text-black dark:text-white"
                onClick={() => onNavigate?.('invoices')}
              >
                <CurrencyDollar size={24} className="mb-2" />
                <span className="text-sm">View Invoices</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col border-transparent dark:border-white text-black dark:text-white"
                onClick={() => onNavigate?.('my-jobs')}
              >
                <CheckCircle size={24} className="mb-2" />
                <span className="text-sm">My Jobs</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col border-transparent dark:border-white text-black dark:text-white"
                onClick={() => onNavigate?.('route-builder')}
              >
                <Calendar size={24} className="mb-2" />
                <span className="text-sm">Plan Routes</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
