-- ============================================
-- MIGRACIÓN: Agregar campos de perfil de usuario completo
-- ============================================

-- 1. Agregar campos personales y de contacto si no existen
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT; -- URL de la imagen de perfil

-- 2. Agregar campos de configuración de notificaciones
ALTER TABLE users ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notifications_transactions BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notifications_offers BOOLEAN DEFAULT false;

-- 3. Agregar campos de autenticación biométrica
ALTER TABLE users ADD COLUMN IF NOT EXISTS biometric_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS biometric_type VARCHAR(50); -- 'fingerprint', 'face', etc.

-- 4. Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- 5. Comentarios para documentación
COMMENT ON COLUMN users.date_of_birth IS 'Fecha de nacimiento del usuario';
COMMENT ON COLUMN users.country IS 'País de residencia';
COMMENT ON COLUMN users.zip_code IS 'Código postal';
COMMENT ON COLUMN users.profile_image IS 'URL de la imagen de perfil del usuario';
COMMENT ON COLUMN users.notifications_enabled IS 'Notificaciones generales habilitadas';
COMMENT ON COLUMN users.notifications_transactions IS 'Notificaciones de transacciones habilitadas';
COMMENT ON COLUMN users.notifications_offers IS 'Notificaciones de ofertas habilitadas';
COMMENT ON COLUMN users.biometric_enabled IS 'Autenticación biométrica habilitada';
COMMENT ON COLUMN users.biometric_type IS 'Tipo de autenticación biométrica (fingerprint, face, etc.)';
