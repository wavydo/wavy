CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"user_id" uuid,
	"establishment_id" uuid,
	"event_data" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "card_config_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"action" text NOT NULL,
	"old_value" text,
	"new_value" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "card_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"report_type" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discount_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" text NOT NULL,
	"establishment_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"discount_type" text NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"min_purchase_amount" numeric(10, 2),
	"max_discount_amount" numeric(10, 2),
	"applies_to" text DEFAULT 'all' NOT NULL,
	"target_user_ids" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"max_uses" integer,
	"max_uses_per_user" integer,
	"current_uses" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "discount_campaigns_campaign_id_unique" UNIQUE("campaign_id")
);
--> statement-breakpoint
CREATE TABLE "establishment_user_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"establishment_id" uuid NOT NULL,
	"visit_count" integer DEFAULT 0 NOT NULL,
	"total_spent" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"total_saved" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"average_ticket" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"first_visit_at" timestamp,
	"last_visit_at" timestamp,
	"preferences" text,
	"customer_tier" text,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "level" SET DEFAULT 'member';--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "discount_rate" numeric(5, 2) DEFAULT '10.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "max_discount_amount" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "min_purchase_amount" numeric(10, 2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "commission_rate" numeric(5, 2) DEFAULT '1.50' NOT NULL;--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "monthly_fee" numeric(10, 2) DEFAULT '499.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "daily_transaction_limit" integer;--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "accepts_tapp_pay" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "location_lat" numeric(10, 8);--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "location_lng" numeric(11, 8);--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "business_hours" text;--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "features" text;--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "total_discounts_given" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "total_transactions" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "average_rating" numeric(3, 2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "review_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "last_transaction_at" timestamp;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD COLUMN "token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD COLUMN "usage_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD COLUMN "card_locked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD COLUMN "card_pin" text;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD COLUMN "contactless_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD COLUMN "online_transactions_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD COLUMN "international_usage_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD COLUMN "daily_limit" numeric(10, 2) DEFAULT '500.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD COLUMN "monthly_limit" numeric(10, 2) DEFAULT '5000.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD COLUMN "current_daily_spend" numeric(10, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD COLUMN "current_monthly_spend" numeric(10, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "date_of_birth" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "total_saved" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "transaction_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_establishment_id_establishments_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_config_history" ADD CONSTRAINT "card_config_history_card_id_nfc_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."nfc_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_config_history" ADD CONSTRAINT "card_config_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_reports" ADD CONSTRAINT "card_reports_card_id_nfc_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."nfc_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_reports" ADD CONSTRAINT "card_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_campaigns" ADD CONSTRAINT "discount_campaigns_establishment_id_establishments_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "establishment_user_stats" ADD CONSTRAINT "establishment_user_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "establishment_user_stats" ADD CONSTRAINT "establishment_user_stats_establishment_id_establishments_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "establishments" DROP COLUMN "discount_percentage";--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD CONSTRAINT "nfc_cards_token_unique" UNIQUE("token");