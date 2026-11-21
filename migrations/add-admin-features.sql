-- Agregar campo status a transactions si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='transactions' AND column_name='status'
  ) THEN
    ALTER TABLE transactions ADD COLUMN status VARCHAR(20) DEFAULT 'completed';
  END IF;
END $$;

-- Agregar campo is_admin a users si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='is_admin'
  ) THEN
    ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Agregar campo account_suspended a users
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='account_suspended'
  ) THEN
    ALTER TABLE users ADD COLUMN account_suspended BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Agregar campo suspension_reason a users
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='suspension_reason'
  ) THEN
    ALTER TABLE users ADD COLUMN suspension_reason TEXT;
  END IF;
END $$;

-- Agregar campo suspension_date a users
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='suspension_date'
  ) THEN
    ALTER TABLE users ADD COLUMN suspension_date TIMESTAMP;
  END IF;
END $$;

-- Crear tabla admin_actions para auditoría
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action_type VARCHAR(50) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id UUID,
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla user_warnings para advertencias
CREATE TABLE IF NOT EXISTS user_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  admin_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'warning',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_users_suspended ON users(account_suspended);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created ON admin_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_warnings_user ON user_warnings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_warnings_read ON user_warnings(read);

-- Comentarios para documentación
COMMENT ON TABLE admin_actions IS 'Registro de auditoría de todas las acciones administrativas';
COMMENT ON TABLE user_warnings IS 'Advertencias y notificaciones de admin a usuarios';
COMMENT ON COLUMN users.account_suspended IS 'Indica si la cuenta está suspendida por administrador';
COMMENT ON COLUMN users.suspension_reason IS 'Razón de la suspensión de cuenta';
