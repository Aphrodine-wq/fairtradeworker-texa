import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { FeeComparison } from "./FeeComparison"
import { FeeSavingsDashboard } from "./FeeSavingsDashboard"
import { AvailabilityCalendar } from "./AvailabilityCalendar"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { Briefcase, CurrencyDollar, CheckCircle, Crown, Buildings, TrendUp, MapTrifold, Sun, Sparkle, Shield, Percent, Calendar, Lightning } from "@phosphor-icons/react"
import { BrowseJobs } from "@/components/jobs/BrowseJobs"
import { Invoices } from "./Invoices"
import { EnhancedCRMDashboard } from "./EnhancedCRMDashboard"
import { ContractorReferralSystem } from "@/components/viral/ContractorReferralSystem"
import { CompanySettings } from "./CompanySettings"
import { RouteBuilder } from "./RouteBuilder"
import { EnhancedDailyBriefing } from "./EnhancedDailyBriefing"
import { SmartReplies } from "./SmartReplies"
import { CertificationWallet } from "./CertificationWallet"
import { calculateTotalFeesSaved } from "@/lib/competitiveAdvantage"
import type { User, Job, Invoice } from "@/lib/types"

interface ContractorDashboardProps {
  user: User
  onNavigate: (page: string) => void
}

export function ContractorDashboard({ user, onNavigate }: ContractorDashboardProps) {
  const [jobs] = useKV<Job[]>("jobs", [])
  const [invoices] = useKV<Invoice[]>("invoices", [])
  const [currentUser, setCurrentUser] = useKV<User | null>("current-user", null)

  const handleUserUpdate = (updates: Partial<User>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...updates })
    }
  }

  const handleAvailableNowToggle = (checked: boolean) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        availableNow: checked,
        availableNowSince: checked ? new Date().toISOString() : undefined
      })
    }
  }

  const { myBids, acceptedBids, thisMonthEarnings, totalEarnings, feesSaved, yearlyStats } = useMemo(() => {
    const bids = (jobs || []).flatMap(job =>
      job.bids.filter(bid => bid.contractorId === user.id)
    )
    
    const accepted = bids.filter(bid => bid.status === 'accepted')
    
    const myInvoices = (invoices || []).filter(invoice => invoice.contractorId === user.id)
    const monthEarnings = myInvoices
      .filter(inv => {
        const invDate = new Date(inv.createdAt)
        const now = new Date()
        return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear()
      })
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0)
    
    const total = monthEarnings + (user.referralEarnings || 0)
    
    const allTimePaidInvoices = myInvoices.filter(inv => inv.status === 'paid')
    const allTimeRevenue = allTimePaidInvoices.reduce((sum, inv) => sum + inv.total, 0)
    const totalFeesSaved = calculateTotalFeesSaved(allTimeRevenue)
    
    const thisYear = new Date().getFullYear()
    const thisYearInvoices = myInvoices.filter(inv => {
      const invDate = new Date(inv.createdAt)
      return invDate.getFullYear() === thisYear && inv.status === 'paid'
    })
    const thisYearEarnings = thisYearInvoices.reduce((sum, inv) => sum + inv.total, 0)
    const thisYearJobsCount = thisYearInvoices.length
    const averageJobValue = thisYearJobsCount > 0 ? thisYearEarnings / thisYearJobsCount : 0
    
    return {
      myBids: bids,
      acceptedBids: accepted,
      thisMonthEarnings: monthEarnings,
      totalEarnings: total,
      feesSaved: totalFeesSaved.homeadvisor,
      yearlyStats: {
        totalEarningsThisYear: thisYearEarnings,
        jobsCompletedThisYear: thisYearJobsCount,
        averageJobValue
      }
    }
  }, [jobs, invoices, user.id, user.referralEarnings])

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Contractor/Subcontractor Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.fullName}!</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {/* Available Now Toggle */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-none border-2 border-black dark:border-white bg-white dark:bg-black shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
              <div className="flex items-center gap-2">
                {user.availableNow && (
                  <div className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse" />
                )}
                <Lightning size={20} weight={user.availableNow ? "fill" : "regular"} className={user.availableNow ? "text-black dark:text-white" : "text-muted-foreground"} />
                <span className="text-sm font-medium">Available Now</span>
              </div>
              <Switch
                checked={user.availableNow || false}
                onCheckedChange={handleAvailableNowToggle}
              />
            </div>
            {user.isPro && (
              <Badge className="bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white px-4 py-2 text-base font-black uppercase">
                <Crown weight="fill" className="mr-2" />
                PRO Member
              </Badge>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Jobs
              </CardTitle>
              <Briefcase className="text-black dark:text-white" size={24} weight="duotone" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{acceptedBids.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Open Bids
              </CardTitle>
              <CheckCircle className="text-secondary" size={24} weight="duotone" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {myBids.filter(b => b.status === 'pending').length}
              </div>
            </CardContent>
          </Card>

          <Card className={user.referralEarnings > 0 ? "border-2 border-black/10 dark:border-white/10" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Referral Earnings
              </CardTitle>
              <CurrencyDollar className="text-black dark:text-white" size={24} weight="fill" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black dark:text-white">${user.referralEarnings || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {user.contractorInviteCount || 0} successful invites
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total This Month
              </CardTitle>
              <CurrencyDollar className="text-black dark:text-white" size={24} weight="duotone" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalEarnings}</div>
              {user.referralEarnings > 0 && (
                <p className="text-xs text-black dark:text-white mt-1">
                  +${user.referralEarnings} referrals
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {feesSaved > 0 && (
          <Card className="border-2 border-black/10 dark:border-white/10 bg-white dark:bg-black">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendUp className="text-black dark:text-white" size={24} weight="bold" />
                  <h3 className="text-xl font-semibold">Fees Avoided This Year</h3>
                </div>
                <p className="text-muted-foreground">
                  You've kept 100% of your earnings – no platform fees
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-black dark:text-white">${Math.round(feesSaved).toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-1">vs. competitors</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!user.isPro && (
          <Card className="border-2 border-black/10 dark:border-white/10 bg-white dark:bg-black">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Upgrade to Pro</h3>
                <p className="text-muted-foreground">
                  Get instant payouts, auto-reminders, and more
                </p>
              </div>
              <Button onClick={() => onNavigate('pro-upgrade')} size="lg">
                <Crown weight="fill" className="mr-2" />
                Upgrade
              </Button>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-5 md:grid-cols-10 gap-1">
            <TabsTrigger value="briefing" className="text-xs md:text-sm">
              <Sun className="mr-1 md:mr-2" size={14} weight="duotone" />
              <span className="hidden sm:inline">Briefing</span>
            </TabsTrigger>
            <TabsTrigger value="browse" className="text-xs md:text-sm">Browse</TabsTrigger>
            <TabsTrigger value="savings" className="text-xs md:text-sm">
              <Percent className="mr-1 md:mr-2" size={14} weight="bold" />
              <span className="hidden sm:inline">Savings</span>
            </TabsTrigger>
            <TabsTrigger value="routes" className="text-xs md:text-sm">
              <MapTrifold className="mr-1 md:mr-2" size={14} weight="duotone" />
              <span className="hidden sm:inline">Routes</span>
            </TabsTrigger>
            <TabsTrigger value="availability" className="text-xs md:text-sm">
              <Calendar className="mr-1 md:mr-2" size={14} weight="duotone" />
              <span className="hidden sm:inline">Availability</span>
            </TabsTrigger>
            <TabsTrigger value="crm" className="text-xs md:text-sm">CRM</TabsTrigger>
            <TabsTrigger value="replies" className="text-xs md:text-sm">
              <Sparkle className="mr-1 md:mr-2" size={14} weight="duotone" />
              <span className="hidden sm:inline">Replies</span>
            </TabsTrigger>
            <TabsTrigger value="certifications" className="text-xs md:text-sm">
              <Shield className="mr-1 md:mr-2" size={14} weight="duotone" />
              <span className="hidden sm:inline">Certs</span>
            </TabsTrigger>
            <TabsTrigger value="referrals" className="text-xs md:text-sm">Referrals</TabsTrigger>
            <TabsTrigger value="invoices" className="text-xs md:text-sm">Invoices</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs md:text-sm">
              <Buildings className="mr-1 md:mr-2" size={14} weight="duotone" />
              <span className="hidden sm:inline">Company</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="briefing" className="mt-6">
            <EnhancedDailyBriefing
              user={user}
              scheduledJobs={acceptedBids.map(bid => jobs?.find(j => j.id === bid.jobId)).filter(Boolean) as Job[]}
              onNavigate={onNavigate}
            />
          </TabsContent>
          
          <TabsContent value="browse" className="mt-6">
            <BrowseJobs user={user} />
          </TabsContent>
          
          <TabsContent value="savings" className="mt-6">
            <FeeSavingsDashboard
              totalEarningsThisYear={yearlyStats.totalEarningsThisYear}
              jobsCompletedThisYear={yearlyStats.jobsCompletedThisYear}
              averageJobValue={yearlyStats.averageJobValue}
            />
          </TabsContent>
          
          <TabsContent value="routes" className="mt-6">
            <RouteBuilder user={user} />
          </TabsContent>
          
          <TabsContent value="availability" className="mt-6">
            <AvailabilityCalendar user={user} />
          </TabsContent>
          
          <TabsContent value="crm" className="mt-6">
            <EnhancedCRMDashboard user={user} />
          </TabsContent>
          
          <TabsContent value="replies" className="mt-6">
            <SmartReplies
              contractorId={user.id}
              onSelectReply={(reply) => {
                console.log('Reply selected:', reply)
              }}
            />
          </TabsContent>
          
          <TabsContent value="certifications" className="mt-6">
            <CertificationWallet user={user} />
          </TabsContent>
          
          <TabsContent value="referrals" className="mt-6">
            <ContractorReferralSystem user={user} />
          </TabsContent>
          
          <TabsContent value="invoices" className="mt-6">
            <Invoices user={user} onNavigate={onNavigate} />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <CompanySettings user={user} onUpdate={handleUserUpdate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
