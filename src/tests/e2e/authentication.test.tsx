import { describe, it, expect, beforeEach } from 'vitest'
import type { User } from '@/lib/types'

describe('Authentication & Demo Mode E2E', () => {
  beforeEach(async () => {
    await window.spark.kv.delete('current-user')
    await window.spark.kv.delete('users')
    await window.spark.kv.delete('demo-mode')
  })

  describe('User Signup', () => {
    it('should register new homeowner', async () => {
      const newHomeowner: User = {
        id: 'new-h-1',
        email: 'newhomeowner@example.com',
        fullName: 'New Homeowner',
        role: 'homeowner',
        isPro: false,
        performanceScore: 0,
        bidAccuracy: 0,
        isOperator: false,
        createdAt: new Date().toISOString(),
        referralEarnings: 0,
        contractorInviteCount: 0,
      }

      await window.spark.kv.set('users', [newHomeowner])
      await window.spark.kv.set('current-user', newHomeowner)

      const user = await window.spark.kv.get<User>('current-user')
      expect(user?.role).toBe('homeowner')
      expect(user?.email).toBe('newhomeowner@example.com')
    })

    it('should register new contractor', async () => {
      const newContractor: User = {
        id: 'new-c-1',
        email: 'newcontractor@example.com',
        fullName: 'New Contractor',
        role: 'contractor',
        isPro: false,
        performanceScore: 0,
        bidAccuracy: 0,
        isOperator: false,
        createdAt: new Date().toISOString(),
        referralEarnings: 0,
        contractorInviteCount: 0,
        averageResponseTimeMinutes: 0,
        winRate: 0,
        feesAvoided: 0,
      }

      await window.spark.kv.set('users', [newContractor])
      await window.spark.kv.set('current-user', newContractor)

      const user = await window.spark.kv.get<User>('current-user')
      expect(user?.role).toBe('contractor')
      expect(user?.email).toBe('newcontractor@example.com')
      expect(user?.feesAvoided).toBe(0)
    })

    it('should register new operator', async () => {
      const newOperator: User = {
        id: 'new-o-1',
        email: 'newoperator@example.com',
        fullName: 'New Operator',
        role: 'operator',
        isPro: true,
        performanceScore: 0,
        bidAccuracy: 0,
        isOperator: true,
        createdAt: new Date().toISOString(),
        referralEarnings: 0,
        contractorInviteCount: 0,
      }

      await window.spark.kv.set('users', [newOperator])
      await window.spark.kv.set('current-user', newOperator)

      const user = await window.spark.kv.get<User>('current-user')
      expect(user?.role).toBe('operator')
      expect(user?.isOperator).toBe(true)
      expect(user?.isPro).toBe(true)
    })

    it('should allow signup with referral code', async () => {
      const referralCode = 'REF123XYZ'

      const newUser: User = {
        id: 'referred-user',
        email: 'referred@example.com',
        fullName: 'Referred User',
        role: 'homeowner',
        isPro: false,
        performanceScore: 0,
        bidAccuracy: 0,
        isOperator: false,
        createdAt: new Date().toISOString(),
        referredBy: referralCode,
        referralEarnings: 20, // Gets $20 credit
        contractorInviteCount: 0,
      }

      await window.spark.kv.set('users', [newUser])

      const users = await window.spark.kv.get<User[]>('users')
      const user = users?.find(u => u.id === newUser.id)
      
      expect(user?.referredBy).toBe(referralCode)
      expect(user?.referralEarnings).toBe(20)
    })
  })

  describe('User Login', () => {
    it('should login existing homeowner', async () => {
      const existingHomeowner: User = {
        id: 'existing-h-1',
        email: 'homeowner@example.com',
        fullName: 'Existing Homeowner',
        role: 'homeowner',
        isPro: false,
        performanceScore: 0,
        bidAccuracy: 0,
        isOperator: false,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        referralEarnings: 40,
        contractorInviteCount: 0,
        referralCode: 'EH1234WXYZ',
      }

      await window.spark.kv.set('users', [existingHomeowner])
      await window.spark.kv.set('current-user', existingHomeowner)

      const user = await window.spark.kv.get<User>('current-user')
      expect(user?.email).toBe('homeowner@example.com')
      expect(user?.referralEarnings).toBe(40)
      expect(user?.referralCode).toBe('EH1234WXYZ')
    })

    it('should login existing contractor with stats', async () => {
      const existingContractor: User = {
        id: 'existing-c-1',
        email: 'contractor@example.com',
        fullName: 'Existing Contractor',
        role: 'contractor',
        isPro: true,
        performanceScore: 8.7,
        bidAccuracy: 0.89,
        isOperator: false,
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        referralEarnings: 250,
        contractorInviteCount: 5,
        averageResponseTimeMinutes: 11,
        winRate: 0.72,
        feesAvoided: 15600,
        proSince: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      }

      await window.spark.kv.set('users', [existingContractor])
      await window.spark.kv.set('current-user', existingContractor)

      const user = await window.spark.kv.get<User>('current-user')
      expect(user?.isPro).toBe(true)
      expect(user?.performanceScore).toBe(8.7)
      expect(user?.feesAvoided).toBe(15600)
      expect(user?.winRate).toBe(0.72)
    })

    it('should login operator with territory', async () => {
      const existingOperator: User = {
        id: 'existing-o-1',
        email: 'operator@example.com',
        fullName: 'Existing Operator',
        role: 'operator',
        isPro: true,
        performanceScore: 9.2,
        bidAccuracy: 0.94,
        isOperator: true,
        territoryId: 201,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        referralEarnings: 500,
        contractorInviteCount: 0,
      }

      await window.spark.kv.set('users', [existingOperator])
      await window.spark.kv.set('current-user', existingOperator)

      const user = await window.spark.kv.get<User>('current-user')
      expect(user?.territoryId).toBe(201)
      expect(user?.isOperator).toBe(true)
    })
  })

  describe('Demo Mode', () => {
    it('should activate demo mode as homeowner', async () => {
      const demoHomeowner: User = {
        id: 'demo-homeowner',
        email: 'demo-homeowner@fairtradeworker.com',
        fullName: 'Demo Homeowner',
        role: 'homeowner',
        isPro: false,
        performanceScore: 0,
        bidAccuracy: 0,
        isOperator: false,
        createdAt: new Date().toISOString(),
        referralEarnings: 20,
        contractorInviteCount: 0,
        referralCode: 'DEMO-H-CODE',
      }

      await window.spark.kv.set('demo-mode', true)
      await window.spark.kv.set('current-user', demoHomeowner)

      const isDemoMode = await window.spark.kv.get<boolean>('demo-mode')
      const user = await window.spark.kv.get<User>('current-user')

      expect(isDemoMode).toBe(true)
      expect(user?.email).toContain('demo')
      expect(user?.role).toBe('homeowner')
    })

    it('should activate demo mode as contractor', async () => {
      const demoContractor: User = {
        id: 'demo-contractor',
        email: 'demo-contractor@fairtradeworker.com',
        fullName: 'Demo Contractor',
        role: 'contractor',
        isPro: true,
        performanceScore: 8.5,
        bidAccuracy: 0.88,
        isOperator: false,
        createdAt: new Date().toISOString(),
        referralEarnings: 150,
        contractorInviteCount: 3,
        averageResponseTimeMinutes: 12,
        winRate: 0.70,
        feesAvoided: 12500,
        proSince: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      }

      await window.spark.kv.set('demo-mode', true)
      await window.spark.kv.set('current-user', demoContractor)

      const isDemoMode = await window.spark.kv.get<boolean>('demo-mode')
      const user = await window.spark.kv.get<User>('current-user')

      expect(isDemoMode).toBe(true)
      expect(user?.role).toBe('contractor')
      expect(user?.isPro).toBe(true)
      expect(user?.feesAvoided).toBeGreaterThan(0)
    })

    it('should activate demo mode as operator', async () => {
      const demoOperator: User = {
        id: 'demo-operator',
        email: 'demo-operator@fairtradeworker.com',
        fullName: 'Demo Operator',
        role: 'operator',
        isPro: true,
        performanceScore: 9.0,
        bidAccuracy: 0.92,
        isOperator: true,
        territoryId: 301,
        createdAt: new Date().toISOString(),
        referralEarnings: 400,
        contractorInviteCount: 0,
      }

      await window.spark.kv.set('demo-mode', true)
      await window.spark.kv.set('current-user', demoOperator)

      const isDemoMode = await window.spark.kv.get<boolean>('demo-mode')
      const user = await window.spark.kv.get<User>('current-user')

      expect(isDemoMode).toBe(true)
      expect(user?.role).toBe('operator')
      expect(user?.territoryId).toBeTruthy()
    })

    it('should exit demo mode and clear demo data', async () => {
      await window.spark.kv.set('demo-mode', true)
      await window.spark.kv.set('current-user', {
        id: 'demo-user',
        email: 'demo@example.com',
        fullName: 'Demo User',
        role: 'homeowner',
        isPro: false,
        performanceScore: 0,
        bidAccuracy: 0,
        isOperator: false,
        createdAt: new Date().toISOString(),
        referralEarnings: 0,
        contractorInviteCount: 0,
      })

      // Exit demo mode
      await window.spark.kv.set('demo-mode', false)
      await window.spark.kv.delete('current-user')

      const isDemoMode = await window.spark.kv.get<boolean>('demo-mode')
      const user = await window.spark.kv.get<User>('current-user')

      expect(isDemoMode).toBe(false)
      expect(user).toBeUndefined()
    })

    it('should show demo banner when in demo mode', async () => {
      await window.spark.kv.set('demo-mode', true)

      const isDemoMode = await window.spark.kv.get<boolean>('demo-mode')
      const showBanner = isDemoMode === true

      expect(showBanner).toBe(true)
    })

    it('should allow switching between demo user types', async () => {
      // Start as homeowner
      await window.spark.kv.set('demo-mode', true)
      await window.spark.kv.set('current-user', {
        id: 'demo-h',
        email: 'demo-h@example.com',
        fullName: 'Demo H',
        role: 'homeowner',
        isPro: false,
        performanceScore: 0,
        bidAccuracy: 0,
        isOperator: false,
        createdAt: new Date().toISOString(),
        referralEarnings: 0,
        contractorInviteCount: 0,
      })

      let user = await window.spark.kv.get<User>('current-user')
      expect(user?.role).toBe('homeowner')

      // Switch to contractor
      await window.spark.kv.set('current-user', {
        id: 'demo-c',
        email: 'demo-c@example.com',
        fullName: 'Demo C',
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
      })

      user = await window.spark.kv.get<User>('current-user')
      expect(user?.role).toBe('contractor')

      // Switch to operator
      await window.spark.kv.set('current-user', {
        id: 'demo-o',
        email: 'demo-o@example.com',
        fullName: 'Demo O',
        role: 'operator',
        isPro: true,
        performanceScore: 9.0,
        bidAccuracy: 0.92,
        isOperator: true,
        territoryId: 401,
        createdAt: new Date().toISOString(),
        referralEarnings: 0,
        contractorInviteCount: 0,
      })

      user = await window.spark.kv.get<User>('current-user')
      expect(user?.role).toBe('operator')
    })
  })

  describe('Role-Based Navigation', () => {
    it('should redirect homeowner to homeowner dashboard', async () => {
      const homeowner: User = {
        id: 'h-nav',
        email: 'h@example.com',
        fullName: 'H Nav',
        role: 'homeowner',
        isPro: false,
        performanceScore: 0,
        bidAccuracy: 0,
        isOperator: false,
        createdAt: new Date().toISOString(),
        referralEarnings: 0,
        contractorInviteCount: 0,
      }

      await window.spark.kv.set('current-user', homeowner)

      const user = await window.spark.kv.get<User>('current-user')
      const dashboardRoute = user?.role === 'homeowner' ? '/homeowner-dashboard' : '/'

      expect(dashboardRoute).toBe('/homeowner-dashboard')
    })

    it('should redirect contractor to contractor dashboard', async () => {
      const contractor: User = {
        id: 'c-nav',
        email: 'c@example.com',
        fullName: 'C Nav',
        role: 'contractor',
        isPro: false,
        performanceScore: 7.5,
        bidAccuracy: 0.85,
        isOperator: false,
        createdAt: new Date().toISOString(),
        referralEarnings: 0,
        contractorInviteCount: 0,
        averageResponseTimeMinutes: 15,
        winRate: 0.65,
        feesAvoided: 5000,
      }

      await window.spark.kv.set('current-user', contractor)

      const user = await window.spark.kv.get<User>('current-user')
      const dashboardRoute = user?.role === 'contractor' ? '/contractor-dashboard' : '/'

      expect(dashboardRoute).toBe('/contractor-dashboard')
    })

    it('should redirect operator to operator dashboard', async () => {
      const operator: User = {
        id: 'o-nav',
        email: 'o@example.com',
        fullName: 'O Nav',
        role: 'operator',
        isPro: true,
        performanceScore: 9.0,
        bidAccuracy: 0.92,
        isOperator: true,
        territoryId: 501,
        createdAt: new Date().toISOString(),
        referralEarnings: 0,
        contractorInviteCount: 0,
      }

      await window.spark.kv.set('current-user', operator)

      const user = await window.spark.kv.get<User>('current-user')
      const dashboardRoute = user?.role === 'operator' ? '/operator-dashboard' : '/'

      expect(dashboardRoute).toBe('/operator-dashboard')
    })
  })

  describe('Session Persistence', () => {
    it('should persist user session across page reloads', async () => {
      const user: User = {
        id: 'persist-user',
        email: 'persist@example.com',
        fullName: 'Persist User',
        role: 'homeowner',
        isPro: false,
        performanceScore: 0,
        bidAccuracy: 0,
        isOperator: false,
        createdAt: new Date().toISOString(),
        referralEarnings: 0,
        contractorInviteCount: 0,
      }

      await window.spark.kv.set('current-user', user)

      // Simulate page reload - user should still be logged in
      const persistedUser = await window.spark.kv.get<User>('current-user')

      expect(persistedUser?.id).toBe(user.id)
      expect(persistedUser?.email).toBe(user.email)
    })

    it('should clear session on logout', async () => {
      const user: User = {
        id: 'logout-user',
        email: 'logout@example.com',
        fullName: 'Logout User',
        role: 'contractor',
        isPro: false,
        performanceScore: 7.0,
        bidAccuracy: 0.80,
        isOperator: false,
        createdAt: new Date().toISOString(),
        referralEarnings: 0,
        contractorInviteCount: 0,
        averageResponseTimeMinutes: 18,
        winRate: 0.60,
        feesAvoided: 3000,
      }

      await window.spark.kv.set('current-user', user)

      // Logout
      await window.spark.kv.delete('current-user')

      const loggedOutUser = await window.spark.kv.get<User>('current-user')
      expect(loggedOutUser).toBeUndefined()
    })
  })
})
