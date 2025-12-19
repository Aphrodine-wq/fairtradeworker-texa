/**
 * API Security Utilities for VOID
 * Rate limiting, input validation, secure token storage
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Rate limiter for API calls
 */
export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetTime) {
    // Create new window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    })
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: now + windowMs,
    }
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetTime,
    }
  }

  entry.count++
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetTime,
  }
}

/**
 * Secure token storage with encryption (simple obfuscation for client-side)
 */
const TOKEN_PREFIX = 'void_secure_'
const TOKEN_STORAGE_KEY = 'void-api-tokens'

interface StoredToken {
  value: string
  expiresAt: number
  service: string
}

// Simple obfuscation (not true encryption, but better than plain text)
function obfuscateToken(token: string): string {
  return btoa(token).split('').reverse().join('')
}

function deobfuscateToken(obfuscated: string): string {
  try {
    return atob(obfuscated.split('').reverse().join(''))
  } catch {
    return ''
  }
}

export function secureTokenStorage() {
  return {
    set(service: string, token: string, expiresAt: number): boolean {
      try {
        const stored = this.getAll()
        stored[service] = {
          value: obfuscateToken(token),
          expiresAt,
          service,
        }
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(stored))
        return true
      } catch (error) {
        console.error('[API Security] Failed to store token:', error)
        return false
      }
    },

    get(service: string): string | null {
      try {
        const stored = this.getAll()
        const entry = stored[service]
        if (!entry) return null

        // Check expiration
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
          this.remove(service)
          return null
        }

        return deobfuscateToken(entry.value)
      } catch (error) {
        console.error('[API Security] Failed to get token:', error)
        return null
      }
    },

    remove(service: string): void {
      try {
        const stored = this.getAll()
        delete stored[service]
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(stored))
      } catch (error) {
        console.error('[API Security] Failed to remove token:', error)
      }
    },

    getAll(): Record<string, StoredToken> {
      try {
        const raw = localStorage.getItem(TOKEN_STORAGE_KEY)
        if (!raw) return {}
        return JSON.parse(raw)
      } catch {
        return {}
      }
    },

    clear(): void {
      try {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
      } catch (error) {
        console.error('[API Security] Failed to clear tokens:', error)
      }
    },
  }
}

/**
 * Validate API request parameters
 */
export function validateAPIRequest(params: {
  endpoint: string
  method?: string
  body?: unknown
}): { valid: boolean; error?: string } {
  // Validate endpoint
  if (typeof params.endpoint !== 'string' || params.endpoint.length === 0) {
    return { valid: false, error: 'Invalid endpoint' }
  }

  // Prevent SSRF - only allow relative URLs or specific domains
  if (params.endpoint.startsWith('http://') || params.endpoint.startsWith('https://')) {
    // Only allow specific trusted domains
    const allowedDomains = [
      'api.spotify.com',
      'accounts.spotify.com',
    ]
    const url = new URL(params.endpoint)
    if (!allowedDomains.includes(url.hostname)) {
      return { valid: false, error: 'Domain not allowed' }
    }
  }

  // Validate method
  if (params.method && !['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(params.method)) {
    return { valid: false, error: 'Invalid HTTP method' }
  }

  // Validate body size
  if (params.body) {
    const bodySize = JSON.stringify(params.body).length
    if (bodySize > 100 * 1024) { // 100KB limit
      return { valid: false, error: 'Request body too large' }
    }
  }

  return { valid: true }
}

/**
 * Sanitize API response data
 */
export function sanitizeAPIResponse(data: unknown): unknown {
  if (typeof data === 'string') {
    // Remove potential script tags and dangerous content
    return data
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .slice(0, 10000) // Limit length
  }

  if (Array.isArray(data)) {
    return data.slice(0, 1000).map(sanitizeAPIResponse) // Limit array size
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized: Record<string, unknown> = {}
    let count = 0
    for (const [key, value] of Object.entries(data)) {
      if (count++ > 100) break // Limit object keys
      if (typeof key === 'string' && key.length < 100) {
        sanitized[key] = sanitizeAPIResponse(value)
      }
    }
    return sanitized
  }

  return data
}

/**
 * Safe API request wrapper with rate limiting and validation
 */
export async function secureAPIRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  // Rate limiting
  const rateLimitKey = `${options.method || 'GET'}:${endpoint}`
  const limit = rateLimit(rateLimitKey, 100, 60000) // 100 requests per minute

  if (!limit.allowed) {
    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((limit.resetAt - Date.now()) / 1000)}s`)
  }

  // Validate request
  const validation = validateAPIRequest({
    endpoint,
    method: options.method,
    body: options.body as unknown,
  })

  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid request')
  }

  // Make request
  const response = await fetch(endpoint, options)

  // Sanitize response if needed
  if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
    // Response will be sanitized when parsed
  }

  return response
}
