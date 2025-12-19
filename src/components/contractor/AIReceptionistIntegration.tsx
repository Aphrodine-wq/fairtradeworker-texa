import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Phone, 
  Brain, 
  ArrowRight,
  CheckCircle,
  Clock,
  CurrencyDollar,
  Users,
  Calendar,
  FileText,
  ChartLine,
  Warning,
  Sparkle,
  PhoneCall,
  Microphone,
  CalendarCheck,
  Briefcase
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AIReceptionistIntegrationProps {
  user: User
  onNavigate?: (page: string) => void
}

export function AIReceptionistIntegration({ user, onNavigate }: AIReceptionistIntegrationProps) {
  const isPro = user.isPro || false
  
  // Mock data for demonstration
  const callStats = {
    totalCalls: 247,
    answered: 231,
    missed: 16,
    jobsCreated: 89,
    appointmentsScheduled: 142,
    avgCallDuration: "4m 32s",
    conversionRate: 36
  }

  const costAnalysis = useMemo(() => {
    // Cost per Pro user
    const baseCostPerUser = 15 // $15/month base cost
    const perCallCost = 0.05 // $0.05 per call
    const transcriptionCost = 0.02 // $0.02 per minute
    const avgCallMinutes = 4.5
    
    const monthlyCalls = callStats.totalCalls
    const monthlyCost = baseCostPerUser + (monthlyCalls * perCallCost) + (monthlyCalls * avgCallMinutes * transcriptionCost)
    
    // At scale (1000 Pro users)
    const scaleUsers = 1000
    const scaleCallsPerUser = monthlyCalls
    const scaleTotalCalls = scaleUsers * scaleCallsPerUser
    const scaleCost = (baseCostPerUser * scaleUsers) + (scaleTotalCalls * perCallCost) + (scaleTotalCalls * avgCallMinutes * transcriptionCost)
    const scaleCostPerUser = scaleCost / scaleUsers
    
    // Volume discounts
    const volumeDiscount = scaleUsers > 500 ? 0.20 : scaleUsers > 200 ? 0.10 : 0
    const discountedCost = scaleCost * (1 - volumeDiscount)
    const discountedCostPerUser = discountedCost / scaleUsers

    return {
      current: {
        monthlyCost,
        costPerCall: monthlyCost / monthlyCalls,
        baseCost: baseCostPerUser
      },
      atScale: {
        totalCost: scaleCost,
        costPerUser: scaleCostPerUser,
        totalCalls: scaleTotalCalls
      },
      withDiscount: {
        totalCost: discountedCost,
        costPerUser: discountedCostPerUser,
        savings: scaleCost - discountedCost
      },
      volumeDiscount: volumeDiscount * 100
    }
  }, [])

  if (!isPro) {
    return (
      <Card className="border-2 border-transparent dark:border-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black dark:text-white">
            <Phone size={24} weight="duotone" className="text-primary" />
            AI Receptionist
          </CardTitle>
          <CardDescription className="text-black/60 dark:text-white/60">
            Upgrade to Pro to unlock AI-powered phone answering and call routing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => onNavigate?.('pro-upgrade')}
            className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
          >
            Upgrade to Pro - $59/mo
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card className="border-2 border-transparent dark:border-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black dark:text-white">
            <Phone size={24} weight="duotone" className="text-primary" />
            AI Receptionist Integration
          </CardTitle>
          <CardDescription className="text-black/60 dark:text-white/60">
            Your dedicated AI assistant answers calls, routes through the platform, and creates jobs automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Call Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <PhoneCall size={16} className="text-primary" />
                <span className="text-xs text-black/60 dark:text-white/60">Total Calls</span>
              </div>
              <p className="text-2xl font-bold text-black dark:text-white">{callStats.totalCalls}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                <span className="text-xs text-black/60 dark:text-white/60">Answered</span>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{callStats.answered}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase size={16} className="text-primary" />
                <span className="text-xs text-black/60 dark:text-white/60">Jobs Created</span>
              </div>
              <p className="text-2xl font-bold text-black dark:text-white">{callStats.jobsCreated}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CalendarCheck size={16} className="text-primary" />
                <span className="text-xs text-black/60 dark:text-white/60">Appointments</span>
              </div>
              <p className="text-2xl font-bold text-black dark:text-white">{callStats.appointmentsScheduled}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-primary" />
                <span className="text-xs text-black/60 dark:text-white/60">Avg Duration</span>
              </div>
              <p className="text-2xl font-bold text-black dark:text-white">{callStats.avgCallDuration}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ChartLine size={16} className="text-green-600 dark:text-green-400" />
                <span className="text-xs text-black/60 dark:text-white/60">Conversion</span>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{callStats.conversionRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Tabs */}
      <Tabs defaultValue="phone-answering" className="w-full">
        <TabsList className="grid w-full grid-cols-4 border-transparent dark:border-white">
          <TabsTrigger value="phone-answering" className="text-black dark:text-white data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">
            Phone Answering
          </TabsTrigger>
          <TabsTrigger value="call-routing" className="text-black dark:text-white data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">
            Call Routing
          </TabsTrigger>
          <TabsTrigger value="integration" className="text-black dark:text-white data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">
            Integration
          </TabsTrigger>
          <TabsTrigger value="cost-analysis" className="text-black dark:text-white data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">
            Cost Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="phone-answering" className="mt-6">
          <Card className="border-2 border-transparent dark:border-white">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Phone Answering System</CardTitle>
              <CardDescription className="text-black/60 dark:text-white/60">
                Your AI Receptionist answers every call professionally
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone size={20} className="text-primary" />
                    <h3 className="font-semibold text-black dark:text-white">24/7 Availability</h3>
                  </div>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    Never miss a call. Your AI Receptionist answers instantly, even after hours and on weekends.
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain size={20} className="text-primary" />
                    <h3 className="font-semibold text-black dark:text-white">Natural Conversation</h3>
                  </div>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    Advanced AI understands context, answers questions, and handles complex requests naturally.
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Microphone size={20} className="text-primary" />
                    <h3 className="font-semibold text-black dark:text-white">Voice-to-Text</h3>
                  </div>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    All calls are transcribed in real-time with 99% accuracy. Full transcripts saved automatically.
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={20} className="text-primary" />
                    <h3 className="font-semibold text-black dark:text-white">Call Summaries</h3>
                  </div>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    AI generates detailed summaries with key information, next steps, and action items.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="call-routing" className="mt-6">
          <Card className="border-2 border-transparent dark:border-white">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Call Routing Through Platform</CardTitle>
              <CardDescription className="text-black/60 dark:text-white/60">
                Seamless integration with your existing workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Briefcase size={24} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-black dark:text-white mb-2">Automatic Job Creation</h3>
                    <p className="text-sm text-black/60 dark:text-white/60 mb-3">
                      When a caller needs service, AI extracts details and creates a job in your system automatically.
                    </p>
                    <ul className="text-sm text-black/60 dark:text-white/60 space-y-1 list-disc list-inside">
                      <li>Extracts project description, location, urgency</li>
                      <li>Creates job with proper categorization</li>
                      <li>Sends you notification with call summary</li>
                      <li>Customer receives confirmation via SMS/email</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CalendarCheck size={24} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-black dark:text-white mb-2">Appointment Scheduling</h3>
                    <p className="text-sm text-black/60 dark:text-white/60 mb-3">
                      AI checks your calendar availability and schedules appointments directly.
                    </p>
                    <ul className="text-sm text-black/60 dark:text-white/60 space-y-1 list-disc list-inside">
                      <li>Syncs with Google Calendar, Outlook, iCal</li>
                      <li>Offers available time slots to callers</li>
                      <li>Books appointments and sends confirmations</li>
                      <li>Adds to your calendar automatically</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users size={24} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-black dark:text-white mb-2">Customer Database</h3>
                    <p className="text-sm text-black/60 dark:text-white/60 mb-3">
                      Every call creates or updates customer records in your CRM.
                    </p>
                    <ul className="text-sm text-black/60 dark:text-white/60 space-y-1 list-disc list-inside">
                      <li>Auto-creates customer profiles from calls</li>
                      <li>Updates existing customer records</li>
                      <li>Tracks call history and interactions</li>
                      <li>Links jobs and appointments to customers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="mt-6">
          <Card className="border-2 border-transparent dark:border-white">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Platform Integration</CardTitle>
              <CardDescription className="text-black/60 dark:text-white/60">
                Deep integration with your business tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border-2 border-transparent dark:border-white rounded-lg">
                  <h3 className="font-semibold text-black dark:text-white mb-2 flex items-center gap-2">
                    <Briefcase size={20} />
                    Job Posting System
                  </h3>
                  <p className="text-sm text-black/60 dark:text-white/60 mb-3">
                    Calls automatically create jobs in your dashboard with all extracted information.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-black/60 dark:text-white/60">
                    <CheckCircle size={12} className="text-green-600 dark:text-green-400" />
                    <span>Auto-categorization</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-black/60 dark:text-white/60">
                    <CheckCircle size={12} className="text-green-600 dark:text-green-400" />
                    <span>Priority detection</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-black/60 dark:text-white/60">
                    <CheckCircle size={12} className="text-green-600 dark:text-green-400" />
                    <span>Location mapping</span>
                  </div>
                </div>
                <div className="p-4 border-2 border-transparent dark:border-white rounded-lg">
                  <h3 className="font-semibold text-black dark:text-white mb-2 flex items-center gap-2">
                    <Calendar size={20} />
                    Calendar Sync
                  </h3>
                  <p className="text-sm text-black/60 dark:text-white/60 mb-3">
                    Real-time availability checking and automatic appointment booking.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-black/60 dark:text-white/60">
                    <CheckCircle size={12} className="text-green-600 dark:text-green-400" />
                    <span>Google Calendar</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-black/60 dark:text-white/60">
                    <CheckCircle size={12} className="text-green-600 dark:text-green-400" />
                    <span>Outlook / Office 365</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-black/60 dark:text-white/60">
                    <CheckCircle size={12} className="text-green-600 dark:text-green-400" />
                    <span>iCal / Apple Calendar</span>
                  </div>
                </div>
                <div className="p-4 border-2 border-transparent dark:border-white rounded-lg">
                  <h3 className="font-semibold text-black dark:text-white mb-2 flex items-center gap-2">
                    <Users size={20} />
                    CRM Integration
                  </h3>
                  <p className="text-sm text-black/60 dark:text-white/60 mb-3">
                    All calls feed into your customer relationship management system.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-black/60 dark:text-white/60">
                    <CheckCircle size={12} className="text-green-600 dark:text-green-400" />
                    <span>Customer profiles</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-black/60 dark:text-white/60">
                    <CheckCircle size={12} className="text-green-600 dark:text-green-400" />
                    <span>Call history</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-black/60 dark:text-white/60">
                    <CheckCircle size={12} className="text-green-600 dark:text-green-400" />
                    <span>Interaction tracking</span>
                  </div>
                </div>
                <div className="p-4 border-2 border-transparent dark:border-white rounded-lg">
                  <h3 className="font-semibold text-black dark:text-white mb-2 flex items-center gap-2">
                    <FileText size={20} />
                    Invoicing & Payments
                  </h3>
                  <p className="text-sm text-black/60 dark:text-white/60 mb-3">
                    Generate quotes and invoices directly from call information.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-black/60 dark:text-white/60">
                    <CheckCircle size={12} className="text-green-600 dark:text-green-400" />
                    <span>Instant quotes</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-black/60 dark:text-white/60">
                    <CheckCircle size={12} className="text-green-600 dark:text-green-400" />
                    <span>Auto-invoice creation</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-black/60 dark:text-white/60">
                    <CheckCircle size={12} className="text-green-600 dark:text-green-400" />
                    <span>Payment links</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost-analysis" className="mt-6">
          <Card className="border-2 border-transparent dark:border-white">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Cost Analysis at Scale</CardTitle>
              <CardDescription className="text-black/60 dark:text-white/60">
                Pricing structure and volume discounts for Pro users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Cost */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold text-black dark:text-white mb-3">Your Current Cost</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-black/60 dark:text-white/60 mb-1">Base Cost</p>
                    <p className="text-xl font-bold text-black dark:text-white">
                      ${costAnalysis.current.baseCost.toFixed(2)}/mo
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-black/60 dark:text-white/60 mb-1">Per Call</p>
                    <p className="text-xl font-bold text-black dark:text-white">
                      ${costAnalysis.current.costPerCall.toFixed(3)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-black/60 dark:text-white/60 mb-1">Total Monthly</p>
                    <p className="text-xl font-bold text-primary">
                      ${costAnalysis.current.monthlyCost.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* At Scale Analysis */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold text-black dark:text-white mb-3">Cost at Scale (1,000 Pro Users)</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-black/60 dark:text-white/60 mb-1">Total Monthly Cost</p>
                    <p className="text-2xl font-bold text-black dark:text-white">
                      ${costAnalysis.atScale.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-black/60 dark:text-white/60 mb-1">Cost Per User</p>
                    <p className="text-2xl font-bold text-primary">
                      ${costAnalysis.atScale.costPerUser.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkle size={16} className="text-green-600 dark:text-green-400" />
                    <span className="text-sm font-semibold text-green-800 dark:text-green-300">
                      Volume Discount: {costAnalysis.volumeDiscount}% off
                    </span>
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    With {costAnalysis.volumeDiscount > 0 ? '500+' : '200+'} Pro users, you save ${costAnalysis.withDiscount.savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}/month
                  </p>
                </div>
              </div>

              {/* Pricing Tiers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-2 border-transparent dark:border-white">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-black dark:text-white mb-2">Starter (1-50 users)</h4>
                    <p className="text-2xl font-bold text-black dark:text-white mb-1">$15/mo</p>
                    <p className="text-xs text-black/60 dark:text-white/60">+ $0.05 per call</p>
                    <p className="text-xs text-black/60 dark:text-white/60 mt-2">+ $0.02 per minute transcription</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-transparent dark:border-white">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-black dark:text-white mb-2">Growth (51-200 users)</h4>
                    <p className="text-2xl font-bold text-primary mb-1">$12/mo</p>
                    <p className="text-xs text-black/60 dark:text-white/60">+ $0.04 per call</p>
                    <p className="text-xs text-black/60 dark:text-white/60 mt-2">10% volume discount</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-transparent dark:border-white">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-black dark:text-white mb-2">Enterprise (500+ users)</h4>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">$10/mo</p>
                    <p className="text-xs text-black/60 dark:text-white/60">+ $0.03 per call</p>
                    <p className="text-xs text-black/60 dark:text-white/60 mt-2">20% volume discount</p>
                  </CardContent>
                </Card>
              </div>

              {/* Cost Breakdown */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold text-black dark:text-white mb-3">Cost Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-black/60 dark:text-white/60">Base subscription (per user)</span>
                    <span className="font-semibold text-black dark:text-white">$15.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-black/60 dark:text-white/60">Per call processing</span>
                    <span className="font-semibold text-black dark:text-white">$0.05</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-black/60 dark:text-white/60">Transcription (per minute)</span>
                    <span className="font-semibold text-black dark:text-white">$0.02</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <span className="font-semibold text-black dark:text-white">Your monthly cost</span>
                    <span className="text-xl font-bold text-primary">
                      ${costAnalysis.current.monthlyCost.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Value Proposition */}
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900/30">
                <div className="flex items-start gap-3">
                  <CheckCircle size={24} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                      Is AI Receptionist Too Cheap at Scale?
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-400 mb-2">
                      At ${costAnalysis.atScale.costPerUser.toFixed(2)} per user with volume discounts, 
                      AI Receptionist remains cost-effective even at enterprise scale. 
                      The infrastructure costs decrease per user as volume increases, 
                      making it sustainable for thousands of Pro users.
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      <strong>ROI:</strong> Each AI Receptionist saves contractors an average of 10+ hours per week 
                      on phone management, worth $500+ in time savings monthly.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
