/**
 * Territory Pricing Logic
 * Based on NCHS Urban-Rural Classification Scheme 2023
 */

import type { Territory, RuralityTier, PricingInfo } from '@/lib/types'

/**
 * Get rurality tier based on population
 */
export function getRuralityTier(population: number): RuralityTier {
  if (population < 50000) {
    return 'rural'
  } else if (population < 150000) {
    return 'small'
  } else if (population < 500000) {
    return 'medium'
  } else {
    return 'metro'
  }
}

/**
 * Calculate projected job output (population × 500)
 * Represents average yearly services spending per capita
 */
export function calculateProjectedJobs(population: number): number {
  return population * 500
}

/**
 * Calculate pricing for a territory based on rurality tier
 */
export function calculateTerritoryPricing(
  territory: Territory,
  isFirst300Free: boolean = false
): PricingInfo {
  const population = territory.population || 0
  const ruralityTier = territory.ruralityClassification || getRuralityTier(population)
  const projectedJobOutput = territory.projectedJobOutput || calculateProjectedJobs(population)

  let oneTimeFee = 0
  let monthlyFee = 0

  if (!isFirst300Free) {
    switch (ruralityTier) {
      case 'rural':
        oneTimeFee = 2500
        monthlyFee = 99
        break
      case 'small':
        oneTimeFee = 5000
        monthlyFee = 199
        break
      case 'medium':
        oneTimeFee = 10000
        monthlyFee = 399
        break
      case 'metro':
        oneTimeFee = 25000
        monthlyFee = 799
        break
    }
  }

  const totalFirstYear = isFirst300Free ? 0 : oneTimeFee + monthlyFee * 12

  return {
    oneTimeFee,
    monthlyFee,
    totalFirstYear,
    ruralityTier,
    isFree: isFirst300Free,
    projectedJobOutput,
  }
}

/**
 * Get pricing tier label
 */
export function getPricingTierLabel(tier: RuralityTier): string {
  switch (tier) {
    case 'rural':
      return 'Rural'
    case 'small':
      return 'Small'
    case 'medium':
      return 'Medium'
    case 'metro':
      return 'Metro'
  }
}

/**
 * Get pricing tier description
 */
export function getPricingTierDescription(tier: RuralityTier): string {
  switch (tier) {
    case 'rural':
      return 'Under 50,000 population'
    case 'small':
      return '50,000 - 150,000 population'
    case 'medium':
      return '150,000 - 500,000 population'
    case 'metro':
      return 'Over 500,000 population'
  }
}
