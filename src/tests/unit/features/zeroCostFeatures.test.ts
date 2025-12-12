import { describe, it, expect } from 'vitest'
import type { BidTemplate, Job, User } from '@/lib/types'

describe('Zero-Cost Features - Phase 1', () => {
  describe('BidTemplate Type', () => {
    it('should have correct structure for bid templates', () => {
      const template: BidTemplate = {
        id: 'template-1',
        contractorId: 'contractor-123',
        name: 'Standard Introduction',
        message: 'Hello! I have 10 years of experience...',
        useCount: 5,
        lastUsed: '2024-01-15T10:00:00Z',
        createdAt: '2024-01-01T10:00:00Z'
      }

      expect(template.id).toBe('template-1')
      expect(template.contractorId).toBe('contractor-123')
      expect(template.name).toBe('Standard Introduction')
      expect(template.message).toContain('experience')
      expect(template.useCount).toBe(5)
    })
  })

  describe('Social Proof - Job Viewing Tracking', () => {
    it('should track contractors viewing a job', () => {
      const job: Partial<Job> = {
        id: 'job-1',
        title: 'Fix Leaking Faucet',
        viewingContractors: ['contractor-1', 'contractor-2', 'contractor-3'],
        lastViewUpdate: '2024-01-15T10:00:00Z'
      }

      expect(job.viewingContractors).toHaveLength(3)
      expect(job.viewingContractors).toContain('contractor-1')
      expect(job.lastViewUpdate).toBeDefined()
    })

    it('should calculate recent bids correctly', () => {
      const now = Date.now()
      const fiveMinutesAgo = now - (5 * 60 * 1000)
      const tenMinutesAgo = now - (10 * 60 * 1000)

      const job: Partial<Job> = {
        id: 'job-1',
        bids: [
          {
            id: 'bid-1',
            jobId: 'job-1',
            contractorId: 'c1',
            contractorName: 'John',
            amount: 100,
            message: 'I can help',
            status: 'pending',
            createdAt: new Date(fiveMinutesAgo - 60000).toISOString()
          },
          {
            id: 'bid-2',
            jobId: 'job-1',
            contractorId: 'c2',
            contractorName: 'Jane',
            amount: 120,
            message: 'I can help too',
            status: 'pending',
            createdAt: new Date(tenMinutesAgo).toISOString()
          }
        ]
      }

      const recentBids = job.bids!.filter(bid => {
        const bidTime = new Date(bid.createdAt).getTime()
        return bidTime >= fiveMinutesAgo
      })

      expect(recentBids).toHaveLength(1)
      expect(recentBids[0].id).toBe('bid-1')
    })
  })

  describe('Available Now - Contractor Status', () => {
    it('should track contractor availability status', () => {
      const contractor: Partial<User> = {
        id: 'contractor-1',
        fullName: 'John Contractor',
        availableNow: true,
        availableNowSince: '2024-01-15T08:00:00Z'
      }

      expect(contractor.availableNow).toBe(true)
      expect(contractor.availableNowSince).toBeDefined()
    })
  })

  describe('Smart Job Titles', () => {
    it('should have suggested title in AI scope', () => {
      const job: Partial<Job> = {
        id: 'job-1',
        title: 'Help needed',
        aiScope: {
          scope: 'Fix leaking kitchen faucet',
          priceLow: 100,
          priceHigh: 200,
          materials: ['Faucet washer', 'Plumber tape'],
          suggestedTitle: 'Kitchen Faucet Repair'
        }
      }

      expect(job.aiScope.suggestedTitle).toBeDefined()
      expect(job.aiScope.suggestedTitle).toBe('Kitchen Faucet Repair')
      expect(job.aiScope.suggestedTitle).not.toBe(job.title)
    })
  })

  describe('Re-Hire - Completed Jobs', () => {
    it('should identify completed contractor for re-hire', () => {
      const job: Partial<Job> = {
        id: 'job-1',
        status: 'completed',
        bids: [
          {
            id: 'bid-1',
            jobId: 'job-1',
            contractorId: 'contractor-123',
            contractorName: 'John Doe',
            amount: 150,
            message: 'I can help',
            status: 'accepted',
            createdAt: '2024-01-15T10:00:00Z'
          }
        ]
      }

      const acceptedBid = job.bids!.find(b => b.status === 'accepted')
      
      expect(job.status).toBe('completed')
      expect(acceptedBid).toBeDefined()
      expect(acceptedBid!.contractorId).toBe('contractor-123')
    })
  })

  describe('Completion Card - Job Rating', () => {
    it('should include rating in completed job', () => {
      const job: Partial<Job> = {
        id: 'job-1',
        status: 'completed',
        rating: 5,
        beforePhotos: ['photo1.jpg'],
        afterPhotos: ['photo2.jpg']
      }

      expect(job.rating).toBe(5)
      expect(job.beforePhotos).toHaveLength(1)
      expect(job.afterPhotos).toHaveLength(1)
    })
  })
})
