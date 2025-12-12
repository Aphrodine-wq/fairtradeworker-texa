import { useEffect } from "react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { toast } from "sonner"
import { 
  checkAndSendFollowUps, 
  checkInvoiceReminders,
  applyLateFees,
  processRecurringInvoices,
  autoTagCustomer
} from "@/lib/automationScheduler"
import type { 
  User, 
  CRMCustomer, 
  FollowUpSequence, 
  ScheduledFollowUp, 
  Invoice 
} from "@/lib/types"

interface AutomationRunnerProps {
  user: User | null
}

export function AutomationRunner({ user }: AutomationRunnerProps) {
  const [customers, setCustomers] = useKV<CRMCustomer[]>("crm-customers", [])
  const [sequences] = useKV<FollowUpSequence[]>("follow-up-sequences", [])
  const [scheduledFollowUps, setScheduledFollowUps] = useKV<ScheduledFollowUp[]>("scheduled-follow-ups", [])
  const [invoices, setInvoices] = useKV<Invoice[]>("invoices", [])

  useEffect(() => {
    if (!user?.isPro) return

    const interval = setInterval(async () => {
      await runAutomations()
    }, 1800000)

    return () => clearInterval(interval)
  }, [user?.id, user?.isPro])

  const runAutomations = async () => {
    if (!user?.isPro) return

    try {
      const dueFollowUps = await checkAndSendFollowUps(
        scheduledFollowUps || [],
        customers || [],
        sequences || []
      )

      if (dueFollowUps.length > 0) {
        setScheduledFollowUps((current) =>
          (current || []).map((f) =>
            dueFollowUps.some((d) => d.id === f.id)
              ? { ...f, status: 'sent' }
              : f
          )
        )
      }

      const overdueInvoices = await checkInvoiceReminders(invoices || [])
      
      if (overdueInvoices.length > 0) {
        setInvoices((current) =>
          (current || []).map((inv) =>
            overdueInvoices.some((o) => o.id === inv.id)
              ? { ...inv, reminderSentAt: new Date().toISOString() }
              : inv
          )
        )

        toast.info(`Sent ${overdueInvoices.length} invoice reminder(s)`)
      }

      const invoicesWithFees = await applyLateFees(invoices || [])
      
      if (invoicesWithFees.length > 0) {
        setInvoices((current) =>
          (current || []).map((inv) => {
            const feeInvoice = invoicesWithFees.find((f) => f.id === inv.id)
            return feeInvoice || inv
          })
        )

        toast.warning(`Applied late fees to ${invoicesWithFees.length} invoice(s)`)
      }

      const newRecurringInvoices = await processRecurringInvoices(invoices || [])
      
      if (newRecurringInvoices.length > 0) {
        setInvoices((current) => [...(current || []), ...newRecurringInvoices])
        toast.success(`Created ${newRecurringInvoices.length} recurring invoice(s)`)
      }

      setCustomers((current) =>
        (current || []).map((customer) => {
          const autoTags = autoTagCustomer(customer)
          const existingTags = customer.tags || []
          const mergedTags = Array.from(new Set([...existingTags, ...autoTags]))
          
          return { ...customer, tags: mergedTags }
        })
      )
    } catch (error) {
      console.error('Automation error:', error)
    }
  }

  return null
}
