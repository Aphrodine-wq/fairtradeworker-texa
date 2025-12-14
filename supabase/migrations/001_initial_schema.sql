-- FairTradeWorker Initial Schema
-- Creates core tables for users, jobs, bids, and invoices

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('homeowner', 'contractor', 'operator')),
  territory_id INTEGER,
  is_pro BOOLEAN DEFAULT false,
  pro_since TIMESTAMPTZ,
  performance_score NUMERIC(5,2) DEFAULT 0,
  bid_accuracy NUMERIC(5,2) DEFAULT 0,
  is_operator BOOLEAN DEFAULT false,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES users(id),
  referral_earnings NUMERIC(10,2) DEFAULT 0,
  contractor_invite_count INTEGER DEFAULT 0,
  company_logo TEXT,
  company_name TEXT,
  company_address TEXT,
  company_phone TEXT,
  company_email TEXT,
  tax_id TEXT,
  average_response_time_minutes INTEGER,
  win_rate NUMERIC(5,2),
  fees_avoided NUMERIC(10,2) DEFAULT 0,
  available_now BOOLEAN DEFAULT false,
  available_now_since TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  homeowner_id UUID NOT NULL REFERENCES users(id),
  contractor_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('audio', 'photo', 'video')),
  photos TEXT[] DEFAULT '{}',
  ai_scope JSONB NOT NULL DEFAULT '{}',
  size TEXT NOT NULL CHECK (size IN ('small', 'medium', 'large')),
  tier TEXT CHECK (tier IN ('QUICK_FIX', 'STANDARD', 'MAJOR_PROJECT')),
  estimated_days INTEGER,
  trades_required TEXT[],
  permit_required BOOLEAN DEFAULT false,
  status TEXT NOT NULL CHECK (status IN ('open', 'bidding', 'awarded', 'in-progress', 'completed', 'cancelled')),
  territory_id INTEGER,
  is_urgent BOOLEAN DEFAULT false,
  urgent_deadline TIMESTAMPTZ,
  is_private BOOLEAN DEFAULT false,
  source TEXT CHECK (source IN ('ai_receptionist', 'marketplace', 'direct')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bids table
CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES users(id),
  contractor_name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID NOT NULL REFERENCES users(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  job_title TEXT NOT NULL,
  line_items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(10,2) NOT NULL,
  tax_rate NUMERIC(5,4) DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date TIMESTAMPTZ NOT NULL,
  sent_date TIMESTAMPTZ,
  paid_date TIMESTAMPTZ,
  is_pro_forma BOOLEAN DEFAULT false,
  late_fee_applied BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_jobs_homeowner_id ON jobs(homeowner_id);
CREATE INDEX IF NOT EXISTS idx_jobs_contractor_id ON jobs(contractor_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_size ON jobs(size);
CREATE INDEX IF NOT EXISTS idx_jobs_territory_id ON jobs(territory_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_bids_job_id ON bids(job_id);
CREATE INDEX IF NOT EXISTS idx_bids_contractor_id ON bids(contractor_id);
CREATE INDEX IF NOT EXISTS idx_invoices_contractor_id ON invoices(contractor_id);
CREATE INDEX IF NOT EXISTS idx_invoices_job_id ON invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
