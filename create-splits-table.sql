-- =====================================================
-- TABLA SPLITS - Sistema Split Bill Revolucionario
-- =====================================================
-- Esta tabla almacena todos los splits de facturas creados
-- por usuarios, permitiendo división de cuentas con o sin app

-- Eliminar tabla si existe (solo para desarrollo)
DROP TABLE IF EXISTS split_payments CASCADE;
DROP TABLE IF EXISTS splits CASCADE;

-- Crear tabla principal de splits
CREATE TABLE "splits" (
	"id" varchar(255) PRIMARY KEY NOT NULL, -- ID único generado: split-{timestamp}-{random}
	"creator_email" text NOT NULL,
	"creator_name" text NOT NULL,
	"business_id" uuid, -- NULL si no está asociado a negocio registrado
	"merchant_name" text NOT NULL, -- Nombre del establecimiento
	
	-- Información financiera
	"subtotal" numeric(10, 2) NOT NULL DEFAULT 0,
	"tax" numeric(10, 2) NOT NULL DEFAULT 0,
	"tip" numeric(10, 2) NOT NULL DEFAULT 0,
	"total" numeric(10, 2) NOT NULL,
	"currency" varchar(10) NOT NULL DEFAULT 'RD$',
	
	-- Configuración del split
	"split_mode" varchar(20) NOT NULL DEFAULT 'items', -- 'items', 'equal', 'custom'
	
	-- Datos estructurados (JSON)
	"items" jsonb NOT NULL, -- Array de items: [{id, name, quantity, price, totalPrice}, ...]
	"participants" jsonb NOT NULL, -- Array de participantes: [{id, name, email?, phone?, type, userId?}, ...]
	"assignments" jsonb NOT NULL DEFAULT '{}', -- Objeto: {itemId: [participantIds]}
	"amounts" jsonb NOT NULL DEFAULT '{}', -- Objeto: {participantId: amount}
	"payment_statuses" jsonb NOT NULL DEFAULT '{}', -- Objeto: {participantId: 'pending'|'paid'|'failed'}
	
	-- Estado general
	"status" varchar(20) NOT NULL DEFAULT 'pending', -- 'pending', 'partial', 'completed', 'cancelled'
	
	-- Metadata
	"receipt_image_url" text, -- URL de la imagen de la factura
	"share_link" text, -- Link público para compartir: https://tapp.app/split/{id}
	
	-- Timestamps
	"created_at" timestamp NOT NULL DEFAULT now(),
	"updated_at" timestamp NOT NULL DEFAULT now(),
	"completed_at" timestamp -- Cuando todos pagaron
);

-- Crear tabla de pagos individuales (tracking detallado)
CREATE TABLE "split_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"split_id" varchar(255) NOT NULL,
	"participant_id" varchar(255) NOT NULL, -- ID del participante en el JSON
	"participant_name" text NOT NULL,
	"participant_email" text,
	"participant_type" varchar(20) NOT NULL, -- 'tapp-user' o 'external'
	
	-- Información del pago
	"amount" numeric(10, 2) NOT NULL,
	"payment_method" varchar(50) NOT NULL, -- 'tapp_balance', 'stripe', 'paypal', etc.
	"status" varchar(20) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'success', 'failed'
	
	-- IDs externos (si aplica)
	"stripe_payment_id" text,
	"paypal_payment_id" text,
	"tapp_transaction_id" uuid,
	
	-- Metadata
	"error_message" text, -- Si falla el pago
	"processed_at" timestamp,
	"created_at" timestamp NOT NULL DEFAULT now(),
	"updated_at" timestamp NOT NULL DEFAULT now(),
	
	-- Foreign key
	CONSTRAINT "split_payments_split_id_fk" 
		FOREIGN KEY ("split_id") 
		REFERENCES "splits"("id") 
		ON DELETE CASCADE 
		ON UPDATE NO ACTION
);

-- Crear índices para performance
CREATE INDEX "idx_splits_creator_email" ON "splits"("creator_email");
CREATE INDEX "idx_splits_business_id" ON "splits"("business_id");
CREATE INDEX "idx_splits_status" ON "splits"("status");
CREATE INDEX "idx_splits_created_at" ON "splits"("created_at" DESC);
CREATE INDEX "idx_split_payments_split_id" ON "split_payments"("split_id");
CREATE INDEX "idx_split_payments_status" ON "split_payments"("status");
CREATE INDEX "idx_split_payments_participant_email" ON "split_payments"("participant_email");

-- Agregar foreign key a establishments si existe
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'establishments') THEN
    ALTER TABLE "splits" 
      ADD CONSTRAINT "splits_business_id_establishments_id_fk" 
      FOREIGN KEY ("business_id") 
      REFERENCES "establishments"("id") 
      ON DELETE SET NULL 
      ON UPDATE NO ACTION;
  END IF;
END $$;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_splits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para splits
CREATE TRIGGER trigger_update_splits_updated_at
  BEFORE UPDATE ON splits
  FOR EACH ROW
  EXECUTE FUNCTION update_splits_updated_at();

-- Trigger para split_payments
CREATE TRIGGER trigger_update_split_payments_updated_at
  BEFORE UPDATE ON split_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_splits_updated_at();

-- Comentarios de documentación
COMMENT ON TABLE splits IS 'Almacena splits de facturas creados por usuarios para dividir cuentas';
COMMENT ON COLUMN splits.split_mode IS 'Modo de división: items (cada quien lo suyo), equal (partes iguales), custom (personalizado)';
COMMENT ON COLUMN splits.items IS 'Array JSON de items de la factura con precios';
COMMENT ON COLUMN splits.participants IS 'Array JSON de participantes, pueden ser usuarios Tapp o externos';
COMMENT ON COLUMN splits.assignments IS 'Objeto JSON que mapea items a participantes';
COMMENT ON COLUMN splits.amounts IS 'Objeto JSON con el monto que debe pagar cada participante';
COMMENT ON COLUMN splits.payment_statuses IS 'Objeto JSON con el estado de pago de cada participante';

COMMENT ON TABLE split_payments IS 'Tracking detallado de pagos individuales dentro de un split';
COMMENT ON COLUMN split_payments.participant_type IS 'Tipo de participante: tapp-user (usuario registrado) o external (usuario externo via link)';

-- =====================================================
-- INSERTAR DATOS DE EJEMPLO (OPCIONAL - SOLO DESARROLLO)
-- =====================================================

-- Ejemplo de split para testing
INSERT INTO splits (
  id, 
  creator_email, 
  creator_name,
  merchant_name,
  subtotal,
  tax,
  tip,
  total,
  currency,
  split_mode,
  items,
  participants,
  assignments,
  amounts,
  payment_statuses,
  status
) VALUES (
  'split-example-123',
  'user@example.com',
  'John Doe',
  'Café Bohemio',
  500.00,
  75.00,
  50.00,
  625.00,
  'RD$',
  'items',
  '[
    {"id":"item-1","name":"Hamburger","quantity":1,"price":250.00,"totalPrice":250.00},
    {"id":"item-2","name":"Pizza","quantity":1,"price":250.00,"totalPrice":250.00}
  ]'::jsonb,
  '[
    {"id":"part-1","name":"Ana Rodriguez","email":"ana@example.com","type":"tapp-user"},
    {"id":"part-2","name":"Carlos Martinez","email":"carlos@example.com","type":"external"}
  ]'::jsonb,
  '{
    "item-1":["part-1"],
    "item-2":["part-2"]
  }'::jsonb,
  '{
    "part-1":312.50,
    "part-2":312.50
  }'::jsonb,
  '{
    "part-1":"pending",
    "part-2":"pending"
  }'::jsonb,
  'pending'
);

-- Mensaje de éxito
DO $$
BEGIN
  RAISE NOTICE '✅ Tabla splits creada exitosamente';
  RAISE NOTICE '✅ Tabla split_payments creada exitosamente';
  RAISE NOTICE '✅ Índices y triggers configurados';
  RAISE NOTICE '📊 Sistema Split Bill listo para usar';
END $$;
