export interface CompetitorFees {
  thumbtack: number
  homeadvisor: number
  angi: number
}

export function calculateCompetitorFees(amount: number): CompetitorFees {
  return {
    thumbtack: amount * 0.15,
    homeadvisor: amount * 0.20,
    angi: amount * 0.18,
  }
}

export function calculateTotalFeesSaved(totalEarnings: number): CompetitorFees {
  return calculateCompetitorFees(totalEarnings)
}

export interface BidIntelligence {
  similarJobsRange: { low: number; high: number }
  averageWinningBid: number
  yourWinRate: number
  optimalBidTime: string
  optimalBidTimeBoost: number
}

export function calculateBidIntelligence(
  jobCategory: string,
  jobPriceLow: number,
  jobPriceHigh: number,
  contractorWinRate?: number
): BidIntelligence {
  const avgPrice = (jobPriceLow + jobPriceHigh) / 2
  
  return {
    similarJobsRange: {
      low: Math.round(avgPrice * 0.85),
      high: Math.round(avgPrice * 1.15),
    },
    averageWinningBid: Math.round(avgPrice * 0.95),
    yourWinRate: contractorWinRate || 0.34,
    optimalBidTime: 'Before 9am',
    optimalBidTimeBoost: 0.40,
  }
}

export function getResponseTimeBadge(avgResponseMinutes: number | undefined): {
  color: 'green' | 'yellow' | 'none'
  label: string
  icon: string
} {
  if (!avgResponseMinutes) {
    return { color: 'none', label: '', icon: '' }
  }
  
  if (avgResponseMinutes < 15) {
    return {
      color: 'green',
      label: '<15 min average',
      icon: '⚡',
    }
  }
  
  if (avgResponseMinutes < 30) {
    return {
      color: 'yellow',
      label: '<30 min average',
      icon: '🕐',
    }
  }
  
  return { color: 'none', label: '', icon: '' }
}

export function calculateJobPostingTime(
  startTime: number,
  endTime: number
): number {
  return Math.round((endTime - startTime) / 1000)
}

export function isLightningBid(
  jobCreatedAt: string,
  bidCreatedAt: string
): boolean {
  const jobTime = new Date(jobCreatedAt).getTime()
  const bidTime = new Date(bidCreatedAt).getTime()
  const minutesDiff = (bidTime - jobTime) / 1000 / 60
  
  return minutesDiff <= 10
}

export function calculateRouteSavings(jobs: Array<{ location?: string }>): {
  totalDriveTimeMinutes: number
  moneySaved: number
  gasGallonsSaved: number
} {
  const estimatedDriveTime = jobs.length * 15
  const savingsPercentage = 0.30
  const savedTime = estimatedDriveTime * savingsPercentage
  const dollarPerMinute = 2.5
  
  return {
    totalDriveTimeMinutes: Math.round(savedTime),
    moneySaved: Math.round(savedTime * dollarPerMinute),
    gasGallonsSaved: Math.round((savedTime / 60) * 2),
  }
}

export interface PayoutComparison {
  ftw: string
  competitors: string
  advantageText: string
}

export function getPayoutComparison(isPro: boolean): PayoutComparison {
  if (isPro) {
    return {
      ftw: '30 minutes',
      competitors: '3-7 business days',
      advantageText: 'Your money available now',
    }
  }
  
  return {
    ftw: 'Same day',
    competitors: '3-7 business days',
    advantageText: 'Get paid faster',
  }
}

export const COMPETITOR_NAMES = {
  thumbtack: 'Thumbtack',
  homeadvisor: 'HomeAdvisor',
  angi: 'Angi',
} as const

export const INDUSTRY_AVERAGES = {
  jobPostingTimeMinutes: 10,
  firstBidTimeHours: 4,
  payoutDays: 5,
  platformFeePercentage: 0.15,
} as const
