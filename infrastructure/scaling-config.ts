/**
 * Scaling Configuration for 400k Users - Day 1 Ready
 * 
 * This configuration is designed to handle 400k users from day 1,
 * with peak loads of ~160k DAU and ~20k concurrent users.
 */

export const SCALING_CONFIG = {
  // Day 1 launch configuration for 400k users
  LAUNCH_DAY: {
    MAX_USERS: 400_000,
    DAU_EXPECTED: 160_000, // 40% DAU ratio
    PEAK_CONCURRENT: 20_000, // 12.5% of DAU during peak hours
    JOBS_PER_DAY: 1_500,
    BIDS_PER_DAY: 7_500,
    MESSAGES_PER_DAY: 15_000,
  },

  GROWTH_PHASES: {
    PHASE_1_LAUNCH: { maxUsers: 400_000, months: '0-1' },
    PHASE_2_STABILIZE: { maxUsers: 500_000, months: '1-3' },
    PHASE_3_GROWTH: { maxUsers: 750_000, months: '4-6' },
    PHASE_4_SCALE: { maxUsers: 1_000_000, months: '7-12' },
  },
  
  CONCURRENCY: {
    DAU_RATIO: 0.4, // 40% of total users active daily
    CONCURRENT_RATIO: 0.125, // 12.5% of DAU concurrent during peak
    PEAK_HOURS: [8, 9, 10, 11, 12, 16, 17, 18, 19, 20],
    // For 400k users: 160k DAU, 20k concurrent peak
  },
  
  // Aggressive caching for high load
  CACHE_TTL: {
    LIVE_STATS: 30, // Reduced from 60s for fresher data at scale
    FRESH_JOBS: 180, // Reduced from 300s to balance freshness/load
    CONTRACTOR_STATS: 600,
    JOB_LISTINGS: 120,
    USER_PROFILE: 1800,
    TERRITORY_METRICS: 300,
    SEARCH_RESULTS: 600,
  },
  
  // More permissive rate limits for day 1 to avoid user frustration
  RATE_LIMITS: {
    ANONYMOUS: { WINDOW_MS: 60_000, MAX_REQUESTS: 60 }, // Increased from 30
    AUTHENTICATED: { WINDOW_MS: 60_000, MAX_REQUESTS: 200 }, // Increased from 120
    PRO: { WINDOW_MS: 60_000, MAX_REQUESTS: 500 }, // Increased from 300
    OPERATOR: { WINDOW_MS: 60_000, MAX_REQUESTS: 1000 }, // Increased from 500
  },
  
  PERFORMANCE: {
    PAGE_LOAD_P95_MS: 1500, // Slightly relaxed for day 1 (was 1000)
    API_RESPONSE_P50_MS: 150, // Slightly relaxed (was 100)
    API_RESPONSE_P95_MS: 800, // Slightly relaxed (was 500)
    UPTIME_TARGET: 99.5, // Realistic for day 1 (was 99.9)
  },

  // Database connection pool sizing
  DATABASE: {
    MIN_CONNECTIONS: 20,
    MAX_CONNECTIONS: 100,
    CONNECTION_TIMEOUT_MS: 30_000,
    IDLE_TIMEOUT_MS: 600_000,
    QUERY_TIMEOUT_MS: 30_000,
  },

  // Auto-scaling thresholds
  AUTO_SCALE: {
    SCALE_UP_CPU_THRESHOLD: 70,
    SCALE_DOWN_CPU_THRESHOLD: 30,
    SCALE_UP_RESPONSE_TIME_MS: 800,
    MIN_INSTANCES: 8, // Start with 8 instances
    MAX_INSTANCES: 50, // Can scale to 50
    COOLDOWN_SECONDS: 180,
  },

  // Circuit breaker settings for external services
  CIRCUIT_BREAKER: {
    FAILURE_THRESHOLD: 5,
    SUCCESS_THRESHOLD: 2,
    TIMEOUT_MS: 10_000,
    RESET_TIMEOUT_MS: 30_000,
  },
} as const;

export function getConfigForUserCount(userCount: number) {
  if (userCount <= 400_000) return 'LAUNCH';
  if (userCount <= 500_000) return 'STABILIZE';
  if (userCount <= 750_000) return 'GROWTH';
  return 'SCALE';
}

/**
 * Calculate required infrastructure resources for given user count
 */
export function calculateInfrastructure(userCount: number) {
  const dau = Math.floor(userCount * SCALING_CONFIG.CONCURRENCY.DAU_RATIO);
  const concurrent = Math.floor(dau * SCALING_CONFIG.CONCURRENCY.CONCURRENT_RATIO);
  
  return {
    dailyActiveUsers: dau,
    peakConcurrent: concurrent,
    recommendedInstances: Math.max(
      SCALING_CONFIG.AUTO_SCALE.MIN_INSTANCES,
      Math.ceil(concurrent / 400) // 400 concurrent users per instance
    ),
    databaseConnections: Math.min(
      SCALING_CONFIG.DATABASE.MAX_CONNECTIONS,
      Math.max(
        SCALING_CONFIG.DATABASE.MIN_CONNECTIONS,
        Math.ceil(concurrent / 100) // 100 users per connection
      )
    ),
    cacheMemoryGB: Math.ceil(userCount / 50_000), // 1GB per 50k users
  };
}
