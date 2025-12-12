import { describe, it, expect, beforeEach } from 'vitest'
import type { User, Job, Bid, Invoice, Milestone } from '@/lib/types'
import { generateReferralCode, calculateTax, calculateTotal } from '../helpers/testData'

describe('Integration & Cross-Feature Workflows', () => {
  beforeEach(async () => {
    await window.spark.kv.set('users', [])
    await window.spark.kv.set('jobs', [])
    await window.spark.kv.set('bids', [])
    await window.spark.kv.set('invoices', [])
  })

  describe('Complete Job Lifecycle', () => {
    it('should complete full workflow from job posting to payment and review', async () => {
      // 1. Homeowner posts job
      const homeowner: User = {
        id: 'h-lifecycle',
        email: 'homeowner@lifecycle.com',
        fullName: 'Lifecycle Homeowner',
        role: 'homeowner',
        isPro: false,
        performanceScore: 0,
        bidAccuracy: 0,
        isOperator: false,
        createdAt: new Date().toISOString(),
        referralEarnings: 0,
        contractorInviteCount: 0,
      }

      const job: Job = {
        id: 'job-lifecycle',
        homeownerId: homeowner.id,
        title: 'Install Ceiling Fan',
        description: 'Replace old light fixture with ceiling fan',
        aiScope: {
          scope: 'Remove old fixture, install ceiling fan with light kit',
          priceLow: 150,
          priceHigh: 250,
          materials: ['ceiling fan', 'mounting bracket', 'wire nuts'],
          confidenceScore: 92,
        },
        size: 'small',
        tier: 'QUICK_FIX',
        status: 'open',
        createdAt: new Date().toISOString(),
        bids: [],
      }

      await window.spark.kv.set('jobs', [job])

      // 2. Homeowner gets referral code
      homeowner.referralCode = generateReferralCode(homeowner.fullName, homeowner.id)
      await window.spark.kv.set('users', [homeowner])

      // 3. Contractor submits Lightning Bid
      const contractor: User = {
        id: 'c-lifecycle',
        email: 'contractor@lifecycle.com',
        fullName: 'Lifecycle Contractor',
        role: 'contractor',
        isPro: true,
        performanceScore: 8.5,
        bidAccuracy: 0.88,
        isOperator: false,
        createdAt: new Date().toISOString(),
        referralEarnings: 0,
        contractorInviteCount: 0,
        averageResponseTimeMinutes: 10,
        winRate: 0.70,
        feesAvoided: 8000,
      }

      const bid: Bid = {
        id: 'bid-lifecycle',
        jobId: job.id,
        contractorId: contractor.id,
        contractorName: contractor.fullName,
        amount: 200,
        message: 'Licensed electrician, can do today',
        status: 'pending',
        createdAt: new Date(new Date(job.createdAt).getTime() + 8 * 60 * 1000).toISOString(),
        responseTimeMinutes: 8,
        isLightningBid: true,
      }

      job.bids.push(bid)
      await window.spark.kv.set('jobs', [job])

      // 4. Homeowner accepts bid
      bid.status = 'accepted'
      job.status = 'in-progress'
      await window.spark.kv.set('jobs', [job])

      // 5. Work completed
      job.status = 'completed'
      job.afterPhotos = ['completed1.jpg', 'completed2.jpg']
      await window.spark.kv.set('jobs', [job])

      // 6. Create invoice
      const taxRate = 0.0825
      const subtotal = 200
      const invoice: Invoice = {
        id: 'invoice-lifecycle',
        contractorId: contractor.id,
        homeownerId: homeowner.id,
        jobId: job.id,
        jobTitle: job.title,
        lineItems: [
          { description: 'Ceiling fan installation', quantity: 1, rate: 200, total: 200 },
        ],
        subtotal,
        taxRate,
        taxAmount: calculateTax(subtotal, taxRate),
        total: calculateTotal(subtotal, taxRate),
        status: 'sent',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        sentDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        lateFeeApplied: false,
        isProForma: false,
      }

      await window.spark.kv.set('invoices', [invoice])

      // 7. Payment processed
      invoice.status = 'paid'
      invoice.paidDate = new Date().toISOString()
      await window.spark.kv.set('invoices', [invoice])

      // 8. Contractor gets payout
      const payout = {
        id: 'payout-lifecycle',
        contractorId: contractor.id,
        jobId: job.id,
        amount: 200,
        status: 'completed',
        completedAt: new Date().toISOString(),
        isInstant: true,
        transferId: 'tr_lifecycle_123',
      }

      await window.spark.kv.set('contractor-payouts', [payout])

      // 9. Add to CRM
      const crmCustomer = {
        id: 'crm-lifecycle',
        contractorId: contractor.id,
        name: homeowner.fullName,
        email: homeowner.email,
        jobsCompleted: 1,
        totalSpent: 200,
        lastJobDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }

      await window.spark.kv.set('crm-customers', [crmCustomer])

      // Verify complete lifecycle
      const jobs = await window.spark.kv.get<Job[]>('jobs')
      const invoices = await window.spark.kv.get<Invoice[]>('invoices')
      const payouts = await window.spark.kv.get<any[]>('contractor-payouts')
      const customers = await window.spark.kv.get<any[]>('crm-customers')

      expect(jobs![0].status).toBe('completed')
      expect(jobs![0].bids[0].status).toBe('accepted')
      expect(jobs![0].bids[0].isLightningBid).toBe(true)
      expect(invoices![0].status).toBe('paid')
      expect(payouts![0].status).toBe('completed')
      expect(customers![0].jobsCompleted).toBe(1)
    })
  })

  describe('Referral Chain Workflow', () => {
    it('should track multi-level referral chain and earnings', async () => {
      // User A posts job, gets referral code
      const userA: User = {
        id: 'user-a',
        email: 'usera@example.com',
        fullName: 'User A',
        role: 'homeowner',
        isPro: false,
        performanceScore: 0,
        bidAccuracy: 0,
        isOperator: false,
        createdAt: new Date().toISOString(),
        referralCode: generateReferralCode('User A', 'user-a'),
        referralEarnings: 0,
        contractorInviteCount: 0,
      }

      // User B uses A's code
      const userB: User = {
        id: 'user-b',
        email: 'userb@example.com',
        fullName: 'User B',
        role: 'homeowner',
        isPro: false,
        performanceScore: 0,
        bidAccuracy: 0,
        isOperator: false,
        createdAt: new Date().toISOString(),
        referredBy: userA.referralCode,
        referralCode: generateReferralCode('User B', 'user-b'),
        referralEarnings: 20, // Gets $20 for using code
        contractorInviteCount: 0,
      }

      // User A gets $20 for referral
      userA.referralEarnings = 20

      // User C uses B's code
      const userC: User = {
        id: 'user-c',
        email: 'userc@example.com',
        fullName: 'User C',
        role: 'homeowner',
        isPro: false,
        performanceScore: 0,
        bidAccuracy: 0,
        isOperator: false,
        createdAt: new Date().toISOString(),
        referredBy: userB.referralCode,
        referralEarnings: 20, // Gets $20 for using code
        contractorInviteCount: 0,
      }

      // User B gets $20 for referral
      userB.referralEarnings += 20

      // User A gets 10% bonus for second-degree referral
      userA.referralEarnings += 2

      await window.spark.kv.set('users', [userA, userB, userC])

      const users = await window.spark.kv.get<User[]>('users')
      const userAEarnings = users?.find(u => u.id === 'user-a')?.referralEarnings
      const userBEarnings = users?.find(u => u.id === 'user-b')?.referralEarnings
      const userCEarnings = users?.find(u => u.id === 'user-c')?.referralEarnings

      expect(userAEarnings).toBe(22) // $20 + $2 second-degree bonus
      expect(userBEarnings).toBe(40) // $20 for using code + $20 for referral
      expect(userCEarnings).toBe(20) // $20 for using code
    })
  })

  describe('Contractor Network Growth', () => {
    it('should track contractor referral network and rewards', async () => {
      const referringContractor: User = {
        id: 'c-referrer',
        email: 'referrer@example.com',
        fullName: 'Referring Contractor',
        role: 'contractor',
        isPro: true,
        performanceScore: 8.5,
        bidAccuracy: 0.88,
        isOperator: false,
        createdAt: new Date().toISOString(),
        referralEarnings: 0,
        contractorInviteCount: 0,
        averageResponseTimeMinutes: 12,
        winRate: 0.70,
        feesAvoided: 10000,
      }

      // Invite 5 contractors
      const referrals = Array.from({ length: 5 }, (_, i) => ({
        id: `ref-${i}`,
        referrerId: referringContractor.id,
        referrerName: referringContractor.fullName,
        inviteeName: `Contractor ${i}`,
        inviteePhone: `555-000${i}`,
        inviteeEmail: `contractor${i}@example.com`,
        trade: ['plumbing', 'electrical', 'HVAC', 'carpentry', 'painting'][i],
        status: 'completed-first-job' as const,
        sentAt: new Date(Date.now() - (30 - i * 5) * 24 * 60 * 60 * 1000).toISOString(),
        signedUpAt: new Date(Date.now() - (25 - i * 5) * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - (10 - i * 2) * 24 * 60 * 60 * 1000).toISOString(),
      }))

      await window.spark.kv.set('contractor-referrals', referrals)

      // Each completed referral earns $50
      referringContractor.referralEarnings = 5 * 50 // $250
      referringContractor.contractorInviteCount = 5

      // Award Crew Leader badge
      const contractorStats = {
        id: referringContractor.id,
        successfulReferrals: 5,
        badges: ['crew-leader'],
      }

      await window.spark.kv.set('contractor-stats', [contractorStats])
      await window.spark.kv.set('current-user', referringContractor)

      const user = await window.spark.kv.get<User>('current-user')
      const stats = await window.spark.kv.get<any[]>('contractor-stats')
      const allReferrals = await window.spark.kv.get<any[]>('contractor-referrals')

      expect(user?.referralEarnings).toBe(250)
      expect(user?.contractorInviteCount).toBe(5)
      expect(stats![0].badges).toContain('crew-leader')
      expect(allReferrals?.every(r => r.status === 'completed-first-job')).toBe(true)
    })
  })

  describe('Territory Operator Revenue Flow', () => {
    it('should track complete revenue flow through territory', async () => {
      const operator: User = {
        id: 'op-revenue',
        email: 'operator@example.com',
        fullName: 'Revenue Operator',
        role: 'operator',
        isPro: true,
        performanceScore: 9.0,
        bidAccuracy: 0.92,
        isOperator: true,
        territoryId: 601,
        createdAt: new Date().toISOString(),
        referralEarnings: 0,
        contractorInviteCount: 0,
      }

      // Jobs in territory
      const jobs: Job[] = Array.from({ length: 10 }, (_, i) => ({
        id: `terr-job-${i}`,
        homeownerId: `h-${i}`,
        title: `Job ${i}`,
        description: 'Completed job',
        aiScope: {
          scope: 'Work completed',
          priceLow: 500,
          priceHigh: 1000,
          materials: ['materials'],
        },
        size: 'medium' as const,
        tier: 'STANDARD' as const,
        status: 'completed' as const,
        territoryId: operator.territoryId,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        bids: [
          {
            id: `bid-${i}`,
            jobId: `terr-job-${i}`,
            contractorId: `c-${i}`,
            contractorName: `Contractor ${i}`,
            amount: 750,
            message: 'Bid',
            status: 'accepted' as const,
            createdAt: new Date().toISOString(),
            responseTimeMinutes: 10 + i,
          },
        ],
      }))

      await window.spark.kv.set('jobs', jobs)

      // Calculate territory metrics
      const territoryJobs = jobs.filter(j => j.territoryId === operator.territoryId)
      const totalRevenue = territoryJobs.reduce((sum, job) => {
        const acceptedBid = job.bids.find(b => b.status === 'accepted')
        return sum + (acceptedBid?.amount || 0)
      }, 0)

      const avgResponseTime = territoryJobs.reduce((sum, job) => {
        const firstBid = job.bids[0]
        return sum + (firstBid?.responseTimeMinutes || 0)
      }, 0) / territoryJobs.length

      // Platform fee and operator share
      const platformFeeRate = 0.025 // 2.5%
      const operatorShare = 0.30 // 30% of platform fees
      const platformRevenue = totalRevenue * platformFeeRate
      const operatorEarnings = platformRevenue * operatorShare

      expect(territoryJobs).toHaveLength(10)
      expect(totalRevenue).toBe(7500) // 10 jobs × $750
      expect(avgResponseTime).toBeLessThan(15)
      expect(operatorEarnings).toBeGreaterThan(0)
      expect(platformRevenue).toBe(187.50) // 7500 × 2.5%
      expect(operatorEarnings).toBe(56.25) // 187.50 × 30%
    })
  })

  describe('Multi-Trade Major Project Coordination', () => {
    it('should coordinate multiple contractors on large project', async () => {
      const homeowner: User = {
        id: 'h-multitrade',
        email: 'homeowner@multitrade.com',
        fullName: 'Multi Trade Homeowner',
        role: 'homeowner',
        isPro: false,
        performanceScore: 0,
        bidAccuracy: 0,
        isOperator: false,
        createdAt: new Date().toISOString(),
        referralEarnings: 0,
        contractorInviteCount: 0,
      }

      const job: Job = {
        id: 'multitrade-job',
        homeownerId: homeowner.id,
        title: 'Complete Home Addition',
        description: 'Add 400 sq ft room with bathroom',
        aiScope: {
          scope: 'Room addition with bathroom, requires foundation, framing, electrical, plumbing, HVAC',
          priceLow: 40000,
          priceHigh: 60000,
          materials: ['lumber', 'electrical', 'plumbing', 'HVAC', 'drywall', 'fixtures'],
        },
        size: 'large',
        tier: 'MAJOR_PROJECT',
        status: 'in-progress',
        createdAt: new Date().toISOString(),
        bids: [],
        estimatedDays: 90,
        tradesRequired: ['general contractor', 'electrician', 'plumber', 'HVAC', 'drywaller'],
        permitRequired: true,
        multiTrade: true,
        tradeContractors: [
          {
            id: 'tc-gc',
            jobId: 'multitrade-job',
            contractorId: 'gc-1',
            contractorName: 'Lead General Contractor',
            trade: 'general contractor',
            role: 'lead',
            status: 'active',
            assignedMilestones: ['ms-1', 'ms-6'],
            totalAmount: 25000,
            amountPaid: 10000,
            contactPhone: '555-0001',
            invitedAt: new Date().toISOString(),
            acceptedAt: new Date().toISOString(),
          },
          {
            id: 'tc-elec',
            jobId: 'multitrade-job',
            contractorId: 'elec-1',
            contractorName: 'Electrician Pro',
            trade: 'electrician',
            role: 'sub',
            status: 'active',
            assignedMilestones: ['ms-3'],
            totalAmount: 8000,
            amountPaid: 4000,
            contactPhone: '555-0002',
            invitedAt: new Date().toISOString(),
            acceptedAt: new Date().toISOString(),
          },
          {
            id: 'tc-plumb',
            jobId: 'multitrade-job',
            contractorId: 'plumb-1',
            contractorName: 'Master Plumber',
            trade: 'plumber',
            role: 'sub',
            status: 'active',
            assignedMilestones: ['ms-3'],
            totalAmount: 7000,
            amountPaid: 3500,
            contactPhone: '555-0003',
            invitedAt: new Date().toISOString(),
            acceptedAt: new Date().toISOString(),
          },
          {
            id: 'tc-hvac',
            jobId: 'multitrade-job',
            contractorId: 'hvac-1',
            contractorName: 'HVAC Specialist',
            trade: 'HVAC',
            role: 'sub',
            status: 'active',
            assignedMilestones: ['ms-4'],
            totalAmount: 6000,
            amountPaid: 0,
            contactPhone: '555-0004',
            invitedAt: new Date().toISOString(),
            acceptedAt: new Date().toISOString(),
          },
          {
            id: 'tc-dry',
            jobId: 'multitrade-job',
            contractorId: 'dry-1',
            contractorName: 'Drywall Expert',
            trade: 'drywaller',
            role: 'sub',
            status: 'invited',
            assignedMilestones: ['ms-5'],
            totalAmount: 4000,
            amountPaid: 0,
            contactPhone: '555-0005',
            invitedAt: new Date().toISOString(),
          },
        ],
      }

      await window.spark.kv.set('jobs', [job])

      const jobs = await window.spark.kv.get<Job[]>('jobs')
      const project = jobs![0]

      expect(project.multiTrade).toBe(true)
      expect(project.tradeContractors).toHaveLength(5)
      
      const leadContractor = project.tradeContractors?.find(tc => tc.role === 'lead')
      expect(leadContractor?.trade).toBe('general contractor')
      
      const activeTrades = project.tradeContractors?.filter(tc => tc.status === 'active')
      expect(activeTrades?.length).toBe(4)
      
      const totalPaid = project.tradeContractors?.reduce((sum, tc) => sum + tc.amountPaid, 0)
      expect(totalPaid).toBe(17500)
    })
  })

  describe('Data Consistency Across Features', () => {
    it('should maintain data consistency between jobs, invoices, and payouts', async () => {
      const contractor: User = {
        id: 'c-consistency',
        email: 'contractor@consistency.com',
        fullName: 'Consistency Contractor',
        role: 'contractor',
        isPro: true,
        performanceScore: 8.5,
        bidAccuracy: 0.88,
        isOperator: false,
        createdAt: new Date().toISOString(),
        referralEarnings: 0,
        contractorInviteCount: 0,
        averageResponseTimeMinutes: 12,
        winRate: 0.70,
        feesAvoided: 15000,
      }

      const job: Job = {
        id: 'job-consistency',
        homeownerId: 'h-consistency',
        title: 'Bathroom Remodel',
        description: 'Update bathroom',
        aiScope: {
          scope: 'Bathroom renovation',
          priceLow: 8000,
          priceHigh: 12000,
          materials: ['tile', 'fixtures'],
        },
        size: 'large',
        tier: 'MAJOR_PROJECT',
        status: 'completed',
        createdAt: new Date().toISOString(),
        bids: [
          {
            id: 'bid-consistency',
            jobId: 'job-consistency',
            contractorId: contractor.id,
            contractorName: contractor.fullName,
            amount: 10000,
            message: 'Quality work guaranteed',
            status: 'accepted',
            createdAt: new Date().toISOString(),
          },
        ],
      }

      const taxRate = 0.0825
      const subtotal = 10000
      const invoice: Invoice = {
        id: 'invoice-consistency',
        contractorId: contractor.id,
        homeownerId: 'h-consistency',
        jobId: job.id,
        jobTitle: job.title,
        lineItems: [
          { description: 'Labor', quantity: 1, rate: 6000, total: 6000 },
          { description: 'Materials', quantity: 1, rate: 4000, total: 4000 },
        ],
        subtotal,
        taxRate,
        taxAmount: calculateTax(subtotal, taxRate),
        total: calculateTotal(subtotal, taxRate),
        status: 'paid',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        sentDate: new Date().toISOString(),
        paidDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        lateFeeApplied: false,
        isProForma: false,
      }

      const payout = {
        id: 'payout-consistency',
        contractorId: contractor.id,
        jobId: job.id,
        amount: 10000,
        status: 'completed',
        completedAt: new Date().toISOString(),
        isInstant: true,
        transferId: 'tr_consistency_123',
      }

      await window.spark.kv.set('jobs', [job])
      await window.spark.kv.set('invoices', [invoice])
      await window.spark.kv.set('contractor-payouts', [payout])

      const jobs = await window.spark.kv.get<Job[]>('jobs')
      const invoices = await window.spark.kv.get<Invoice[]>('invoices')
      const payouts = await window.spark.kv.get<any[]>('contractor-payouts')

      // Verify amounts match across all records
      const jobAmount = jobs![0].bids[0].amount
      const invoiceAmount = invoices![0].subtotal
      const payoutAmount = payouts![0].amount

      expect(jobAmount).toBe(10000)
      expect(invoiceAmount).toBe(10000)
      expect(payoutAmount).toBe(10000)

      // Verify statuses are consistent
      expect(jobs![0].status).toBe('completed')
      expect(invoices![0].status).toBe('paid')
      expect(payouts![0].status).toBe('completed')
    })
  })
})
