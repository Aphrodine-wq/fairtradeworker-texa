/**
 * Redis Client Setup for FairTradeWorker
 * Provides caching, session management, and rate limiting
 * 
 * Note: This is a client-side wrapper. Actual Redis connection will be
 * established on the server-side when backend is implemented.
 */

// ============================================================================
// Redis Configuration
// ============================================================================

export interface RedisConfig {
  host: string
  port: number
  password?: string
  db?: number
  ttl?: number // Default TTL in seconds
  maxRetries?: number
  retryDelay?: number
}

// Default configuration (will be overridden by environment variables)
export const defaultRedisConfig: RedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  ttl: 3600, // 1 hour default
  maxRetries: 3,
  retryDelay: 1000,
}

// ============================================================================
// Redis Client Interface
// ============================================================================

export interface RedisClient {
  get(key: string): Promise<string | null>
  set(key: string, value: string, ttl?: number): Promise<void>
  del(key: string): Promise<void>
  exists(key: string): Promise<boolean>
  expire(key: string, ttl: number): Promise<void>
  incr(key: string): Promise<number>
  decr(key: string): Promise<number>
  keys(pattern: string): Promise<string[]>
  flush(): Promise<void>
}

// ============================================================================
// Client-Side Redis Mock (localStorage-based)
// ============================================================================

/**
 * Client-side Redis mock using localStorage
 * This allows the same interface to work on client and server
 */
class LocalStorageRedisClient implements RedisClient {
  private prefix = 'redis:'

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  async get(key: string): Promise<string | null> {
    try {
      const stored = localStorage.getItem(this.getKey(key))
      if (!stored) return null

      const { value, expires } = JSON.parse(stored)
      
      // Check if expired
      if (expires && Date.now() > expires) {
        await this.del(key)
        return null
      }

      return value
    } catch {
      return null
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      const data = {
        value,
        expires: ttl ? Date.now() + (ttl * 1000) : null
      }
      localStorage.setItem(this.getKey(key), JSON.stringify(data))
    } catch (error) {
      console.error('Failed to set Redis key:', error)
    }
  }

  async del(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.getKey(key))
    } catch (error) {
      console.error('Failed to delete Redis key:', error)
    }
  }

  async exists(key: string): Promise<boolean> {
    const value = await this.get(key)
    return value !== null
  }

  async expire(key: string, ttl: number): Promise<void> {
    const value = await this.get(key)
    if (value) {
      await this.set(key, value, ttl)
    }
  }

  async incr(key: string): Promise<number> {
    const current = await this.get(key)
    const newValue = (parseInt(current || '0', 10) + 1).toString()
    await this.set(key, newValue)
    return parseInt(newValue, 10)
  }

  async decr(key: string): Promise<number> {
    const current = await this.get(key)
    const newValue = Math.max(0, parseInt(current || '0', 10) - 1).toString()
    await this.set(key, newValue)
    return parseInt(newValue, 10)
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      const keys: string[] = []
      const regex = new RegExp(pattern.replace(/\*/g, '.*'))

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(this.prefix)) {
          const cleanKey = key.replace(this.prefix, '')
          if (regex.test(cleanKey)) {
            keys.push(cleanKey)
          }
        }
      }

      return keys
    } catch {
      return []
    }
  }

  async flush(): Promise<void> {
    try {
      const keysToRemove: string[] = []
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(this.prefix)) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error('Failed to flush Redis:', error)
    }
  }
}

// ============================================================================
// Server-Side Redis Client (to be implemented)
// ============================================================================

/**
 * Server-side Redis client using ioredis or similar
 * This will be implemented when backend is added
 */
class ServerRedisClient implements RedisClient {
  // private client: Redis (from 'ioredis')
  
  constructor(config: RedisConfig) {
    // TODO: Initialize Redis client
    // import Redis from 'ioredis'
    // this.client = new Redis(config)
  }

  async get(key: string): Promise<string | null> {
    // return await this.client.get(key)
    throw new Error('Server Redis not yet implemented')
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    // if (ttl) {
    //   await this.client.setex(key, ttl, value)
    // } else {
    //   await this.client.set(key, value)
    // }
    throw new Error('Server Redis not yet implemented')
  }

  async del(key: string): Promise<void> {
    // await this.client.del(key)
    throw new Error('Server Redis not yet implemented')
  }

  async exists(key: string): Promise<boolean> {
    // const result = await this.client.exists(key)
    // return result === 1
    throw new Error('Server Redis not yet implemented')
  }

  async expire(key: string, ttl: number): Promise<void> {
    // await this.client.expire(key, ttl)
    throw new Error('Server Redis not yet implemented')
  }

  async incr(key: string): Promise<number> {
    // return await this.client.incr(key)
    throw new Error('Server Redis not yet implemented')
  }

  async decr(key: string): Promise<number> {
    // return await this.client.decr(key)
    throw new Error('Server Redis not yet implemented')
  }

  async keys(pattern: string): Promise<string[]> {
    // return await this.client.keys(pattern)
    throw new Error('Server Redis not yet implemented')
  }

  async flush(): Promise<void> {
    // await this.client.flushdb()
    throw new Error('Server Redis not yet implemented')
  }
}

// ============================================================================
// Redis Client Factory
// ============================================================================

let redisClient: RedisClient | null = null

export function getRedisClient(config?: RedisConfig): RedisClient {
  if (redisClient) {
    return redisClient
  }

  // Use server-side Redis if available (check for server environment)
  const isServer = typeof window === 'undefined'
  
  if (isServer) {
    // TODO: Initialize server Redis when backend is ready
    // redisClient = new ServerRedisClient(config || defaultRedisConfig)
    // For now, fall back to localStorage
    redisClient = new LocalStorageRedisClient()
  } else {
    // Client-side: use localStorage mock
    redisClient = new LocalStorageRedisClient()
  }

  return redisClient
}

// ============================================================================
// Cache Helpers
// ============================================================================

export interface CacheOptions {
  ttl?: number // Time to live in seconds
  keyPrefix?: string
}

export class Cache {
  private client: RedisClient
  private prefix: string

  constructor(client: RedisClient, prefix: string = 'cache:') {
    this.client = client
    this.prefix = prefix
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(this.getKey(key))
    if (!value) return null
    
    try {
      return JSON.parse(value) as T
    } catch {
      return null
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value)
    await this.client.set(this.getKey(key), serialized, ttl)
  }

  async del(key: string): Promise<void> {
    await this.client.del(this.getKey(key))
  }

  async exists(key: string): Promise<boolean> {
    return await this.client.exists(this.getKey(key))
  }

  async clear(pattern?: string): Promise<void> {
    if (pattern) {
      const keys = await this.client.keys(`${this.prefix}${pattern}`)
      await Promise.all(keys.map(key => this.client.del(key)))
    } else {
      await this.client.flush()
    }
  }
}

// ============================================================================
// Cache Instances
// ============================================================================

export const liveStatsCache = new Cache(getRedisClient(), 'stats:live:')
export const jobsCache = new Cache(getRedisClient(), 'jobs:')
export const contractorCache = new Cache(getRedisClient(), 'contractor:')
export const rateLimitCache = new Cache(getRedisClient(), 'ratelimit:')

// ============================================================================
// Cache Keys
// ============================================================================

export const CacheKeys = {
  liveStats: 'live',
  freshJobs: (territoryId: number) => `fresh:${territoryId}`,
  contractorStats: (userId: string) => `stats:${userId}`,
  rateLimit: (userId: string, endpoint: string) => `${userId}:${endpoint}`,
  session: (sessionId: string) => `session:${sessionId}`,
} as const

