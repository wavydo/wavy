-- Add transfer-related fields to transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'debit',
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS recipient_account VARCHAR(50),
ADD COLUMN IF NOT EXISTS sender_account VARCHAR(50),
ADD COLUMN IF NOT EXISTS note TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_recipient ON transactions(recipient_account);
CREATE INDEX IF NOT EXISTS idx_transactions_sender ON transactions(sender_account);
