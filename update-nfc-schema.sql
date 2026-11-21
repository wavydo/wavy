-- Actualizar tabla nfc_cards con campos de seguridad
ALTER TABLE nfc_cards 
  ADD COLUMN IF NOT EXISTS user_email TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS card_uid_hash TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS card_uid_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS encryption_iv TEXT,
  ADD COLUMN IF NOT EXISTS card_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS device_info TEXT,
  ADD COLUMN IF NOT EXISTS registered_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP;

-- Hacer campos opcionales
ALTER TABLE nfc_cards 
  ALTER COLUMN card_number DROP NOT NULL,
  ALTER COLUMN cardholder_name DROP NOT NULL,
  ALTER COLUMN expiry_date DROP NOT NULL,
  ALTER COLUMN qr_code DROP NOT NULL;

-- Agregar columna token si no existe (para compatibilidad)
ALTER TABLE nfc_cards ADD COLUMN IF NOT EXISTS token TEXT;
