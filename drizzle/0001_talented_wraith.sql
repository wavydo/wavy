CREATE TABLE "user_monthly_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"month" text NOT NULL,
	"places_tapped" integer DEFAULT 0 NOT NULL,
	"rewards_earned" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "nfc_cards" DROP CONSTRAINT "nfc_cards_token_unique";--> statement-breakpoint
ALTER TABLE "nfc_cards" ALTER COLUMN "card_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "nfc_cards" ALTER COLUMN "qr_code" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD COLUMN "user_email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD COLUMN "cardholder_name" text;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD COLUMN "expiry_date" text;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD COLUMN "card_type" text DEFAULT 'member' NOT NULL;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD COLUMN "card_uid_hash" text NOT NULL;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD COLUMN "card_uid_encrypted" text NOT NULL;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD COLUMN "encryption_iv" text NOT NULL;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD COLUMN "card_token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD COLUMN "device_info" text;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD COLUMN "registered_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD COLUMN "deactivated_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "balance" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_number" text;--> statement-breakpoint
ALTER TABLE "user_monthly_stats" ADD CONSTRAINT "user_monthly_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nfc_cards" DROP COLUMN "token";--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD CONSTRAINT "nfc_cards_card_uid_hash_unique" UNIQUE("card_uid_hash");--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD CONSTRAINT "nfc_cards_card_token_unique" UNIQUE("card_token");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_account_number_unique" UNIQUE("account_number");