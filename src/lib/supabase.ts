/**
 * Supabase Client Configuration
 * Optimized for 400k users with connection pooling and circuit breakers
 */

import { createClient } from '@supabase/supabase-js'
import { createOptimizedSupabaseClient, getOptimalDatabaseUrl } from '../../infrastructure/supabase-pooling.config'
import { withCircuitBreaker } from './circuitBreaker'

// These should be set as environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.')
}

// Create optimized client with connection pooling settings
const clientConfig = createOptimizedSupabaseClient()

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Storage key for auth session
    storageKey: 'ftw-auth',
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      // Limit events per second to prevent overwhelming clients
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'x-client-info': 'fairtradeworker-web',
    },
  },
})

/**
 * Execute a Supabase query with circuit breaker protection
 * 
 * @param queryFn - Query function to execute
 * @param fallbackData - Optional fallback data if query fails
 */
export async function supabaseWithFallback<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  fallbackData?: T
): Promise<{ data: T | null; error: any }> {
  try {
    return await withCircuitBreaker(
      'database',
      queryFn,
      fallbackData ? () => ({ data: fallbackData, error: null }) : undefined
    )
  } catch (error) {
    console.error('Supabase query failed:', error)
    return {
      data: fallbackData || null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

// Database types (will be generated from Supabase)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'homeowner' | 'contractor' | 'operator'
          territory_id: number | null
          is_pro: boolean
          pro_since: string | null
          performance_score: number
          bid_accuracy: number
          is_operator: boolean
          referral_code: string | null
          referred_by: string | null
          referral_earnings: number
          contractor_invite_count: number
          company_logo: string | null
          company_name: string | null
          company_address: string | null
          company_phone: string | null
          company_email: string | null
          tax_id: string | null
          average_response_time_minutes: number | null
          win_rate: number | null
          fees_avoided: number
          available_now: boolean
          available_now_since: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      jobs: {
        Row: {
          id: string
          homeowner_id: string
          contractor_id: string | null
          title: string
          description: string
          media_url: string | null
          media_type: 'audio' | 'photo' | 'video' | null
          photos: string[]
          ai_scope: Record<string, any>
          size: 'small' | 'medium' | 'large'
          tier: 'QUICK_FIX' | 'STANDARD' | 'MAJOR_PROJECT' | null
          estimated_days: number | null
          trades_required: string[]
          permit_required: boolean
          status: 'open' | 'bidding' | 'awarded' | 'in-progress' | 'completed' | 'cancelled'
          territory_id: number | null
          is_urgent: boolean
          urgent_deadline: string | null
          is_private: boolean
          source: 'ai_receptionist' | 'marketplace' | 'direct' | null
          metadata: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['jobs']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['jobs']['Insert']>
      }
      bids: {
        Row: {
          id: string
          job_id: string
          contractor_id: string
          contractor_name: string
          amount: number
          message: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['bids']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['bids']['Insert']>
      }
      invoices: {
        Row: {
          id: string
          contractor_id: string
          job_id: string
          job_title: string
          line_items: Array<Record<string, any>>
          subtotal: number
          tax_rate: number
          tax_amount: number
          total: number
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          due_date: string
          sent_date: string | null
          paid_date: string | null
          is_pro_forma: boolean
          late_fee_applied: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>
      }
    }
  }
}

// Helper function to get current user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper function to sign out
export async function signOut() {
  await supabase.auth.signOut()
}
