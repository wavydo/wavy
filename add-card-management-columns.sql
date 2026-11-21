-- ============================================
-- CARD MANAGEMENT FEATURES MIGRATION
-- Adds missing columns for Cards functionality
-- ============================================

-- Add card management columns to nfc_cards table
ALTER TABLE nfc_cards ADD COLUMN card_locked BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE nfc_cards ADD COLUMN card_pin TEXT;

-- Settings columns
ALTER TABLE nfc_cards ADD COLUMN contactless_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE nfc_cards ADD COLUMN online_transactions_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE nfc_cards ADD COLUMN international_usage_enabled BOOLEAN NOT NULL DEFAULT false;

-- Limits columns
ALTER TABLE nfc_cards ADD COLUMN daily_limit DECIMAL(10,2) NOT NULL DEFAULT 500.00;
ALTER TABLE nfc_cards ADD COLUMN monthly_limit DECIMAL(10,2) NOT NULL DEFAULT 5000.00;
ALTER TABLE nfc_cards ADD COLUMN current_daily_spend DECIMAL(10,2) NOT NULL DEFAULT 0.00;
ALTER TABLE nfc_cards ADD COLUMN current_monthly_spend DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- Update existing records if any
UPDATE nfc_cards SET 
    card_locked = false,
    contactless_enabled = true,
    online_transactions_enabled = true,
    international_usage_enabled = false,
    daily_limit = 500.00,
    monthly_limit = 5000.00,
    current_daily_spend = 0.00,
    current_monthly_spend = 0.00
WHERE card_locked IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_nfc_cards_card_locked ON nfc_cards(card_locked);
CREATE INDEX IF NOT EXISTS idx_nfc_cards_user_id_status ON nfc_cards(user_id, status);