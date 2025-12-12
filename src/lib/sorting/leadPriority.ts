import type { Bid, User } from '../types'

export const sortBidsByPerformance = (bids: Bid[], users: User[]): Bid[] => {
  return [...bids].sort((a, b) => {
    const userA = users.find(u => u.id === a.contractorId)
    const userB = users.find(u => u.id === b.contractorId)
    
    if (!userA || !userB) return 0
    
    const scoreA = userA.performanceScore + userA.bidAccuracy + (userA.isOperator ? 0.2 : 0)
    const scoreB = userB.performanceScore + userB.bidAccuracy + (userB.isOperator ? 0.2 : 0)
    
    return scoreB - scoreA
  })
}
