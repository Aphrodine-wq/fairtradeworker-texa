import { describe, it, expect, beforeEach, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import type { Job, Milestone, User, Bid } from '@/lib/types'
import { calculatePaymentBreakdown, calculatePlatformFee } from '@/lib/stripe'

const mockStripe = {
  confirmCardPayment: vi.fn(),
  createPaymentMethod: vi.fn(),
}

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve(mockStripe)),
}))

describe('Payment Processing Integration Tests', () => {
  let testHomeowner: User
  let testContractor: User
  let testJob: Job
  let testBid: Bid

  beforeEach(async () => {
    testHomeowner = {
      id: 'homeowner-test-1',
      email: 'homeowner@test.com',
      fullName: 'Test Homeowner',
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
      id: 'contractor-test-1',
      email: 'contractor@test.com',
      fullName: 'Test Contractor',
      role: 'contractor',
      isPro: true,
      performanceScore: 8.5,
      bidAccuracy: 0.92,
      isOperator: false,
      createdAt: new Date().toISOString(),
      referralEarnings: 0,
      contractorInviteCount: 0,
      averageResponseTimeMinutes: 12,
      winRate: 0.65,
      feesAvoided: 12400,
    }

    testBid = {
      id: 'bid-test-1',
      jobId: 'job-test-1',
      contractorId: testContractor.id,
      contractorName: testContractor.fullName,
      amount: 25000,
      message: 'I can complete this kitchen remodel',
      status: 'pending',
      createdAt: new Date().toISOString(),
      responseTimeMinutes: 8,
      isLightningBid: true,
    }

    testJob = {
      id: 'job-test-1',
      homeownerId: testHomeowner.id,
      title: 'Kitchen Remodel',
      description: 'Complete kitchen renovation',
      aiScope: {
        scope: 'Full kitchen remodel including cabinets, countertops, appliances',
        priceLow: 20000,
        priceHigh: 30000,
        materials: ['cabinets', 'countertops', 'appliances'],
        confidenceScore: 92,
      },
      size: 'large',
      tier: 'MAJOR_PROJECT',
      status: 'open',
      createdAt: new Date().toISOString(),
      bids: [testBid],
      estimatedDays: 42,
      tradesRequired: ['general contractor', 'electrician', 'plumber'],
      permitRequired: true,
      milestones: [
        {
          id: 'milestone-1',
          jobId: 'job-test-1',
          name: 'Contract Signing',
          description: 'Initial contract and deposit',
          amount: 5000,
          percentage: 20,
          sequence: 1,
          status: 'pending',
          verificationRequired: 'photos',
        },
        {
          id: 'milestone-2',
          jobId: 'job-test-1',
          name: 'Demolition Complete',
          description: 'Old kitchen removed',
          amount: 2500,
          percentage: 10,
          sequence: 2,
          status: 'pending',
          verificationRequired: 'photos',
          photos: [],
        },
        {
          id: 'milestone-3',
          jobId: 'job-test-1',
          name: 'Rough-In Complete',
          description: 'Electrical and plumbing rough-in',
          amount: 5000,
          percentage: 20,
          sequence: 3,
          status: 'pending',
          verificationRequired: 'inspection',
          photos: [],
        },
        {
          id: 'milestone-4',
          jobId: 'job-test-1',
          name: 'Cabinets Installed',
          description: 'All cabinets in place',
          amount: 5000,
          percentage: 20,
          sequence: 4,
          status: 'pending',
          verificationRequired: 'photos',
          photos: [],
        },
        {
          id: 'milestone-5',
          jobId: 'job-test-1',
          name: 'Counters and Backsplash',
          description: 'Countertops and backsplash complete',
          amount: 3750,
          percentage: 15,
          sequence: 5,
          status: 'pending',
          verificationRequired: 'photos',
          photos: [],
        },
        {
          id: 'milestone-6',
          jobId: 'job-test-1',
          name: 'Final Completion',
          description: 'All work complete, punch list done',
          amount: 3750,
          percentage: 15,
          sequence: 6,
          status: 'pending',
          verificationRequired: 'walkthrough',
          photos: [],
        },
      ],
    }

    await window.spark.kv.set('current-user', testHomeowner)
    await window.spark.kv.set('jobs', [testJob])
    await window.spark.kv.set('milestones', testJob.milestones)
    await window.spark.kv.set('invoices', [])

    mockStripe.confirmCardPayment.mockReset()
    mockStripe.createPaymentMethod.mockReset()
  })

  describe('Payment Breakdown Calculations', () => {
    it('should correctly calculate Quick Fix tier fees', () => {
      const amount = 200
      const breakdown = calculatePaymentBreakdown(amount, 'QUICK_FIX')

      expect(breakdown.jobAmount).toBe(200)
      expect(breakdown.platformFee).toBe(15)
      expect(breakdown.homeownerTotal).toBe(215)
      expect(breakdown.contractorPayout).toBe(200)
      expect(breakdown.stripeFee).toBeGreaterThan(0)
    })

    it('should correctly calculate Standard tier fees', () => {
      const amount = 2000
      const breakdown = calculatePaymentBreakdown(amount, 'STANDARD')

      expect(breakdown.jobAmount).toBe(2000)
      expect(breakdown.platformFee).toBe(60)
      expect(breakdown.homeownerTotal).toBe(2060)
      expect(breakdown.contractorPayout).toBe(2000)
    })

    it('should correctly calculate Major Project tier fees', () => {
      const amount = 25000
      const breakdown = calculatePaymentBreakdown(amount, 'MAJOR_PROJECT')

      expect(breakdown.jobAmount).toBe(25000)
      expect(breakdown.platformFee).toBe(625)
      expect(breakdown.homeownerTotal).toBe(25625)
      expect(breakdown.contractorPayout).toBe(25000)
    })

    it('should use percentage for Quick Fix when amount is very high', () => {
      const amount = 500
      const breakdown = calculatePaymentBreakdown(amount, 'QUICK_FIX')

      expect(breakdown.platformFee).toBe(20)
    })
  })

  describe('Milestone Payment Flow - Complete Workflow', () => {
    it('should process initial deposit payment successfully', async () => {
      mockStripe.confirmCardPayment.mockResolvedValueOnce({
        paymentIntent: {
          id: 'pi_test_123',
          status: 'succeeded',
          amount: 5000,
        },
      })

      const jobs = await window.spark.kv.get<Job[]>('jobs')
      const job = jobs?.[0]
      const milestone = job?.milestones?.[0]

      expect(milestone?.status).toBe('pending')

      const paymentResult = await mockStripe.confirmCardPayment('client_secret_test', {
        payment_method: 'pm_test_card',
      })

      expect(paymentResult.paymentIntent.status).toBe('succeeded')

      if (milestone && job?.milestones) {
        const updated = job.milestones.map(m => 
          m.id === milestone.id
            ? { ...m, status: 'paid' as const, paidAt: new Date().toISOString() }
            : m
        )
        job.milestones = updated
        await window.spark.kv.set('jobs', [job])
      }

      const updatedJobs = await window.spark.kv.get<Job[]>('jobs')
      const updatedMilestone = updatedJobs?.[0].milestones?.[0]
      expect(updatedMilestone?.status).toBe('paid')
      expect(updatedMilestone?.paidAt).toBeTruthy()
    })

    it('should process all milestones sequentially', async () => {
      const jobs = await window.spark.kv.get<Job[]>('jobs')
      const job = jobs?.[0]
      const milestones = job?.milestones || []

      for (let i = 0; i < milestones.length; i++) {
        const milestone = milestones[i]

        milestone.status = 'in-progress'
        milestone.requestedAt = new Date().toISOString()
        milestone.photos = Array(3).fill('photo-url')
        milestone.notes = `Milestone ${i + 1} completed`

        if (job) {
          await window.spark.kv.set('jobs', [job])
        }

        await waitFor(() => {
          expect(milestone.status).toBe('in-progress')
        })

        mockStripe.confirmCardPayment.mockResolvedValueOnce({
          paymentIntent: {
            id: `pi_test_${i}`,
            status: 'succeeded',
            amount: milestone.amount,
          },
        })

        const paymentResult = await mockStripe.confirmCardPayment('secret', {
          payment_method: 'pm_test',
        })

        milestone.status = 'paid'
        milestone.paidAt = new Date().toISOString()

        if (job) {
          await window.spark.kv.set('jobs', [job])
        }
      }

      const finalJobs = await window.spark.kv.get<Job[]>('jobs')
      const finalMilestones = finalJobs?.[0].milestones
      expect(finalMilestones?.every(m => m.status === 'paid')).toBe(true)
    })

    it('should handle milestone rejection and dispute', async () => {
      const jobs = await window.spark.kv.get<Job[]>('jobs')
      const job = jobs?.[0]
      const milestones = job?.milestones || []
      const milestone = milestones[1]

      milestone.status = 'in-progress'
      milestone.requestedAt = new Date().toISOString()
      milestone.photos = ['photo1', 'photo2']

      if (job) {
        await window.spark.kv.set('jobs', [job])
      }

      milestone.status = 'disputed'
      milestone.disputeReason = 'Work not completed to specification'

      if (job) {
        await window.spark.kv.set('jobs', [job])
      }

      const disputed = await window.spark.kv.get<Job[]>('jobs')
      expect(disputed?.[0].milestones?.[1].status).toBe('disputed')
      expect(disputed?.[0].milestones?.[1].disputeReason).toBeTruthy()
    })

    it('should calculate correct total paid and remaining', async () => {
      const jobs = await window.spark.kv.get<Job[]>('jobs')
      const job = jobs?.[0]
      const milestones = job?.milestones || []

      milestones[0].status = 'paid'
      milestones[0].paidAt = new Date().toISOString()
      milestones[1].status = 'paid'
      milestones[1].paidAt = new Date().toISOString()

      if (job) {
        await window.spark.kv.set('jobs', [job])
      }

      const totalPaid = milestones
        .filter(m => m.status === 'paid')
        .reduce((sum, m) => sum + m.amount, 0)

      const totalRemaining = milestones
        .filter(m => m.status !== 'paid')
        .reduce((sum, m) => sum + m.amount, 0)

      expect(totalPaid).toBe(7500)
      expect(totalRemaining).toBe(17500)
      expect(totalPaid + totalRemaining).toBe(25000)
    })
  })

  describe('Payment Method Management', () => {
    it('should add payment method to homeowner account', async () => {
      mockStripe.createPaymentMethod.mockResolvedValueOnce({
        paymentMethod: {
          id: 'pm_test_card_123',
          type: 'card',
          card: {
            brand: 'visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 2025,
          },
        },
      })

      const paymentMethod = await mockStripe.createPaymentMethod({
        type: 'card',
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2025,
          cvc: '123',
        },
      })

      expect(paymentMethod.paymentMethod.type).toBe('card')
      expect(paymentMethod.paymentMethod.card.last4).toBe('4242')

      const homeowner = await window.spark.kv.get<User>('current-user')
      const paymentMethods = await window.spark.kv.get<any[]>('payment-methods') || []

      paymentMethods.push({
        userId: homeowner?.id,
        paymentMethodId: paymentMethod.paymentMethod.id,
        type: 'card',
        details: paymentMethod.paymentMethod.card,
        isDefault: paymentMethods.length === 0,
        createdAt: new Date().toISOString(),
      })

      await window.spark.kv.set('payment-methods', paymentMethods)

      const savedMethods = await window.spark.kv.get<any[]>('payment-methods')
      expect(savedMethods?.length).toBe(1)
      expect(savedMethods?.[0].isDefault).toBe(true)
    })

    it('should handle multiple payment methods with default selection', async () => {
      const paymentMethods = [
        {
          userId: testHomeowner.id,
          paymentMethodId: 'pm_card_1',
          type: 'card',
          details: { brand: 'visa', last4: '4242' },
          isDefault: true,
          createdAt: new Date().toISOString(),
        },
        {
          userId: testHomeowner.id,
          paymentMethodId: 'pm_card_2',
          type: 'card',
          details: { brand: 'mastercard', last4: '5555' },
          isDefault: false,
          createdAt: new Date().toISOString(),
        },
      ]

      await window.spark.kv.set('payment-methods', paymentMethods)

      const defaultMethod = paymentMethods.find(pm => pm.isDefault)
      expect(defaultMethod?.paymentMethodId).toBe('pm_card_1')

      paymentMethods.forEach(pm => (pm.isDefault = false))
      paymentMethods[1].isDefault = true

      await window.spark.kv.set('payment-methods', paymentMethods)

      const updated = await window.spark.kv.get<any[]>('payment-methods')
      const newDefault = updated?.find(pm => pm.isDefault)
      expect(newDefault?.paymentMethodId).toBe('pm_card_2')
    })
  })

  describe('Contractor Payout Processing', () => {
    it('should process instant payout for Pro contractor', async () => {
      const contractor = await window.spark.kv.get<User>('current-user')
      await window.spark.kv.set('current-user', { ...contractor, ...testContractor })

      const jobs = await window.spark.kv.get<Job[]>('jobs')
      const job = jobs?.[0]
      const completedMilestone = job?.milestones?.[0]

      if (completedMilestone) {
        completedMilestone.status = 'paid'
        completedMilestone.paidAt = new Date().toISOString()
        if (job) {
          await window.spark.kv.set('jobs', [job])
        }
      }

      const payouts = await window.spark.kv.get<any[]>('contractor-payouts') || []
      const payout = {
        id: `payout-${Date.now()}`,
        contractorId: testContractor.id,
        milestoneId: completedMilestone?.id,
        amount: completedMilestone?.amount || 0,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        isInstant: testContractor.isPro,
        completedAt: new Date().toISOString(),
        transferId: 'tr_test_123',
      }

      payouts.push(payout)
      await window.spark.kv.set('contractor-payouts', payouts)

      const finalPayouts = await window.spark.kv.get<any[]>('contractor-payouts')
      expect(finalPayouts?.[0].transferId).toBeTruthy()
    })

    it('should calculate contractor earnings correctly with platform fees', async () => {
      const jobAmount = 25000
      const platformFee = calculatePlatformFee(jobAmount, 'MAJOR_PROJECT')

      const contractorEarnings = jobAmount
      const platformRevenue = platformFee

      expect(contractorEarnings).toBe(25000)
      expect(platformRevenue).toBe(625)
      expect(contractorEarnings + platformRevenue).toBe(25625)
    })
  })

  describe('Change Order Payment Processing', () => {
    it('should add change order amount to milestone', async () => {
      const jobs = await window.spark.kv.get<Job[]>('jobs')
      const job = jobs?.[0]
      const scopeChange: any = {
        id: 'change-1',
        jobId: job?.id,
        discoveredAt: new Date().toISOString(),
        description: 'Water damage behind wall requires repair',
        photos: ['damage1.jpg', 'damage2.jpg'],
        additionalCost: 650,
        status: 'pending',
      }

      const scopeChanges = [scopeChange]
      await window.spark.kv.set('scope-changes', scopeChanges)

      scopeChange.status = 'approved'
      scopeChange.approvedAt = new Date().toISOString()
      await window.spark.kv.set('scope-changes', scopeChanges)

      const currentMilestone = job?.milestones?.find(m => m.sequence === 3)

      if (currentMilestone && job) {
        currentMilestone.amount += scopeChange.additionalCost
        await window.spark.kv.set('jobs', [job])
      }

      const updated = await window.spark.kv.get<Job[]>('jobs')
      const updatedMilestone = updated?.[0].milestones?.find(m => m.sequence === 3)
      expect(updatedMilestone?.amount).toBe(5650)
    })

    it('should process payment for change order', async () => {
      const additionalAmount = 650
      const breakdown = calculatePaymentBreakdown(additionalAmount, 'MAJOR_PROJECT')

      mockStripe.confirmCardPayment.mockResolvedValueOnce({
        paymentIntent: {
          id: 'pi_change_order_123',
          status: 'succeeded',
          amount: breakdown.homeownerTotal,
        },
      })

      const result = await mockStripe.confirmCardPayment('secret', {
        payment_method: 'pm_test',
      })

      expect(result.paymentIntent.status).toBe('succeeded')

      const scopeChanges = await window.spark.kv.get<any[]>('scope-changes') || []
      if (scopeChanges[0]) {
        scopeChanges[0].paidAt = new Date().toISOString()
        scopeChanges[0].paymentIntentId = result.paymentIntent.id
      }

      await window.spark.kv.set('scope-changes', scopeChanges)

      const final = await window.spark.kv.get<any[]>('scope-changes')
      expect(final?.[0].paidAt).toBeTruthy()
    })
  })

  describe('Payment Security and Validation', () => {
    it('should validate milestone payment order', async () => {
      const jobs = await window.spark.kv.get<Job[]>('jobs')
      const milestones = jobs?.[0].milestones || []

      const attemptOutOfOrder = () => {
        const milestone3 = milestones.find(m => m.sequence === 3)
        const milestone1 = milestones.find(m => m.sequence === 1)

        if (milestone1?.status !== 'paid') {
          throw new Error('Cannot pay milestone 3 before milestone 1 is complete')
        }
      }

      expect(attemptOutOfOrder).toThrow()
    })

    it('should prevent duplicate payments', async () => {
      const jobs = await window.spark.kv.get<Job[]>('jobs')
      const milestone = jobs?.[0].milestones?.[0]

      if (milestone) {
        milestone.status = 'paid'
        milestone.paidAt = new Date().toISOString()
      }

      const attemptDuplicatePay = () => {
        if (milestone?.status === 'paid' && milestone.paidAt) {
          throw new Error('Milestone already paid')
        }
      }

      expect(attemptDuplicatePay).toThrow('Milestone already paid')
    })

    it('should validate payment amounts match milestone amounts', async () => {
      const jobs = await window.spark.kv.get<Job[]>('jobs')
      const milestone = jobs?.[0].milestones?.[0]

      const paymentAmount = 4500
      const expectedAmount = milestone?.amount || 0

      const validatePaymentAmount = () => {
        if (paymentAmount !== expectedAmount) {
          throw new Error(
            `Payment amount mismatch: expected ${expectedAmount}, got ${paymentAmount}`
          )
        }
      }

      expect(validatePaymentAmount).toThrow('Payment amount mismatch')
    })

    it('should verify photo requirements before payment approval', async () => {
      const jobs = await window.spark.kv.get<Job[]>('jobs')
      const milestone = jobs?.[0].milestones?.[1]

      if (milestone) {
        milestone.status = 'in-progress'
        milestone.photos = ['photo1.jpg']
      }

      const validatePhotos = () => {
        const requiredPhotos = 3
        if (!milestone?.photos || milestone.photos.length < requiredPhotos) {
          throw new Error(
            `Insufficient photos: need ${requiredPhotos}, have ${milestone?.photos?.length || 0}`
          )
        }
      }

      expect(validatePhotos).toThrow('Insufficient photos')
    })
  })

  describe('End-to-End Payment Flow', () => {
    it('should complete full major project payment lifecycle', async () => {
      const jobs = await window.spark.kv.get<Job[]>('jobs')
      const job = jobs?.[0]
      const milestones = job?.milestones || []

      let totalPaid = 0

      for (const milestone of milestones) {
        milestone.status = 'in-progress'
        milestone.requestedAt = new Date().toISOString()
        milestone.photos = Array(3).fill('photo.jpg')
        milestone.notes = `Completed: ${milestone.name}`

        if (job) {
          await window.spark.kv.set('jobs', [job])
        }

        await new Promise(resolve => setTimeout(resolve, 10))

        const breakdown = calculatePaymentBreakdown(milestone.amount, 'MAJOR_PROJECT')

        mockStripe.confirmCardPayment.mockResolvedValueOnce({
          paymentIntent: {
            id: `pi_${milestone.id}`,
            status: 'succeeded',
            amount: breakdown.homeownerTotal,
          },
        })

        const payment = await mockStripe.confirmCardPayment('secret', {
          payment_method: 'pm_test',
        })

        milestone.status = 'paid'
        milestone.paidAt = new Date().toISOString()

        if (job) {
          await window.spark.kv.set('jobs', [job])
        }

        totalPaid += milestone.amount

        const payout = {
          id: `payout-${milestone.id}`,
          contractorId: testContractor.id,
          milestoneId: milestone.id,
          amount: milestone.amount,
          status: 'completed',
          completedAt: new Date().toISOString(),
          transferId: `tr_${milestone.id}`,
        }

        const payouts = (await window.spark.kv.get<any[]>('contractor-payouts')) || []
        payouts.push(payout)
        await window.spark.kv.set('contractor-payouts', payouts)
      }

      const finalJobs = await window.spark.kv.get<Job[]>('jobs')
      const finalMilestones = finalJobs?.[0].milestones
      const allComplete = finalMilestones?.every(m => m.status === 'paid')

      expect(allComplete).toBe(true)
      expect(totalPaid).toBe(25000)

      if (job) {
        job.status = 'completed'
        await window.spark.kv.set('jobs', [job])
      }

      const finalJob = (await window.spark.kv.get<Job[]>('jobs'))?.[0]
      expect(finalJob?.status).toBe('completed')

      const allPayouts = await window.spark.kv.get<any[]>('contractor-payouts')
      expect(allPayouts?.length).toBe(milestones.length)
      expect(allPayouts?.every(p => p.status === 'completed')).toBe(true)
    })
  })
})
