-- Additional Performance Indexes and Optimizations

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_jobs_status_created_at ON jobs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_size_status ON jobs(size, status);
CREATE INDEX IF NOT EXISTS idx_bids_job_status ON bids(job_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_contractor_status ON invoices(contractor_id, status);
CREATE INDEX IF NOT EXISTS idx_crm_customers_contractor_status ON crm_customers(contractor_id, status);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_jobs_title_search ON jobs USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_jobs_description_search ON jobs USING gin(to_tsvector('english', description));

-- Partial indexes for active records
CREATE INDEX IF NOT EXISTS idx_jobs_open ON jobs(created_at DESC) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_bids_pending ON bids(created_at DESC) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_invoices_unpaid ON invoices(due_date) WHERE status IN ('sent', 'overdue');

-- Covering indexes for common queries
CREATE INDEX IF NOT EXISTS idx_jobs_listing ON jobs(id, title, size, status, created_at) WHERE status IN ('open', 'bidding');

-- Analyze tables for query optimization
ANALYZE users;
ANALYZE jobs;
ANALYZE bids;
ANALYZE invoices;
ANALYZE crm_customers;
