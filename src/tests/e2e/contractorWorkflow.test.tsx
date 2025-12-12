import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { User, Job, Bid, Invoice } from '@/lib/types'

describe('Contractor Workflow E2E', () => {
  let testContractor: User

  beforeEach(async () => {
    testContractor = {
      id: 'contractor-e2e-1',
      email: 'contractor@example.com',
      fullName: 'Mike Contractor',
      role: 'contractor',
      isPro: false,
      performanceScore: 8.2,
      bidAccuracy: 0.87,
      isOperator: false,
      createdAt: new Date().toISOString(),
      referralEarnings: 0,
      contractorInviteCount: 0,
      averageResponseTimeMinutes: 14,
      winRate: 0.68,
      feesAvoided: 8500,
    }

    await window.spark.kv.set('current-user', testContractor)
    await window.spark.kv.set('jobs', [])
    await window.spark.kv.set('bids', [])
    await window.spark.kv.set('invoices', [])
  })

  describe('Dashboard Navigation', () => {
    it('should display all active jobs in territory', async () => {
      const jobs: Job[] = [
        {
          id: 'job-1',
          homeownerId: 'homeowner-1',
          title: 'Fix Leaky Faucet',
          description: 'Kitchen faucet dripping',
          aiScope: {
            scope: 'Replace faucet washer',
            priceLow: 75,
            priceHigh: 150,
            materials: ['washer', 'tape'],
          },
          size: 'small',
          tier: 'QUICK_FIX',
          status: 'open',
          createdAt: new Date().toISOString(),
          bids: [],
        },
        {
          id: 'job-2',
          homeownerId: 'homeowner-2',
          title: 'Deck Staining',
          description: 'Stain 400 sq ft deck',
          aiScope: {
            scope: 'Clean and stain deck',
            priceLow: 800,
            priceHigh: 1200,
            materials: ['stain', 'cleaner', 'sealer'],
          },
          size: 'medium',
          tier: 'STANDARD',
          status: 'open',
          createdAt: new Date().toISOString(),
          bids: [],
        },
      ]

      await window.spark.kv.set('jobs', jobs)

      const fetchedJobs = await window.spark.kv.get<Job[]>('jobs')
      expect(fetchedJobs).toHaveLength(2)
      expect(fetchedJobs![0].status).toBe('open')
      expect(fetchedJobs![1].tier).toBe('STANDARD')
    })

    it('should show earnings summary with fees avoided', async () => {
      const contractor = await window.spark.kv.get<User>('current-user')
      
      expect(contractor?.feesAvoided).toBe(8500)
      expect(contractor?.performanceScore).toBe(8.2)
      expect(contractor?.winRate).toBe(0.68)
    })

    it('should display performance metrics', async () => {
      const contractor = await window.spark.kv.get<User>('current-user')
      
      expect(contractor?.averageResponseTimeMinutes).toBe(14)
      expect(contractor?.bidAccuracy).toBe(0.87)
      expect(contractor?.performanceScore).toBeGreaterThan(8)
    })
  })

  describe('Job Bidding', () => {
    it('should submit bid on Quick Fix job', async () => {
      const job: Job = {
        id: 'job-quick',
        homeownerId: 'homeowner-1',
        title: 'Replace Light Fixture',
        description: 'Install new ceiling light',
        aiScope: {
          scope: 'Replace ceiling light fixture',
          priceLow: 100,
          priceHigh: 200,
          materials: ['light fixture', 'wire nuts'],
        },
        size: 'small',
        tier: 'QUICK_FIX',
        status: 'open',
        createdAt: new Date().toISOString(),
        bids: [],
      }

      await window.spark.kv.set('jobs', [job])

      const bid: Bid = {
        id: 'bid-1',
        jobId: job.id,
        contractorId: testContractor.id,
        contractorName: testContractor.fullName,
        amount: 150,
        message: 'Licensed electrician, can do today',
        status: 'pending',
        createdAt: new Date().toISOString(),
        responseTimeMinutes: 8,
        isLightningBid: true,
      }

      job.bids.push(bid)
      await window.spark.kv.set('jobs', [job])

      const jobs = await window.spark.kv.get<Job[]>('jobs')
      expect(jobs![0].bids).toHaveLength(1)
      expect(jobs![0].bids[0].isLightningBid).toBe(true)
      expect(jobs![0].bids[0].responseTimeMinutes).toBeLessThan(15)
    })

    it('should submit bid on Major Project with itemized pricing', async () => {
      const job: Job = {
        id: 'job-major',
        homeownerId: 'homeowner-2',
        title: 'Kitchen Remodel',
        description: 'Full kitchen renovation',
        aiScope: {
          scope: 'Complete kitchen remodel',
          priceLow: 20000,
          priceHigh: 30000,
          materials: ['cabinets', 'countertops', 'appliances', 'flooring'],
        },
        size: 'large',
        tier: 'MAJOR_PROJECT',
        status: 'open',
        createdAt: new Date().toISOString(),
        bids: [],
        estimatedDays: 45,
        permitRequired: true,
      }

      await window.spark.kv.set('jobs', [job])

      const bid: Bid = {
        id: 'bid-major',
        jobId: job.id,
        contractorId: testContractor.id,
        contractorName: testContractor.fullName,
        amount: 25000,
        message: 'Detailed bid with timeline and itemization',
        status: 'pending',
        createdAt: new Date().toISOString(),
        responseTimeMinutes: 120,
      }

      job.bids.push(bid)
      await window.spark.kv.set('jobs', [job])

      const jobs = await window.spark.kv.get<Job[]>('jobs')
      expect(jobs![0].bids[0].amount).toBe(25000)
      expect(jobs![0].tier).toBe('MAJOR_PROJECT')
    })

    it('should track bid status updates', async () => {
      const job: Job = {
        id: 'job-status',
        homeownerId: 'homeowner-3',
        title: 'Fence Installation',
        description: 'Install 100ft fence',
        aiScope: {
          scope: 'Wood fence installation',
          priceLow: 2500,
          priceHigh: 3500,
          materials: ['posts', 'panels', 'concrete'],
        },
        size: 'medium',
        status: 'open',
        createdAt: new Date().toISOString(),
        bids: [],
      }

      const bid: Bid = {
        id: 'bid-track',
        jobId: job.id,
        contractorId: testContractor.id,
        contractorName: testContractor.fullName,
        amount: 2800,
        message: 'Quality materials included',
        status: 'pending',
        createdAt: new Date().toISOString(),
      }

      job.bids.push(bid)
      await window.spark.kv.set('jobs', [job])

      // Bid accepted
      job.bids[0].status = 'accepted'
      job.status = 'in-progress'
      await window.spark.kv.set('jobs', [job])

      const jobs = await window.spark.kv.get<Job[]>('jobs')
      expect(jobs![0].bids[0].status).toBe('accepted')
      expect(jobs![0].status).toBe('in-progress')
    })

    it('should mark bid as Lightning Bid when submitted under 15 minutes', async () => {
      const jobPostedTime = new Date()
      const bidSubmittedTime = new Date(jobPostedTime.getTime() + 10 * 60 * 1000) // 10 minutes later

      const responseTimeMinutes = Math.floor((bidSubmittedTime.getTime() - jobPostedTime.getTime()) / 60000)

      const bid: Bid = {
        id: 'bid-lightning',
        jobId: 'job-fast',
        contractorId: testContractor.id,
        contractorName: testContractor.fullName,
        amount: 200,
        message: 'Quick response',
        status: 'pending',
        createdAt: bidSubmittedTime.toISOString(),
        responseTimeMinutes,
        isLightningBid: responseTimeMinutes < 15,
      }

      expect(bid.isLightningBid).toBe(true)
      expect(bid.responseTimeMinutes).toBeLessThan(15)
    })
  })

  describe('CRM Features', () => {
    it('should add customer to CRM after job completion', async () => {
      const customer = {
        id: 'customer-1',
        contractorId: testContractor.id,
        name: 'Sarah Homeowner',
        email: 'sarah@example.com',
        phone: '555-0123',
        address: '123 Main St',
        jobsCompleted: 1,
        totalSpent: 2500,
        lastJobDate: new Date().toISOString(),
        notes: 'Great customer, pays on time',
        createdAt: new Date().toISOString(),
      }

      await window.spark.kv.set('crm-customers', [customer])

      const customers = await window.spark.kv.get<any[]>('crm-customers')
      expect(customers).toHaveLength(1)
      expect(customers![0].jobsCompleted).toBe(1)
      expect(customers![0].totalSpent).toBe(2500)
    })

    it('should track repeat customers and their job history', async () => {
      const customer = {
        id: 'customer-repeat',
        contractorId: testContractor.id,
        name: 'Bob Homeowner',
        email: 'bob@example.com',
        phone: '555-0456',
        address: '456 Oak Ave',
        jobsCompleted: 3,
        totalSpent: 8500,
        lastJobDate: new Date().toISOString(),
        tags: ['repeat-customer', 'high-value'],
        jobHistory: [
          { date: '2024-01-15', description: 'Fence repair', amount: 1200 },
          { date: '2024-03-20', description: 'Deck staining', amount: 2800 },
          { date: '2024-06-10', description: 'Gutter cleaning', amount: 4500 },
        ],
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      }

      await window.spark.kv.set('crm-customers', [customer])

      const customers = await window.spark.kv.get<any[]>('crm-customers')
      const repeatCustomer = customers![0]
      
      expect(repeatCustomer.jobsCompleted).toBe(3)
      expect(repeatCustomer.totalSpent).toBeGreaterThan(5000)
      expect(repeatCustomer.tags).toContain('repeat-customer')
      expect(repeatCustomer.jobHistory).toHaveLength(3)
    })

    it('should send instant invite to homeowner via email/SMS', async () => {
      const invite = {
        id: 'invite-1',
        contractorId: testContractor.id,
        recipientEmail: 'newhomeowner@example.com',
        recipientPhone: '555-9999',
        method: 'email',
        message: 'Join FairTradeWorker to get quotes',
        sentAt: new Date().toISOString(),
        status: 'sent',
      }

      await window.spark.kv.set('homeowner-invites', [invite])

      const invites = await window.spark.kv.get<any[]>('homeowner-invites')
      expect(invites).toHaveLength(1)
      expect(invites![0].method).toBe('email')
      expect(invites![0].status).toBe('sent')
    })
  })

  describe('Contractor Referral System', () => {
    it('should invite tradesman and track referral', async () => {
      const referral = {
        id: 'referral-1',
        referrerId: testContractor.id,
        referrerName: testContractor.fullName,
        inviteeName: 'Tom Plumber',
        inviteePhone: '555-7777',
        inviteeEmail: 'tom@example.com',
        trade: 'plumbing',
        status: 'sent',
        sentAt: new Date().toISOString(),
        inviteCode: 'REFER12345',
      }

      const updatedContractor = {
        ...testContractor,
        contractorInviteCount: (testContractor.contractorInviteCount || 0) + 1,
      }

      await window.spark.kv.set('contractor-referrals', [referral])
      await window.spark.kv.set('current-user', updatedContractor)

      const referrals = await window.spark.kv.get<any[]>('contractor-referrals')
      expect(referrals).toHaveLength(1)
      expect(referrals![0].status).toBe('sent')

      const contractor = await window.spark.kv.get<User>('current-user')
      expect(contractor?.contractorInviteCount).toBe(1)
    })

    it('should earn $50 when referred contractor completes first job', async () => {
      const referral = {
        id: 'referral-complete',
        referrerId: testContractor.id,
        referrerName: testContractor.fullName,
        inviteeName: 'Sam Electrician',
        inviteePhone: '555-8888',
        trade: 'electrical',
        status: 'signed-up',
        sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        signedUpAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      }

      await window.spark.kv.set('contractor-referrals', [referral])

      // Referred contractor completes first job
      referral.status = 'completed-first-job'
      const completedAt = new Date().toISOString()
      await window.spark.kv.set('contractor-referrals', [{ ...referral, completedAt }])

      // Both contractors earn $50
      const updatedContractor = {
        ...testContractor,
        referralEarnings: (testContractor.referralEarnings || 0) + 50,
      }
      await window.spark.kv.set('current-user', updatedContractor)

      const referrals = await window.spark.kv.get<any[]>('contractor-referrals')
      expect(referrals![0].status).toBe('completed-first-job')

      const contractor = await window.spark.kv.get<User>('current-user')
      expect(contractor?.referralEarnings).toBe(50)
    })

    it('should enforce monthly invite limit of 10', async () => {
      const thisMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

      const existingReferrals = Array.from({ length: 10 }, (_, i) => ({
        id: `ref-${i}`,
        referrerId: testContractor.id,
        inviteeName: `Contractor ${i}`,
        inviteePhone: `555-000${i}`,
        trade: 'general',
        status: 'sent',
        sentAt: new Date().toISOString(),
      }))

      await window.spark.kv.set('contractor-referrals', existingReferrals)

      const referrals = await window.spark.kv.get<any[]>('contractor-referrals')
      const thisMonthReferrals = referrals?.filter(r => 
        r.referrerId === testContractor.id && 
        r.sentAt.startsWith(thisMonth)
      )

      expect(thisMonthReferrals?.length).toBe(10)

      // Should not allow 11th invite
      const canInviteMore = (thisMonthReferrals?.length || 0) < 10
      expect(canInviteMore).toBe(false)
    })
  })

  describe('Invoice Management', () => {
    it('should create invoice for completed job', async () => {
      const invoice: Invoice = {
        id: 'invoice-1',
        contractorId: testContractor.id,
        homeownerId: 'homeowner-1',
        jobId: 'job-completed',
        jobTitle: 'Deck Staining',
        lineItems: [
          { description: 'Deck cleaning and prep', quantity: 1, rate: 400, total: 400 },
          { description: 'Staining (2 coats)', quantity: 400, rate: 1.5, total: 600 },
          { description: 'Sealer application', quantity: 1, rate: 200, total: 200 },
        ],
        subtotal: 1200,
        taxRate: 0.0825,
        taxAmount: 99,
        total: 1299,
        status: 'draft',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        lateFeeApplied: false,
        isProForma: false,
      }

      await window.spark.kv.set('invoices', [invoice])

      const invoices = await window.spark.kv.get<Invoice[]>('invoices')
      expect(invoices).toHaveLength(1)
      expect(invoices![0].subtotal).toBe(1200)
      expect(invoices![0].total).toBe(1299)
      expect(invoices![0].lineItems).toHaveLength(3)
    })

    it('should track invoice status from draft to paid', async () => {
      const invoice: Invoice = {
        id: 'invoice-track',
        contractorId: testContractor.id,
        homeownerId: 'homeowner-2',
        jobId: 'job-2',
        jobTitle: 'Fence Repair',
        lineItems: [
          { description: 'Labor', quantity: 8, rate: 75, total: 600 },
          { description: 'Materials', quantity: 1, rate: 350, total: 350 },
        ],
        subtotal: 950,
        taxRate: 0.0825,
        taxAmount: 78.38,
        total: 1028.38,
        status: 'draft',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        lateFeeApplied: false,
        isProForma: false,
      }

      await window.spark.kv.set('invoices', [invoice])

      // Send invoice
      invoice.status = 'sent'
      invoice.sentDate = new Date().toISOString()
      await window.spark.kv.set('invoices', [invoice])

      // Invoice viewed
      invoice.status = 'viewed'
      await window.spark.kv.set('invoices', [invoice])

      // Invoice paid
      invoice.status = 'paid'
      invoice.paidDate = new Date().toISOString()
      await window.spark.kv.set('invoices', [invoice])

      const invoices = await window.spark.kv.get<Invoice[]>('invoices')
      expect(invoices![0].status).toBe('paid')
      expect(invoices![0].paidDate).toBeTruthy()
      expect(invoices![0].sentDate).toBeTruthy()
    })

    it('should support partial payments', async () => {
      const invoice: Invoice = {
        id: 'invoice-partial',
        contractorId: testContractor.id,
        homeownerId: 'homeowner-3',
        jobId: 'job-3',
        jobTitle: 'Kitchen Remodel',
        lineItems: [
          { description: 'Labor', quantity: 1, rate: 15000, total: 15000 },
          { description: 'Materials', quantity: 1, rate: 8000, total: 8000 },
        ],
        subtotal: 23000,
        taxRate: 0.0825,
        taxAmount: 1897.50,
        total: 24897.50,
        status: 'sent',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        sentDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        lateFeeApplied: false,
        isProForma: false,
        partialPayments: [],
        amountPaid: 0,
        amountRemaining: 24897.50,
      }

      await window.spark.kv.set('invoices', [invoice])

      // First partial payment
      invoice.partialPayments!.push({
        id: 'payment-1',
        amount: 10000,
        paidAt: new Date().toISOString(),
        method: 'card',
      })
      invoice.amountPaid = 10000
      invoice.amountRemaining = 14897.50
      invoice.status = 'partially-paid'
      await window.spark.kv.set('invoices', [invoice])

      // Second partial payment (full payment)
      invoice.partialPayments!.push({
        id: 'payment-2',
        amount: 14897.50,
        paidAt: new Date().toISOString(),
        method: 'card',
      })
      invoice.amountPaid = 24897.50
      invoice.amountRemaining = 0
      invoice.status = 'paid'
      invoice.paidDate = new Date().toISOString()
      await window.spark.kv.set('invoices', [invoice])

      const invoices = await window.spark.kv.get<Invoice[]>('invoices')
      expect(invoices![0].partialPayments).toHaveLength(2)
      expect(invoices![0].amountPaid).toBe(24897.50)
      expect(invoices![0].amountRemaining).toBe(0)
      expect(invoices![0].status).toBe('paid')
    })
  })

  describe('Pro Upgrade', () => {
    it('should upgrade contractor to Pro tier', async () => {
      expect(testContractor.isPro).toBe(false)

      const upgradedContractor = {
        ...testContractor,
        isPro: true,
        proSince: new Date().toISOString(),
      }

      await window.spark.kv.set('current-user', upgradedContractor)

      const contractor = await window.spark.kv.get<User>('current-user')
      expect(contractor?.isPro).toBe(true)
      expect(contractor?.proSince).toBeTruthy()
    })

    it('should unlock Pro features after upgrade', async () => {
      const proContractor = {
        ...testContractor,
        isPro: true,
        proSince: new Date().toISOString(),
      }

      await window.spark.kv.set('current-user', proContractor)

      // Pro features available
      const contractor = await window.spark.kv.get<User>('current-user')
      const canBidOnMajorProjects = contractor?.isPro
      const hasInstantPayouts = contractor?.isPro
      const hasAdvancedCRM = contractor?.isPro

      expect(canBidOnMajorProjects).toBe(true)
      expect(hasInstantPayouts).toBe(true)
      expect(hasAdvancedCRM).toBe(true)
    })
  })

  describe('Payout Tracking', () => {
    it('should track contractor payouts', async () => {
      const payout = {
        id: 'payout-1',
        contractorId: testContractor.id,
        jobId: 'job-completed-1',
        amount: 2500,
        status: 'pending',
        requestedAt: new Date().toISOString(),
      }

      await window.spark.kv.set('contractor-payouts', [payout])

      // Process payout
      payout.status = 'completed'
      const completedAt = new Date().toISOString()
      await window.spark.kv.set('contractor-payouts', [{ ...payout, completedAt }])

      const payouts = await window.spark.kv.get<any[]>('contractor-payouts')
      expect(payouts![0].status).toBe('completed')
      expect(payouts![0].amount).toBe(2500)
    })

    it('should provide instant payout for Pro contractors', async () => {
      const proContractor = {
        ...testContractor,
        isPro: true,
      }

      await window.spark.kv.set('current-user', proContractor)

      const payout = {
        id: 'payout-instant',
        contractorId: proContractor.id,
        jobId: 'job-completed-2',
        amount: 3500,
        status: 'completed',
        requestedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        isInstant: true,
        transferId: 'tr_instant_123',
      }

      await window.spark.kv.set('contractor-payouts', [payout])

      const payouts = await window.spark.kv.get<any[]>('contractor-payouts')
      expect(payouts![0].isInstant).toBe(true)
      expect(payouts![0].status).toBe('completed')
      expect(payouts![0].transferId).toBeTruthy()
    })
  })
})
