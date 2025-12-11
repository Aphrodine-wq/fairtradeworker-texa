export type UserRole = 'homeowner' | 'contractor' | 'operator'

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  territoryId?: number
  isPro: boolean
  proSince?: string
  createdAt: string
}

export interface Job {
  id: string
  homeownerId: string
  title: string
  description: string
  mediaUrl?: string
  mediaType?: 'video' | 'audio' | 'photo'
  aiScope: {
    scope: string
    priceLow: number
    priceHigh: number
    materials: string[]
  }
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
