-- ============================================
-- ACTUALIZACIÓN SCHEMA PARA SISTEMA NFC SIMPLIFICADO
-- (Compatible con schema existente)
-- ============================================

-- 1. ACTUALIZAR USERS (eliminar levels, agregar campos)
ALTER TABLE users
  DROP COLUMN IF EXISTS level,
  DROP COLUMN IF EXISTS points;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS total_saved NUMERIC(10, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS transaction_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

-- 2. ACTUALIZAR ESTABLISHMENTS (renombrar y agregar campos)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'establishments' 
             AND column_name = 'discount_percentage') THEN
    ALTER TABLE establishments 
      RENAME COLUMN discount_percentage TO discount_rate;
  END IF;
END $$;

ALTER TABLE establishments
  ALTER COLUMN discount_rate TYPE NUMERIC(5, 2) USING discount_rate::numeric;

ALTER TABLE establishments
  ADD COLUMN IF NOT EXISTS max_discount_amount NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS min_purchase_amount NUMERIC(10, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS daily_transaction_limit INTEGER,
  ADD COLUMN IF NOT EXISTS accepts_tapp_pay BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS location_lat NUMERIC(10, 8),
  ADD COLUMN IF NOT EXISTS location_lng NUMERIC(11, 8),
  ADD COLUMN IF NOT EXISTS business_hours TEXT,
  ADD COLUMN IF NOT EXISTS features TEXT,
  ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5, 2) DEFAULT 1.50,
  ADD COLUMN IF NOT EXISTS monthly_fee NUMERIC(10, 2) DEFAULT 499.00,
  ADD COLUMN IF NOT EXISTS total_discounts_given NUMERIC(12, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS total_transactions INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_transaction_at TIMESTAMP;

-- 3. ACTUALIZAR NFC_CARDS (asegurar campos de seguridad)
ALTER TABLE nfc_cards
  ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;

-- Hacer card_uid_hash, card_uid_encrypted, encryption_iv, card_token NOT NULL si ya existen
UPDATE nfc_cards SET card_uid_hash = 'migration_' || id::text WHERE card_uid_hash IS NULL;
UPDATE nfc_cards SET card_uid_encrypted = 'migration_' || id::text WHERE card_uid_encrypted IS NULL;
UPDATE nfc_cards SET encryption_iv = 'migration_' || id::text WHERE encryption_iv IS NULL;
UPDATE nfc_cards SET card_token = 'tok_migration_' || id::text WHERE card_token IS NULL;

ALTER TABLE nfc_cards
  ALTER COLUMN card_uid_hash SET NOT NULL,
  ALTER COLUMN card_uid_encrypted SET NOT NULL,
  ALTER COLUMN encryption_iv SET NOT NULL,
  ALTER COLUMN card_token SET NOT NULL;

-- Asegurar unicidad
CREATE UNIQUE INDEX IF NOT EXISTS idx_nfc_cards_uid_hash ON nfc_cards(card_uid_hash);
CREATE UNIQUE INDEX IF NOT EXISTS idx_nfc_cards_token ON nfc_cards(card_token);

-- 4. ACTUALIZAR TRANSACTIONS (agregar campos necesarios)
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS card_token TEXT,
  ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS discount_rate NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS total NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS tip_amount NUMERIC(10, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS items TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS receipt_url TEXT,
  ADD COLUMN IF NOT EXISTS tapp_commission_rate NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS tapp_commission_amount NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS merchant_net_amount NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP;

-- Generar transaction_id para transacciones existentes
UPDATE transactions SET transaction_id = 'txn_migration_' || id::text WHERE transaction_id IS NULL;

-- Calcular campos faltantes basados en datos existentes
UPDATE transactions SET
  subtotal = amount,
  discount_amount = discount_applied,
  total = final_amount,
  discount_rate = CASE 
    WHEN amount > 0 THEN (discount_applied / amount * 100)::numeric(5,2)
    ELSE 0
  END
WHERE subtotal IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_transaction_id ON transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_completed ON transactions(completed_at);

-- 5. CREAR TABLA establishment_user_stats
CREATE TABLE IF NOT EXISTS establishment_user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  
  visit_count INTEGER DEFAULT 0,
  total_spent NUMERIC(10, 2) DEFAULT 0.00,
  total_saved NUMERIC(10, 2) DEFAULT 0.00,
  average_ticket NUMERIC(10, 2) DEFAULT 0.00,
  
  first_visit_at TIMESTAMP,
  last_visit_at TIMESTAMP,
  
  preferences TEXT,
  customer_tier TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, establishment_id)
);

CREATE INDEX IF NOT EXISTS idx_estab_user_stats_user ON establishment_user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_estab_user_stats_establishment ON establishment_user_stats(establishment_id);

-- 6. CREAR TABLA discount_campaigns
CREATE TABLE IF NOT EXISTS discount_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT UNIQUE NOT NULL,
  
  establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  discount_type TEXT NOT NULL,
  discount_value NUMERIC(10, 2) NOT NULL,
  
  min_purchase_amount NUMERIC(10, 2),
  max_discount_amount NUMERIC(10, 2),
  applies_to TEXT DEFAULT 'all',
  target_user_ids TEXT,
  
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  
  max_uses INTEGER,
  max_uses_per_user INTEGER,
  current_uses INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_establishment ON discount_campaigns(establishment_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_active_dates ON discount_campaigns(is_active, start_date, end_date);

-- 7. CREAR TABLA activity_logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  event_type TEXT NOT NULL,
  
  user_id UUID REFERENCES users(id),
  establishment_id UUID REFERENCES establishments(id),
  
  event_data TEXT,
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_event_type ON activity_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);

-- 8. ACTUALIZAR DATOS EXISTENTES
UPDATE users SET total_spent = 0.00 WHERE total_spent IS NULL;
UPDATE users SET total_saved = 0.00 WHERE total_saved IS NULL;
UPDATE users SET transaction_count = 0 WHERE transaction_count IS NULL;

UPDATE establishments SET discount_rate = 10.00 WHERE discount_rate IS NULL OR discount_rate = 0;
UPDATE establishments SET commission_rate = 1.50 WHERE commission_rate IS NULL;

-- 9. ÍNDICES ADICIONALES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);
CREATE INDEX IF NOT EXISTS idx_establishments_is_active ON establishments(is_active);
CREATE INDEX IF NOT EXISTS idx_establishments_category ON establishments(category);
CREATE INDEX IF NOT EXISTS idx_nfc_cards_user_id ON nfc_cards(user_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_establishment_date ON transactions(establishment_id, completed_at DESC);

-- ============================================
-- RESUMEN
-- ============================================
-- ✅ Users actualizado (sin levels/points)
-- ✅ Establishments actualizado (discount_rate, campos adicionales)
-- ✅ NFC_Cards con seguridad completa
-- ✅ Transactions con campos completos
-- ✅ establishment_user_stats creado
-- ✅ discount_campaigns creado
-- ✅ activity_logs creado
-- ✅ Índices optimizados
-- ============================================
