/**
 * Export Everything
 * Additional Pro Feature - CSV/PDF exports of all data
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Download,
  FileCsv,
  FilePdf,
  Calendar
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User, Job, Bid, Invoice } from "@/lib/types"
import { toast } from "sonner"

interface ExportEverythingProps {
  user: User
}

export function ExportEverything({ user }: ExportEverythingProps) {
  const isPro = user.isPro || false
  const [jobs] = useLocalKV<Job[]>("jobs", [])
  const [bids] = useLocalKV<Bid[]>("bids", [])
  const [invoices] = useLocalKV<Invoice[]>("invoices", [])
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(['jobs', 'bids', 'invoices']))
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv')
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'quarter' | 'year'>('all')

  const toggleType = (type: string) => {
    const newSelected = new Set(selectedTypes)
    if (newSelected.has(type)) {
      newSelected.delete(type)
    } else {
      newSelected.add(type)
    }
    setSelectedTypes(newSelected)
  }

  const exportData = async () => {
    if (selectedTypes.size === 0) {
      toast.error("Select at least one data type")
      return
    }

    if (format === 'csv') {
      exportCSV()
    } else {
      await exportPDF()
    }
  }

  const exportPDF = async () => {
    try {
      const { generatePDF } = await import('@/lib/pdf')
      const content: Array<{ type: 'text' | 'table', data: any }> = []

      if (selectedTypes.has('jobs')) {
        content.push({
          type: 'text',
          data: { text: 'JOBS', fontSize: 16 }
        })
        content.push({
          type: 'table',
          data: {
            columns: [
              { header: 'ID', dataKey: 'id', width: 30 },
              { header: 'Title', dataKey: 'title', width: 80 },
              { header: 'Status', dataKey: 'status', width: 30 },
              { header: 'Amount', dataKey: 'amount', width: 30 }
            ],
            rows: jobs.map(j => ({
              id: j.id.substring(0, 8),
              title: j.title,
              status: j.status,
              amount: `$${j.bids?.[0]?.amount || 0}`
            }))
          }
        })
      }

      if (selectedTypes.has('bids')) {
        content.push({
          type: 'text',
          data: { text: '\n\nBIDS', fontSize: 16 }
        })
        content.push({
          type: 'table',
          data: {
            columns: [
              { header: 'Job ID', dataKey: 'jobId', width: 30 },
              { header: 'Amount', dataKey: 'amount', width: 30 },
              { header: 'Status', dataKey: 'status', width: 30 }
            ],
            rows: bids.map(b => ({
              jobId: b.jobId.substring(0, 8),
              amount: `$${b.amount}`,
              status: b.status
            }))
          }
        })
      }

      if (selectedTypes.has('invoices')) {
        content.push({
          type: 'text',
          data: { text: '\n\nINVOICES', fontSize: 16 }
        })
        content.push({
          type: 'table',
          data: {
            columns: [
              { header: 'ID', dataKey: 'id', width: 30 },
              { header: 'Amount', dataKey: 'amount', width: 30 },
              { header: 'Status', dataKey: 'status', width: 30 },
              { header: 'Due Date', dataKey: 'dueDate', width: 40 }
            ],
            rows: invoices.map(i => ({
              id: i.id.substring(0, 8),
              amount: `$${i.total || i.amount || 0}`,
              status: i.status,
              dueDate: i.dueDate ? new Date(i.dueDate).toLocaleDateString() : 'N/A'
            }))
          }
        })
      }

      await generatePDF(content, `export-${Date.now()}.pdf`, {
        title: 'FairTradeWorker Data Export',
        author: user.fullName
      })
      toast.success("PDF export downloaded!")
    } catch (error: any) {
      console.error('PDF export failed:', error)
      if (error.message?.includes('jsPDF')) {
        toast.error("PDF generation requires jsPDF library. Falling back to CSV.")
        exportCSV()
      } else {
        toast.error("PDF export failed. Try CSV format instead.")
      }
    }
  }

  const exportCSV = () => {
    let csv = ''

    if (selectedTypes.has('jobs')) {
      csv += 'JOBS\n'
      csv += 'ID,Title,Status,Created,Amount\n'
      jobs.forEach(j => {
        csv += `${j.id},"${j.title}",${j.status},${j.createdAt},${j.bids?.[0]?.amount || 0}\n`
      })
      csv += '\n'
    }

    if (selectedTypes.has('bids')) {
      csv += 'BIDS\n'
      csv += 'ID,Job ID,Amount,Status,Created\n'
      bids.forEach(b => {
        csv += `${b.id},${b.jobId},${b.amount},${b.status},${b.createdAt}\n`
      })
      csv += '\n'
    }

    if (selectedTypes.has('invoices')) {
      csv += 'INVOICES\n'
      csv += 'ID,Amount,Status,Due Date\n'
      invoices.forEach(i => {
        csv += `${i.id},${i.total || i.amount || 0},${i.status},${i.dueDate}\n`
      })
    }

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `export-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success("Export downloaded!")
  }

  if (!isPro) {
    return (
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download weight="duotone" size={24} />
            Export Everything
          </CardTitle>
          <CardDescription>
            Upgrade to Pro to export all your data in CSV/PDF format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.href = '/pro-upgrade'}>
            Upgrade to Pro - $50/mo
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card glass={isPro}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download weight="duotone" size={24} />
          Export Data
        </CardTitle>
        <CardDescription>
          Export all your data in CSV or PDF format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Select Data Types</Label>
          <div className="space-y-2 mt-2">
            {[
              { id: 'jobs', label: 'Jobs', count: jobs.length },
              { id: 'bids', label: 'Bids', count: bids.length },
              { id: 'invoices', label: 'Invoices', count: invoices.length },
            ].map((type) => (
              <div key={type.id} className="flex items-center justify-between p-3 border border-black/20 dark:border-white/20">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedTypes.has(type.id)}
                    onCheckedChange={() => toggleType(type.id)}
                  />
                  <span className="text-black dark:text-white">{type.label}</span>
                  <Badge variant="outline">{type.count} items</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Format</Label>
            <Select value={format} onValueChange={(v: 'csv' | 'pdf') => setFormat(v)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileCsv size={16} />
                    CSV
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FilePdf size={16} />
                    PDF
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Date Range</Label>
            <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={exportData} className="w-full" size="lg">
          <Download size={16} className="mr-2" />
          Export {format.toUpperCase()}
        </Button>
      </CardContent>
    </Card>
  )
}
