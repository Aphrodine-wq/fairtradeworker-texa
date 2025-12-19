/**
 * First 300 Free System
 * Tracks and validates first 300 free territory claims
 */

import type { TerritoryClaim } from '@/lib/types'

/**
 * Generate entity hash for validation
 * Ensures one free claim per entity (Individual, LLC, or Corporation)
 */
export function validateEntityHash(entityInfo: TerritoryClaim): string {
  // Create a hash based on entity type and identifying information
  const entityKey = `${entityInfo.entityType}:${entityInfo.entityEmail}:${entityInfo.entityTaxId || ''}`
  
  // Simple hash function (in production, use crypto.subtle.digest)
  let hash = 0
  for (let i = 0; i < entityKey.length; i++) {
    const char = entityKey.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36)
}

/**
 * Check if entity can claim a free territory
 * One free claim per entity (tracked by hash)
 */
export function canClaimFree(userId: string, entityInfo: TerritoryClaim): boolean {
  const entityHash = validateEntityHash(entityInfo)
  
  // Check if this entity has already claimed a free territory
  // In production, this would check Supabase
  // For now, check localStorage
  const freeClaims = JSON.parse(
    localStorage.getItem('territory-free-claims') || '[]'
  ) as Array<{ entityHash: string; userId: string; claimedAt: string }>
  
  return !freeClaims.some(claim => claim.entityHash === entityHash)
}

/**
 * Get count of free claims made so far
 */
export function getFirst300Count(): number {
  // In production, this would query Supabase and count by timestamp
  // For now, use localStorage
  const freeClaims = JSON.parse(
    localStorage.getItem('territory-free-claims') || '[]'
  ) as Array<{ entityHash: string; userId: string; claimedAt: string }>
  
  return freeClaims.length
}

/**
 * Check if First 300 free claims are still available
 */
export function checkFirst300Availability(): boolean {
  return getFirst300Count() < 300
}

/**
 * Record a free claim
 */
export function recordFreeClaim(
  userId: string,
  entityInfo: TerritoryClaim,
  territoryId: number
): void {
  const entityHash = validateEntityHash(entityInfo)
  const freeClaims = JSON.parse(
    localStorage.getItem('territory-free-claims') || '[]'
  ) as Array<{ entityHash: string; userId: string; territoryId: number; claimedAt: string }>
  
  freeClaims.push({
    entityHash,
    userId,
    territoryId,
    claimedAt: new Date().toISOString(),
  })
  
  localStorage.setItem('territory-free-claims', JSON.stringify(freeClaims))
  
  // In production, also save to Supabase
}

/**
 * Check if a specific territory claim was free
 */
export function isFreeClaim(territoryId: number): boolean {
  const freeClaims = JSON.parse(
    localStorage.getItem('territory-free-claims') || '[]'
  ) as Array<{ entityHash: string; userId: string; territoryId: number; claimedAt: string }>
  
  return freeClaims.some(claim => claim.territoryId === territoryId)
}
