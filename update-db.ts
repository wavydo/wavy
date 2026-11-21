import { db } from './server/storage.js';
import { sql } from 'drizzle-orm';

const updateSQL = `
-- Crear tabla events si no existe o actualizarla
DROP TABLE IF EXISTS event_tickets CASCADE;
DROP TABLE IF EXISTS events CASCADE;
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"establishment_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"event_date" timestamp NOT NULL,
	"location" text,
	"capacity" integer,
	"current_attendees" integer DEFAULT 0 NOT NULL,
	"ticket_price" numeric(10, 2),
	"image" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Crear tabla perks si no existe o actualizarla
DROP TABLE IF EXISTS perk_redemptions CASCADE;
DROP TABLE IF EXISTS perks CASCADE;
CREATE TABLE "perks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"establishment_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"image" text,
	"valid_from" timestamp NOT NULL,
	"valid_until" timestamp NOT NULL,
	"max_redemptions" integer,
	"current_redemptions" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Crear tabla drops si no existe o actualizarla
DROP TABLE IF EXISTS drop_claims CASCADE;
DROP TABLE IF EXISTS drops CASCADE;
CREATE TABLE "drops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"establishment_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"reward" text NOT NULL,
	"trigger_type" text NOT NULL,
	"trigger_value" text,
	"max_claims" integer,
	"current_claims" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Recrear tablas relacionadas
CREATE TABLE "event_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"purchased_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "perk_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"perk_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"establishment_id" uuid NOT NULL,
	"redeemed_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "drop_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drop_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"claimed_at" timestamp DEFAULT now() NOT NULL
);

-- Agregar foreign keys
ALTER TABLE "events" ADD CONSTRAINT "events_establishment_id_establishments_id_fk" 
FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "perks" ADD CONSTRAINT "perks_establishment_id_establishments_id_fk" 
FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "drops" ADD CONSTRAINT "drops_establishment_id_establishments_id_fk" 
FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "event_tickets" ADD CONSTRAINT "event_tickets_event_id_events_id_fk" 
FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "event_tickets" ADD CONSTRAINT "event_tickets_user_id_users_id_fk" 
FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "perk_redemptions" ADD CONSTRAINT "perk_redemptions_perk_id_perks_id_fk" 
FOREIGN KEY ("perk_id") REFERENCES "public"."perks"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "perk_redemptions" ADD CONSTRAINT "perk_redemptions_user_id_users_id_fk" 
FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "perk_redemptions" ADD CONSTRAINT "perk_redemptions_establishment_id_establishments_id_fk" 
FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "drop_claims" ADD CONSTRAINT "drop_claims_drop_id_drops_id_fk" 
FOREIGN KEY ("drop_id") REFERENCES "public"."drops"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "drop_claims" ADD CONSTRAINT "drop_claims_user_id_users_id_fk" 
FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
`;

async function updateDatabase() {
  try {
    console.log('✓ Conectado a la base de datos');
    
    await db.execute(sql.raw(updateSQL));
    
    console.log('✓ Esquema actualizado correctamente');
    console.log('✓ Tablas events, perks y drops recreadas con la estructura correcta');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error actualizando la base de datos:', error);
    process.exit(1);
  }
}

updateDatabase();
