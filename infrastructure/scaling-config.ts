/**
 * Scaling Configuration for 300k Users
 */

export const SCALING_CONFIG = {
  GROWTH_PHASES: {
    PHASE_1_FOUNDATION: { maxUsers: 5_000, months: '1-3' },
    PHASE_2_GROWTH: { maxUsers: 25_000, months: '4-6' },
    PHASE_3_SCALE: { maxUsers: 100_000, months: '7-9' },
    PHASE_4_OPTIMIZE: { maxUsers: 300_000, months: '10-12' },
  },
  
  CONCURRENCY: {
    DAU_RATIO: 0.4,
    CONCURRENT_RATIO: 0.125,
    PEAK_HOURS: [8, 9, 10, 11, 12, 16, 17, 18, 19, 20],
  },
  
  CACHE_TTL: {
    LIVE_STATS: 60,
    FRESH_JOBS: 300,
    CONTRACTOR_STATS: 600,
    JOB_LISTINGS: 120,
    USER_PROFILE: 1800,
  },
  
  RATE_LIMITS: {
    ANONYMOUS: { WINDOW_MS: 60_000, MAX_REQUESTS: 30 },
    AUTHENTICATED: { WINDOW_MS: 60_000, MAX_REQUESTS: 120 },
    PRO: { WINDOW_MS: 60_000, MAX_REQUESTS: 300 },
    OPERATOR: { WINDOW_MS: 60_000, MAX_REQUESTS: 500 },
  },
  
  PERFORMANCE: {
    PAGE_LOAD_P95_MS: 1000,
    API_RESPONSE_P50_MS: 100,
    API_RESPONSE_P95_MS: 500,
    UPTIME_TARGET: 99.9,
  },
} as const;

export function getConfigForUserCount(userCount: number) {
  if (userCount <= 5_000) return 'FOUNDATION';
  if (userCount <= 25_000) return 'GROWTH';
  if (userCount <= 100_000) return 'SCALE';
  return 'OPTIMIZE';
}
