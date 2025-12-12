import { describe, it, expect } from 'vitest'
import { calculateBidScore, sortBidsByPriority } from '@/lib/sorting/leadPriority'
import type { Bid, User } from '@/lib/types'

describe('Lead Priority Sorting', () => {
  describe('calculateBidScore', () => {
    it('calculates base score from performance and accuracy', () => {
      const contractor: Partial<User> = {
        performanceScore: 8.5,
        bidAccuracy: 0.92,
        isOperator: false,
      }
      
      const score = calculateBidScore(contractor as User)
      
      // Score should be normalized to 0-10 scale
      expect(score).toBeGreaterThan(0)
      expect(score).toBeLessThanOrEqual(10)
    })

    it('adds operator boost correctly', () => {
      const regularContractor: Partial<User> = {
        performanceScore: 8.0,
        bidAccuracy: 0.90,
        isOperator: false,
      }
      
      const operatorContractor: Partial<User> = {
        performanceScore: 8.0,
        bidAccuracy: 0.90,
        isOperator: true,
      }
      
      const regularScore = calculateBidScore(regularContractor as User)
      const operatorScore = calculateBidScore(operatorContractor as User)
      
      // Operator should have higher score (0.2 boost according to PRD)
      expect(operatorScore).toBeGreaterThan(regularScore)
      expect(operatorScore - regularScore).toBeCloseTo(0.2, 1)
    })

    it('handles missing performance data gracefully', () => {
      const contractor: Partial<User> = {
        performanceScore: 0,
        bidAccuracy: 0,
        isOperator: false,
      }
      
      const score = calculateBidScore(contractor as User)
      
      expect(score).toBe(0)
    })
  })

  describe('sortBidsByPriority', () => {
    it('sorts bids by calculated scores', () => {
      const bids: Partial<Bid>[] = [
        { id: '1', contractorId: 'c1', amount: 500 },
        { id: '2', contractorId: 'c2', amount: 600 },
        { id: '3', contractorId: 'c3', amount: 550 },
      ]

      const contractors: Record<string, Partial<User>> = {
        c1: { performanceScore: 7.0, bidAccuracy: 0.85, isOperator: false },
        c2: { performanceScore: 9.0, bidAccuracy: 0.95, isOperator: true },
        c3: { performanceScore: 8.0, bidAccuracy: 0.90, isOperator: false },
      }

      const sorted = sortBidsByPriority(
        bids as Bid[],
        contractors as Record<string, User>
      )

      // c2 should be first (highest score + operator boost)
      expect(sorted[0].contractorId).toBe('c2')
      
      // All bids should be present
      expect(sorted.length).toBe(3)
    })

    it('handles empty bids array', () => {
      const sorted = sortBidsByPriority([], {})
      expect(sorted).toEqual([])
    })
  })
})
