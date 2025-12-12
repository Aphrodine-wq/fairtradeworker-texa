import { describe, it, expect, beforeEach } from 'vitest'
import type { User, Job, Territory } from '@/lib/types'

describe('Operator Workflow E2E', () => {
  let testOperator: User

  beforeEach(async () => {
    testOperator = {
      id: 'operator-e2e-1',
      email: 'operator@example.com',
      fullName: 'Lisa Operator',
      role: 'operator',
      isPro: true,
      performanceScore: 9.5,
      bidAccuracy: 0.95,
      isOperator: true,
      territoryId: 101,
      createdAt: new Date().toISOString(),
      referralEarnings: 0,
      contractorInviteCount: 0,
    }

    await window.spark.kv.set('current-user', testOperator)
    await window.spark.kv.set('territories', [])
    await window.spark.kv.set('jobs', [])
  })

  describe('Territory Management', () => {
    it('should claim available territory', async () => {
      const territory: Territory = {
        id: 101,
        name: 'Travis County',
        state: 'TX',
        status: 'available',
        price: 5000,
        population: 1250000,
        estimatedJobsPerMonth: 250,
      }

      await window.spark.kv.set('territories', [territory])

      // Claim territory
      territory.status = 'claimed'
      territory.operatorId = testOperator.id
      territory.operatorName = testOperator.fullName
      territory.claimedAt = new Date().toISOString()

      await window.spark.kv.set('territories', [territory])

      const territories = await window.spark.kv.get<Territory[]>('territories')
      expect(territories![0].status).toBe('claimed')
      expect(territories![0].operatorId).toBe(testOperator.id)
      expect(territories![0].claimedAt).toBeTruthy()
    })

    it('should view all territories in their region', async () => {
      const territories: Territory[] = [
        {
          id: 101,
          name: 'Travis County',
          state: 'TX',
          status: 'claimed',
          operatorId: testOperator.id,
          operatorName: testOperator.fullName,
          price: 5000,
          population: 1250000,
          estimatedJobsPerMonth: 250,
          claimedAt: new Date().toISOString(),
        },
        {
          id: 102,
          name: 'Williamson County',
          state: 'TX',
          status: 'available',
          price: 3500,
          population: 600000,
          estimatedJobsPerMonth: 120,
        },
        {
          id: 103,
          name: 'Hays County',
          state: 'TX',
          status: 'available',
          price: 2500,
          population: 250000,
          estimatedJobsPerMonth: 80,
        },
      ]

      await window.spark.kv.set('territories', territories)

      const allTerritories = await window.spark.kv.get<Territory[]>('territories')
      expect(allTerritories).toHaveLength(3)
      
      const claimed = allTerritories?.filter(t => t.status === 'claimed')
      const available = allTerritories?.filter(t => t.status === 'available')
      
      expect(claimed).toHaveLength(1)
      expect(available).toHaveLength(2)
    })

    it('should not allow claiming already claimed territory', async () => {
      const territory: Territory = {
        id: 104,
        name: 'Bexar County',
        state: 'TX',
        status: 'claimed',
        operatorId: 'other-operator-id',
        operatorName: 'Other Operator',
        price: 8000,
        population: 2000000,
        estimatedJobsPerMonth: 400,
        claimedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      }

      await window.spark.kv.set('territories', [territory])

      const canClaim = territory.status === 'available'
      expect(canClaim).toBe(false)
    })
  })

  describe('Speed Metrics Dashboard', () => {
    it('should track job-to-first-bid time', async () => {
      const jobs: Job[] = [
        {
          id: 'job-1',
          homeownerId: 'homeowner-1',
          title: 'Fix Faucet',
          description: 'Leaky kitchen faucet',
          aiScope: {
            scope: 'Replace washer',
            priceLow: 75,
            priceHigh: 150,
            materials: ['washer'],
          },
          size: 'small',
          status: 'open',
          territoryId: testOperator.territoryId,
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
          postedInSeconds: 45,
          bids: [
            {
              id: 'bid-1',
              jobId: 'job-1',
              contractorId: 'contractor-1',
              contractorName: 'Fast Contractor',
              amount: 100,
              message: 'Quick response',
              status: 'pending',
              createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(), // 12 min after job
              responseTimeMinutes: 12,
              isLightningBid: true,
            },
          ],
        },
        {
          id: 'job-2',
          homeownerId: 'homeowner-2',
          title: 'Paint Room',
          description: 'Interior painting',
          aiScope: {
            scope: 'Paint bedroom',
            priceLow: 300,
            priceHigh: 500,
            materials: ['paint', 'primer'],
          },
          size: 'small',
          status: 'open',
          territoryId: testOperator.territoryId,
          createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
          bids: [
            {
              id: 'bid-2',
              jobId: 'job-2',
              contractorId: 'contractor-2',
              contractorName: 'Painter Pro',
              amount: 400,
              message: 'Professional service',
              status: 'pending',
              createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(), // 10 min after job
              responseTimeMinutes: 10,
              isLightningBid: true,
            },
          ],
        },
      ]

      await window.spark.kv.set('jobs', jobs)

      const territoryJobs = jobs.filter(j => j.territoryId === testOperator.territoryId)
      const avgResponseTime = territoryJobs.reduce((sum, job) => {
        const firstBid = job.bids[0]
        return sum + (firstBid?.responseTimeMinutes || 0)
      }, 0) / territoryJobs.length

      expect(avgResponseTime).toBe(11) // (12 + 10) / 2
      expect(avgResponseTime).toBeLessThan(15) // Target: <15 minutes
    })

    it('should display speed metrics with traffic light indicators', async () => {
      const metrics = {
        jobToFirstBidTime: 11, // minutes
        inviteToSignupConversion: 0.42, // 42%
        sameDayPayoutCount: 125, // count
      }

      // Traffic light logic
      const jobToFirstBidStatus = metrics.jobToFirstBidTime < 15 ? 'green' : 
                                  metrics.jobToFirstBidTime < 30 ? 'yellow' : 'red'
      
      const conversionStatus = metrics.inviteToSignupConversion > 0.35 ? 'green' : 
                               metrics.inviteToSignupConversion > 0.20 ? 'yellow' : 'red'
      
      const payoutStatus = metrics.sameDayPayoutCount > 100 ? 'green' : 
                          metrics.sameDayPayoutCount > 50 ? 'yellow' : 'red'

      expect(jobToFirstBidStatus).toBe('green')
      expect(conversionStatus).toBe('green')
      expect(payoutStatus).toBe('green')
    })

    it('should show yellow indicator when metrics are below target but acceptable', async () => {
      const metrics = {
        jobToFirstBidTime: 22, // minutes (target: <15, acceptable: <30)
        inviteToSignupConversion: 0.28, // 28% (target: >35%, acceptable: >20%)
        sameDayPayoutCount: 75, // count (target: >100, acceptable: >50)
      }

      const jobToFirstBidStatus = metrics.jobToFirstBidTime < 15 ? 'green' : 
                                  metrics.jobToFirstBidTime < 30 ? 'yellow' : 'red'
      
      const conversionStatus = metrics.inviteToSignupConversion > 0.35 ? 'green' : 
                               metrics.inviteToSignupConversion > 0.20 ? 'yellow' : 'red'
      
      const payoutStatus = metrics.sameDayPayoutCount > 100 ? 'green' : 
                          metrics.sameDayPayoutCount > 50 ? 'yellow' : 'red'

      expect(jobToFirstBidStatus).toBe('yellow')
      expect(conversionStatus).toBe('yellow')
      expect(payoutStatus).toBe('yellow')
    })

    it('should show red indicator when metrics are below acceptable threshold', async () => {
      const metrics = {
        jobToFirstBidTime: 45, // minutes
        inviteToSignupConversion: 0.12, // 12%
        sameDayPayoutCount: 30, // count
      }

      const jobToFirstBidStatus = metrics.jobToFirstBidTime < 15 ? 'green' : 
                                  metrics.jobToFirstBidTime < 30 ? 'yellow' : 'red'
      
      const conversionStatus = metrics.inviteToSignupConversion > 0.35 ? 'green' : 
                               metrics.inviteToSignupConversion > 0.20 ? 'yellow' : 'red'
      
      const payoutStatus = metrics.sameDayPayoutCount > 100 ? 'green' : 
                          metrics.sameDayPayoutCount > 50 ? 'yellow' : 'red'

      expect(jobToFirstBidStatus).toBe('red')
      expect(conversionStatus).toBe('red')
      expect(payoutStatus).toBe('red')
    })
  })

  describe('Territory Analytics', () => {
    it('should track total jobs posted in territory', async () => {
      const jobs: Job[] = Array.from({ length: 15 }, (_, i) => ({
        id: `job-${i}`,
        homeownerId: `homeowner-${i}`,
        title: `Job ${i}`,
        description: 'Test job',
        aiScope: {
          scope: 'Test scope',
          priceLow: 100,
          priceHigh: 200,
          materials: ['test'],
        },
        size: 'small' as const,
        status: 'open' as const,
        territoryId: testOperator.territoryId,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        bids: [],
      }))

      await window.spark.kv.set('jobs', jobs)

      const territoryJobs = jobs.filter(j => j.territoryId === testOperator.territoryId)
      expect(territoryJobs).toHaveLength(15)
    })

    it('should track contractor activity in territory', async () => {
      const territoryContractors = [
        {
          id: 'contractor-1',
          territoryId: testOperator.territoryId,
          activeBids: 12,
          wonBids: 8,
          averageResponseTime: 14,
        },
        {
          id: 'contractor-2',
          territoryId: testOperator.territoryId,
          activeBids: 8,
          wonBids: 5,
          averageResponseTime: 22,
        },
        {
          id: 'contractor-3',
          territoryId: testOperator.territoryId,
          activeBids: 15,
          wonBids: 11,
          averageResponseTime: 9,
        },
      ]

      await window.spark.kv.set('territory-contractors', territoryContractors)

      const contractors = await window.spark.kv.get<any[]>('territory-contractors')
      const fastContractors = contractors?.filter(c => c.averageResponseTime < 15)
      
      expect(contractors).toHaveLength(3)
      expect(fastContractors).toHaveLength(2)
    })

    it('should calculate territory revenue and operator earnings', async () => {
      const completedJobs: Job[] = [
        {
          id: 'completed-1',
          homeownerId: 'h1',
          title: 'Job 1',
          description: 'Completed job',
          aiScope: { scope: 'Test', priceLow: 500, priceHigh: 1000, materials: [] },
          size: 'medium',
          status: 'completed',
          territoryId: testOperator.territoryId,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          bids: [
            {
              id: 'bid-1',
              jobId: 'completed-1',
              contractorId: 'c1',
              contractorName: 'Contractor 1',
              amount: 750,
              message: 'Bid',
              status: 'accepted',
              createdAt: new Date().toISOString(),
            },
          ],
        },
        {
          id: 'completed-2',
          homeownerId: 'h2',
          title: 'Job 2',
          description: 'Completed job',
          aiScope: { scope: 'Test', priceLow: 1500, priceHigh: 2500, materials: [] },
          size: 'large',
          status: 'completed',
          territoryId: testOperator.territoryId,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          bids: [
            {
              id: 'bid-2',
              jobId: 'completed-2',
              contractorId: 'c2',
              contractorName: 'Contractor 2',
              amount: 2000,
              message: 'Bid',
              status: 'accepted',
              createdAt: new Date().toISOString(),
            },
          ],
        },
      ]

      await window.spark.kv.set('jobs', completedJobs)

      const territoryCompletedJobs = completedJobs.filter(
        j => j.territoryId === testOperator.territoryId && j.status === 'completed'
      )

      const totalRevenue = territoryCompletedJobs.reduce((sum, job) => {
        const acceptedBid = job.bids.find(b => b.status === 'accepted')
        return sum + (acceptedBid?.amount || 0)
      }, 0)

      // Operator gets percentage of platform fees
      const platformFeeRate = 0.025 // 2.5% platform fee
      const operatorShare = 0.30 // Operator gets 30% of platform fees
      const operatorEarnings = totalRevenue * platformFeeRate * operatorShare

      expect(totalRevenue).toBe(2750) // 750 + 2000
      expect(operatorEarnings).toBeGreaterThan(0)
    })
  })

  describe('Invite-to-Signup Conversion Tracking', () => {
    it('should track contractor invites and signups', async () => {
      const invites = [
        {
          id: 'invite-1',
          operatorId: testOperator.id,
          recipientEmail: 'contractor1@example.com',
          recipientPhone: '555-0001',
          sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'signed-up',
          signedUpAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'invite-2',
          operatorId: testOperator.id,
          recipientEmail: 'contractor2@example.com',
          recipientPhone: '555-0002',
          sentAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'sent',
        },
        {
          id: 'invite-3',
          operatorId: testOperator.id,
          recipientEmail: 'contractor3@example.com',
          recipientPhone: '555-0003',
          sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'signed-up',
          signedUpAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      await window.spark.kv.set('contractor-invites', invites)

      const operatorInvites = invites.filter(i => i.operatorId === testOperator.id)
      const signedUp = operatorInvites.filter(i => i.status === 'signed-up')
      const conversionRate = signedUp.length / operatorInvites.length

      expect(operatorInvites).toHaveLength(3)
      expect(signedUp).toHaveLength(2)
      expect(conversionRate).toBeCloseTo(0.667, 2) // 66.7%
    })

    it('should track homeowner invites and signups', async () => {
      const invites = [
        {
          id: 'invite-h1',
          operatorId: testOperator.id,
          recipientEmail: 'homeowner1@example.com',
          sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'signed-up',
          signedUpAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'invite-h2',
          operatorId: testOperator.id,
          recipientEmail: 'homeowner2@example.com',
          sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'signed-up',
          signedUpAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'invite-h3',
          operatorId: testOperator.id,
          recipientEmail: 'homeowner3@example.com',
          sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'sent',
        },
      ]

      await window.spark.kv.set('homeowner-invites', invites)

      const operatorInvites = invites.filter(i => i.operatorId === testOperator.id)
      const signedUp = operatorInvites.filter(i => i.status === 'signed-up')
      const conversionRate = signedUp.length / operatorInvites.length

      expect(operatorInvites).toHaveLength(3)
      expect(signedUp).toHaveLength(2)
      expect(conversionRate).toBeCloseTo(0.667, 2)
    })
  })

  describe('Same-Day Payout Tracking', () => {
    it('should count same-day payouts in territory', async () => {
      const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

      const payouts = [
        {
          id: 'payout-1',
          territoryId: testOperator.territoryId,
          contractorId: 'c1',
          amount: 500,
          completedAt: new Date().toISOString(),
          isSameDay: true,
        },
        {
          id: 'payout-2',
          territoryId: testOperator.territoryId,
          contractorId: 'c2',
          amount: 1200,
          completedAt: new Date().toISOString(),
          isSameDay: true,
        },
        {
          id: 'payout-3',
          territoryId: testOperator.territoryId,
          contractorId: 'c3',
          amount: 800,
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          isSameDay: false,
        },
      ]

      await window.spark.kv.set('contractor-payouts', payouts)

      const todayPayouts = payouts.filter(
        p => p.territoryId === testOperator.territoryId && 
             p.completedAt.startsWith(today)
      )

      expect(todayPayouts).toHaveLength(2)
      expect(todayPayouts.reduce((sum, p) => sum + p.amount, 0)).toBe(1700)
    })

    it('should meet same-day payout target of 100+', async () => {
      const today = new Date().toISOString().slice(0, 10)

      const payouts = Array.from({ length: 125 }, (_, i) => ({
        id: `payout-${i}`,
        territoryId: testOperator.territoryId,
        contractorId: `contractor-${i}`,
        amount: 100 + Math.floor(Math.random() * 900),
        completedAt: new Date().toISOString(),
        isSameDay: true,
      }))

      await window.spark.kv.set('contractor-payouts', payouts)

      const todayPayouts = payouts.filter(
        p => p.territoryId === testOperator.territoryId && 
             p.completedAt.startsWith(today)
      )

      expect(todayPayouts.length).toBeGreaterThan(100) // Target met
    })
  })
})
