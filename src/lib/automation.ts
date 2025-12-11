import type { Invoice, CRMCustomer, FollowUpSequence, ScheduledFollowUp } from "@/lib/types"

export class InvoiceAutomationService {
  
  static checkOverdueInvoices(invoices: Invoice[]): Invoice[] {
    const now = new Date()
    const updates: Invoice[] = []
    
    invoices.forEach(invoice => {
      if (invoice.status === 'sent' || invoice.status === 'viewed') {
        const dueDate = new Date(invoice.dueDate)
        const daysSinceDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysSinceDue > 0) {
          updates.push({
            ...invoice,
            status: 'overdue'
          })
        }
      }
      
      if (invoice.status === 'overdue') {
        const dueDate = new Date(invoice.dueDate)
        const daysSinceDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysSinceDue >= 30 && !invoice.lateFeeApplied) {
          const lateFee = invoice.total * 0.015
          updates.push({
            ...invoice,
            lateFeeApplied: true,
            total: invoice.total + lateFee
          })
        }
      }
    })
    
    return updates
  }
  
  static shouldSendReminder(invoice: Invoice): boolean {
    if (invoice.status !== 'sent' && invoice.status !== 'viewed' && invoice.status !== 'overdue') {
      return false
    }
    
    if (invoice.reminderSentAt) {
      return false
    }
    
    const now = new Date()
    const dueDate = new Date(invoice.dueDate)
    const daysTillDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    return daysTillDue <= 3 && daysTillDue >= 0
  }
  
  static generateRecurringInvoice(originalInvoice: Invoice): Invoice | null {
    if (!originalInvoice.isRecurring || !originalInvoice.recurringInterval) {
      return null
    }
    
    if (originalInvoice.status !== 'paid') {
      return null
    }
    
    const now = new Date()
    const lastDueDate = new Date(originalInvoice.dueDate)
    
    let nextDueDate: Date
    switch (originalInvoice.recurringInterval) {
      case 'monthly':
        nextDueDate = new Date(lastDueDate)
        nextDueDate.setMonth(nextDueDate.getMonth() + 1)
        break
      case 'quarterly':
        nextDueDate = new Date(lastDueDate)
        nextDueDate.setMonth(nextDueDate.getMonth() + 3)
        break
      case 'yearly':
        nextDueDate = new Date(lastDueDate)
        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1)
        break
      default:
        return null
    }
    
    if (nextDueDate <= now) {
      return {
        ...originalInvoice,
        id: `inv-${Date.now()}-recurring`,
        dueDate: nextDueDate.toISOString(),
        sentDate: now.toISOString(),
        status: 'sent',
        reminderSentAt: undefined,
        lateFeeApplied: false,
        paidDate: undefined,
        createdAt: now.toISOString()
      }
    }
    
    return null
  }
  
  static async sendReminderEmail(invoice: Invoice, recipientEmail: string): Promise<boolean> {
    console.log(`[Simulated] Sending reminder email for invoice ${invoice.id} to ${recipientEmail}`)
    console.log(`Subject: Invoice ${invoice.id.slice(0, 8)} due in 3 days`)
    console.log(`Body: Your invoice for ${invoice.jobTitle} totaling $${invoice.total.toFixed(2)} is due on ${new Date(invoice.dueDate).toLocaleDateString()}`)
    return true
  }
  
  static async sendReminderSMS(invoice: Invoice, recipientPhone: string): Promise<boolean> {
    console.log(`[Simulated] Sending reminder SMS for invoice ${invoice.id} to ${recipientPhone}`)
    console.log(`Message: Reminder: Invoice for ${invoice.jobTitle} ($${invoice.total.toFixed(2)}) due ${new Date(invoice.dueDate).toLocaleDateString()}. Thank you!`)
    return true
  }
}

export class CRMAutomationService {
  
  static getScheduledFollowUps(
    customers: CRMCustomer[],
    sequences: FollowUpSequence[],
    existingScheduled: ScheduledFollowUp[]
  ): ScheduledFollowUp[] {
    const newScheduled: ScheduledFollowUp[] = []
    
    customers.forEach(customer => {
      if (customer.status !== 'active') return
      
      sequences.filter(s => s.active).forEach(sequence => {
        sequence.steps.forEach(step => {
          const alreadyScheduled = existingScheduled.some(
            s => s.customerId === customer.id && s.stepId === step.id
          )
          
          if (!alreadyScheduled) {
            const daysSinceLastContact = Math.floor(
              (Date.now() - new Date(customer.lastContact).getTime()) / (1000 * 60 * 60 * 24)
            )
            
            if (daysSinceLastContact >= step.day) {
              const scheduledFor = new Date()
              scheduledFor.setDate(scheduledFor.getDate() + 1)
              
              newScheduled.push({
                id: `scheduled-${Date.now()}-${customer.id}-${step.id}`,
                customerId: customer.id,
                sequenceId: sequence.id,
                stepId: step.id,
                scheduledFor: scheduledFor.toISOString(),
                status: 'pending',
                createdAt: new Date().toISOString()
              })
            }
          }
        })
      })
    })
    
    return newScheduled
  }
  
  static async executeFollowUp(
    followUp: ScheduledFollowUp,
    customer: CRMCustomer,
    sequence: FollowUpSequence
  ): Promise<boolean> {
    const step = sequence.steps.find(s => s.id === followUp.stepId)
    if (!step) return false
    
    console.log(`[Simulated] Executing follow-up for ${customer.name}`)
    console.log(`Type: ${step.action}`)
    console.log(`Message: ${step.message}`)
    
    if (step.action === 'email' && customer.email) {
      console.log(`To: ${customer.email}`)
    } else if (step.action === 'sms' && customer.phone) {
      console.log(`To: ${customer.phone}`)
    }
    
    return true
  }
  
  static shouldPauseSequence(customer: CRMCustomer): boolean {
    const daysSinceLastContact = Math.floor(
      (Date.now() - new Date(customer.lastContact).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    return daysSinceLastContact < 1
  }
  
  static getCustomerLifetimeMetrics(customer: CRMCustomer) {
    const accountAge = Math.floor(
      (Date.now() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    const avgJobValue = customer.lifetimeValue > 0 ? customer.lifetimeValue / Math.max(1, accountAge / 90) : 0
    
    return {
      accountAgeDays: accountAge,
      estimatedJobCount: Math.floor(accountAge / 90),
      avgJobValue: avgJobValue,
      projectedAnnualValue: avgJobValue * 4
    }
  }
}

export class AutomationRunner {
  private static isRunning = false
  
  static startAutomation(
    invoices: Invoice[],
    setInvoices: (updater: (current: Invoice[]) => Invoice[]) => void,
    customers: CRMCustomer[],
    sequences: FollowUpSequence[],
    isPro: boolean
  ) {
    if (this.isRunning) return
    this.isRunning = true
    
    const invoiceInterval = setInterval(() => {
      const updates = InvoiceAutomationService.checkOverdueInvoices(invoices)
      if (updates.length > 0) {
        setInvoices((current) => {
          const updatedInvoices = [...current]
          updates.forEach(update => {
            const index = updatedInvoices.findIndex(inv => inv.id === update.id)
            if (index !== -1) {
              updatedInvoices[index] = update
            }
          })
          return updatedInvoices
        })
      }
      
      if (isPro) {
        invoices.forEach(invoice => {
          if (InvoiceAutomationService.shouldSendReminder(invoice)) {
            console.log(`Reminder triggered for invoice ${invoice.id}`)
            setInvoices((current) =>
              current.map(inv =>
                inv.id === invoice.id
                  ? { ...inv, reminderSentAt: new Date().toISOString() }
                  : inv
              )
            )
          }
        })
        
        invoices.forEach(invoice => {
          const recurring = InvoiceAutomationService.generateRecurringInvoice(invoice)
          if (recurring) {
            console.log(`Generated recurring invoice for ${invoice.jobTitle}`)
            setInvoices((current) => [...current, recurring])
          }
        })
      }
    }, 60000)
    
    return () => {
      clearInterval(invoiceInterval)
      this.isRunning = false
    }
  }
}
