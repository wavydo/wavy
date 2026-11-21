import 'dotenv/config';
import { db } from './server/storage.js';
import { sql } from 'drizzle-orm';

const updateSQL = `
-- Agregar nuevas columnas a la tabla users
ALTER TABLE "users" 
  ADD COLUMN IF NOT EXISTS "balance" numeric(10, 2) DEFAULT '0' NOT NULL,
  ADD COLUMN IF NOT EXISTS "account_number" text UNIQUE;

-- Agregar nuevas columnas a la tabla nfc_cards
ALTER TABLE "nfc_cards"
  ADD COLUMN IF NOT EXISTS "cardholder_name" text DEFAULT 'CARDHOLDER' NOT NULL,
  ADD COLUMN IF NOT EXISTS "expiry_date" text DEFAULT '12/29' NOT NULL,
  ADD COLUMN IF NOT EXISTS "card_type" text DEFAULT 'member' NOT NULL;

-- Crear tabla user_monthly_stats si no existe
CREATE TABLE IF NOT EXISTS "user_monthly_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"month" text NOT NULL,
	"places_tapped" integer DEFAULT 0 NOT NULL,
	"rewards_earned" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Agregar foreign key para user_monthly_stats
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_monthly_stats_user_id_users_id_fk'
  ) THEN
    ALTER TABLE "user_monthly_stats" 
    ADD CONSTRAINT "user_monthly_stats_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
`;

async function updateUserSchema() {
  try {
    console.log('✓ Conectado a la base de datos');
    console.log('Actualizando schema de usuarios...');
    
    await db.execute(sql.raw(updateSQL));
    
    console.log('✓ Schema de usuarios actualizado correctamente');
    console.log('✓ Columnas balance y account_number agregadas');
    console.log('✓ Tabla user_monthly_stats creada');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error actualizando schema:', error);
    process.exit(1);
  }
}

updateUserSchema();
