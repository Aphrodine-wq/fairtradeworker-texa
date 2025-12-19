# FairTradeWorker Infrastructure - 400k Users Day 1 Ready

This directory contains all infrastructure configuration, scripts, and documentation for running FairTradeWorker at scale.

## 🎯 System Capacity

**Day 1 Launch Configuration:**
- **Total Users:** 400,000
- **Daily Active Users:** 160,000 (40% DAU ratio)
- **Peak Concurrent Users:** 20,000 (12.5% of DAU)
- **Jobs per Day:** 1,500
- **Bids per Day:** 7,500
- **Messages per Day:** 15,000

## 📁 Directory Structure

```
infrastructure/
├── scaling-config.ts              # Core scaling configuration
├── supabase-pooling.config.ts     # Database connection pooling
├── docker-compose.yml             # Local development environment
├── Dockerfile                     # Production container image
├── monitoring-config.yml          # Prometheus monitoring setup
├── alerts.yml                     # Alert rules
├── health-check.sh               # System readiness verification
├── run-load-test.sh              # Load testing runner
├── DAY1_OPERATIONS_RUNBOOK.md    # Launch day procedures
├── README.md                     # This file
└── load-tests/                   # Load testing scenarios
    └── day1-launch.js            # 20k concurrent users simulation
```

## 🚀 Quick Start

### Pre-Launch Health Check

Run the health check script to verify system readiness:

```bash
./infrastructure/health-check.sh
```

This checks:
- ✓ Node.js and npm versions
- ✓ Dependencies installed
- ✓ Environment variables configured
- ✓ Scaling configuration optimized
- ✓ Database migrations applied
- ✓ Circuit breakers implemented
- ✓ Load tests available
- ✓ Documentation complete

### Load Testing

Test system capacity before launch:

```bash
# Run load test menu
./infrastructure/run-load-test.sh

# Or run specific test directly
k6 run --vus 2000 --duration 15m ./infrastructure/load-tests/day1-launch.js
```

### Local Development

Run the full stack locally:

```bash
# Start all services (app, redis, postgres)
docker-compose -f infrastructure/docker-compose.yml up

# Access:
# - Application: http://localhost:3000
# - Redis: localhost:6379
# - PostgreSQL: localhost:5432
```

## 📊 Scaling Configuration

### Growth Phases

From `scaling-config.ts`:

| Phase | Timeline | Max Users | DAU | Concurrent | Monthly Cost |
|-------|----------|-----------|-----|------------|--------------|
| Launch | Month 0-1 | 400k | 160k | 20k | $8,500 |
| Stabilize | Month 1-3 | 500k | 200k | 25k | $10,000 |
| Growth | Month 4-6 | 750k | 300k | 37.5k | $14,000 |
| Scale | Month 7-12 | 1M | 400k | 50k | $18,000 |

### Auto-Scaling Settings

```typescript
AUTO_SCALE: {
  SCALE_UP_CPU_THRESHOLD: 70,      // Scale up at 70% CPU
  SCALE_DOWN_CPU_THRESHOLD: 30,    // Scale down at 30% CPU  
  SCALE_UP_RESPONSE_TIME_MS: 800,  // Scale if response >800ms
  MIN_INSTANCES: 8,                // Start with 8 instances
  MAX_INSTANCES: 50,               // Maximum 50 instances
  COOLDOWN_SECONDS: 180,           // 3-minute cooldown
}
```

### Database Connection Pool

```typescript
DATABASE: {
  MIN_CONNECTIONS: 20,
  MAX_CONNECTIONS: 100,
  CONNECTION_TIMEOUT_MS: 30_000,
  IDLE_TIMEOUT_MS: 600_000,
  QUERY_TIMEOUT_MS: 30_000,
}
```

### Rate Limiting

```typescript
RATE_LIMITS: {
  ANONYMOUS: { WINDOW_MS: 60_000, MAX_REQUESTS: 60 },
  AUTHENTICATED: { WINDOW_MS: 60_000, MAX_REQUESTS: 200 },
  PRO: { WINDOW_MS: 60_000, MAX_REQUESTS: 500 },
  OPERATOR: { WINDOW_MS: 60_000, MAX_REQUESTS: 1000 },
}
```

## 🗄️ Database Optimization

### Indexes for Scale

The `010_scale_400k_indexes.sql` migration adds critical indexes:

- Job browsing by territory and status
- Full-text search optimization
- Contractor bid management
- Invoice and payment tracking
- CRM customer pipeline
- Analytics and reporting

### Connection Pooling

Supabase PgBouncer configuration:
- **Mode:** Transaction (optimal for serverless)
- **Pool Size:** 25 per user/database
- **Max Connections:** 100
- **Max Client Connections:** 10,000

### Read Replicas

For read-heavy operations:
- Primary: Write operations
- Replica 1: Job browsing, search
- Replica 2: Analytics, reporting

## 🛡️ Reliability Features

### Circuit Breakers

Protect against cascading failures:

```typescript
serviceCircuitBreakers = {
  database: { failureThreshold: 5, timeout: 10000 },
  openai: { failureThreshold: 3, timeout: 30000 },
  stripe: { failureThreshold: 5, timeout: 15000 },
  twilio: { failureThreshold: 5, timeout: 10000 },
  sendgrid: { failureThreshold: 5, timeout: 10000 },
  storage: { failureThreshold: 5, timeout: 15000 },
}
```

### Fallback Mechanisms

All critical services have fallback strategies:
- Database: Read replica failover
- AI: Cached responses, degraded mode
- Payments: Retry queue
- Storage: Multi-region redundancy

## 📈 Monitoring & Alerts

### Key Metrics

Monitor every 30 seconds:
- Active users and concurrent connections
- Response time (p50, p95, p99)
- Error rate
- Database connections and query time
- CPU and memory usage
- Cache hit ratio

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Response Time | >1s (p95) | >2s (p95) |
| Error Rate | >2% | >5% |
| CPU Usage | >70% | >90% |
| DB Connections | >80 | >95 |
| Memory | >75% | >90% |
| Disk Usage | >80% | >95% |

## 🔧 Performance Targets

Based on `SCALING_CONFIG.PERFORMANCE`:

- **Page Load (P95):** <1.5s (relaxed from 1s for day 1)
- **API Response (P50):** <150ms
- **API Response (P95):** <800ms
- **Uptime Target:** 99.5% (realistic for day 1)

## 📋 Pre-Launch Checklist

### Infrastructure (T-7 days)

- [ ] Run health check: `./infrastructure/health-check.sh`
- [ ] Verify all environment variables set
- [ ] Apply database migrations
- [ ] Configure connection pooling (100 connections)
- [ ] Set up read replicas
- [ ] Configure auto-scaling (min: 8, max: 50)
- [ ] Verify CDN caching rules
- [ ] Test circuit breakers

### Load Testing (T-3 days)

- [ ] Smoke test (10 VUs)
- [ ] Load test (100 VUs)
- [ ] Stress test (500 VUs)
- [ ] Day 1 simulation (2000 VUs)
- [ ] Verify all tests pass with <1.5s p95
- [ ] Verify error rate <1%

### Monitoring (T-2 days)

- [ ] Configure all alerts
- [ ] Set up monitoring dashboards
- [ ] Test alert notifications
- [ ] Enable logging and tracing
- [ ] Set up error tracking (Sentry)

### Team Readiness (T-1 day)

- [ ] Review operations runbook
- [ ] Assign on-call engineers
- [ ] Verify emergency contacts
- [ ] Test communication channels
- [ ] Prepare rollback plan

## 🚨 Launch Day

Follow the [Day 1 Operations Runbook](./DAY1_OPERATIONS_RUNBOOK.md):

1. **T-12 hours:** Final health check, scale up infrastructure
2. **T-1 hour:** Go/No-Go decision
3. **T-0:** Launch, monitor closely
4. **T+1 hour:** Early assessment
5. **T+6 hours:** Day end review

## 🔍 Troubleshooting

### Common Issues

1. **Database connections exhausted**
   - Kill idle connections
   - Increase pool size
   - Optimize queries

2. **High error rate**
   - Check external service status
   - Enable fallback mode
   - Scale up instances

3. **Slow response times**
   - Scale horizontally
   - Check database query performance
   - Rebuild caches

See [Operations Runbook](./DAY1_OPERATIONS_RUNBOOK.md) for detailed solutions.

## 📚 Additional Documentation

- **Operations:** [DAY1_OPERATIONS_RUNBOOK.md](./DAY1_OPERATIONS_RUNBOOK.md)
- **Scaling Plan:** [../docs/business/SCALING_PLAN.md](../docs/business/SCALING_PLAN.md)
- **Performance:** [../docs/technical/PERFORMANCE.md](../docs/technical/PERFORMANCE.md)
- **Architecture:** [../docs/technical/ARCHITECTURE.md](../docs/technical/ARCHITECTURE.md)

## 🎯 Success Metrics

**Day 1 Goals:**
- [ ] Handle 20k concurrent users without degradation
- [ ] Maintain <1.5s page load (p95)
- [ ] Keep error rate <1%
- [ ] Achieve 99.5% uptime
- [ ] Process 1,500+ jobs
- [ ] Zero data loss
- [ ] Zero security incidents

## 🤝 Support

For infrastructure issues:
- **Primary On-Call:** See [Operations Runbook](./DAY1_OPERATIONS_RUNBOOK.md)
- **Supabase Support:** support@supabase.io
- **Vercel Support:** vercel.com/support
- **Team Slack:** #launch-war-room

---

**Last Updated:** December 2025  
**Version:** 2.0 (400k Users Day 1 Ready)  
**Status:** ✅ Production Ready
