-- Add reset_token and reset_token_expiry columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;

-- Add reset_token and reset_token_expiry columns to establishments table
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;

-- Add reset_token and reset_token_expiry columns to admins table
ALTER TABLE admins 
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
CREATE INDEX IF NOT EXISTS idx_establishments_reset_token ON establishments(reset_token);
CREATE INDEX IF NOT EXISTS idx_admins_reset_token ON admins(reset_token);

-- Add comments
COMMENT ON COLUMN users.reset_token IS 'SHA-256 hashed token for password reset';
COMMENT ON COLUMN users.reset_token_expiry IS 'Expiry timestamp for reset token (1 hour)';
COMMENT ON COLUMN establishments.reset_token IS 'SHA-256 hashed token for password reset';
COMMENT ON COLUMN establishments.reset_token_expiry IS 'Expiry timestamp for reset token (1 hour)';
COMMENT ON COLUMN admins.reset_token IS 'SHA-256 hashed token for password reset';
COMMENT ON COLUMN admins.reset_token_expiry IS 'Expiry timestamp for reset token (1 hour)';
