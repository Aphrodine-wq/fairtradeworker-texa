/**
 * Supabase Connection Pooling Configuration for 400k Users
 * 
 * This configuration ensures optimal database connection management
 * for high-concurrency scenarios with 20k+ concurrent users.
 */

import { SCALING_CONFIG } from './scaling-config';

export const SUPABASE_POOLING_CONFIG = {
  /**
   * Connection Pool Configuration
   * 
   * Supabase uses PgBouncer in transaction mode by default.
   * For 400k users with 20k concurrent, we need aggressive pooling.
   */
  CONNECTION_POOL: {
    // Pool mode: transaction (default) or session
    // Transaction mode is more efficient for serverless
    mode: 'transaction' as const,
    
    // Pool size configuration
    poolSize: {
      min: SCALING_CONFIG.DATABASE.MIN_CONNECTIONS,
      max: SCALING_CONFIG.DATABASE.MAX_CONNECTIONS,
      // Connection timeout
      connectionTimeoutMillis: SCALING_CONFIG.DATABASE.CONNECTION_TIMEOUT_MS,
      // Idle connection timeout (10 minutes)
      idleTimeoutMillis: SCALING_CONFIG.DATABASE.IDLE_TIMEOUT_MS,
      // Query timeout (30 seconds)
      statementTimeout: SCALING_CONFIG.DATABASE.QUERY_TIMEOUT_MS,
    },

    // PgBouncer settings (for Supabase connection pooler)
    pgBouncer: {
      // Default pool size per user/database combination
      default_pool_size: 25,
      // Reserve pool for superuser connections
      reserve_pool_size: 5,
      // Max client connections
      max_client_conn: 10000,
      // Max database connections
      max_db_connections: 100,
      // Pool mode
      pool_mode: 'transaction',
    },
  },

  /**
   * Read Replica Configuration
   * 
   * For read-heavy operations (job browsing, search, analytics)
   * distribute load across read replicas.
   */
  READ_REPLICAS: {
    enabled: true,
    // Distribute read operations across replicas
    readReplicaUrls: [
      // Primary read replica (same region)
      process.env.VITE_SUPABASE_READ_REPLICA_1_URL || '',
      // Secondary read replica (different AZ)
      process.env.VITE_SUPABASE_READ_REPLICA_2_URL || '',
    ],
    // Round-robin strategy for load distribution
    loadBalancingStrategy: 'round-robin' as const,
    // Fallback to primary if replica fails
    fallbackToPrimary: true,
  },

  /**
   * Query Optimization Settings
   */
  QUERY_OPTIMIZATION: {
    // Enable prepared statements for repeated queries
    preparedStatements: true,
    // Enable query result caching
    queryCache: true,
    // Maximum rows to return (prevent unbounded queries)
    maxRows: 1000,
    // Enable query timeout
    queryTimeout: SCALING_CONFIG.DATABASE.QUERY_TIMEOUT_MS,
  },

  /**
   * Real-time Subscription Limits
   * 
   * Supabase Realtime can be resource-intensive at scale.
   * Limit concurrent subscriptions and use selective filters.
   */
  REALTIME: {
    // Max concurrent subscriptions per client
    maxSubscriptionsPerClient: 10,
    // Use row-level filters to reduce payload size
    useFilters: true,
    // Throttle real-time updates (milliseconds between broadcasts)
    throttleMs: 1000,
    // Disable realtime for non-critical tables
    disabledTables: [
      'analytics_events',
      'audit_logs',
      'archived_jobs',
    ],
  },
};

/**
 * Create Supabase client with optimized connection pooling
 */
export function createOptimizedSupabaseClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured');
  }

  // Note: Connection pooling is primarily configured on the Supabase project settings
  // These settings inform the client-side configuration
  return {
    supabaseUrl,
    supabaseAnonKey,
    options: {
      db: {
        schema: 'public',
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      global: {
        headers: {
          'x-client-info': 'fairtradeworker-web',
        },
      },
    },
  };
}

/**
 * Route query to appropriate database endpoint
 * 
 * @param queryType - 'read' or 'write'
 * @returns Database URL to use
 */
export function getOptimalDatabaseUrl(queryType: 'read' | 'write'): string {
  const primaryUrl = import.meta.env.VITE_SUPABASE_URL || '';
  
  // Always use primary for writes
  if (queryType === 'write') {
    return primaryUrl;
  }

  // For reads, use replica if available
  if (SUPABASE_POOLING_CONFIG.READ_REPLICAS.enabled) {
    const replicas = SUPABASE_POOLING_CONFIG.READ_REPLICAS.readReplicaUrls.filter(Boolean);
    
    if (replicas.length > 0) {
      // Simple round-robin
      const index = Math.floor(Math.random() * replicas.length);
      return replicas[index] || primaryUrl;
    }
  }

  return primaryUrl;
}

/**
 * Health check for database connections
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latencyMs: number;
  activeConnections?: number;
  error?: string;
}> {
  try {
    const start = Date.now();
    
    // Simple health check query
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      },
    });

    const latencyMs = Date.now() - start;

    if (response.ok) {
      return {
        healthy: true,
        latencyMs,
      };
    }

    return {
      healthy: false,
      latencyMs,
      error: `Status ${response.status}`,
    };
  } catch (error) {
    return {
      healthy: false,
      latencyMs: -1,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
