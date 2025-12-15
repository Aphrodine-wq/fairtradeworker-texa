/**
 * Rate Limiting System for FairTradeWorker
 * Client-side rate limiting with Redis-ready server-side implementation
 */

import type { User } from './types'

// ============================================================================
// Rate Limit Configuration
// ============================================================================

export interface RateLimitConfig {
  window: number // Window in milliseconds
  max: number // Maximum requests per window
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  anonymous: {
    window: 60 * 1000, // 1 minute
    max: 30, // 30 requests/minute
  },
  authenticated: {
    window: 60 * 1000,
    max: 120, // 120 requests/minute
  },
  pro: {
    window: 60 * 1000,
    max: 300, // 300 requests/minute
  },
  operator: {
    window: 60 * 1000,
    max: 500, // 500 requests/minute
  },
}

export const ENDPOINT_LIMITS: Record<string, RateLimitConfig> = {
  'POST /api/jobs': { max: 10, window: 3600000 }, // 10 jobs/hour
  'POST /api/bids': { max: 50, window: 3600000 }, // 50 bids/hour
  'POST /api/invoices': { max: 30, window: 3600000 }, // 30 invoices/hour
  'POST /api/messages': { max: 100, window: 3600000 }, // 100 messages/hour
  'POST /api/contractor/invite': { max: 10, window: 2592000000 }, // 10/month
  'POST /api/ai-scope': { max: 20, window: 3600000 }, // 20 AI scopes/hour
  'GET /api/jobs': { max: 200, window: 60000 }, // 200 requests/minute
  'GET /api/bids': { max: 200, window: 60000 }, // 200 requests/minute
}

// ============================================================================
// Client-Side Rate Limiting (localStorage-based)
// ============================================================================

interface RateLimitRecord {
  count: number
  resetAt: number
  firstRequest: number
}

const RATE_LIMIT_STORAGE_PREFIX = 'ratelimit:'

function getStorageKey(userId: string | null, endpoint: string): string {
  const userKey = userId || 'anonymous'
  return `${RATE_LIMIT_STORAGE_PREFIX}${userKey}:${endpoint}`
}

function getRateLimitRecord(key: string): RateLimitRecord | null {
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return null
    return JSON.parse(stored)
  } catch {
    return null
  }
}

function setRateLimitRecord(key: string, record: RateLimitRecord): void {
  try {
    localStorage.setItem(key, JSON.stringify(record))
  } catch (error) {
    console.error('Failed to store rate limit record:', error)
  }
}

function cleanupExpiredRecords(): void {
  try {
    const now = Date.now()
    const keysToRemove: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(RATE_LIMIT_STORAGE_PREFIX)) {
        const record = getRateLimitRecord(key)
        if (record && now > record.resetAt) {
          keysToRemove.push(key)
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.error('Failed to cleanup rate limit records:', error)
  }
}

// Run cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupExpiredRecords, 5 * 60 * 1000)
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfter?: number
}

export function checkRateLimit(
  endpoint: string,
  user: User | null = null
): RateLimitResult {
  // Get user tier
  let tier: keyof typeof RATE_LIMITS = 'anonymous'
  if (user) {
    if (user.isOperator) tier = 'operator'
    else if (user.isPro) tier = 'pro'
    else tier = 'authenticated'
  }

  // Get limits for this endpoint
  const endpointLimit = ENDPOINT_LIMITS[endpoint]
  const userLimit = RATE_LIMITS[tier]

  // Use the more restrictive limit
  const limit = endpointLimit && endpointLimit.max < userLimit.max
    ? endpointLimit
    : userLimit

  const key = getStorageKey(user?.id || null, endpoint)
  const now = Date.now()
  const record = getRateLimitRecord(key)

  // New window or expired
  if (!record || now > record.resetAt) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + limit.window,
      firstRequest: now
    }
    setRateLimitRecord(key, newRecord)
    return {
      allowed: true,
      remaining: limit.max - 1,
      resetAt: newRecord.resetAt
    }
  }

  // Check if limit exceeded
  if (record.count >= limit.max) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000)
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
      retryAfter
    }
  }

  // Increment count
  record.count++
  setRateLimitRecord(key, record)

  return {
    allowed: true,
    remaining: limit.max - record.count,
    resetAt: record.resetAt
  }
}

// ============================================================================
// Server-Side Rate Limiting (Redis-ready)
// ============================================================================

/**
 * Server-side rate limiting implementation (for future Redis integration)
 * This is the interface that will be used when Redis is integrated
 */
export interface RedisRateLimiter {
  checkLimit(
    userId: string | null,
    endpoint: string,
    limit: RateLimitConfig
  ): Promise<RateLimitResult>
}

/**
 * Redis implementation - uses Redis client when available, falls back to localStorage
 */
export class RedisRateLimiterImpl implements RedisRateLimiter {
  private redis: import('./redis').RedisClient | null = null

  constructor() {
    // Try to get Redis client (will use localStorage mock if not available)
    try {
      const { getRedisClient } = require('./redis')
      this.redis = getRedisClient()
    } catch {
      // Redis not available, will use fallback
    }
  }

  async checkLimit(
    userId: string | null,
    endpoint: string,
    limit: RateLimitConfig
  ): Promise<RateLimitResult> {
    const key = `ratelimit:${userId || 'anonymous'}:${endpoint}`
    const now = Date.now()
    const resetAt = now + limit.window
    const ttl = Math.ceil(limit.window / 1000) // Convert to seconds

    if (this.redis) {
      try {
        // Use Redis for rate limiting
        const count = await this.redis.incr(key)
        
        // Set expiration on first increment
        if (count === 1) {
          await this.redis.expire(key, ttl)
        }

        const allowed = count <= limit.max
        const remaining = Math.max(0, limit.max - count)

        if (!allowed) {
          const existing = await this.redis.get(key)
          const record = existing ? JSON.parse(existing) : null
          const retryAfter = record?.resetAt 
            ? Math.ceil((record.resetAt - now) / 1000)
            : ttl

          return {
            allowed: false,
            remaining: 0,
            resetAt,
            retryAfter
          }
        }

        // Store reset time for retry calculation
        await this.redis.set(`ratelimit:meta:${key}`, JSON.stringify({ resetAt }), ttl)

        return {
          allowed: true,
          remaining,
          resetAt
        }
      } catch (error) {
        console.warn('Redis rate limit failed, falling back to client-side:', error)
        // Fall through to client-side fallback
      }
    }
    
    // Fallback to client-side rate limiting
    return checkRateLimit(endpoint, userId ? { id: userId } as User : null)
  }
}

// ============================================================================
// Rate Limit Middleware Helper
// ============================================================================

export function withRateLimit<T extends (...args: any[]) => any>(
  fn: T,
  endpoint: string
): T {
  return ((...args: Parameters<T>) => {
    const result = checkRateLimit(endpoint)
    
    if (!result.allowed) {
      throw new Error(
        `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`
      )
    }

    return fn(...args)
  }) as T
}

// ============================================================================
// Rate Limit Headers (for API responses)
// ============================================================================

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.resetAt.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
    ...(result.retryAfter && {
      'Retry-After': result.retryAfter.toString()
    })
  }
}

