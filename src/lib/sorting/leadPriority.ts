import type { Bid, User } from '../types'

/**
 * Calculate bid score based on contractor performance
 */
export function calculateBidScore(contractor: User): number {
  const baseScore = (contractor.performanceScore || 0) + (contractor.bidAccuracy || 0) * 10
  const operatorBoost = contractor.isOperator ? 0.2 : 0
  return Math.min(10, baseScore / 2 + operatorBoost)
}

/**
 * Sort bids by priority using contractor performance scores
 */
export function sortBidsByPriority(
  bids: Bid[],
  contractors: Record<string, User>
): Bid[] {
  if (bids.length === 0) return []
  
  return [...bids].sort((a, b) => {
    const contractorA = contractors[a.contractorId]
    const contractorB = contractors[b.contractorId]
    
    if (!contractorA && !contractorB) return 0
    if (!contractorA) return 1
    if (!contractorB) return -1
    
    const scoreA = calculateBidScore(contractorA)
    const scoreB = calculateBidScore(contractorB)
    
    return scoreB - scoreA
  })
}

/**
 * Legacy function for backward compatibility
 */
export const sortBidsByPerformance = (bids: Bid[], users: User[]): Bid[] => {
  const userMap = users.reduce((acc, user) => {
    acc[user.id] = user
    return acc
  }, {} as Record<string, User>)
  
  return sortBidsByPriority(bids, userMap)
}
