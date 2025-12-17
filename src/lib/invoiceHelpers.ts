/**
 * Invoice Helper Functions
 * Context-aware invoice generation utilities for Enhanced Invoice & Payment System
 */

import type { Invoice, InvoiceLineItem, Milestone, ScopeChange, Job, User } from './types'

/**
 * Generate invoice line items from a completed milestone
 */
export function createInvoiceFromMilestone(
  milestone: Milestone,
  job: Job
): { lineItems: InvoiceLineItem[]; jobId: string; jobTitle: string } {
  const lineItems: InvoiceLineItem[] = [
    {
      description: `${milestone.name}${milestone.description ? ` - ${milestone.description}` : ''}`,
      quantity: 1,
      rate: milestone.amount,
      total: milestone.amount
    }
  ]

  return {
    lineItems,
    jobId: job.id,
    jobTitle: job.title
  }
}

/**
 * Generate invoice line items from an approved change order
 */
export function createInvoiceFromChangeOrder(
  changeOrder: ScopeChange,
  job: Job
): { lineItems: InvoiceLineItem[]; jobId: string; jobTitle: string } {
  const lineItems: InvoiceLineItem[] = [
    {
      description: `Change Order: ${changeOrder.description}`,
      quantity: 1,
      rate: changeOrder.additionalCost,
      total: changeOrder.additionalCost
    }
  ]

  return {
    lineItems,
    jobId: job.id,
    jobTitle: job.title
  }
}

/**
 * Generate a payment portal URL for an invoice
 * In production, this would integrate with Stripe/Square payment links
 */
export function generatePaymentPortalUrl(invoice: Invoice, contractor: User): string {
  // In production, this would call an API to create a Stripe payment link
  // For now, we'll use a placeholder URL structure
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  return `${baseUrl}/invoice/${invoice.id}/pay?amount=${invoice.total}&contractor=${contractor.id}`
}

/**
 * Calculate days until due date
 */
export function daysUntilDue(dueDate: string): number {
  const due = new Date(dueDate)
  const now = new Date()
  const diffTime = due.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Check if a client has good payment history (90%+ on-time payments)
 */
export function hasGoodPaymentHistory(invoices: Invoice[]): boolean {
  if (invoices.length === 0) return false

  const onTimePayments = invoices.filter(inv => {
    if (inv.status !== 'paid') return false
    if (!inv.paidAt || !inv.dueDate) return false
    
    const paidDate = new Date(inv.paidAt)
    const dueDate = new Date(inv.dueDate)
    return paidDate <= dueDate
  }).length

  return (onTimePayments / invoices.length) >= 0.9
}

/**
 * Check if a recurring invoice should suggest contract conversion
 * Returns true if client has paid for 12 consecutive months
 */
export function shouldSuggestContractConversion(
  invoice: Invoice,
  allInvoices: Invoice[]
): boolean {
  if (!invoice.isRecurring || invoice.status !== 'paid') return false

  // Get all paid invoices for this job
  const jobInvoices = allInvoices
    .filter(inv => inv.jobId === invoice.jobId && inv.status === 'paid' && inv.isRecurring)
    .sort((a, b) => (a.sentDate || '').localeCompare(b.sentDate || ''))

  // Check if we have 12 consecutive months of payments
  if (jobInvoices.length < 12) return false

  // Simple check: if we have 12+ recurring invoices, suggest conversion
  // In production, you'd verify they're consecutive months
  return jobInvoices.length >= 12
}
