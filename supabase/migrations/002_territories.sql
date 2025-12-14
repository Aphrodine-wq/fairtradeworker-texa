-- Territories and Operators Schema

-- Territories table
CREATE TABLE IF NOT EXISTS territories (
  id SERIAL PRIMARY KEY,
  county_name TEXT NOT NULL UNIQUE,
  operator_id UUID REFERENCES users(id),
  operator_name TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Territory assignments
CREATE TABLE IF NOT EXISTS territory_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  territory_id INTEGER NOT NULL REFERENCES territories(id),
  operator_id UUID NOT NULL REFERENCES users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'revoked')),
  notes TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_territories_operator_id ON territories(operator_id);
CREATE INDEX IF NOT EXISTS idx_territories_status ON territories(status);
CREATE INDEX IF NOT EXISTS idx_territory_assignments_territory_id ON territory_assignments(territory_id);
CREATE INDEX IF NOT EXISTS idx_territory_assignments_operator_id ON territory_assignments(operator_id);

-- Updated_at trigger
CREATE TRIGGER update_territories_updated_at BEFORE UPDATE ON territories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
