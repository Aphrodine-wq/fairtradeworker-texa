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

export interface Invoice {
  id: string
  contractorId: string
  jobId: string
  jobTitle: string
  amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  dueDate: string
  reminderSentAt?: string
  lateFeeApplied: boolean
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

export interface CRMCustomer {
  id: string
  contractorId: string
  name: string
  email?: string
  phone?: string
  invitedVia: 'email' | 'sms'
  invitedAt: string
  status: 'invited' | 'active' | 'inactive'
  notes?: string
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
