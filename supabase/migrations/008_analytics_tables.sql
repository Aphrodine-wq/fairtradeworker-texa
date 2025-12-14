-- Analytics and Reporting Tables

-- Job analytics
CREATE TABLE IF NOT EXISTS job_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  bid_count INTEGER DEFAULT 0,
  average_bid_amount NUMERIC(10,2),
  time_to_first_bid INTEGER, -- in minutes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contractor performance metrics
CREATE TABLE IF NOT EXISTS contractor_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID NOT NULL REFERENCES users(id),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  jobs_won INTEGER DEFAULT 0,
  jobs_lost INTEGER DEFAULT 0,
  total_revenue NUMERIC(10,2) DEFAULT 0,
  average_bid_amount NUMERIC(10,2),
  win_rate NUMERIC(5,2),
  average_response_time_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform analytics
CREATE TABLE IF NOT EXISTS platform_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  jobs_posted INTEGER DEFAULT 0,
  jobs_completed INTEGER DEFAULT 0,
  total_bids INTEGER DEFAULT 0,
  active_contractors INTEGER DEFAULT 0,
  active_homeowners INTEGER DEFAULT 0,
  total_revenue NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_job_analytics_job_id ON job_analytics(job_id);
CREATE INDEX IF NOT EXISTS idx_contractor_metrics_contractor_id ON contractor_metrics(contractor_id);
CREATE INDEX IF NOT EXISTS idx_contractor_metrics_period ON contractor_metrics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_date ON platform_analytics(date);

-- Updated_at trigger
CREATE TRIGGER update_job_analytics_updated_at BEFORE UPDATE ON job_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
