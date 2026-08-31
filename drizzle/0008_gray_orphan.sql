DELETE FROM "api_tokens" WHERE "revoked_at" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "api_tokens" DROP COLUMN "revoked_at";
