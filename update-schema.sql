-- Crear tabla events si no existe o actualizarla
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

-- Agregar foreign keys
ALTER TABLE "events" ADD CONSTRAINT "events_establishment_id_establishments_id_fk" 
FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "perks" ADD CONSTRAINT "perks_establishment_id_establishments_id_fk" 
FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE cascade ON UPDATE no action;
