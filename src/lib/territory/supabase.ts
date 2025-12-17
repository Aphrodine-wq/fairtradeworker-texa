/**
 * Supabase Integration for Territories
 * Handles database operations and realtime subscriptions
 */

import { supabase } from '@/lib/supabase'
import type { Territory, TerritoryClaim } from '@/lib/types'
import { migrateTerritoriesData } from './migration'

/**
 * Sync territories from Supabase
 * Merges with localStorage for backward compatibility
 */
export async function syncTerritoriesFromSupabase(): Promise<Territory[]> {
  try {
    // Try to fetch from Supabase
    const { data, error } = await supabase
      .from('territories')
      .select('*')
      .order('id', { ascending: true })
    
    if (error) {
      console.warn('Supabase sync failed, using localStorage:', error)
      // Fallback to localStorage
      const localTerritories = JSON.parse(
        localStorage.getItem('territories') || '[]'
      ) as Territory[]
      return migrateTerritoriesData(localTerritories)
    }
    
    // Migrate any legacy territories
    const migrated = migrateTerritoriesData(data || [])
    
    // Sync to localStorage for offline support
    localStorage.setItem('territories', JSON.stringify(migrated))
    
    return migrated
  } catch (error) {
    console.error('Error syncing territories from Supabase:', error)
    // Fallback to localStorage
    const localTerritories = JSON.parse(
      localStorage.getItem('territories') || '[]'
    ) as Territory[]
    return migrateTerritoriesData(localTerritories)
  }
}

/**
 * Claim a territory
 * Works with both Supabase and localStorage
 */
export async function claimTerritory(
  territoryId: number,
  userId: string,
  entityInfo: TerritoryClaim,
  isFree: boolean
): Promise<void> {
  try {
    // Update in Supabase if available
    const { error: supabaseError } = await supabase
      .from('territories')
      .update({
        status: 'claimed',
        claimed_by: userId,
        claimed_at: new Date().toISOString(),
        entity_type: entityInfo.entityType,
        entity_email: entityInfo.entityEmail,
        entity_name: entityInfo.entityName,
        entity_tax_id: entityInfo.entityTaxId,
        is_first_300_free: isFree,
      })
      .eq('id', territoryId)
    
    if (supabaseError) {
      console.warn('Supabase update failed, using localStorage:', supabaseError)
    }
    
    // Also update localStorage for offline support
    const localTerritories = JSON.parse(
      localStorage.getItem('territories') || '[]'
    ) as Territory[]
    
    const updated = localTerritories.map(t => {
      if (t.id === territoryId) {
        return {
          ...t,
          status: 'claimed' as const,
          operatorId: userId,
          claimedBy: userId,
          claimedAt: new Date().toISOString(),
          entityType: entityInfo.entityType,
          entityEmail: entityInfo.entityEmail,
          entityName: entityInfo.entityName,
          entityTaxId: entityInfo.entityTaxId,
          isFirst300Free: isFree,
          version: 'enhanced' as const,
        }
      }
      return t
    })
    
    localStorage.setItem('territories', JSON.stringify(updated))
  } catch (error) {
    console.error('Error claiming territory:', error)
    throw error
  }
}

/**
 * Release a territory
 */
export async function releaseTerritory(territoryId: number): Promise<void> {
  try {
    // Update in Supabase
    const { error: supabaseError } = await supabase
      .from('territories')
      .update({
        status: 'available',
        claimed_by: null,
        claimed_at: null,
        operator_id: null,
        operator_name: null,
      })
      .eq('id', territoryId)
    
    if (supabaseError) {
      console.warn('Supabase update failed, using localStorage:', supabaseError)
    }
    
    // Update localStorage
    const localTerritories = JSON.parse(
      localStorage.getItem('territories') || '[]'
    ) as Territory[]
    
    const updated = localTerritories.map(t => {
      if (t.id === territoryId) {
        return {
          ...t,
          status: 'available' as const,
          operatorId: undefined,
          operatorName: undefined,
          claimedBy: undefined,
          claimedAt: undefined,
        }
      }
      return t
    })
    
    localStorage.setItem('territories', JSON.stringify(updated))
  } catch (error) {
    console.error('Error releasing territory:', error)
    throw error
  }
}

/**
 * Get user's territories
 */
export async function getMyTerritories(userId: string): Promise<Territory[]> {
  try {
    // Try Supabase first
    const { data, error } = await supabase
      .from('territories')
      .select('*')
      .or(`operator_id.eq.${userId},claimed_by.eq.${userId}`)
    
    if (!error && data) {
      return migrateTerritoriesData(data)
    }
    
    // Fallback to localStorage
    const localTerritories = JSON.parse(
      localStorage.getItem('territories') || '[]'
    ) as Territory[]
    
    return migrateTerritoriesData(
      localTerritories.filter(t => 
        t.operatorId === userId || t.claimedBy === userId
      )
    )
  } catch (error) {
    console.error('Error getting user territories:', error)
    return []
  }
}

/**
 * Merge territories from Supabase and localStorage
 */
export function mergeTerritories(
  supabaseTerritories: Territory[],
  localTerritories: Territory[]
): Territory[] {
  const merged = new Map<number, Territory>()
  
  // Add Supabase territories first (source of truth)
  supabaseTerritories.forEach(territory => {
    merged.set(territory.id, territory)
  })
  
  // Add local territories that don't exist in Supabase
  localTerritories.forEach(territory => {
    if (!merged.has(territory.id)) {
      merged.set(territory.id, territory)
    }
  })
  
  return Array.from(merged.values())
}

/**
 * Migrate legacy territories from localStorage to Supabase
 */
export async function migrateLegacyTerritories(): Promise<void> {
  try {
    const localTerritories = JSON.parse(
      localStorage.getItem('territories') || '[]'
    ) as Territory[]
    
    if (localTerritories.length === 0) {
      return
    }
    
    // Migrate to enhanced format
    const migrated = migrateTerritoriesData(localTerritories)
    
    // Upload to Supabase
    const { error } = await supabase
      .from('territories')
      .upsert(
        migrated.map(t => ({
          id: t.id,
          county_name: t.countyName,
          state: t.state,
          state_code: t.stateCode,
          fips_code: t.fipsCode,
          population: t.population,
          rurality_classification: t.ruralityClassification,
          projected_job_output: t.projectedJobOutput,
          status: t.status,
          operator_id: t.operatorId,
          operator_name: t.operatorName,
          claimed_by: t.claimedBy,
          claimed_at: t.claimedAt,
          entity_type: t.entityType,
          entity_email: t.entityEmail,
          entity_name: t.entityName,
          entity_tax_id: t.entityTaxId,
          one_time_fee: t.oneTimeFee,
          monthly_fee: t.monthlyFee,
          is_first_300_free: t.isFirst300Free,
          subscription_id: t.subscriptionId,
          subscription_status: t.subscriptionStatus,
          version: t.version || 'enhanced',
        })),
        { onConflict: 'id' }
      )
    
    if (error) {
      console.warn('Failed to migrate territories to Supabase:', error)
      // Continue - localStorage is still valid
    } else {
      console.log('Successfully migrated territories to Supabase')
    }
  } catch (error) {
    console.error('Error migrating legacy territories:', error)
    // Don't throw - migration failure shouldn't break the app
  }
}

/**
 * Set up realtime subscription for territories
 */
export function setupTerritoryRealtime(
  onUpdate: (territory: Territory) => void
): () => void {
  try {
    const channel = supabase
      .channel('territories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'territories',
        },
        (payload) => {
          // Convert Supabase format to Territory format
          const territory: Territory = {
            id: payload.new.id,
            countyName: payload.new.county_name,
            state: payload.new.state,
            stateCode: payload.new.state_code,
            fipsCode: payload.new.fips_code,
            population: payload.new.population,
            ruralityClassification: payload.new.rurality_classification,
            projectedJobOutput: payload.new.projected_job_output,
            status: payload.new.status,
            operatorId: payload.new.operator_id,
            operatorName: payload.new.operator_name,
            claimedBy: payload.new.claimed_by,
            claimedAt: payload.new.claimed_at,
            entityType: payload.new.entity_type,
            entityEmail: payload.new.entity_email,
            entityName: payload.new.entity_name,
            entityTaxId: payload.new.entity_tax_id,
            oneTimeFee: payload.new.one_time_fee,
            monthlyFee: payload.new.monthly_fee,
            isFirst300Free: payload.new.is_first_300_free,
            subscriptionId: payload.new.subscription_id,
            subscriptionStatus: payload.new.subscription_status,
            version: payload.new.version || 'enhanced',
          }
          
          onUpdate(territory)
        }
      )
      .subscribe()
    
    // Return cleanup function
    return () => {
      supabase.removeChannel(channel)
    }
  } catch (error) {
    console.error('Error setting up realtime subscription:', error)
    // Return no-op cleanup function
    return () => {}
  }
}
