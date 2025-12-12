# Scaling FairTradeWorker to 300,000 Users - First Year Infrastructure Plan

## Executive Summary

This document outlines the comprehensive infrastructure, performance optimizations, and operational strategies required to scale FairTradeWorker from 0 to 300,000 users in the first year while maintaining <100ms interaction speeds and 99.9% uptime.

### Growth Projections

**Year 1 User Growth Trajectory:**
- Month 1-3: 0 → 5,000 users (viral seeding phase)
- Month 4-6: 5,000 → 25,000 users (growth acceleration)
- Month 7-9: 25,000 → 100,000 users (viral scaling)
- Month 10-12: 100,000 → 300,000 users (mainstream adoption)

**Daily Active Users (DAU) at Scale:**
- 300,000 total users
- ~40% DAU ratio = 120,000 daily active users
- Peak concurrent users: ~15,000 (assuming 12.5% concurrent during peak hours)

**Transaction Volume Estimates:**
- Jobs posted per day: 1,000+ (target from README)
- Bids per day: ~5,000 (5x jobs)
- Messages per day: ~10,000
- Invoice creations per day: ~400
- Photo uploads per day: ~3,000 (avg 3 per job)
- Video uploads per week: ~2,000

---

## 1. Infrastructure Architecture

### 1.1 Current State
- **Frontend**: React 19 + Vite (static hosting)
- **Storage**: Spark KV (GitHub's distributed key-value store)
- **Assets**: Local file storage
- **API**: Simulated AI services

### 1.2 Scaled Architecture (300k Users)

```
┌─────────────────────────────────────────────────────────────┐
│                      CDN Layer                               │
│  CloudFlare / AWS CloudFront                                │
│  - Static assets (JS, CSS, images)                          │
│  - Edge caching for common API responses                    │
│  - DDoS protection                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Load Balancer                              │
│  AWS ALB / Nginx                                            │
│  - SSL termination                                          │
│  - Health checks                                            │
│  - Auto-scaling triggers                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Application Servers (Auto-scaled)               │
│  Node.js / Docker Containers                                │
│  - 4-16 instances (based on load)                           │
│  - CPU-optimized for React SSR (if needed)                  │
│  - Stateless design                                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────┬──────────────────┬──────────────────────┐
│   Spark KV       │   PostgreSQL     │   Redis Cache        │
│  (Primary Data)  │  (Relational)    │  (Session/Hot Data)  │
│                  │                  │                      │
│  - Users         │  - Analytics     │  - Active sessions   │
│  - Jobs          │  - Aggregates    │  - Live stats        │
│  - Bids          │  - Reports       │  - Job feed cache    │
│  - Invoices      │                  │  - Rate limiting     │
└──────────────────┴──────────────────┴──────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Storage & Services                          │
│                                                             │
│  AWS S3 / R2              OpenAI API          Twilio SMS    │
│  - Photos (150GB/mo)      - Job scoping       - Invites     │
│  - Videos (500GB/mo)      - AI analysis       - Alerts      │
│  - Invoices PDFs          - Transcription                   │
│                                                             │
│  SendGrid Email           Trueway API         Stripe        │
│  - Notifications          - Routing           - Payments    │
│  - Invites                - Drive times       - Subscriptions│
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Data Storage & Database Strategy

### 2.1 Spark KV Optimization

**Current Usage:**
- All data stored in Spark KV (distributed key-value store)
- Keys: `users`, `jobs`, `bids`, `invoices`, `territories`, etc.

**Scaling Spark KV for 300k Users:**

```typescript
// Partition large datasets by date/region
// Instead of: useKV<Job[]>("jobs", [])
// Use partitioned keys:
useKV<Job[]>("jobs:2025-12", []) // Monthly partitions
useKV<Job[]>("jobs:territory:148", []) // Territory partitions
useKV<Job[]>("jobs:active", []) // Hot data separate from archive

// Index strategies
useKV<string[]>("jobs:by-homeowner:user123", []) // Job IDs only
useKV<string[]>("bids:by-contractor:user456", []) // Bid IDs only
```

**Key Optimization Strategies:**
1. **Partition by Time**: Monthly/weekly partitions for jobs, bids
2. **Partition by Geography**: Territory-based partitions (254 Texas counties)
3. **Hot/Cold Separation**: Active jobs vs completed/archived
4. **Index Keys**: Store IDs in index keys, fetch full objects on-demand
5. **Compression**: Enable compression for large text fields (AI scopes, descriptions)

**Estimated Storage Needs (Year 1):**
- Users: 300,000 × 2KB = 600 MB
- Jobs: 365,000 jobs × 10KB = 3.65 GB
- Bids: 1,825,000 bids × 1KB = 1.8 GB
- Invoices: 146,000 × 5KB = 730 MB
- Photos metadata: 1,095,000 × 0.5KB = 547 MB
- **Total KV Storage**: ~7.5 GB (well within Spark KV limits)

### 2.2 Supplementary PostgreSQL Database

For analytics and complex queries that don't fit KV model:

```sql
-- Materialized views for dashboards
CREATE MATERIALIZED VIEW territory_metrics AS
SELECT 
  territory_id,
  COUNT(DISTINCT contractor_id) as active_contractors,
  COUNT(DISTINCT job_id) as total_jobs,
  AVG(EXTRACT(EPOCH FROM (first_bid_at - job_posted_at))/60) as avg_bid_time_minutes,
  COUNT(CASE WHEN payout_date = job_completed_date THEN 1 END) as same_day_payouts
FROM jobs_analytics
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY territory_id;

-- Refresh every 15 minutes
CREATE INDEX idx_territory_metrics_territory_id ON territory_metrics(territory_id);
```

**Use Cases for PostgreSQL:**
- Operator dashboard aggregates (territory metrics)
- Financial reporting and reconciliation
- Complex analytics queries (win rate by job type, time series)
- Audit logs and compliance data
- Data warehouse for business intelligence

### 2.3 Redis Caching Layer

```typescript
// Cache hot data for sub-10ms access
interface CacheStrategy {
  liveStats: {
    key: "stats:live",
    ttl: 60, // 1 minute
    data: {
      jobsPostedToday: number;
      avgBidTimeMinutes: number;
      completedThisWeek: number;
    }
  };
  
  freshJobs: {
    key: "jobs:fresh:{territoryId}",
    ttl: 300, // 5 minutes
    data: Job[]; // Only fresh jobs (<15 min old, no bids)
  };
  
  contractorStats: {
    key: "contractor:stats:{userId}",
    ttl: 600, // 10 minutes
    data: {
      winRate: number;
      avgResponseTime: number;
      totalEarnings: number;
    }
  };
  
  rateLimits: {
    key: "ratelimit:{userId}:{action}",
    ttl: 3600, // 1 hour rolling window
    data: number; // Request count
  };
}
```

**Redis Memory Estimate:**
- Live stats: 1 KB × 1 = 1 KB
- Fresh jobs cache: 10 KB × 254 territories = 2.5 MB
- Contractor stats: 2 KB × 10,000 active = 20 MB
- Session data: 5 KB × 15,000 concurrent = 75 MB
- Rate limiting: 1 KB × 50,000 active/hour = 50 MB
- **Total Redis**: ~150 MB (use 1GB instance for headroom)

---

## 3. File Storage & CDN

### 3.1 Object Storage (AWS S3 / Cloudflare R2)

**Photo Storage:**
- Original photos: 1,095,000 × 2MB avg = 2.19 TB/year
- Thumbnails (300px): 1,095,000 × 50KB = 54.75 GB
- Thumbnails (800px): 1,095,000 × 200KB = 219 GB
- **Total photos**: ~2.46 TB/year

**Video Storage:**
- Videos: 104,000 × 25MB avg = 2.6 TB/year
- Transcoded (720p): 104,000 × 10MB = 1.04 TB
- Thumbnails: 104,000 × 5 frames × 50KB = 26 GB
- **Total videos**: ~3.66 TB/year

**Document Storage:**
- Invoice PDFs: 146,000 × 100KB = 14.6 GB
- Certificates: 10,000 contractors × 5 docs × 500KB = 25 GB
- **Total documents**: ~40 GB

**Total Storage Need**: ~6.2 TB/year
**Cost Estimate (S3)**: $142/month storage + $90/month transfer = $232/month

### 3.2 CDN Configuration

**CloudFlare R2 + CDN Strategy:**

```typescript
// Image optimization at edge
const imageUrl = `https://cdn.fairtradeworker.com/photos/${jobId}/${photoId}`;
// Auto-format: WebP for modern browsers, JPEG fallback
// Auto-resize: ?w=800&h=600&fit=cover
// Auto-quality: ?q=85 (default)
// Cache: 1 year for photos (immutable), 1 day for thumbnails

// Video streaming
const videoUrl = `https://cdn.fairtradeworker.com/videos/${jobId}/${videoId}`;
// HLS streaming for adaptive bitrate
// Cache: 1 week for video chunks
// Edge locations: US-focused (Dallas, Houston, Austin, San Antonio)
```

**CDN Cache Hit Ratio Target**: 95%+
- Static assets (JS/CSS): 99% hit ratio
- Photos: 90% hit ratio (high repeat views on job pages)
- Videos: 70% hit ratio (lower repeat views)

**Bandwidth Estimates:**
- Photos: 120,000 DAU × 20 photos/day × 200KB = 480 GB/day
- Videos: 20,000 video views/day × 10MB = 200 GB/day
- Static assets: 120,000 DAU × 5MB = 600 GB/day
- **Total**: ~1.3 TB/day → 39 TB/month
- **Cost**: CloudFlare R2 free egress + $0.36/GB storage = ~$2,200/month

---

## 4. Performance Optimizations

### 4.1 Frontend Performance

**Bundle Size Optimization:**
```json
// vite.config.ts
{
  "build": {
    "rollupOptions": {
      "output": {
        "manualChunks": {
          "react-vendor": ["react", "react-dom"],
          "ui-vendor": ["@radix-ui/react-*"],
          "charts": ["recharts", "d3"],
          "forms": ["react-hook-form", "zod"],
          "motion": ["framer-motion"]
        }
      }
    },
    "chunkSizeWarningLimit": 500,
    "minify": "terser",
    "terserOptions": {
      "compress": {
        "drop_console": true,
        "drop_debugger": true
      }
    }
  }
}
```

**Code Splitting Strategy:**
```typescript
// Lazy load heavy components
const ContractorDashboard = lazy(() => import('./pages/ContractorDashboard'));
const InvoiceManager = lazy(() => import('./components/contractor/InvoiceManager'));
const TerritoryMap = lazy(() => import('./components/territory/TerritoryMap'));

// Prefetch on hover
<Link 
  to="/contractor/dashboard" 
  onMouseEnter={() => prefetchRoute('/contractor/dashboard')}
>
  Dashboard
</Link>
```

**Image Optimization:**
```typescript
// Use next-gen formats
<picture>
  <source srcSet={`${photo.url}?format=avif`} type="image/avif" />
  <source srcSet={`${photo.url}?format=webp`} type="image/webp" />
  <img src={`${photo.url}?format=jpg`} alt={photo.alt} loading="lazy" />
</picture>

// Lazy load below fold
import { lazyLoadImage } from '@/lib/performance';
useEffect(() => {
  const images = document.querySelectorAll('img[data-src]');
  images.forEach(lazyLoadImage);
}, []);
```

### 4.2 API Performance

**Request Batching:**
```typescript
// Batch multiple requests into one
const batchFetch = async (requests: Request[]) => {
  const results = await fetch('/api/batch', {
    method: 'POST',
    body: JSON.stringify(requests),
  });
  return results.json();
};

// Example: Load contractor dashboard
const dashboardData = await batchFetch([
  { endpoint: '/api/jobs/active', params: { contractorId } },
  { endpoint: '/api/bids/pending', params: { contractorId } },
  { endpoint: '/api/invoices/recent', params: { contractorId } },
  { endpoint: '/api/stats/contractor', params: { contractorId } },
]);
```

**GraphQL for Flexible Queries:**
```graphql
# Single request for complete job details
query JobDetails($jobId: ID!) {
  job(id: $jobId) {
    id
    title
    description
    aiScope {
      scope
      priceLow
      priceHigh
      materials
      confidenceScore
    }
    homeowner {
      id
      fullName
      # Only fetch what's needed
    }
    bids(status: PENDING, limit: 10) {
      id
      amount
      contractor {
        id
        fullName
        performanceScore
        isPro
      }
    }
  }
}
```

### 4.3 Database Query Optimization

**Spark KV Query Patterns:**
```typescript
// ❌ Bad: Load all jobs, filter in memory
const [allJobs] = useKV<Job[]>("jobs", []);
const freshJobs = allJobs.filter(job => 
  job.size === 'small' && 
  job.bids.length === 0 &&
  Date.now() - new Date(job.createdAt).getTime() < 15 * 60 * 1000
);

// ✅ Good: Use indexed partitions
const [freshSmallJobs] = useKV<Job[]>("jobs:fresh:small", []);
// Background worker maintains this index every minute

// ❌ Bad: N+1 query problem
const contractorIds = bids.map(b => b.contractorId);
const contractors = await Promise.all(
  contractorIds.map(id => fetchContractor(id))
);

// ✅ Good: Batch fetch
const contractors = await fetchContractorsBatch(contractorIds);
```

**Caching Strategy:**
```typescript
// Implement stale-while-revalidate
const useCachedKV = <T>(key: string, defaultValue: T, ttl: number = 60000) => {
  const [data, setData] = useKV<T>(key, defaultValue);
  const [cached, setCached] = useState<T>(defaultValue);
  const lastFetch = useRef<number>(0);
  
  useEffect(() => {
    const now = Date.now();
    if (now - lastFetch.current > ttl) {
      // Return stale data immediately, fetch in background
      setCached(data);
      lastFetch.current = now;
    }
  }, [data, ttl]);
  
  return cached;
};
```

---

## 5. Rate Limiting & Security

### 5.1 API Rate Limiting

```typescript
// Rate limit configuration by user type
const RATE_LIMITS = {
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
};

// Specific endpoint limits
const ENDPOINT_LIMITS = {
  'POST /api/jobs': { max: 10, window: 3600000 }, // 10 jobs/hour
  'POST /api/bids': { max: 50, window: 3600000 }, // 50 bids/hour
  'POST /api/invoices': { max: 30, window: 3600000 }, // 30 invoices/hour
  'POST /api/messages': { max: 100, window: 3600000 }, // 100 messages/hour
  'POST /api/contractor/invite': { max: 10, window: 2592000000 }, // 10/month
};

// Implement with Redis
async function checkRateLimit(userId: string, endpoint: string): Promise<boolean> {
  const key = `ratelimit:${userId}:${endpoint}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, ENDPOINT_LIMITS[endpoint].window / 1000);
  }
  
  return count <= ENDPOINT_LIMITS[endpoint].max;
}
```

### 5.2 DDoS Protection

**CloudFlare Configuration:**
- Enable "Under Attack Mode" during traffic spikes
- Challenge pages for suspicious traffic
- Rate limiting at edge (100 req/10s per IP)
- Bot detection and filtering
- Firewall rules for known attack patterns

### 5.3 Data Validation & Sanitization

```typescript
// Input validation with Zod
import { z } from 'zod';

const JobPostSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(20).max(5000),
  photos: z.array(z.string().url()).max(20),
  mediaUrl: z.string().url().optional(),
  territoryId: z.number().int().min(1).max(254),
});

// Sanitize user input
import DOMPurify from 'isomorphic-dompurify';

function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Strip all HTML
    ALLOWED_ATTR: [],
  });
}
```

---

## 6. Monitoring & Alerting

### 6.1 Application Monitoring

**Key Metrics to Track:**
```typescript
// Performance metrics
const metrics = {
  // Response times
  'api.response_time.p50': { threshold: 100, unit: 'ms' },
  'api.response_time.p95': { threshold: 500, unit: 'ms' },
  'api.response_time.p99': { threshold: 1000, unit: 'ms' },
  
  // Error rates
  'api.error_rate': { threshold: 1, unit: '%' },
  'api.5xx_rate': { threshold: 0.1, unit: '%' },
  
  // Throughput
  'api.requests_per_second': { threshold: 1000, unit: 'req/s' },
  'jobs.posts_per_minute': { threshold: 10, unit: 'jobs/min' },
  
  // Infrastructure
  'server.cpu_usage': { threshold: 80, unit: '%' },
  'server.memory_usage': { threshold: 85, unit: '%' },
  'database.connection_pool': { threshold: 90, unit: '%' },
  'cache.hit_ratio': { threshold: 85, unit: '%', invert: true },
  
  // Business metrics
  'users.signup_rate': { threshold: 100, unit: 'users/hour' },
  'jobs.completion_rate': { threshold: 70, unit: '%' },
  'bids.response_time': { threshold: 15, unit: 'minutes' },
};
```

**Alerting Thresholds:**
```yaml
# alerts.yml
alerts:
  - name: High API Error Rate
    condition: error_rate > 5%
    duration: 5m
    severity: critical
    notify: [pagerduty, slack]
    
  - name: Slow Response Times
    condition: p95_response_time > 1000ms
    duration: 10m
    severity: warning
    notify: [slack]
    
  - name: High CPU Usage
    condition: cpu_usage > 90%
    duration: 5m
    severity: warning
    notify: [slack]
    
  - name: Database Connection Pool Exhausted
    condition: db_connections > 95%
    duration: 2m
    severity: critical
    notify: [pagerduty, slack]
    
  - name: Cache Hit Ratio Low
    condition: cache_hit_ratio < 70%
    duration: 15m
    severity: info
    notify: [slack]
```

### 6.2 Real-time Dashboards

**Grafana Dashboard Panels:**
1. **Traffic Overview**
   - Requests per second (line chart)
   - Active users (gauge)
   - Error rate (line chart with threshold)

2. **Performance**
   - Response time percentiles (P50, P95, P99)
   - Slow endpoints (bar chart)
   - Database query times

3. **Business Metrics**
   - Jobs posted (hourly/daily)
   - Bids submitted
   - Invoices created
   - Referral conversions

4. **Infrastructure**
   - CPU/Memory/Disk usage per server
   - Database connections
   - Cache hit ratios
   - CDN bandwidth

### 6.3 Error Tracking

**Sentry Configuration:**
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  
  // Ignore common errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
  
  // Group similar errors
  beforeSend(event) {
    // Scrub sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.Authorization;
    }
    return event;
  },
  
  // Release tracking
  release: process.env.RELEASE_VERSION,
});
```

---

## 7. Auto-Scaling Configuration

### 7.1 Horizontal Scaling Rules

**AWS Auto Scaling Group:**
```yaml
# autoscaling-config.yml
scaling:
  min_instances: 4
  max_instances: 32
  desired_capacity: 8
  
  scale_up_policies:
    - name: CPU_High
      metric: CPUUtilization
      threshold: 70%
      duration: 5 minutes
      action: add 2 instances
      cooldown: 300 seconds
      
    - name: Request_Rate_High
      metric: RequestCountPerTarget
      threshold: 1000 requests/target
      duration: 3 minutes
      action: add 4 instances
      cooldown: 180 seconds
      
    - name: Response_Time_High
      metric: TargetResponseTime
      threshold: 500ms
      duration: 5 minutes
      action: add 2 instances
      cooldown: 300 seconds
  
  scale_down_policies:
    - name: CPU_Low
      metric: CPUUtilization
      threshold: 30%
      duration: 10 minutes
      action: remove 1 instance
      cooldown: 600 seconds
```

### 7.2 Database Connection Pooling

```typescript
// PostgreSQL connection pool
const pool = new Pool({
  max: 20, // Maximum connections per instance
  min: 5, // Minimum idle connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  
  // For 8 instances: 8 × 20 = 160 max connections
  // Leave headroom: Database should support 200+ connections
});

// Connection health check
setInterval(async () => {
  try {
    await pool.query('SELECT 1');
  } catch (error) {
    logger.error('Database connection pool unhealthy', error);
    metrics.increment('database.connection_error');
  }
}, 30000);
```

---

## 8. Backup & Disaster Recovery

### 8.1 Backup Strategy

**Spark KV Backups:**
```bash
# Daily full backups
0 2 * * * /scripts/backup-spark-kv.sh

# Hourly incremental backups
0 * * * * /scripts/backup-spark-kv-incremental.sh

# Retention policy:
# - Daily backups: 30 days
# - Weekly backups: 12 weeks
# - Monthly backups: 12 months
```

**PostgreSQL Backups:**
```bash
# Continuous archiving (WAL shipping)
wal_level = replica
archive_mode = on
archive_command = 'aws s3 cp %p s3://ftw-backups/wal/%f'

# Point-in-time recovery window: 7 days
# Full backup: Daily at 2 AM
# Transaction logs: Continuous
```

**S3 Backup:**
```yaml
# S3 versioning enabled
bucket: ftw-media
versioning: enabled
lifecycle_rules:
  - id: archive-old-versions
    status: enabled
    noncurrent_version_transitions:
      - days: 30
        storage_class: GLACIER
  - id: delete-old-versions
    status: enabled
    noncurrent_version_expiration:
      days: 90
```

### 8.2 Disaster Recovery Plan

**Recovery Time Objective (RTO)**: 4 hours
**Recovery Point Objective (RPO)**: 1 hour

**Failover Procedures:**
1. **Database Failover**: 
   - Primary failure detected → automatic failover to replica
   - DNS update via Route53 health checks
   - Time: <5 minutes

2. **Application Failover**:
   - Multi-region deployment (primary: us-east-1, backup: us-west-2)
   - Route53 health checks monitor primary region
   - Automatic traffic routing to backup
   - Time: <10 minutes

3. **Data Recovery**:
   - Restore from most recent backup
   - Replay transaction logs to desired point
   - Time: 1-4 hours depending on data size

---

## 9. Cost Optimization

### 9.1 Infrastructure Costs (300k Users)

**Monthly Cost Breakdown:**

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| **Compute** | 8× EC2 t3.large (on-demand) | $592 |
| **Compute** | 16× EC2 t3.large (reserved, avg usage) | $474 |
| **Load Balancer** | AWS ALB | $25 |
| **Spark KV** | GitHub Spark (10GB) | $0 (included) |
| **PostgreSQL** | AWS RDS db.r5.large (Multi-AZ) | $350 |
| **Redis** | AWS ElastiCache cache.r5.large | $175 |
| **S3 Storage** | 6.5 TB | $150 |
| **S3 Transfer** | 40 TB/month | $3,600 |
| **CloudFlare R2** | 6.5 TB storage + 40 TB egress | $2,200 |
| **CDN** | CloudFlare Pro | $20 |
| **Monitoring** | Datadog (300k users) | $400 |
| **Error Tracking** | Sentry (300k users) | $100 |
| **SMS** | Twilio (10k messages/month) | $80 |
| **Email** | SendGrid (100k emails/month) | $15 |
| **OpenAI API** | 1M tokens/day | $600 |
| **Stripe** | 2.9% + $0.30 per transaction | Variable |
| **Backups** | S3 Glacier | $50 |
| **Domain & SSL** | Route53 + ACM | $10 |
| | **Total (excl. Stripe)** | **~$8,841/month** |

**Cost Optimization Strategies:**
1. **Use CloudFlare R2 instead of S3**: Save $1,400/month on egress fees
2. **Reserved Instances**: Save 40% on predictable compute ($237/month saved)
3. **Spot Instances** for batch jobs: Save 70% on video transcoding
4. **Compress images**: Reduce storage and bandwidth by 60%
5. **Cache aggressively**: Reduce database queries by 80%

**Revised Monthly Cost**: ~$7,000/month at 300k users

### 9.2 Revenue Requirements

**To cover $7,000/month infrastructure:**
- 300 Pro contractors @ $39/month = $11,700/month ✅
- 15% Pro conversion rate achievable (see PRD)
- Additional revenue from Bid Boost, Materials, FTW Verified
- **Profitability**: Achievable at scale with Pro adoption

---

## 10. Deployment & CI/CD

### 10.1 Deployment Pipeline

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]
    
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: npm run build
      - run: docker build -t ftw:${{ github.sha }} .
      - run: docker push ftw:${{ github.sha }}
      
  deploy-canary:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: kubectl set image deployment/ftw ftw=ftw:${{ github.sha }}
      - run: kubectl rollout status deployment/ftw --watch --timeout=10m
      - run: ./scripts/smoke-test.sh
      
  deploy-production:
    needs: deploy-canary
    runs-on: ubuntu-latest
    steps:
      - run: kubectl scale deployment/ftw --replicas=8
      - run: ./scripts/gradual-rollout.sh # 25% → 50% → 100% over 30 min
      - run: ./scripts/monitor-rollout.sh
      
  rollback:
    if: failure()
    runs-on: ubuntu-latest
    steps:
      - run: kubectl rollout undo deployment/ftw
      - run: ./scripts/notify-team.sh "Deployment failed, rolled back"
```

### 10.2 Blue-Green Deployment

```bash
# Zero-downtime deployment strategy
# 1. Deploy new version (green) alongside old (blue)
kubectl apply -f k8s/deployment-green.yml

# 2. Wait for green to be healthy
kubectl wait --for=condition=ready pod -l version=green

# 3. Run smoke tests on green
./scripts/smoke-test.sh https://green.internal.ftw.com

# 4. Switch traffic from blue to green (instant cutover)
kubectl patch service ftw -p '{"spec":{"selector":{"version":"green"}}}'

# 5. Monitor for 10 minutes
sleep 600
./scripts/health-check.sh

# 6. If healthy, scale down blue; if not, rollback
if [ $? -eq 0 ]; then
  kubectl scale deployment/ftw-blue --replicas=0
else
  kubectl patch service ftw -p '{"spec":{"selector":{"version":"blue"}}}'
fi
```

---

## 11. Security Measures

### 11.1 Infrastructure Security

**Network Security:**
```yaml
# Security groups
security_groups:
  web_tier:
    ingress:
      - port: 443 (HTTPS)
        source: 0.0.0.0/0
      - port: 80 (HTTP, redirect to HTTPS)
        source: 0.0.0.0/0
    egress:
      - port: all
        destination: app_tier
        
  app_tier:
    ingress:
      - port: 3000
        source: web_tier
    egress:
      - port: 5432 (PostgreSQL)
        destination: db_tier
      - port: 6379 (Redis)
        destination: cache_tier
      - port: 443 (outbound API calls)
        destination: 0.0.0.0/0
        
  db_tier:
    ingress:
      - port: 5432
        source: app_tier
    egress: none
```

**Encryption:**
- Data in transit: TLS 1.3 for all connections
- Data at rest: AES-256 encryption for databases and S3
- Secrets management: AWS Secrets Manager / HashiCorp Vault

### 11.2 Application Security

**Authentication & Authorization:**
```typescript
// JWT token with short expiration
const token = jwt.sign(
  { userId, role, email },
  process.env.JWT_SECRET,
  { expiresIn: '15m' }
);

// Refresh token for long sessions
const refreshToken = jwt.sign(
  { userId },
  process.env.REFRESH_SECRET,
  { expiresIn: '7d' }
);

// Role-based access control
const canAccessEndpoint = (user: User, endpoint: string) => {
  const permissions = {
    homeowner: ['/api/jobs/post', '/api/jobs/my', '/api/bids/view'],
    contractor: ['/api/jobs/browse', '/api/bids/submit', '/api/invoices'],
    operator: ['/api/territories', '/api/metrics', '/api/admin'],
  };
  return permissions[user.role].some(p => endpoint.startsWith(p));
};
```

**SQL Injection Prevention:**
```typescript
// Always use parameterized queries
const result = await db.query(
  'SELECT * FROM jobs WHERE homeowner_id = $1 AND status = $2',
  [userId, status]
);

// Never concatenate user input
// ❌ BAD: `SELECT * FROM jobs WHERE title = '${userInput}'`
```

**XSS Prevention:**
```typescript
// Sanitize all user input before storing
import DOMPurify from 'isomorphic-dompurify';

function sanitizeJobDescription(description: string): string {
  return DOMPurify.sanitize(description, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
    ALLOWED_ATTR: [],
  });
}

// Set Content Security Policy headers
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'https://cdn.fairtradeworker.com'],
    connectSrc: ["'self'", 'https://api.fairtradeworker.com'],
  }
}));
```

---

## 12. Implementation Timeline

### Phase 1: Foundation (Months 1-3, 0-5k users)
**Goal**: Establish core infrastructure

- [ ] Week 1-2: Set up AWS/CloudFlare accounts
- [ ] Week 3-4: Deploy basic infrastructure (ALB, EC2, RDS)
- [ ] Week 5-6: Implement CloudFlare CDN and R2 storage
- [ ] Week 7-8: Set up monitoring (Datadog, Sentry)
- [ ] Week 9-10: Implement CI/CD pipeline
- [ ] Week 11-12: Load testing and optimization

**Infrastructure**: 2-4 instances, basic monitoring, manual scaling

### Phase 2: Growth (Months 4-6, 5k-25k users)
**Goal**: Enable auto-scaling and optimization

- [ ] Week 13-14: Implement auto-scaling groups
- [ ] Week 15-16: Set up Redis caching layer
- [ ] Week 17-18: Implement rate limiting
- [ ] Week 19-20: Optimize database queries and indexes
- [ ] Week 21-22: Set up blue-green deployment
- [ ] Week 23-24: Implement advanced monitoring dashboards

**Infrastructure**: 4-8 instances, auto-scaling, Redis cache

### Phase 3: Scale (Months 7-9, 25k-100k users)
**Goal**: Handle rapid growth

- [ ] Week 25-26: Implement CDN optimizations
- [ ] Week 27-28: Database partitioning and sharding
- [ ] Week 29-30: GraphQL API implementation
- [ ] Week 31-32: Multi-region deployment setup
- [ ] Week 33-34: Advanced caching strategies
- [ ] Week 35-36: Performance optimization sprint

**Infrastructure**: 8-16 instances, multi-region, advanced caching

### Phase 4: Optimize (Months 10-12, 100k-300k users)
**Goal**: Cost optimization and reliability

- [ ] Week 37-38: Cost analysis and optimization
- [ ] Week 39-40: Implement reserved instances
- [ ] Week 41-42: Database read replicas
- [ ] Week 43-44: Advanced security audit
- [ ] Week 45-46: Disaster recovery testing
- [ ] Week 47-48: Final performance tuning

**Infrastructure**: 16-32 instances, full redundancy, optimized costs

---

## 13. Success Metrics

### 13.1 Performance Targets

- **Page Load Time**: <1 second (P95)
- **API Response Time**: <100ms (P50), <500ms (P95)
- **Job Posting Time**: <60 seconds end-to-end
- **Photo Upload**: <3 seconds per photo
- **Video Upload**: <30 seconds for 25MB video
- **Uptime**: 99.9% (43 minutes downtime/month max)

### 13.2 Scaling Targets

| Metric | Month 3 | Month 6 | Month 9 | Month 12 |
|--------|---------|---------|---------|----------|
| Total Users | 5,000 | 25,000 | 100,000 | 300,000 |
| DAU | 2,000 | 10,000 | 40,000 | 120,000 |
| Peak Concurrent | 250 | 1,250 | 5,000 | 15,000 |
| Jobs/Day | 50 | 200 | 500 | 1,000+ |
| Bids/Day | 250 | 1,000 | 2,500 | 5,000+ |
| Photos/Day | 150 | 600 | 1,500 | 3,000+ |
| Compute Instances | 2-4 | 4-8 | 8-16 | 16-32 |
| Monthly Cost | $1,200 | $2,500 | $4,500 | $7,000 |

### 13.3 Business Metrics

- **Job Completion Rate**: 70%+
- **Bid Response Time**: <15 minutes average
- **Pro Conversion Rate**: 15%
- **Referral K-factor**: 1.2
- **Same-day Payouts**: 100+ per day
- **Customer Satisfaction**: 4.5+ stars

---

## 14. Runbook: Common Scenarios

### 14.1 Traffic Spike (10x normal load)

**Symptoms**: High latency, increased error rates

**Actions**:
1. Check monitoring dashboard for bottleneck
2. If CPU high: Manually trigger scale-up (add 8 instances)
3. If DB connections saturated: Increase connection pool or add read replica
4. If cache hit ratio low: Increase cache TTL, add more cache instances
5. Enable CloudFlare "Under Attack Mode" if DDoS suspected
6. Notify team in Slack #incidents channel

**Prevention**: Auto-scaling should handle most spikes automatically

### 14.2 Database Failure

**Symptoms**: 500 errors, connection timeouts

**Actions**:
1. Check RDS Multi-AZ failover (automatic, ~2 min)
2. If failover failed, restore from backup:
   ```bash
   aws rds restore-db-instance-from-db-snapshot \
     --db-instance-identifier ftw-db-restored \
     --db-snapshot-identifier ftw-db-snapshot-latest
   ```
3. Update DNS to point to restored instance
4. Replay WAL logs for lost transactions
5. Post-mortem: Document root cause

**Prevention**: Multi-AZ deployment, automated backups every 6 hours

### 14.3 CDN Cache Poisoning

**Symptoms**: Users seeing wrong content

**Actions**:
1. Immediately purge CDN cache:
   ```bash
   curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache" \
     -H "Authorization: Bearer ${CF_API_TOKEN}" \
     -H "Content-Type: application/json" \
     --data '{"purge_everything":true}'
   ```
2. Identify poisoned URLs and purge selectively
3. Review cache headers and fix if misconfigured
4. Monitor for repeat issues

**Prevention**: Set proper cache headers, use versioned URLs for assets

---

## 15. Next Steps

### Immediate Actions (Week 1)
1. Review and approve this scaling plan
2. Set up AWS and CloudFlare accounts
3. Create infrastructure cost budget
4. Assign team members to implementation tracks
5. Schedule weekly infrastructure review meetings

### Short-term (Month 1)
1. Deploy basic multi-server setup
2. Implement monitoring and alerting
3. Set up automated backups
4. Configure CDN and object storage
5. Load test with simulated 10k users

### Medium-term (Months 2-6)
1. Implement auto-scaling
2. Deploy Redis caching layer
3. Optimize database queries
4. Set up blue-green deployments
5. Multi-region deployment

### Long-term (Months 7-12)
1. Cost optimization initiatives
2. Advanced caching strategies
3. Full disaster recovery drills
4. Security audits and penetration testing
5. Continuous performance monitoring and optimization

---

## Conclusion

This scaling plan provides a comprehensive roadmap to support 300,000 users in the first year while maintaining performance, reliability, and cost efficiency. The key to success is:

1. **Incremental scaling**: Don't over-provision early, scale as needed
2. **Monitoring first**: Measure everything before optimizing
3. **Automate everything**: Auto-scaling, deployments, backups, alerts
4. **Cache aggressively**: Redis + CDN = 95%+ cache hit ratio
5. **Optimize costs**: Reserved instances, CloudFlare R2, compression
6. **Stay secure**: Rate limiting, encryption, regular audits
7. **Plan for failure**: Backups, failover, disaster recovery

**Estimated Total Investment**: ~$84,000 for year 1 infrastructure
**Expected Revenue** (15% Pro conversion): ~$140,400/year
**Profitability**: Achievable by month 6-9

With this infrastructure in place, FairTradeWorker will be well-positioned to handle viral growth while delivering the <100ms interactions and 99.9% uptime that users expect.
