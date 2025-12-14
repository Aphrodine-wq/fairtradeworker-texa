/**
 * Live Upsell & Quoting for AI Receptionist
 * Enhancement - AI suggests upsells and generates instant quotes during calls
 */

import type { ReceptionistCall, CallExtraction } from './receptionist'

export interface UpsellSuggestion {
  trigger: string
  service: string
  description: string
  estimatedPrice: {
    low: number
    high: number
  }
  discount?: number
  urgency?: 'low' | 'medium' | 'high'
}

export interface InstantQuote {
  baseService: string
  basePrice: {
    low: number
    high: number
  }
  upsells: UpsellSuggestion[]
  totalPrice: {
    low: number
    high: number
  }
  depositAmount: number
  validUntil: string
}

/**
 * Generate upsell suggestions based on call extraction
 */
export function generateUpsells(extraction: CallExtraction): UpsellSuggestion[] {
  const upsells: UpsellSuggestion[] = []

  // Plumbing upsells
  if (extraction.issueType === 'repair' && (extraction.description.toLowerCase().includes('faucet') || extraction.description.toLowerCase().includes('leak'))) {
    upsells.push({
      trigger: 'faucet_repair',
      service: 'Full Plumbing Inspection',
      description: 'Complete plumbing system check to prevent future leaks',
      estimatedPrice: { low: 150, high: 300 },
      discount: 15,
      urgency: 'medium'
    })
  }

  // Electrical upsells
  if (extraction.issueType === 'repair' && extraction.description.toLowerCase().includes('outlet')) {
    upsells.push({
      trigger: 'outlet_repair',
      service: 'Whole House Electrical Safety Inspection',
      description: 'Comprehensive electrical safety check for your entire home',
      estimatedPrice: { low: 200, high: 400 },
      discount: 20,
      urgency: 'high'
    })
  }

  // Roofing upsells
  if (extraction.issueType === 'repair' && extraction.description.toLowerCase().includes('roof')) {
    upsells.push({
      trigger: 'roof_repair',
      service: 'Complete Roof Assessment',
      description: 'Full roof inspection to identify all potential issues',
      estimatedPrice: { low: 300, high: 600 },
      discount: 10,
      urgency: 'medium'
    })
  }

  // HVAC upsells
  if (extraction.issueType === 'repair' && (extraction.description.toLowerCase().includes('ac') || extraction.description.toLowerCase().includes('heating'))) {
    upsells.push({
      trigger: 'hvac_repair',
      service: 'HVAC Maintenance Plan',
      description: 'Annual maintenance plan to keep your system running efficiently',
      estimatedPrice: { low: 400, high: 800 },
      discount: 25,
      urgency: 'low'
    })
  }

  return upsells
}

/**
 * Generate instant quote from call extraction
 */
export function generateInstantQuote(
  extraction: CallExtraction,
  contractorId: string
): InstantQuote {
  const upsells = generateUpsells(extraction)

  // Base pricing based on issue type
  let basePrice = { low: 100, high: 500 }
  
  if (extraction.estimatedScope) {
    if (extraction.estimatedScope.includes('small')) {
      basePrice = { low: 100, high: 500 }
    } else if (extraction.estimatedScope.includes('medium')) {
      basePrice = { low: 500, high: 2000 }
    } else {
      basePrice = { low: 2000, high: 10000 }
    }
  }

  // Calculate total with upsells
  const upsellTotal = upsells.reduce((sum, upsell) => {
    const discountedPrice = upsell.discount 
      ? { 
          low: upsell.estimatedPrice.low * (1 - upsell.discount / 100),
          high: upsell.estimatedPrice.high * (1 - upsell.discount / 100)
        }
      : upsell.estimatedPrice
    return {
      low: sum.low + discountedPrice.low,
      high: sum.high + discountedPrice.high
    }
  }, { low: 0, high: 0 })

  const totalPrice = {
    low: basePrice.low + upsellTotal.low,
    high: basePrice.high + upsellTotal.high
  }

  // 20% deposit
  const depositAmount = totalPrice.low * 0.2

  // Quote valid for 30 days
  const validUntil = new Date()
  validUntil.setDate(validUntil.getDate() + 30)

  return {
    baseService: extraction.issueType || 'Service',
    basePrice,
    upsells,
    totalPrice,
    depositAmount,
    validUntil: validUntil.toISOString()
  }
}

/**
 * Get price estimate for materials based on category
 */
export function getMaterialPriceEstimate(category: string, scope: string): { low: number; high: number } {
  // Mock pricing - in production, use materials.json database
  const pricing: Record<string, { low: number; high: number }> = {
    plumbing: { low: 50, high: 300 },
    electrical: { low: 75, high: 400 },
    roofing: { low: 200, high: 1000 },
    hvac: { low: 150, high: 800 },
    general: { low: 100, high: 500 }
  }

  return pricing[category.toLowerCase()] || pricing.general
}
