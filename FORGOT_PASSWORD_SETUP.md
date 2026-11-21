# Forgot Password Setup Instructions

## 1. Apply Database Migration

Before the forgot password feature will work, you need to add the required columns to your database tables.

### Option A: Using psql (Recommended)
```bash
psql -d your_database_url -f server/migrations/add-reset-token-columns.sql
```

### Option B: Using Render Dashboard
1. Go to your Render PostgreSQL database
2. Click on "Connect" → "External Connection"
3. Run the following SQL:

```sql
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
```

## 2. Configure Environment Variables

Make sure these environment variables are set in Render:

- `RESEND_API_KEY` - Your Resend API key (starts with `re_...`)
- `FRONTEND_URL` - Your frontend URL (e.g., `https://your-app.onrender.com`)

## 3. Verify Email Domain

Make sure `wavy.do` domain is verified in your Resend account and `recover@wavy.do` is configured as a sender.

## 4. Test the Feature

1. Go to `/auth` on your deployed site
2. Click "Forgot?"
3. Enter an email address that exists in your database
4. You should receive an email from `recover@wavy.do`
5. Click the link in the email
6. Reset your password on the `/reset-password` page

## Security Features

✅ Tokens are hashed with SHA-256 before storage
✅ Tokens expire after 1 hour
✅ Email enumeration prevention (always returns success message)
✅ Secure random token generation (32 bytes)
✅ Password requirements enforced (minimum 8 characters)

## Troubleshooting

If emails are not sending:
1. Check server logs for errors
2. Verify RESEND_API_KEY is set correctly
3. Make sure the database migration was applied
4. Check that `recover@wavy.do` is verified in Resend
5. Look for any rate limiting issues in Resend dashboard
