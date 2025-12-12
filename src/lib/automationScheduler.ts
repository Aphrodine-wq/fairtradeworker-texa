import type { CRMCustomer, FollowUpSequence, ScheduledFollowUp, Invoice } from "./types"
import { toast } from "sonner"

export async function scheduleFollowUps(
  customerId: string,
  sequences: FollowUpSequence[]
): Promise<ScheduledFollowUp[]> {
  const activeSequences = sequences.filter(s => s.active)
  const scheduledFollowUps: ScheduledFollowUp[] = []

  for (const sequence of activeSequences) {
    for (const step of sequence.steps) {
      const scheduledFor = new Date()
      scheduledFor.setDate(scheduledFor.getDate() + step.day)

      const followUp: ScheduledFollowUp = {
        id: `scheduled-${Date.now()}-${Math.random()}`,
        customerId,
        sequenceId: sequence.id,
        stepId: step.id,
        scheduledFor: scheduledFor.toISOString(),
        status: 'pending',
        createdAt: new Date().toISOString()
      }

      scheduledFollowUps.push(followUp)
    }
  }

  return scheduledFollowUps
}

export async function checkAndSendFollowUps(
  scheduledFollowUps: ScheduledFollowUp[],
  customers: CRMCustomer[],
  sequences: FollowUpSequence[]
) {
  const now = new Date()
  const dueFollowUps = scheduledFollowUps.filter(
    f => f.status === 'pending' && new Date(f.scheduledFor) <= now
  )

  for (const followUp of dueFollowUps) {
    const customer = customers.find(c => c.id === followUp.customerId)
    const sequence = sequences.find(s => s.id === followUp.sequenceId)
    const step = sequence?.steps.find(s => s.id === followUp.stepId)

    if (customer && step) {
      console.log(`Sending ${step.action} to ${customer.name}: ${step.message}`)
    }
  }

  return dueFollowUps
}

export async function checkInvoiceReminders(
  invoices: Invoice[]
): Promise<Invoice[]> {
  const now = new Date()
  const overdueInvoices: Invoice[] = []

  for (const invoice of invoices) {
    if (invoice.status === 'sent' && !invoice.reminderSentAt) {
      const dueDate = new Date(invoice.dueDate)
      const daysSinceDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysSinceDue === 3 || daysSinceDue === 7 || daysSinceDue === 14) {
        overdueInvoices.push(invoice)
      }
    }
  }

  return overdueInvoices
}

export async function applyLateFees(
  invoices: Invoice[]
): Promise<Invoice[]> {
  const now = new Date()
  const invoicesWithFees: Invoice[] = []

  for (const invoice of invoices) {
    if (invoice.status === 'overdue' && !invoice.lateFeeApplied) {
      const dueDate = new Date(invoice.dueDate)
      const daysSinceDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysSinceDue >= 30) {
        invoicesWithFees.push({
          ...invoice,
          lateFeeApplied: true,
          total: invoice.total * 1.015
        })
      }
    }
  }

  return invoicesWithFees
}

export async function processRecurringInvoices(
  invoices: Invoice[]
): Promise<Invoice[]> {
  const now = new Date()
  const newInvoices: Invoice[] = []

  const recurringInvoices = invoices.filter(inv => 
    inv.isRecurring && 
    inv.nextRecurringDate &&
    new Date(inv.nextRecurringDate) <= now
  )

  for (const invoice of recurringInvoices) {
    const nextDate = new Date(invoice.nextRecurringDate!)
    let intervalDays = 30

    if (invoice.recurringInterval === 'quarterly') {
      intervalDays = 90
    } else if (invoice.recurringInterval === 'yearly') {
      intervalDays = 365
    }

    nextDate.setDate(nextDate.getDate() + intervalDays)

    const newInvoice: Invoice = {
      ...invoice,
      id: `inv-${Date.now()}-${Math.random()}`,
      status: 'draft',
      sentDate: undefined,
      paidDate: undefined,
      reminderSentAt: undefined,
      lateFeeApplied: false,
      nextRecurringDate: nextDate.toISOString(),
      createdAt: new Date().toISOString()
    }

    newInvoices.push(newInvoice)
  }

  return newInvoices
}

export function calculateContractorPerformanceScore(
  bidsCount: number,
  acceptedBidsCount: number,
  avgBidAccuracy: number
): number {
  if (bidsCount === 0) return 0

  const acceptanceRate = acceptedBidsCount / bidsCount
  const score = (acceptanceRate * 0.7) + (avgBidAccuracy * 0.3)

  return Math.min(1, Math.max(0, score))
}

export function autoTagCustomer(customer: CRMCustomer): string[] {
  const tags: string[] = []

  if (customer.lifetimeValue > 1000) {
    tags.push('High Value')
  }

  const jobCount = customer.lifetimeValue / 300
  if (jobCount >= 3) {
    tags.push('Frequent')
  }

  if (customer.status === 'advocate') {
    tags.push('Referrer')
  }

  const lastContact = new Date(customer.lastContact)
  const daysSinceContact = Math.floor((Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysSinceContact > 90) {
    tags.push('Inactive')
  }

  return tags
}
