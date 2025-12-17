/**
 * Territory Migration Helpers
 * Ensures backward compatibility with existing territories
 */

import type { Territory } from '@/lib/types'

/**
 * Check if territory is in legacy format (missing new optional fields)
 */
export function isLegacyTerritory(territory: Territory): boolean {
  return !territory.version || territory.version === 'legacy'
}

/**
 * Migrate legacy territory to enhanced format
 * Preserves all existing data, adds optional fields
 */
export function migrateLegacyTerritory(territory: Territory): Territory {
  // If already enhanced, return as-is
  if (territory.version === 'enhanced') {
    return territory
  }

  // Preserve all existing fields, add version marker
  return {
    ...territory,
    version: 'enhanced' as const,
    // New fields will be populated when territory is claimed through new system
  }
}

/**
 * Normalize territory to ensure all required fields exist
 */
export function normalizeTerritory(territory: Partial<Territory>): Territory {
  // Ensure required fields exist
  if (!territory.id || !territory.countyName || !territory.status) {
    throw new Error('Territory missing required fields: id, countyName, or status')
  }

  return {
    id: territory.id,
    countyName: territory.countyName,
    status: territory.status,
    operatorId: territory.operatorId,
    operatorName: territory.operatorName,
    // Include all optional fields
    fipsCode: territory.fipsCode,
    state: territory.state,
    stateCode: territory.stateCode,
    population: territory.population,
    ruralityClassification: territory.ruralityClassification,
    projectedJobOutput: territory.projectedJobOutput,
    oneTimeFee: territory.oneTimeFee,
    monthlyFee: territory.monthlyFee,
    claimedBy: territory.claimedBy,
    claimedAt: territory.claimedAt,
    entityType: territory.entityType,
    entityEmail: territory.entityEmail,
    entityTaxId: territory.entityTaxId,
    isFirst300Free: territory.isFirst300Free,
    subscriptionId: territory.subscriptionId,
    subscriptionStatus: territory.subscriptionStatus,
    version: territory.version || 'legacy',
  }
}

/**
 * Migrate all territories in array (for localStorage migration)
 */
export function migrateTerritoriesData(territories: Territory[]): Territory[] {
  return territories.map(territory => {
    if (isLegacyTerritory(territory)) {
      return migrateLegacyTerritory(territory)
    }
    return territory
  })
}
