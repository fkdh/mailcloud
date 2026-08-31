CREATE TYPE "public"."gmail_account_status" AS ENUM('ACTIVE', 'DISABLED');--> statement-breakpoint
CREATE TYPE "public"."mail_sender_status" AS ENUM('ACTIVE', 'DISABLED');--> statement-breakpoint
CREATE TABLE "gmail_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"label" varchar(120) NOT NULL,
	"smtp_user" varchar(320) NOT NULL,
	"encrypted_app_password" text NOT NULL,
	"encryption_iv" varchar(32) NOT NULL,
	"encryption_tag" varchar(32) NOT NULL,
	"status" "gmail_account_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mail_senders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"gmail_account_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"from_email" varchar(320) NOT NULL,
	"status" "mail_sender_status" DEFAULT 'ACTIVE' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_logs" ADD COLUMN "sender_id" uuid;--> statement-breakpoint
ALTER TABLE "email_logs" ADD COLUMN "from_email" varchar(320);--> statement-breakpoint
ALTER TABLE "gmail_accounts" ADD CONSTRAINT "gmail_accounts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmail_accounts" ADD CONSTRAINT "gmail_accounts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mail_senders" ADD CONSTRAINT "mail_senders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mail_senders" ADD CONSTRAINT "mail_senders_gmail_account_id_gmail_accounts_id_fk" FOREIGN KEY ("gmail_account_id") REFERENCES "public"."gmail_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mail_senders" ADD CONSTRAINT "mail_senders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "gmail_accounts_tenant_user_unique" ON "gmail_accounts" USING btree ("tenant_id","smtp_user");--> statement-breakpoint
CREATE INDEX "gmail_accounts_tenant_id_idx" ON "gmail_accounts" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mail_senders_tenant_email_unique" ON "mail_senders" USING btree ("tenant_id","from_email");--> statement-breakpoint
CREATE INDEX "mail_senders_tenant_id_idx" ON "mail_senders" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "mail_senders_account_id_idx" ON "mail_senders" USING btree ("gmail_account_id");--> statement-breakpoint
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_sender_id_mail_senders_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."mail_senders"("id") ON DELETE set null ON UPDATE no action;