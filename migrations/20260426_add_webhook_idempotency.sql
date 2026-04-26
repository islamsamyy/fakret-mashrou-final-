-- Track processed Stripe webhook events to prevent duplicate processing
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_timestamp BIGINT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  processed_at TIMESTAMP DEFAULT NOW(),

  INDEX (event_type),
  INDEX (processed_at)
);

-- Ensure investments.status is one of the expected enum values
-- This guards against invalid states in the database
ALTER TABLE investments
  ADD CONSTRAINT investments_status_check
  CHECK (status IN ('committed', 'paid', 'cancelled'));

-- Add index for payment lookups
CREATE INDEX IF NOT EXISTS idx_investments_investor_status
  ON investments(investor_id, status);

CREATE INDEX IF NOT EXISTS idx_investments_project_status
  ON investments(project_id, status);
