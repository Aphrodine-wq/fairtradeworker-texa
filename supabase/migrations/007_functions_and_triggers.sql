-- Database Functions and Triggers

-- Function to calculate job size based on AI scope
CREATE OR REPLACE FUNCTION calculate_job_size(price_high NUMERIC)
RETURNS TEXT AS $$
BEGIN
  IF price_high <= 300 THEN
    RETURN 'small';
  ELSIF price_high <= 1500 THEN
    RETURN 'medium';
  ELSE
    RETURN 'large';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update job size when AI scope changes
CREATE OR REPLACE FUNCTION update_job_size()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ai_scope IS NOT NULL AND NEW.ai_scope->>'priceHigh' IS NOT NULL THEN
    NEW.size := calculate_job_size((NEW.ai_scope->>'priceHigh')::NUMERIC);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_job_size
  BEFORE INSERT OR UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_job_size();

-- Function to update customer lifetime value
CREATE OR REPLACE FUNCTION update_customer_ltv()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE crm_customers
    SET 
      lifetime_value = lifetime_value + NEW.total,
      total_jobs = total_jobs + 1
    WHERE id = (
      SELECT homeowner_id FROM jobs WHERE id = NEW.job_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customer_ltv
  AFTER UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_ltv();

-- Function to auto-create CRM customer from job
CREATE OR REPLACE FUNCTION auto_create_crm_customer()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO crm_customers (contractor_id, name, email, phone, status)
  SELECT 
    NEW.contractor_id,
    u.full_name,
    u.email,
    NULL,
    'active'
  FROM users u
  WHERE u.id = NEW.homeowner_id
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_create_crm_customer
  AFTER UPDATE ON jobs
  FOR EACH ROW
  WHEN (NEW.status = 'awarded' AND OLD.status != 'awarded')
  EXECUTE FUNCTION auto_create_crm_customer();

-- Function to check and send scheduled follow-ups
CREATE OR REPLACE FUNCTION get_due_follow_ups()
RETURNS TABLE (
  id UUID,
  sequence_id UUID,
  customer_id UUID,
  contractor_id UUID,
  scheduled_for TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sf.id,
    sf.sequence_id,
    sf.customer_id,
    sf.contractor_id,
    sf.scheduled_for
  FROM scheduled_follow_ups sf
  WHERE sf.status = 'pending'
    AND sf.scheduled_for <= NOW()
  ORDER BY sf.scheduled_for ASC;
END;
$$ LANGUAGE plpgsql;
