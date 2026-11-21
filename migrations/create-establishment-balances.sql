-- ============================================
-- MIGRATION: Establishment Balances System
-- Purpose: Segment user balances by establishment to prevent cross-establishment spending
-- Date: 2026-09-04
-- ============================================

-- Create establishment_balances table
CREATE TABLE IF NOT EXISTS establishment_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_earned DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_spent DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_transferred_out DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_transferred_in DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  last_transaction_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraint: One balance record per user per establishment
  UNIQUE(user_id, establishment_id),
  
  -- Constraint: Balance cannot be negative
  CONSTRAINT positive_balance CHECK (balance >= 0)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_establishment_balances_user 
  ON establishment_balances(user_id);

CREATE INDEX IF NOT EXISTS idx_establishment_balances_establishment 
  ON establishment_balances(establishment_id);

CREATE INDEX IF NOT EXISTS idx_establishment_balances_balance 
  ON establishment_balances(balance DESC);

-- Add establishment_id to transactions table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'establishment_id'
  ) THEN
    ALTER TABLE transactions ADD COLUMN establishment_id UUID REFERENCES establishments(id);
  END IF;
END $$;

-- Add source_establishment_id for transfers (where the money came from)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'source_establishment_id'
  ) THEN
    ALTER TABLE transactions ADD COLUMN source_establishment_id UUID REFERENCES establishments(id);
  END IF;
END $$;

-- Index for transactions by establishment
CREATE INDEX IF NOT EXISTS idx_transactions_establishment 
  ON transactions(establishment_id) WHERE establishment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_source_establishment 
  ON transactions(source_establishment_id) WHERE source_establishment_id IS NOT NULL;

-- Create a function to update establishment balance
CREATE OR REPLACE FUNCTION update_establishment_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the updated_at timestamp
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS establishment_balances_updated_at ON establishment_balances;
CREATE TRIGGER establishment_balances_updated_at
  BEFORE UPDATE ON establishment_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_establishment_balance();

-- ============================================
-- DATA MIGRATION: Migrate existing transactions to establishment_balances
-- ============================================

-- This will populate establishment_balances based on existing transactions
-- Run this AFTER creating the table structure

INSERT INTO establishment_balances (user_id, establishment_id, balance, total_earned, last_transaction_at)
SELECT 
  user_id,
  establishment_id,
  COALESCE(SUM(
    CASE 
      WHEN type = 'cashback' OR type = 'points_redemption' THEN final_amount
      WHEN type = 'purchase' THEN -final_amount
      ELSE 0
    END
  ), 0) as balance,
  COALESCE(SUM(
    CASE 
      WHEN type = 'cashback' OR type = 'points_redemption' THEN final_amount
      ELSE 0
    END
  ), 0) as total_earned,
  MAX(created_at) as last_transaction_at
FROM transactions
WHERE establishment_id IS NOT NULL
  AND status = 'completed'
GROUP BY user_id, establishment_id
HAVING SUM(
  CASE 
    WHEN type = 'cashback' OR type = 'points_redemption' THEN final_amount
    WHEN type = 'purchase' THEN -final_amount
    ELSE 0
  END
) > 0
ON CONFLICT (user_id, establishment_id) DO UPDATE
SET 
  balance = EXCLUDED.balance,
  total_earned = EXCLUDED.total_earned,
  last_transaction_at = EXCLUDED.last_transaction_at,
  updated_at = NOW();

-- ============================================
-- VIEWS for easy querying
-- ============================================

-- View: User balances with establishment info
CREATE OR REPLACE VIEW user_establishment_balances AS
SELECT 
  eb.id,
  eb.user_id,
  u.full_name as user_name,
  u.account_number,
  eb.establishment_id,
  e.business_name as establishment_name,
  e.category as business_type,
  eb.balance,
  eb.total_earned,
  eb.total_spent,
  eb.total_transferred_out,
  eb.total_transferred_in,
  eb.last_transaction_at,
  eb.created_at,
  eb.updated_at
FROM establishment_balances eb
JOIN users u ON eb.user_id = u.id
JOIN establishments e ON eb.establishment_id = e.id
WHERE eb.balance > 0
ORDER BY eb.balance DESC;

-- View: Total user balance (sum across all establishments)
CREATE OR REPLACE VIEW user_total_balances AS
SELECT 
  eb.user_id,
  u.full_name as user_name,
  u.account_number,
  COUNT(DISTINCT eb.establishment_id) as establishments_count,
  SUM(eb.balance) as total_balance,
  SUM(eb.total_earned) as total_earned,
  SUM(eb.total_spent) as total_spent,
  SUM(eb.total_transferred_out) as total_transferred_out,
  SUM(eb.total_transferred_in) as total_transferred_in
FROM establishment_balances eb
JOIN users u ON eb.user_id = u.id
GROUP BY eb.user_id, u.full_name, u.account_number;

COMMENT ON TABLE establishment_balances IS 'Stores user balances segmented by establishment to prevent cross-establishment spending';
COMMENT ON COLUMN establishment_balances.balance IS 'Current available balance for this user at this establishment';
COMMENT ON COLUMN establishment_balances.total_earned IS 'Total cashback/rewards earned at this establishment (lifetime)';
COMMENT ON COLUMN establishment_balances.total_spent IS 'Total amount spent at this establishment (lifetime)';
COMMENT ON COLUMN establishment_balances.total_transferred_out IS 'Total amount transferred out from this establishment balance';
COMMENT ON COLUMN establishment_balances.total_transferred_in IS 'Total amount received via transfers to this establishment balance';
