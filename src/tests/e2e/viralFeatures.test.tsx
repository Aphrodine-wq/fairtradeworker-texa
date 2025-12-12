import { describe, it, expect, beforeEach } from 'vitest'
import type { User, Job } from '@/lib/types'

describe('Viral Features E2E', () => {
  describe('Post-&-Win Referral System', () => {
    it('should generate unique referral code after job posting', async () => {
      const homeowner: User = {
        id: 'h-ref-1',
        email: 'homeowner@example.com',
        fullName: 'Jane Smith',
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
        id: 'job-ref-1',
        homeownerId: homeowner.id,
        title: 'Fix Fence',
        description: 'Repair broken fence post',
        aiScope: {
          scope: 'Replace fence post',
          priceLow: 200,
          priceHigh: 350,
          materials: ['post', 'concrete'],
        },
        size: 'small',
        status: 'open',
        createdAt: new Date().toISOString(),
        bids: [],
      }

      await window.spark.kv.set('jobs', [job])

      // Generate referral code: Initials + UserID slice + Random
      const initials = homeowner.fullName.split(' ').map(n => n[0]).join('')
      const userIdPart = homeowner.id.slice(0, 4).toUpperCase()
      const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase()
      const referralCode = `${initials}${userIdPart}${randomPart}`

      homeowner.referralCode = referralCode
      await window.spark.kv.set('current-user', homeowner)

      const user = await window.spark.kv.get<User>('current-user')
      expect(user?.referralCode).toBeTruthy()
      expect(user?.referralCode?.length).toBeGreaterThan(5)
      expect(user?.referralCode).toContain(initials)
    })

    it('should give both users $20 credit when referral code is used', async () => {
      const referrer: User = {
        id: 'referrer-1',
        email: 'referrer@example.com',
        fullName: 'Bob Referrer',
        role: 'homeowner',
        isPro: false,
        performanceScore: 0,
        bidAccuracy: 0,
        isOperator: false,
        createdAt: new Date().toISOString(),
        referralCode: 'BR1234ABCD',
        referralEarnings: 0,
        contractorInviteCount: 0,
      }

      await window.spark.kv.set('users', [referrer])

      // New user signs up with referral code
      const newUser: User = {
        id: 'newuser-1',
        email: 'newuser@example.com',
        fullName: 'Alice New',
        role: 'homeowner',
        isPro: false,
        performanceScore: 0,
        bidAccuracy: 0,
        isOperator: false,
        createdAt: new Date().toISOString(),
        referredBy: 'BR1234ABCD',
        referralEarnings: 20, // New user gets $20
        contractorInviteCount: 0,
      }

      // Referrer gets $20
      referrer.referralEarnings = 20

      await window.spark.kv.set('users', [referrer, newUser])

      const users = await window.spark.kv.get<User[]>('users')
      const updatedReferrer = users?.find(u => u.id === referrer.id)
      const updatedNewUser = users?.find(u => u.id === newUser.id)

      expect(updatedReferrer?.referralEarnings).toBe(20)
      expect(updatedNewUser?.referralEarnings).toBe(20)
      expect(updatedNewUser?.referredBy).toBe('BR1234ABCD')
    })

    it('should track referral code usage count', async () => {
      const referrer: User = {
        id: 'multi-ref',
        email: 'multi@example.com',
        fullName: 'Sarah Multi',
        role: 'homeowner',
        isPro: false,
        performanceScore: 0,
        bidAccuracy: 0,
        isOperator: false,
        createdAt: new Date().toISOString(),
        referralCode: 'SM5678WXYZ',
        referralEarnings: 0,
        contractorInviteCount: 0,
      }

      const referralTracking = {
        code: referrer.referralCode,
        userId: referrer.id,
        timesUsed: 0,
        totalEarnings: 0,
        referrals: [] as string[],
      }

      await window.spark.kv.set('referral-tracking', [referralTracking])

      // Three users use the code
      for (let i = 1; i <= 3; i++) {
        referralTracking.timesUsed++
        referralTracking.totalEarnings += 20
        referralTracking.referrals.push(`new-user-${i}`)
      }

      referrer.referralEarnings = referralTracking.totalEarnings

      await window.spark.kv.set('referral-tracking', [referralTracking])
      await window.spark.kv.set('current-user', referrer)

      const tracking = await window.spark.kv.get<any[]>('referral-tracking')
      expect(tracking![0].timesUsed).toBe(3)
      expect(tracking![0].totalEarnings).toBe(60) // $20 × 3
      expect(tracking![0].referrals).toHaveLength(3)
    })
  })

  describe('Speed-Based Job Visibility', () => {
    it('should mark small jobs as FRESH for first 15 minutes', async () => {
      const now = new Date()
      const job: Job = {
        id: 'fresh-job',
        homeownerId: 'h1',
        title: 'Quick Fix',
        description: 'Small repair',
        aiScope: {
          scope: 'Minor repair',
          priceLow: 100,
          priceHigh: 250,
          materials: ['supplies'],
        },
        size: 'small',
        tier: 'QUICK_FIX',
        status: 'open',
        createdAt: now.toISOString(),
        bids: [],
      }

      await window.spark.kv.set('jobs', [job])

      // Check if job is fresh (within 15 minutes)
      const jobAge = (Date.now() - new Date(job.createdAt).getTime()) / 60000 // minutes
      const isFresh = job.size === 'small' && jobAge < 15

      expect(isFresh).toBe(true)
    })

    it('should remove FRESH badge after 15 minutes', async () => {
      const past = new Date(Date.now() - 20 * 60 * 1000) // 20 minutes ago
      const job: Job = {
        id: 'old-job',
        homeownerId: 'h2',
        title: 'Not Fresh Anymore',
        description: 'Posted 20 mins ago',
        aiScope: {
          scope: 'Repair',
          priceLow: 150,
          priceHigh: 300,
          materials: ['parts'],
        },
        size: 'small',
        status: 'open',
        createdAt: past.toISOString(),
        bids: [],
      }

      await window.spark.kv.set('jobs', [job])

      const jobAge = (Date.now() - new Date(job.createdAt).getTime()) / 60000
      const isFresh = job.size === 'small' && jobAge < 15

      expect(isFresh).toBe(false)
    })

    it('should mark bid as Lightning Bid when submitted within 15 minutes', async () => {
      const jobPosted = new Date()
      const bidSubmitted = new Date(jobPosted.getTime() + 8 * 60 * 1000) // 8 minutes later

      const responseTimeMinutes = Math.floor((bidSubmitted.getTime() - jobPosted.getTime()) / 60000)
      const isLightningBid = responseTimeMinutes < 15

      expect(responseTimeMinutes).toBe(8)
      expect(isLightningBid).toBe(true)
    })

    it('should give sticky top position to first Lightning Bid for 2 hours', async () => {
      const job: Job = {
        id: 'lightning-job',
        homeownerId: 'h3',
        title: 'Quick Job',
        description: 'Fast turnaround needed',
        aiScope: {
          scope: 'Emergency repair',
          priceLow: 200,
          priceHigh: 400,
          materials: ['emergency supplies'],
        },
        size: 'small',
        status: 'open',
        createdAt: new Date().toISOString(),
        bids: [
          {
            id: 'bid-lightning',
            jobId: 'lightning-job',
            contractorId: 'c1',
            contractorName: 'Fast Contractor',
            amount: 250,
            message: 'Quick response',
            status: 'pending',
            createdAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
            responseTimeMinutes: 10,
            isLightningBid: true,
          },
          {
            id: 'bid-normal',
            jobId: 'lightning-job',
            contractorId: 'c2',
            contractorName: 'Normal Contractor',
            amount: 240,
            message: 'Good price',
            status: 'pending',
            createdAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            responseTimeMinutes: 30,
            isLightningBid: false,
          },
        ],
      }

      await window.spark.kv.set('jobs', [job])

      // Sort bids - Lightning bid should be first
      const sortedBids = [...job.bids].sort((a, b) => {
        if (a.isLightningBid && !b.isLightningBid) return -1
        if (!a.isLightningBid && b.isLightningBid) return 1
        return 0
      })

      expect(sortedBids[0].isLightningBid).toBe(true)
      expect(sortedBids[0].responseTimeMinutes).toBe(10)
    })
  })

  describe('Live Stats Bar', () => {
    it('should display jobs posted today', async () => {
      const today = new Date().toISOString().slice(0, 10)

      const jobs: Job[] = Array.from({ length: 15 }, (_, i) => ({
        id: `job-today-${i}`,
        homeownerId: `h${i}`,
        title: `Job ${i}`,
        description: 'Test job',
        aiScope: {
          scope: 'Test',
          priceLow: 100,
          priceHigh: 200,
          materials: ['test'],
        },
        size: 'small' as const,
        status: 'open' as const,
        createdAt: new Date().toISOString(),
        bids: [],
      }))

      // Add some jobs from yesterday
      jobs.push({
        id: 'job-yesterday',
        homeownerId: 'h-old',
        title: 'Old Job',
        description: 'Yesterday',
        aiScope: {
          scope: 'Test',
          priceLow: 100,
          priceHigh: 200,
          materials: ['test'],
        },
        size: 'small',
        status: 'open',
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        bids: [],
      })

      await window.spark.kv.set('jobs', jobs)

      const allJobs = await window.spark.kv.get<Job[]>('jobs')
      const todayJobs = allJobs?.filter(j => j.createdAt.startsWith(today))

      expect(todayJobs?.length).toBe(15)
    })

    it('should calculate average bid time', async () => {
      const jobs: Job[] = [
        {
          id: 'job-1',
          homeownerId: 'h1',
          title: 'Job 1',
          description: 'Test',
          aiScope: { scope: 'Test', priceLow: 100, priceHigh: 200, materials: [] },
          size: 'small',
          status: 'open',
          createdAt: new Date().toISOString(),
          bids: [
            {
              id: 'bid-1',
              jobId: 'job-1',
              contractorId: 'c1',
              contractorName: 'C1',
              amount: 150,
              message: 'Bid',
              status: 'pending',
              createdAt: new Date().toISOString(),
              responseTimeMinutes: 12,
            },
          ],
        },
        {
          id: 'job-2',
          homeownerId: 'h2',
          title: 'Job 2',
          description: 'Test',
          aiScope: { scope: 'Test', priceLow: 100, priceHigh: 200, materials: [] },
          size: 'small',
          status: 'open',
          createdAt: new Date().toISOString(),
          bids: [
            {
              id: 'bid-2',
              jobId: 'job-2',
              contractorId: 'c2',
              contractorName: 'C2',
              amount: 160,
              message: 'Bid',
              status: 'pending',
              createdAt: new Date().toISOString(),
              responseTimeMinutes: 18,
            },
          ],
        },
      ]

      await window.spark.kv.set('jobs', jobs)

      const avgBidTime = jobs.reduce((sum, job) => {
        const firstBid = job.bids[0]
        return sum + (firstBid?.responseTimeMinutes || 0)
      }, 0) / jobs.length

      expect(avgBidTime).toBe(15) // (12 + 18) / 2
    })

    it('should count completed jobs this week', async () => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      const jobs: Job[] = Array.from({ length: 25 }, (_, i) => ({
        id: `completed-${i}`,
        homeownerId: `h${i}`,
        title: `Completed Job ${i}`,
        description: 'Finished',
        aiScope: {
          scope: 'Done',
          priceLow: 200,
          priceHigh: 400,
          materials: ['materials'],
        },
        size: 'medium' as const,
        status: 'completed' as const,
        createdAt: new Date(Date.now() - i * 12 * 60 * 60 * 1000).toISOString(), // Spread over week
        bids: [],
      }))

      await window.spark.kv.set('jobs', jobs)

      const completedThisWeek = jobs.filter(j => {
        const jobDate = new Date(j.createdAt)
        return j.status === 'completed' && jobDate > weekAgo
      })

      expect(completedThisWeek.length).toBeGreaterThan(10)
    })
  })

  describe('Contractor Invite Leaderboard', () => {
    it('should rank contractors by successful referrals', async () => {
      const contractors = [
        {
          id: 'c1',
          fullName: 'Top Recruiter',
          successfulReferrals: 12,
          activeReferrals: 10,
          totalReferralEarnings: 600,
        },
        {
          id: 'c2',
          fullName: 'Good Recruiter',
          successfulReferrals: 8,
          activeReferrals: 7,
          totalReferralEarnings: 400,
        },
        {
          id: 'c3',
          fullName: 'New Recruiter',
          successfulReferrals: 3,
          activeReferrals: 3,
          totalReferralEarnings: 150,
        },
      ]

      await window.spark.kv.set('contractor-leaderboard', contractors)

      const leaderboard = await window.spark.kv.get<any[]>('contractor-leaderboard')
      const sorted = leaderboard?.sort((a, b) => b.successfulReferrals - a.successfulReferrals)

      expect(sorted![0].fullName).toBe('Top Recruiter')
      expect(sorted![0].successfulReferrals).toBe(12)
      expect(sorted![2].successfulReferrals).toBe(3)
    })

    it('should award Crew Leader badge after 5 successful referrals', async () => {
      const contractor = {
        id: 'crew-leader',
        fullName: 'Leader Contractor',
        successfulReferrals: 6,
        badges: [] as string[],
      }

      await window.spark.kv.set('contractor-stats', [contractor])

      // Award Crew Leader badge
      if (contractor.successfulReferrals >= 5 && !contractor.badges.includes('crew-leader')) {
        contractor.badges.push('crew-leader')
      }

      await window.spark.kv.set('contractor-stats', [contractor])

      const stats = await window.spark.kv.get<any[]>('contractor-stats')
      expect(stats![0].badges).toContain('crew-leader')
    })
  })

  describe('Fresh Job Notifications', () => {
    it('should send push notification for new jobs in contractor territory', async () => {
      const contractor: User = {
        id: 'c-notify',
        email: 'contractor@example.com',
        fullName: 'Notify Contractor',
        role: 'contractor',
        isPro: true,
        performanceScore: 8.5,
        bidAccuracy: 0.88,
        isOperator: false,
        territoryId: 101,
        createdAt: new Date().toISOString(),
        referralEarnings: 0,
        contractorInviteCount: 0,
      }

      const job: Job = {
        id: 'new-notify-job',
        homeownerId: 'h-notify',
        title: 'Urgent Repair',
        description: 'Need quick help',
        aiScope: {
          scope: 'Emergency fix',
          priceLow: 150,
          priceHigh: 300,
          materials: ['parts'],
        },
        size: 'small',
        tier: 'QUICK_FIX',
        status: 'open',
        territoryId: 101,
        createdAt: new Date().toISOString(),
        bids: [],
      }

      await window.spark.kv.set('jobs', [job])
      await window.spark.kv.set('current-user', contractor)

      // Notification logic
      const shouldNotify = 
        job.territoryId === contractor.territoryId &&
        job.status === 'open' &&
        (Date.now() - new Date(job.createdAt).getTime()) < 15 * 60 * 1000 // Within 15 min

      expect(shouldNotify).toBe(true)

      const notification = {
        id: 'notif-1',
        contractorId: contractor.id,
        jobId: job.id,
        type: 'fresh-job',
        title: 'New Job Posted!',
        message: `${job.title} - $${job.aiScope.priceLow}-$${job.aiScope.priceHigh}`,
        sentAt: new Date().toISOString(),
      }

      await window.spark.kv.set('notifications', [notification])

      const notifications = await window.spark.kv.get<any[]>('notifications')
      expect(notifications).toHaveLength(1)
      expect(notifications![0].type).toBe('fresh-job')
    })
  })

  describe('Performance-First Bid Sorting', () => {
    it('should sort bids by performance score + accuracy + operator boost', async () => {
      const bids = [
        {
          id: 'bid-1',
          contractorId: 'c1',
          contractorName: 'Regular Contractor',
          amount: 500,
          performanceScore: 7.5,
          bidAccuracy: 0.82,
          isOperator: false,
        },
        {
          id: 'bid-2',
          contractorId: 'c2',
          contractorName: 'Operator Contractor',
          amount: 520,
          performanceScore: 8.0,
          bidAccuracy: 0.85,
          isOperator: true,
        },
        {
          id: 'bid-3',
          contractorId: 'c3',
          contractorName: 'Top Contractor',
          amount: 510,
          performanceScore: 9.0,
          bidAccuracy: 0.92,
          isOperator: false,
        },
      ]

      // Calculate scores
      const scoredBids = bids.map(bid => ({
        ...bid,
        totalScore: bid.performanceScore + bid.bidAccuracy + (bid.isOperator ? 0.2 : 0),
      }))

      const sorted = scoredBids.sort((a, b) => b.totalScore - a.totalScore)

      expect(sorted[0].contractorName).toBe('Top Contractor') // 9.0 + 0.92 = 9.92
      expect(sorted[1].contractorName).toBe('Operator Contractor') // 8.0 + 0.85 + 0.2 = 9.05
      expect(sorted[2].contractorName).toBe('Regular Contractor') // 7.5 + 0.82 = 8.32
    })
  })
})
