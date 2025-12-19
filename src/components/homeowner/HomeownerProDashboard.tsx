import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ChartLine, 
  Calendar, 
  CurrencyDollar, 
  Shield, 
  Clock,
  TrendingUp,
  Home,
  CalendarCheck
} from '@phosphor-icons/react'
import type { User, Job, Invoice } from '@/lib/types'
import { useLocalKV as useKV } from '@/hooks/useLocalKV'

interface HomeownerProDashboardProps {
  user: User
}

export function HomeownerProDashboard({ user }: HomeownerProDashboardProps) {
  const [jobs] = useKV<Job[]>('jobs', [])
  const [invoices] = useKV<Invoice[]>('invoices', [])

  const myJobs = useMemo(() => 
    (jobs || []).filter(j => j.homeownerId === user.id),
    [jobs, user.id]
  )

  const myInvoices = useMemo(() => 
    (invoices || []).filter(inv => myJobs.some(j => j.id === inv.jobId)),
    [invoices, myJobs]
  )

  const totalSpent = useMemo(() => 
    myInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0),
    [myInvoices]
  )

  const completedJobs = useMemo(() => 
    myJobs.filter(j => j.status === 'completed'),
    [myJobs]
  )

  const activeJobs = useMemo(() => 
    myJobs.filter(j => j.status === 'in-progress'),
    [myJobs]
  )

  // Calculate average job value
  const averageJobValue = useMemo(() => {
    const paidInvoices = myInvoices.filter(inv => inv.status === 'paid')
    if (paidInvoices.length === 0) return 0
    return totalSpent / paidInvoices.length
  }, [myInvoices, totalSpent])

  // Priority jobs count
  const priorityJobs = useMemo(() => 
    myJobs.filter(j => j.isUrgent || j.preferredStartDate),
    [myJobs]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Home Analytics Dashboard</h2>
          <p className="text-muted-foreground">Track your home maintenance and improvements</p>
        </div>
        <Badge className="bg-accent text-accent-foreground px-3 py-1">
          Pro Member
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Spent</span>
              <CurrencyDollar size={20} className="text-primary" />
            </div>
            <p className="text-3xl font-bold">${totalSpent.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">All-time maintenance</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Completed Jobs</span>
              <ChartLine size={20} className="text-green-600" />
            </div>
            <p className="text-3xl font-bold">{completedJobs.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Average Job Value</span>
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <p className="text-3xl font-bold">${averageJobValue.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground mt-1">Per project</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Priority Jobs</span>
              <Clock size={20} className="text-orange-600" />
            </div>
            <p className="text-3xl font-bold">{priorityJobs.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Active priority</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck size={24} />
              Maintenance Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Track your annual maintenance schedule and upcoming service reminders.
            </p>
            <Button variant="outline" className="w-full">
              View Maintenance Calendar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={24} />
              Active Guarantees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedJobs.slice(0, 3).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-2 border-0 shadow-md hover:shadow-lg rounded">
                  <div>
                    <p className="font-medium text-sm">{job.title}</p>
                    <p className="text-xs text-muted-foreground">90-day guarantee active</p>
                  </div>
                  <Badge variant="secondary">Protected</Badge>
                </div>
              ))}
              {completedJobs.length === 0 && (
                <p className="text-sm text-muted-foreground">No completed jobs yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home size={24} />
            Service History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedJobs.slice(0, 5).map((job) => {
              const invoice = myInvoices.find(inv => inv.jobId === job.id && inv.status === 'paid')
              return (
                <div key={job.id} className="flex items-center justify-between p-4 border-0 shadow-md hover:shadow-lg rounded">
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Completed {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {invoice && (
                      <p className="font-semibold">${invoice.total.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              )
            })}
            {completedJobs.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No service history yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
