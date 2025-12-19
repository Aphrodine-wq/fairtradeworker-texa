# Day 1 Launch Operations Runbook - 400k Users

## Table of Contents

1. [Pre-Launch Checklist](#pre-launch-checklist)
2. [Launch Day Procedures](#launch-day-procedures)
3. [Monitoring & Alerts](#monitoring--alerts)
4. [Incident Response](#incident-response)
5. [Scaling Procedures](#scaling-procedures)
6. [Common Issues & Solutions](#common-issues--solutions)
7. [Emergency Contacts](#emergency-contacts)

---

## Pre-Launch Checklist

### Infrastructure (T-7 days)

- [ ] **Supabase Configuration**
  - [ ] Connection pool size set to 100
  - [ ] Read replicas configured and tested
  - [ ] Query timeout set to 30 seconds
  - [ ] All migrations applied (including `010_scale_400k_indexes.sql`)
  - [ ] Database backup verified (can restore in <4 hours)
  
- [ ] **Vercel Deployment**
  - [ ] Production build tested
  - [ ] Environment variables configured
  - [ ] CDN caching rules verified
  - [ ] Auto-scaling limits set (min: 8, max: 50 instances)
  - [ ] Serverless function timeout: 60 seconds
  
- [ ] **External Services**
  - [ ] Stripe API limits increased
  - [ ] OpenAI API quota verified ($1000/month minimum)
  - [ ] Twilio SMS credits loaded
  - [ ] SendGrid email quota verified
  - [ ] CloudFlare R2 storage configured
  
- [ ] **Rate Limiting**
  - [ ] Rate limits updated in `scaling-config.ts`
  - [ ] Circuit breakers tested
  - [ ] Fallback mechanisms verified

### Performance (T-3 days)

- [ ] **Load Testing**
  - [ ] Smoke test passed (10 VUs, 2m)
  - [ ] Load test passed (100 VUs, 5m)
  - [ ] Stress test passed (500 VUs, 10m)
  - [ ] Day 1 launch simulation passed (2000 VUs, 15m)
  - [ ] All tests show <1.5s p95 response time
  - [ ] Error rate <1%
  
- [ ] **Bundle Optimization**
  - [ ] Main bundle <150KB gzipped
  - [ ] Service worker caching enabled
  - [ ] Critical CSS inlined
  - [ ] Images optimized and lazy-loaded

### Monitoring (T-2 days)

- [ ] **Alerts Configured**
  - [ ] Error rate >5% → Critical
  - [ ] Response time >2s → Critical
  - [ ] CPU >90% → Critical
  - [ ] Database connections >95% → Critical
  - [ ] Disk usage >80% → Warning
  
- [ ] **Dashboards Ready**
  - [ ] Real-time metrics dashboard
  - [ ] Database performance dashboard
  - [ ] User activity dashboard
  - [ ] Error tracking dashboard
  
- [ ] **Logging**
  - [ ] Application logs streaming
  - [ ] Database slow query log enabled
  - [ ] Audit logs configured

### Team Readiness (T-1 day)

- [ ] **On-Call Schedule**
  - [ ] Primary engineer identified
  - [ ] Backup engineer identified
  - [ ] Database specialist on standby
  - [ ] Communication channels set up (Slack, Discord)
  
- [ ] **Documentation**
  - [ ] This runbook reviewed by all team members
  - [ ] Escalation procedures understood
  - [ ] Access credentials verified
  - [ ] Emergency rollback plan prepared

---

## Launch Day Procedures

### T-12 Hours: Final Preparation

```bash
# 1. Verify all systems are healthy
./infrastructure/health-check.sh

# 2. Scale up infrastructure proactively
# Vercel: Set min instances to 8
# Supabase: Ensure connection pool at 100

# 3. Enable enhanced monitoring
# Turn on real-time alerts
# Open monitoring dashboards

# 4. Create database checkpoint
# Take manual backup before launch

# 5. Warm up caches
# Pre-populate Redis with common queries
```

### T-1 Hour: Go/No-Go Decision

**Go Criteria:**
- ✅ All health checks passing
- ✅ No critical alerts in last 24 hours
- ✅ Load tests passed
- ✅ Team on standby
- ✅ Rollback plan ready

**No-Go Criteria:**
- ❌ Any critical system failures
- ❌ Database connection issues
- ❌ External service outages
- ❌ Team unavailable

### T-0: Launch

```bash
# 1. Enable traffic
# Announcement goes live
# Monitor initial traffic surge

# 2. Watch key metrics
# Response time
# Error rate
# Active users
# Database load

# 3. Be ready to scale
# Auto-scaling should handle it
# Manual intervention if needed
```

### T+1 Hour: Early Assessment

Check:
- [ ] Response times within SLA (<1.5s p95)
- [ ] Error rate <1%
- [ ] User registration flowing smoothly
- [ ] No database connection pool exhaustion
- [ ] No circuit breakers tripped

### T+6 Hours: Day End Review

- [ ] Review all incidents
- [ ] Document any issues encountered
- [ ] Update runbook based on learnings
- [ ] Plan for next day

---

## Monitoring & Alerts

### Critical Metrics (Check Every 5 Minutes)

```
Real-time Dashboard URL: https://your-monitoring-dashboard.com

Key Metrics:
- Active Users: Target 20k concurrent
- Response Time P95: <1.5s
- Error Rate: <1%
- Database Connections: <95 of 100
- CPU Usage: <70% average
- Memory Usage: <80%
```

### Alert Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Response Time | >1s (p95) | >2s (p95) | Scale up instances |
| Error Rate | >2% | >5% | Check logs, activate incident |
| CPU Usage | >70% | >90% | Scale horizontally |
| DB Connections | >80 | >95 | Scale DB, optimize queries |
| Memory | >75% | >90% | Restart instances, check leaks |
| Disk Usage | >80% | >95% | Clean up, expand storage |

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│                   SYSTEM HEALTH OVERVIEW                     │
├─────────────────────────────────────────────────────────────┤
│  Active Users: 18,432    Response Time: 324ms (p95)         │
│  Requests/sec: 2,456     Error Rate: 0.3%                   │
├─────────────────────────────────────────────────────────────┤
│  Database                    Application                     │
│  - Connections: 67/100      - Instances: 12/50               │
│  - Query Time: 45ms         - CPU: 58%                       │
│  - Cache Hit: 94%           - Memory: 62%                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Incident Response

### Severity Levels

**P0 - Critical (System Down)**
- Complete site outage
- Data loss risk
- Security breach
- Response: Immediate, all hands on deck

**P1 - High (Major Impact)**
- Significant performance degradation
- Core features unavailable
- High error rates (>10%)
- Response: Within 15 minutes

**P2 - Medium (Partial Impact)**
- Non-core features affected
- Moderate performance issues
- Response: Within 1 hour

**P3 - Low (Minor Impact)**
- Cosmetic issues
- Low-priority features
- Response: Next business day

### Incident Response Process

1. **Detect**
   - Alert fires
   - User reports
   - Monitoring dashboard shows issue

2. **Assess**
   - Determine severity (P0-P3)
   - Identify scope of impact
   - Estimate affected users

3. **Notify**
   - P0/P1: Alert all team members immediately
   - P2: Notify relevant team
   - P3: Log for later review

4. **Investigate**
   ```bash
   # Check logs
   vercel logs
   
   # Check database
   psql -h supabase-url -U postgres
   SELECT * FROM pg_stat_activity WHERE state != 'idle';
   
   # Check circuit breakers
   # Navigate to /admin/circuit-breakers
   
   # Check metrics
   # Open monitoring dashboard
   ```

5. **Mitigate**
   - Apply immediate fix if available
   - Or implement workaround
   - Or scale resources
   - Or enable degraded mode

6. **Resolve**
   - Deploy permanent fix
   - Verify resolution
   - Monitor for recurrence

7. **Document**
   - Write incident report
   - Update runbook
   - Share learnings

---

## Scaling Procedures

### Manual Horizontal Scaling

**Vercel (Auto-scales, but if needed):**

```bash
# Increase concurrent instances via dashboard
# Settings > Functions > Concurrency

# Or via CLI
vercel env add FUNCTION_CONCURRENCY 50
vercel --prod
```

**Supabase Database:**

```bash
# Increase connection pool
# Project Settings > Database > Connection pooling
# Set max connections: 150 (from 100)

# Add read replica
# Project Settings > Database > Add read replica
```

### Vertical Scaling (Last Resort)

```bash
# Upgrade Supabase tier
# Dashboard > Settings > Billing > Upgrade

# Upgrade Vercel tier
# Dashboard > Settings > Billing > Upgrade
```

### Auto-Scaling Triggers

Configured in `scaling-config.ts`:

```typescript
AUTO_SCALE: {
  SCALE_UP_CPU_THRESHOLD: 70,      // Scale up at 70% CPU
  SCALE_DOWN_CPU_THRESHOLD: 30,    // Scale down at 30% CPU
  SCALE_UP_RESPONSE_TIME_MS: 800,  // Scale up if response >800ms
  MIN_INSTANCES: 8,
  MAX_INSTANCES: 50,
  COOLDOWN_SECONDS: 180,           // Wait 3 min between scaling
}
```

---

## Common Issues & Solutions

### Issue 1: Database Connection Pool Exhausted

**Symptoms:**
- Error: "too many connections"
- Response times spike
- Some requests fail with 500 errors

**Solution:**
```bash
# 1. Check current connections
SELECT count(*) FROM pg_stat_activity WHERE state != 'idle';

# 2. Kill idle connections
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' 
AND state_change < NOW() - INTERVAL '5 minutes';

# 3. Increase pool size (if needed)
# Supabase Dashboard > Database > Connection pooling > Increase max

# 4. Optimize long-running queries
SELECT query, state, now() - query_start as duration
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC;
```

### Issue 2: High Error Rate

**Symptoms:**
- Error rate >5%
- Circuit breakers opening
- User complaints

**Solution:**
```bash
# 1. Check error logs
vercel logs --follow | grep ERROR

# 2. Identify error source
# Check which endpoints are failing

# 3. Check external services
# OpenAI, Stripe, Twilio status pages

# 4. Enable fallback mode if needed
# Circuit breakers will auto-fallback
# Or manually disable problematic features
```

### Issue 3: Slow Response Times

**Symptoms:**
- Response time p95 >2s
- User complaints about slowness
- High CPU usage

**Solution:**
```bash
# 1. Check database query performance
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

# 2. Scale up instances
# Auto-scaling should kick in
# Or manually increase via Vercel dashboard

# 3. Clear and rebuild caches
# Redis cache may be stale
# Service worker may need update

# 4. Check CDN caching
# Verify CloudFlare cache hit ratio
```

### Issue 4: Memory Leaks

**Symptoms:**
- Memory usage increasing over time
- Instances becoming unresponsive
- Crashes and restarts

**Solution:**
```bash
# 1. Identify memory leak
# Check which instances have high memory

# 2. Restart affected instances
# Vercel auto-restarts on crash
# Or manually redeploy

# 3. Enable heap snapshot collection
# For post-mortem analysis

# 4. Review recent code changes
# Identify potential leak sources
```

### Issue 5: External Service Outage

**Symptoms:**
- Circuit breakers opening for specific service
- Features dependent on service failing
- Errors related to external API

**Solution:**
```bash
# 1. Verify service status
# Check status pages:
# - Supabase: status.supabase.com
# - Vercel: vercel-status.com
# - OpenAI: status.openai.com
# - Stripe: status.stripe.com

# 2. Enable fallback mode
# Circuit breakers auto-enable fallbacks
# Verify fallback functionality

# 3. Communicate to users
# Post status update
# Set expectations

# 4. Monitor for recovery
# Circuit breaker will auto-recover
# Test when service is back
```

---

## Emergency Contacts

### Team

- **Primary On-Call Engineer:** [Name] - [Phone] - [Email]
- **Backup Engineer:** [Name] - [Phone] - [Email]
- **Database Specialist:** [Name] - [Phone] - [Email]
- **Product Manager:** [Name] - [Phone] - [Email]

### External Support

- **Supabase Support:** support@supabase.io (Response: 1-4 hours)
- **Vercel Support:** vercel.com/support (Emergency: <30 min)
- **CloudFlare Support:** cloudflare.com/support
- **OpenAI Support:** help.openai.com

### Communication Channels

- **Team Slack:** #launch-war-room
- **Discord:** #operations
- **Status Page:** status.fairtradeworker.com
- **Twitter:** @FairTradeWorker

---

## Rollback Procedures

### Emergency Rollback

```bash
# 1. Identify last known good deployment
vercel deployments list

# 2. Rollback to previous deployment
vercel rollback <deployment-url>

# 3. Verify rollback successful
# Check monitoring dashboard
# Test critical paths

# 4. Notify team
# Post in Slack
# Update status page

# 5. Investigate issue offline
# Don't rush to redeploy
# Fix root cause first
```

### Database Rollback

```bash
# 1. Stop application traffic (if needed)
# Maintenance mode

# 2. Restore from backup
# Supabase Dashboard > Database > Backups > Restore

# 3. Verify data integrity
# Run sanity checks

# 4. Resume traffic
# Gradual rollout
```

---

## Post-Launch Review

### Within 24 Hours

- [ ] Document all incidents
- [ ] Calculate actual vs expected metrics
- [ ] Identify bottlenecks encountered
- [ ] List what went well
- [ ] List what needs improvement

### Within 1 Week

- [ ] Full post-mortem meeting
- [ ] Update capacity plans
- [ ] Adjust auto-scaling thresholds
- [ ] Optimize slow queries
- [ ] Update documentation

---

**Last Updated:** December 2025  
**Version:** 1.0  
**Owner:** FairTradeWorker Operations Team
