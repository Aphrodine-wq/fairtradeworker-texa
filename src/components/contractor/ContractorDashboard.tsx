import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useKV } from "@github/spark/hooks"
import { Briefcase, CurrencyDollar, CheckCircle, Crown } from "@phosphor-icons/react"
import { BrowseJobs } from "@/components/jobs/BrowseJobs"
import { Invoices } from "./Invoices"
import { CRMDashboard } from "./CRMDashboard"
import type { User, Job, Invoice } from "@/lib/types"

interface ContractorDashboardProps {
  user: User
  onNavigate: (page: string) => void
}

export function ContractorDashboard({ user, onNavigate }: ContractorDashboardProps) {
  const [jobs] = useKV<Job[]>("jobs", [])
  const [invoices] = useKV<Invoice[]>("invoices", [])

  const myBids = (jobs || []).flatMap(job =>
    job.bids.filter(bid => bid.contractorId === user.id)
  )
  
  const acceptedBids = myBids.filter(bid => bid.status === 'accepted')
  
  const myInvoices = (invoices || []).filter(invoice => invoice.contractorId === user.id)
  const thisMonthEarnings = myInvoices
    .filter(inv => {
      const invDate = new Date(inv.createdAt)
      const now = new Date()
      return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear()
    })
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Contractor Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.fullName}!</p>
          </div>
          {user.isPro && (
            <Badge className="bg-accent text-accent-foreground px-4 py-2 text-base">
              <Crown weight="fill" className="mr-2" />
              PRO Member
            </Badge>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Jobs
              </CardTitle>
              <Briefcase className="text-primary" size={24} weight="duotone" />
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Earnings This Month
              </CardTitle>
              <CurrencyDollar className="text-accent" size={24} weight="duotone" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${thisMonthEarnings}</div>
            </CardContent>
          </Card>
        </div>

        {!user.isPro && (
          <Card className="border-2 border-accent/30 bg-accent/5">
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
            <TabsTrigger value="crm">CRM</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>
          <TabsContent value="browse" className="mt-6">
            <BrowseJobs user={user} />
          </TabsContent>
          <TabsContent value="crm" className="mt-6">
            <CRMDashboard user={user} />
          </TabsContent>
          <TabsContent value="invoices" className="mt-6">
            <Invoices user={user} onNavigate={onNavigate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
