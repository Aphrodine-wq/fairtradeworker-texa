# Security Implementation Guide

## Overview

This document outlines the comprehensive security measures implemented in FairTradeWorker to protect against common vulnerabilities and ensure platform stability.

## ✅ Implemented Security Features

### 1. Input Validation & Sanitization

**Location:** `src/lib/security.ts`

**Features:**

- ✅ Zod schema validation for all user inputs
- ✅ XSS protection via input sanitization
- ✅ HTML tag stripping
- ✅ Dangerous character removal
- ✅ Recursive object sanitization

**Usage:**

```typescript
import { sanitizeInput, JobPostSchema } from '@/lib/security'

// Validate input
const result = JobPostSchema.safeParse(userInput)
if (!result.success) {
  // Handle validation errors
}

// Sanitize input
const cleanInput = sanitizeInput(userInput)
```

### 2. Rate Limiting

**Location:** `src/lib/rateLimit.ts`

**Features:**

- ✅ Client-side rate limiting (localStorage-based)
- ✅ Server-side ready (Redis interface)
- ✅ Per-user tier limits (anonymous, authenticated, pro, operator)
- ✅ Per-endpoint limits
- ✅ Automatic cleanup of expired records

**Rate Limits:**

- Anonymous: 30 requests/minute
- Authenticated: 120 requests/minute
- Pro: 300 requests/minute
- Operator: 500 requests/minute

**Endpoint Limits:**

- POST /api/jobs: 10/hour
- POST /api/bids: 50/hour
- POST /api/invoices: 30/hour
- POST /api/messages: 100/hour
- POST /api/contractor/invite: 10/month

**Usage:**

```typescript
import { checkRateLimit } from '@/lib/rateLimit'

const result = checkRateLimit('POST /api/jobs', user)
if (!result.allowed) {
  // Show rate limit error
  console.log(`Try again in ${result.retryAfter} seconds`)
}
```

### 3. File Upload Security

**Location:** `src/lib/security.ts`

**Features:**

- ✅ File type validation
- ✅ File size limits (150MB videos, 10MB images)
- ✅ MIME type verification
- ✅ Extension validation
- ✅ Dangerous file blocking

**Allowed Types:**

- Images: JPEG, PNG, WebP
- Videos: MP4, WebM, QuickTime
- Documents: PDF, XLSX, TXT

**Usage:**

```typescript
import { validateFile } from '@/lib/security'

const validation = validateFile(file, 'image')
if (!validation.valid) {
  // Show error: validation.error
}
```

### 4. Redis Caching (Client-Side Mock)

**Location:** `src/lib/redis.ts`

**Features:**

- ✅ Client-side localStorage-based cache
- ✅ Server-side Redis interface ready
- ✅ TTL support
- ✅ Cache helpers for common use cases
- ✅ Automatic expiration

**Cache Instances:**

- `liveStatsCache` - Live platform statistics
- `jobsCache` - Job listings
- `contractorCache` - Contractor data
- `rateLimitCache` - Rate limit tracking

**Usage:**

```typescript
import { jobsCache } from '@/lib/redis'

// Get cached data
const jobs = await jobsCache.get<Job[]>('fresh:123')

// Set cached data with TTL
await jobsCache.set('fresh:123', jobs, 300) // 5 minutes
```

### 5. Performance Optimizations

**Location:** `src/lib/optimizations.ts`

**Features:**

- ✅ Debouncing for search inputs
- ✅ Throttling for scroll events
- ✅ Memoization for expensive computations
- ✅ Lazy loading for images
- ✅ Intersection Observer for components
- ✅ Request batching
- ✅ Virtual scrolling helpers
- ✅ Performance monitoring

**Usage:**

```typescript
import { useDebounce, useThrottle, useLazyImage } from '@/lib/optimizations'

// Debounced search
const debouncedSearch = useDebounce(searchTerm, 300)

// Throttled scroll handler
const handleScroll = useThrottle(() => {
  // Handle scroll
}, 100)

// Lazy load image
const { src, loading, error } = useLazyImage(imageUrl)
```

### 6. Security Headers

**Location:** `src/lib/security.ts`

**Headers Implemented:**

- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy: geolocation=(), microphone=(), camera=()
- ✅ Content-Security-Policy: Comprehensive CSP rules

### 7. Secure Request Wrapper

**Location:** `src/lib/securityMiddleware.ts`

**Features:**

- ✅ Automatic rate limiting
- ✅ Input sanitization
- ✅ File validation
- ✅ Error handling
- ✅ React hooks for easy integration

**Usage:**

```typescript
import { secureRequest, useSecureRequest } from '@/lib/securityMiddleware'

// Direct usage
const result = await secureRequest({
  endpoint: '/api/jobs',
  method: 'POST',
  body: jobData,
  user: currentUser,
  validateRateLimit: true,
  sanitizeInput: true
})

// React hook
const { execute, loading, error, data } = useSecureRequest()
await execute({ endpoint: '/api/jobs', method: 'POST', body: jobData })
```

## 🔒 Security Best Practices

### 1. Always Validate Input

```typescript
// ✅ Good
const result = JobPostSchema.safeParse(userInput)
if (!result.success) {
  return { error: result.error }
}

// ❌ Bad
const job = { ...userInput } // No validation
```

### 2. Always Sanitize User-Generated Content

```typescript
// ✅ Good
const cleanDescription = sanitizeInput(job.description)

// ❌ Bad
<div dangerouslySetInnerHTML={{ __html: job.description }} />
```

### 3. Always Check Rate Limits

```typescript
// ✅ Good
const rateLimit = checkRateLimit('POST /api/jobs', user)
if (!rateLimit.allowed) {
  return { error: 'Rate limit exceeded' }
}

// ❌ Bad
await createJob(jobData) // No rate limit check
```

### 4. Always Validate Files

```typescript
// ✅ Good
const validation = validateFile(file, 'image')
if (!validation.valid) {
  return { error: validation.error }
}

// ❌ Bad
await uploadFile(file) // No validation
```

## 🚀 Next Steps (Server-Side Implementation)

### 1. Redis Integration

When implementing server-side:

1. Install Redis client:

```bash
npm install ioredis
```

1. Update `src/lib/redis.ts`:

```typescript
import Redis from 'ioredis'

class ServerRedisClient implements RedisClient {
  private client: Redis
  
  constructor(config: RedisConfig) {
    this.client = new Redis(config)
  }
  // ... implement methods
}
```

1. Set environment variables:

```env
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-password
REDIS_DB=0
```

### 2. Server-Side Rate Limiting

Implement Redis-based rate limiting on your API server:

```typescript
import { RedisRateLimiterImpl } from '@/lib/rateLimit'

const rateLimiter = new RedisRateLimiterImpl()

app.post('/api/jobs', async (req, res) => {
  const result = await rateLimiter.checkLimit(
    req.user?.id || null,
    'POST /api/jobs',
    ENDPOINT_LIMITS['POST /api/jobs']
  )
  
  if (!result.allowed) {
    return res.status(429).json({ error: 'Rate limit exceeded' })
  }
  
  // Process request
})
```

### 3. Security Headers Middleware

Add security headers to your server:

```typescript
import { securityHeaders } from '@/lib/security'

app.use((req, res, next) => {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
  next()
})
```

## 📊 Monitoring & Alerting

### Key Metrics to Monitor

1. **Rate Limit Violations**
   - Track how many requests are blocked
   - Alert if violation rate > 5%

2. **Security Errors**
   - Track validation failures
   - Track file upload rejections
   - Alert on suspicious patterns

3. **Performance Metrics**
   - Track API response times
   - Monitor cache hit rates
   - Alert if response time > 500ms

### Recommended Tools

- **Sentry**: Error tracking and monitoring
- **Grafana**: Metrics visualization
- **CloudFlare**: DDoS protection and rate limiting at edge
- **Vercel Analytics**: Performance monitoring

## 🧪 Testing Security

### Unit Tests

```typescript
import { sanitizeInput, validateFile } from '@/lib/security'

test('sanitizeInput removes XSS', () => {
  const input = '<script>alert("xss")</script>Hello'
  const output = sanitizeInput(input)
  expect(output).toBe('Hello')
})

test('validateFile rejects large files', () => {
  const file = new File(['x'.repeat(200 * 1024 * 1024)], 'large.jpg')
  const result = validateFile(file, 'image')
  expect(result.valid).toBe(false)
})
```

### Integration Tests

```typescript
import { checkRateLimit } from '@/lib/rateLimit'

test('rate limit blocks excessive requests', async () => {
  for (let i = 0; i < 11; i++) {
    const result = checkRateLimit('POST /api/jobs', user)
    if (i < 10) {
      expect(result.allowed).toBe(true)
    } else {
      expect(result.allowed).toBe(false)
    }
  }
})
```

## 📝 Checklist

- [x] Input validation schemas
- [x] Input sanitization
- [x] XSS protection
- [x] File upload validation
- [x] Rate limiting (client-side)
- [x] Redis interface (ready for server)
- [x] Security headers
- [x] Performance optimizations
- [x] Secure request wrapper
- [ ] Server-side Redis implementation
- [ ] Server-side rate limiting
- [ ] Security headers middleware
- [ ] Monitoring setup
- [ ] Security audit

## 🔗 Related Documentation

- [Scaling to 300K Users](./SCALING_300K_USERS.md)
- [Implementation Status](./IMPLEMENTATION_STATUS.md)
- [Security Best Practices](https://owasp.org/www-project-top-ten/)
