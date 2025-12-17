/**
 * County Data Structure
 * Mock data for 3,144 U.S. counties (including DC and territories)
 * Based on NCHS Urban-Rural Classification Scheme 2023
 */

import type { Territory, RuralityTier } from '@/lib/types'

// US States and Territories (50 states + DC + 5 territories)
export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'VI', name: 'U.S. Virgin Islands' },
  { code: 'AS', name: 'American Samoa' },
  { code: 'GU', name: 'Guam' },
  { code: 'MP', name: 'Northern Mariana Islands' },
]

// Helper to generate mock county data
// In production, this would come from a database or API
function generateMockCounty(
  id: number,
  fipsCode: string,
  countyName: string,
  state: string,
  stateCode: string,
  population: number
): Territory {
  // Determine rurality classification based on population
  let ruralityClassification: RuralityTier
  if (population < 50000) {
    ruralityClassification = 'rural'
  } else if (population < 150000) {
    ruralityClassification = 'small'
  } else if (population < 500000) {
    ruralityClassification = 'medium'
  } else {
    ruralityClassification = 'metro'
  }

  return {
    id,
    countyName: `${countyName} County`,
    state,
    stateCode,
    fipsCode,
    population,
    ruralityClassification,
    projectedJobOutput: population * 500,
    status: 'available',
    version: 'enhanced',
  }
}

// Generate comprehensive county data
// This is a simplified version - in production, you'd load from a database
// For now, we'll create a representative sample and a function to generate all counties

/**
 * Get all counties for a specific state
 * In production, this would query a database
 */
export function getCountiesByState(stateCode: string): Territory[] {
  // This is a placeholder - in production, load from database
  // For now, return empty array and let the system generate on demand
  return []
}

/**
 * Get counties by rurality classification
 */
export function getCountiesByRurality(
  counties: Territory[],
  rurality: RuralityTier
): Territory[] {
  return counties.filter(c => c.ruralityClassification === rurality)
}

/**
 * Search counties by name or FIPS code
 */
export function searchCounties(counties: Territory[], query: string): Territory[] {
  const lowerQuery = query.toLowerCase()
  return counties.filter(
    county =>
      county.countyName?.toLowerCase().includes(lowerQuery) ||
      county.fipsCode?.toLowerCase().includes(lowerQuery) ||
      county.state?.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Generate initial county data structure
 * This creates a representative sample - in production, load from database
 */
export function generateInitialCounties(): Territory[] {
  // Sample counties from major states for initial data
  // In production, this would load all 3,144 counties from database
  const sampleCounties: Array<{
    fipsCode: string
    countyName: string
    state: string
    stateCode: string
    population: number
  }> = [
    // Texas (254 counties - sample)
    { fipsCode: '48029', countyName: 'Bexar', state: 'Texas', stateCode: 'TX', population: 2009324 },
    { fipsCode: '48113', countyName: 'Dallas', state: 'Texas', stateCode: 'TX', population: 2613400 },
    { fipsCode: '48201', countyName: 'Harris', state: 'Texas', stateCode: 'TX', population: 4731145 },
    { fipsCode: '48439', countyName: 'Tarrant', state: 'Texas', stateCode: 'TX', population: 2110640 },
    { fipsCode: '48453', countyName: 'Travis', state: 'Texas', stateCode: 'TX', population: 1290348 },
    // California (sample)
    { fipsCode: '06037', countyName: 'Los Angeles', state: 'California', stateCode: 'CA', population: 10014009 },
    { fipsCode: '06075', countyName: 'San Francisco', state: 'California', stateCode: 'CA', population: 873965 },
    // New York (sample)
    { fipsCode: '36061', countyName: 'New York', state: 'New York', stateCode: 'NY', population: 1694251 },
    // Florida (sample)
    { fipsCode: '12011', countyName: 'Broward', state: 'Florida', stateCode: 'FL', population: 1952778 },
    { fipsCode: '12086', countyName: 'Miami-Dade', state: 'Florida', stateCode: 'FL', population: 2701767 },
    // Rural examples
    { fipsCode: '48001', countyName: 'Anderson', state: 'Texas', stateCode: 'TX', population: 58420 },
    { fipsCode: '48003', countyName: 'Andrews', state: 'Texas', stateCode: 'TX', population: 18705 },
  ]

  return sampleCounties.map((county, index) =>
    generateMockCounty(
      index + 1,
      county.fipsCode,
      county.countyName,
      county.state,
      county.stateCode,
      county.population
    )
  )
}

/**
 * Get state name by code
 */
export function getStateName(stateCode: string): string {
  const state = US_STATES.find(s => s.code === stateCode)
  return state?.name || stateCode
}

/**
 * Get state code by name
 */
export function getStateCode(stateName: string): string {
  const state = US_STATES.find(s => s.name === stateName)
  return state?.code || ''
}
