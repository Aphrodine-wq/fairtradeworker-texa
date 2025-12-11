export type UserRole = 'homeowner' | 'contractor' | 'operator'

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  territoryId?: number
  isPro: boolean
  proSince?: string
  performanceScore: number
  bidAccuracy: number
  isOperator: boolean
  createdAt: string
  referralCode?: string
  referredBy?: string
  referralEarnings: number
  contractorInviteCount: number
}

export type JobSize = 'small' | 'medium' | 'large'

export interface Job {
  id: string
  homeownerId: string
  title: string
  description: string
  mediaUrl?: string
  mediaType?: 'video' | 'audio' | 'photo'
  photos?: string[]
  aiScope: {
    scope: string
    priceLow: number
    priceHigh: number
    materials: string[]
  }
  size: JobSize
  status: 'open' | 'in-progress' | 'completed' | 'cancelled'
  territoryId?: number
  createdAt: string
  bids: Bid[]
}

export interface Bid {
  id: string
  jobId: string
  contractorId: string
  contractorName: string
  amount: number
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

export interface InvoiceLineItem {
  description: string
  quantity: number
  rate: number
  total: number
}

export interface Invoice {
  id: string
  contractorId: string
  homeownerId?: string
  jobId: string
  jobTitle: string
  lineItems: InvoiceLineItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue'
  dueDate: string
  sentDate?: string
  paidDate?: string
  reminderSentAt?: string
  lateFeeApplied: boolean
  isProForma: boolean
  createdAt: string
}

export interface CompanyInvoice {
  id: string
  contractorId: string
  period: string
  lineItems: {
    description: string
    amount: number
  }[]
  total: number
  status: 'pending' | 'paid' | 'failed'
  autoCharge: boolean
  chargeDate: string
  createdAt: string
}

export interface Territory {
  id: number
  countyName: string
  operatorId?: string
  operatorName?: string
  status: 'available' | 'claimed'
}

export function calculateJobSize(priceHigh: number): JobSize {
  if (priceHigh <= 300) return 'small'
  if (priceHigh <= 1500) return 'medium'
  return 'large'
}

export function getJobSizeEmoji(size: JobSize): string {
  switch (size) {
    case 'small': return '🟢'
    case 'medium': return '🟡'
    case 'large': return '🔴'
  }
}

export function getJobSizeLabel(size: JobSize): string {
  switch (size) {
    case 'small': return 'Small'
    case 'medium': return 'Medium'
    case 'large': return 'Large'
  }
}

export type CRMCustomerStatus = 'lead' | 'active' | 'completed' | 'advocate'
export type CRMCustomerSource = 'bid' | 'manual_invite' | 'referral'

export interface CRMCustomer {
  id: string
  contractorId: string
  name: string
  email?: string
  phone?: string
  invitedVia: 'email' | 'sms'
  invitedAt: string
  status: CRMCustomerStatus
  source: CRMCustomerSource
  lifetimeValue: number
  lastContact: string
  tags: string[]
  notes?: string
  createdAt: string
}

export interface FollowUpSequence {
  id: string
  contractorId: string
  name: string
  steps: FollowUpStep[]
  active: boolean
  createdAt: string
}

export interface FollowUpStep {
  id: string
  day: number
  action: 'sms' | 'email'
  message: string
  delay: string
}

export interface ScheduledFollowUp {
  id: string
  customerId: string
  sequenceId: string
  stepId: string
  scheduledFor: string
  status: 'pending' | 'sent' | 'paused' | 'completed'
  createdAt: string
}

export interface ReferralCode {
  id: string
  code: string
  ownerId: string
  ownerName: string
  discount: number
  earnings: number
  usedBy: string[]
  createdAt: string
}

export interface ContractorReferral {
  id: string
  referrerId: string
  referrerName: string
  refereeId?: string
  refereeName: string
  phone: string
  status: 'sent' | 'signed-up' | 'completed-first-job'
  reward: number
  createdAt: string
}
