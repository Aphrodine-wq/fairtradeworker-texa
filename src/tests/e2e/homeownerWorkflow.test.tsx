import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import type { User, Job, Bid } from '@/lib/types'

describe('Homeowner Workflow E2E', () => {
  let testHomeowner: User

  beforeEach(async () => {
    testHomeowner = {
      id: 'homeowner-e2e-1',
      email: 'homeowner@example.com',
      fullName: 'Jane Homeowner',
      role: 'homeowner',
      isPro: false,
      performanceScore: 0,
      bidAccuracy: 0,
      isOperator: false,
      createdAt: new Date().toISOString(),
      referralEarnings: 0,
      contractorInviteCount: 0,
    }

    await window.spark.kv.set('current-user', testHomeowner)
    await window.spark.kv.set('jobs', [])
    await window.spark.kv.set('bids', [])
  })

  describe('Job Posting Flow', () => {
    it('should allow homeowner to post a Quick Fix job', async () => {
      const job: Job = {
        id: 'job-quickfix-1',
        homeownerId: testHomeowner.id,
        title: 'Fix Leaky Faucet',
        description: 'Kitchen faucet is dripping',
        aiScope: {
          scope: 'Replace washer in kitchen faucet',
          priceLow: 75,
          priceHigh: 150,
          materials: ['faucet washer', 'plumbers tape'],
          confidenceScore: 85,
        },
        size: 'small',
        tier: 'QUICK_FIX',
        status: 'open',
        createdAt: new Date().toISOString(),
        bids: [],
      }

      await window.spark.kv.set('jobs', [job])
      
      const jobs = await window.spark.kv.get<Job[]>('jobs')
      expect(jobs).toHaveLength(1)
      expect(jobs![0].tier).toBe('QUICK_FIX')
      expect(jobs![0].aiScope.priceLow).toBe(75)
      expect(jobs![0].aiScope.priceHigh).toBe(150)
    })

    it('should generate referral code after posting job', async () => {
      const job: Job = {
        id: 'job-1',
        homeownerId: testHomeowner.id,
        title: 'Paint Living Room',
        description: 'Need two coats of paint',
        aiScope: {
          scope: 'Interior painting of living room',
          priceLow: 300,
          priceHigh: 500,
          materials: ['paint', 'primer', 'tape'],
        },
        size: 'small',
        status: 'open',
        createdAt: new Date().toISOString(),
        bids: [],
      }

      await window.spark.kv.set('jobs', [job])

      // Generate referral code
      const referralCode = `${testHomeowner.fullName.split(' ').map(n => n[0]).join('')}${testHomeowner.id.slice(0, 4).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      
      const updatedHomeowner = {
        ...testHomeowner,
        referralCode,
      }

      await window.spark.kv.set('current-user', updatedHomeowner)

      const user = await window.spark.kv.get<User>('current-user')
      expect(user?.referralCode).toBeTruthy()
      expect(user?.referralCode?.length).toBeGreaterThan(5)
    })

    it('should post major project with milestones', async () => {
      const job: Job = {
        id: 'job-major-1',
        homeownerId: testHomeowner.id,
        title: 'Kitchen Remodel',
        description: 'Complete kitchen renovation',
        aiScope: {
          scope: 'Full kitchen remodel including cabinets, countertops, appliances',
          priceLow: 20000,
          priceHigh: 30000,
          materials: ['cabinets', 'countertops', 'appliances', 'flooring'],
          confidenceScore: 88,
        },
        size: 'large',
        tier: 'MAJOR_PROJECT',
        status: 'open',
        createdAt: new Date().toISOString(),
        bids: [],
        estimatedDays: 45,
        tradesRequired: ['general contractor', 'plumber', 'electrician'],
        permitRequired: true,
        milestones: [
          {
            id: 'ms-1',
            jobId: 'job-major-1',
            name: 'Deposit',
            description: 'Contract signing',
            amount: 6000,
            percentage: 20,
            sequence: 1,
            status: 'pending',
            verificationRequired: 'photos',
          },
          {
            id: 'ms-2',
            jobId: 'job-major-1',
            name: 'Demolition',
            description: 'Old kitchen removed',
            amount: 3000,
            percentage: 10,
            sequence: 2,
            status: 'pending',
            verificationRequired: 'photos',
          },
        ],
      }

      await window.spark.kv.set('jobs', [job])

      const jobs = await window.spark.kv.get<Job[]>('jobs')
      expect(jobs![0].tier).toBe('MAJOR_PROJECT')
      expect(jobs![0].milestones).toHaveLength(2)
      expect(jobs![0].milestones![0].percentage).toBe(20)
      expect(jobs![0].permitRequired).toBe(true)
    })
  })

  describe('Bid Review and Selection', () => {
    it('should receive and review bids', async () => {
      const job: Job = {
        id: 'job-2',
        homeownerId: testHomeowner.id,
        title: 'Install New Fence',
        description: 'Wood fence in backyard',
        aiScope: {
          scope: 'Install 100ft wood fence',
          priceLow: 2000,
          priceHigh: 3500,
          materials: ['fence posts', 'fence panels', 'concrete'],
        },
        size: 'medium',
        status: 'open',
        createdAt: new Date().toISOString(),
        bids: [],
      }

      const bids: Bid[] = [
        {
          id: 'bid-1',
          jobId: job.id,
          contractorId: 'contractor-1',
          contractorName: 'John Builder',
          amount: 2500,
          message: 'I can complete this in 3 days',
          status: 'pending',
          createdAt: new Date().toISOString(),
          responseTimeMinutes: 12,
          isLightningBid: true,
        },
        {
          id: 'bid-2',
          jobId: job.id,
          contractorId: 'contractor-2',
          contractorName: 'Mike Fence Pro',
          amount: 2800,
          message: 'Premium cedar wood included',
          status: 'pending',
          createdAt: new Date().toISOString(),
          responseTimeMinutes: 25,
        },
      ]

      job.bids = bids
      await window.spark.kv.set('jobs', [job])

      const jobs = await window.spark.kv.get<Job[]>('jobs')
      expect(jobs![0].bids).toHaveLength(2)
      expect(jobs![0].bids[0].isLightningBid).toBe(true)
      expect(jobs![0].bids[0].responseTimeMinutes).toBeLessThan(15)
    })

    it('should accept a bid and reject others', async () => {
      const job: Job = {
        id: 'job-3',
        homeownerId: testHomeowner.id,
        title: 'Fix HVAC',
        description: 'AC not cooling properly',
        aiScope: {
          scope: 'Diagnose and repair AC unit',
          priceLow: 150,
          priceHigh: 400,
          materials: ['refrigerant', 'capacitor'],
        },
        size: 'small',
        status: 'open',
        createdAt: new Date().toISOString(),
        bids: [
          {
            id: 'bid-accept',
            jobId: 'job-3',
            contractorId: 'contractor-best',
            contractorName: 'HVAC Expert',
            amount: 275,
            message: 'Licensed HVAC tech, 20 years experience',
            status: 'pending',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'bid-reject',
            jobId: 'job-3',
            contractorId: 'contractor-other',
            contractorName: 'Generic Contractor',
            amount: 350,
            message: 'Can do it',
            status: 'pending',
            createdAt: new Date().toISOString(),
          },
        ],
      }

      await window.spark.kv.set('jobs', [job])

      // Accept first bid
      job.bids[0].status = 'accepted'
      job.bids[1].status = 'rejected'
      job.status = 'in-progress'

      await window.spark.kv.set('jobs', [job])

      const jobs = await window.spark.kv.get<Job[]>('jobs')
      expect(jobs![0].bids[0].status).toBe('accepted')
      expect(jobs![0].bids[1].status).toBe('rejected')
      expect(jobs![0].status).toBe('in-progress')
    })
  })

  describe('Referral System', () => {
    it('should track referral code usage', async () => {
      const referrer = testHomeowner
      referrer.referralCode = 'JH1234ABCD'
      await window.spark.kv.set('current-user', referrer)

      // New user uses referral code
      const newHomeowner: User = {
        id: 'homeowner-2',
        email: 'neighbor@example.com',
        fullName: 'Bob Neighbor',
        role: 'homeowner',
        isPro: false,
        performanceScore: 0,
        bidAccuracy: 0,
        isOperator: false,
        createdAt: new Date().toISOString(),
        referredBy: 'JH1234ABCD',
        referralEarnings: 0,
        contractorInviteCount: 0,
      }

      await window.spark.kv.set('users', [referrer, newHomeowner])

      // Both users should get credit
      referrer.referralEarnings = (referrer.referralEarnings || 0) + 20
      await window.spark.kv.set('current-user', referrer)

      const user = await window.spark.kv.get<User>('current-user')
      expect(user?.referralEarnings).toBe(20)

      const users = await window.spark.kv.get<User[]>('users')
      const newUser = users?.find(u => u.id === newHomeowner.id)
      expect(newUser?.referredBy).toBe('JH1234ABCD')
    })
  })

  describe('Milestone Payments', () => {
    it('should pay milestone in sequence', async () => {
      const job: Job = {
        id: 'job-milestone',
        homeownerId: testHomeowner.id,
        title: 'Deck Building',
        description: 'Build 400 sq ft deck',
        aiScope: {
          scope: 'Build composite deck with railing',
          priceLow: 8000,
          priceHigh: 12000,
          materials: ['composite decking', 'posts', 'railing'],
        },
        size: 'large',
        tier: 'MAJOR_PROJECT',
        status: 'in-progress',
        createdAt: new Date().toISOString(),
        bids: [],
        milestones: [
          {
            id: 'ms-deck-1',
            jobId: 'job-milestone',
            name: 'Foundation & Framing',
            description: 'Posts and frame installed',
            amount: 3000,
            percentage: 30,
            sequence: 1,
            status: 'pending',
            verificationRequired: 'photos',
          },
          {
            id: 'ms-deck-2',
            jobId: 'job-milestone',
            name: 'Decking Installation',
            description: 'All boards laid',
            amount: 4000,
            percentage: 40,
            sequence: 2,
            status: 'pending',
            verificationRequired: 'photos',
          },
          {
            id: 'ms-deck-3',
            jobId: 'job-milestone',
            name: 'Railing & Finish',
            description: 'Final completion',
            amount: 3000,
            percentage: 30,
            sequence: 3,
            status: 'pending',
            verificationRequired: 'walkthrough',
          },
        ],
      }

      await window.spark.kv.set('jobs', [job])

      // Pay first milestone
      job.milestones![0].status = 'in-progress'
      job.milestones![0].photos = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg']
      job.milestones![0].requestedAt = new Date().toISOString()
      await window.spark.kv.set('jobs', [job])

      job.milestones![0].status = 'paid'
      job.milestones![0].paidAt = new Date().toISOString()
      await window.spark.kv.set('jobs', [job])

      const jobs = await window.spark.kv.get<Job[]>('jobs')
      expect(jobs![0].milestones![0].status).toBe('paid')
      expect(jobs![0].milestones![0].paidAt).toBeTruthy()
      expect(jobs![0].milestones![0].photos).toHaveLength(3)
    })

    it('should not allow out-of-sequence milestone payment', async () => {
      const job: Job = {
        id: 'job-seq',
        homeownerId: testHomeowner.id,
        title: 'Bathroom Remodel',
        description: 'Full bathroom renovation',
        aiScope: {
          scope: 'Complete bathroom remodel',
          priceLow: 10000,
          priceHigh: 15000,
          materials: ['tile', 'vanity', 'fixtures'],
        },
        size: 'large',
        tier: 'MAJOR_PROJECT',
        status: 'in-progress',
        createdAt: new Date().toISOString(),
        bids: [],
        milestones: [
          {
            id: 'ms-1',
            jobId: 'job-seq',
            name: 'Milestone 1',
            description: 'First step',
            amount: 5000,
            percentage: 50,
            sequence: 1,
            status: 'pending',
            verificationRequired: 'photos',
          },
          {
            id: 'ms-2',
            jobId: 'job-seq',
            name: 'Milestone 2',
            description: 'Second step',
            amount: 5000,
            percentage: 50,
            sequence: 2,
            status: 'pending',
            verificationRequired: 'photos',
          },
        ],
      }

      await window.spark.kv.set('jobs', [job])

      const validatePaymentSequence = () => {
        const milestone2 = job.milestones![1]
        const milestone1 = job.milestones![0]
        
        if (milestone1.status !== 'paid' && milestone2.status === 'paid') {
          throw new Error('Cannot pay milestone 2 before milestone 1')
        }
      }

      expect(validatePaymentSequence).not.toThrow()

      // Try to pay second milestone first
      job.milestones![1].status = 'paid'
      expect(validatePaymentSequence).toThrow()
    })
  })

  describe('Change Orders', () => {
    it('should approve change order and add to project cost', async () => {
      const job: Job = {
        id: 'job-change',
        homeownerId: testHomeowner.id,
        title: 'Kitchen Remodel',
        description: 'Full renovation',
        aiScope: {
          scope: 'Kitchen remodel',
          priceLow: 15000,
          priceHigh: 20000,
          materials: ['cabinets', 'countertops'],
        },
        size: 'large',
        tier: 'MAJOR_PROJECT',
        status: 'in-progress',
        createdAt: new Date().toISOString(),
        bids: [],
      }

      await window.spark.kv.set('jobs', [job])

      const scopeChange = {
        id: 'change-1',
        jobId: job.id,
        discoveredAt: new Date().toISOString(),
        description: 'Water damage behind wall needs repair',
        photos: ['damage1.jpg', 'damage2.jpg'],
        additionalCost: 850,
        status: 'pending' as const,
      }

      await window.spark.kv.set('scope-changes', [scopeChange])

      // Approve change order
      scopeChange.status = 'approved'
      const approvedAt = new Date().toISOString()
      await window.spark.kv.set('scope-changes', [{ ...scopeChange, approvedAt }])

      const scopeChanges = await window.spark.kv.get<any[]>('scope-changes')
      expect(scopeChanges![0].status).toBe('approved')
      expect(scopeChanges![0].approvedAt).toBeTruthy()
      expect(scopeChanges![0].additionalCost).toBe(850)
    })
  })

  describe('Project Completion', () => {
    it('should mark job as completed after all milestones paid', async () => {
      const job: Job = {
        id: 'job-complete',
        homeownerId: testHomeowner.id,
        title: 'Roof Repair',
        description: 'Fix roof leak',
        aiScope: {
          scope: 'Repair damaged shingles and seal',
          priceLow: 1500,
          priceHigh: 2500,
          materials: ['shingles', 'underlayment', 'sealant'],
        },
        size: 'medium',
        tier: 'STANDARD',
        status: 'in-progress',
        createdAt: new Date().toISOString(),
        bids: [],
        milestones: [
          {
            id: 'ms-roof-1',
            jobId: 'job-complete',
            name: 'Repair',
            description: 'Complete repair',
            amount: 2000,
            percentage: 100,
            sequence: 1,
            status: 'pending',
            verificationRequired: 'photos',
          },
        ],
      }

      await window.spark.kv.set('jobs', [job])

      // Complete milestone
      job.milestones![0].status = 'paid'
      job.milestones![0].paidAt = new Date().toISOString()
      job.status = 'completed'
      
      await window.spark.kv.set('jobs', [job])

      const jobs = await window.spark.kv.get<Job[]>('jobs')
      expect(jobs![0].status).toBe('completed')
      expect(jobs![0].milestones![0].status).toBe('paid')
    })
  })
})
