-- ============================================
-- MIGRACIÓN: Sistema de Descuentos Simplificado
-- Elimina niveles (Bronze/Silver/Gold/Platinum)
-- Descuento es configurado solo por establecimiento
-- ============================================

-- 1. Actualizar tabla users (eliminar campos de niveles)
ALTER TABLE users
  DROP COLUMN IF EXISTS level,
  DROP COLUMN IF EXISTS points,
  DROP COLUMN IF EXISTS discount_multiplier;

-- Agregar campo de verificación si no existe
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Actualizar tabla establishments (simplificar descuentos)
ALTER TABLE establishments
  RENAME COLUMN discount_percentage TO discount_rate;

-- Agregar nuevos campos de configuración
ALTER TABLE establishments
  ADD COLUMN IF NOT EXISTS max_discount_amount DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS min_purchase_amount DECIMAL(10, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS daily_transaction_limit INTEGER,
  ADD COLUMN IF NOT EXISTS accepts_tapp_pay BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11, 8),
  ADD COLUMN IF NOT EXISTS business_hours JSONB,
  ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5, 2) DEFAULT 1.50;

-- 3. Crear/actualizar tabla de transacciones
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT UNIQUE NOT NULL,
  
  -- Participantes
  user_id UUID NOT NULL REFERENCES users(id),
  card_token TEXT REFERENCES nfc_cards(card_token),
  establishment_id UUID NOT NULL REFERENCES establishments(id),
  
  -- Montos
  subtotal DECIMAL(10, 2) NOT NULL,
  discount_rate DECIMAL(5, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  
  -- Información adicional
  payment_method TEXT,
  tip_amount DECIMAL(10, 2) DEFAULT 0.00,
  items JSONB,
  notes TEXT,
  receipt_url TEXT,
  
  -- Comisiones
  tapp_commission_rate DECIMAL(5, 2),
  tapp_commission_amount DECIMAL(10, 2),
  merchant_net_amount DECIMAL(10, 2),
  
  -- Estado
  status TEXT DEFAULT 'completed',
  completed_at TIMESTAMP DEFAULT NOW(),
  cancelled_at TIMESTAMP,
  refunded_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_establishment ON transactions(establishment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_completed ON transactions(completed_at);

-- 4. Crear tabla de estadísticas establishment-user
CREATE TABLE IF NOT EXISTS establishment_user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  
  -- Estadísticas
  visit_count INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0.00,
  total_saved DECIMAL(10, 2) DEFAULT 0.00,
  average_ticket DECIMAL(10, 2) DEFAULT 0.00,
  
  first_visit_at TIMESTAMP,
  last_visit_at TIMESTAMP,
  
  -- Preferencias detectadas
  preferences JSONB,
  customer_tier TEXT, -- 'NEW' | 'REGULAR' | 'VIP' | 'INACTIVE'
  is_favorite BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, establishment_id)
);

CREATE INDEX IF NOT EXISTS idx_estab_user_stats_user ON establishment_user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_estab_user_stats_establishment ON establishment_user_stats(establishment_id);

-- 5. Crear tabla de campañas de descuento
CREATE TABLE IF NOT EXISTS discount_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT UNIQUE NOT NULL,
  
  establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Descuento
  discount_type TEXT NOT NULL, -- 'percentage' | 'fixed_amount' | 'buy_x_get_y'
  discount_value DECIMAL(10, 2) NOT NULL,
  
  -- Condiciones
  min_purchase_amount DECIMAL(10, 2),
  max_discount_amount DECIMAL(10, 2),
  applies_to TEXT DEFAULT 'all', -- 'all' | 'new_customers' | 'returning_customers'
  target_user_ids JSONB,
  
  -- Programación
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Límites
  max_uses INTEGER,
  max_uses_per_user INTEGER,
  current_uses INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_establishment ON discount_campaigns(establishment_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_active_dates ON discount_campaigns(is_active, start_date, end_date);

-- 6. Crear tabla de logs de actividad
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  event_type TEXT NOT NULL, -- 'nfc_scan', 'transaction', 'login', 'card_registered', etc.
  
  user_id UUID REFERENCES users(id),
  establishment_id UUID REFERENCES establishments(id),
  
  event_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_event_type ON activity_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);

-- 7. Actualizar total_spent y total_saved en users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS total_saved DECIMAL(10, 2) DEFAULT 0.00;

UPDATE users SET total_spent = 0.00 WHERE total_spent IS NULL;
UPDATE users SET total_saved = 0.00 WHERE total_saved IS NULL;

-- 8. Datos de ejemplo para discount_rate en establishments existentes
UPDATE establishments
SET discount_rate = 10
WHERE discount_rate IS NULL OR discount_rate = 0;

-- 9. Agregar campo de contador de usos en nfc_cards
ALTER TABLE nfc_cards
  ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;

-- ============================================
-- RESUMEN DE CAMBIOS
-- ============================================
-- ✅ Eliminados niveles (Bronze, Silver, Gold, Platinum)
-- ✅ Descuento ahora es solo por establecimiento
-- ✅ Agregadas tablas de transacciones completas
-- ✅ Agregadas estadísticas por usuario-establecimiento
-- ✅ Agregado sistema de campañas de descuento
-- ✅ Agregado sistema de logs de actividad
-- ✅ Simplificado modelo de datos
-- ============================================
