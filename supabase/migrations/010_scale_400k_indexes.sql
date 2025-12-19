-- Additional Performance Indexes for 400k Users - Day 1 Readiness
-- This migration adds critical indexes for high-traffic queries

-- ===========================================================================
-- JOB BROWSING & SEARCH OPTIMIZATIONS
-- ===========================================================================

-- Index for job browsing by territory and status (most common query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_territory_status_created 
ON jobs(territory_id, status, created_at DESC) 
WHERE status IN ('open', 'bidding');

-- Index for job search by multiple criteria
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_composite_search 
ON jobs(status, size, territory_id, created_at DESC)
WHERE status = 'open';

-- Index for urgent jobs (high priority queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_urgent 
ON jobs(territory_id, urgent_deadline, created_at DESC) 
WHERE is_urgent = true AND status IN ('open', 'bidding');

-- Covering index for job listing page (includes commonly displayed fields)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_listing_cover 
ON jobs(territory_id, status, created_at DESC)
INCLUDE (id, title, size, estimated_days, homeowner_id);

-- Full-text search with GiST index for better performance at scale
DROP INDEX IF EXISTS idx_jobs_title_search;
DROP INDEX IF EXISTS idx_jobs_description_search;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_fulltext_search 
ON jobs USING gin(
  to_tsvector('english', 
    COALESCE(title, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(array_to_string(trades_required, ' '), '')
  )
);

-- ===========================================================================
-- BID MANAGEMENT OPTIMIZATIONS
-- ===========================================================================

-- Index for contractor's active bids
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_contractor_active 
ON bids(contractor_id, status, created_at DESC)
WHERE status = 'pending';

-- Index for job bid count (for displaying bid counts)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_job_count 
ON bids(job_id, status)
WHERE status IN ('pending', 'accepted');

-- Index for fastest bid time calculations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_response_time 
ON bids(job_id, created_at ASC)
WHERE status != 'rejected';

-- ===========================================================================
-- USER & AUTHENTICATION OPTIMIZATIONS
-- ===========================================================================

-- Index for user lookups by role and territory
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_territory 
ON users(role, territory_id, created_at DESC)
WHERE role IN ('contractor', 'operator');

-- Index for Pro user queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_pro 
ON users(is_pro, pro_since DESC)
WHERE is_pro = true;

-- Index for available contractors (for matching)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_available_contractors 
ON users(territory_id, available_now_since DESC)
WHERE role = 'contractor' AND available_now = true;

-- Index for referral tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_referrals 
ON users(referred_by, created_at DESC)
WHERE referred_by IS NOT NULL;

-- ===========================================================================
-- INVOICE & PAYMENT OPTIMIZATIONS
-- ===========================================================================

-- Index for contractor invoices by status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_contractor_status_date 
ON invoices(contractor_id, status, created_at DESC);

-- Index for overdue invoices
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_overdue 
ON invoices(due_date ASC, contractor_id)
WHERE status IN ('sent', 'overdue');

-- Index for payment reconciliation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_paid 
ON invoices(paid_date DESC, contractor_id)
WHERE status = 'paid';

-- ===========================================================================
-- CRM OPTIMIZATIONS (if crm_customers table exists)
-- ===========================================================================

-- Index for contractor's CRM customers
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_crm_customers_contractor_status 
ON crm_customers(contractor_id, status, updated_at DESC);

-- Index for customer pipeline stage
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_crm_customers_pipeline 
ON crm_customers(contractor_id, pipeline_stage, last_contact_date DESC)
WHERE status = 'active';

-- ===========================================================================
-- ANALYTICS & REPORTING OPTIMIZATIONS
-- ===========================================================================

-- Partial index for recent activity (last 30 days)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_recent_activity 
ON jobs(created_at DESC, status, territory_id)
WHERE created_at > NOW() - INTERVAL '30 days';

-- Index for territory metrics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_territory_metrics 
ON jobs(territory_id, status, created_at)
WHERE created_at > NOW() - INTERVAL '90 days';

-- ===========================================================================
-- CLEANUP OLD INDEXES (if they exist and are replaced)
-- ===========================================================================

-- Drop old less-efficient indexes that are now covered by composite indexes
-- Be careful: only drop if the new indexes are confirmed created
-- DROP INDEX IF EXISTS idx_jobs_status_created_at;
-- DROP INDEX IF EXISTS idx_jobs_size_status;

-- ===========================================================================
-- VACUUM AND ANALYZE
-- ===========================================================================

-- Update table statistics for query planner
ANALYZE users;
ANALYZE jobs;
ANALYZE bids;
ANALYZE invoices;

-- Vacuum to reclaim space and update statistics
-- Run these during off-peak hours
-- VACUUM ANALYZE users;
-- VACUUM ANALYZE jobs;
-- VACUUM ANALYZE bids;
-- VACUUM ANALYZE invoices;

-- ===========================================================================
-- TABLE STATISTICS
-- ===========================================================================

-- Set statistics target for frequently queried columns
-- Higher values = better query plans, but slower ANALYZE
ALTER TABLE jobs ALTER COLUMN territory_id SET STATISTICS 1000;
ALTER TABLE jobs ALTER COLUMN status SET STATISTICS 1000;
ALTER TABLE jobs ALTER COLUMN created_at SET STATISTICS 1000;

ALTER TABLE bids ALTER COLUMN job_id SET STATISTICS 1000;
ALTER TABLE bids ALTER COLUMN contractor_id SET STATISTICS 1000;
ALTER TABLE bids ALTER COLUMN status SET STATISTICS 1000;

ALTER TABLE users ALTER COLUMN role SET STATISTICS 1000;
ALTER TABLE users ALTER COLUMN territory_id SET STATISTICS 1000;
