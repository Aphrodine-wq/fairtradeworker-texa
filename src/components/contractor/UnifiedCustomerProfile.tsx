import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { 
  User as UserIcon, Phone, EnvelopeSimple, MapPin, Calendar, 
  FileText, CurrencyDollar, Clock, CheckCircle, WarningCircle,
  ChatCircle, Image as ImageIcon, DeviceMobile, Invoice,
  TrendUp, Download, Play
} from "@phosphor-icons/react"
import type { User, Job, CRMCustomer, CRMInteraction } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface UnifiedCustomerProfileProps {
  customerId: string
  user: User
  onClose?: () => void
}

interface TimelineItem {
  id: string
  type: 'call' | 'sms' | 'email' | 'visit' | 'invoice' | 'payment' | 'document' | 'qa_checklist' | 'note'
  date: string
  title: string
  description?: string
  metadata?: {
    callId?: string
    transcript?: string
    recordingUrl?: string
    amount?: number
    status?: string
    documentUrl?: string
    documentType?: string
    [key: string]: any
  }
}

export function UnifiedCustomerProfile({ customerId, user, onClose }: UnifiedCustomerProfileProps) {
  const [customers] = useKV<CRMCustomer[]>("crm-customers", [])
  const [interactions] = useKV<CRMInteraction[]>("crm-interactions", [])
  const [jobs] = useKV<Job[]>("jobs", [])
  const [invoices] = useKV<any[]>("invoices", [])
  const [expenses] = useKV<any[]>("expenses", [])
  const [activeTab, setActiveTab] = useState("timeline")

  const customer = useMemo(() => 
    customers?.find(c => c.id === customerId), 
    [customers, customerId]
  )

  const customerJobs = useMemo(() => 
    jobs?.filter(j => j.metadata?.callerPhone === customer?.phone || j.homeownerId === customerId) || [],
    [jobs, customer, customerId]
  )

  const customerInvoices = useMemo(() => 
    invoices?.filter(inv => customerJobs.some(j => j.id === inv.jobId)) || [],
    [invoices, customerJobs]
  )

  const customerExpenses = useMemo(() =>
    expenses?.filter(exp => customerJobs.some(j => j.id === exp.jobId)) || [],
    [expenses, customerJobs]
  )

  // Build unified timeline from all interactions
  const timeline = useMemo(() => {
    const items: TimelineItem[] = []

    // Add AI Receptionist calls
    customerJobs.forEach(job => {
      if (job.source === 'ai_receptionist' && job.metadata) {
        items.push({
          id: `call-${job.id}`,
          type: 'call',
          date: job.createdAt,
          title: 'AI Receptionist Call',
          description: job.metadata.urgency ? `Urgency: ${job.metadata.urgency}` : undefined,
          metadata: {
            callId: job.metadata.callId,
            transcript: job.metadata.transcript,
            recordingUrl: job.metadata.recordingUrl,
            urgency: job.metadata.urgency
          }
        })
      }
    })

    // Add CRM interactions (SMS, emails, notes)
    interactions?.filter(i => i.customerId === customerId).forEach(interaction => {
      items.push({
        id: `interaction-${interaction.id}`,
        type: interaction.type === 'call' ? 'call' : 
              interaction.type === 'email' ? 'email' : 
              interaction.type === 'sms' ? 'sms' : 'note',
        date: interaction.date,
        title: interaction.title,
        description: interaction.description
      })
    })

    // Add scheduled visits
    customerJobs.forEach(job => {
      if (job.preferredStartDate) {
        items.push({
          id: `visit-${job.id}`,
          type: 'visit',
          date: job.preferredStartDate,
          title: `Scheduled Visit: ${job.title}`,
          description: job.status
        })
      }
    })

    // Add invoices
    customerInvoices.forEach(invoice => {
      items.push({
        id: `invoice-${invoice.id}`,
        type: 'invoice',
        date: invoice.createdAt,
        title: `Invoice #${invoice.number || invoice.id.substring(0, 8)}`,
        description: invoice.status,
        metadata: {
          amount: invoice.total,
          status: invoice.status
        }
      })
    })

    // Add payments
    customerInvoices.filter(inv => inv.paidAt).forEach(invoice => {
      items.push({
        id: `payment-${invoice.id}`,
        type: 'payment',
        date: invoice.paidAt,
        title: 'Payment Received',
        metadata: {
          amount: invoice.total
        }
      })
    })

    // Sort by date (most recent first)
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [customerJobs, interactions, customerId, customerInvoices])

  // Calculate financials
  const financials = useMemo(() => {
    const totalRevenue = customerInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
    const totalPaid = customerInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0)
    const totalExpenses = customerExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
    const profit = totalPaid - totalExpenses
    const margin = totalPaid > 0 ? (profit / totalPaid) * 100 : 0

    return {
      totalRevenue,
      totalPaid,
      totalUnpaid: totalRevenue - totalPaid,
      totalExpenses,
      profit,
      margin
    }
  }, [customerInvoices, customerExpenses])

  if (!customer) {
    return <div className="p-6 text-center text-gray-500">Customer not found</div>
  }

  const getTimelineIcon = (type: TimelineItem['type']) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />
      case 'sms': return <DeviceMobile className="w-4 h-4" />
      case 'email': return <EnvelopeSimple className="w-4 h-4" />
      case 'visit': return <Calendar className="w-4 h-4" />
      case 'invoice': return <Invoice className="w-4 h-4" />
      case 'payment': return <CurrencyDollar className="w-4 h-4" />
      case 'document': return <FileText className="w-4 h-4" />
      case 'qa_checklist': return <CheckCircle className="w-4 h-4" />
      default: return <ChatCircle className="w-4 h-4" />
    }
  }

  const getTimelineColor = (type: TimelineItem['type']) => {
    switch (type) {
      case 'call': return 'bg-blue-500'
      case 'sms': return 'bg-green-500'
      case 'email': return 'bg-purple-500'
      case 'visit': return 'bg-orange-500'
      case 'invoice': return 'bg-yellow-500'
      case 'payment': return 'bg-emerald-500'
      case 'document': return 'bg-gray-500'
      case 'qa_checklist': return 'bg-teal-500'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 max-h-screen overflow-hidden">
      {/* Left Sidebar - Key Info */}
      <div className="lg:col-span-1 space-y-4 overflow-y-auto">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={customer.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xl">
                  {customer.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-xl">{customer.name}</CardTitle>
                <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                  {customer.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {customer.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-500" />
                <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline">
                  {customer.phone}
                </a>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-2 text-sm">
                <EnvelopeSimple className="w-4 h-4 text-gray-500" />
                <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline truncate">
                  {customer.email}
                </a>
              </div>
            )}
            {customer.address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                <span className="text-gray-700">{customer.address}</span>
              </div>
            )}
            {customer.tags && customer.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {customer.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <Separator className="my-2" />
            <div className="text-xs text-gray-500">
              Customer since {new Date(customer.invitedAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Phone className="w-4 h-4 mr-2" />
              Call Customer
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <DeviceMobile className="w-4 h-4 mr-2" />
              Send SMS
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <EnvelopeSimple className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Panel - Tabs */}
      <div className="lg:col-span-3 overflow-y-auto">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle>Customer Dashboard</CardTitle>
            <CardDescription>Unified view of all interactions and data</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="financials">Financials</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
              </TabsList>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="space-y-4 mt-6">
                <div className="text-sm text-gray-500 mb-4">
                  All interactions with {customer.name}
                </div>
                <div className="space-y-4">
                  {timeline.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full ${getTimelineColor(item.type)} flex items-center justify-center text-white`}>
                          {getTimelineIcon(item.type)}
                        </div>
                        <div className="w-0.5 h-full bg-gray-200 mt-2" />
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          )}
                          {item.metadata?.transcript && (
                            <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                              <p className="text-xs text-gray-700 line-clamp-3">{item.metadata.transcript}</p>
                              <Button variant="link" size="sm" className="text-xs p-0 h-auto mt-1">
                                View full transcript
                              </Button>
                            </div>
                          )}
                          {item.metadata?.recordingUrl && (
                            <Button variant="outline" size="sm" className="mt-2">
                              <Play className="w-3 h-3 mr-1" />
                              Play Recording
                            </Button>
                          )}
                          {item.metadata?.amount && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                              ${item.metadata.amount.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {timeline.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No interactions yet
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customerJobs.flatMap(job => [
                    { type: 'Estimate', jobId: job.id, jobTitle: job.title, date: job.createdAt },
                    job.status === 'in-progress' && { type: 'Contract', jobId: job.id, jobTitle: job.title, date: job.createdAt },
                    job.status === 'completed' && { type: 'Warranty', jobId: job.id, jobTitle: job.title, date: job.createdAt }
                  ].filter(Boolean)).map((doc: any, idx) => (
                    <Card key={idx} className="shadow-sm hover:shadow-md transition-shadow duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-blue-500 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-sm">{doc.type}</h4>
                              <p className="text-xs text-gray-500">{doc.jobTitle}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(doc.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {customerInvoices.map((invoice) => (
                    <Card key={invoice.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Invoice className="w-5 h-5 text-yellow-500 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-sm">Invoice #{invoice.number || invoice.id.substring(0, 8)}</h4>
                              <p className="text-xs text-gray-500">${invoice.total?.toLocaleString()}</p>
                              <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'} className="mt-1 text-xs">
                                {invoice.status}
                              </Badge>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {customerJobs.length === 0 && customerInvoices.length === 0 && (
                    <div className="col-span-2 text-center py-12 text-gray-500">
                      No documents available
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Financials Tab */}
              <TabsContent value="financials" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="text-xs text-gray-500 mb-1">Total Revenue</div>
                      <div className="text-2xl font-bold text-gray-900">
                        ${financials.totalRevenue.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="text-xs text-gray-500 mb-1">Paid</div>
                      <div className="text-2xl font-bold text-green-600">
                        ${financials.totalPaid.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="text-xs text-gray-500 mb-1">Unpaid</div>
                      <div className="text-2xl font-bold text-orange-600">
                        ${financials.totalUnpaid.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="text-xs text-gray-500 mb-1">Expenses</div>
                      <div className="text-2xl font-bold text-red-600">
                        ${financials.totalExpenses.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="text-xs text-gray-500 mb-1">Profit</div>
                      <div className="text-2xl font-bold text-blue-600">
                        ${financials.profit.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="text-xs text-gray-500 mb-1">Margin</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {financials.margin.toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="shadow-sm mt-6">
                  <CardHeader>
                    <CardTitle className="text-sm">Recent Invoices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {customerInvoices.slice(0, 5).map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-sm">Invoice #{invoice.number || invoice.id.substring(0, 8)}</div>
                            <div className="text-xs text-gray-500">{new Date(invoice.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${invoice.total?.toLocaleString()}</div>
                            <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'} className="text-xs">
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {customerInvoices.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No invoices yet
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule" className="space-y-4 mt-6">
                <div className="space-y-3">
                  {customerJobs.map((job) => (
                    <Card key={job.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-sm">{job.title}</h4>
                              <p className="text-xs text-gray-500 mt-1">{job.description}</p>
                              {job.preferredStartDate && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Clock className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-600">
                                    Start: {new Date(job.preferredStartDate).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge variant={
                            job.status === 'completed' ? 'default' :
                            job.status === 'in-progress' ? 'secondary' :
                            'outline'
                          }>
                            {job.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {customerJobs.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No scheduled jobs
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
