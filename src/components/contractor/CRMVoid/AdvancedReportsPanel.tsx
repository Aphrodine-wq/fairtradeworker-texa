import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, Download, Calendar, Filter, 
  ChartBar, TrendingUp, Users, DollarSign
} from '@phosphor-icons/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useLocalKV as useKV } from '@/hooks/useLocalKV'
import type { User, CRMCustomer } from '@/lib/types'
import { cn } from '@/lib/utils'

interface AdvancedReportsPanelProps {
  user: User
}

interface Report {
  id: string
  name: string
  type: 'custom' | 'template'
  createdAt: string
  data: any
}

export function AdvancedReportsPanel({ user }: AdvancedReportsPanelProps) {
  const [customers] = useKV<CRMCustomer[]>("crm-customers", [])
  const [reports, setReports] = useKV<Report[]>("crm-reports", [])
  const [selectedReportType, setSelectedReportType] = useState<string>('all')
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  const reportTemplates = [
    {
      id: 'customer-growth',
      name: 'Customer Growth Report',
      description: 'Track customer acquisition over time',
      icon: <TrendingUp size={24} />
    },
    {
      id: 'revenue-analysis',
      name: 'Revenue Analysis',
      description: 'Analyze revenue by customer segment',
      icon: <DollarSign size={24} />
    },
    {
      id: 'conversion-funnel',
      name: 'Conversion Funnel',
      description: 'View conversion rates by stage',
      icon: <ChartBar size={24} />
    },
    {
      id: 'customer-segments',
      name: 'Customer Segments',
      description: 'Breakdown by customer type and status',
      icon: <Users size={24} />
    },
  ]

  const generateReport = (templateId: string) => {
    const now = new Date()
    const timeframeMap = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      'all': Infinity
    }
    const days = timeframeMap[dateRange]
    const cutoffDate = days === Infinity ? new Date(0) : new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    const filteredCustomers = customers.filter(c => 
      new Date(c.invitedAt) >= cutoffDate
    )

    let reportData: any = {}

    switch (templateId) {
      case 'customer-growth':
        const monthlyGrowth: Record<string, number> = {}
        filteredCustomers.forEach(c => {
          const month = new Date(c.invitedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          monthlyGrowth[month] = (monthlyGrowth[month] || 0) + 1
        })
        reportData = { monthlyGrowth, total: filteredCustomers.length }
        break
      case 'revenue-analysis':
        const byStatus = filteredCustomers.reduce((acc, c) => {
          acc[c.status] = (acc[c.status] || 0) + (c.lifetimeValue || 0)
          return acc
        }, {} as Record<string, number>)
        reportData = { byStatus, total: filteredCustomers.reduce((sum, c) => sum + (c.lifetimeValue || 0), 0) }
        break
      case 'conversion-funnel':
        const funnel = {
          leads: filteredCustomers.filter(c => c.status === 'lead').length,
          active: filteredCustomers.filter(c => c.status === 'active').length,
          closed: filteredCustomers.filter(c => c.status === 'closed').length,
        }
        reportData = funnel
        break
      case 'customer-segments':
        const segments = filteredCustomers.reduce((acc, c) => {
          const segment = c.tags?.[0] || 'untagged'
          acc[segment] = (acc[segment] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        reportData = { segments, total: filteredCustomers.length }
        break
    }

    const report: Report = {
      id: `report-${Date.now()}`,
      name: reportTemplates.find(t => t.id === templateId)?.name || 'Custom Report',
      type: 'template',
      createdAt: new Date().toISOString(),
      data: reportData
    }

    setReports([...reports, report])
  }

  const exportReport = (report: Report) => {
    const dataStr = JSON.stringify(report.data, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${report.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const filteredReports = useMemo(() => {
    if (selectedReportType === 'all') return reports
    return reports.filter(r => r.type === selectedReportType)
  }, [reports, selectedReportType])

  return (
    <div className="h-full overflow-y-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-black dark:text-white">Advanced Reports</h3>
          <p className="text-sm text-black/60 dark:text-white/60">
            Create and manage custom reports
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
            <SelectTrigger className="w-32 bg-white dark:bg-black border-transparent dark:border-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Report Templates */}
      <Card className="border-2 border-transparent dark:border-white">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText size={20} />
            Report Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTemplates.map((template) => (
              <motion.button
                key={template.id}
                onClick={() => generateReport(template.id)}
                className={cn(
                  "p-4 rounded-lg text-left",
                  "bg-white dark:bg-black border-2 border-transparent dark:border-white",
                  "hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black",
                  "transition-all duration-200"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  {template.icon}
                  <h4 className="font-semibold text-black dark:text-white">{template.name}</h4>
                </div>
                <p className="text-sm text-black/60 dark:text-white/60">{template.description}</p>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter size={18} className="text-black/60 dark:text-white/60" />
        <Select value={selectedReportType} onValueChange={setSelectedReportType}>
          <SelectTrigger className="w-40 bg-white dark:bg-black border-transparent dark:border-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="template">Templates</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <Card className="border-2 border-transparent dark:border-white">
            <CardContent className="p-8 text-center">
              <FileText size={48} className="mx-auto mb-4 text-black/40 dark:text-white/40" />
              <p className="text-black dark:text-white font-semibold mb-2">No Reports Yet</p>
              <p className="text-sm text-black/60 dark:text-white/60">
                Generate a report using one of the templates above
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card
              key={report.id}
              className="border-2 border-transparent dark:border-white"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText size={20} className="text-primary" />
                      <h4 className="font-semibold text-black dark:text-white">{report.name}</h4>
                      <Badge variant="outline">{report.type}</Badge>
                    </div>
                    <p className="text-xs text-black/60 dark:text-white/60 mb-3">
                      Created {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                    <div className="p-3 rounded bg-white dark:bg-black border border-transparent dark:border-white/20">
                      <pre className="text-xs text-black dark:text-white overflow-x-auto">
                        {JSON.stringify(report.data, null, 2).slice(0, 200)}
                        {JSON.stringify(report.data, null, 2).length > 200 ? '...' : ''}
                      </pre>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => exportReport(report)}
                    className="text-black dark:text-white"
                  >
                    <Download size={18} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
