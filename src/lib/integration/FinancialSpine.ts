/**
 * Financial Spine Integration Layer
 * 
 * This module provides the integration logic for the financial spine that connects:
 * - Job Cost Calculator
 * - Expense Tracker
 * - Invoice Generator
 * - Payment Processing
 * - Reporting Suite
 */

import type { Job } from "@/lib/types"

export interface JobCostEstimate {
  jobId: string
  materials: Array<{ name: string; quantity: number; unitPrice: number; total: number }>
  labor: Array<{ description: string; hours: number; rate: number; total: number }>
  equipment: Array<{ name: string; hours: number; rate: number; total: number }>
  permits: Array<{ name: string; cost: number }>
  overhead: number
  profit: number
  subtotal: number
  tax: number
  total: number
  createdAt: string
  updatedAt: string
}

export interface Expense {
  id: string
  jobId: string
  category: 'materials' | 'labor' | 'equipment' | 'permits' | 'fuel' | 'tools' | 'insurance' | 'marketing' | 'other'
  vendor: string
  amount: number
  date: string
  receipt?: string
  description: string
  taxDeductible: boolean
  createdAt: string
}

export interface Invoice {
  id: string
  number?: string
  jobId: string
  customerId: string
  lineItems: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  tax: number
  total: number
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'
  createdAt: string
  sentAt?: string
  dueDate?: string
  paidAt?: string
  paymentMethod?: string
}

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  method: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'other'
  reference?: string
  processedAt: string
  fee?: number
}

/**
 * Creates a draft invoice from a Job Cost Estimate
 * This is triggered when a bid is won
 */
export function createInvoiceFromEstimate(
  estimate: JobCostEstimate,
  job: Job,
  customerId: string,
  invoiceNumber?: string
): Invoice {
  const lineItems: Invoice['lineItems'] = []

  // Add materials
  estimate.materials.forEach(item => {
    lineItems.push({
      description: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total
    })
  })

  // Add labor
  estimate.labor.forEach(item => {
    lineItems.push({
      description: item.description,
      quantity: item.hours,
      unitPrice: item.rate,
      total: item.total
    })
  })

  // Add equipment
  estimate.equipment.forEach(item => {
    lineItems.push({
      description: `${item.name} (Equipment)`,
      quantity: item.hours,
      unitPrice: item.rate,
      total: item.total
    })
  })

  // Add permits
  estimate.permits.forEach(item => {
    lineItems.push({
      description: `${item.name} (Permit)`,
      quantity: 1,
      unitPrice: item.cost,
      total: item.cost
    })
  })

  // Add overhead if applicable
  if (estimate.overhead > 0) {
    lineItems.push({
      description: 'Overhead & Administrative Costs',
      quantity: 1,
      unitPrice: estimate.overhead,
      total: estimate.overhead
    })
  }

  // Add profit margin
  if (estimate.profit > 0) {
    lineItems.push({
      description: 'Project Management & Profit',
      quantity: 1,
      unitPrice: estimate.profit,
      total: estimate.profit
    })
  }

  const now = new Date().toISOString()
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 30) // 30 days from now

  return {
    id: crypto?.randomUUID?.() || `inv-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    number: invoiceNumber,
    jobId: estimate.jobId,
    customerId,
    lineItems,
    subtotal: estimate.subtotal,
    tax: estimate.tax,
    total: estimate.total,
    status: 'draft',
    createdAt: now,
    dueDate: dueDate.toISOString()
  }
}

/**
 * Updates job cost actual costs when an expense is added
 * This provides real-time profit margin tracking
 */
export function updateJobActualCosts(
  estimate: JobCostEstimate,
  expenses: Expense[]
): {
  estimatedCost: number
  actualCost: number
  variance: number
  variancePercent: number
  estimatedProfit: number
  actualProfit: number
  estimatedMargin: number
  actualMargin: number
} {
  const estimatedCost = estimate.subtotal - estimate.profit
  const actualCost = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const variance = actualCost - estimatedCost
  const variancePercent = estimatedCost > 0 ? (variance / estimatedCost) * 100 : 0
  
  const estimatedProfit = estimate.profit
  const actualProfit = estimate.total - actualCost
  
  const estimatedMargin = estimate.total > 0 ? (estimatedProfit / estimate.total) * 100 : 0
  const actualMargin = estimate.total > 0 ? (actualProfit / estimate.total) * 100 : 0

  return {
    estimatedCost,
    actualCost,
    variance,
    variancePercent,
    estimatedProfit,
    actualProfit,
    estimatedMargin,
    actualMargin
  }
}

/**
 * Processes a payment and updates invoice status
 * Also updates cash flow reporting data
 */
export function processPayment(
  invoice: Invoice,
  payment: Payment
): {
  updatedInvoice: Invoice
  cashFlowUpdate: {
    date: string
    type: 'payment_received'
    amount: number
    invoiceId: string
    jobId: string
  }
} {
  const updatedInvoice: Invoice = {
    ...invoice,
    status: 'paid',
    paidAt: payment.processedAt,
    paymentMethod: payment.method
  }

  const cashFlowUpdate = {
    date: payment.processedAt,
    type: 'payment_received' as const,
    amount: payment.amount - (payment.fee || 0), // Net amount after fees
    invoiceId: invoice.id,
    jobId: invoice.jobId
  }

  return {
    updatedInvoice,
    cashFlowUpdate
  }
}

/**
 * Categorizes an expense based on its description and metadata
 * Uses simple keyword matching - can be enhanced with AI
 */
export function categorizeExpense(
  description: string,
  vendor?: string
): Expense['category'] {
  const lowerDesc = description.toLowerCase()
  const lowerVendor = vendor?.toLowerCase() || ''

  // Materials
  if (lowerDesc.includes('lumber') || lowerDesc.includes('wood') || 
      lowerDesc.includes('drywall') || lowerDesc.includes('concrete') ||
      lowerDesc.includes('paint') || lowerDesc.includes('hardware') ||
      lowerVendor.includes('home depot') || lowerVendor.includes('lowes')) {
    return 'materials'
  }

  // Labor
  if (lowerDesc.includes('wage') || lowerDesc.includes('salary') || 
      lowerDesc.includes('payroll') || lowerDesc.includes('contractor')) {
    return 'labor'
  }

  // Equipment
  if (lowerDesc.includes('rental') || lowerDesc.includes('equipment') || 
      lowerDesc.includes('scaffold') || lowerDesc.includes('tool hire')) {
    return 'equipment'
  }

  // Permits
  if (lowerDesc.includes('permit') || lowerDesc.includes('license') || 
      lowerDesc.includes('inspection') || lowerDesc.includes('fee')) {
    return 'permits'
  }

  // Fuel
  if (lowerDesc.includes('gas') || lowerDesc.includes('diesel') || 
      lowerDesc.includes('fuel') || lowerVendor.includes('shell') || 
      lowerVendor.includes('chevron')) {
    return 'fuel'
  }

  // Tools
  if (lowerDesc.includes('tool') || lowerDesc.includes('drill') || 
      lowerDesc.includes('saw') || lowerDesc.includes('equipment purchase')) {
    return 'tools'
  }

  // Insurance
  if (lowerDesc.includes('insurance') || lowerDesc.includes('liability') || 
      lowerDesc.includes('coverage')) {
    return 'insurance'
  }

  // Marketing
  if (lowerDesc.includes('advertising') || lowerDesc.includes('marketing') || 
      lowerDesc.includes('facebook ad') || lowerDesc.includes('google ad')) {
    return 'marketing'
  }

  return 'other'
}

/**
 * Generates a cash flow report for a date range
 */
export function generateCashFlowReport(
  payments: Payment[],
  expenses: Expense[],
  startDate: string,
  endDate: string
): {
  income: number
  expenses: number
  netCashFlow: number
  transactions: Array<{
    date: string
    type: 'income' | 'expense'
    description: string
    amount: number
  }>
} {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const incomeTransactions = payments
    .filter(p => {
      const date = new Date(p.processedAt)
      return date >= start && date <= end
    })
    .map(p => ({
      date: p.processedAt,
      type: 'income' as const,
      description: `Payment received - Invoice #${p.invoiceId.substring(0, 8)}`,
      amount: p.amount - (p.fee || 0)
    }))

  const expenseTransactions = expenses
    .filter(e => {
      const date = new Date(e.date)
      return date >= start && date <= end
    })
    .map(e => ({
      date: e.date,
      type: 'expense' as const,
      description: e.description,
      amount: -e.amount
    }))

  const transactions = [...incomeTransactions, ...expenseTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const income = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
  const expensesTotal = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return {
    income,
    expenses: expensesTotal,
    netCashFlow: income - expensesTotal,
    transactions
  }
}

/**
 * Calculates tax estimates for a period
 */
export function calculateTaxEstimate(
  revenue: number,
  deductibleExpenses: Expense[],
  taxRate: number = 0.25 // Default 25% - should be configurable per user
): {
  grossRevenue: number
  deductibleExpenses: number
  taxableIncome: number
  estimatedTax: number
  effectiveRate: number
} {
  const deductibleTotal = deductibleExpenses
    .filter(e => e.taxDeductible)
    .reduce((sum, e) => sum + e.amount, 0)

  const taxableIncome = Math.max(0, revenue - deductibleTotal)
  const estimatedTax = taxableIncome * taxRate

  return {
    grossRevenue: revenue,
    deductibleExpenses: deductibleTotal,
    taxableIncome,
    estimatedTax,
    effectiveRate: revenue > 0 ? (estimatedTax / revenue) * 100 : 0
  }
}
