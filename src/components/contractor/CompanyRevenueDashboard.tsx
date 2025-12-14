import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { 
  TrendUp, 
  CurrencyDollar, 
  Users, 
  Receipt, 
  ChartLine,
  Crown,
  MapTrifold
} from "@phosphor-icons/react"
import type { Job, User, Invoice, Territory } from "@/lib/types"

interface CompanyRevenueDashboardProps {
  user: User
}

export function CompanyRevenueDashboard({ user }: CompanyRevenueDashboardProps) {
  const [jobs] = useKV<Job[]>("jobs", [])
  const [invoices] = useKV<Invoice[]>("invoices", [])
  const [territories] = useKV<Territory[]>("territories", [])
  
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const storedStr = window.localStorage.getItem("demo-users")
        const storedUsers = storedStr ? JSON.parse(storedStr) as User[] : []
        setUsers(storedUsers || [])
      } catch (error) {
        console.error('Error loading demo users:', error)
        setUsers([])
      }
    }
    loadUsers()
  }, [])

  const completedJobs = (jobs || []).filter(j => j.status === 'completed')
  const platformFees = completedJobs.length * 20
  
  const proContractors = users.filter(u => u.role === 'contractor' && u.isPro)
  const proSubscriptionRevenue = proContractors.length * 39
  
  const paidInvoices = (invoices || []).filter(inv => inv.status === 'paid')
  const totalInvoiceValue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0)
  const processingFees = totalInvoiceValue * 0.029
  
  const claimedTerritories = (territories || []).filter(t => t.status === 'claimed')
  const territoryRoyalties = platformFees * 0.1
  
  const currentMonthJobs = completedJobs.filter(job => {
    const jobDate = new Date(job.createdAt)
    const now = new Date()
    return jobDate.getMonth() === now.getMonth() && jobDate.getFullYear() === now.getFullYear()
  })
  
  const currentMonthMRR = (proContractors.length * 39) + (currentMonthJobs.length * 20)
  
  const projectedYearlyRevenue = currentMonthMRR * 12
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const revenueBreakdown = [
    {
      label: "Platform Fees",
      value: platformFees,
      description: `$20 × ${completedJobs.length} completed jobs`,
      icon: Receipt,
      color: "text-black dark:text-white"
    },
    {
      label: "Pro Subscriptions",
      value: proSubscriptionRevenue,
      description: `$39/mo × ${proContractors.length} Pro contractors`,
      icon: Crown,
      color: "text-black dark:text-white"
    },
    {
      label: "Processing Fees",
      value: processingFees,
      description: `2.9% of $${totalInvoiceValue.toFixed(0)} invoiced`,
      icon: ChartLine,
      color: "text-black dark:text-white"
    },
    {
      label: "Territory Royalties",
      value: territoryRoyalties,
      description: `10% of platform fees to ${claimedTerritories.length} operators`,
      icon: MapTrifold,
      color: "text-purple-600"
    }
  ]

  const totalRevenue = revenueBreakdown.reduce((sum, item) => sum + item.value, 0)
  const netRevenue = totalRevenue - territoryRoyalties

  if (!user.isOperator && user.role !== 'operator') {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="p-16 text-center">
            <TrendUp className="mx-auto mb-4 text-black dark:text-white" size={64} weight="duotone" />
            <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
            <p className="text-black dark:text-white">This dashboard is only available to platform operators.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <TrendUp weight="duotone" size={36} className="text-primary" />
          Company Revenue Dashboard
        </h1>
        <p className="text-black dark:text-white">Platform performance and revenue tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-3 bg-white dark:bg-black border-2 border-black dark:border-white shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff]">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-wider">Total Lifetime Revenue</CardDescription>
            <CardTitle className="text-5xl font-bold text-primary">{formatCurrency(totalRevenue)}</CardTitle>
            <p className="text-sm text-black dark:text-white mt-2">
              Net after royalties: <span className="font-semibold text-black dark:text-white">{formatCurrency(netRevenue)}</span>
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-black dark:text-white">Monthly MRR</span>
              <TrendUp size={20} className="text-green-600" weight="fill" />
            </div>
            <p className="text-3xl font-bold">{formatCurrency(currentMonthMRR)}</p>
            <p className="text-xs text-black dark:text-white mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-black dark:text-white">Projected ARR</span>
              <ChartLine size={20} className="text-primary" weight="fill" />
            </div>
            <p className="text-3xl font-bold">{formatCurrency(projectedYearlyRevenue)}</p>
            <p className="text-xs text-black dark:text-white mt-1">Annual run-rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-black dark:text-white">Active Users</span>
              <Users size={20} className="text-accent" weight="fill" />
            </div>
            <p className="text-3xl font-bold">{users.length}</p>
            <p className="text-xs text-black dark:text-white mt-1">
              {proContractors.length} Pro ({((proContractors.length / Math.max(users.filter(u => u.role === 'contractor').length, 1)) * 100).toFixed(0)}%)
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="breakdown" className="w-full">
        <TabsList>
          <TabsTrigger value="breakdown">Revenue Breakdown</TabsTrigger>
          <TabsTrigger value="contractors">Pro Contractors</TabsTrigger>
          <TabsTrigger value="territories">Territory Operators</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-4 mt-6">
          {revenueBreakdown.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-muted ${item.color}`}>
                      <item.icon size={24} weight="duotone" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{item.label}</h3>
                      <p className="text-sm text-black dark:text-white">{item.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatCurrency(item.value)}</p>
                    <Badge variant="outline" className="mt-1">
                      {((item.value / totalRevenue) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="contractors" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown weight="duotone" className="text-amber-600" />
                Pro Contractors ({proContractors.length})
              </CardTitle>
              <CardDescription>
                Generating {formatCurrency(proSubscriptionRevenue)}/month in subscription revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              {proContractors.length === 0 ? (
                <p className="text-center py-8 text-black dark:text-white">No Pro contractors yet</p>
              ) : (
                <div className="space-y-3">
                  {proContractors.map(contractor => (
                    <div key={contractor.id} className="flex items-center justify-between p-4 rounded-none border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                      <div>
                        <p className="font-semibold">{contractor.fullName}</p>
                        <p className="text-sm text-black dark:text-white">
                          Pro since: {contractor.proSince ? new Date(contractor.proSince).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Crown size={12} weight="fill" />
                        $39/mo
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="territories" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapTrifold weight="duotone" className="text-purple-600" />
                Territory Operators ({claimedTerritories.length})
              </CardTitle>
              <CardDescription>
                Receiving {formatCurrency(territoryRoyalties)} in total royalties
              </CardDescription>
            </CardHeader>
            <CardContent>
              {claimedTerritories.length === 0 ? (
                <p className="text-center py-8 text-black dark:text-white">No territories claimed yet</p>
              ) : (
                <div className="space-y-3">
                  {claimedTerritories.map(territory => {
                    const territoryJobs = completedJobs.filter(j => j.territoryId === territory.id)
                    const territoryFees = territoryJobs.length * 20
                    const operatorShare = territoryFees * 0.1
                    
                    return (
                      <div key={territory.id} className="flex items-center justify-between p-4 rounded-none border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
                        <div>
                          <p className="font-semibold">{territory.countyName}</p>
                          <p className="text-sm text-black dark:text-white">
                            Operator: {territory.operatorName || 'Unknown'}
                          </p>
                          <p className="text-xs text-black dark:text-white mt-1">
                            {territoryJobs.length} completed jobs
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{formatCurrency(operatorShare)}</p>
                          <p className="text-xs text-black dark:text-white">10% of fees</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-none bg-black dark:bg-white border-2 border-black dark:border-white shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]">
              <TrendUp size={24} weight="duotone" className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Revenue Targets</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-black dark:text-white">Month 3 Goal</p>
                  <p className="font-bold text-lg">{formatCurrency(75000)}</p>
                  <p className="text-xs text-black dark:text-white mt-1">
                    {((currentMonthMRR / 75000) * 100).toFixed(0)}% achieved
                  </p>
                </div>
                <div>
                  <p className="text-black dark:text-white">Month 6 Goal</p>
                  <p className="font-bold text-lg">{formatCurrency(178000)}</p>
                  <p className="text-xs text-black dark:text-white mt-1">
                    {((currentMonthMRR / 178000) * 100).toFixed(0)}% achieved
                  </p>
                </div>
                <div>
                  <p className="text-black dark:text-white">Break-Even</p>
                  <p className="font-bold text-lg">{formatCurrency(120000)}</p>
                  <p className="text-xs text-black dark:text-white mt-1">
                    Monthly burn rate
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
