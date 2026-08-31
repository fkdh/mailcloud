ALTER TABLE "api_tokens" DROP COLUMN "rate_limit_window_start";--> statement-breakpoint
ALTER TABLE "api_tokens" DROP COLUMN "rate_limit_count";--> statement-breakpoint
ALTER TABLE "api_tokens" DROP COLUMN "last_used_at";