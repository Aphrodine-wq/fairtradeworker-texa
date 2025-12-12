# FairTradeWorker Infrastructure for 300k Users

This directory contains all infrastructure configuration files, deployment scripts, and scaling documentation required to support 300,000 users in the first year.

## 📁 Files

- **SCALING_300K_USERS.md** - Comprehensive scaling plan and infrastructure guide (in parent directory)
- **scaling-config.ts** - TypeScript configuration constants for scaling
- **docker-compose.yml** - Local development and testing environment
- **Dockerfile** - Production container image
- **monitoring-config.yml** - Prometheus monitoring configuration
- **alerts.yml** - Alert rules for critical and warning conditions

## 🚀 Quick Start

### Local Development

```bash
# Start all services (app, Redis, PostgreSQL)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down
```

### Production Deployment

See `../SCALING_300K_USERS.md` for complete deployment instructions.

## 📊 Growth Phases

### Phase 1: Foundation (0-5k users, Months 1-3)
- **Infrastructure**: 2-4 instances, basic monitoring
- **Monthly Cost**: ~$750
- **Focus**: Establish core infrastructure and monitoring

### Phase 2: Growth (5k-25k users, Months 4-6)
- **Infrastructure**: 4-8 instances, auto-scaling, Redis cache
- **Monthly Cost**: ~$2,100
- **Focus**: Enable auto-scaling and optimization

### Phase 3: Scale (25k-100k users, Months 7-9)
- **Infrastructure**: 8-16 instances, multi-region, advanced caching
- **Monthly Cost**: ~$4,750
- **Focus**: Handle rapid growth

### Phase 4: Optimize (100k-300k users, Months 10-12)
- **Infrastructure**: 16-32 instances, full redundancy
- **Monthly Cost**: ~$7,000
- **Focus**: Cost optimization and reliability

## 🎯 Performance Targets

- **Page Load**: <1s (P95)
- **API Response**: <100ms (P50), <500ms (P95)
- **Job Posting**: <60 seconds end-to-end
- **Uptime**: 99.9%
- **Error Rate**: <1%

## 📈 Expected Metrics at 300k Users

- **Daily Active Users**: ~120,000 (40%)
- **Peak Concurrent**: ~15,000 users
- **Jobs/Day**: 1,000+
- **Bids/Day**: 5,000+
- **Photos/Day**: 3,000+
- **API Requests/Second**: ~200 (peak ~600)

## 💾 Storage Estimates (Year 1)

- **Spark KV**: ~7.5 GB
- **Photos**: ~2.46 TB
- **Videos**: ~3.66 TB
- **Documents**: ~40 GB
- **Total**: ~6.2 TB

## 🔧 Infrastructure Components

### Required Services

1. **Compute**: AWS EC2 / Auto-scaling Group
   - Instance type: t3.large (2 vCPU, 8GB RAM)
   - Auto-scale: 4-32 instances

2. **Database**: AWS RDS PostgreSQL
   - Instance: db.r5.large (Multi-AZ)
   - Storage: 500GB SSD

3. **Cache**: AWS ElastiCache Redis
   - Instance: cache.r5.large
   - Memory: 1GB

4. **Storage**: CloudFlare R2 / AWS S3
   - Photos, videos, documents
   - CDN integration

5. **Monitoring**: Datadog / Prometheus + Grafana
   - Real-time metrics
   - Alert management

6. **Services**:
   - OpenAI API (job scoping)
   - Twilio (SMS)
   - SendGrid (email)
   - Stripe (payments)
   - Trueway API (routing)

## 🛡️ Security

- **Encryption**: TLS 1.3 in transit, AES-256 at rest
- **Rate Limiting**: Per-user and per-endpoint limits
- **DDoS Protection**: CloudFlare
- **Secrets**: AWS Secrets Manager
- **Backups**: Daily automated backups with 7-day retention

## 📊 Monitoring & Alerts

### Critical Alerts
- Error rate >5%
- Response time >2s (P95)
- CPU usage >90%
- Database connections >95%

### Warning Alerts
- Error rate >2%
- Response time >1s (P95)
- CPU usage >80%
- Cache hit ratio <70%
- Disk usage >80%

## 💰 Cost Breakdown (300k Users)

| Service | Monthly Cost |
|---------|--------------|
| Compute | $2,000 |
| Database | $500 |
| Cache | $175 |
| Storage | $2,200 |
| Bandwidth | $3,600 |
| Services (AI, SMS, Email) | $800 |
| Monitoring | $400 |
| **Total** | **~$9,675** |

**Optimized Cost**: ~$7,000 with reserved instances and CloudFlare R2

## 📋 Pre-Launch Checklist

- [ ] AWS/CloudFlare accounts set up
- [ ] Domain registered and DNS configured
- [ ] SSL certificates installed
- [ ] Load balancer configured
- [ ] Auto-scaling policies defined
- [ ] Database backups automated
- [ ] CDN configured
- [ ] Monitoring dashboards created
- [ ] Alert rules configured
- [ ] Security audit completed
- [ ] Load testing performed
- [ ] Disaster recovery plan tested

## 🔄 Deployment Strategy

### Blue-Green Deployment
1. Deploy new version alongside current
2. Run smoke tests
3. Switch traffic instantly
4. Monitor for 10 minutes
5. Scale down old version or rollback if issues

### Gradual Rollout
1. Deploy to canary (5% traffic)
2. Monitor metrics for 10 minutes
3. Expand to 25%, 50%, 100% over 30 minutes
4. Rollback if error rate increases

## 📚 Additional Documentation

- See `../SCALING_300K_USERS.md` for comprehensive infrastructure guide
- See `../PRD.md` for product requirements and features
- See `../README.md` for development setup

## 🆘 Troubleshooting

### High Error Rate
1. Check monitoring dashboard
2. Review recent deployments
3. Check external service status (OpenAI, Twilio, Stripe)
4. Scale up if capacity issue
5. Rollback if bad deployment

### Slow Performance
1. Check CPU/Memory usage
2. Review database query performance
3. Check cache hit ratio
4. Review CDN performance
5. Scale up if needed

### Database Issues
1. Check connection pool usage
2. Review slow query log
3. Check for locks
4. Verify backups are running
5. Failover to replica if needed

## 📞 Support

For infrastructure questions or incidents:
- Check runbook in `SCALING_300K_USERS.md`
- Review monitoring dashboards
- Contact DevOps team
- Escalate critical issues immediately

---

**Last Updated**: December 2025
**Maintained By**: FairTradeWorker DevOps Team
