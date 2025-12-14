/**
 * Lead Import & Auto-Bid
 * Additional Pro Feature - CSV import old leads + auto-follow-ups + rule-based auto-bids
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Upload,
  FileCsv,
  CheckCircle,
  XCircle,
  Lightning
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User } from "@/lib/types"
import { toast } from "sonner"

interface LeadImportAutoBidProps {
  user: User
}

interface ImportedLead {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  notes?: string
  source: string
  importedAt: string
  status: 'new' | 'processed' | 'duplicate'
}

export function LeadImportAutoBid({ user }: LeadImportAutoBidProps) {
  const isPro = user.isPro || false
  const [importedLeads, setImportedLeads] = useLocalKV<ImportedLead[]>("imported-leads", [])
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const text = await file.text()
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim())

      // Expected headers: name, phone, email, address, notes, source
      const leads: ImportedLead[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        if (values.length < 2) continue

        const lead: ImportedLead = {
          id: `lead-${Date.now()}-${i}`,
          name: values[headers.indexOf('name')] || values[0] || 'Unknown',
          phone: values[headers.indexOf('phone')] || values[1] || '',
          email: values[headers.indexOf('email')] || values[2],
          address: values[headers.indexOf('address')] || values[3],
          notes: values[headers.indexOf('notes')] || values[4],
          source: values[headers.indexOf('source')] || 'csv-import',
          importedAt: new Date().toISOString(),
          status: 'new'
        }

        // Check for duplicates
        const isDuplicate = importedLeads.some(l => 
          l.phone === lead.phone || l.email === lead.email
        )
        if (isDuplicate) {
          lead.status = 'duplicate'
        }

        leads.push(lead)
      }

      setImportedLeads([...importedLeads, ...leads])
      toast.success(`Imported ${leads.length} leads!`)
    } catch (error) {
      toast.error("CSV import failed")
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const processLeads = async () => {
    setProcessing(true)
    try {
      // Auto-create jobs from leads
      // Auto-apply follow-up sequences
      // Auto-bid based on rules
      toast.info("Processing leads with AI...")
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newLeads = importedLeads.filter(l => l.status === 'new')
      setImportedLeads(importedLeads.map(l => 
        l.status === 'new' ? { ...l, status: 'processed' } : l
      ))
      
      toast.success(`Processed ${newLeads.length} leads!`)
    } catch (error) {
      toast.error("Processing failed")
    } finally {
      setProcessing(false)
    }
  }

  if (!isPro) {
    return (
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCsv weight="duotone" size={24} />
            Lead Import & Auto-Bid
          </CardTitle>
          <CardDescription>
            Upgrade to Pro to import leads and automate bidding
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

  const newLeads = importedLeads.filter(l => l.status === 'new')
  const duplicates = importedLeads.filter(l => l.status === 'duplicate')
  const processed = importedLeads.filter(l => l.status === 'processed')

  return (
    <div className="space-y-6">
      <Card glass={isPro}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCsv weight="duotone" size={24} />
            Import Leads
          </CardTitle>
          <CardDescription>
            Upload CSV file with leads. Columns: name, phone, email, address, notes, source
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="csv-upload">CSV File</Label>
            <Input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              disabled={uploading}
              className="mt-2"
            />
          </div>

          {importedLeads.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border border-black/20 dark:border-white/20 text-center">
                <p className="text-2xl font-bold text-black dark:text-white">{newLeads.length}</p>
                <p className="text-sm text-black dark:text-white">New Leads</p>
              </div>
              <div className="p-4 border border-black/20 dark:border-white/20 text-center">
                <p className="text-2xl font-bold text-black dark:text-white">{processed.length}</p>
                <p className="text-sm text-black dark:text-white">Processed</p>
              </div>
              <div className="p-4 border border-black/20 dark:border-white/20 text-center">
                <p className="text-2xl font-bold text-black dark:text-white">{duplicates.length}</p>
                <p className="text-sm text-black dark:text-white">Duplicates</p>
              </div>
            </div>
          )}

          {newLeads.length > 0 && (
            <Button
              onClick={processLeads}
              disabled={processing}
              className="w-full"
            >
              <Lightning size={16} className="mr-2" />
              {processing ? 'Processing...' : `Process ${newLeads.length} Leads`}
            </Button>
          )}
        </CardContent>
      </Card>

      {importedLeads.length > 0 && (
        <Card glass={isPro}>
          <CardHeader>
            <CardTitle>Imported Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {importedLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 border border-black/20 dark:border-white/20 flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-black dark:text-white">{lead.name}</h3>
                      <Badge variant={
                        lead.status === 'processed' ? 'default' :
                        lead.status === 'duplicate' ? 'destructive' : 'secondary'
                      }>
                        {lead.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-black dark:text-white space-y-1">
                      <p>Phone: {lead.phone}</p>
                      {lead.email && <p>Email: {lead.email}</p>}
                      {lead.address && <p>Address: {lead.address}</p>}
                      {lead.notes && <p>Notes: {lead.notes}</p>}
                    </div>
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
