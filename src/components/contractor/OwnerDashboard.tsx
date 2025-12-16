import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { 
  CurrencyDollar, Calendar, TrendUp, WarningCircle, 
  Users, ChartLine, FileText, Clock 
} from "@phosphor-icons/react"
import type { User, Job } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface OwnerDashboardProps {
  user: User
}

export function OwnerDashboard({ user }: OwnerDashboardProps) {
  const [jobs] = useKV<Job[]>("jobs", [])
  const [invoices] = useKV<any[]>("invoices", [])
  const [expenses] = useKV<any[]>("expenses", [])
  const [payments] = useKV<any[]>("payments", [])
  const [customers] = useKV<any[]>("crm-customers", [])
  const [warranties] = useKV<any[]>("warranties", [])

  // Calculate cash flow
  const cashFlow = useMemo(() => {
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)

    const income = payments?.filter(p => new Date(p.processedAt) >= last30Days)
      .reduce((sum, p) => sum + (p.amount - (p.fee || 0)), 0) || 0

    const expensesTotal = expenses?.filter(e => new Date(e.date) >= last30Days)
      .reduce((sum, e) => sum + e.amount, 0) || 0

    return {
      income,
      expenses: expensesTotal,
      net: income - expensesTotal
    }
  }, [payments, expenses])

  // Upcoming scheduled jobs
  const upcomingJobs = useMemo(() => {
    const today = new Date()
    return jobs?.filter(j => 
      j.contractorId === user.id && 
      j.preferredStartDate && 
      new Date(j.preferredStartDate) >= today
    ).sort((a, b) => 
      new Date(a.preferredStartDate!).getTime() - new Date(b.preferredStartDate!).getTime()
    ).slice(0, 5) || []
  }, [jobs, user.id])

  // Top leads
  const topLeads = useMemo(() => {
    return customers?.filter(c => 
      c.contractorId === user.id && 
      c.status === 'lead'
    ).sort((a, b) => 
      (b.lifetimeValue || 0) - (a.lifetimeValue || 0)
    ).slice(0, 5) || []
  }, [customers, user.id])

  // Warranty expirations
  const warrantyExpirations = useMemo(() => {
    const next30Days = new Date()
    next30Days.setDate(next30Days.getDate() + 30)
    
    return warranties?.filter(w => 
      w.contractorId === user.id &&
      w.expiresAt &&
      new Date(w.expiresAt) <= next30Days &&
      new Date(w.expiresAt) >= new Date()
    ).sort((a, b) => 
      new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
    ) || []
  }, [warranties, user.id])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Owner Dashboard</h1>
          <p className="text-gray-500">High-level business overview</p>
        </div>
      </div>

      {/* Cash Flow Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cash Flow (30d)</p>
                <p className={`text-3xl font-bold mt-2 ${cashFlow.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(cashFlow.net).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {cashFlow.net >= 0 ? 'Positive' : 'Negative'}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full ${cashFlow.net >= 0 ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center`}>
                <TrendUp className={`w-6 h-6 ${cashFlow.net >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Income:</span>
                <span className="font-medium text-green-600">${cashFlow.income.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Expenses:</span>
                <span className="font-medium text-red-600">${cashFlow.expenses.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Upcoming Jobs</p>
                <p className="text-3xl font-bold mt-2">{upcomingJobs.length}</p>
                <p className="text-xs text-gray-500 mt-1">Next 30 days</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Leads</p>
                <p className="text-3xl font-bold mt-2">{topLeads.length}</p>
                <p className="text-xs text-gray-500 mt-1">Qualified prospects</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Scheduled Jobs */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Scheduled Jobs
            </CardTitle>
            <CardDescription>Jobs scheduled in the next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingJobs.map(job => (
                <div key={job.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{job.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(job.preferredStartDate!).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={job.status === 'in-progress' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {upcomingJobs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No upcoming jobs scheduled
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Leads */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Leads
            </CardTitle>
            <CardDescription>Highest value prospects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topLeads.map(lead => (
                <div key={lead.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{lead.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{lead.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        ${(lead.lifetimeValue || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {lead.source || 'Unknown source'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {topLeads.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No active leads
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warranty Expirations Alert */}
      {warrantyExpirations.length > 0 && (
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WarningCircle className="w-5 h-5 text-orange-500" />
              Warranty Expirations
            </CardTitle>
            <CardDescription>Warranties expiring in the next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {warrantyExpirations.map(warranty => (
                <div key={warranty.id} className="p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{warranty.jobTitle || 'Warranty'}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Expires {formatDistanceToNow(new Date(warranty.expiresAt), { addSuffix: true })}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Contact Customer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
