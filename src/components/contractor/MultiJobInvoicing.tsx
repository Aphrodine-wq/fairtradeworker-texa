/**
 * Multi-Job Invoicing
 * Additional Pro Feature - Bundle multiple jobs into one invoice
 */

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Receipt,
  Plus,
  CheckCircle
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User, Job, Invoice } from "@/lib/types"
import { toast } from "sonner"

interface MultiJobInvoicingProps {
  user: User
}

export function MultiJobInvoicing({ user }: MultiJobInvoicingProps) {
  const isPro = user.isPro || false
  const [jobs] = useLocalKV<Job[]>("jobs", [])
  const [invoices, setInvoices] = useLocalKV<Invoice[]>("invoices", [])
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set())

  const completedJobs = useMemo(() => {
    return jobs.filter(j => 
      j.contractorId === user.id && 
      j.status === 'completed' &&
      !invoices.some(inv => inv.jobIds?.includes(j.id))
    )
  }, [jobs, user.id, invoices])

  const toggleJob = (jobId: string) => {
    const newSelected = new Set(selectedJobs)
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId)
    } else {
      newSelected.add(jobId)
    }
    setSelectedJobs(newSelected)
  }

  const createMultiInvoice = () => {
    if (selectedJobs.size === 0) {
      toast.error("Select at least one job")
      return
    }

    const selected = completedJobs.filter(j => selectedJobs.has(j.id))
    const total = selected.reduce((sum, j) => 
      sum + (j.bids?.[0]?.amount || 0), 0
    )

    const newInvoice: Invoice = {
      id: `invoice-${Date.now()}`,
      contractorId: user.id,
      homeownerId: selected[0].homeownerId, // Assume same homeowner for bundle
      jobIds: Array.from(selectedJobs),
      amount: total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    setInvoices([...invoices, newInvoice])
    setSelectedJobs(new Set())
    toast.success(`Created invoice for ${selectedJobs.size} jobs: $${total.toLocaleString()}`)
  }

  if (!isPro) {
    return (
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt weight="duotone" size={24} />
            Multi-Job Invoicing
          </CardTitle>
          <CardDescription>
            Upgrade to Pro to bundle multiple jobs into one invoice
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

  const totalAmount = completedJobs
    .filter(j => selectedJobs.has(j.id))
    .reduce((sum, j) => sum + (j.bids?.[0]?.amount || 0), 0)

  return (
    <div className="space-y-6">
      <Card glass={isPro}>
        <CardHeader>
          <CardTitle>Select Jobs to Invoice</CardTitle>
          <CardDescription>
            Select multiple completed jobs to create a single invoice
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {completedJobs.length === 0 ? (
            <p className="text-center text-black dark:text-white py-8">
              No completed jobs ready for invoicing
            </p>
          ) : (
            <>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {completedJobs.map((job) => (
                  <div
                    key={job.id}
                    className={`p-4 border-2 cursor-pointer transition-all ${
                      selectedJobs.has(job.id)
                        ? 'border-[#00FF00] dark:border-[#00FF00] bg-[#00FF00]/10'
                        : 'border-black dark:border-white'
                    }`}
                    onClick={() => toggleJob(job.id)}
                  >
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedJobs.has(job.id)}
                        onCheckedChange={() => toggleJob(job.id)}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-black dark:text-white">{job.title}</h3>
                        <p className="text-sm text-black dark:text-white mt-1">{job.address}</p>
                        <p className="text-sm font-bold text-black dark:text-white mt-2">
                          ${(job.bids?.[0]?.amount || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedJobs.size > 0 && (
                <div className="p-4 border border-black/20 dark:border-white/20 bg-white dark:bg-black">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-black dark:text-white">
                        {selectedJobs.size} job{selectedJobs.size > 1 ? 's' : ''} selected
                      </p>
                      <p className="text-2xl font-bold text-black dark:text-white mt-1">
                        Total: ${totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <Button onClick={createMultiInvoice}>
                      <Receipt size={16} className="mr-2" />
                      Create Invoice
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
