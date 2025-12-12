import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { User, Job, Milestone, TradeContractor } from '@/lib/types'

describe('Major Project Workflow E2E', () => {
  let testHomeowner: User
  let testContractor: User

  beforeEach(async () => {
    vi.clearAllMocks()

    testHomeowner = {
      id: 'h-major-1',
      email: 'homeowner@example.com',
      fullName: 'Major Homeowner',
      role: 'homeowner',
      isPro: false,
      performanceScore: 0,
      bidAccuracy: 0,
      isOperator: false,
      createdAt: new Date().toISOString(),
      referralEarnings: 0,
      contractorInviteCount: 0,
    }

    testContractor = {
      id: 'c-major-1',
      email: 'contractor@example.com',
      fullName: 'Major Contractor',
      role: 'contractor',
      isPro: true,
      performanceScore: 8.8,
      bidAccuracy: 0.91,
      isOperator: false,
      createdAt: new Date().toISOString(),
      referralEarnings: 0,
      contractorInviteCount: 0,
      averageResponseTimeMinutes: 15,
      winRate: 0.72,
      feesAvoided: 25000,
      proSince: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    }

    await window.spark.kv.set('current-user', testHomeowner)
    await window.spark.kv.set('jobs', [])
  })

  describe('Job Posting Flow', () => {
    it('should create major project with comprehensive scope', async () => {
      const majorProject: Job = {
        id: 'major-job-1',
        homeownerId: testHomeowner.id,
        title: 'Complete Kitchen Remodel',
        description: 'Full kitchen renovation including cabinets, countertops, appliances, flooring, and electrical work',
        aiScope: {
          scope: 'Complete kitchen renovation with new cabinets, quartz countertops, stainless appliances, tile flooring, updated electrical, and plumbing modifications',
          priceLow: 25000,
          priceHigh: 35000,
          materials: ['cabinets', 'countertops', 'appliances', 'tile', 'electrical fixtures', 'plumbing fixtures'],
          confidenceScore: 87,
        },
        size: 'large',
        tier: 'MAJOR_PROJECT',
        status: 'open',
        createdAt: new Date().toISOString(),
        bids: [],
        estimatedDays: 60,
        tradesRequired: ['general contractor', 'electrician', 'plumber', 'tile installer'],
        permitRequired: true,
        multiTrade: true,
      }

      await window.spark.kv.set('jobs', [majorProject])

      const jobs = await window.spark.kv.get<Job[]>('jobs')
      expect(jobs).toHaveLength(1)
      expect(jobs![0].tier).toBe('MAJOR_PROJECT')
      expect(jobs![0].multiTrade).toBe(true)
      expect(jobs![0].permitRequired).toBe(true)
      expect(jobs![0].tradesRequired).toHaveLength(4)
    })

    it('should set up milestone payment structure', async () => {
      const milestones: Milestone[] = [
        {
          id: 'ms-1',
          jobId: 'major-job-1',
          name: 'Contract & Deposit',
          description: 'Initial contract signing and deposit payment',
          amount: 7500,
          percentage: 25,
          sequence: 1,
          status: 'pending',
          verificationRequired: 'photos',
        },
        {
          id: 'ms-2',
          jobId: 'major-job-1',
          name: 'Demolition Complete',
          description: 'Old kitchen completely removed and disposed',
          amount: 3000,
          percentage: 10,
          sequence: 2,
          status: 'pending',
          verificationRequired: 'photos',
        },
        {
          id: 'ms-3',
          jobId: 'major-job-1',
          name: 'Rough-In Complete',
          description: 'All electrical and plumbing rough-in completed and inspected',
          amount: 6000,
          percentage: 20,
          sequence: 3,
          status: 'pending',
          verificationRequired: 'inspection',
        },
        {
          id: 'ms-4',
          jobId: 'major-job-1',
          name: 'Cabinets & Countertops',
          description: 'Cabinets and countertops installed',
          amount: 7500,
          percentage: 25,
          sequence: 4,
          status: 'pending',
          verificationRequired: 'photos',
        },
        {
          id: 'ms-5',
          jobId: 'major-job-1',
          name: 'Final Completion',
          description: 'All work complete, final walkthrough',
          amount: 6000,
          percentage: 20,
          sequence: 5,
          status: 'pending',
          verificationRequired: 'walkthrough',
        },
      ]

      await window.spark.kv.set('milestones', milestones)

      const savedMilestones = await window.spark.kv.get<Milestone[]>('milestones')
      expect(savedMilestones).toHaveLength(5)
      
      const totalPercentage = savedMilestones!.reduce((sum, m) => sum + m.percentage, 0)
      expect(totalPercentage).toBe(100)
      
      const totalAmount = savedMilestones!.reduce((sum, m) => sum + m.amount, 0)
      expect(totalAmount).toBe(30000)
    })

    it('should require detailed project information', async () => {
      const detailedProject: Job = {
        id: 'detailed-project',
        homeownerId: testHomeowner.id,
        title: 'Master Bathroom Renovation',
        description: 'Complete master bathroom remodel',
        aiScope: {
          scope: 'Full bathroom renovation with walk-in shower, double vanity, tile work',
          priceLow: 18000,
          priceHigh: 25000,
          materials: ['tile', 'vanity', 'shower system', 'fixtures'],
        },
        size: 'large',
        tier: 'MAJOR_PROJECT',
        status: 'open',
        createdAt: new Date().toISOString(),
        bids: [],
        estimatedDays: 35,
        tradesRequired: ['general contractor', 'plumber', 'tile installer'],
        permitRequired: true,
        beforePhotos: ['before1.jpg', 'before2.jpg', 'before3.jpg'],
        preferredStartDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        depositPercentage: 25,
      }

      await window.spark.kv.set('jobs', [detailedProject])

      const jobs = await window.spark.kv.get<Job[]>('jobs')
      expect(jobs![0].beforePhotos).toHaveLength(3)
      expect(jobs![0].preferredStartDate).toBeTruthy()
      expect(jobs![0].depositPercentage).toBe(25)
    })
  })

  describe('Bidding Flow', () => {
    it('should allow itemized bids for major projects', async () => {
      const job: Job = {
        id: 'bid-itemized',
        homeownerId: testHomeowner.id,
        title: 'Deck Construction',
        description: 'Build 500 sq ft composite deck',
        aiScope: {
          scope: 'Build composite deck with railing',
          priceLow: 15000,
          priceHigh: 20000,
          materials: ['composite decking', 'posts', 'railing', 'hardware'],
        },
        size: 'large',
        tier: 'MAJOR_PROJECT',
        status: 'open',
        createdAt: new Date().toISOString(),
        bids: [],
        estimatedDays: 21,
        permitRequired: true,
      }

      const itemizedBid = {
        id: 'bid-itemized-1',
        jobId: job.id,
        contractorId: testContractor.id,
        contractorName: testContractor.fullName,
        amount: 18000,
        message: 'Detailed itemized bid attached',
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        lineItems: [
          { description: 'Labor - Foundation & Framing', amount: 5000 },
          { description: 'Labor - Decking Installation', amount: 4000 },
          { description: 'Labor - Railing Installation', amount: 2000 },
          { description: 'Materials - Composite Decking', amount: 4500 },
          { description: 'Materials - Posts & Railing', amount: 1800 },
          { description: 'Materials - Hardware & Fasteners', amount: 700 },
        ],
      }

      job.bids.push(itemizedBid)
      await window.spark.kv.set('jobs', [job])

      const jobs = await window.spark.kv.get<Job[]>('jobs')
      const bid = jobs![0].bids[0]
      
      expect(bid.lineItems).toBeDefined()
      expect(bid.lineItems).toHaveLength(6)
      
      const totalLineItems = bid.lineItems!.reduce((sum: number, item: any) => sum + item.amount, 0)
      expect(totalLineItems).toBe(bid.amount)
    })

    it('should require Project Pro tier for $5K+ jobs', async () => {
      const largeBid = {
        jobAmount: 25000,
        tierRequired: 'MAJOR_PROJECT' as const,
        requiresPro: true,
      }

      // Non-pro contractor attempts to bid
      const nonProContractor = { ...testContractor, isPro: false }
      const canBid = nonProContractor.isPro || largeBid.jobAmount < 5000

      expect(canBid).toBe(false)

      // Pro contractor can bid
      const proContractor = { ...testContractor, isPro: true }
      const canProBid = proContractor.isPro || largeBid.jobAmount < 5000

      expect(canProBid).toBe(true)
    })
  })

  describe('Milestone Management', () => {
    it('should track milestone completion and payments', async () => {
      const job: Job = {
        id: 'milestone-track',
        homeownerId: testHomeowner.id,
        title: 'Whole House Paint',
        description: 'Interior and exterior painting',
        aiScope: {
          scope: 'Complete house painting',
          priceLow: 8000,
          priceHigh: 12000,
          materials: ['paint', 'primer', 'supplies'],
        },
        size: 'large',
        tier: 'MAJOR_PROJECT',
        status: 'in-progress',
        createdAt: new Date().toISOString(),
        bids: [],
        milestones: [
          {
            id: 'paint-ms-1',
            jobId: 'milestone-track',
            name: 'Prep Work',
            description: 'Surface prep and priming',
            amount: 3000,
            percentage: 30,
            sequence: 1,
            status: 'pending',
            verificationRequired: 'photos',
          },
          {
            id: 'paint-ms-2',
            jobId: 'milestone-track',
            name: 'Interior Painting',
            description: 'All interior rooms painted',
            amount: 4000,
            percentage: 40,
            sequence: 2,
            status: 'pending',
            verificationRequired: 'photos',
          },
          {
            id: 'paint-ms-3',
            jobId: 'milestone-track',
            name: 'Exterior Painting',
            description: 'Exterior completed',
            amount: 3000,
            percentage: 30,
            sequence: 3,
            status: 'pending',
            verificationRequired: 'walkthrough',
          },
        ],
      }

      await window.spark.kv.set('jobs', [job])

      // Complete first milestone
      job.milestones![0].status = 'in-progress'
      job.milestones![0].photos = ['prep1.jpg', 'prep2.jpg', 'prep3.jpg']
      job.milestones![0].requestedAt = new Date().toISOString()
      await window.spark.kv.set('jobs', [job])

      job.milestones![0].status = 'paid'
      job.milestones![0].paidAt = new Date().toISOString()
      await window.spark.kv.set('jobs', [job])

      const jobs = await window.spark.kv.get<Job[]>('jobs')
      expect(jobs![0].milestones![0].status).toBe('paid')
      expect(jobs![0].milestones![0].photos).toHaveLength(3)
      
      const paidMilestones = jobs![0].milestones!.filter(m => m.status === 'paid')
      expect(paidMilestones).toHaveLength(1)
    })

    it('should handle milestone disputes', async () => {
      const milestone: Milestone = {
        id: 'dispute-ms',
        jobId: 'job-dispute',
        name: 'Tile Installation',
        description: 'Bathroom tile work',
        amount: 4500,
        percentage: 50,
        sequence: 1,
        status: 'in-progress',
        verificationRequired: 'photos',
        photos: ['tile1.jpg', 'tile2.jpg'],
        requestedAt: new Date().toISOString(),
      }

      await window.spark.kv.set('milestones', [milestone])

      // Homeowner disputes the work
      milestone.status = 'disputed'
      milestone.disputeReason = 'Tiles not installed level, multiple cracks visible'
      await window.spark.kv.set('milestones', [milestone])

      const milestones = await window.spark.kv.get<Milestone[]>('milestones')
      expect(milestones![0].status).toBe('disputed')
      expect(milestones![0].disputeReason).toBeTruthy()
    })

    it('should track milestone dependencies', async () => {
      const milestones: Milestone[] = [
        {
          id: 'dep-ms-1',
          jobId: 'dep-job',
          name: 'Foundation',
          description: 'Foundation work',
          amount: 5000,
          percentage: 25,
          sequence: 1,
          status: 'paid',
          verificationRequired: 'inspection',
          paidAt: new Date().toISOString(),
        },
        {
          id: 'dep-ms-2',
          jobId: 'dep-job',
          name: 'Framing',
          description: 'Frame structure',
          amount: 6000,
          percentage: 30,
          sequence: 2,
          status: 'in-progress',
          verificationRequired: 'inspection',
          dependencies: ['dep-ms-1'],
        },
        {
          id: 'dep-ms-3',
          jobId: 'dep-job',
          name: 'Roofing',
          description: 'Install roof',
          amount: 9000,
          percentage: 45,
          sequence: 3,
          status: 'pending',
          verificationRequired: 'photos',
          dependencies: ['dep-ms-2'],
        },
      ]

      await window.spark.kv.set('milestones', milestones)

      // Check if milestone 3 can start (depends on milestone 2)
      const milestone3 = milestones[2]
      const milestone2 = milestones[1]
      
      const canStartMilestone3 = milestone2.status === 'paid' || milestone2.status === 'completed'
      expect(canStartMilestone3).toBe(false) // Milestone 2 is still in-progress
    })
  })

  describe('Progress Tracking', () => {
    it('should document progress with photos', async () => {
      const milestone: Milestone = {
        id: 'photo-ms',
        jobId: 'photo-job',
        name: 'Cabinet Installation',
        description: 'Install all cabinets',
        amount: 8000,
        percentage: 40,
        sequence: 2,
        status: 'in-progress',
        verificationRequired: 'photos',
        requestedAt: new Date().toISOString(),
        photos: [],
      }

      await window.spark.kv.set('milestones', [milestone])

      // Add progress photos
      milestone.photos = [
        'cabinet-progress-1.jpg',
        'cabinet-progress-2.jpg',
        'cabinet-progress-3.jpg',
        'cabinet-progress-4.jpg',
        'cabinet-progress-5.jpg',
      ]
      milestone.notes = 'All upper cabinets installed. Working on lower cabinets and island.'

      await window.spark.kv.set('milestones', [milestone])

      const milestones = await window.spark.kv.get<Milestone[]>('milestones')
      expect(milestones![0].photos).toHaveLength(5)
      expect(milestones![0].notes).toBeTruthy()
    })

    it('should track multiple trades working simultaneously', async () => {
      const tradeContractors: TradeContractor[] = [
        {
          id: 'trade-1',
          jobId: 'multi-trade-job',
          contractorId: 'general-1',
          contractorName: 'General Contractor',
          trade: 'general contractor',
          role: 'lead',
          status: 'active',
          assignedMilestones: ['ms-1', 'ms-5'],
          totalAmount: 15000,
          amountPaid: 5000,
          contactPhone: '555-0001',
          contactEmail: 'general@example.com',
          invitedAt: new Date().toISOString(),
          acceptedAt: new Date().toISOString(),
        },
        {
          id: 'trade-2',
          jobId: 'multi-trade-job',
          contractorId: 'electrician-1',
          contractorName: 'Electrician Pro',
          trade: 'electrician',
          role: 'sub',
          status: 'active',
          assignedMilestones: ['ms-3'],
          totalAmount: 5000,
          amountPaid: 2500,
          contactPhone: '555-0002',
          contactEmail: 'electric@example.com',
          invitedAt: new Date().toISOString(),
          acceptedAt: new Date().toISOString(),
        },
        {
          id: 'trade-3',
          jobId: 'multi-trade-job',
          contractorId: 'plumber-1',
          contractorName: 'Plumbing Expert',
          trade: 'plumber',
          role: 'sub',
          status: 'active',
          assignedMilestones: ['ms-3'],
          totalAmount: 4500,
          amountPaid: 2000,
          contactPhone: '555-0003',
          contactEmail: 'plumber@example.com',
          invitedAt: new Date().toISOString(),
          acceptedAt: new Date().toISOString(),
        },
      ]

      await window.spark.kv.set('trade-contractors', tradeContractors)

      const trades = await window.spark.kv.get<TradeContractor[]>('trade-contractors')
      expect(trades).toHaveLength(3)
      
      const activeTrades = trades?.filter(t => t.status === 'active')
      expect(activeTrades).toHaveLength(3)
      
      const leadContractor = trades?.find(t => t.role === 'lead')
      expect(leadContractor?.trade).toBe('general contractor')
    })

    it('should calculate project completion percentage', async () => {
      const milestones: Milestone[] = [
        { id: '1', jobId: 'calc-job', name: 'M1', description: 'M1', amount: 3000, percentage: 20, sequence: 1, status: 'paid', verificationRequired: 'photos', paidAt: new Date().toISOString() },
        { id: '2', jobId: 'calc-job', name: 'M2', description: 'M2', amount: 4500, percentage: 30, sequence: 2, status: 'paid', verificationRequired: 'photos', paidAt: new Date().toISOString() },
        { id: '3', jobId: 'calc-job', name: 'M3', description: 'M3', amount: 3000, percentage: 20, sequence: 3, status: 'in-progress', verificationRequired: 'photos' },
        { id: '4', jobId: 'calc-job', name: 'M4', description: 'M4', amount: 4500, percentage: 30, sequence: 4, status: 'pending', verificationRequired: 'photos' },
      ]

      await window.spark.kv.set('milestones', milestones)

      const completedPercentage = milestones
        .filter(m => m.status === 'paid')
        .reduce((sum, m) => sum + m.percentage, 0)

      expect(completedPercentage).toBe(50) // 20% + 30%
    })
  })

  describe('Expense Tracking', () => {
    it('should track expenses for each milestone', async () => {
      const milestone: Milestone = {
        id: 'expense-ms',
        jobId: 'expense-job',
        name: 'Foundation Work',
        description: 'Pour foundation',
        amount: 8000,
        percentage: 40,
        sequence: 1,
        status: 'in-progress',
        verificationRequired: 'inspection',
        expenses: [
          {
            id: 'exp-1',
            milestoneId: 'expense-ms',
            category: 'materials',
            description: 'Concrete - 15 yards',
            amount: 2400,
            quantity: 15,
            unitCost: 160,
            vendor: 'ABC Concrete',
            receiptPhoto: 'receipt-concrete.jpg',
            date: new Date().toISOString(),
            paidBy: 'contractor',
          },
          {
            id: 'exp-2',
            milestoneId: 'expense-ms',
            category: 'labor',
            description: 'Foundation crew - 3 days',
            amount: 3600,
            quantity: 3,
            unitCost: 1200,
            date: new Date().toISOString(),
            paidBy: 'contractor',
          },
          {
            id: 'exp-3',
            milestoneId: 'expense-ms',
            category: 'equipment',
            description: 'Concrete pump rental',
            amount: 450,
            quantity: 1,
            unitCost: 450,
            vendor: 'Equipment Rentals Inc',
            date: new Date().toISOString(),
            paidBy: 'contractor',
          },
        ],
      }

      await window.spark.kv.set('milestones', [milestone])

      const milestones = await window.spark.kv.get<Milestone[]>('milestones')
      const totalExpenses = milestones![0].expenses!.reduce((sum, e) => sum + e.amount, 0)
      
      expect(milestones![0].expenses).toHaveLength(3)
      expect(totalExpenses).toBe(6450)
    })
  })
})
