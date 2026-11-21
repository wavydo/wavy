-- ============================================
-- MIGRACIÓN: Agregar funcionalidades de gestión de tarjetas NFC
-- ============================================

-- 1. Agregar columnas de seguridad y configuración a nfc_cards
ALTER TABLE nfc_cards ADD COLUMN IF NOT EXISTS card_locked BOOLEAN DEFAULT false;
ALTER TABLE nfc_cards ADD COLUMN IF NOT EXISTS card_pin VARCHAR(4); -- PIN de 4 dígitos (encriptado)
ALTER TABLE nfc_cards ADD COLUMN IF NOT EXISTS contactless_enabled BOOLEAN DEFAULT true;
ALTER TABLE nfc_cards ADD COLUMN IF NOT EXISTS online_transactions_enabled BOOLEAN DEFAULT true;
ALTER TABLE nfc_cards ADD COLUMN IF NOT EXISTS international_usage_enabled BOOLEAN DEFAULT false; -- Deshabilitado por defecto
ALTER TABLE nfc_cards ADD COLUMN IF NOT EXISTS daily_limit DECIMAL(10, 2) DEFAULT 500.00;
ALTER TABLE nfc_cards ADD COLUMN IF NOT EXISTS monthly_limit DECIMAL(10, 2) DEFAULT 5000.00;
ALTER TABLE nfc_cards ADD COLUMN IF NOT EXISTS current_daily_spend DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE nfc_cards ADD COLUMN IF NOT EXISTS current_monthly_spend DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE nfc_cards ADD COLUMN IF NOT EXISTS last_reset_date TIMESTAMP DEFAULT NOW();

-- 2. Crear tabla de reportes de tarjetas
CREATE TABLE IF NOT EXISTS card_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES nfc_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL, -- 'lost', 'stolen', 'damaged', 'fraud', 'other'
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'resolved', 'closed'
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Crear tabla de historial de cambios de configuración
CREATE TABLE IF NOT EXISTS card_config_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES nfc_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL, -- 'lock_card', 'unlock_card', 'change_pin', 'update_limits', etc.
  old_value TEXT,
  new_value TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_nfc_cards_user_id ON nfc_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_nfc_cards_status ON nfc_cards(status);
CREATE INDEX IF NOT EXISTS idx_nfc_cards_locked ON nfc_cards(card_locked);
CREATE INDEX IF NOT EXISTS idx_card_reports_card_id ON card_reports(card_id);
CREATE INDEX IF NOT EXISTS idx_card_reports_status ON card_reports(status);
CREATE INDEX IF NOT EXISTS idx_card_config_history_card_id ON card_config_history(card_id);

-- 5. Comentarios para documentación
COMMENT ON COLUMN nfc_cards.card_locked IS 'Si la tarjeta está bloqueada temporalmente por el usuario';
COMMENT ON COLUMN nfc_cards.card_pin IS 'PIN de 4 dígitos hasheado con bcrypt';
COMMENT ON COLUMN nfc_cards.contactless_enabled IS 'Si los pagos contactless están habilitados';
COMMENT ON COLUMN nfc_cards.online_transactions_enabled IS 'Si las transacciones online están habilitadas';
COMMENT ON COLUMN nfc_cards.international_usage_enabled IS 'Si el uso internacional está habilitado (deshabilitado por defecto)';
COMMENT ON COLUMN nfc_cards.daily_limit IS 'Límite de gasto diario en USD';
COMMENT ON COLUMN nfc_cards.monthly_limit IS 'Límite de gasto mensual en USD';
COMMENT ON COLUMN nfc_cards.current_daily_spend IS 'Gasto acumulado del día actual';
COMMENT ON COLUMN nfc_cards.current_monthly_spend IS 'Gasto acumulado del mes actual';
COMMENT ON TABLE card_reports IS 'Tabla de reportes de problemas con tarjetas';
COMMENT ON TABLE card_config_history IS 'Historial de cambios de configuración de tarjetas para auditoría';
