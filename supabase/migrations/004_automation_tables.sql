-- Automation and Follow-up Sequences Schema

-- Follow-up sequences
CREATE TABLE IF NOT EXISTS follow_up_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  trigger_event TEXT NOT NULL CHECK (trigger_event IN ('job_posted', 'bid_submitted', 'job_won', 'job_lost', 'invoice_sent', 'payment_received', 'custom')),
  steps JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled follow-ups
CREATE TABLE IF NOT EXISTS scheduled_follow_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sequence_id UUID REFERENCES follow_up_sequences(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES crm_customers(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES users(id),
  step_index INTEGER NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  sent_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automation logs
CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID NOT NULL REFERENCES users(id),
  automation_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'skipped')),
  message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_follow_up_sequences_contractor_id ON follow_up_sequences(contractor_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_sequences_is_active ON follow_up_sequences(is_active);
CREATE INDEX IF NOT EXISTS idx_scheduled_follow_ups_contractor_id ON scheduled_follow_ups(contractor_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_follow_ups_scheduled_for ON scheduled_follow_ups(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_follow_ups_status ON scheduled_follow_ups(status);
CREATE INDEX IF NOT EXISTS idx_automation_logs_contractor_id ON automation_logs(contractor_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_created_at ON automation_logs(created_at);

-- Updated_at trigger
CREATE TRIGGER update_follow_up_sequences_updated_at BEFORE UPDATE ON follow_up_sequences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
