/**
 * Renewal Detection Card
 * 
 * Enhanced Invoice & Payment System - "Smart PDF" Renewal Detection
 * Suggests converting recurring invoices to auto-renewing contracts after 12 months of payments
 */

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Calendar, CurrencyDollar, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Invoice } from '@/lib/types'
import { shouldSuggestContractConversion } from '@/lib/invoiceHelpers'

interface RenewalDetectionCardProps {
  invoices: Invoice[]
  onConvertToContract?: (invoice: Invoice) => void
}

export function RenewalDetectionCard({ invoices, onConvertToContract }: RenewalDetectionCardProps) {
  // Find invoices that should suggest contract conversion
  const eligibleInvoices = useMemo(() => {
    return invoices.filter(inv => shouldSuggestContractConversion(inv, invoices))
  }, [invoices])

  if (eligibleInvoices.length === 0) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  // Calculate projected annual value
  const calculateAnnualValue = (invoice: Invoice) => {
    if (!invoice.recurringInterval) return 0
    
    const monthlyValue = invoice.recurringInterval === 'monthly' 
      ? invoice.total 
      : invoice.recurringInterval === 'quarterly' 
        ? invoice.total / 3 
        : invoice.total / 12
    
    return monthlyValue * 12
  }

  const handleConvertToContract = (invoice: Invoice) => {
    const annualValue = calculateAnnualValue(invoice)
    
    if (onConvertToContract) {
      onConvertToContract(invoice)
    } else {
      // Default action: show info and suggest creating contract
      toast.success(
        `Contract conversion suggested for ${invoice.jobTitle}`,
        {
          description: `Projected annual value: ${formatCurrency(annualValue)}. You can now set up auto-renewing contracts for this client.`
        }
      )
    }
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle size={20} weight="bold" className="text-primary" />
              Contract Conversion Opportunity
            </CardTitle>
            <CardDescription>
              Clients with 12+ months of recurring payments can be converted to auto-renewing contracts
            </CardDescription>
          </div>
          <Badge variant="default" className="bg-primary">
            {eligibleInvoices.length} {eligibleInvoices.length === 1 ? 'Opportunity' : 'Opportunities'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {eligibleInvoices.map((invoice) => {
          const annualValue = calculateAnnualValue(invoice)
          const jobInvoices = invoices
            .filter(inv => inv.jobId === invoice.jobId && inv.status === 'paid' && inv.isRecurring)
            .sort((a, b) => (a.sentDate || '').localeCompare(b.sentDate || ''))
          
          return (
            <div 
              key={invoice.id} 
              className="p-4 border rounded-lg bg-background/50 hover:bg-background transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{invoice.jobTitle}</h4>
                    <Badge variant="outline">{invoice.recurringInterval}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground block text-xs">Monthly Invoice</span>
                      <span className="font-medium">{formatCurrency(invoice.total)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Projected Annual</span>
                      <span className="font-bold text-primary">{formatCurrency(annualValue)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Months Paid</span>
                      <span className="font-medium flex items-center gap-1">
                        <Calendar size={14} />
                        {jobInvoices.length}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    This client has paid {jobInvoices.length} recurring invoices. Convert to an auto-renewing contract 
                    to ensure continuous revenue and reduce manual invoice creation.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleConvertToContract(invoice)}
                    className="whitespace-nowrap"
                  >
                    <ArrowRight size={16} className="mr-1" weight="bold" />
                    Convert to Contract
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toast.info('Contract management features coming soon!')}
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
