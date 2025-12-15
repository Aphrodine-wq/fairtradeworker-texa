/**
 * Type-safe query utilities for data access
 * Provides reusable, type-safe functions for filtering and querying data
 */

import type { Job, Bid, User, JobStatus, BidStatus } from './types'
import type { UserId, JobId, BidId } from './types/branded'

/**
 * Job query utilities
 */
export const jobQueries = {
  /**
   * Filter jobs by status
   */
  byStatus: (jobs: Job[], status: JobStatus): Job[] => {
    return jobs.filter(job => job.status === status)
  },
  
  /**
   * Get jobs for a specific contractor (by ID)
   */
  byContractor: (jobs: Job[], contractorId: UserId | string): Job[] => {
    return jobs.filter(job => 
      job.contractorId === contractorId ||
      job.bids.some(bid => bid.contractorId === contractorId)
    )
  },
  
  /**
   * Get jobs for a specific homeowner
   */
  byHomeowner: (jobs: Job[], homeownerId: UserId | string): Job[] => {
    return jobs.filter(job => job.homeownerId === homeownerId)
  },
  
  /**
   * Get open jobs with optional filters
   */
  openJobs: (jobs: Job[], filters?: {
    minPrice?: number
    maxPrice?: number
    size?: Job['size']
    territoryId?: number
    tier?: Job['tier']
  }): Job[] => {
    return jobs.filter(job => {
      if (job.status !== 'open') return false
      
      if (filters?.minPrice && job.aiScope.priceHigh < filters.minPrice) {
        return false
      }
      
      if (filters?.maxPrice && job.aiScope.priceLow > filters.maxPrice) {
        return false
      }
      
      if (filters?.size && job.size !== filters.size) {
        return false
      }
      
      if (filters?.territoryId && job.territoryId !== filters.territoryId) {
        return false
      }
      
      if (filters?.tier && job.tier !== filters.tier) {
        return false
      }
      
      return true
    })
  },
  
  /**
   * Get jobs without any bids
   */
  withoutBids: (jobs: Job[]): Job[] => {
    return jobs.filter(job => job.bids.length === 0)
  },
  
  /**
   * Get urgent jobs
   */
  urgent: (jobs: Job[]): Job[] => {
    return jobs.filter(job => job.isUrgent === true)
  },
  
  /**
   * Sort jobs by creation date (newest first)
   */
  sortByNewest: (jobs: Job[]): Job[] => {
    return [...jobs].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },
  
  /**
   * Sort jobs by price range (lowest first)
   */
  sortByPrice: (jobs: Job[]): Job[] => {
    return [...jobs].sort((a, b) => 
      a.aiScope.priceLow - b.aiScope.priceLow
    )
  }
}

/**
 * Bid query utilities
 */
export const bidQueries = {
  /**
   * Get bids for a specific job
   */
  byJob: (bids: Bid[], jobId: JobId | string): Bid[] => {
    return bids.filter(bid => bid.jobId === jobId)
  },
  
  /**
   * Get bids by a specific contractor
   */
  byContractor: (bids: Bid[], contractorId: UserId | string): Bid[] => {
    return bids.filter(bid => bid.contractorId === contractorId)
  },
  
  /**
   * Filter bids by status
   */
  byStatus: (bids: Bid[], status: BidStatus): Bid[] => {
    return bids.filter(bid => bid.status === status)
  },
  
  /**
   * Get accepted bids
   */
  accepted: (bids: Bid[]): Bid[] => {
    return bids.filter(bid => bid.status === 'accepted')
  },
  
  /**
   * Get pending bids
   */
  pending: (bids: Bid[]): Bid[] => {
    return bids.filter(bid => bid.status === 'pending')
  },
  
  /**
   * Get rejected bids
   */
  rejected: (bids: Bid[]): Bid[] => {
    return bids.filter(bid => bid.status === 'rejected')
  },
  
  /**
   * Get boosted bids
   */
  boosted: (bids: Bid[]): Bid[] => {
    return bids.filter(bid => {
      if (!bid.isBoosted || !bid.boostedUntil) return false
      return new Date(bid.boostedUntil) > new Date()
    })
  },
  
  /**
   * Sort bids by amount (lowest first)
   */
  sortByAmount: (bids: Bid[]): Bid[] => {
    return [...bids].sort((a, b) => a.amount - b.amount)
  },
  
  /**
   * Sort bids by creation date (newest first)
   */
  sortByNewest: (bids: Bid[]): Bid[] => {
    return [...bids].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }
}

/**
 * User query utilities
 */
export const userQueries = {
  /**
   * Filter users by role
   */
  byRole: (users: User[], role: User['role']): User[] => {
    return users.filter(user => user.role === role)
  },
  
  /**
   * Get contractors
   */
  contractors: (users: User[]): User[] => {
    return users.filter(user => user.role === 'contractor')
  },
  
  /**
   * Get homeowners
   */
  homeowners: (users: User[]): User[] => {
    return users.filter(user => user.role === 'homeowner')
  },
  
  /**
   * Get Pro users
   */
  proUsers: (users: User[]): User[] => {
    return users.filter(user => user.isPro === true)
  },
  
  /**
   * Sort users by performance score (highest first)
   */
  sortByPerformance: (users: User[]): User[] => {
    return [...users].sort((a, b) => b.performanceScore - a.performanceScore)
  }
}

/**
 * Combined query utilities
 */
export const queries = {
  /**
   * Get contractor's won bids (accepted bids on completed jobs)
   */
  contractorWonBids: (jobs: Job[], contractorId: UserId | string): Bid[] => {
    return jobs
      .filter(job => job.status === 'completed' && job.contractorId === contractorId)
      .flatMap(job => 
        job.bids.filter(bid => 
          bid.contractorId === contractorId && bid.status === 'accepted'
        )
      )
  },
  
  /**
   * Get contractor's active jobs (in-progress jobs)
   */
  contractorActiveJobs: (jobs: Job[], contractorId: UserId | string): Job[] => {
    return jobs.filter(job => 
      job.status === 'in-progress' && job.contractorId === contractorId
    )
  }
}
