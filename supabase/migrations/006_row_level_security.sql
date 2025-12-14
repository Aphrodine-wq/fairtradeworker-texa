-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_follow_ups ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Jobs policies
CREATE POLICY "Anyone can view open jobs"
  ON jobs FOR SELECT
  USING (status = 'open' OR status = 'bidding');

CREATE POLICY "Homeowners can view their own jobs"
  ON jobs FOR SELECT
  USING (
    auth.uid() = homeowner_id OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'operator'
  );

CREATE POLICY "Homeowners can create jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = homeowner_id);

CREATE POLICY "Homeowners can update their own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() = homeowner_id);

-- Bids policies
CREATE POLICY "Contractors can view bids on their jobs"
  ON bids FOR SELECT
  USING (
    auth.uid() IN (
      SELECT contractor_id FROM jobs WHERE id = bids.job_id
    ) OR
    auth.uid() IN (
      SELECT homeowner_id FROM jobs WHERE id = bids.job_id
    )
  );

CREATE POLICY "Contractors can create bids"
  ON bids FOR INSERT
  WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Homeowners can update bids on their jobs"
  ON bids FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT homeowner_id FROM jobs WHERE id = bids.job_id
    )
  );

-- Invoices policies
CREATE POLICY "Contractors can view their own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = contractor_id);

CREATE POLICY "Homeowners can view invoices for their jobs"
  ON invoices FOR SELECT
  USING (
    auth.uid() IN (
      SELECT homeowner_id FROM jobs WHERE id = invoices.job_id
    )
  );

CREATE POLICY "Contractors can create invoices"
  ON invoices FOR INSERT
  WITH CHECK (auth.uid() = contractor_id);

-- CRM policies
CREATE POLICY "Contractors can manage their own customers"
  ON crm_customers FOR ALL
  USING (auth.uid() = contractor_id);

CREATE POLICY "Contractors can view their customer interactions"
  ON customer_interactions FOR SELECT
  USING (auth.uid() = contractor_id);

-- Automation policies
CREATE POLICY "Contractors can manage their own sequences"
  ON follow_up_sequences FOR ALL
  USING (auth.uid() = contractor_id);

CREATE POLICY "Contractors can view their scheduled follow-ups"
  ON scheduled_follow_ups FOR SELECT
  USING (auth.uid() = contractor_id);
