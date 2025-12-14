-- CRM and Customer Management Schema

-- CRM Customers table
CREATE TABLE IF NOT EXISTS crm_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'active', 'completed', 'advocate', 'inactive')),
  lifetime_value NUMERIC(10,2) DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  last_contacted_at TIMESTAMPTZ,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer interactions
CREATE TABLE IF NOT EXISTS customer_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES crm_customers(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('call', 'email', 'sms', 'meeting', 'note', 'job')),
  subject TEXT,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_crm_customers_contractor_id ON crm_customers(contractor_id);
CREATE INDEX IF NOT EXISTS idx_crm_customers_status ON crm_customers(status);
CREATE INDEX IF NOT EXISTS idx_crm_customers_email ON crm_customers(email);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_customer_id ON customer_interactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_contractor_id ON customer_interactions(contractor_id);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_created_at ON customer_interactions(created_at);

-- Updated_at trigger
CREATE TRIGGER update_crm_customers_updated_at BEFORE UPDATE ON crm_customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
