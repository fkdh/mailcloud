CREATE TYPE "public"."gmail_auth_type" AS ENUM('APP_PASSWORD', 'OAUTH');--> statement-breakpoint
CREATE TABLE "gmail_oauth_states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"state_hash" varchar(64) NOT NULL,
	"user_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gmail_accounts" ALTER COLUMN "encrypted_app_password" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "gmail_accounts" ALTER COLUMN "encryption_iv" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "gmail_accounts" ALTER COLUMN "encryption_tag" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "gmail_accounts" ADD COLUMN "auth_type" "gmail_auth_type" DEFAULT 'APP_PASSWORD' NOT NULL;--> statement-breakpoint
ALTER TABLE "gmail_accounts" ADD COLUMN "encrypted_access_token" text;--> statement-breakpoint
ALTER TABLE "gmail_accounts" ADD COLUMN "access_token_iv" varchar(32);--> statement-breakpoint
ALTER TABLE "gmail_accounts" ADD COLUMN "access_token_tag" varchar(32);--> statement-breakpoint
ALTER TABLE "gmail_accounts" ADD COLUMN "encrypted_refresh_token" text;--> statement-breakpoint
ALTER TABLE "gmail_accounts" ADD COLUMN "refresh_token_iv" varchar(32);--> statement-breakpoint
ALTER TABLE "gmail_accounts" ADD COLUMN "refresh_token_tag" varchar(32);--> statement-breakpoint
ALTER TABLE "gmail_accounts" ADD COLUMN "token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "gmail_oauth_states" ADD CONSTRAINT "gmail_oauth_states_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_oauth_states" ADD CONSTRAINT "gmail_oauth_states_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "gmail_oauth_states_hash_unique" ON "gmail_oauth_states" USING btree ("state_hash");--> statement-breakpoint
CREATE INDEX "gmail_oauth_states_expires_idx" ON "gmail_oauth_states" USING btree ("expires_at");